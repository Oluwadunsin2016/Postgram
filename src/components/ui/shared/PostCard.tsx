import { useUserContext } from "@/context/AuthContext";
import { multiFormatDateString } from "@/lib/utils";
import { Models } from "appwrite";
import React from "react";
import { Link } from "react-router-dom";
import PostStats from "./PostStats";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type PostCardProps = {
  post: Models.Document;
};
const PostCard = ({ post }: PostCardProps) => {
console.log(post);

const {user} =useUserContext()
if (!post?.creator) return
  return (
    <div className="post-card">
      <div className="flex-between">
        <div className="flex items-center gap-3">
          <Link to={`/profile/${post?.creator._id}`}>
            <img
              src={
                post?.creator?.imageUrl ||
                "/assets/icons/profile-placeholder.svg"
              }
              alt="creator"
              className="rounded-full w-8 h-8 md:w-12 lg:h-12 flex-none"
            />
          </Link>

            <div className="flex flex-col">
              <p className="base-medium lg:body-bold text-light-1">
                {post.creator.name}
              </p>
              <div className="flex-center gap-2 text-light-3">
                <p className="suble-semibold lg:small-regular">
                  {multiFormatDateString(post?.createdAt)}
                </p>
                -
                <p className="suble-semibold lg:small-regular line-clamp-1">
                  {post?.location}
                </p>
              </div>
            </div>
        </div>
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
         </DropdownMenuContent>
         }
        </DropdownMenu>
        
                {/* <Dropdown className='bg-slate-600 inline-block'>
      <DropdownTrigger>
       <img src="/assets/icons/more-vertical.svg" className='cursor-pointer' alt="more" width={22} height={22} />
      </DropdownTrigger>
        {user._id===post?.creator._id&&
      <DropdownMenu aria-label="Inline dropdown menu">
        <DropdownItem key="edit" startContent={<img src="/assets/icons/edit.svg" alt="edit" width={20} height={20} />}>  
        <Link to={`/update-post/${post?._id}`}>
               <span>Edit</span>
              </Link>
              </DropdownItem>
      </DropdownMenu>
               }
    </Dropdown> */}
      </div>

      <Link to={`/posts/${post._id}`}>
        <img src={post.imageUrl || '/assets/icons/profile.placeholder.svg'} alt="post image" className="post-card_img mt-5" />
      <div className="small-medium lg:base-medium pb-8">
      <p>{post.caption}</p>
      <ul className="flex gap-1 mt-2">
      {post.tags.map((tag:string,i:any)=>(
      <li className='text-light-3' key={i}>#{tag}</li>
      ))}
      </ul>
      </div>
      </Link>

      <PostStats post={post} userId={user._id}/>
    </div>
  );
};

export default PostCard;
