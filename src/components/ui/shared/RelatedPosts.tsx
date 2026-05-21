import { useEffect } from "react";
import { useInView } from "react-intersection-observer";

import Loader from "@/components/ui/shared/Loader";
import { useGetAllPosts } from "@/lib/react-query/queries";
import PostCard from "./PostCard";

const RelatedPosts = ({postId}:{postId:string|number}) => {
  const { ref, inView } = useInView();
  const {data:posts, hasNextPage, fetchNextPage}=useGetAllPosts()

  useEffect(() => {
    if (inView) fetchNextPage();
  }, [fetchNextPage, inView]);

  if (!posts) {
    return (
      <div className="flex-center h-40 w-full">
        <Loader />
      </div>
    );
  }

  const shouldShowPosts = posts?.pages?.every((item:any) => item?.posts?.length === 0);

  return (
    <section className="mt-10">
      <div className="mb-5 flex-between">
        <div>
          <p className="small-semibold uppercase tracking-[0.24em] text-light-4">Keep exploring</p>
          <h3 className="body-bold md:h3-bold">Related Posts</h3>
        </div>
      </div>

      {shouldShowPosts ? (
        <p className="text-light-4 mt-10 text-center w-full">End of posts</p>
      ) : (
        <div className="mx-auto flex w-full max-w-3xl flex-col">
          {posts?.pages.map((item:any, index:number) => (
            <div key={`page-${index}`} className="flex flex-col">
              {item.posts
                ?.filter((post:any) => post?._id !== postId)
                .map((post:any) => (
                  <PostCard key={post._id} post={post} />
                ))}
            </div>
          ))}
        </div>
      )}

      {hasNextPage && (
        <div ref={ref} className="mt-8">
          <Loader />
        </div>
      )}
    </section>
  );
};

export default RelatedPosts;
