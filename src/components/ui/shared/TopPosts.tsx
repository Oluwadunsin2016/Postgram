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

const TopPosts = () => {
const navigate=useNavigate()
const {pathname}=useLocation()
 const { user:currentUser } = useUserContext();

  const {
  data:user,
  isLoading: isUserLoading,
} = useGetUserPosts(currentUser.id||'');
 



  return (
    <div className='overflow-scroll custom-scrollbar px-10'>
       <div className="w-full flex flex-col gap-2 items-center justify-center my-8">
      <img
        src={user?.imageUrl || "/assets/icons/profile-placeholder.svg"}
        alt="creator"
        width={100}
        height={100}
        className="rounded-full"
      />
      <div className="flex flex-col items-center">
        <p className="body-bold">{user?.name}</p>
        <p className=" text-light-3">@{user?.username}</p>
      </div>
    </div>
     <h3 className="body-bold md:h3-bold mb-4">Top posts by you</h3>
    {isUserLoading ? <Loader/>: <div>
   {user?.posts?.length>0? <div className='flex flex-col flex-1 gap-8 w-full'>
     {user?.posts?.map((post:any)=>(
  <div className='relative min-w-80 h-80' key={post.$id}><Link to={`/posts/${post.$id}`} className='grid-post_link'>
    <img src={post?.imageUrl} alt="post" className='h-full w-full object-cover' />
    </Link>
    
    <div className="grid-post_user">
    <div className='flex items-center justify-start gap-2'>
    <img src={user?.imageUrl} alt="creator" className='h-8 w-8 rounded-full' />
    <p className='line-clamp-1'>{user?.name}</p>
    </div>

    <PostStats post={post} userId={currentUser.id}/>
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