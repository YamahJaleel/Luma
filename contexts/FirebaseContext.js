import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/authService';
import { profileService, postService, commentService, messageService } from '../services/firebaseService';

const FirebaseContext = createContext();

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};

export const FirebaseProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState([]);
  const [posts, setPosts] = useState([]);
  const [userProfiles, setUserProfiles] = useState([]);
  const [userPosts, setUserPosts] = useState([]);
  const [userComments, setUserComments] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [messages, setMessages] = useState([]);

  // Initialize Firebase auth listener
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Load user-specific data when user changes
  useEffect(() => {
    if (user) {
      loadUserData();
    } else {
      // Clear user data when signed out
      setUserProfiles([]);
      setUserPosts([]);
      setUserComments([]);
      setLikedPosts([]);
      setMessages([]);
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      // Load user profiles
      const userProfilesData = await profileService.getUserProfiles(user.uid);
      setUserProfiles(userProfilesData);

      // Load user posts
      const userPostsData = await postService.getUserPosts(user.uid);
      setUserPosts(userPostsData);

      // Load user comments
      const userCommentsData = await commentService.getUserComments(user.uid);
      setUserComments(userCommentsData);

      // Load liked posts
      const likedPostsData = await postService.getLikedPosts(user.uid);
      setLikedPosts(likedPostsData);

      // Load messages
      const messagesData = await messageService.getUserMessages(user.uid);
      setMessages(messagesData);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadProfiles = async () => {
    try {
      const profilesData = await profileService.getProfiles();
      setProfiles(profilesData);
    } catch (error) {
      console.error('Error loading profiles:', error);
    }
  };

  const loadPosts = async () => {
    try {
      const postsData = await postService.getPosts();
      setPosts(postsData);
    } catch (error) {
      console.error('Error loading posts:', error);
    }
  };

  // Authentication methods
  const signIn = async (email, password) => {
    try {
      const user = await authService.signIn(email, password);
      return user;
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (email, password, displayName) => {
    try {
      const user = await authService.createUser(email, password, displayName);
      return user;
    } catch (error) {
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const user = await authService.signInWithGoogle();
      return user;
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await authService.signOut();
    } catch (error) {
      throw error;
    }
  };

  const resetPassword = async (email) => {
    try {
      await authService.resetPassword(email);
    } catch (error) {
      throw error;
    }
  };

  // Profile methods
  const createProfile = async (profileData) => {
    try {
      const profileId = await profileService.createProfile({
        ...profileData,
        userId: user.uid,
        createdBy: user.uid
      });
      await loadUserData(); // Refresh user data
      return profileId;
    } catch (error) {
      throw error;
    }
  };

  const updateProfile = async (profileId, updateData) => {
    try {
      await profileService.updateProfile(profileId, updateData);
      await loadUserData(); // Refresh user data
    } catch (error) {
      throw error;
    }
  };

  const deleteProfile = async (profileId) => {
    try {
      await profileService.deleteProfile(profileId);
      await loadUserData(); // Refresh user data
    } catch (error) {
      throw error;
    }
  };

  // Post methods
  const createPost = async (postData) => {
    try {
      const postId = await postService.createPost({
        ...postData,
        userId: user.uid,
        author: user.displayName || 'Anonymous'
      });
      await loadUserData(); // Refresh user data
      return postId;
    } catch (error) {
      throw error;
    }
  };

  const updatePost = async (postId, updateData) => {
    try {
      await postService.updatePost(postId, updateData);
      await loadUserData(); // Refresh user data
    } catch (error) {
      throw error;
    }
  };

  const deletePost = async (postId) => {
    try {
      await postService.deletePost(postId);
      await loadUserData(); // Refresh user data
    } catch (error) {
      throw error;
    }
  };

  // Comment methods
  const createComment = async (commentData) => {
    try {
      const commentId = await commentService.createComment({
        ...commentData,
        userId: user.uid,
        author: user.displayName || 'Anonymous'
      });
      await loadUserData(); // Refresh user data
      return commentId;
    } catch (error) {
      throw error;
    }
  };

  const updateComment = async (commentId, updateData) => {
    try {
      await commentService.updateComment(commentId, updateData);
      await loadUserData(); // Refresh user data
    } catch (error) {
      throw error;
    }
  };

  const deleteComment = async (commentId) => {
    try {
      await commentService.deleteComment(commentId);
      await loadUserData(); // Refresh user data
    } catch (error) {
      throw error;
    }
  };

  // Message methods
  const createMessage = async (messageData) => {
    try {
      const messageId = await messageService.createMessage({
        ...messageData,
        senderId: user.uid,
        sender: user.displayName || 'Anonymous'
      });
      await loadUserData(); // Refresh user data
      return messageId;
    } catch (error) {
      throw error;
    }
  };

  const value = {
    // State
    user,
    loading,
    profiles,
    posts,
    userProfiles,
    userPosts,
    userComments,
    likedPosts,
    messages,

    // Auth methods
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    resetPassword,

    // Data loading methods
    loadProfiles,
    loadPosts,
    loadUserData,

    // Profile methods
    createProfile,
    updateProfile,
    deleteProfile,

    // Post methods
    createPost,
    updatePost,
    deletePost,

    // Comment methods
    createComment,
    updateComment,
    deleteComment,

    // Message methods
    createMessage
  };

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
};
