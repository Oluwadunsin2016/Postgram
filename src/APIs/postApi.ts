import axiosInstance from "@/lib/axiosInstance";
import { INewPost, IUpdatePost } from "@/types/Types";

export const createPost = async (postData: INewPost): Promise<string> => {
  try {
  const tags = postData.tags?.replace(/ /g, "").split(",").filter(Boolean).join(",") || "";
   const formData = new FormData();
    const files = postData.files || (postData.file ? (Array.isArray(postData.file) ? postData.file : [postData.file]) : []);
    files.forEach((file) => formData.append('files', file));
    formData.append('userId', postData.userId); 
    formData.append('caption', postData.caption || ''); 
    formData.append('location', postData.location??''); 
    formData.append('tags', tags); 
    formData.append('taggedUsers', JSON.stringify(postData.taggedUsers || [])); 
    if (postData.repostOf) formData.append('repostOf', postData.repostOf);
    const response = await axiosInstance.post('/api/post/create', formData);
    return response.data.message; 
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Error signing up');
  }
};
export const updatePost = async (postData: IUpdatePost): Promise<string> => {
  try {
  const tags = postData.tags?.replace(/ /g, "").split(",").filter(Boolean).join(",") || "";
   const formData = new FormData();
    const files = postData.files || (postData.file ? (Array.isArray(postData.file) ? postData.file : [postData.file]) : []);
    files.forEach((file) => formData.append('files', file));
    if (postData.existingMedia) formData.append('existingMedia', JSON.stringify(postData.existingMedia));
    formData.append('caption', postData.caption || ''); 
    formData.append('location', postData.location??''); 
    formData.append('tags', tags); 
    formData.append('taggedUsers', JSON.stringify(postData.taggedUsers || [])); 
    const response = await axiosInstance.put(`/api/post/update/${postData.postId}`, formData);
    return response.data.message; 
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Error signing up');
  }
};

export const getAllPosts = async ({ pageParam = 1 }) => {
  const response = await axiosInstance.get(`/api/post/get-posts`, {
    params: { page: pageParam, limit: 10 },
  });
  
  return response.data;
};

export const getPostDetails=async(postId:string)=>{
const response=await axiosInstance.get(`/api/post/details/${postId}`)

return response.data;
}

export const deletePost=async(postId:string)=>{
const response=await axiosInstance.delete(`/api/post/delete/${postId}`)

return response.data;
}

export const likePost=async(postId:string)=>{
const response=await axiosInstance.patch(`/api/post/like/${postId}`)

return response.data;
}

export const savePost=async(postId:string)=>{
const response=await axiosInstance.patch(`/api/post/save-post/${postId}`)

return response.data;
}

export const repostPost=async({postId, caption = ""}:{postId:string; caption?:string})=>{
const response=await axiosInstance.post(`/api/post/${postId}/repost`, { caption })

return response.data;
}


export const searchPosts = async (searchTerm:any) => {
  try {
    const response = await axiosInstance.get(`/api/post/search?term=${encodeURIComponent(searchTerm)}`);
    return response.data;
  } catch (error) {
    console.error('Error searching posts:', error);
    return [];
  }
};

export const addComment = async (payload:any) => {
  try {
    const response = await axiosInstance.post(`/api/post/add-comment`,payload); 
    return response.data;
  } catch (error) {
    console.error('Error adding comment:', error);
    return [];
  }
};

export const likeComment = async (commentId:string) => {
  const response = await axiosInstance.patch(`/api/post/comments/${commentId}/like`);
  return response.data;
};

export const updateComment = async ({ commentId, text }:{commentId:string; text:string}) => {
  const response = await axiosInstance.patch(`/api/post/comments/${commentId}`, { text });
  return response.data;
};

export const deleteComment = async (commentId:string) => {
  const response = await axiosInstance.delete(`/api/post/comments/${commentId}`);
  return response.data;
};
