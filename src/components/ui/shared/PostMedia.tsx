import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { useEffect, useState } from "react";

type PostMediaItem = {
  url: string;
  type?: "image" | "video";
  name?: string;
};

type PostMediaProps = {
  post: any;
  className?: string;
  imageClassName?: string;
};

const getPostMedia = (post: any): PostMediaItem[] => {
  if (post?.media?.length) return post.media;
  if (post?.imageUrl) return [{ url: post.imageUrl, type: "image" }];
  return [];
};

const PostMedia = ({ post, className = "", imageClassName = "" }: PostMediaProps) => {
  const media = getPostMedia(post);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [post?._id, media.length]);

  if (media.length === 0) return null;

  const hasMultipleMedia = media.length > 1;
  const activeMedia = media[Math.min(activeIndex, media.length - 1)];
  const isVideo = activeMedia.type === "video";
  const sharedClassName = `w-full bg-dark-2 object-cover ${imageClassName || "max-h-[34rem] rounded-xl"}`;

  const goPrevious = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setActiveIndex((index) => (index === 0 ? media.length - 1 : index - 1));
  };

  const goNext = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setActiveIndex((index) => (index === media.length - 1 ? 0 : index + 1));
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {isVideo ? (
        <video key={activeMedia.url} src={activeMedia.url} controls className={sharedClassName} />
      ) : (
        <img key={activeMedia.url} src={activeMedia.url} alt={activeMedia.name || "post media"} className={sharedClassName} />
      )}

      {hasMultipleMedia && (
        <>
          <button
            type="button"
            aria-label="Previous media"
            onClick={goPrevious}
            className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-black/55 text-white backdrop-blur-md transition hover:bg-black/75"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            type="button"
            aria-label="Next media"
            onClick={goNext}
            className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-black/55 text-white backdrop-blur-md transition hover:bg-black/75"
          >
            <ChevronRight size={22} />
          </button>

          <div className="absolute right-3 top-3 rounded-full bg-black/60 px-3 py-1 text-white tiny-medium backdrop-blur-md">
            {activeIndex + 1}/{media.length}
          </div>

          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-black/35 px-2 py-1 backdrop-blur-md">
            {media.map((item, index) => (
              <button
                key={`${item.url}-indicator-${index}`}
                type="button"
                aria-label={`Show media ${index + 1}`}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setActiveIndex(index);
                }}
                className={`h-1.5 rounded-full transition-all ${index === activeIndex ? "w-5 bg-white" : "w-1.5 bg-white/45"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default PostMedia;
export { getPostMedia };
