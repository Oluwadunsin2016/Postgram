import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";


import Loader from "@/components/ui/shared/Loader";
import GridPostList from "@/components/ui/shared/GridPostList";
import { useGetAllPosts, } from "@/lib/react-query/queries";


const RelatedPosts = ({postId}:{postId:string|number}) => {
  const { ref, inView } = useInView();
  // const { data: posts, fetchNextPage, hasNextPage } = useGetPosts();
  const {data:posts, isLoading:isPostLoading,isError:isErrorPosts,hasNextPage, fetchNextPage
}=useGetAllPosts()



  useEffect(() => {
    if (inView) {
      fetchNextPage();
    }
  }, [inView,]);

  if (!posts)
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );

  const shouldShowPosts = posts?.pages?.every((item) => item?.posts?.length === 0);

  return (
    <div>

      <div className="flex-between w-full max-w-5xl mt-16 mb-7">
        <h3 className="body-bold md:h3-bold">Related Posts</h3>

        <div className="flex-center gap-3 bg-dark-3 rounded-xl px-4 py-2 cursor-pointer">
          <p className="small-medium md:base-medium text-light-2">All</p>
          <img
            src="/assets/icons/filter.svg"
            width={20}
            height={20}
            alt="filter"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-9 w-full max-w-5xl">
        {shouldShowPosts ? (
          <p className="text-light-4 mt-10 text-center w-full">End of posts</p>
        ) : (
          posts?.pages.map((item:any, index:any) => (
            <GridPostList postId={postId} key={`page-${index}`} posts={item.posts} />
          ))
        )}
      </div>

      {hasNextPage && (
        <div ref={ref} className="mt-10">
          <Loader />
        </div>
      )}
    </div>
  );
};

export default RelatedPosts;