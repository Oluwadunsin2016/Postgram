// import React from 'react'
// import { Input } from '../input'

// const CommentInput = () => {
//   return (
//     <div className='w-full'>
//     <div className='relative flex items-center gap-2'>
//     <p className='text-xl cursor-pointer'>🙂</p>
//     <Input size={10} type="text" placeholder='Write your comment...' className="h-8 bg-dark-4 border-none placeholder:text-light-4 focus-visible:ring-1 rounded-full focus-visible:ring-offset-1 ring-offset-light-3 w-full"/>
//      <img
//            src="/assets/icons/send.svg"
//           alt="like"
//           width={20}
//           height={20}
//           className="cursor-pointer absolute right-3 top-1.5"
//         />
//     </div>
//     </div>
//   )
// }

// export default CommentInput



import React, { createRef, useEffect, useState } from 'react';
// import { HiPaperAirplane } from 'react-icons/hi2';
import EmojiPicker from 'emoji-picker-react';
// import { useCreateComment, useUpdateComment } from '../../services/apis';
import './comment.css';
import { useAddComment } from '@/lib/react-query/queries';

type CommentPropsType = {
  postId: number | any;
  commentId: number | any;
  message: string;
  editMode: boolean;
  setMessage: (message: string) => void;
  setEditMode:(status:boolean)=>void
};
const CommentInput = ({
  postId,
  message,
  setMessage,
  setEditMode,
  editMode,
  commentId
}: CommentPropsType) => {
  //   const [message, setMessage] = useState('');
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const textareaRef = createRef<HTMLTextAreaElement>();
  const { mutate } = useAddComment();
//   const { mutate:updateComment } = useUpdateComment();

  const handleMessage = (e: any) => {
    e.preventDefault();
    setMessage(e.target.value);
    const ref = textareaRef.current;
    if (ref) {
      ref.style.height = 'auto';
      const scrollHeight = ref.scrollHeight;
      const maxHeight = 3 * 50;
      ref.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
      setIsExpanded(scrollHeight > 50);
    }
  };

  useEffect(() => {
    const ref = textareaRef.current;
    if (ref && message?.trim()) {
      ref.style.height = 'auto';
      const scrollHeight = ref.scrollHeight;
      const maxHeight = 3 * 50;
      ref.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
      setIsExpanded(scrollHeight > 50);
    }
  }, [message]);

  const handleEmojiClick = ({ emoji }: { emoji: string }) => {
    const ref = textareaRef.current;
    if (ref) {
      const start = ref.selectionStart ?? 0;
      const end = ref.selectionEnd ?? 0;

      // Insert emoji at the cursor position
      const updatedMessage =
        message.slice(0, start) + emoji + message.slice(end);
      setMessage(updatedMessage);

      // Set cursor position to be right after the emoji
      const newCursorPosition = start + emoji.length;
      setTimeout(() => {
        if (ref) {
          ref.focus();
          ref.selectionStart = ref.selectionEnd = newCursorPosition;
        }
      }, 0); // Timeout ensures the cursor position update happens after the message update
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    console.log(message, postId);
    const ref = textareaRef.current;
    mutate(
      { text: message, postId },
      {
        onSuccess: (data) => {
          setMessage('');
          if (ref) {
            ref.style.height = 'auto';
            const scrollHeight = ref.scrollHeight;
            const maxHeight = 3 / 50;
            ref.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
            setIsExpanded(false);
          }
          console.log(data);
        },
      },
    );
    // if (editMode) {
    // console.log(message);
    
    //    updateComment(
    //   { comment: message, id:commentId,request_id },
    //   {
    //     onSuccess: (data) => {
    //       setMessage('');
    //       setEditMode(false)
    //       if (ref) {
    //         ref.style.height = 'auto';
    //         const scrollHeight = ref.scrollHeight;
    //         const maxHeight = 3 / 50;
    //         ref.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    //         setIsExpanded(false);
    //       }
    //       console.log(data);
    //     },
    //   },
    // );
    // } else {  
    // mutate(
    //   { text: message, postId },
    //   {
    //     onSuccess: (data) => {
    //       setMessage('');
    //       if (ref) {
    //         ref.style.height = 'auto';
    //         const scrollHeight = ref.scrollHeight;
    //         const maxHeight = 3 / 50;
    //         ref.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    //         setIsExpanded(false);
    //       }
    //       console.log(data);
    //     },
    //   },
    // );
    // }
  };

  const handleKeyPress = (e: any) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div
      className={`
          flex  
          gap-1 
          lg:gap-1
          w-full
          ${isExpanded ? 'items-end' : 'items-center'}
        `}
    >
       {isEmojiPickerOpen && (
        <div className="absolute bottom-[5rem] md:bottom-[6rem]">
          <EmojiPicker
            height={350}
            width={300}
            onEmojiClick={handleEmojiClick}
          />
        </div>
      )}
      <div>
        <span
          className="text-xl cursor-pointer"
          onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
        >
          😊
        </span>
      </div>
      <form
        onSubmit={handleSubmit}
        className={`flex relative ${
          isExpanded ? 'items-end' : 'items-center'
        } gap-2 lg:gap-4 w-full`}
      >
        <textarea
          value={message}
          ref={textareaRef}
          onChange={handleMessage}
          onKeyDown={handleKeyPress}
          id="message"
          placeholder="Write a comment"
          className={`
    h-4 bg-dark-3 rounded-full border-none focus-visible:ring-1 focus-visible:ring-offset-1 ring-offset-light-3 w-full ps-2 pe-8 py-2 outline-none 
    customScrollbar
    ${isExpanded ? 'rounded-lg' : 'rounded-full'}
  `}
          rows={1}
          style={{
            minHeight: '40px',
            maxHeight: '100px',
          }}
        />
        <button
          type="submit"
          disabled={!message?.trim()}
          className="
              rounded-full
              cursor-pointer 
              transition
              absolute right-3 top-2.5
            "
        >
            <img
           src="/assets/icons/send.svg"
          alt="like"
          width={20}
          height={20}
        //   className=""
        />
        </button>
      </form>
    </div>
  );
};

export default CommentInput;
