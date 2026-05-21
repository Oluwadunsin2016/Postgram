import EmojiPicker, { Theme } from "emoji-picker-react";
import Loader from "@/components/ui/shared/Loader";
import { useUserContext } from "@/context/AuthContext";
import {
  useGetAvailableUsers,
  useGetConversations,
  useDeleteMessage,
  useEditMessage,
  useForwardMessage,
  useGetMessages,
  useMarkConversationRead,
  useOpenDirectConversation,
  useSendMessage,
  useToggleMessagePin,
  useToggleMessageReaction,
} from "@/lib/react-query/queries";
import { getSocket } from "@/lib/socket";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Check, ChevronDown, Copy, Download, FileText, Forward, Image as ImageIcon, Mic, Paperclip, Phone, Pin, Plus, Search, Send, Smile, Video, X } from "lucide-react";
import { FormEvent, PointerEvent, useEffect, useMemo, useRef, useState } from "react";
import { LiaCheckDoubleSolid, LiaCheckSolid } from "react-icons/lia";
import { useNavigate, useParams } from "react-router-dom";

type ChatUser = {
  _id: string;
  name: string;
  username?: string;
  imageUrl?: string;
  lastSeen?: string;
};

type Attachment = {
  url: string;
  publicId?: string;
  resourceType?: "image" | "video" | "raw";
  type: "image" | "video" | "audio" | "file";
  mimeType?: string;
  name?: string;
  size?: number;
};

type Conversation = {
  _id: string;
  members: ChatUser[];
  unreadCount?: number;
  lastMessage?: Message;
  lastMessageAt?: string;
};

type Message = {
  _id: string;
  text: string;
  sender: ChatUser;
  attachments?: Attachment[];
  readBy?: (string | ChatUser)[];
  replyTo?: Message | null;
  status?: {
    _id: string;
    text?: string;
    media?: Attachment[];
    expiresAt?: string;
    creator?: ChatUser;
  } | null;
  reactions?: { user: ChatUser | string; emoji: string }[];
  pinnedBy?: (ChatUser | string)[];
  deletedForEveryone?: boolean;
  isEdited?: boolean;
  editedAt?: string;
  isForwarded?: boolean;
  messageType?: string;
  createdAt: string;
};

type DateLabelRow = {
  _id: string;
  type: "label";
  label: string;
};

type MessageRow = Message | DateLabelRow;

const attachmentIcon = {
  image: ImageIcon,
  video: Video,
  audio: Mic,
  file: FileText,
};

const getMessagePreview = (message?: Message) => {
  if (!message) return "Conversation opened";
  if (message.deletedForEveryone) return "This message was deleted";
  if (message.status) return message.text || "Replied to a status";
  if (message.text) return message.text;
  const firstAttachment = message.attachments?.[0];
  if (!firstAttachment) return "Attachment";
  return `${firstAttachment.type[0].toUpperCase()}${firstAttachment.type.slice(1)} attachment`;
};

const getPinnedMessagePreview = (message?: Message) => {
  if (!message) return "";
  if (message.deletedForEveryone) return "This message was deleted";
  if (message.status) return getStatusPreviewText(message);
  if (message.text) return message.text;
  return message.attachments?.[0]?.name || "Attachment";
};

const getStatusPreviewText = (message: Message) => {
  const ownerName = message.status?.creator?.name || "status";
  return message.sender._id === message.status?.creator?._id ? "Shared a status" : `Replied to ${ownerName}'s status`;
};

const quickReactions = ["👍", "❤️", "😂", "😮", "😢", "🙏", "👏"];
const editWindowMs = 12 * 60 * 60 * 1000;

const canEditMessage = (message: Message) => {
  const sentAt = new Date(message.createdAt).getTime();
  return Number.isFinite(sentAt) && Date.now() - sentAt <= editWindowMs;
};

const getDateLabel = (dateValue: string) => {
  const date = new Date(dateValue);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
};

const formatBubbleTime = (dateValue: string) =>
  new Date(dateValue).toLocaleString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

