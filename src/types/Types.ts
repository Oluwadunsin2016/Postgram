import React from "react";

export type IcontextType={
user:IUser,
isLoading:boolean,
isAuthenticated:boolean,
internetError: string | null;
setInternetError: (msg: string | null) => void;   
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
  imageUrl?: string;
  name: string;
  username: string;
  bio: string;
  email: string;
  location?: string;
};

export type INewPost = {
  userId: string;
  caption?: string;
  file?: File | File[];
  files?: File[];
  location?: string;
  tags?: string;
  taggedUsers?: string[];
  repostOf?: string;
};

export type IUpdatePost = {
  postId: string;
  caption?: string;
  imageUrl?: URL | string;
  file?: File | File[];
  files?: File[];
  existingMedia?: { url: string; publicId?: string; type?: "image" | "video"; name?: string }[];
  location?: string;
  tags?: string;
  taggedUsers?: string[];
};

export type IUser = {
  _id: string;
  name: string;
  username: string;
  email: string;
  imageUrl: string;
  coverImageUrl?: string;
  imageId?: string;
  location?: string;
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
