import React, { useEffect, useRef, useState } from 'react';
import EmojiPicker from 'emoji-picker-react';
import './comment.css';
import { useAddComment } from '@/lib/react-query/queries';
import { Smile, Send } from 'lucide-react';

type CommentPropsType = {
  postId: string;
  parentId?: string;
  message: string;
  placeholder?: string;
  autoFocus?: boolean;
  compact?: boolean;
  setMessage: (message: string) => void;
  onSubmitMessage?: (text: string) => void;
  isSubmitting?: boolean;
  onCancel?: () => void;
  onSuccess?: () => void;
};

const CommentInput = ({ postId, parentId, message, placeholder = "Add a comment...", autoFocus = false, compact = false, setMessage, onSubmitMessage, isSubmitting = false, onCancel, onSuccess }: CommentPropsType) => {
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { mutate, isLoading } = useAddComment();

  const resizeTextarea = () => {
    const ref = textareaRef.current;
    if (!ref) return;

    ref.style.height = 'auto';
    ref.style.height = `${Math.min(ref.scrollHeight, 112)}px`;
  };

  useEffect(() => {
    resizeTextarea();
  }, [message]);

  const handleEmojiClick = ({ emoji }: { emoji: string }) => {
    const ref = textareaRef.current;
    if (!ref) {
      setMessage(message + emoji);
      return;
    }

    const start = ref.selectionStart ?? message.length;
    const end = ref.selectionEnd ?? message.length;
    const updatedMessage = message.slice(0, start) + emoji + message.slice(end);
    setMessage(updatedMessage);

    setTimeout(() => {
      ref.focus();
      ref.selectionStart = ref.selectionEnd = start + emoji.length;
    }, 0);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const text = message.trim();
    if (!text || !postId) return;

    if (onSubmitMessage) {
      onSubmitMessage(text);
      return;
    }

    mutate(
      { text, postId, parentId },
      {
        onSuccess: () => {
          setMessage('');
          setIsEmojiPickerOpen(false);
          if (textareaRef.current) textareaRef.current.style.height = 'auto';
          onSuccess?.();
        },
      },
    );
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Escape' && onCancel) {
      event.preventDefault();
      onCancel();
      return;
    }

    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(event);
    }
  };

  const isSending = isLoading || isSubmitting;

  return (
    <form onSubmit={handleSubmit} className={`relative z-[1000] flex w-full items-end gap-2 overflow-visible rounded-2xl border border-dark-4 bg-dark-3 p-2 ${compact ? "rounded-xl bg-dark-4/70" : ""}`}>
      {isEmojiPickerOpen && (
        <div className="absolute bottom-[4.5rem] left-0 z-[10000]">
          <EmojiPicker height={340} width={300} onEmojiClick={handleEmojiClick} />
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsEmojiPickerOpen((value) => !value)}
        className="grid h-10 w-10 flex-none place-items-center rounded-xl text-light-3 transition hover:bg-dark-4 hover:text-white"
        aria-label="Add emoji"
      >
        <Smile size={20} />
      </button>

      <textarea
        ref={textareaRef}
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="min-h-10 flex-1 resize-none bg-transparent px-1 py-2 text-sm text-light-1 outline-none placeholder:text-light-4 custom-scrollbar"
        rows={1}
      />

      <button
        type="submit"
        disabled={!message.trim() || isSending}
        className="grid h-10 w-10 flex-none place-items-center rounded-xl bg-primary-500 text-white transition hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Post comment"
      >
        <Send size={18} />
      </button>
    </form>
  );
};

export default CommentInput;
