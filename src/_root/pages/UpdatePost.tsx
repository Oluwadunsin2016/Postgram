import PostForm from "@/components/forms/PostForm";
import Loader from "@/components/ui/shared/Loader";
import { useGetPostById } from "@/lib/react-query/queriesAndMutation";
import React from "react";
import { useParams } from "react-router-dom";

const UpdatePost = () => {
const {id} =useParams()
console.log(id);


const {data:post, isLoading}=useGetPostById(id||'')
console.log(post);

if (isLoading) return <Loader/>
  return (
    <div className="flex flex-1">
      <div className="common-container">
        <div className="max-w-5xl flex-start gap-2 justify-start w-full ">
          <img
            src="/assets/icons/add-post.svg"
            width={36}
            height={36}
            alt="add" 
          />
          <h2 className="h3-bold md:h2-bold text-left w-full">Update Post</h2>
        </div>

        <PostForm post={post} action='Update'/>
      </div>
    </div>
  );
};

export default UpdatePost;
