import Loader from "@/components/ui/shared/Loader";
import { useUserContext } from "@/context/AuthContext";
import { useGetSavedPosts, useGetUserPosts } from "@/lib/react-query/queriesAndMutation";
import {Tab, Tabs } from "@nextui-org/react";
import React, { useState } from "react";
import { Link } from "react-router-dom";

const Saved = () => {
const [selected, setSelected] = useState("Posts");
  // const { data: savedPosts, isLoading: isPostLoading } = useGetSavedPosts();
  const { user:currentUser } = useUserContext();

  const {
  data:user,
  isLoading: isUserLoading,
} = useGetUserPosts(currentUser.id||'');

  console.log(user);

  const changeSelect=(result:any)=>{
  setSelected(result)
  }

  return (
    <div className="common-container">
      <div className="max-w-5xl flex-start gap-2 justify-start w-full">
        <img
          src="/assets/icons/bookmark.svg"
          width={36}
          height={36}
          alt="users"
          className="invert-white"
        />
        <h2 className="h3-bold md:h2-bold text-left w-full">Saves</h2>
      </div>

      <div className="flex-between w-full max-w-5xl mb-7">
          <Tabs aria-label="options"  selectedKey={selected}
        onSelectionChange={changeSelect} classNames={{tabList:'bg-dark-3',cursor:'bg-primary-600'}} >
          <Tab key='Posts'  title={ <div className="flex items-center gap-1 px-2">
            <img
              src="/assets/icons/image.svg"
              alt="image"
              width={20}
              height={20}
             className={`${selected=='Posts'&&'invert-white'}`}
            />

            <p className="small-medium md:base-medium text-light-2">Posts</p>
          </div>}/>
             <Tab key='Reels'  title={ <div className="flex items-center gap-1 px-2">
             <img
              src="/assets/icons/video.svg"
              alt="save"
              width={20}
              height={20}
              className={`${selected=='Reels'&&'invert-white'}`}
            />
            <p className="small-medium md:base-medium text-light-2">Reels</p>
          </div>}/>
          <Tab key='Collections'  title={ <div className="flex items-center gap-1 px-2">
             <img
              src="/assets/icons/folder.svg"
              alt="collections"
              width={20}
              height={20}
              className={`${selected=='Collections'&&'invert-white'}`}
            />
            <p className="small-medium md:base-medium text-light-2 me-6">
              Collections
            </p>
          </div>}/>     
      </Tabs>

        <div className="hidden md:flex-center gap-3 bg-dark-3 rounded-xl px-4 py-2 cursor-pointer">
          <p className="small-medium md:base-medium text-light-2">All</p>
          <img
            src="/assets/icons/filter.svg"
            width={20}
            height={20}
            alt="filter"
          />
        </div>
      </div>

 <div>
{selected=='Posts'? <div>
         {isUserLoading ? (
        <Loader />
      ) : (
      <div>
      {user?.save?.length>0? <div className="grid-container">
          {user?.save?.map((each:any) => (
            <div className="relative min-w-80 h-80" key={each?.post?.$id}>
              <Link to={`/posts/${each?.post?.$id}`} className="grid-post_link">
                <img
                  src={each?.post?.imageUrl}
                  alt="post"
                  className="h-full w-full object-cover"
                />
              </Link>

              <img
                src="/assets/icons/copy.svg"
                alt="save"
                width={20}
                height={20}
                className="cursor-pointer absolute top-4 right-4"
              />
            </div>
          ))}
        </div>:<div className="h-[10rem] flex items-center justify-center">
<p>You don't have a saved post</p>
</div>}
      </div>
      )}
</div>:selected=='Reels'? <div className="h-[10rem] flex items-center justify-center">
<p>No reel</p>
</div>:<div className="h-[10rem] flex items-center justify-center">
<p>No Collection</p>
</div> }
</div>

<div>
</div>


    </div>
  );
};

export default Saved;
