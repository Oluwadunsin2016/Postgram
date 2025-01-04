import React from "react";

export type IcontextType={
user:IUser,
isLoading:boolean,
isAuthenticated:boolean,
setUser:React.Dispatch<React.SetStateAction<IUser>>,
setIsAuthenticated:React.Dispatch<React.SetStateAction<boolean>>,
checkAuthUser:()=>Promise<boolean>,
}

export type INavLink = {
  imgURL: string;
  route: string;
  label: string;
};

export type IUpdateUser = {
  imageUrl: string;
  name: string;
  username: string;
  bio: string;
  email: string;
};

export type INewPost = {
  userId: string;
  caption: string;
  file: File;
  location?: string;
  tags?: string;
};

export type IUpdatePost = {
  postId: string;
  caption: string;
  imageUrl: URL;
  file: File;
  location?: string;
  tags?: string;
};

export type IUser = {
  _id: string;
  name: string;
  username: string;
  email: string;
  imageUrl: string;
  imageId?: string;
  bio: string;
};

export type INewUser = {
  name: string;
  email: string;
  username: string;
  password: string;
};

export type Post = {
  _id: string;
  caption: string;
  location?: string;
  imageUrl?: string;
  creator?: {};
  likes: string[]; // Assuming likes is an array of user IDs
  // Add other fields in the post as needed
}

export type objectType={[key:string]:string | boolean | number|object|null|undefined}