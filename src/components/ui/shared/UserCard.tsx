import { useUserContext } from "@/context/AuthContext";
import { MouseEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../button";
import { useFollowUser, useGetUserProfile, useUnfollowUser } from "@/lib/react-query/queries";
import { MapPin, MessageCircle, UserPlus } from "lucide-react";

type UserCardProps = {
  user: any;
};

const UserCard = ({ user }: UserCardProps) => {
  const navigate =useNavigate()
   const { user: currentUser } = useUserContext();
 const [isFollowing, setIsFollowing] = useState(false);
 const [haveToFollow, setHaveToFollow] = useState(false);
 const {mutateAsync:followUser}=useFollowUser()
 const {mutateAsync:unfollowUser}=useUnfollowUser()
  const { data: LoggedInUser } = useGetUserProfile(currentUser._id || "");

  useEffect(() => {
    setIsFollowing(user?.followers?.includes(currentUser._id));
    if (!user?.followers?.includes(currentUser._id) && LoggedInUser?.followers?.includes(user._id)) {
      setHaveToFollow(true)
    }else if (user?.followers?.includes(currentUser._id) && LoggedInUser?.followers?.includes(user._id)){
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
    <div className="group cursor-pointer overflow-hidden rounded-3xl border border-dark-4 bg-dark-2/80 shadow-xl transition hover:-translate-y-1 hover:border-primary-500/40 hover:bg-dark-2" onClick={viewProfile}>
      <div className="h-24 bg-gradient-to-br from-primary-500/35 via-dark-3 to-dark-4" />
      <div className="-mt-10 flex flex-col gap-4 p-4">
        <div className="flex w-full items-end justify-between gap-3">
          <div className="h-20 w-20 flex-none overflow-hidden rounded-full border-4 border-dark-2 bg-dark-4 ring-2 ring-white/10">
            <img
              src={user?.imageUrl || "/assets/images/default_user_image.png"}
              alt="creator"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex gap-2 pb-1">
            <span className="rounded-full bg-dark-3 px-3 py-1 text-light-2 tiny-medium">
              {user?.followers?.length || 0} followers
            </span>
          </div>
        </div>

        <div className="min-w-0">
          <p className="base-semibold line-clamp-1 text-light-1">{user?.name}</p>
          <p className="small-regular text-primary-500">@{user?.username}</p>
          {user?.location && (
            <p className="mt-3 flex items-center gap-2 text-light-3 small-regular">
              <MapPin size={15} />
              <span className="line-clamp-1">{user.location}</span>
            </p>
          )}
          <p className="mt-3 line-clamp-2 min-h-10 text-light-3 small-regular">
            {user?.bio || "Building their Postgram story."}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 rounded-2xl border border-dark-4 bg-dark-3/60 p-3 text-center">
          <span>
            <span className="block text-light-1 small-semibold">{user?.posts?.length || 0}</span>
            <span className="text-light-4 tiny-medium">Posts</span>
          </span>
          <span>
            <span className="block text-light-1 small-semibold">{user?.following?.length || 0}</span>
            <span className="text-light-4 tiny-medium">Following</span>
          </span>
        </div>

        <div className="flex w-full gap-2">
          {currentUser?._id!==user?._id&& <Button onClick={isFollowing ? handleUnfollow : handleFollow} className={isFollowing?"shad-button_dark_4 flex-1":"shad-button_primary flex-1"}>
            <UserPlus size={16} />
            {isFollowing ? 'Following' :haveToFollow?'Follow back' : 'Follow'}
          </Button>}
          <Button type="button" className="shad-button_dark_4 px-3" onClick={(event) => { event.stopPropagation(); navigate(`/message/${user?._id}`); }}>
            <MessageCircle size={17} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
