import axiosInstance from "@/lib/axiosInstance";

export const getConversations = async () => {
  const response = await axiosInstance.get("/api/chat/conversations");
  return response.data.conversations;
};

export const openDirectConversation = async (recipientId: string) => {
  const response = await axiosInstance.post("/api/chat/conversations/direct", { recipientId });
  return response.data.conversation;
};

export const getMessages = async (conversationId: string) => {
  const response = await axiosInstance.get(`/api/chat/conversations/${conversationId}/messages`);
  return response.data.messages;
};

export const sendMessage = async ({
  conversationId,
  text,
  files = [],
  replyTo,
}: {
  conversationId: string;
  text: string;
  files?: File[];
  replyTo?: string;
}) => {
  const formData = new FormData();
  formData.append("text", text);
  if (replyTo) formData.append("replyTo", replyTo);
  files.forEach((file) => formData.append("files", file));

  const response = await axiosInstance.post(`/api/chat/conversations/${conversationId}/messages`, formData);
  return response.data.message;
};

export const sendStatusReply = async ({ statusId, text }: { statusId: string; text: string }) => {
  const response = await axiosInstance.post(`/api/chat/status/${statusId}/reply`, { text });
  return response.data;
};

export const editMessage = async ({ messageId, text }: { messageId: string; text: string }) => {
  const response = await axiosInstance.patch(`/api/chat/messages/${messageId}`, { text });
  return response.data.message;
};

export const deleteMessage = async (messageId: string) => {
  const response = await axiosInstance.delete(`/api/chat/messages/${messageId}`);
  return response.data.message;
};

export const toggleMessageReaction = async ({ messageId, emoji }: { messageId: string; emoji: string }) => {
  const response = await axiosInstance.post(`/api/chat/messages/${messageId}/reactions`, { emoji });
  return response.data.message;
};

export const toggleMessagePin = async (messageId: string) => {
  const response = await axiosInstance.post(`/api/chat/messages/${messageId}/pin`);
  return response.data.message;
};

export const forwardMessage = async ({ messageId, privateUserIds }: { messageId: string; privateUserIds: string[] }) => {
  const response = await axiosInstance.post(`/api/chat/messages/${messageId}/forward`, { privateUserIds });
  return response.data;
};

export const markConversationRead = async (conversationId: string) => {
  const response = await axiosInstance.post(`/api/chat/conversations/${conversationId}/read`);
  return response.data;
};
