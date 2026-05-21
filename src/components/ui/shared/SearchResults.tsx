import Loader from './Loader';
import PostCard from './PostCard';
type searchResultProps={
isSearchFetching:boolean;
searchedPosts:any
}
const SearchResults = ({isSearchFetching,searchedPosts}:searchResultProps) => {

if (isSearchFetching) return <div className='flex-center min-h-60 w-full'><Loader/></div>
if (searchedPosts&&searchedPosts.length>0){
 return ( 
 <div className='mx-auto flex w-full max-w-3xl flex-col'>
  {searchedPosts.map((post:any) => <PostCard key={post?._id} post={post} />)}
 </div>
 )}
  return (
    <div className='content-panel flex min-h-60 w-full flex-col items-center justify-center rounded-2xl p-8 text-center'>
      <p className='body-bold'>No results found</p>
      <p className='mt-2 max-w-sm text-light-3 small-regular'>Try searching a different tag, location, creator, or caption.</p>
    </div>
  )
}

export default SearchResults
