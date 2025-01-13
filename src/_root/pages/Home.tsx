import Loader from '@/components/ui/shared/Loader'
import PostCard from '@/components/ui/shared/PostCard'
import { useGetAllPosts, useGetAllUsers } from '@/lib/react-query/queries'
import { useGetRecentPosts } from '@/lib/react-query/queriesAndMutation'
import { Skeleton } from '@nextui-org/react'
import React, { useEffect, useRef, useState } from 'react'
import { useInView } from 'react-intersection-observer'

const Home = () => {
       const [showScrollLeft, setShowScrollLeft] = useState(false);
  const [showScrollRight, setShowScrollRight] = useState(false);
 const { ref, inView } = useInView();
  const containerRef = useRef<HTMLDivElement>(null);
const {data:returnData, isLoading:isPostLoading,isError:isErrorPosts,hasNextPage, fetchNextPage
}=useGetAllPosts()
const {data:users,isLoading: isUsersLoading,}=useGetAllUsers()


console.log(returnData)

  useEffect(() => {
    if (inView ) {
      fetchNextPage();
    }
  }, [inView]);

 
       const scrollLeft = () => {
     if (containerRef.current) {
       containerRef.current.scrollBy({
         left: -100, // Adjust the scroll amount as needed
         behavior: "smooth",
       });
     }
   };
 
   const scrollRight = () => {
     if (containerRef.current) {
       containerRef.current.scrollBy({
         left: 100, // Adjust the scroll amount as needed
         behavior: "smooth",
       });
     }
   };
 
     const checkOverflow = () => {
     if (containerRef.current) {
       const { scrollWidth, clientWidth, scrollLeft } = containerRef.current;
       setShowScrollLeft(scrollLeft > 0);
       setShowScrollRight(scrollLeft + clientWidth < scrollWidth);
     }
   };
 
   useEffect(() => {
     checkOverflow(); // Initial check
 
     // Attach a scroll event listener
     const container = containerRef.current;
     if (container) {
       container.addEventListener("scroll", checkOverflow);
       window.addEventListener("resize", checkOverflow); // Recheck on window resize
     }
 
     return () => {
       if (container) {
         container.removeEventListener("scroll", checkOverflow);
       }
       window.removeEventListener("resize", checkOverflow);
     };
   }, [users]);

const shouldShowPosts = returnData?.pages?.every((item) => item?.posts?.length === 0);
  return (
    <div className="home-container">
    <div className="home-posts">

           <div className="relative w-full">
      {showScrollLeft &&  <button
          className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 shadow-lg rounded-full p-2"
          onClick={scrollLeft}
        >
            <img
              src="/assets/icons/chevron-left.svg"
              width={20}
              height={20}
              alt="add" 
            />
        </button>}
     {isUsersLoading? 
              <div className="flex gap-4 items-center justify-center my-4">
                {Array(4)
                  .fill("box")
                  .map((_, id) => (
                    <Skeleton
                      key={id}
                      className="h-[3rem] w-[3rem] md:h-[4rem] md:w-[4rem] flex-none rounded-full"
                    />
                  ))}
              </div> : <div
          ref={containerRef}
          className="flex gap-4 items-center justify-center my-4 overflow-x-auto scrollbar-hide"
        >
          {users?.map((creator:any) => (
            <div
              key={creator._id}
              className="h-[3rem] w-[3rem] md:h-[4rem] md:w-[4rem] border-4 border-green-100 flex-none rounded-full overflow-hidden"
            >
              <img
                src={creator?.imageUrl || "/assets/images/profile.png"}
                alt="creator"
                className="object-cover w-full h-full"
              />
            </div>
          ))}
          {users?.map((creator:any) => (
            <div
              key={creator._id}
              className="h-[3rem] w-[3rem] md:h-[4rem] md:w-[4rem] border-4 border-green-100 flex-none rounded-full overflow-hidden"
            >
              <img
                src={creator?.imageUrl || "/assets/images/profile.png"}
                alt="creator"
                className="object-cover w-full h-full"
              />
            </div>
          ))}
          {users?.map((creator:any) => (
            <div
              key={creator._id}
              className="h-[3rem] w-[3rem] md:h-[4rem] md:w-[4rem] border-4 border-green-100 flex-none rounded-full overflow-hidden"
            >
              <img
                src={creator?.imageUrl || "/assets/images/profile.png"}
                alt="creator"
                className="object-cover w-full h-full"
              />
            </div>
          ))}
          {users?.map((creator:any) => (
            <div
              key={creator._id}
              className="h-[3rem] w-[3rem] md:h-[4rem] md:w-[4rem] border-4 border-green-100 flex-none rounded-full overflow-hidden"
            >
              <img
                src={creator?.imageUrl || "/assets/images/profile.png"}
                alt="creator"
                className="object-cover w-full h-full"
              />
            </div>
          ))}
        </div>}
  
        {/* Right Scroll Icon */}
      {showScrollRight &&  <button
          className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 shadow-lg rounded-full p-2"
          onClick={scrollRight}
        >
          <img
              src="/assets/icons/chevron-right.svg"
              width={20}
              height={20}
              alt="add" 
            />
        </button>}
      </div>

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
  )
}

export default Home