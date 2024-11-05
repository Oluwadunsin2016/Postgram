import Loader from '@/components/ui/shared/Loader'
import PostCard from '@/components/ui/shared/PostCard'
import { useGetAllPosts } from '@/lib/react-query/queries'
import { useGetRecentPosts } from '@/lib/react-query/queriesAndMutation'
import { Models } from 'appwrite'
import React, { useEffect } from 'react'
import { useInView } from 'react-intersection-observer'

const Home = () => {
 const { ref, inView } = useInView();
const {data:returnData, isLoading:isPostLoading,isError:isErrorPosts,hasNextPage, fetchNextPage
}=useGetAllPosts()


console.log(returnData)

  useEffect(() => {
    if (inView ) {
      fetchNextPage();
    }
  }, [inView]);

const shouldShowPosts = returnData?.pages?.every((item) => item?.posts?.length === 0);
  return (
    <div className='flex flex-1'>
    <div className="home-container">
    <div className="home-posts">
    <h2 className='b
    h3-bold md:h2-bold text-left w-full'>Home Feed</h2>
    {isPostLoading && !returnData ?(
    <Loader/>
    ):shouldShowPosts ? (
          <p className="text-light-4 mt-10 text-center w-full">End of posts</p>
        ):(
    <div className='flex flex-col flex-1 gap-9 w-full'>
    {returnData?.pages?.map((page:any,i:any)=>(
     <div key={`page-${i}`} className='flex flex-col flex-1 gap-9 w-full'>
    {page?.posts.map((post:any,index:any)=>(
    <PostCard key={index} post={post}/>
    ))}
    </div>
    ))}
      {hasNextPage && (
        <div ref={ref} className="mt-10">
          <Loader />
        </div>
      )}
    </div>
    )}
    </div>
    </div>
    </div>
  )
}

export default Home