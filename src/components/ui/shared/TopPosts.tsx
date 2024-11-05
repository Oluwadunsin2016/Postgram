import React, { useEffect } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '../button'
import { useGetPosts, useGetUserPosts, useGetUsers, useSignOutAccount } from '@/lib/react-query/queriesAndMutation'
import { useUserContext } from '@/context/AuthContext'
import { sidebarLinks } from '@/constants'
import { INavLink } from '@/types'
import UserCard from './UserCard'
import Loader from './Loader'
import PostStats from './PostStats'
import { useGetUserProfile } from '@/lib/react-query/queries'

const TopPosts = () => {
const navigate=useNavigate()
const {pathname}=useLocation()
 const { user:currentUser } = useUserContext();

  const {
  data:user,
  isLoading: isUserLoading,
} = useGetUserProfile(currentUser._id||'');
 



  return (
    <div className='overflow-scroll custom-scrollbar px-10'>
       <Link to={`/profile/${user?._id}`} className="w-full flex flex-col gap-2 items-center justify-center my-8">
      <img
        src={user?.imageUrl || "/assets/icons/profile-placeholder.svg"}
        alt="creator"
        className="rounded-full w-[6rem] h-[6rem] flex-none"
      />
      <div className="flex flex-col items-center">
        <p className="body-bold">{user?.name}</p>
        <p className=" text-light-3">@{user?.username}</p>
      </div>
    </Link>
     <h3 className="body-bold mb-4">Top posts by you</h3>
    {isUserLoading ? <Loader/>: <div>
   {user?.posts?.length>0? <div className='flex flex-col flex-1 gap-8 w-full'>
     {user?.posts?.map((post:any)=>(
  <div className='relative w-full' key={post.$id}><Link to={`/posts/${post?._id}`} className='grid-post_link'>
    <img src={post?.imageUrl} alt="post" className='h-full w-full object-cover' />
    </Link>
    
    <div className="grid-post_user">
    <div className='flex items-center justify-start gap-2'>
    <img src={user?.imageUrl} alt="creator" className='h-8 w-8 rounded-full' />
    <p className='line-clamp-1'>{user?.name}</p>
    </div>

    <PostStats post={post} userId={currentUser._id}/>
    </div>
    </div>
     ))}
   </div>: <div className="flex items-center justify-center h-[10rem]">
          <p>You don't have any post</p>
          </div> }
    </div>}
    </div>
  )
}

export default TopPosts