import { INewPost, INewUser, IUpdatePost, IUpdateUser, IUser } from "@/types";
import { account, avatars, databases, storage } from "./config";
import { ID, Query } from "appwrite";
import { appwriteConfig } from "./config";

export async function createUserAccount(user: INewUser) {
  try {
    const newAccount = await account.create(
      ID.unique(),
      user.email,
      user.password,
      user.name
    );
    if (!newAccount) throw Error;
    const avatarUrl = avatars.getInitials(user.name);
    const newUser = await saveUserToDB({
      accountId: newAccount.$id,
      name: newAccount.name,
      email: newAccount.email,
      username: user.username,
      imageUrl: avatarUrl,
    });
    return newUser;
  } catch (error) {
    console.log(error);
    return error;
  }
}

export async function saveUserToDB(user: {
  accountId: string;
  email: string;
  name: string;
  imageUrl: URL;
  username?: string;
}) {
  try {
    const newUser = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      ID.unique(),
      user
    );
    return newUser;
  } catch (err) {
    console.log(err);
  }
}

// export const signInAccount=async(user:{email:string,password:string})=>{
// // try {

// //     const session=account.get()
// //     console.log(session);

// //     return session;

// //         // const session=account.createEmailPasswordSession(user.email,user.password)
// //         // return session; // Return the new session created
// // } catch (err) {
// // console.log(err);

// //     //   if (err.code === 401) {
// //     //   // If no active session, proceed to log in
// //     //   try {
// //     //     const session=account.createEmailPasswordSession(user.email,user.password)
// //     //     return session; // Return the new session created
// //     //   } catch (loginError) {
// //     //     console.error('Failed to log in', loginError);
// //     //     throw new Error('Login failed'); // Make sure we return a rejected Promise in case of failure
// //     //   }
// //     // } else {
// //     //   console.error('Unexpected error', err);
// //     //   throw new Error('Unexpected error occurred'); // Also return a rejected Promise for unexpected errors
// //     // }

// // }

// // try {
// // const session=account.get()
// // if ((await session).$createdAt) {
// // await account.deleteSession('current')
// // }
// // } catch (error) {
// //     console.log(error)
// // }

// //   // Now proceed to log in
// //   try {
// //     const newSession = await account.createEmailPasswordSession(user.email, user.password);
// //     console.log('User successfully logged in');
// //     return newSession;
// //   } catch (loginError) {
// //     console.error('Login failed:', loginError);
// //     throw new Error('Failed to log in');
// //   }

// try {
//   const session = await account.createEmailPasswordSession(user.email, user.password);
//   console.log('Successfully logged in', session);
//   return session;
// } catch (error) {
//   console.error('Login failed', error);
//   throw error;
// }
// }

// export async function signInAccount(user: { email: string; password: string }) {
//   console.log(user);
//   try {
//     //   await account.deleteSession('current');
//     // const currentSession = await account.getSession("current");
//     // if (currentSession) {
//     //   await account.deleteSession("current");
//     // }
//     const session = await account.createEmailSession(user.email, user.password);

//     return session;
//   } catch (error) {
//     console.log(error);
//   }
// }

// export async function signInAccount(user: { email: string; password: string }) {
//   console.log(user);
//   try {
//     // Check for an active session
//     let currentSession;
//     try {
//       currentSession = await account.getSession("current");
//     } catch (error) {
//       // If no session exists, ignore the error and proceed
//       if (error.code !== 404) {
//         throw error;
//       }
//     }

//     // Delete the current session if one exists
//     if (currentSession) {
//       await account.deleteSession("current");
//     }

//     // Create a new session with the provided email and password
//     const session = await account.createEmailSession(user.email, user.password);

//     return session;
//   } catch (error) {
//     console.log(error);
//   }
// }


// export async function signInAccount(user: { email: string; password: string }) {
//   console.log(user);
//   try {
//     // Check for any existing session
//     try {
//       const currentSession = await account.getSession("current");
//       if (currentSession) {
//         // Delete the existing session if it exists
//         await account.deleteSession("current");
//       }
//     } catch (error:any) {
//       // Ignore if no session exists (no need to delete)
//       if (error.code !== 404) {
//         // Only log if it's not a "session not found" error
//         console.log("Error retrieving session:", error);
//       }
//     }

//     // Create a new session
//     const session = await account.createEmailSession(user.email, user.password);
//     return session;

//   } catch (error:any) {
//     console.log("Sign-in error:", error);
//     // Check error type for more specific handling in the UI if needed
//     if (error.code === 401 && error.type === "user_session_already_exists") {
//       console.log("An active session exists, please try again or refresh.");
//     } else if (error.code === 401 && error.type === "general_unauthorized_scope") {
//       console.log("Unauthorized scope. Ensure user permissions are set.");
//     }
//   }
// }


