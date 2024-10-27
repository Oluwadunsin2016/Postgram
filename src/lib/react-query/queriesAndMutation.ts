import {useQuery,useMutation,useQueryClient,useInfiniteQuery} from "@tanstack/react-query";
import { createPost, createUserAccount, deletePost, deleteSavedPost, getCurrentUser, getPostById, getRecentPosts, likePost, savePost, signInAccount, signOutAccount, updatePost,getInfinitePosts,searchPosts, getUsers, getSavedPosts, changeProfilePhoto, updateUserInfo, getUserPosts } from "../appwrite/api";
import { INewPost, INewUser, IUpdatePost, IUpdateUser, IUser } from "@/types";
import { QUERY_KEYS } from "./queryKeys";


export const useCreateUserAccount=()=>{
return useMutation({
mutationFn:(user:INewUser)=>createUserAccount(user)
})
}
export const useSignInAccount=()=>{
return useMutation({
mutationFn:async(user:{email:string,password:string})=>signInAccount(user)
})
}
export const useSignOutAccount=()=>{
return useMutation({
mutationFn:signOutAccount
})
}

export const useCreatePost=()=>{
const queryClient=useQueryClient()
return useMutation({
mutationFn:(post: INewPost) => createPost(post),
onSuccess:()=>{
queryClient.invalidateQueries({
queryKey:[QUERY_KEYS.GET_RECENT_POSTS]
})
}
})
}

export const useGetRecentPosts=()=>{
return useInfiniteQuery({
queryKey:[QUERY_KEYS.GET_RECENT_POSTS],
queryFn:getRecentPosts,
getNextPageParam:(lastPage)=>{
if(lastPage && lastPage.documents.length===0) return null;
const lastId =lastPage.documents[lastPage.documents.length-1].$id

return lastId
}
})
}

export const useLikePost=()=>{
const queryClient=useQueryClient()
return useMutation({
mutationFn:({postId,likesArray}:{postId:string,likesArray:string[]})=>likePost(postId,likesArray),
onSuccess:(data)=>{
queryClient.invalidateQueries({
queryKey:[QUERY_KEYS.GET_POST_BY_ID,data?.$id]
})
queryClient.invalidateQueries({
queryKey:[QUERY_KEYS.GET_RECENT_POSTS]
})
queryClient.invalidateQueries({
queryKey:[QUERY_KEYS.GET_POSTS]
})
queryClient.invalidateQueries({
queryKey:[QUERY_KEYS.GET_CURRENT_USER]
})
}
})
}

export const useSavedPost=()=>{
const queryClient=useQueryClient()
return useMutation({
mutationFn:({postId,userId}:{postId:string,userId:string})=>savePost(postId,userId),
onSuccess:()=>{
queryClient.invalidateQueries({
queryKey:[QUERY_KEYS.GET_RECENT_POSTS]
})
queryClient.invalidateQueries({
queryKey:[QUERY_KEYS.GET_POSTS]
})
queryClient.invalidateQueries({
queryKey:[QUERY_KEYS.GET_CURRENT_USER]
})
}
})
}
export const useDeleteSavedPost=()=>{
const queryClient=useQueryClient()
return useMutation({
mutationFn:(savedRecordId:string)=>deleteSavedPost(savedRecordId),
onSuccess:()=>{
queryClient.invalidateQueries({
queryKey:[QUERY_KEYS.GET_RECENT_POSTS]
})
queryClient.invalidateQueries({
queryKey:[QUERY_KEYS.GET_POSTS]
})
queryClient.invalidateQueries({
queryKey:[QUERY_KEYS.GET_CURRENT_USER]
})
}
})
}

export const useGetCurrentUser=()=>{
return useQuery({
queryKey:[QUERY_KEYS.GET_CURRENT_USER],
queryFn:getCurrentUser,
    staleTime: 5 * 60 * 1000, // Cache user data for 5 minutes
    refetchOnWindowFocus: false, // Optionally adjust to prevent refetch on focus
})
}

export const useGetPostById=(postId:string)=>{
return useQuery({
queryKey:[QUERY_KEYS.GET_POST_BY_ID],
queryFn:()=>getPostById(postId),
enabled:!!postId
})
}

export const useUpdatePost=()=>{
const queryClient=useQueryClient()
return useMutation({
mutationFn:(post:IUpdatePost)=>updatePost(post),
onSuccess:(data)=>{
queryClient.invalidateQueries({queryKey:[QUERY_KEYS.GET_POST_BY_ID,data?.$id]})
}
})
}
export const useDeletePost=()=>{
const queryClient=useQueryClient()
return useMutation({
mutationFn:({postId,imageId}:{postId:string,imageId:string})=>deletePost(postId,imageId),
onSuccess:()=>{
queryClient.invalidateQueries({queryKey:[QUERY_KEYS.GET_RECENT_POSTS]})
}
})
}

export const useGetPosts=()=>{
return useInfiniteQuery({
queryKey:[QUERY_KEYS.GET_INFINITE_POSTS],
queryFn: getInfinitePosts,
getNextPageParam:(lastPage)=>{
if(lastPage && lastPage.documents.length===0) return null;
const lastId =lastPage.documents[lastPage.documents.length-1].$id

return lastId
}
})
}
    
export const useSearchPosts=(searchTerm:string)=>{
  return useQuery({
    queryKey: [QUERY_KEYS.SEARCH_POSTS, searchTerm],
    queryFn: () => searchPosts(searchTerm),
    enabled: !!searchTerm,
  });
}

export const useGetUsers = (limit?: number) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_USERS],
    queryFn: ()=>getUsers(limit),
  });
};

export const useGetSavedPosts = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
    queryFn: getSavedPosts,
  });
};

export const useChangeProfilePhoto=()=>{
const queryClient=useQueryClient()
return useMutation({
mutationFn:({files,imageId,userId}:{files:File[],imageId:string,userId:string})=>changeProfilePhoto(files,imageId,userId),
onSuccess:()=>{
queryClient.invalidateQueries({queryKey:[QUERY_KEYS.GET_CURRENT_USER]})
}
})
}
export const useUpdateUser=()=>{
const queryClient=useQueryClient()
return useMutation({
mutationFn:(user:IUpdateUser)=>updateUserInfo(user),
onSuccess:()=>{
queryClient.invalidateQueries({queryKey:[QUERY_KEYS.GET_CURRENT_USER]})
}
})
}

export const useGetUserPosts = (userId: string) => {
  return useQuery({
   queryKey: [QUERY_KEYS.GET_USER_POSTS,userId],
    queryFn: () => getUserPosts(userId),
  });
};