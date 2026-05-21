import { changeCoverPhoto, changePassword, changeProfilePhoto, followUser, forgotPassword, getAllUsers, getAvailableUsers, getUserProfile, handleOpenMessage, resetPassword, signIn, signUp, unfollowUser, updateUser } from "@/APIs/userApi"
import { INewPost, INewUser, IUpdatePost, objectType } from "@/types/Types"
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { IUpdateUser } from "@/types/Types"
import { addComment, createPost, deleteComment, deletePost, getAllPosts, getPostDetails, likeComment, likePost, repostPost, savePost, searchPosts, updateComment, updatePost } from "@/APIs/postApi"
import { deleteMessage, editMessage, forwardMessage, getConversations, getMessages, markConversationRead, openDirectConversation, sendMessage, sendStatusReply, toggleMessagePin, toggleMessageReaction } from "@/APIs/chatApi"
import { createStatus, deleteStatus, getStatuses, markStatusViewed, NewStatusPayload } from "@/APIs/statusApi"
import { getNotificationUnreadCount, getNotifications, markAllNotificationsRead, markNotificationRead } from "@/APIs/notificationApi"



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

export const useForgotPassword=()=>{
return useMutation({
mutationFn:async(email:string)=>forgotPassword(email)
})
}

export const useResetPassword=()=>{
return useMutation({
mutationFn:async(payload:{token:string; password:string})=>resetPassword(payload)
})
}

export const useChangePassword=()=>{
return useMutation({
mutationFn:async(payload:{currentPassword:string; newPassword:string})=>changePassword(payload)
})
}

export const useGetUserProfile = (userId: string) => {
  return useQuery({
   queryKey: ['getProfileUser',userId],
    queryFn: () => getUserProfile(userId),
    enabled: !!userId,
  });
};

export const useChangeProfilePhoto=()=>{
const queryClient=useQueryClient()
return useMutation({
mutationFn:({file,userId}:{file:File,userId:string})=>changeProfilePhoto(file,userId),
onSuccess:(data)=>{
queryClient.invalidateQueries({queryKey:['getProfileUser',data?.user._id]})
}
})
}

export const useChangeCoverPhoto=()=>{
const queryClient=useQueryClient()
return useMutation({
mutationFn:({file,userId}:{file:File,userId:string})=>changeCoverPhoto(file,userId),
onSuccess:(data)=>{
queryClient.invalidateQueries({queryKey:['getProfileUser',data?.user._id]})
}
})
}