export async function signInAccount(user: { email: string; password: string }) {
  console.log("Attempting login for user:", user.email);

  try {
    // Step 1: Attempt to delete any existing session.
    try {
      const currentSession = await account.getSession("current");
      console.log("Current session found:", currentSession);
      await account.deleteSession("current");
      console.log("Existing session deleted successfully.");
    } catch (sessionError) {
      console.log("No active session to delete, or error deleting session:", sessionError);
    }

    // Step 2: Attempt to create a new session.
    const session = await account.createEmailSession(user.email, user.password);
    console.log("Session created successfully:", session);

    return session;
  } catch (error) {
    console.error("Login error details:", error);
    throw error;
  }
}

// export async function signInAccount(user: { email: string; password: string }) {
//   try {
//     const session = await account.createEmailSession(user.email, user.password);

//     return session;
//   } catch (error) {
//     console.log(error);
//   }
// }



// ============================== GET ACCOUNT
export async function getAccount() {
  try {
    const currentAccount = await account.get();

    return currentAccount;
  } catch (error) {
    console.log(error);
  }
}

export const signOutAccount = async () => {
  try {
    const session = await account.deleteSession("current");
    return session;
  } catch (error) {
    console.log(error);
  }
};

// export const getCurrentUser = async () => {
//   try {
//     const currentAccount = await account.get();
//     if (!currentAccount) {
//       throw new Error("User session not found.");
//     };

//     console.log(currentAccount);
//     const currentUser = await databases.getDocument(
//       appwriteConfig.databaseId,
//       appwriteConfig.userCollectionId,
//       currentAccount.$id
//     );
//     // const currentUser = await databases.listDocuments(
//     //   appwriteConfig.databaseId,
//     //   appwriteConfig.userCollectionId,
//     //   [Query.equal("accountId", currentAccount.$id)]
//     // );

//     if (!currentUser) {
//       throw new Error("User document not found.");
//     };

//     return currentUser;
//   } catch (error:any) {
//    console.log("Error fetching user:", error.message || error);
//     return null; // Return null to prevent 'undefined' error
//   }
// };


export const getCurrentUser = async () => {
  try {
    const currentAccount = await account.get();

    if (!currentAccount) {
      throw new Error("User session not found.");
    }

    // Attempt to retrieve the document
    const currentUser = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );

    console.log("User document:", currentUser);
    return currentUser.documents[0];
  } catch (error:any) {
    if (error.code === 404) {
      console.error("Document not found for user ID:", error);
      return null; // Ensure null is returned instead of undefined
    }
    console.error("Error fetching user:", error);
    throw error; // Re-throw if it's a different type of error
  }
};


export const createPost = async (post: INewPost) => {
  try {
    // upload image to storage
    const uploadedFile = await uploadFile(post.file[0]);
    if (!uploadedFile) throw Error;

    // Get file url
    const fileUrl = getFilePreview(uploadedFile.$id);
    if (!fileUrl) {
      deleteFile(uploadedFile.$id);
      throw Error;
    }

    // convert tags into an array
    const tags = post.tags?.replace(/ /g, "").split(",") || [];

    // save the new post to database
    const newPost = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      ID.unique(),
      {
        creator: post.userId,
        caption: post.caption,
        imageUrl: fileUrl,
        imageId: uploadedFile.$id,
        location: post.location,
        tags: tags,
      }
    );

    if (!newPost) {
      deleteFile(uploadedFile.$id);
      throw Error;
    }

    return newPost;
  } catch (error) {
    console.log(error);
  }
};

export const uploadFile = async (file: File) => {
  try {
    const uploadedFile = await storage.createFile(
      appwriteConfig.storageId,
      ID.unique(),
      file
    );

    return uploadedFile;
  } catch (error) {
    console.log(error);
  }
};

export const getFilePreview = (fileId: string) => {
  try {
    const fileUrl = storage.getFilePreview(
      appwriteConfig.storageId,
      fileId,
      2000,
      2000,
      "top",
      100
    );

    return fileUrl;
  } catch (error) {
    console.log(error);
  }
};

export const deleteFile = async (fileId: string) => {
  try {
    await storage.deleteFile(appwriteConfig.storageId, fileId);
    return { status: "ok" };
  } catch (error) {
    console.log(error);
  }
};

export const getRecentPosts = async ({ pageParam }: { pageParam: number }) => {
  // const queries:any[]=[Query.orderDesc('$updatedAt'),Query.limit(10)]

  // if(pageParam){
  // queries.push(Query.cursorAfter(pageParam.toString()));
  // }

  const posts = databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.postCollectionId,
    [Query.orderDesc("$updatedAt"), Query.limit(10)]
  );

  if (!posts) throw Error;

  return posts;
};

export const likePost = async (postId: string, likesArray: string[]) => {
  try {
    const updatedPost = databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId,
      {
        likes: likesArray,
      }
    );

    if (!updatedPost) throw Error;
    return updatedPost;
  } catch (error) {
    console.log(error);
  }
};
export const savePost = async (postId: string, userId: string) => {
  try {
    const savedPost = databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      ID.unique(),
      {
        user: userId,
        post: postId,
      }
    );

    if (!savedPost) throw Error;
    return savedPost;
  } catch (error) {
    console.log(error);
  }
};
export const deleteSavedPost = async (savedRecordId: string) => {
  try {
    const statusCode = databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      savedRecordId
    );

    if (!statusCode) throw Error;
    return { status: "Ok" };
  } catch (error) {
    console.log(error);
  }
};

