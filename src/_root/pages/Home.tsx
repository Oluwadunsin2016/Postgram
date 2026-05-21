import Loader from '@/components/ui/shared/Loader'
import PostCard from '@/components/ui/shared/PostCard'
import StatusTray from '@/components/ui/shared/StatusTray'
import useDebounce from '@/hooks/useDebounce'
import { useGetAllPosts, useSearchPosts } from '@/lib/react-query/queries'
import { Skeleton } from '@nextui-org/react'
import { Search } from 'lucide-react'
import { useEffect, useState } from "react"
import { useInView } from 'react-intersection-observer'

const FeedSkeleton = () => (
  <div className="flex w-full flex-col gap-7">
    {Array.from({ length: 3 }).map((_, index) => (
      <div key={index} className="border-b border-white/10 py-5">
        <div className="grid grid-cols-[3.25rem_minmax(0,1fr)] gap-4">
          <Skeleton className="h-12 w-12 rounded-full bg-dark-4" />
          <div className="min-w-0">
            <Skeleton className="h-5 w-48 rounded-lg bg-dark-4" />
            <Skeleton className="mt-3 h-4 w-4/5 rounded-lg bg-dark-4" />
            <Skeleton className="mt-4 h-[22rem] w-full rounded-2xl bg-dark-4" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

const Home = () => {
  const { ref, inView } = useInView();
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm.trim(), 350);
  const {data:returnData, isLoading:isPostLoading, hasNextPage, fetchNextPage}=useGetAllPosts()
  const { data: searchedPosts = [], isFetching: isSearchFetching } = useSearchPosts(debouncedSearch);
  const isSearching = debouncedSearch.length > 0;

  useEffect(() => {
    if (inView && !isSearching) fetchNextPage();
  }, [inView, fetchNextPage, isSearching]);

  const shouldShowPosts = returnData?.pages?.every((item) => item?.posts?.length === 0);

  return (
    <div className="home-container">
      <div className="home-posts">
        <section className="content-panel w-full overflow-hidden rounded-2xl p-5 md:p-6">
          <p className="small-semibold uppercase tracking-[0.24em] text-white/[0.38]">Live feed</p>
          <div className="mt-2 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="h2-bold">See what the world is posting</h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-white/[0.55]">
                Follow creators, save inspiration, and jump into conversations from one polished social feed.
              </p>
            </div>
          </div>
          <div className="mt-5 flex items-center gap-3 rounded-2xl border border-dark-4 bg-dark-3 px-4">
            <Search size={19} className="text-light-4" />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search posts by caption, location, or tags"
              className="h-12 flex-1 bg-transparent text-light-1 outline-none placeholder:text-light-4 small-regular"
            />
          </div>
        </section>

        <StatusTray />

        <div className="flex w-full items-center justify-between">
          <div>
            <p className="small-semibold uppercase tracking-[0.24em] text-white/[0.35]">{isSearching ? "Search results" : "Latest"}</p>
            <h2 className="h3-bold">{isSearching ? `Posts matching "${debouncedSearch}"` : "Home Feed"}</h2>
          </div>
        </div>

        {isSearching ? (
          isSearchFetching ? (
            <FeedSkeleton />
          ) : searchedPosts.length > 0 ? (
            <div className='flex w-full flex-col gap-7'>
              {searchedPosts.map((post:any)=>(
                <PostCard key={post._id} post={post}/>
              ))}
            </div>
          ) : (
            <p className="text-light-4 mt-10 text-center w-full">No posts matched your search</p>
          )
        ) : isPostLoading && !returnData ? (
          <FeedSkeleton />
        ) : shouldShowPosts ? (
          <p className="text-light-4 mt-10 text-center w-full">End of posts</p>
        ) : (
          <div className='flex w-full flex-col gap-7'>
            {returnData?.pages?.map((page:any,i:any)=>(
              <div key={`page-${i}`} className='flex w-full flex-col gap-7'>
                {page?.posts.map((post:any)=>(
                  <PostCard key={post._id} post={post}/>
                ))}
              </div>
            ))}
            {hasNextPage && (
              <div ref={ref} className="mt-4">
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
