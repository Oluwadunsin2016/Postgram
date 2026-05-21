export {
  useAddComment,
  useChangeProfilePhoto,
  useCreatePost,
  useCreateUser as useCreateUserAccount,
  useDeletePost,
  useGetAllPosts as useGetPosts,
  useGetAllUsers as useGetUsers,
  useGetPostDetails as useGetPostById,
  useGetUserProfile as useGetUserPosts,
  useGetUserProfile as useGetCurrentUser,
  useOpenDirectConversation,
  useSavePost as useSavedPost,
  useSearchPosts,
  useSignInUser as useSignInAccount,
  useToggleLike as useLikePost,
  useUpdatePost,
  useUpdateUser,
} from "./queries";

export const useSignOutAccount = () => ({
  mutate: () => {
    localStorage.removeItem("postgramToken");
    window.location.href = "/sign-in";
  },
});
