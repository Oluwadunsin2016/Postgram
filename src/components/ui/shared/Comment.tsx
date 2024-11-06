import { formatRelativeTime } from '@/lib/utils';
import React from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

const Comment = ({comment}:any) => {
 const navigate = useNavigate();

   const goToProfile = () => {
    navigate(`/profile/${comment?.author._id}`);
  };
  
  return (
   <div className="flex justify-between items-center">
    <div className="flex gap-2">
    <img
    onClick={goToProfile}
              src={
                comment?.author.imageUrl ||
                "/assets/icons/profile-placeholder.svg"
              }
              alt="creator"
              className="rounded-full w-6 h-6 lg:w-10 lg:h-10 cursor-pointer"
            />
            <div>
             <div className="flex flex-col">
              <p className="base-medium text-light-3">
                {comment?.author.name}
              </p>
             <p>{comment?.text}</p>
            </div>

            <div className="flex items-center gap-4 text-xs mt-2">
            <p className='text-light-3'>{formatRelativeTime(comment?.createdAt)}</p>
            <p className='font-thin flex items-center gap-1 cursor-pointer'> <img
           src="/assets/icons/corner-up-left.svg"
          alt="like"
          width={14}
          height={14}
          className="cursor-pointer"
        />  <span>reply</span> </p>
            </div>
            </div>
    
    </div>
      <div className="flex items-center gap-1">
        <img
          src="/assets/icons/like.svg"
          alt="like"
          width={15}
          height={15}
          className="cursor-pointer"
        />
       <p className="text-small text-light-3">5 likes</p>
      </div>
   </div>
  )
}

export default Comment