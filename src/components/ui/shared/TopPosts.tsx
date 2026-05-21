import { Link } from 'react-router-dom'
import { useUserContext } from '@/context/AuthContext'
import Loader from './Loader'
import { useGetUserProfile } from '@/lib/react-query/queries'
import PostCard from './PostCard'

const TopPosts = () => {
 const { user:currentUser } = useUserContext();

  const {
  data:user,
  isLoading: isUserLoading,
} = useGetUserProfile(currentUser._id||'');
 



  return (
    <div className='px-5'>
       <Link to={`/profile/${user?._id}`} className="content-panel mb-6 flex w-full flex-col items-center justify-center gap-2 rounded-2xl p-5 text-center">
      <img
        src={user?.imageUrl || "/assets/images/default_user_image.png"}
        alt="creator"
        className="h-20 w-20 flex-none rounded-full object-cover ring-2 ring-white/10"
      />
      <div className="flex flex-col items-center">
        <p className="body-bold">{user?.name}</p>
        <p className="text-white/[0.45]">@{user?.username}</p>
      </div>
    </Link>
     <p className="small-semibold uppercase tracking-[0.24em] text-white/[0.35]">Your studio</p>
     <h3 className="body-bold mb-4">Top posts by you</h3>
    {isUserLoading ? <Loader/>: <div>
   {user?.posts?.length>0? <div className='flex w-full flex-col'>
     {user?.posts?.slice(0, 4).map((post:any)=>(
      <PostCard key={post?._id} post={post} />
     ))}
   </div>: <div className="flex items-center justify-center h-[10rem]">
          <p>You don't have any post</p>
          </div> }
    </div>}
    </div>
  )
}

export default TopPosts
