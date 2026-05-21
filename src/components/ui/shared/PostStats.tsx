import React, { useState, useEffect } from "react";
import { useGetUserProfile, useRepostPost, useSavePost, useToggleLike } from "@/lib/react-query/queries";
import { useQueryClient } from "@tanstack/react-query";
import { Bookmark, Heart, MessageCircle, Repeat2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "../textarea";
import { Button } from "../button";

type PostStatsProps = {
  post?: any;
  userId: string;
};

const countCommentThread = (comments:any[] = []): number =>
  comments.reduce((total, comment) => total + 1 + countCommentThread(comment?.replies || []), 0);

const PostStats = ({ post, userId }: PostStatsProps) => {
  const initialLikes = post?.likes?.map((user: any) => user._id || user) || [];
  const queryClient = useQueryClient();
  const [likes, setLikes] = useState(initialLikes);
  const [isSaved, setIsSaved] = useState(false);
  const [isRepostOpen, setIsRepostOpen] = useState(false);
  const [repostNote, setRepostNote] = useState("");
  const { mutate: savePost } = useSavePost();
  const { mutate: repostPost, isLoading: isReposting } = useRepostPost();
  const { toast } = useToast();
  const { mutate: toggleLike } = useToggleLike();

  const { data: user } = useGetUserProfile(userId || "");
  const savedPostRecord = user?.saves?.find(
    (record: any) => (record?.post?._id || record?.post || record?._id) === post?._id
  );
  const commentCount = countCommentThread(post?.comments || []);
  const repostCount = post?.repostOf?.repostCount ?? post?.repostCount ?? 0;
  const repostedBy = post?.repostOf?.repostedBy ?? post?.repostedBy ?? [];
  const hasReposted = repostedBy.some((repostUser: any) => (repostUser?._id || repostUser)?.toString() === userId);

  useEffect(() => {
    setLikes(post?.likes?.map((likedUser: any) => likedUser._id || likedUser) || []);
  }, [post?._id, post?.likes]);

  useEffect(() => {
    setIsSaved(!!savedPostRecord);
  }, [savedPostRecord]);

  const handleSavePost = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!post?._id) return;

    setIsSaved((value) => !value);
    savePost(post._id, {
      onError: () => setIsSaved(!!savedPostRecord),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['getProfileUser', userId] });
      },
    });
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!post?._id || !userId) return;

    const hasLiked = likes?.includes(userId);
    setLikes(
      hasLiked ? likes?.filter((id: any) => id !== userId) : [...likes, userId]
    );

    toggleLike(post._id, {
      onError: () => setLikes(initialLikes),
    });
  };

  const handleRepost = () => {
    if (!post?._id || isReposting) return;

    repostPost(
      { postId: post?.repostOf?._id || post._id, caption: repostNote.trim() },
      {
        onSuccess: () => {
          toast({ title: repostNote.trim() ? "Post reposted with your note" : "Post reposted" });
          setIsRepostOpen(false);
          setRepostNote("");
        },
        onError: (error: any) => toast({ variant: "destructive", title: error?.message || "Unable to repost" }),
      }
    );
  };

  return (
    <div className="z-20 border-b border-white/10 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-5 md:gap-7">
          <div className="flex items-center gap-1.5 text-white/[0.65]">
            <MessageCircle size={20} />
            <p className="small-medium">{commentCount || ""}</p>
          </div>
          <button type="button" className="flex items-center gap-1.5 text-white/[0.65] transition hover:text-white" onClick={handleLike}>
            <Heart size={20} className={likes?.includes(userId) ? "fill-red text-red" : ""} />
            <p className="small-medium">{likes?.length || ""}</p>
          </button>
          <button
            type="button"
            className={`flex items-center gap-1.5 transition hover:text-primary-500 disabled:opacity-50 ${hasReposted ? "text-primary-500" : "text-white/[0.65]"}`}
            onClick={() => setIsRepostOpen(true)}
            disabled={isReposting}
          >
            <Repeat2 size={21} className={hasReposted ? "stroke-[2.8]" : ""} />
            <p className="small-medium">{repostCount || ""}</p>
          </button>
        </div>

        <button type="button" onClick={handleSavePost} className="text-white/[0.65] transition hover:text-white" aria-label="Save post">
          <Bookmark size={21} className={isSaved ? "fill-primary-500 text-primary-500" : ""} />
        </button>
      </div>

      {isRepostOpen && (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-black/70 px-4 backdrop-blur-sm" onClick={() => setIsRepostOpen(false)}>
          <div className="w-full max-w-lg rounded-2xl border border-dark-4 bg-dark-2 p-5 shadow-[0_24px_90px_rgba(0,0,0,0.45)]" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="body-bold">Repost</p>
                <p className="mt-1 text-white/45 small-regular">Add an optional note, or repost immediately.</p>
              </div>
              <button type="button" className="grid h-9 w-9 place-items-center rounded-full bg-white/5 text-white/60 hover:text-white" onClick={() => setIsRepostOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <Textarea
              value={repostNote}
              onChange={(event) => setRepostNote(event.target.value)}
              placeholder="Say something about this repost..."
              className="shad-textarea mt-5 h-28"
            />

            <div className="mt-5 flex justify-end gap-3">
              <Button type="button" className="shad-button_dark_4" onClick={() => setIsRepostOpen(false)}>Cancel</Button>
              <Button type="button" className="shad-button_primary" disabled={isReposting} onClick={handleRepost}>
                {isReposting ? "Reposting..." : repostNote.trim() ? "Repost with note" : "Repost"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostStats;
