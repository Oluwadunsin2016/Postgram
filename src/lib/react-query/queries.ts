import { changeProfilePhoto, followUser, getAllUsers, getUser, getUserProfile, signIn, signUp, unfollowUser, updateUser } from "@/APIs/userApi"
import { INewPost, INewUser, IUpdatePost, Post } from "@/types/Types"
import { useInfiniteQuery, useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query"
import { QUERY_KEYS } from "./queryKeys"
import { IUpdateUser } from "@/types/Types"
import { createPost, deletePost, getAllPosts, getPostDetails, likePost, savePost, searchPosts, updatePost } from "@/APIs/postApi"



export const useCreateUser=()=>{
return useMutation({
mutationFn:(user:INewUser)=>signUp(user)
})
}
export const useSignInUser=()=>{
return useMutation({
mutationFn:async(user:{email:string,password:string})=>signIn(user)
})
}
export const useUpdateUser=()=>{
const queryClient=useQueryClient()
return useMutation({
mutationFn:(user:IUpdateUser)=>updateUser(user),
onSuccess:()=>{
queryClient.invalidateQueries({queryKey:[QUERY_KEYS.GET_CURRENT_USER]})
}
})
}

export const useGetCurrentUser=()=>{
return useQuery({
queryKey:[QUERY_KEYS.GET_CURRENT_USER],
queryFn:getUser
})
}

export const useGetUserProfile = (userId: string) => {
  return useQuery({
   queryKey: ['getProfileUser',userId],
    queryFn: () => getUserProfile(userId),
  });
};

export const useChangeProfilePhoto=()=>{
const queryClient=useQueryClient()
return useMutation({
mutationFn:({file,userId}:{file:File,userId:string})=>changeProfilePhoto(file,userId),
onSuccess:()=>{
queryClient.invalidateQueries({queryKey:[QUERY_KEYS.GET_CURRENT_USER]})
}
})
}

export const useGetAllUsers = () => {
  return useQuery( {
   queryKey: ['all-users'],
    queryFn: () => getAllUsers(),
  });
};

export const useFollowUser = () => {
const queryClient=useQueryClient()
  return useMutation(
    {
    mutationFn: async (userIdToFollow:string) =>await followUser(userIdToFollow),
     onSuccess:(data)=>{
queryClient.invalidateQueries({queryKey:['all-users']})
}
    }
  );
};
export const useUnfollowUser = () => {
const queryClient=useQueryClient()
  return useMutation(
    {
    mutationFn: async (userIdToUnfollow:string) =>await unfollowUser(userIdToUnfollow),
     onSuccess:(data)=>{
queryClient.invalidateQueries({queryKey:['all-users']})
}
    }
  );
};


// Posts
export const useCreatePost=()=>{
const queryClient=useQueryClient()
return useMutation({
mutationFn:(post: INewPost) => createPost(post),
onSuccess:()=>{
queryClient.invalidateQueries({
queryKey:['all-posts']
})
}
})
}

export const useUpdatePost=()=>{
// const queryClient=useQueryClient()
return useMutation({
mutationFn:(post:IUpdatePost)=>updatePost(post),
// onSuccess:(data)=>{
// queryClient.invalidateQueries({queryKey:[QUERY_KEYS.GET_POST_BY_ID,data?._id]})
// }
})
}


export const useGetPostDetails = (postId:string) => {
  return useQuery( {
   queryKey: ['getSinglePost',postId],
    queryFn: () => getPostDetails(postId),
  });
};


export const useGetAllPosts = () => {
  return useInfiniteQuery(['all-posts'], getAllPosts, {
    getNextPageParam: (lastPage:any, allPages) => {
      // Check if there are more pages to fetch
      return lastPage.hasMore ? allPages.length + 1 : undefined;
    },
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId:string) => deletePost(postId),
    onSettled: () => {
      queryClient.invalidateQueries(["all-posts"]);
      queryClient.invalidateQueries(["savedPosts"]);
    },
  });
};

export const useToggleLike = () => {
  return useMutation(
    {
    mutationFn: async (postId:string) =>await likePost(postId),
    }
  );
};
export const useSavePost = () => {
const queryClient=useQueryClient()
  return useMutation(
    {
    mutationFn: async (postId:string) =>await savePost(postId),
     onSuccess:(data)=>{
queryClient.invalidateQueries({queryKey:['all-posts']})
queryClient.invalidateQueries({queryKey:['getSinglePost',data?._id]})
}
    }
  );
};

export const useSearchPosts=(searchTerm:string)=>{
  return useQuery({
    queryKey: ['searchPost', searchTerm],
    queryFn: () => searchPosts(searchTerm),
    enabled: !!searchTerm,
  });
}
