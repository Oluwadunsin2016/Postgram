
import Loader from '@/components/ui/shared/Loader'
import PostStats from '@/components/ui/shared/PostStats'
import { useUserContext } from '@/context/AuthContext'
import { useDeletePost, useGetPostDetails } from '@/lib/react-query/queries'
import { useGetPostById } from '@/lib/react-query/queriesAndMutation'
import { multiFormatDateString } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import React, { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import CommentInput from '@/components/ui/shared/CommentInput'
import Comment from '@/components/ui/shared/Comment'
import RelatedPosts from '@/components/ui/shared/RelatedPosts'

const PostDetails = () => {
const [message, setMessage] = useState('');
const [editMode, setEditMode] = useState(false);
const [isOpen, setIsOpen] = useState(false);
const [commentId, setCommentId] = useState(null);
// const targetRef=useRef<HTMLDivElement>(null)
const [isDialogOpen, setIsDialogOpen] = useState(false);
const {user} =useUserContext()
const {id} = useParams()
 const navigate = useNavigate();
// const {data:post, isLoading} =useGetPostById(id||'')
const {data:post, isLoading} =useGetPostDetails(id||'')
//  const { mutate: deletePost } = useDeletePost();
  const { mutate: deletePost } = useDeletePost();
console.log(post);

  const handleDeletePost = () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      deletePost(post._id);
      setIsDialogOpen(false)
    navigate(-1);
    }
  };

  return (
    <div className='post_details-container'>
    {isLoading? <Loader/>:(
    <div>
    <div className='post_details-card'>
<img src={post?.imageUrl} alt="post" className='post_details-img' />

       <div className="post_details-info relative">
       <div className='flex-between w-full'>
          <Link to={`/profile/${post?.creator._id}`} className='flex items-center gap-3'>
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
                  {multiFormatDateString(post?.createdAt)}
                </p>
                -
                <p className="suble-semibold lg:small-regular">
                  {post?.location}
                </p>
              </div>
            </div>
              </Link>
                 <DropdownMenu>
         <DropdownMenuTrigger className="border-none outline-none cursor-pointer"> <img src="/assets/icons/more-vertical.svg" className='cursor-pointer' alt="more" width={22} height={22} /></DropdownMenuTrigger>
         {user._id===post?.creator._id&&
         <DropdownMenuContent className="bg-slate-800 border-none outline-none w-auto">
          <Link to={`/update-post/${post?._id}`}>
         <DropdownMenuItem className="cursor-pointer">
            <img src="/assets/icons/edit.svg" alt="edit" width={20} height={20} />
             <span>Edit</span>
          </DropdownMenuItem>
          </Link>
         <DropdownMenuItem className="cursor-pointer" onClick={()=>setIsDialogOpen(true)}>
            <img src="/assets/icons/delete.svg"   alt="delete" width={20} height={20} />
        <span>Delete</span>
          </DropdownMenuItem>
         </DropdownMenuContent>
         }
        </DropdownMenu>
       </div>
       <div className="flex flex-col flex-1 w-full small-medium lg:base-medium pb-8 overflow-y-auto custom-scrollbar max-h-[15rem]">
      <p>{post?.caption}</p>
      <ul className="flex gap-1 mt-2">
      {post?.tags.map((tag:string,i:any)=>(
      <li className='text-light-3' key={i}>#{tag}</li>
      ))}
      </ul>
  <hr className='border w-full border-dark-4/80' />
     <div className='flex flex-col gap-6  my-4'>
     {post?.comments.map((comment:any)=>(
     <Comment key={comment._id} comment={comment} />
     ))}
     </div>
      </div>  

      <div className="w-full">
      <PostStats post={post} userId={user._id}/>
      </div>
      <CommentInput message={message} commentId={"8779"} setMessage={setMessage} setEditMode={setEditMode} postId={post?._id} editMode={editMode}/>
        </div>
    </div>

     <RelatedPosts postId={post?._id} />
    </div>
    )}

   
         <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
  <AlertDialogContent className='bg-slate-800 border-none'>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you sure you want to delete this post?</AlertDialogTitle>
      <AlertDialogDescription className='text-light-2'>
        This action cannot be undone. This will permanently delete your post
        and remove everything related to it.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel className='outline-dark-4 bg-transparent px-4  text-light-1 flex gap-2 py-1' onClick={()=>setIsDialogOpen(false)}>Cancel</AlertDialogCancel>
      <AlertDialogAction className='text-dark-4 px-4 bg-light-1 flex gap-2 py-1' onClick={handleDeletePost}>Continue</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
    </div>
  )
}

export default PostDetails