export const getPostById = async (postId: string) => {
  try {
    const post = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId
    );

    return post;
  } catch (error) {
    console.log(error);
  }
};

export const updatePost = async (post: IUpdatePost) => {
  const hasFileToUpdate = post.file.length > 0;
  try {
    let image = {
      imageUrl: post.imageUrl,
      imageId: post.imageId,
    };

    if (hasFileToUpdate) {
      // upload image to storage
      if (post.imageId) {
        try {
          await deleteFile(post.imageId);
          console.log(
            `Previous image with ID ${post.imageId} deleted successfully.`
          );
        } catch (error) {
          console.error("Failed to delete previous image:", error);
        }
      }

      const uploadedFile = await uploadFile(post.file[0]);
      if (!uploadedFile) throw Error;

      // Get file url
      const fileUrl = getFilePreview(uploadedFile.$id);
      if (!fileUrl) {
        deleteFile(uploadedFile.$id);
        throw Error;
      }

      image = { ...image, imageUrl: fileUrl, imageId: uploadedFile.$id };
    }

    // convert tags into an array
    const tags = post.tags?.replace(/ /g, "").split(",") || [];

    // save the new post to database
    const updatedPost = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      post.postId,
      {
        caption: post.caption,
        imageUrl: image.imageUrl,
        imageId: image.imageId,
        location: post.location,
        tags: tags,
      }
    );

    if (!updatedPost) {
      deleteFile(post.imageId);
      throw Error;
    }

    return updatedPost;
  } catch (error) {
    console.log(error);
  }
};

export const deletePost = async (postId: string, imageId: string) => {
  if (!postId || imageId) throw Error;
  try {
    await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId
    );

    return { status: "ok" };
  } catch (error) {
    console.log(error);
  }
};

export const getInfinitePosts = async ({
  pageParam,
}: {
  pageParam: number;
}) => {
  const queries: any[] = [Query.orderDesc("$updatedAt"), Query.limit(10)];

  if (pageParam) {
    queries.push(Query.cursorAfter(pageParam.toString()));
  }

  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      queries
    );

    if (!posts) throw Error;

    return posts;
  } catch (error) {
    console.log(error);
  }
};

export const searchPosts = async (searchTerm: string) => {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [Query.search("caption", searchTerm)]
    );

    if (!posts) throw Error;

    return posts;
  } catch (error) {
    console.log(error);
  }
};

export const getUsers = async (limit?: number) => {
  try {
    const users = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.orderDesc("$createdAt"), Query.limit(limit ?? 10)]
    );

    if (!users) throw Error;
    return users;
  } catch (error) {
    console.log(error);
  }
};

export const getSavedPosts = async () => {
  try {
    const savedPosts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId
      //   [Query.orderDesc("$createdAt"), Query.limit(limit??10)],
    );

    if (!savedPosts) throw Error;
    return savedPosts;
  } catch (error) {
    console.log(error);
  }
};

export const changeProfilePhoto = async (
  files: File[],
  imageId: string,
  userId: string
) => {
  const hasFileToUpdate = files.length > 0;
  try {
    let image: { imageUrl?: string | URL; imageId?: string } = {};

    if (hasFileToUpdate) {
      // upload image to storage
      if (imageId) {
        try {
          await deleteFile(imageId);
          console.log(
            `Previous image with ID ${imageId} deleted successfully.`
          );
        } catch (error) {
          console.error("Failed to delete previous image:", error);
        }
      }

      const uploadedFile = await uploadFile(files[0]);
      if (!uploadedFile) throw Error;

      // Get file url
      const fileUrl = getFilePreview(uploadedFile.$id);
      if (!fileUrl) {
        deleteFile(uploadedFile.$id);
        throw Error;
      }

      image = { imageUrl: fileUrl, imageId: uploadedFile.$id };
    }

    console.log(image);

    // save the new post to database
    const updatedUser = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      userId,
      {
        imageUrl: image.imageUrl,
        imageId: image.imageId,
      }
    );

    if (!updatedUser) {
      deleteFile(imageId ?? "");
      throw Error;
    }

    return updatedUser;
  } catch (error) {
    console.log(error);
  }
};

export const updateUserInfo = async (user: IUpdateUser) => {
  try {
    // save the new post to database
    const { id, imageId, imageUrl, ...rest } = user;
    const updatedUser = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      user.id,
      rest
    );

    if (!updatedUser) throw Error;

    return updatedUser;
  } catch (error) {
    console.log(error);
  }
};

export async function getUserPosts(userId: string) {
  try {
    const currentUser = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      userId
    );

    return currentUser;
  } catch (error) {
    console.log(error);
  }
}
