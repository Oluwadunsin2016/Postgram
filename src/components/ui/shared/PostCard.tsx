import { useUserContext } from "@/context/AuthContext";
import { multiFormatDateString } from "@/lib/utils";
import { useState } from "react";
import { Link } from "react-router-dom";
import PostStats from "./PostStats";
import PostMedia, { getPostMedia } from "./PostMedia";
import PostForm from "@/components/forms/PostForm";
import { createPortal } from "react-dom";
import { useDeletePost } from "@/lib/react-query/queries";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MapPin, MoreHorizontal, Pencil, Repeat2, Trash2 } from "lucide-react";

type PostCardProps = {
  post: any;
};

const PostCard = ({ post }: PostCardProps) => {
  const { user } = useUserContext();
  const [isEditPostOpen, setIsEditPostOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const { mutate: deletePost } = useDeletePost();
  if (!post?.creator) return null;

  const isRepost = Boolean(post?.repostOf);
  const contentPost = post?.repostOf || post;
  const displayCreator = isRepost ? post?.creator : contentPost?.creator || post?.creator;
  const originalCreator = contentPost?.creator;
  const mediaPost = getPostMedia(contentPost).length ? contentPost : post;
  const isOwner = user._id === post?.creator?._id;

  const handleDeletePost = () => {
    if (!post?._id) return;
    deletePost(post._id, {
      onSuccess: () => setIsDeleteOpen(false),
    });
  };

  return (
    <article className="w-full border-b border-white/10 py-5">
      {isRepost && (
        <div className="mb-3 ml-[4.25rem] flex items-center gap-2 text-white/45 small-medium">
          <Repeat2 size={16} />
          <span>{post?.creator?.name} reposted</span>
        </div>
      )}

      <div className="grid grid-cols-[3.25rem_minmax(0,1fr)] gap-4">
        <Link to={`/profile/${displayCreator?._id}`} className="h-12 w-12 overflow-hidden rounded-full bg-dark-4">
          <img
            src={displayCreator?.imageUrl || "/assets/images/default_user_image.png"}
            alt={displayCreator?.name || "creator"}
            className="h-full w-full object-cover"
          />
        </Link>

        <div className="min-w-0">
          <header className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <Link to={`/profile/${displayCreator?._id}`} className="base-semibold line-clamp-1 text-light-1 hover:underline">
                  {displayCreator?.name}
                </Link>
                {displayCreator?.username && (
                  <span className="small-regular text-white/45">@{displayCreator.username}</span>
                )}
                <span className="small-regular text-white/45">· {multiFormatDateString(post?.createdAt)}</span>
              </div>

              {!isRepost && contentPost?.location && (
                <div className="mt-1 flex items-center gap-1.5 text-white/45 small-regular">
                  <MapPin size={13} />
                  <span className="line-clamp-1">{contentPost.location}</span>
                </div>
              )}
              {!isRepost && contentPost?.taggedUsers?.length > 0 && (
                <p className="mt-1 line-clamp-1 text-white/45 small-regular">
                  with{" "}
                  <span className="text-light-2">
                    {contentPost.taggedUsers.slice(0, 2).map((taggedUser:any) => taggedUser.name).join(", ")}
                    {contentPost.taggedUsers.length > 2 ? ` and ${contentPost.taggedUsers.length - 2} more` : ""}
                  </span>
                </p>
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger className="grid h-9 w-9 flex-none place-items-center rounded-full text-white/50 outline-none transition hover:bg-white/10 hover:text-white">
                <MoreHorizontal size={20} />
              </DropdownMenuTrigger>
              {isOwner && (
                <DropdownMenuContent align="end" className="w-52 rounded-2xl border border-white/10 bg-[#11131a] p-2 text-white shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
                  <DropdownMenuItem className="cursor-pointer gap-3 rounded-xl p-3" onClick={() => setIsEditPostOpen(true)}>
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary-500/15 text-primary-500">
                      <Pencil size={17} />
                    </span>
                    <span>Edit</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer gap-3 rounded-xl p-3 text-red" onClick={() => setIsDeleteOpen(true)}>
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-red/15 text-red">
                      <Trash2 size={17} />
                    </span>
                    <span>Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              )}
            </DropdownMenu>
          </header>

          <Link to={`/posts/${post._id}`} className="block">
            {post?.caption && isRepost && (
              <p className="mt-2 whitespace-pre-line text-white/90 base-regular">{post.caption}</p>
            )}

            {!isRepost && contentPost?.caption && (
              <p className="mt-2 whitespace-pre-line text-white/90 base-regular">{contentPost.caption}</p>
            )}

            {isRepost ? (
              <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035]">
                <div className="flex items-start gap-3 p-4">
                  <Link to={`/profile/${originalCreator?._id}`} className="h-10 w-10 flex-none overflow-hidden rounded-full bg-dark-4" onClick={(event) => event.stopPropagation()}>
                    <img
                      src={originalCreator?.imageUrl || "/assets/images/default_user_image.png"}
                      alt={originalCreator?.name || "creator"}
                      className="h-full w-full object-cover"
                    />
                  </Link>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="small-semibold text-white">{originalCreator?.name}</span>
                      {originalCreator?.username && <span className="small-regular text-white/45">@{originalCreator.username}</span>}
                      <span className="small-regular text-white/45">· {multiFormatDateString(contentPost?.createdAt)}</span>
                    </div>
                    {contentPost?.location && (
                      <div className="mt-1 flex items-center gap-1.5 text-white/45 tiny-medium">
                        <MapPin size={12} />
                        <span className="line-clamp-1">{contentPost.location}</span>
                      </div>
                    )}
                    {contentPost?.taggedUsers?.length > 0 && (
                      <p className="mt-1 line-clamp-1 text-white/45 tiny-medium">
                        with{" "}
                        <span className="text-light-2">
                          {contentPost.taggedUsers.slice(0, 2).map((taggedUser:any) => taggedUser.name).join(", ")}
                          {contentPost.taggedUsers.length > 2 ? ` and ${contentPost.taggedUsers.length - 2} more` : ""}
                        </span>
                      </p>
                    )}
                  </div>
                </div>

                {contentPost?.caption && (
                  <p className="px-4 pb-4 whitespace-pre-line text-white/85 base-regular">{contentPost.caption}</p>
                )}

                <PostMedia
                  post={mediaPost}
                  className="overflow-hidden border-t border-white/10"
                  imageClassName="h-[17rem] sm:h-[21rem] md:h-[24rem] rounded-none"
                />

                {contentPost?.tags?.length > 0 && (
                  <ul className="flex flex-wrap gap-2 p-4">
                    {contentPost.tags.map((tag: string, index: number) => (
                      <li className="text-primary-500 small-medium" key={`${tag}-${index}`}>#{tag}</li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <PostMedia
                post={mediaPost}
                className="mt-4 overflow-hidden rounded-2xl"
                imageClassName="h-[19rem] sm:h-[23rem] md:h-[27rem] rounded-2xl"
              />
            )}

            {!isRepost && contentPost?.tags?.length > 0 && (
              <ul className="mt-3 flex flex-wrap gap-2">
                {contentPost.tags.map((tag: string, index: number) => (
                  <li className="text-primary-500 small-medium" key={`${tag}-${index}`}>#{tag}</li>
                ))}
              </ul>
            )}
          </Link>

          <PostStats post={post} userId={user._id} />
        </div>
      </div>

      {isEditPostOpen && createPortal(
        <div className="fixed inset-0 z-[90] grid place-items-center overflow-y-auto bg-black/70 px-4 py-8 backdrop-blur-sm" onClick={() => setIsEditPostOpen(false)}>
          <div className="w-full max-w-4xl" onClick={(event) => event.stopPropagation()}>
            <PostForm post={post} action="Update" onCancel={() => setIsEditPostOpen(false)} onSuccess={() => setIsEditPostOpen(false)} />
          </div>
        </div>,
        document.body
      )}

      {createPortal(
        <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <AlertDialogContent className="z-[110] border-dark-4 bg-dark-3 text-white">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this post?</AlertDialogTitle>
              <AlertDialogDescription className="text-light-3">
                This removes the post, its comments, saved references, and uploaded media.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="shad-button_dark_4" onClick={() => setIsDeleteOpen(false)}>Cancel</AlertDialogCancel>
              <AlertDialogAction className="bg-red px-4 text-light-1 hover:bg-red" onClick={handleDeletePost}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>,
        document.body
      )}
    </article>
  );
};

export default PostCard;