export const useUpdateUser=()=>{
const queryClient=useQueryClient()
return useMutation({
mutationFn:(user:IUpdateUser)=>updateUser(user),
onSuccess:(data)=>{
queryClient.invalidateQueries({queryKey:['getProfileUser',data?.user._id]})
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
     onSuccess:()=>{
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
     onSuccess:()=>{
queryClient.invalidateQueries({queryKey:['all-users']})
}
    }
  );
};


export const useOpenMessage=()=>{
return useMutation({
mutationFn:async(payload:{user:objectType,creator:objectType})=>handleOpenMessage(payload)
})
}

export const useGetAvailableUsers = (userId?: string) => {
  return useQuery({
    queryKey: ['getAvailableUsers', userId],
    queryFn: async () => {
     if (!userId) {
        throw new Error("userId is required to fetch available users.");
      }
      return getAvailableUsers(userId);
    },
    enabled: !!userId,
  });
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
const queryClient=useQueryClient()
return useMutation({
mutationFn:(post:IUpdatePost)=>updatePost(post),
onSuccess:(_data, variables)=>{
queryClient.invalidateQueries({queryKey:['all-posts']})
queryClient.invalidateQueries({queryKey:['getSinglePost',variables.postId]})
}
})
}


export const useGetPostDetails = (postId:string) => {
  return useQuery( {
   queryKey: ['getSinglePost',postId],
    queryFn: () => getPostDetails(postId),
    enabled: !!postId,
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
const queryClient=useQueryClient()
  return useMutation(
    {
    mutationFn: async (postId:string) =>await likePost(postId),
    onSuccess: (_data, postId) => {
      queryClient.invalidateQueries({queryKey:['all-posts']})
      queryClient.invalidateQueries({queryKey:['getSinglePost',postId]})
    }
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
queryClient.invalidateQueries({queryKey:['getProfileUser',data?.user?._id]})
}
    }
  );
};

export const useRepostPost = () => {
const queryClient=useQueryClient()
  return useMutation(
    {
    mutationFn: async (payload:{postId:string; caption?:string}) =>await repostPost(payload),
     onSuccess:(data, variables)=>{
queryClient.invalidateQueries({queryKey:['all-posts']})
queryClient.invalidateQueries({queryKey:['getSinglePost',variables.postId]})
queryClient.invalidateQueries({queryKey:['getProfileUser',data?.post?.creator?._id]})
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


export const useAddComment = () => {
const queryClient=useQueryClient()
  return useMutation(
    {
    mutationFn: async (payload:{postId:string,text:string,parentId?:string}) =>await addComment(payload),
     onSuccess:(data)=>{
     queryClient.invalidateQueries({queryKey:['all-posts']})
queryClient.invalidateQueries({queryKey:['getSinglePost',data?.comment?.post]})
}
    }
  );
};

export const useToggleCommentLike = () => {
const queryClient=useQueryClient()
  return useMutation(
    {
    mutationFn: async ({commentId}:{commentId:string; postId:string}) =>await likeComment(commentId),
     onSuccess:(_data, variables)=>{
queryClient.invalidateQueries({queryKey:['getSinglePost',variables.postId]})
}
    }
  );
};

export const useUpdateComment = () => {
const queryClient=useQueryClient()
  return useMutation(
    {
    mutationFn: async ({commentId,text}:{commentId:string; postId:string; text:string}) =>await updateComment({ commentId, text }),
     onSuccess:(_data, variables)=>{
queryClient.invalidateQueries({queryKey:['getSinglePost',variables.postId]})
}
    }
  );
};

export const useDeleteComment = () => {
const queryClient=useQueryClient()
  return useMutation(
    {
    mutationFn: async ({commentId}:{commentId:string; postId:string}) =>await deleteComment(commentId),
     onSuccess:(_data, variables)=>{
queryClient.invalidateQueries({queryKey:['all-posts']})
queryClient.invalidateQueries({queryKey:['getSinglePost',variables.postId]})
}
    }
  );
};

export const useGetNotifications = () => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
  });
};

export const useGetNotificationUnreadCount = () => {
  return useQuery({
    queryKey: ['notifications-unread-count'],
    queryFn: getNotificationUnreadCount,
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });
};

export const useGetConversations = () => {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: getConversations,
  });
};

export const useOpenDirectConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: openDirectConversation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
};

export const useGetMessages = (conversationId?: string) => {
  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => getMessages(conversationId || ''),
    enabled: !!conversationId,
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendMessage,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
};

export const useSendStatusReply = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendStatusReply,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
};

export const useEditMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: editMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
};

export const useDeleteMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
};

export const useToggleMessageReaction = () => {
  return useMutation({
    mutationFn: toggleMessageReaction,
  });
};

export const useToggleMessagePin = () => {
  return useMutation({
    mutationFn: toggleMessagePin,
  });
};

export const useForwardMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: forwardMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
};

export const useMarkConversationRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markConversationRead,
    onSuccess: (_data, conversationId) => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
};

export const useGetStatuses = () => {
  return useQuery({
    queryKey: ['statuses'],
    queryFn: getStatuses,
  });
};

export const useCreateStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: NewStatusPayload) => createStatus(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['statuses'] });
    },
  });
};

export const useDeleteStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (statusId: string) => deleteStatus(statusId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['statuses'] });
    },
  });
};

export const useMarkStatusViewed = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (statusId: string) => markStatusViewed(statusId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['statuses'] });
    },
  });
};
