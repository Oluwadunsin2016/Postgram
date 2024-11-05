import axiosInstance from "@/lib/axiosInstance";
import { INewPost, IUpdatePost } from "@/types/Types";

export const createPost = async (postData: INewPost): Promise<string> => {
  try {
  const tags = postData.tags?.replace(/ /g, "").split(",") || [];
   const formData = new FormData();
    formData.append('file', postData.file); 
    formData.append('userId', postData.userId); 
    formData.append('caption', postData.caption); 
    formData.append('location', postData.location??''); 
    formData.append('tags', tags); 
    const response = await axiosInstance.post('/api/post/create', formData);
    console.log(response);
    return response.data.message; 
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Error signing up');
  }
};
export const updatePost = async (postData: IUpdatePost): Promise<string> => {
  try {
  const tags = postData.tags?.replace(/ /g, "").split(",") || [];
   const formData = new FormData();
    formData.append('file', postData.file); 
    formData.append('caption', postData.caption); 
    formData.append('location', postData.location??''); 
    formData.append('tags', tags); 
    const response = await axiosInstance.put(`/api/post/update/${postData.postId}`, formData);
    console.log(response);
    return response.data.message; 
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Error signing up');
  }
};

export const getAllPosts = async ({ pageParam = 1 }) => {
  const response = await axiosInstance.get(`/api/post/get-posts`, {
    params: { page: pageParam, limit: 10 },
  });
  console.log(response);
  
  return response.data;
};

export const getPostDetails=async(postId:string)=>{
const response=await axiosInstance.get(`/api/post/details/${postId}`)
console.log(response);

return response.data;
}

export const deletePost=async(postId:string)=>{
const response=await axiosInstance.delete(`/api/post/delete/${postId}`)
console.log(response);

return response.data;
}

export const likePost=async(postId:string)=>{
const response=await axiosInstance.patch(`/api/post/like/${postId}`)
console.log(response);

return response.data;
}

export const savePost=async(postId:string)=>{
const response=await axiosInstance.patch(`/api/post/save-post/${postId}`)
console.log(response);

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