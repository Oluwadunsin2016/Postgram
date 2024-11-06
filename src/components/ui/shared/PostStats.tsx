import React, { useState, useEffect } from "react";
import {
  useLikePost,
  useSavedPost,
  useDeleteSavedPost,
  useGetCurrentUser,
} from "@/lib/react-query/queriesAndMutation";
import { Models } from "appwrite";
import { checkIsLiked } from "@/lib/utils";
import Loader from "./Loader";
import { useGetUserProfile, useSavePost, useToggleLike } from "@/lib/react-query/queries";
import { useQueryClient } from "@tanstack/react-query";

type PostStatsProps = {
  post?: Models.Document;
  userId: string;
};
const PostStats = ({ post, userId }: PostStatsProps) => {
  const initialLikes = post?.likes.map((user: Models.Document) => user._id);
  const queryClient=useQueryClient()
  const [likes, setLikes] = useState(initialLikes);
  const [isSaved, setIsSaved] = useState(false);
  const { mutate: likePost } = useLikePost();
  const { mutate: savePost } = useSavePost();

  const { mutate: toggleLike } = useToggleLike();

  const { data: user, } = useGetUserProfile(userId || "");
  const savedPostRecord = user?.saves?.find(
    (record: Models.Document) => record?._id === post?._id
  );

  useEffect(() => {
    setIsSaved(!!savedPostRecord);
  }, [user]);

  const handleLikePost = (e: React.MouseEvent) => {
    e.stopPropagation();

    let newLikes = [...likes];
    const hasLiked = newLikes?.includes(userId);
    if (hasLiked) {
      newLikes = newLikes.filter((id) => id !== userId);
    } else {
      newLikes.push(userId);
    }

    setLikes(newLikes);
    likePost({ postId: post?.$id || "", likesArray: newLikes });
  };

  // const handleSavePost = (e: React.MouseEvent) => {
  //   e.stopPropagation();

  //   if (savedPostRecord) {
  //     setIsSaved(false);
  //     deleteSavedPost(savedPostRecord.$id);
  //   } else {
  //     savePost({ postId: post?.$id || "", userId });
  //     setIsSaved(true);
  //   }
  // };

    const handleSavePost = (e: React.MouseEvent) => {
    e.stopPropagation();

      savePost(post?._id||'',{
      onSuccess:()=>{
      queryClient.invalidateQueries({queryKey:['getProfileUser',userId]})
      }
      });
    if (savedPostRecord) {
      setIsSaved(false);
    } else {
      setIsSaved(true);
    }
  };



  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent bubbling if it's inside a link or button

    const hasLiked = likes?.includes(userId);
    setLikes(
      hasLiked ? likes?.filter((id: any) => id !== userId) : [...likes, userId]
    );

    toggleLike(post?._id);
  };

  return (
    <div className="z-20">
    <div className="flex justify-between items-center ">
      <div className="flex gap-4 mr-5">
      <div className="flex items-center gap-1">
        <img
          src={
            likes?.includes(userId)
              ? "/assets/icons/liked.svg"
              : "/assets/icons/like.svg"
          }
          alt="like"
          width={20}
          height={20}
          onClick={handleLike}
          className="cursor-pointer"
        />
       <p className="small-medium">{likes?.length}</p>
      </div>
      <div className="flex items-center gap-1">
        <img
          src="/assets/icons/message-circle.svg"
          alt="like"
          width={20}
          height={20}
          className="cursor-pointer"
        />
       <p className="small-medium">{post?.comments.length}</p>
      </div>
      <div className="flex items-center gap-1">
        <img
           src="/assets/icons/share-2.svg"
          alt="like"
          width={20}
          height={20}
          className="cursor-pointer"
        />    
       <p className="small-medium">0</p>
      </div>
      
      </div>
      <div className="flex gap-2 mr-5">
          <img
            src={isSaved ? "/assets/icons/saved.svg" : "/assets/icons/save.svg"}
            alt="save"
            width={20}
            height={20}
            onClick={handleSavePost}
            className="cursor-pointer"
          />
      </div>
    </div>
      {/* <p className="small-medium mt-2">{likes.length<1?'No like':likes.length>1?`${likes.length} likes`:`${likes.length} like`}</p> */}
    </div>
  );
};

export default PostStats;
