// services/authService.ts

import axiosInstance from "@/lib/axiosInstance";
import { INewUser, IUpdateUser, objectType } from "@/types/Types";

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
    
    throw new Error(error.response?.data?.error || 'Error signing in');
  }
};

export const forgotPassword = async (email: string) => {
  try {
    const response = await axiosInstance.post('/api/user/forgot-password', { email });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Error requesting password reset');
  }
};

export const resetPassword = async ({ token, password }: { token: string; password: string }) => {
  try {
    const response = await axiosInstance.patch(`/api/user/reset-password/${token}`, { password });
    localStorage.setItem('postgramToken', response.data.token);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Error resetting password');
  }
};

export const changePassword = async (payload: { currentPassword: string; newPassword: string }) => {
  try {
    const response = await axiosInstance.patch('/api/user/change-password', payload);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Error changing password');
  }
};

export const getUser = async () => {
  try {
    const response = await axiosInstance.get('/api/user/get-user');
    return response.data?.user;
  } catch (error: any) {
    if (!error.response || error.message === 'Network Error') {
      throw new Error('network');
    }

    if ([401, 403].includes(error.response?.status)) {
      throw new Error('unauthenticated');
    }

    throw new Error('other');
  }
};

export const getAllUsers = async () => {
  try {
    const response = await axiosInstance.get('/api/user/get-users');
    
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
    return response.data ;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Error updating profile image');
  }
};

export const changeCoverPhoto= async (file:File,userId: string) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axiosInstance.put(`/api/user/${userId}/cover-image`,formData,{ headers: {
        'Content-Type': 'multipart/form-data',
      },});
    return response.data ;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Error updating cover image');
  }
};


export const updateUser= async (user: IUpdateUser) => {
  try {
  const response = await axiosInstance.put('/api/user/update-user', user);
  
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

export const getToken = async (userId:string|number) => {
  try {
   const response= await axiosInstance.get(`api/user/get-token/${userId}`,)
    return response.data;
  } catch (error) {
    console.error("Error fetching token:", error);
    return null;
  }
};

export const getAvailableUsers = async (userId:string|number) => {
  try {
   const response= await axiosInstance.get(`api/user/getAvailableUsers?currentUserId=${userId}`)
    return response.data;
  } catch (error) {
    console.error("Error fetching token:", error);
    return null;
  }
};

export const handleOpenMessage=async(payload:{user:objectType,creator:objectType})=>{
  try {
    const response = await axiosInstance.post('/api/user/open-message', payload);
    return response;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Error opening conversation');
  }
};
