import PostStats from '@/components/ui/shared/PostStats'
import { useUserContext } from '@/context/AuthContext'
import { useDeletePost, useGetPostDetails } from '@/lib/react-query/queries'
import { multiFormatDateString } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState } from "react"
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import CommentInput from '@/components/ui/shared/CommentInput'
import Comment from '@/components/ui/shared/Comment'
import RelatedPosts from '@/components/ui/shared/RelatedPosts'
import PostMedia, { getPostMedia } from '@/components/ui/shared/PostMedia'
import PostForm from '@/components/forms/PostForm'
import { MapPin, MoreHorizontal, Pencil, Repeat2, Trash2 } from 'lucide-react'
import { createPortal } from 'react-dom'
import { Skeleton } from '@nextui-org/react'

const countCommentThread = (comments:any[] = []): number =>
  comments.reduce((total, comment) => total + 1 + countCommentThread(comment?.replies || []), 0);

const PostDetails = () => {
  const [message, setMessage] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditPostOpen, setIsEditPostOpen] = useState(false);
  const {user} = useUserContext()
  const {id} = useParams()
  const navigate = useNavigate();
  const {data:post, isLoading} = useGetPostDetails(id || '')
  const { mutate: deletePost } = useDeletePost();

  const isOwner = user._id === post?.creator?._id;
  const commentCount = countCommentThread(post?.comments || []);
  const displayPost = post?.repostOf || post;
  const hasMedia = getPostMedia(displayPost).length > 0;

  const handleDeletePost = () => {
    if (!post?._id) return;
    deletePost(post._id, {
      onSuccess: () => {
        setIsDialogOpen(false);
        navigate('/');
      },
    });
  };

  if (isLoading) {
    return (
      <div className='post_details-container'>
        <div className='post_details-card'>
          <Skeleton className="h-[28rem] w-full bg-dark-4 md:h-[36rem] xl:h-[44rem]" />
          <div className="flex flex-col gap-5 p-5 md:p-7">
            <div className="flex items-center gap-3">
              <Skeleton className="h-11 w-11 rounded-full bg-dark-4" />
              <div className="flex-1">
                <Skeleton className="h-5 w-44 rounded-lg bg-dark-4" />
                <Skeleton className="mt-2 h-4 w-32 rounded-lg bg-dark-4" />
              </div>
            </div>
            <Skeleton className="h-20 w-full rounded-2xl bg-dark-4" />
            <Skeleton className="h-48 w-full rounded-2xl bg-dark-4" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='post_details-container'>
      <div className='w-full max-w-6xl'>
        <article className='post_details-card'>
          <div className="bg-dark-2">
            {hasMedia ? (
              <PostMedia post={displayPost} className="h-full" imageClassName="post_details-img rounded-none" />
            ) : (
              <div className="post_details-img flex items-center justify-center p-8">
                <p className="max-w-xl whitespace-pre-line text-center text-[24px] font-bold leading-tight text-white md:text-[34px]">
                  {displayPost?.caption || post?.caption || "Postgram"}
                </p>
              </div>
            )}
          </div>

          <div className="post_details-info">
            <header className='flex-between w-full gap-4'>
              <Link to={`/profile/${post?.creator?._id}`} className='flex min-w-0 items-center gap-3'>
                <img
                  src={post?.creator?.imageUrl || "/assets/images/default_user_image.png"}
                  alt="creator"
                  className="h-11 w-11 flex-none rounded-full object-cover ring-2 ring-white/10"
                />

                <div className="min-w-0">
                  <p className="base-semibold line-clamp-1 text-light-1">
                    {post?.creator?.name}
                  </p>
                  <div className="flex items-center gap-2 text-light-3 small-regular">
                    <span>{multiFormatDateString(post?.createdAt)}</span>
                    {post?.location && <span className="h-1 w-1 rounded-full bg-light-4" />}
                    {post?.location && <MapPin size={13} />}
                    {post?.location && <span className="line-clamp-1">{post.location}</span>}
                  </div>
                </div>
              </Link>

              {isOwner && (
                <DropdownMenu>
                  <DropdownMenuTrigger className="grid h-9 w-9 place-items-center rounded-full border border-dark-4 bg-dark-3 outline-none transition hover:bg-dark-4">
                    <MoreHorizontal size={18} />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="border-dark-4 bg-dark-3 text-white">
                    <DropdownMenuItem className="cursor-pointer gap-2" onClick={() => setIsEditPostOpen(true)}>
                      <Pencil size={16} />
                      <span>Edit</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer gap-2 text-red" onClick={() => setIsDialogOpen(true)}>
                      <Trash2 size={16} />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </header>

            <section className="min-h-0 flex-1">
              <div className="border-b border-dark-4 pb-5">
                {post?.repostOf && (
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary-500/10 px-3 py-1 text-primary-500 small-semibold">
                    <Repeat2 size={15} />
                    <span>Reposted from {post.repostOf?.creator?.name || "a creator"}</span>
                  </div>
                )}
                {post?.caption && <p className="whitespace-pre-line text-light-1 base-regular">{post.caption}</p>}
                {!post?.caption && displayPost?.caption && post?.repostOf && (
                  <p className="whitespace-pre-line text-light-2 base-regular">{displayPost.caption}</p>
                )}
                {post?.tags?.length > 0 && (
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {post.tags.map((tag:string) => (
                      <li className='rounded-full bg-primary-500/10 px-3 py-1 text-xs font-semibold text-primary-500' key={tag}>#{tag}</li>
                    ))}
                  </ul>
                )}
              </div>

              <div className='flex min-h-0 flex-col gap-3'>
                <div className="flex-between">
                  <h2 className="body-bold">Comments</h2>
                  <span className="small-medium text-light-3">{commentCount}</span>
                </div>

                {post?.comments?.length > 0 ? (
                  <div className="flex flex-col gap-3 md:max-h-[20rem] md:overflow-y-auto md:pr-2 xl:max-h-[26rem] custom-scrollbar">
                    {post.comments.map((comment:any) => (
                      <Comment key={comment._id} comment={comment} postId={post?._id} postOwnerId={post?.creator?._id} />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dark-4 bg-dark-3 p-5 text-center">
                    <p className="base-semibold">No comments yet</p>
                    <p className="mt-1 text-light-3 small-regular">Start the conversation on this post.</p>
                  </div>
                )}
              </div>
            </section>
            
            <footer className="relative z-50 flex flex-col gap-4 border-t border-dark-4">
              <PostStats post={post} userId={user._id}/>
              <CommentInput message={message} setMessage={setMessage} postId={post?._id} />
            </footer>
          </div>
        </article>

        <RelatedPosts postId={post?._id} />
      </div>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent className='border-dark-4 bg-dark-3 text-white'>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this post?</AlertDialogTitle>
            <AlertDialogDescription className='text-light-3'>
              This action cannot be undone. The post, comments, and saved references will be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className='shad-button_dark_4' onClick={() => setIsDialogOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction className='bg-red px-4 text-light-1 hover:bg-red' onClick={handleDeletePost}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {isEditPostOpen && createPortal(
        <div className="fixed inset-0 z-[90] grid place-items-center overflow-y-auto bg-black/70 px-4 py-8 backdrop-blur-sm" onClick={() => setIsEditPostOpen(false)}>
          <div className="w-full max-w-4xl" onClick={(event) => event.stopPropagation()}>
            <PostForm post={post} action="Update" onCancel={() => setIsEditPostOpen(false)} onSuccess={() => setIsEditPostOpen(false)} />
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

export default PostDetails
