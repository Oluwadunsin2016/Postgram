import { useUserContext } from '@/context/AuthContext'
import { Models } from 'appwrite'
import React from 'react'
import { Link } from 'react-router-dom'
import PostStats from './PostStats'

type GridPostListProps= {
posts:Models.Document[];
showUser?:boolean;
showStats?:boolean;
postId?:string|number;
}
const GridPostList = ({postId,posts, showUser=true, showStats=true}:GridPostListProps) => {

const {user}=useUserContext()
  return (
    <ul className='grid-container'>
    {posts.map((post)=>(
    postId!==post._id &&
    <li className='relative h-80' key={post._id}><Link to={`/posts/${post._id}`} className='grid-post_link'>
    <img src={post?.imageUrl} alt="post" className='h-full w-full object-cover' />
    </Link>
    
    <div className="grid-post_user">
    {showUser && (
    <div className='flex items-center justify-start gap-2'>
    <img src={post?.creator.imageUrl} alt="creator" className='h-8 w-8 rounded-full' />
    <p className='line-clamp-1'>{post?.creator.name}</p>
    </div>
    )}

    {showStats && <PostStats post={post} userId={user._id}/>}
    </div>
    </li>
    ))}
    </ul>
  )
}

export default GridPostList