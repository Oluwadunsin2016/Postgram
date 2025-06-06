import { Button } from "@/components/ui/button";
import ImageView from "@/components/ui/shared/ImageView";
import Loader from "@/components/ui/shared/Loader";
import { useUserContext } from "@/context/AuthContext";
import {
  useFollowUser,
  useGetAllUsers,
  useGetUserProfile,
  useUnfollowUser,
} from "@/lib/react-query/queries";
import {
  useGetSavedPosts,
  useGetUserPosts,
} from "@/lib/react-query/queriesAndMutation";
import { QUERY_KEYS } from "@/lib/react-query/queryKeys";
import { Skeleton, Tab, Tabs } from "@nextui-org/react";
import { useQueryClient } from "@tanstack/react-query";
import React, { MouseEvent, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";

const Profile = () => {
  // const { data: savedPosts, isLoading: isPostLoading } = useGetSavedPosts();
  const [selected, setSelected] = useState("Posts");
  const [isFollowing, setIsFollowing] = useState(false);
    const [isOpen, setIsOpen] = useState(false)
     const [haveToFollow, setHaveToFollow] = useState(false);
       const [showScrollLeft, setShowScrollLeft] = useState(false);
  const [showScrollRight, setShowScrollRight] = useState(false);
  const { id } = useParams();
  console.log(id);
  const queryClient = useQueryClient();

const {data:users,isLoading: isUsersLoading,}=useGetAllUsers()
  const { mutateAsync: followUser,isSuccess:isFollowed } = useFollowUser();
  const { mutateAsync: unfollowUser,isSuccess:isUnfollowed } = useUnfollowUser();
  const { data: user, isLoading: isUserLoading } = useGetUserProfile(id || "");
  const { user: currentUser } = useUserContext();
  const { data: LoggedInUser } = useGetUserProfile(currentUser?._id || "");
  console.log(user);
    const containerRef = useRef<HTMLDivElement>(null);

useEffect(() => {
queryClient.invalidateQueries({queryKey:['getProfileUser',id]})
}, [isFollowed,isUnfollowed])


  useEffect(() => {
    setIsFollowing(user?.followers?.includes(currentUser?._id));
    if (!user?.followers?.includes(currentUser?._id) && LoggedInUser?.followers?.includes(user?._id)) {
      setHaveToFollow(true)
    }else if (user?.followers?.includes(currentUser?._id) && LoggedInUser?.followers?.includes(user?._id)){
      setHaveToFollow(false)
    }else{
      setHaveToFollow(false)
    }
  }, [currentUser, user]);

  const handleFollow = async (e: MouseEvent) => {
    e.stopPropagation();
    try {
      await followUser(user?._id);
      setIsFollowing(true);
    } catch (error) {
      console.error("Error following user:", error);
    }
  };

  const handleUnfollow = async (e: MouseEvent) => {
    e.stopPropagation();
    try {
      await unfollowUser(user._id);
      setIsFollowing(false);
    } catch (error) {
      console.error("Error unfollowing user:", error);
    }
  };

  useEffect(() => {
    queryClient.invalidateQueries({
      queryKey: ['getProfileUser', id],
    });
  }, [id]);

  const changeSelect = (result: any) => {
    setSelected(result);
  };

      const scrollLeft = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({
        left: -100, // Adjust the scroll amount as needed
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({
        left: 100, // Adjust the scroll amount as needed
        behavior: "smooth",
      });
    }
  };

    const checkOverflow = () => {
    if (containerRef.current) {
      const { scrollWidth, clientWidth, scrollLeft } = containerRef.current;
      setShowScrollLeft(scrollLeft > 0);
      setShowScrollRight(scrollLeft + clientWidth < scrollWidth);
    }
  };

  useEffect(() => {
    checkOverflow(); // Initial check

    // Attach a scroll event listener
    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", checkOverflow);
      window.addEventListener("resize", checkOverflow); // Recheck on window resize
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", checkOverflow);
      }
      window.removeEventListener("resize", checkOverflow);
    };
  }, [users]);

  const formattedBio = user?.bio
    ? user.bio.replace(/\n/g, "<br />")
    : "No biography";

  return (
    <div className="common-container">
    <ImageView setIsOpen={setIsOpen} isOpen={isOpen} imageUrl={user?.imageUrl} />
      {isUserLoading ? (
        <div className="w-full flex gap-4 md:gap-8">
          <Skeleton className="h-[5rem] w-[5rem] md:h-[10rem] md:w-[10rem] flex-none rounded-full" />

          <div className="w-full flex flex-col gap-2">
            <div className="flex flex-row gap-4 md:gap-8">
              <Skeleton className="h-6 w-[80%] rounded-lg" />
              <div className="hidden md:flex  items-center gap-4">
                <Skeleton className="h-[2rem] w-[4rem] rounded" />
                <Skeleton className="h-[2rem] w-[4rem] rounded" />
              </div>
            </div>
            <Skeleton className="h-4 w-[10rem] rounded-lg" />

            <ul className="my-4 flex items-center gap-4 md:gap-10">
              <li className="flex flex-col items-center gap-2">
                <Skeleton className="h-3 w-[2.5rem] md:h-5 md:w-[3.5rem] rounded-lg" />
                <Skeleton className="h-3 w-[3rem] md:h-5 md:w-[5rem] rounded-lg" />
              </li>
              <li className="flex flex-col items-center gap-2">
                <Skeleton className="h-3 w-[2.5rem] md:h-5 md:w-[3.5rem] rounded-lg" />
                <Skeleton className="h-3 w-[3rem] md:h-5 md:w-[5rem] rounded-lg" />
              </li>
              <li className="flex flex-col items-center gap-2">
                <Skeleton className="h-3 w-[2.5rem] md:h-5 md:w-[3.5rem] rounded-lg" />
                <Skeleton className="h-3 w-[3rem] md:h-5 md:w-[5rem] rounded-lg" />
              </li>
            </ul>

            <div className="my-4 flex flex-col gap-2 md:max-w-[70%]">
              <Skeleton className="h-4 w-full rounded-lg" />
              <Skeleton className="h-4 w-[70%] rounded-lg" />
              <Skeleton className="h-4 w-[80%] rounded-lg" />
              <Skeleton className="h-4 w-[30%] rounded-lg" />
            </div>

            <div className="flex md:hidden  items-center gap-4">
              <Skeleton className="h-[2rem] w-[4rem] rounded" />
              <Skeleton className="h-[2rem] w-[4rem] rounded" />
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full flex gap-4 md:gap-8">
          <div className="h-[5rem] w-[5rem] md:h-[10rem] md:w-[10rem] flex-none rounded-full overflow-hidden cursor-pointer">
            <img
              src={user?.imageUrl || "/assets/icons/profile-placeholder.svg"}
              alt="creator"
              className="object-cover w-full h-full"
              onClick={()=>setIsOpen(!isOpen)}
              
            />
          </div>
          <div className="flex flex-col">
            <div className="flex flex-col md:flex-row  gap-4 md:gap-8">
              <div>
                <h3 className="body-bold md:h2-bold line-clamp-1">
                  {user?.name}
                </h3>
                <p className="small-regular md:body-medium text-primary-500">
                  @{user?.username}
                </p>
              </div>
              {user?._id == currentUser._id ? (
                <Link
                  to={`/update-profile/${user?._id}`}
                  className="hidden md:flex bg-dark-4 px-4 rounded h-[2.5rem] text-light-1 gap-2 items-center"
                >
                  <img
                    src="/assets/icons/edit.svg"
                    alt="edit"
                    width={20}
                    height={20}
                  />{" "}
                  <span>Edit Profile</span>
                </Link>
              ) : (
                <div className="hidden md:flex  items-center gap-4">
                  <Button
                    onClick={isFollowing ? handleUnfollow : handleFollow}
                    className={
                      isFollowing
                        ? "text-dark-4 px-4 bg-light-1"
                        : "bg-primary-500"
                    }
                  >
                    {isFollowing ? 'Unfollow' :haveToFollow?'Follow back' : 'Follow'}
                  </Button>
                  <Link to={`/message/${user?._id}`} className="text-dark-4 px-4 bg-light-1 flex gap-2 py-2 rounded-md">
                    Message
                  </Link>
                </div>
              )}
            </div>

            <ul className="my-4 flex items-center gap-4 md:gap-10">
              <li className="flex flex-col gap-1 items-center">
                <p className="text-primary-500">{user?.posts?.length}</p>
                <p className="font-medium">Posts</p>
              </li>
              <li className="flex flex-col gap-1 items-center">
                <p className="text-primary-500">{user?.followers?.length}</p>
                <p className="font-medium">Followers</p>
              </li>
              <li className="flex flex-col gap-1 items-center">
                <p className="text-primary-500">{user?.following?.length}</p>
                <p className="font-medium">Following</p>
              </li>
            </ul>

            <div className="my-4 md:max-w-[70%]">
              <p
                dangerouslySetInnerHTML={{ __html: formattedBio }}
                className=""
              />
            </div>
            {user?._id == currentUser._id ? (
              <div className="flex justify-end items-end  md:hidden">
                <Link
                  to={`/update-profile/${user?._id}`}
                  className="flex bg-dark-4 px-4 rounded h-[2.5rem] text-light-1 gap-2 items-center"
                >
                  <img
                    src="/assets/icons/edit.svg"
                    alt="edit"
                    width={20}
                    height={20}
                  />{" "}
                  <span>Edit Profile</span>
                </Link>
              </div>
            ) : (
              <div className="flex md:hidden  items-center gap-4">
                <Button
                  onClick={isFollowing ? handleUnfollow : handleFollow}
                  className={
                    isFollowing
                      ? "text-dark-4 px-4 bg-light-1"
                      : "bg-primary-500"
                  }
                >
                  {isFollowing ? 'Unfollow' :haveToFollow?'Follow back' : 'Follow'}
                </Button>
                <Link to={`/message/${user?._id}`} className="text-dark-4 px-4 bg-light-1 flex gap-2 py-2 rounded-md">
                  Message
                </Link>
              </div>
            )}

          </div>
        </div>
      )}

      
            <div className="relative">
    {showScrollLeft &&  <button
        className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 shadow-lg rounded-full p-2"
        onClick={scrollLeft}
      >
          <img
            src="/assets/icons/chevron-left.svg"
            width={20}
            height={20}
            alt="add" 
          />
      </button>}
   {isUsersLoading? 
            <div className="flex gap-4 items-center justify-center my-4">
              {Array(4)
                .fill("box")
                .map((_, id) => (
                  <Skeleton
                    key={id}
                    className="h-[3rem] w-[3rem] md:h-[4rem] md:w-[4rem] flex-none rounded-full"
                  />
                ))}
            </div> : <div
        ref={containerRef}
        className="flex gap-4 items-center justify-center my-4 overflow-x-auto scrollbar-hide"
      >
        {users?.map((creator:any) => (
          <div
            key={creator._id}
            className="h-[3rem] w-[3rem] md:h-[4rem] md:w-[4rem] border-4 border-green-100 flex-none rounded-full overflow-hidden"
          >
            <img
              src={creator?.imageUrl || "/assets/images/profile.png"}
              alt="creator"
              className="object-cover w-full h-full"
            />
          </div>
        ))}
        {users?.map((creator:any) => (
          <div
            key={creator._id}
            className="h-[3rem] w-[3rem] md:h-[4rem] md:w-[4rem] border-4 border-green-100 flex-none rounded-full overflow-hidden"
          >
            <img
              src={creator?.imageUrl || "/assets/images/profile.png"}
              alt="creator"
              className="object-cover w-full h-full"
            />
          </div>
        ))}
        {users?.map((creator:any) => (
          <div
            key={creator._id}
            className="h-[3rem] w-[3rem] md:h-[4rem] md:w-[4rem] border-4 border-green-100 flex-none rounded-full overflow-hidden"
          >
            <img
              src={creator?.imageUrl || "/assets/images/profile.png"}
              alt="creator"
              className="object-cover w-full h-full"
            />
          </div>
        ))}
        {users?.map((creator:any) => (
          <div
            key={creator._id}
            className="h-[3rem] w-[3rem] md:h-[4rem] md:w-[4rem] border-4 border-green-100 flex-none rounded-full overflow-hidden"
          >
            <img
              src={creator?.imageUrl || "/assets/images/profile.png"}
              alt="creator"
              className="object-cover w-full h-full"
            />
          </div>
        ))}
      </div>}

      {/* Right Scroll Icon */}
    {showScrollRight &&  <button
        className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 shadow-lg rounded-full p-2"
        onClick={scrollRight}
      >
        <img
            src="/assets/icons/chevron-right.svg"
            width={20}
            height={20}
            alt="add" 
          />
      </button>}
    </div>

      <div className="flex justify-center md:justify-between w-full max-w-5xl mb-7">
        <Tabs
          aria-label="options"
          selectedKey={selected}
          onSelectionChange={changeSelect}
          classNames={{ tabList: "bg-dark-3", cursor: "bg-primary-600" }}
        >
          <Tab
            key="Posts"
            title={
              <div className="flex items-center gap-1 px-2">
                <img
                  src="/assets/icons/image.svg"
                  alt="image"
                  width={20}
                  height={20}
                  className={`${selected == "Posts" && "invert-white"}`}
                />

                <p className="small-medium md:base-medium text-light-2">
                  Posts
                </p>
              </div>
            }
          />
          <Tab
            key="Reels"
            title={
              <div className="flex items-center gap-1 px-2">
                <img
                  src="/assets/icons/video.svg"
                  alt="save"
                  width={20}
                  height={20}
                  className={`${selected == "Reels" && "invert-white"}`}
                />
                <p className="small-medium md:base-medium text-light-2">
                  Reels
                </p>
              </div>
            }
          />
          <Tab
            key="Tagged"
            title={
              <div className="flex items-center gap-1 px-2">
                <img
                  src="/assets/icons/tag.svg"
                  alt="collections"
                  width={20}
                  height={20}
                  className={`${selected == "Tagged" && "invert-white"}`}
                />
                <p className="small-medium md:base-medium text-light-2">
                  Tagged
                </p>
              </div>
            }
          />
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
        {selected == "Posts" ? (
          <div>
            {isUserLoading ? (
              <Loader />
            ) : (
              <div>
                {user?.posts?.length > 0 ? (
                  <div className="grid-container">
                    {user?.posts?.map((post: any) => (
                      <div className="relative min-w-80 h-80" key={post?._id}>
                        <Link
                          to={`/posts/${post?._id}`}
                          className="grid-post_link"
                        >
                          <img
                            src={post?.imageUrl}
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
                        <p className="absolute bottom-4 left-2 line-clamp-1">
                          {post.caption}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-[10rem]">
                    <p>No post</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : selected == "Reels" ? (
          <div className="h-[10rem] flex items-center justify-center">
            <p>No reel</p>
          </div>
        ) : (
          <div className="h-[10rem] flex items-center justify-center">
            <p>No tag</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
