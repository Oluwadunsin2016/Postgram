// services/authService.ts

import axiosInstance from "@/lib/axiosInstance";
import { INewUser, IUpdateUser } from "@/types/Types";

export interface logInUser {
  email: string;
  password: string;
}

export interface SigninResponse {
  token: string;
}

export const signUp = async (userData: INewUser): Promise<string> => {
  try {
    const response = await axiosInstance.post('/api/user/signup', userData);
    return response.data.message; 
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Error signing up');
  }
};


export const signIn = async (userData: logInUser): Promise<SigninResponse> => {
  try {
    const response = await axiosInstance.post('/api/user/login', userData);
    localStorage.setItem('postgramToken', response.data.token); // Save token for future requests
    return response.data.token;
  } catch (error: any) {
    console.log(error.response?.data?.error);
    
    throw new Error(error.response?.data?.error || 'Error signing in');
  }
};

export const getUser = async () => {
  try {
    const response = await axiosInstance.get('/api/user/get-user');
    return response.data?.user;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Error getting user');
  }
};
export const getAllUsers = async () => {
  try {
    const response = await axiosInstance.get('/api/user/get-users');
    console.log(response);
    
    return response.data?.users;
  } catch (error: any) {
   
    throw new Error(error.response?.data?.error || 'Error getting users');
  }
};


export const getUserProfile= async (userId: string) => {
  try {
    const response = await axiosInstance.get(`/api/user/get-profile/${userId}`);
    
    return response.data?.user ;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Error getting user profile');
  }
};


export const changeProfilePhoto= async (file:File,userId: string) => {
  try {
    const formData = new FormData();
    formData.append('file', file); 
    const response = await axiosInstance.put(`/api/user/${userId}/profile-image`,formData,{ headers: {
        'Content-Type': 'multipart/form-data',
      },});
    console.log(response);
    return response.data ;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Error updating profile image');
  }
};


export const updateUser= async (user: IUpdateUser) => {
  try {
  const response = await axiosInstance.put('/api/user/update-user', user);
  console.log(response.data);
  
    return response.data; 
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Error updating user');
  }
};

export const followUser = async (userIdToFollow: string) => {
  return axiosInstance.post('/api/user/follow', { userIdToFollow });
};

export const unfollowUser = async (userIdToUnfollow: string) => {
  return axiosInstance.post('/api/user/unfollow', { userIdToUnfollow });
};



