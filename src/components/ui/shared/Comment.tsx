import { formatRelativeTime } from '@/lib/utils';
import { useDeleteComment, useToggleCommentLike, useUpdateComment } from '@/lib/react-query/queries';
import { useUserContext } from '@/context/AuthContext';
import { Heart, Pencil, Trash2 } from 'lucide-react';
import { useEffect, useState } from "react"
import { useNavigate } from 'react-router-dom'
import CommentInput from './CommentInput';

type CommentProps = {
  comment: any;
  postId: string;
  depth?: number;
  replyToName?: string;
  postOwnerId?: string;
};

const getLikeIds = (likes: any[] = []) => likes.map((like: any) => like?._id || like);
const countReplies = (replies: any[] = []): number =>
  replies.reduce((total, reply) => total + 1 + countReplies(reply?.replies || []), 0);

const Comment = ({comment, postId, depth = 0, replyToName, postOwnerId}:CommentProps) => {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [editMessage, setEditMessage] = useState(comment?.text || '');
  const [likes, setLikes] = useState<string[]>(getLikeIds(comment?.likes));
  const navigate = useNavigate();
  const { user } = useUserContext();
  const { mutate: toggleCommentLike } = useToggleCommentLike();
  const { mutate: updateComment, isLoading: isUpdating } = useUpdateComment();
  const { mutate: deleteComment, isLoading: isDeleting } = useDeleteComment();
  const replies = comment?.replies || [];
  const isLiked = likes.includes(user?._id);
  const canNest = depth < 6;
  const replyCount = countReplies(replies);
  const replyLabel = replyCount === 1 ? "View 1 reply" : `View all ${replyCount} replies`;
  const isAuthor = user?._id === comment?.author?._id;
  const canDelete = user?._id === comment?.author?._id || user?._id === postOwnerId;

  useEffect(() => {
    setLikes(getLikeIds(comment?.likes));
  }, [comment?.likes]);

  useEffect(() => {
    setEditMessage(comment?.text || '');
  }, [comment?.text]);

  const goToProfile = () => {
    if (comment?.author?._id) navigate(`/profile/${comment.author._id}`);
  };

  const handleLike = () => {
    if (!comment?._id || !postId || !user?._id) return;

    const nextLikes = isLiked
      ? likes.filter((id) => id !== user._id)
      : [...likes, user._id];

    setLikes(nextLikes);
    toggleCommentLike(
      { commentId: comment._id, postId },
      { onError: () => setLikes(getLikeIds(comment?.likes)) },
    );
  };

  const handleDelete = () => {
    if (!comment?._id || !postId || isDeleting) return;
    deleteComment({ commentId: comment._id, postId });
  };

  const cancelEdit = () => {
    setEditMessage(comment?.text || '');
    setIsEditing(false);
  };

  const handleUpdate = () => {
    const text = editMessage.trim();
    if (!comment?._id || !postId || !text || isUpdating) return;

    updateComment(
      { commentId: comment._id, postId, text },
      { onSuccess: () => setIsEditing(false) },
    );
  };
  
  return (
   <article className="relative isolate overflow-visible focus-within:z-[900]">
    <div className="relative z-10 flex gap-3 overflow-visible">
      <button type="button" onClick={goToProfile} className="h-10 w-10 flex-none overflow-hidden rounded-full">
        <img
          src={comment?.author?.imageUrl || "/assets/images/default_user_image.png"}
          alt={comment?.author?.name || "creator"}
          className="h-full w-full object-cover"
        />
      </button>

      <div className="min-w-0 flex-1 overflow-visible">
        <div className="inline-block max-w-full overflow-visible rounded-2xl bg-dark-3/90 px-4 py-3">
          <button type="button" onClick={goToProfile} className="base-semibold hover:text-primary-500">
            {comment?.author?.name || "Unknown user"}
          </button>
          {isEditing ? (
            <div className="relative z-50 mt-3 w-[min(34rem,72vw)] max-w-full">
              <CommentInput
                compact
                autoFocus
                postId={postId}
                message={editMessage}
                setMessage={setEditMessage}
                placeholder="Edit your comment..."
                onSubmitMessage={handleUpdate}
                isSubmitting={isUpdating}
                onCancel={cancelEdit}
              />
              <button type="button" className="mt-2 px-2 text-xs font-semibold text-light-4 transition hover:text-white" onClick={cancelEdit}>
                Cancel
              </button>
            </div>
          ) : (
            <p className="mt-1 whitespace-pre-line text-light-2 small-regular">
              {replyToName && (
                <button type="button" className="mr-1 font-bold text-light-3 hover:text-primary-500">
                  {replyToName}
                </button>
              )}
              {comment?.text}
            </p>
          )}
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-4 px-2 text-xs font-semibold text-light-4">
          <span>{formatRelativeTime(comment?.createdAt)}</span>
          <button type="button" className={`transition ${isLiked ? "text-red" : "hover:text-red"}`} onClick={handleLike}>
            Like
          </button>
          <button type="button" className="transition hover:text-white" onClick={() => setIsReplying((value) => !value)}>
            Reply
          </button>
          {isAuthor && !isEditing && (
            <button
              type="button"
              className="inline-flex items-center gap-1 text-light-4 transition hover:text-white"
              onClick={() => {
                setIsReplying(false);
                setIsEditing(true);
              }}
            >
              <Pencil size={13} />
              <span>Edit</span>
            </button>
          )}
          {canDelete && (
            <button
              type="button"
              disabled={isDeleting}
              className="inline-flex items-center gap-1 text-light-4 transition hover:text-red disabled:cursor-not-allowed disabled:opacity-60"
              onClick={handleDelete}
            >
              <Trash2 size={13} />
              <span>Delete</span>
            </button>
          )}

          {likes.length > 0 && (
            <span className="inline-flex items-center gap-1 text-light-3">
              {likes.length}
              <span className="grid h-5 w-5 place-items-center rounded-full bg-red text-white">
                <Heart size={11} className="fill-current" />
              </span>
            </span>
          )}
        </div>

        {isReplying && (
          <div className="relative z-[800] mt-3 max-w-xl">
            <CommentInput
              compact
              autoFocus
              postId={postId}
              parentId={comment?._id}
              message={replyMessage}
              setMessage={setReplyMessage}
              placeholder={`Reply to ${comment?.author?.name || "comment"}`}
              onSuccess={() => setIsReplying(false)}
            />
          </div>
        )}
      </div>
    </div>

    {replies.length > 0 && canNest && !showReplies && (
      <div className="relative ml-5 mt-1 pl-7">
        <span className="pointer-events-none absolute left-0 top-[-5.25rem] z-0 h-[6.45rem] w-7 rounded-bl-2xl border-b-[1.5px] border-l-[1.5px] border-gray-500/80" />
        <button
          type="button"
          onClick={() => setShowReplies(true)}
          className="relative text-left text-light-3 transition hover:text-white small-semibold"
        >
          {replyLabel}
        </button>
      </div>
    )}

    {replies.length > 0 && canNest && showReplies && (
      <div className="relative ml-5 mt-3 pl-7">
        <div className="flex flex-col gap-3">
          {replies.map((reply:any, index:number) => {
            const isFirstReply = index === 0;
            const isLastReply = index === replies.length - 1;

            return (
            <div
              key={reply._id}
              className={`relative ${!isLastReply ? "after:pointer-events-none after:absolute after:-left-7 after:top-5 after:bottom-[-0.75rem] after:z-0 after:border-l-[1.5px] after:border-gray-500/80" : ""}`}
            >
              <span
                className={`pointer-events-none absolute -left-7 z-0 w-[4.25rem] rounded-bl-2xl border-b-[1.5px] border-l-[1.5px] border-gray-500/80 ${
                  isFirstReply ? "top-[-6.25rem] h-[7.5rem]" : "top-[-0.75rem] h-8"
                }`}
              />
              <Comment
                comment={reply}
                postId={postId}
                depth={depth + 1}
                replyToName={comment?.author?.name}
                postOwnerId={postOwnerId}
              />
            </div>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => setShowReplies(false)}
          className="ml-12 mt-2 text-light-4 transition hover:text-white small-semibold"
        >
          Hide replies
        </button>
      </div>
    )}

    {replies.length > 0 && !canNest && (
      <div className="relative ml-5 mt-1 pl-7">
        <span className="pointer-events-none absolute left-0 top-[-5.25rem] z-0 h-[6.45rem] w-7 rounded-bl-2xl border-b-[1.5px] border-l-[1.5px] border-gray-500/80" />
        <span className="text-light-4 small-medium">{replyCount} more replies</span>
      </div>
    )}
   </article>
  )
}

export default Comment
