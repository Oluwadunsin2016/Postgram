import { useUserContext } from "@/context/AuthContext";
import { multiFormatDateString } from "@/lib/utils";
import React, { MouseEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PostStats from "./PostStats";
import { Button } from "../button";
import { useFollowUser, useUnfollowUser } from "@/lib/react-query/queries";

type UserCardProps = {
  user: any;
};

const UserCard = ({ user }: UserCardProps) => {
  const navigate =useNavigate()
   const { user: currentUser } = useUserContext();
 const [isFollowing, setIsFollowing] = useState(false);
 const {mutateAsync:followUser}=useFollowUser()
 const {mutateAsync:unfollowUser}=useUnfollowUser()

  useEffect(() => {
    setIsFollowing(user?.followers?.includes(currentUser._id));
  }, [currentUser, user]);

    const handleFollow = async (e: MouseEvent) => {
     e.stopPropagation();
    try {
      await followUser(user?._id);
      setIsFollowing(true);
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const handleUnfollow = async (e: MouseEvent) => {
  e.stopPropagation();
    try {
      await unfollowUser(user._id);
      setIsFollowing(false);
    } catch (error) {
      console.error('Error unfollowing user:', error);
    }
  };

  const viewProfile=()=>{
  navigate(`/profile/${user?._id}`)
  }
  return (
    <div className="user-card cursor-pointer" onClick={viewProfile}>
       <div className="h-[6rem] w-[6rem] flex-none rounded-full overflow-hidden">
            <img
              src={user?.imageUrl || "/assets/icons/profile-placeholder.svg"}
              alt="creator"
              className="object-cover w-full h-full"
            />
          </div>
      <div className="flex flex-col items-center">
        <p className="body-bold line-clamp-1">{user?.name}</p>
        <p className="small-regular text-light-3">@{user?.username}</p>
      </div>
      {currentUser?._id!==user?._id&& <Button onClick={isFollowing ? handleUnfollow : handleFollow} className={isFollowing?"text-dark-4 px-4 bg-light-1":"bg-primary-500"}>
        {isFollowing ? 'Unfollow' : 'Follow'}
      </Button>}
    </div>
  );
};

export default UserCard;