const formatChatListTime = (dateValue?: string) => {
  if (!dateValue) return "";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const formatLastSeenText = (dateValue?: string) => {
  if (!dateValue) return "Offline";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "Offline";

  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  const time = date.toLocaleString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  if (date.toDateString() === now.toDateString()) return time;
  if (date.toDateString() === yesterday.toDateString()) return `Yesterday, ${time}`;

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const normalizeUserId = (value: string | ChatUser | undefined | null) => (typeof value === "string" ? value : value?._id || "");

const isDateLabelRow = (row: MessageRow): row is DateLabelRow => "type" in row && row.type === "label";

const buildMessageRows = (messages: Message[]): MessageRow[] => {
  const rows: MessageRow[] = [];
  let currentLabel = "";
  messages.forEach((message) => {
    const label = getDateLabel(message.createdAt);
    if (label !== currentLabel) {
      currentLabel = label;
      rows.push({ _id: `label-${label}-${message._id}`, type: "label", label });
    }
    rows.push(message);
  });
  return rows;
};

const groupReactions = (reactions: Message["reactions"] = []) =>
  reactions.reduce<Record<string, Message["reactions"]>>((groups, reaction) => {
    groups[reaction.emoji] = [...(groups[reaction.emoji] || []), reaction];
    return groups;
  }, {});

const PrivateMessageStatusIcon = ({ status }: { status: "sent" | "delivered" | "read" }) => {
  if (status === "read") {
    return <LiaCheckDoubleSolid size={16} className="ml-1 shrink-0 text-blue-600 drop-shadow-[0_1px_0_rgba(255,255,255,0.35)]" aria-label="Read" />;
  }

  if (status === "delivered") {
    return <LiaCheckDoubleSolid size={16} className="ml-1 shrink-0 text-slate-200/90 drop-shadow-[0_1px_0_rgba(0,0,0,0.35)]" aria-label="Delivered" />;
  }

  return <LiaCheckSolid size={16} className="ml-1 shrink-0 text-slate-200/90 drop-shadow-[0_1px_0_rgba(0,0,0,0.35)]" aria-label="Sent" />;
};

const getOverlayPlacement = (trigger: HTMLElement | null, overlayHeight = 300) => {
  const bubble = trigger?.closest?.("[data-message-bubble]") || trigger;
  const rect = bubble?.getBoundingClientRect?.();
  if (!rect) return "down";

  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  const spaceAbove = rect.top;
  const spaceBelow = viewportHeight - rect.bottom;

  return spaceBelow < overlayHeight && spaceAbove > spaceBelow ? "up" : "down";
};

const MessageAttachment = ({ attachment, isMine }: { attachment: Attachment; isMine: boolean }) => {
  if (attachment.type === "image") {
    return (
      <a href={attachment.url} target="_blank" rel="noreferrer" className="group/attachment block">
        <img src={attachment.url} alt={attachment.name || "attachment"} className="mt-2 max-h-72 rounded-xl object-cover transition group-hover/attachment:brightness-110" />
      </a>
    );
  }

  if (attachment.type === "video") {
    return <video src={attachment.url} controls className="mt-2 max-h-72 rounded-xl bg-black" />;
  }

  if (attachment.type === "audio") {
    return <audio src={attachment.url} controls className="mt-2 w-64 max-w-full" />;
  }

  const Icon = attachmentIcon[attachment.type] || FileText;

  return (
    <a
      href={attachment.url}
      target="_blank"
      rel="noreferrer"
      className={`mt-2 flex items-center gap-3 rounded-xl border px-3 py-2 transition ${
        isMine ? "border-white/20 bg-white/10 hover:bg-white/15" : "border-dark-4 bg-dark-4 hover:bg-dark-2"
      }`}
    >
      <Icon size={20} />
      <span className="min-w-0 flex-1 truncate small-medium">{attachment.name || "Download file"}</span>
      <Download size={16} />
    </a>
  );
};

const Chats = () => {
  const { id: recipientId } = useParams();
  const navigate = useNavigate();
  const { user } = useUserContext();
  const queryClient = useQueryClient();
  const [activeConversationId, setActiveConversationId] = useState("");
  const [draft, setDraft] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Record<string, ChatUser>>({});
  const [typingDots, setTypingDots] = useState(".");
  const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);
  const [lastSeenByUser, setLastSeenByUser] = useState<Record<string, string>>({});
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [openActionMenuId, setOpenActionMenuId] = useState("");
  const [actionMenuPlacement, setActionMenuPlacement] = useState<"up" | "down">("down");
  const [reactionTrayId, setReactionTrayId] = useState("");
  const [reactionEmojiPickerId, setReactionEmojiPickerId] = useState("");
  const [reactionPickerPlacement, setReactionPickerPlacement] = useState<"up" | "down">("down");
  const [reactionDetailsMessage, setReactionDetailsMessage] = useState<Message | null>(null);
  const [isPinnedListOpen, setIsPinnedListOpen] = useState(false);
  const [forwardingMessage, setForwardingMessage] = useState<Message | null>(null);
  const [selectedForwardIds, setSelectedForwardIds] = useState<string[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<Message | null>(null);
  const [highlightedMessageId, setHighlightedMessageId] = useState("");
  const [chatSearch, setChatSearch] = useState("");
  const [contactSearch, setContactSearch] = useState("");
  const [copiedMessageId, setCopiedMessageId] = useState("");
  const messageRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const typingTimerRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const cursorRef = useRef(0);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const { data: conversationsData = [], isLoading: conversationsLoading } = useGetConversations();
  const { data: availableUsersData = [] } = useGetAvailableUsers(user?._id);
  const { data: messagesData = [], isLoading: messagesLoading } = useGetMessages(activeConversationId);
  const { mutateAsync: openConversation } = useOpenDirectConversation();
  const { mutateAsync: sendMessage, isLoading: isSending } = useSendMessage();
  const { mutateAsync: editMessage, isLoading: isEditing } = useEditMessage();
  const { mutateAsync: deleteMessage } = useDeleteMessage();
  const { mutateAsync: toggleReaction } = useToggleMessageReaction();
  const { mutateAsync: togglePin } = useToggleMessagePin();
  const { mutateAsync: forwardMessage, isLoading: isForwarding } = useForwardMessage();
  const { mutate: markRead } = useMarkConversationRead();

  const conversations = conversationsData as Conversation[];
  const availableUsers = availableUsersData as ChatUser[];
  const messages = messagesData as Message[];

  const activeConversation = useMemo(
    () => conversations.find((conversation: Conversation) => conversation._id === activeConversationId),
    [activeConversationId, conversations]
  );
  const activeRecipient = activeConversation?.members?.find((member: ChatUser) => member._id !== user._id);
  const activeRecipientIds = activeConversation?.members?.filter((member: ChatUser) => member._id !== user._id).map((member: ChatUser) => member._id) || [];
  const activeRecipientOnline = activeRecipient?._id ? onlineUserIds.includes(activeRecipient._id) : false;
  const activeRecipientTyping = Boolean(typingUsers[activeConversationId]);
  const activeRecipientLastSeen = activeRecipient?._id ? lastSeenByUser[activeRecipient._id] || activeRecipient.lastSeen : "";
  const activePresenceText = activeRecipientTyping
    ? `Typing${typingDots}`
    : activeRecipientOnline
      ? "Online"
      : formatLastSeenText(activeRecipientLastSeen);
  const messageRows = useMemo(() => buildMessageRows(messages), [messages]);
  const filteredConversations = useMemo(
    () =>
      conversations.filter((conversation: Conversation) => {
        const recipient = conversation.members.find((member: ChatUser) => member._id !== user._id);
        const text = [recipient?.name, recipient?.username, conversation.lastMessage?.text].filter(Boolean).join(" ").toLowerCase();
        return text.includes(chatSearch.trim().toLowerCase());
      }),
    [chatSearch, conversations, user._id]
  );
  const filteredAvailableUsers = useMemo(
    () =>
      availableUsers.filter((member: ChatUser) =>
        [member.name, member.username].filter(Boolean).join(" ").toLowerCase().includes(contactSearch.trim().toLowerCase())
      ),
    [availableUsers, contactSearch]
  );
  const pinnedMessages = useMemo(
    () =>
      messages
        .filter((message: Message) => !message.deletedForEveryone && message.pinnedBy?.some((member: string | ChatUser) => (typeof member === "string" ? member : member._id) === user._id))
        .sort((a: Message, b: Message) => new Date(b.editedAt || b.createdAt).getTime() - new Date(a.editedAt || a.createdAt).getTime()),
    [messages, user._id]
  );
  const firstPinnedMessage = pinnedMessages[0];
  const hasMultiplePinnedMessages = pinnedMessages.length > 1;

  const getPrivateMessageStatus = (message?: Message, recipientId?: string): "sent" | "delivered" | "read" => {
    if (!message || !recipientId) return "sent";
    const readByIds = (message.readBy || []).map((reader: string | ChatUser) => normalizeUserId(reader));
    if (readByIds.includes(recipientId)) return "read";
    if (onlineUserIds.includes(recipientId)) return "delivered";
    return "sent";
  };

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTypingDots((current) => (current.length >= 3 ? "." : `${current}.`));
    }, 450);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!recipientId) return;

    openConversation(recipientId).then((conversation) => {
      setActiveConversationId(conversation._id);
    });
  }, [recipientId, openConversation]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNewMessage = ({ message, conversationId }: { message: Message; conversationId: string }) => {
      queryClient.setQueryData<Message[]>(["messages", conversationId], (current = []) => {
        if (current.some((item) => item._id === message._id)) return current;
        return [...current, message];
      });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      if (conversationId === activeConversationId && message.sender._id !== user._id) {
        markRead(conversationId);
      }
    };

    const handleUpdatedMessage = ({ message, conversationId }: { message: Message; conversationId: string }) => {
      queryClient.setQueryData<Message[]>(["messages", conversationId], (current = []) =>
        current.map((item) => (item._id === message._id ? message : item))
      );
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    };

    const handleTypingStart = ({ conversationId, user: typingUser }: { conversationId: string; user: ChatUser }) => {
      setTypingUsers((current) => ({ ...current, [conversationId]: typingUser }));
    };

    const handleTypingStop = ({ conversationId }: { conversationId: string }) => {
      setTypingUsers((current) => {
        const next = { ...current };
        delete next[conversationId];
        return next;
      });
    };

    const handleOnlineUsers = (payload: string[] | { userIds?: string[] }) => {
      setOnlineUserIds(Array.isArray(payload) ? payload.map(String) : (payload.userIds || []).map(String));
    };

    const handleLastSeen = ({ userId, lastSeen }: { userId: string; lastSeen: string }) => {
      if (!userId || !lastSeen) return;
      setLastSeenByUser((current) => ({ ...current, [String(userId)]: lastSeen }));
    };

    const refreshConversation = () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      if (activeConversationId) queryClient.invalidateQueries({ queryKey: ["messages", activeConversationId] });
    };

    socket.on("message:new", handleNewMessage);
    socket.on("message:updated", handleUpdatedMessage);
    socket.on("message:read", refreshConversation);
    socket.on("conversation:updated", refreshConversation);
    socket.on("typing:start", handleTypingStart);
    socket.on("typing:stop", handleTypingStop);
    socket.on("online-users", handleOnlineUsers);
    socket.on("presence:online", handleOnlineUsers);
    socket.on("presence:lastSeen", handleLastSeen);
    socket.emit("presence:get");

    return () => {
      socket.off("message:new", handleNewMessage);
      socket.off("message:updated", handleUpdatedMessage);
      socket.off("message:read", refreshConversation);
      socket.off("conversation:updated", refreshConversation);
      socket.off("typing:start", handleTypingStart);
      socket.off("typing:stop", handleTypingStop);
      socket.off("online-users", handleOnlineUsers);
      socket.off("presence:online", handleOnlineUsers);
      socket.off("presence:lastSeen", handleLastSeen);
    };
  }, [activeConversationId, markRead, queryClient, user._id]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !activeConversationId) return;

    setIsPinnedListOpen(false);
    socket.emit("conversation:join", activeConversationId);
    markRead(activeConversationId);

    return () => {
      socket.emit("conversation:leave", activeConversationId);
    };
  }, [activeConversationId, markRead]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
  }, [messages, typingUsers, activeConversationId]);

  const handleStartConversation = async (nextRecipientId: string) => {
    const conversation = await openConversation(nextRecipientId);
    setActiveConversationId(conversation._id);
  };

  const stopTypingSoon = () => {
    const socket = getSocket();
    if (!socket || !activeConversationId) return;

    if (typingTimerRef.current) window.clearTimeout(typingTimerRef.current);
    typingTimerRef.current = window.setTimeout(() => {
      socket.emit("typing:stop", { conversationId: activeConversationId, recipientIds: activeRecipientIds });
    }, 1000);
  };

  const handleDraftChange = (value: string) => {
    setDraft(value);
    const socket = getSocket();
    if (socket && activeConversationId) {
      socket.emit("typing:start", { conversationId: activeConversationId, recipientIds: activeRecipientIds });
      stopTypingSoon();
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const text = draft.trim();

    if ((!text && files.length === 0) || !activeConversationId) return;

    if (editingMessage) {
      await editMessage({ messageId: editingMessage._id, text });
      setEditingMessage(null);
    } else {
      await sendMessage({ conversationId: activeConversationId, text, files, replyTo: replyingTo?._id });
      setReplyingTo(null);
    }
    getSocket()?.emit("typing:stop", { conversationId: activeConversationId, recipientIds: activeRecipientIds });
    setDraft("");
    setFiles([]);
    setIsEmojiPickerOpen(false);
  };

  const closeChatOverlays = () => {
    setOpenActionMenuId("");
    setReactionTrayId("");
    setReactionEmojiPickerId("");
    setReactionDetailsMessage(null);
    setIsPinnedListOpen(false);
    setIsEmojiPickerOpen(false);
  };

  const handleChatSurfacePointerDown = (event: PointerEvent) => {
    const target = event.target as HTMLElement;
    if (target.closest("[data-chat-overlay]") || target.closest("[data-chat-overlay-trigger]")) return;
    closeChatOverlays();
  };

  const rememberCursor = () => {
    const input = messageInputRef.current;
    cursorRef.current = input?.selectionStart ?? draft.length;
  };

  const addEmoji = ({ emoji }: { emoji: string }) => {
    const insertAt = Math.min(Math.max(cursorRef.current, 0), draft.length);
    const nextDraft = `${draft.slice(0, insertAt)}${emoji}${draft.slice(insertAt)}`;
    const nextCursor = insertAt + emoji.length;
    setDraft(nextDraft);
    cursorRef.current = nextCursor;
    window.requestAnimationFrame(() => {
      messageInputRef.current?.focus();
      messageInputRef.current?.setSelectionRange(nextCursor, nextCursor);
    });
  };

  const openStatusFromMessage = (message: Message) => {
    const status = message.status;
    if (!status?._id || !status.creator?._id) return;
    if (status.expiresAt && new Date(status.expiresAt).getTime() <= Date.now()) return;
    navigate(`/status?creator=${status.creator._id}&status=${status._id}`);
  };

  const handleEditClick = (message: Message) => {
    setEditingMessage(message);
    setReplyingTo(null);
    setDraft(message.text || "");
    setOpenActionMenuId("");
  };

  const jumpToMessage = (messageId?: string) => {
    if (!messageId) return;
    const node = messageRefs.current.get(messageId);
    if (!node) return;
    node.scrollIntoView({ behavior: "smooth", block: "center" });
    setIsPinnedListOpen(false);
    setHighlightedMessageId(messageId);
    window.setTimeout(() => setHighlightedMessageId(""), 1800);
  };

  const copyMessage = async (message: Message) => {
    await navigator.clipboard?.writeText(message.text || "");
    setCopiedMessageId(message._id);
    setOpenActionMenuId("");
    window.setTimeout(() => setCopiedMessageId(""), 1200);
  };

  const submitForward = async () => {
    if (!forwardingMessage || selectedForwardIds.length === 0) return;
    await forwardMessage({ messageId: forwardingMessage._id, privateUserIds: selectedForwardIds });
    setForwardingMessage(null);
    setSelectedForwardIds([]);
  };

  return (
    <div className="h-full w-full bg-dark-1 text-light-1">
      <div className="relative h-full overflow-hidden md:grid md:grid-cols-[22rem_minmax(0,1fr)]">
        <aside
          className={`absolute inset-0 z-10 flex min-h-0 flex-col border-r border-dark-4 bg-dark-2/70 transition-transform duration-500 ease-in-out md:static md:z-auto md:translate-x-0 ${
            activeConversationId ? "-translate-x-full" : "translate-x-0"
          }`}
        >
          <div className="border-b border-dark-4 p-4 md:p-5">
            <h1 className="h3-bold">Messages</h1>
          </div>

          <div className="border-b border-dark-4 p-3 md:p-4">
            <p className="mb-3 text-light-3 small-medium">Start a conversation</p>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-light-4" />
              <input
                value={contactSearch}
                onChange={(event) => setContactSearch(event.target.value)}
                placeholder="Search contacts"
                className="w-full rounded-xl border border-dark-4 bg-dark-3 py-2 pl-9 pr-3 text-sm text-light-1 outline-none placeholder:text-light-4 focus:border-primary-500"
              />
            </div>
            <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
              {filteredAvailableUsers.map((member: ChatUser) => (
                <button key={member._id} type="button" onClick={() => handleStartConversation(member._id)} className="flex-none text-center" title={member.name}>
                  <img src={member.imageUrl || "/assets/images/default_user_image.png"} alt={member.name} className="h-12 w-12 rounded-full border border-dark-4 object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="border-b border-dark-4 p-3 md:p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-light-4" />
              <input
                value={chatSearch}
                onChange={(event) => setChatSearch(event.target.value)}
                placeholder="Search chats"
                className="w-full rounded-xl border border-dark-4 bg-dark-3 py-2.5 pl-9 pr-3 text-sm text-light-1 outline-none placeholder:text-light-4 focus:border-primary-500"
              />
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto custom-scrollbar">
            {conversationsLoading ? (
              <Loader />
            ) : filteredConversations.length === 0 ? (
              <p className="p-5 text-light-3">No conversations yet.</p>
            ) : (
              filteredConversations.map((conversation: Conversation) => {
                const recipient = conversation.members.find((member: ChatUser) => member._id !== user._id);
                const isActive = conversation._id === activeConversationId;
                const unreadCount = conversation.unreadCount || 0;
                const isRecipientOnline = recipient?._id ? onlineUserIds.includes(recipient._id) : false;
                const isRecipientTyping = Boolean(typingUsers[conversation._id]);
                const isOwnLastMessage = conversation.lastMessage?.sender?._id === user._id;
                const conversationStatus = getPrivateMessageStatus(conversation.lastMessage, recipient?._id);
                const previewText = isRecipientTyping ? `Typing${typingDots}` : getMessagePreview(conversation.lastMessage);
                const displayTime = formatChatListTime(conversation.lastMessage?.createdAt || conversation.lastMessageAt);

                return (
                  <button
                    key={conversation._id}
                    type="button"
                    onClick={() => setActiveConversationId(conversation._id)}
                    className={`flex w-full items-center gap-3 px-4 py-3 text-left transition ${isActive ? "bg-primary-500/15" : "hover:bg-dark-3"}`}
                  >
                    <span className="relative h-12 w-12 flex-none">
                      <img src={recipient?.imageUrl || "/assets/images/default_user_image.png"} alt={recipient?.name || "User"} className="h-12 w-12 rounded-full object-cover" />
                      <span className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-dark-2 ${isRecipientOnline ? "bg-green-500" : "bg-dark-4"}`} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block line-clamp-1 base-medium">{recipient?.name || "Unknown user"}</span>
                      <span className={`block line-clamp-1 small-regular ${isRecipientTyping ? "text-primary-500" : unreadCount ? "text-white" : "text-light-3"}`}>
                        {previewText}
                      </span>
                    </span>
                    <span className="flex flex-col items-end gap-2">
                      {displayTime && <span className="text-light-4 tiny-medium">{displayTime}</span>}
                      {unreadCount > 0 && <span className="grid min-h-5 min-w-5 place-items-center rounded-full bg-primary-500 px-1.5 text-xs font-bold text-white">{unreadCount}</span>}
                      {unreadCount === 0 && isOwnLastMessage && <PrivateMessageStatusIcon status={conversationStatus} />}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        <section
          className={`absolute inset-0 z-20 flex min-h-0 overflow-hidden bg-dark-1 transition-transform duration-500 ease-in-out md:static md:z-auto md:translate-x-0 ${
            activeConversationId ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {activeConversationId ? (
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <header className="flex items-center justify-between gap-2 border-b border-dark-4 bg-dark-2/70 p-2.5 md:gap-3 md:p-4">
                <button type="button" onClick={() => setActiveConversationId("")} className="grid h-9 w-9 flex-none place-items-center rounded-full bg-dark-3 text-light-2 md:hidden" aria-label="Back to conversations">
                  <ArrowLeft size={18} />
                </button>
                <button type="button" onClick={() => activeRecipient?._id && navigate(`/profile/${activeRecipient._id}`)} className="flex min-w-0 flex-1 items-center gap-2 text-left md:gap-3">
                  <span className="relative h-11 w-11 flex-none">
                    <img src={activeRecipient?.imageUrl || "/assets/images/default_user_image.png"} alt={activeRecipient?.name || "User"} className="h-11 w-11 rounded-full object-cover" />
                    <span className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-dark-2 ${activeRecipientOnline ? "bg-green-500" : "bg-dark-4"}`} />
                  </span>
                  <div className="min-w-0">
                    <h2 className="line-clamp-1 base-semibold">{activeRecipient?.name || "Conversation"}</h2>
                    <p className={`small-regular ${activeRecipientTyping || activeRecipientOnline ? "text-primary-500" : "text-light-3"}`}>{activePresenceText}</p>
                  </div>
                </button>
                <div className="flex flex-none items-center gap-1.5 text-light-3 md:gap-2">
                  <button type="button" className="grid h-9 w-9 place-items-center rounded-full bg-dark-3 hover:text-white md:h-10 md:w-10" aria-label="Voice call"><Phone size={17} /></button>
                  <button type="button" className="grid h-9 w-9 place-items-center rounded-full bg-dark-3 hover:text-white md:h-10 md:w-10" aria-label="Video call"><Video size={17} /></button>
                </div>
              </header>

              <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-3 md:p-4 custom-scrollbar" onPointerDown={handleChatSurfacePointerDown}>
                {messagesLoading ? (
                  <Loader />
                ) : messages.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-light-3">Send the first message.</div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {pinnedMessages.length > 0 && (
                      <div data-chat-overlay className="sticky top-0 z-20">
                        <button
                          type="button"
                          data-chat-overlay-trigger
                          onClick={() => {
                            if (hasMultiplePinnedMessages) {
                              setIsPinnedListOpen((value) => !value);
                              return;
                            }
                            jumpToMessage(firstPinnedMessage?._id);
                          }}
                          className="flex w-full items-center gap-3 rounded-2xl border border-primary-500/20 bg-dark-2/95 p-3 text-left shadow-xl backdrop-blur transition hover:border-primary-500/40"
                        >
                          <span className="grid h-10 w-10 flex-none place-items-center rounded-xl bg-primary-500/15 text-primary-500"><Pin size={17} /></span>
                          <span className="min-w-0 flex-1">
                            <span className="block small-semibold text-primary-500">{hasMultiplePinnedMessages ? `${pinnedMessages.length} pinned messages` : "Pinned message"}</span>
                            <span className="block truncate small-regular text-light-2">{firstPinnedMessage?.sender.name}: {getPinnedMessagePreview(firstPinnedMessage)}</span>
                          </span>
                          {hasMultiplePinnedMessages && <ChevronDown size={18} className={`text-light-3 transition ${isPinnedListOpen ? "rotate-180" : ""}`} />}
                        </button>

                        {isPinnedListOpen && hasMultiplePinnedMessages && (
                          <div data-chat-overlay className="absolute left-0 right-0 top-full mt-2 overflow-hidden rounded-2xl border border-dark-4 bg-dark-1/98 p-2 shadow-2xl ring-1 ring-primary-500/10 backdrop-blur">
                            <div className="mb-1 flex items-center justify-between px-2 py-1">
                              <p className="tiny-medium uppercase tracking-[0.18em] text-primary-500">Pinned</p>
                              <button type="button" onClick={() => setIsPinnedListOpen(false)} className="grid h-7 w-7 place-items-center rounded-full text-light-3 transition hover:bg-dark-4 hover:text-white" aria-label="Close pinned messages">
                                <X size={15} />
                              </button>
                            </div>
                            <div className="max-h-72 space-y-1 overflow-y-auto custom-scrollbar">
                              {pinnedMessages.map((message: Message) => (
                                <button key={message._id} type="button" onClick={() => jumpToMessage(message._id)} className="flex w-full items-start gap-3 rounded-xl px-2 py-2 text-left transition hover:bg-primary-500/10">
                                  <span className="mt-0.5 grid h-8 w-8 flex-none place-items-center rounded-xl bg-primary-500/10 text-primary-500">
                                    <Pin size={15} />
                                  </span>
                                  <span className="min-w-0 flex-1">
                                    <span className="flex items-center justify-between gap-3">
                                      <span className="truncate small-semibold text-light-1">{message.sender.name}</span>
                                      <span className="shrink-0 text-[11px] text-light-4">{formatChatListTime(message.createdAt)}</span>
                                    </span>
                                    <span className="mt-0.5 line-clamp-2 text-xs leading-5 text-light-3">{getPinnedMessagePreview(message)}</span>
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {messageRows.map((row: MessageRow) => {
                      if (isDateLabelRow(row)) {
                        return (
                          <div key={row._id} className="my-2 text-center">
                            <span className="rounded-full border border-dark-4 bg-dark-2 px-3 py-1 text-light-3 tiny-medium">{row.label}</span>
                          </div>
                        );
                      }
                      const message = row;
                      const isMine = message.sender._id === user._id;
                      const messageDeliveryStatus = isMine ? getPrivateMessageStatus(message, activeRecipient?._id) : "sent";
                      const isPinned = message.pinnedBy?.some((member: string | ChatUser) => (typeof member === "string" ? member : member._id) === user._id);
                      const hasActiveStatus = message.status?.expiresAt ? new Date(message.status.expiresAt).getTime() > Date.now() : !!message.status;
                      const reactionGroups = groupReactions(message.reactions || []);
                      const uniqueReactions = Object.keys(reactionGroups);

                      return (
                        <div
                          key={message._id}
                          ref={(node) => {
                            if (node) messageRefs.current.set(message._id, node);
                            else messageRefs.current.delete(message._id);
                          }}
                          className={`group flex scroll-mt-24 ${isMine ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            data-message-bubble
                            className={`relative z-10 max-w-[88%] rounded-2xl px-4 pb-6 pt-3 pr-14 shadow-lg transition hover:z-40 focus-within:z-40 md:max-w-[82%] ${highlightedMessageId === message._id ? "ring-2 ring-yellow-200 bg-yellow-400/50" :isMine ? "bg-primary-500":"bg-dark-4"} ${isMine ? "rounded-br-md text-light-1" : "rounded-bl-md text-light-1"}`}
                          >
                            <div className={`absolute top-1/2   ${isMine ? "-left-10" : "-right-10"}`}>
                            {!message.deletedForEveryone && (
                              <button
                                type="button"
                                onClick={() => setReactionTrayId((value) => (value === message._id ? "" : message._id))}
                                data-chat-overlay-trigger
                                className={`grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full bg-dark-2/90 opacity-0 shadow transition hover:scale-105 group-hover:opacity-100`}
                                aria-label="React"
                              >
                                <Smile size={15} />
                              </button>
                            )}
                            {reactionTrayId === message._id && (
                              <div data-chat-overlay className={`absolute -top-14 z-40 flex items-center gap-1 rounded-full border border-dark-4 bg-dark-4 px-2 py-1 shadow-2xl ${isMine ? "-right-16" : "-left-16"}`}>
                                {quickReactions.map((emoji) => (
                                  <button key={emoji} type="button" onClick={async () => { await toggleReaction({ messageId: message._id, emoji }); setReactionTrayId(""); setReactionEmojiPickerId(""); }} className="text-lg transition hover:scale-125">
                                    {emoji}
                                  </button>
                                ))}
                                <button
                                  type="button"
                                  onClick={(event) => {
                                    setReactionPickerPlacement(getOverlayPlacement(event.currentTarget, 340) as "up" | "down");
                                    setReactionEmojiPickerId((value) => (value === message._id ? "" : message._id));
                                  }}
                                  className="grid h-6 w-6 place-items-center rounded-full bg-light-3 text-dark-1 transition hover:scale-110 hover:bg-white"
                                  aria-label="Choose another emoji"
                                >
                                  <Plus size={15} />
                                </button>
                                {reactionEmojiPickerId === message._id && (
                                  <div data-chat-overlay className={`absolute z-50 overflow-hidden rounded-xl border border-dark-4 bg-dark-1 shadow-2xl ${isMine ? "right-0" : "left-0"} ${reactionPickerPlacement === "up" ? "bottom-10" : "top-10"}`}>
                                    <EmojiPicker
                                      height={320}
                                      width={280}
                                      theme={Theme.DARK}
                                      previewConfig={{ showPreview: false }}
                                      onEmojiClick={async ({ emoji }) => {
                                        await toggleReaction({ messageId: message._id, emoji });
                                        setReactionTrayId("");
                                        setReactionEmojiPickerId("");
                                      }}
                                    />
                                  </div>
                                )}
                              </div>
                            )}
                            </div>
                            <button
                              type="button"
                              data-chat-overlay-trigger
                              onClick={(event) => {
                                setReactionTrayId("");
                                setActionMenuPlacement(getOverlayPlacement(event.currentTarget, 300) as "up" | "down");
                                setOpenActionMenuId((value) => (value === message._id ? "" : message._id));
                              }}
                              className={`absolute right-1.5 top-1.5 hidden h-5 w-5 items-center justify-center rounded-full bg-white/90 text-slate-500 shadow transition hover:bg-white group-hover:flex ${openActionMenuId === message._id ? "flex" : ""}`}
                              aria-label="Open message actions"
                            >
                              <ChevronDown size={14} />
                            </button>
                            {openActionMenuId === message._id && (
                              <div data-chat-overlay className={`absolute right-0 z-[999] w-56 overflow-hidden rounded-lg border border-dark-4 bg-dark-1 py-1 text-[15px] text-light-1 shadow-2xl ${actionMenuPlacement === "up" ? "bottom-full mb-2" : "top-8"}`}>
                                <button type="button" onClick={() => { setReplyingTo(message); setEditingMessage(null); setOpenActionMenuId(""); }} className="block w-full px-5 py-1.5 text-left hover:bg-primary-500 hover:text-white">
                                  Reply
                                </button>
                                <button type="button" onClick={() => { setReactionTrayId(message._id); setOpenActionMenuId(""); }} className="block w-full px-5 py-1.5 text-left hover:bg-primary-500 hover:text-white">
                                  React
                                </button>
                                <button type="button" onClick={() => setOpenActionMenuId("")} className="block w-full px-5 py-1.5 text-left hover:bg-primary-500 hover:text-white">
                                  Star
                                </button>
                                <button type="button" onClick={async () => { await togglePin(message._id); setOpenActionMenuId(""); }} className="block w-full px-5 py-1.5 text-left hover:bg-primary-500 hover:text-white">
                                  {isPinned ? "Unpin" : "Pin"}
                                </button>
                                <button type="button" onClick={() => { setForwardingMessage(message); setOpenActionMenuId(""); }} className="flex w-full items-center justify-between px-5 py-1.5 text-left hover:bg-primary-500 hover:text-white">
                                  Forward <Forward size={15} />
                                </button>
                                <button type="button" onClick={() => copyMessage(message)} className="flex w-full items-center justify-between px-5 py-1.5 text-left hover:bg-primary-500 hover:text-white">
                                  Copy <Copy size={15} />
                                </button>
                                {isMine && !message.deletedForEveryone && (
                                  <>
                                    {canEditMessage(message) && <button type="button" onClick={() => handleEditClick(message)} className="block w-full px-5 py-1.5 text-left hover:bg-primary-500 hover:text-white">
                                      Edit
                                    </button>}
                                    <button type="button" onClick={() => setOpenActionMenuId("")} className="block w-full px-5 py-1.5 text-left hover:bg-primary-500 hover:text-white">
                                      Info
                                    </button>
                                  </>
                                )}
                                <div className="my-1 border-t border-dark-4" />
                                <button type="button" onClick={() => { setDeleteTarget(message); setOpenActionMenuId(""); }} className="block w-full px-5 py-1.5 text-left text-red hover:bg-red hover:text-white">
                                  Delete
                                </button>
                                <div className="my-1 border-t border-dark-4" />
                                <button type="button" onClick={() => setOpenActionMenuId("")} className="block w-full px-5 py-1.5 text-left text-light-4 hover:bg-dark-4">
                                  Select messages
                                </button>
                              </div>
                            )}

                            {isPinned && <p className="mb-1 flex items-center gap-1 tiny-medium opacity-80"><Pin size={12} /> Pinned</p>}
                            {message.isForwarded && !message.deletedForEveryone && <p className="mb-1 text-[11px] italic opacity-75">Forwarded</p>}
                            {message.replyTo && (
                              <div className={`mb-2 rounded-xl border-l-2 px-3 py-2 ${isMine ? "border-white/70 bg-white/10" : "border-primary-500 bg-dark-4"}`}>
                                <button type="button" onClick={() => jumpToMessage(message.replyTo?._id)} className="block w-full text-left">
                                <p className="tiny-medium opacity-80">{message.replyTo.sender?.name || "Reply"}</p>
                                <p className="line-clamp-1 small-regular opacity-90">
                                  {message.replyTo.deletedForEveryone ? "This message was deleted" : message.replyTo.text || message.replyTo.attachments?.[0]?.name || "Attachment"}
                                </p>
                                </button>
                              </div>
                            )}
                            {message.status && (
                              <button
                                type="button"
                                disabled={!hasActiveStatus}
                                onClick={() => openStatusFromMessage(message)}
                                className={`mb-2 flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition ${isMine ? "border-white/20 bg-white/10 hover:bg-white/15" : "border-dark-4 bg-dark-4 hover:bg-dark-2"} disabled:cursor-not-allowed disabled:opacity-60`}
                              >
                                {message.status.media?.[0]?.url ? (
                                  <img src={message.status.media[0].url} alt="status" className="h-12 w-9 rounded-lg object-cover" />
                                ) : (
                                  <span className="grid h-12 w-9 place-items-center rounded-lg bg-primary-500 text-sm font-black">Aa</span>
                                )}
                                <span className="min-w-0">
                                  <span className="block small-semibold">{getStatusPreviewText(message)}</span>
                                  <span className="block line-clamp-1 tiny-medium opacity-75">{hasActiveStatus ? "Tap to view status" : "Status expired"}</span>
                                </span>
                              </button>
                            )}
                            {message.text && <p className={`whitespace-pre-wrap base-regular ${message.deletedForEveryone ? "italic opacity-75" : ""}`}>{message.text}</p>}
                            {!message.deletedForEveryone && message.attachments?.map((attachment, index) => (
                              <MessageAttachment key={`${attachment.url}-${index}`} attachment={attachment} isMine={isMine} />
                            ))}
                            {uniqueReactions.length > 0 && (
                              <button type="button" onClick={() => setReactionDetailsMessage(message)} className={`absolute -bottom-5 flex items-center gap-1 rounded-full border border-dark-4 bg-dark-1 px-2 py-0.5 text-sm shadow-lg ${isMine ? "right-4" : "left-4"}`}>
                                {uniqueReactions.slice(0, 3).map((emoji) => <span key={emoji}>{emoji}</span>)}
                                <span className="tiny-medium">{message.reactions?.length}</span>
                              </button>
                            )}
                            {copiedMessageId === message._id && <span className="absolute -top-8 right-2 inline-flex items-center gap-1 rounded-full bg-dark-1 px-2 py-1 text-xs shadow"><Check size={12} /> Copied</span>}
                            <p className={`absolute bottom-1 right-2 mt-1 flex items-center tiny-medium ${isMine ? "text-light-2" : "text-light-3"}`}>
                              <span>{formatBubbleTime(message.createdAt)}</span>
                              {message.isEdited && !message.deletedForEveryone && <span>Edited</span>}
                              {isMine && <PrivateMessageStatusIcon status={messageDeliveryStatus} />}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    {typingUsers[activeConversationId] && (
                      <div className="text-light-3 small-medium">{typingUsers[activeConversationId].name} is typing...</div>
                    )}
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit} className="relative flex flex-col gap-2 border-t border-dark-4 bg-dark-2/70 p-2.5 md:gap-3 md:p-4" onPointerDown={handleChatSurfacePointerDown}>
                {isEmojiPickerOpen && (
                  <div data-chat-overlay className="absolute bottom-[5.5rem] left-2 z-[10000] md:left-16">
                    <EmojiPicker height={340} width={300} theme={Theme.DARK} onEmojiClick={addEmoji} />
                  </div>
                )}

                {(replyingTo || editingMessage) && (
                  <div className="flex items-center justify-between rounded-2xl border border-dark-4 bg-dark-3 px-4 py-3">
                    <div className="min-w-0">
                      <p className="small-semibold text-primary-500">{editingMessage ? "Editing message" : `Replying to ${replyingTo?.sender?.name || "message"}`}</p>
                      <p className="line-clamp-1 text-light-3 small-regular">{editingMessage?.text || replyingTo?.text || replyingTo?.attachments?.[0]?.name || "Attachment"}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setReplyingTo(null);
                        setEditingMessage(null);
                        setDraft("");
                      }}
                      className="grid h-8 w-8 flex-none place-items-center rounded-full bg-dark-4 text-light-3 hover:text-white"
                      aria-label="Cancel message context"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}

                {files.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {files.map((file, index) => (
                      <span key={`${file.name}-${index}`} className="inline-flex max-w-xs items-center gap-2 rounded-full bg-dark-3 px-3 py-1 text-light-3 small-medium">
                        <Paperclip size={14} />
                        <span className="truncate">{file.name}</span>
                        <button type="button" onClick={() => setFiles((current) => current.filter((_, itemIndex) => itemIndex !== index))} aria-label="Remove attachment">
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2 md:gap-3">
                  <button type="button" disabled={!!editingMessage} onClick={() => fileInputRef.current?.click()} className="grid h-10 w-10 flex-none place-items-center rounded-full text-light-3 transition hover:bg-dark-4 hover:text-white disabled:opacity-40" aria-label="Attach files">
                    <Paperclip size={20} />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                    onChange={(event) => {
                      setFiles(Array.from(event.target.files || []));
                      event.target.value = "";
                    }}
                  />
                  <div className="flex min-w-0 flex-1 items-center gap-1 rounded-full border border-dark-4 bg-dark-3 pl-1.5 transition focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20">
                    <button
                      type="button"
                      data-chat-overlay-trigger
                      onMouseDown={rememberCursor}
                      onClick={() => setIsEmojiPickerOpen((value) => !value)}
                      className="flex h-9 w-9 flex-none items-center justify-center rounded-full text-light-3 transition hover:bg-dark-4 hover:text-white"
                      aria-label="Choose emoji"
                    >
                      <Smile size={20} />
                    </button>
                    <textarea
                      ref={messageInputRef}
                      value={draft}
                      onChange={(event) => {
                        cursorRef.current = event.currentTarget.selectionStart ?? event.currentTarget.value.length;
                        handleDraftChange(event.target.value);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.shiftKey) {
                          event.preventDefault();
                          handleSubmit(event);
                        }
                      }}
                      onClick={(event) => { cursorRef.current = event.currentTarget.selectionStart ?? draft.length; }}
                      onKeyUp={(event) => { cursorRef.current = event.currentTarget.selectionStart ?? draft.length; }}
                      onSelect={(event) => { cursorRef.current = event.currentTarget.selectionStart ?? draft.length; }}
                      onBlur={rememberCursor}
                      placeholder="Type your message..."
                      rows={1}
                      className="max-h-32 min-h-10 flex-1 resize-none bg-transparent py-2 pr-3 text-sm text-light-1 outline-none placeholder:text-light-4 custom-scrollbar"
                    />
                  </div>
                  <button type="submit" disabled={isSending || isEditing || (!draft.trim() && files.length === 0)} className="grid h-11 w-11 flex-none place-items-center rounded-full bg-primary-500 text-white transition hover:scale-105 hover:bg-primary-600 active:scale-95 disabled:opacity-50" aria-label="Send message">
                    <Send size={18} />
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center p-8 w-full text-center text-light-3">Select a conversation or start a new one.</div>
          )}
        </section>
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-dark-4 bg-dark-2 p-5 shadow-2xl">
            <h3 className="base-semibold text-light-1">Delete message?</h3>
            <p className="mt-2 text-light-3 small-regular">This will delete the message for everyone in this conversation.</p>
            <div className="mt-5 flex justify-end gap-3">
              <button type="button" onClick={() => setDeleteTarget(null)} className="rounded-xl bg-dark-4 px-4 py-2 small-semibold text-light-2">Cancel</button>
              <button type="button" onClick={async () => { await deleteMessage(deleteTarget._id); setDeleteTarget(null); }} className="rounded-xl bg-red px-4 py-2 small-semibold text-white">Delete</button>
            </div>
          </div>
        </div>
      )}

      {reactionDetailsMessage && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={() => setReactionDetailsMessage(null)}>
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-dark-4 bg-dark-2 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-dark-4 px-5 py-4">
              <h3 className="base-semibold">Reactions</h3>
              <button type="button" onClick={() => setReactionDetailsMessage(null)} className="grid h-9 w-9 place-items-center rounded-full bg-dark-4"><X size={16} /></button>
            </div>
            <div className="max-h-80 overflow-y-auto p-3 custom-scrollbar">
              {(reactionDetailsMessage.reactions || []).map((reaction, index) => {
                const reactionUser = typeof reaction.user === "string" ? null : reaction.user;
                return (
                  <div key={`${reaction.emoji}-${index}`} className="flex items-center gap-3 rounded-xl p-3 hover:bg-dark-3">
                    <img src={reactionUser?.imageUrl || "/assets/images/default_user_image.png"} alt={reactionUser?.name || "user"} className="h-10 w-10 rounded-full object-cover" />
                    <span className="min-w-0 flex-1">
                      <span className="block line-clamp-1 small-semibold">{reactionUser?.name || "User"}</span>
                      <span className="block text-light-3 tiny-medium">@{reactionUser?.username || "postgram"}</span>
                    </span>
                    <span className="text-2xl">{reaction.emoji}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {forwardingMessage && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="flex max-h-[88vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-dark-4 bg-dark-2 shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-dark-4 px-5 py-4">
              <div className="min-w-0">
                <p className="flex items-center gap-2 base-semibold"><Forward size={18} /> Forward message</p>
                <p className="mt-1 truncate text-light-3 tiny-medium">{forwardingMessage.text || forwardingMessage.attachments?.[0]?.name || "Attachment"}</p>
              </div>
              <button type="button" onClick={() => { setForwardingMessage(null); setSelectedForwardIds([]); }} className="grid h-9 w-9 place-items-center rounded-full bg-dark-4"><X size={16} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              <div className="space-y-2">
                {availableUsers.filter((member: ChatUser) => member._id !== user._id).map((member: ChatUser) => {
                  const selected = selectedForwardIds.includes(member._id);
                  return (
                    <button
                      key={member._id}
                      type="button"
                      onClick={() => setSelectedForwardIds((current) => selected ? current.filter((id) => id !== member._id) : [...current, member._id])}
                      className={`flex w-full items-center gap-3 rounded-2xl border px-3 py-2.5 text-left transition ${selected ? "border-primary-500 bg-primary-500/10" : "border-dark-4 bg-dark-3 hover:border-primary-500/50"}`}
                    >
                      <img src={member.imageUrl || "/assets/images/default_user_image.png"} alt={member.name} className="h-11 w-11 rounded-full object-cover" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate small-semibold">{member.name}</span>
                        <span className="block truncate text-light-3 tiny-medium">@{member.username || "postgram"}</span>
                      </span>
                      <span className={`grid h-6 w-6 place-items-center rounded-full border ${selected ? "border-primary-500 bg-primary-500 text-white" : "border-light-4 text-transparent"}`}><Check size={14} /></span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-dark-4 p-4">
              <p className="text-light-3 tiny-medium">{selectedForwardIds.length} selected</p>
              <button type="button" onClick={submitForward} disabled={isForwarding || selectedForwardIds.length === 0} className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-4 py-2 small-semibold text-white disabled:opacity-50">
                <Forward size={15} /> Forward
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chats;
