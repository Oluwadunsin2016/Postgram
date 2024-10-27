import { Button } from '@/components/ui/button'
import Loader from '@/components/ui/shared/Loader'
import PostStats from '@/components/ui/shared/PostStats'
import { useUserContext } from '@/context/AuthContext'
import { useDeletePost, useGetPostById } from '@/lib/react-query/queriesAndMutation'
import { multiFormatDateString } from '@/lib/utils'
import React from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

const PostDetails = () => {
const {user} =useUserContext()
const {id} = useParams()
 const navigate = useNavigate();
const {data:post, isLoading} =useGetPostById(id||'')
 const { mutate: deletePost } = useDeletePost();

const handleDeletePost=()=>{
  deletePost({ postId: id ||'', imageId: post?.imageId });
    navigate(-1);
}

  return (
    <div className='post_details-container'>
    {isLoading? <Loader/>:(
    <div className='post_details-card'>
<img src={post?.imageUrl} alt="post" className='post_details-img' />

       <div className="post_details-info">
       <div className='flex-between w-full'>
          <Link to={`/profile/${post?.creator.$id}`} className='flex items-center gap-3'>
            <img
              src={
                post?.creator.imageUrl ||
                "/assets/icons/profile-placeholder.svg"
              }
              alt="creator"
              className="rounded-full w-8 h-8 lg:w-12 lg:h-12"
            />
        

            <div className="flex flex-col">
              <p className="base-medium lg:body-bold text-light-1">
                {post?.creator.name}
              </p>
              <div className="flex-center gap-2 text-light-3">
                <p className="suble-semibold lg:small-regular">
                  {multiFormatDateString(post?.$createdAt)}
                </p>
                -
                <p className="suble-semibold lg:small-regular">
                  {post?.location}
                </p>
              </div>
            </div>
              </Link>

              <div className="flex-center">
              {user.id===post?.creator.$id&&<Link to={`/update-post/${post?.$id}`}>
              <img src="/assets/icons/edit.svg" alt="edit" width={24} height={24} />
              </Link>}

              {user.id===post?.creator.$id&&    <Button variant='ghost' onClick={handleDeletePost} className='ghost_details-delete-btn'>
               <img src="/assets/icons/delete.svg" alt="delete" width={24} height={24} />
              </Button>}
              </div>
       </div>

       <hr className='border w-full border-dark-4/80' />
       <div className="flex flex-col flex-1 w-full small-medium lg:base-medium py-5">
      <p>{post?.caption}</p>
      <ul className="flex gap-1 mt-2">
      {post?.tags.map((tag:string,i:any)=>(
      <li className='text-light-3' key={i}>#{tag}</li>
      ))}
      </ul>
      </div>

      <div className="w-full">
      <PostStats post={post} userId={user.id}/>
      </div>
        </div>
    </div>
    )}
    </div>
  )
}

export default PostDetails