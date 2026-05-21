import { Button } from "@/components/ui/button";
import EditProfileModal from "@/components/ui/shared/EditProfileModal";
import ImageView from "@/components/ui/shared/ImageView";
import PostCard from "@/components/ui/shared/PostCard";
import { useUserContext } from "@/context/AuthContext";
import {
  useChangeCoverPhoto,
  useChangeProfilePhoto,
  useFollowUser,
  useGetUserProfile,
  useUnfollowUser,
} from "@/lib/react-query/queries";
import { Skeleton, Tab, Tabs } from "@nextui-org/react";
import { Bookmark, Camera, Image, MapPin, MessageCircle, Pencil, Tag, UserPlus } from "lucide-react";
import { ChangeEvent, MouseEvent, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";

const Stat = ({ value = 0, label }: { value?: number; label: string }) => (
  <li className="rounded-2xl border border-dark-4 bg-dark-3 px-4 py-3 text-center">
    <p className="body-bold text-primary-500">{value}</p>
    <p className="small-medium text-light-3">{label}</p>
  </li>
);

const EmptyPanel = ({ title, body }: { title: string; body: string }) => (
  <div className="content-panel flex min-h-60 w-full flex-col items-center justify-center rounded-2xl p-8 text-center">
    <p className="body-bold">{title}</p>
    <p className="mt-2 max-w-sm text-light-3 small-regular">{body}</p>
  </div>
);

const Profile = () => {
  const [selected, setSelected] = useState("Posts");
  const [isFollowing, setIsFollowing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const { id } = useParams();
  const profileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const { user: currentUser } = useUserContext();
  const { data: profile, isLoading } = useGetUserProfile(id || "");
  const { data: loggedInProfile } = useGetUserProfile(currentUser?._id || "");
  const { mutateAsync: followUser } = useFollowUser();
  const { mutateAsync: unfollowUser } = useUnfollowUser();
  const { mutateAsync: changeProfilePhoto } = useChangeProfilePhoto();
  const { mutateAsync: changeCoverPhoto, isLoading: isCoverUploading } = useChangeCoverPhoto();

  const isOwnProfile = profile?._id === currentUser?._id;
  const shouldFollowBack =
    !profile?.followers?.includes(currentUser?._id) &&
    loggedInProfile?.followers?.includes(profile?._id);

  useEffect(() => {
    setIsFollowing(!!profile?.followers?.includes(currentUser?._id));
  }, [currentUser?._id, profile?.followers]);

  const handleFollow = async (event: MouseEvent) => {
    event.stopPropagation();
    if (!profile?._id) return;

    if (isFollowing) {
      await unfollowUser(profile._id);
      setIsFollowing(false);
    } else {
      await followUser(profile._id);
      setIsFollowing(true);
    }
  };

  const selectProfilePhoto = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !profile?._id) return;
    await changeProfilePhoto({ file, userId: profile._id });
    event.target.value = "";
  };

  const selectCoverPhoto = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !profile?._id) return;
    await changeCoverPhoto({ file, userId: profile._id });
    event.target.value = "";
  };

  if (isLoading) {
    return (
      <div className="common-container">
        <div className="content-panel mx-auto flex w-full max-w-5xl gap-5 rounded-2xl p-5">
          <Skeleton className="h-24 w-24 flex-none rounded-full md:h-36 md:w-36" />
          <div className="flex flex-1 flex-col gap-4">
            <Skeleton className="h-7 w-1/2 rounded-lg" />
            <Skeleton className="h-4 w-1/3 rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="common-container gap-6">
      <ImageView setIsOpen={setIsOpen} isOpen={isOpen} imageUrl={profile?.imageUrl} />
      <EditProfileModal isOpen={isEditProfileOpen} onClose={() => setIsEditProfileOpen(false)} user={profile} />

      <section className="content-panel relative z-20 mx-auto w-full max-w-5xl flex-none overflow-hidden rounded-2xl">
        <input ref={profileInputRef} type="file" accept="image/*" className="hidden" onChange={selectProfilePhoto} />
        <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={selectCoverPhoto} />

        <div className="relative h-44 bg-gradient-to-r from-primary-600/50 via-primary-500/25 to-dark-3 md:h-72">
          {profile?.coverImageUrl && (
            <img src={profile.coverImageUrl} alt={`${profile?.name || "Profile"} cover`} className="h-full w-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />

          {isOwnProfile && (
            <>
              {/* <DropdownMenu>
                <DropdownMenuTrigger className="absolute left-5 top-5 grid h-12 w-12 place-items-center rounded-full bg-dark-3/80 text-white outline-none backdrop-blur-xl transition hover:bg-dark-3">
                  <MoreVertical size={24} />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="border border-white/10 bg-[#11131a] text-white">
                  <DropdownMenuItem className="cursor-pointer gap-2" onClick={() => coverInputRef.current?.click()}>
                    <Camera size={17} />
                    <span>Update cover photo</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu> */}

              <Button
                type="button"
                className="absolute right-5 top-5 hidden rounded-full text-sm bg-white/50 px-3 text-black hover:bg-white/90 transition-all duration-300 md:inline-flex"
                onClick={() => coverInputRef.current?.click()}
                disabled={isCoverUploading}
              >
                <Camera size={20} className="mr-1" />
                {isCoverUploading ? "Uploading..." : "Update Cover Photo"}
              </Button>
            </>
          )}
        </div>

        <div className="px-5 pb-7 md:px-8">
          <div className="-mt-14 flex flex-col gap-5 md:-mt-20 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col gap-4 md:flex-row md:items-end">
              <div className="relative h-28 w-28 md:h-40 md:w-40">
                <div className="group cursor-pointer h-full w-full overflow-hidden rounded-full border-4 border-dark-2 bg-dark-4 outline-none ring-2 ring-white/40">
                     <img
                     onClick={() => setIsOpen(true)}
                      src={profile?.imageUrl || "/assets/images/default_user_image.png"}
                      alt={profile?.name || "creator"}
                      className="h-full w-full object-cover object-top"
                    />
                </div>
                {/* <DropdownMenu>
                  <DropdownMenuTrigger className="group h-full w-full overflow-hidden rounded-full border-4 border-dark-2 bg-dark-4 outline-none ring-2 ring-white/40">
                    <img
                      src={profile?.imageUrl || "/assets/images/default_user_image.png"}
                      alt={profile?.name || "creator"}
                      className="h-full w-full object-cover object-top"
                    />
                    {isOwnProfile && (
                      <span className="absolute inset-0 grid place-items-center bg-black/35 opacity-0 transition group-hover:opacity-100">
                        <Camera size={28} />
                      </span>
                    )}
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="border border-white/10 bg-[#11131a] text-white">
                    <DropdownMenuItem className="cursor-pointer" onClick={() => setIsOpen(true)}>View image</DropdownMenuItem>
                    {isOwnProfile && (
                      <DropdownMenuItem className="cursor-pointer" onClick={() => profileInputRef.current?.click()}>
                        {isPhotoUploading ? "Uploading..." : "Update image"}
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu> */}
                {/* {isOwnProfile && (
                  <span className="absolute right-1 top-3 grid h-8 w-8 place-items-center rounded-full border-4 border-dark-2 bg-green-500 text-white">
                    <Check size={17} strokeWidth={4} />
                  </span>
                )} */}
                {isOwnProfile && (
                  <button
                    type="button"
                    className="absolute bottom-3 right-1 grid h-10 w-10 place-items-center rounded-full border-2 border-dark-2 bg-black/55 text-white backdrop-blur"
                    onClick={() => profileInputRef.current?.click()}
                    aria-label="Update profile image"
                  >
                    <Camera size={20} />
                  </button>
                )}
              </div>

              <div className="pb-1">
                <h1 className="h2-bold">{profile?.name}</h1>
                <p className="mt-1 text-primary-500">@{profile?.username}</p>
                {profile?.location && (
                  <div className="mt-5 flex items-center gap-2 text-light-3">
                    <MapPin size={20} />
                    <span>{profile.location}</span>
                  </div>
                )}
              </div>
            </div>

            {isOwnProfile ? (
              <Button type="button" onClick={() => setIsEditProfileOpen(true)} className="shad-button_dark_4 inline-flex items-center justify-center rounded-full px-6">
                <Pencil size={17} />
                <span>Edit Profile</span>
              </Button>
            ) : (
              <div className="flex gap-3">
                <Button onClick={handleFollow} className={isFollowing ? "shad-button_dark_4" : "shad-button_primary"}>
                  <UserPlus size={17} />
                  {isFollowing ? "Following" : shouldFollowBack ? "Follow back" : "Follow"}
                </Button>
                <Link to={`/message/${profile?._id}`} className="shad-button_dark_4 inline-flex items-center justify-center">
                  <MessageCircle size={17} />
                  <span>Message</span>
                </Link>
              </div>
            )}
          </div>

          <ul className="mt-6 grid grid-cols-3 gap-3 md:max-w-md">
            <Stat value={profile?.posts?.length || 0} label="Posts" />
            <Stat value={profile?.followers?.length || 0} label="Followers" />
            <Stat value={profile?.following?.length || 0} label="Following" />
          </ul>

          <div className="mt-6 border-t border-white/10 pt-6">
            <p className="max-w-2xl whitespace-pre-line text-light-2">
              {profile?.bio || "No biography yet."}
            </p>
          </div>
        </div>
      </section>

      {/* <section className="relative z-10 mx-auto w-full max-w-5xl flex-none">
        {showScrollLeft && (
          <button
            type="button"
            onClick={() => scrollCreators("left")}
            className="absolute left-0 top-1/2 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-dark-4 bg-dark-3 text-light-1 shadow-lg"
          >
            <ChevronLeft size={18} />
          </button>
        )}

        {isUsersLoading ? (
          <div className="content-panel flex gap-4 overflow-hidden rounded-2xl p-4">
            {Array(8)
              .fill("creator")
              .map((_, index) => (
                <Skeleton key={index} className="h-14 w-14 flex-none rounded-full md:h-16 md:w-16" />
              ))}
          </div>
        ) : (
          <div
            ref={containerRef}
            className="content-panel flex gap-4 overflow-x-auto rounded-2xl p-4 scrollbar-hide"
          >
            {users?.map((creator: any) => (
              <Link
                to={`/profile/${creator._id}`}
                key={creator._id}
                className="flex w-20 flex-none flex-col items-center gap-2 text-center"
              >
                <span className="h-14 w-14 overflow-hidden rounded-full border-2 border-primary-500/70 bg-dark-4 md:h-16 md:w-16">
                  <img
                    src={creator?.imageUrl || "/assets/images/default_user_image.png"}
                    alt={creator?.name || "creator"}
                    className="h-full w-full object-cover"
                  />
                </span>
                <span className="line-clamp-1 w-full text-xs font-medium text-light-2">{creator?.name}</span>
              </Link>
            ))}
          </div>
        )}

        {showScrollRight && (
          <button
            type="button"
            onClick={() => scrollCreators("right")}
            className="absolute right-0 top-1/2 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-dark-4 bg-dark-3 text-light-1 shadow-lg"
          >
            <ChevronRight size={18} />
          </button>
        )}
      </section> */}

      <section className="relative z-0 mx-auto w-full max-w-5xl flex-none">
        <div className="mb-5 flex items-center justify-between">
          <Tabs
            aria-label="profile sections"
            selectedKey={selected}
            onSelectionChange={(key) => setSelected(String(key))}
            classNames={{
              tabList: "bg-dark-3",
              cursor: "bg-primary-600",
              tabContent: "text-light-3 group-data-[selected=true]:text-white",
            }}
          >
            <Tab
              key="Posts"
              title={
                <div className="flex items-center gap-2 px-2">
                  <Image size={18} />
                  <span className={selected === "Posts" ? "text-white" : "text-light-3"}>Posts</span>
                </div>
              }
            />
            <Tab
              key="Saved"
              title={
                <div className="flex items-center gap-2 px-2">
                  <Bookmark size={18} />
                  <span className={selected === "Saved" ? "text-white" : "text-light-3"}>Saved</span>
                </div>
              }
            />
            <Tab
              key="Tagged"
              title={
                <div className="flex items-center gap-2 px-2">
                  <Tag size={18} />
                  <span className={selected === "Tagged" ? "text-white" : "text-light-3"}>Tagged</span>
                </div>
              }
            />
          </Tabs>

          <div className="hidden items-center gap-2 rounded-xl bg-dark-3 px-4 py-2 text-light-2 md:flex">
            <span className="small-medium">All</span>
          </div>
        </div>

        {selected === "Posts" ? (
          profile?.posts?.length > 0 ? (
            <div className="mx-auto flex w-full max-w-3xl flex-col">
              {profile.posts.map((post: any) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          ) : (
            <EmptyPanel title="No posts yet" body="Posts from this creator will appear here." />
          )
        ) : selected === "Saved" ? (
          profile?.saves?.length > 0 ? (
            <div className="mx-auto flex w-full max-w-3xl flex-col">
              {profile.saves.map((post: any) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          ) : (
            <EmptyPanel title="No saved posts yet" body="Posts saved by this creator will appear here." />
          )
        ) : profile?.taggedPosts?.length > 0 ? (
          <div className="mx-auto flex w-full max-w-3xl flex-col">
            {profile.taggedPosts.map((post: any) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        ) : (
          <EmptyPanel title="No tagged posts" body="Posts this creator is tagged in will appear here." />
        )}
      </section>
    </div>
  );
};

export default Profile;
