import { useUserContext } from "@/context/AuthContext";
import { multiFormatDateString } from "@/lib/utils";
import { Models } from "appwrite";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import PostStats from "./PostStats";
import { Button } from "../button";

type UserCardProps = {
  user: Models.Document;
};

const UserCard = ({ user }: UserCardProps) => {
  const navigate =useNavigate()
   const { user: currentUser } = useUserContext();

  const viewProfile=()=>{
  navigate(`/profile/${user?.$id}`)
  }
  return (
    <div className="user-card cursor-pointer" onClick={viewProfile}>
      <img
        src={user.imageUrl || "/assets/icons/profile-placeholder.svg"}
        alt="creator"
        width={100}
        height={100}
        className="rounded-full"
      />
      <div className="flex flex-col items-center">
        <p className="body-bold line-clamp-1">{user?.name}</p>
        <p className="small-regular text-light-3">@{user?.username}</p>
      </div>
      {currentUser?.id!==user?.$id&& <Button className=" bg-primary-500">
        Follow
      </Button>}
    </div>
  );
};

export default UserCard;
