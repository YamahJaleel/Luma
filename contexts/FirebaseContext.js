import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authService } from '../services/authService';
import { profileService, postService, commentService, messageService, accountService } from '../services/firebaseService';
import notificationTriggerService from '../services/notificationTriggerService';
import encryptionService from '../services/encryptionService';

const FirebaseContext = createContext();

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};

export const FirebaseProvider = ({ children }) => {
  // Set an initializing state whilst Firebase connects
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [profiles, setProfiles] = useState([]);
  const [posts, setPosts] = useState([]);
  const [userProfiles, setUserProfiles] = useState([]);
  const [userPosts, setUserPosts] = useState([]);
  const [userComments, setUserComments] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [encryptionInitialized, setEncryptionInitialized] = useState(false);

  // Handle user state changes
  const handleAuthStateChanged = useCallback((user) => {
    setUser(user);
    if (initializing) setInitializing(false);
    console.log('🔥 Auth state changed:', user ? `User logged in: ${user.email}` : 'User logged out');
  }, [initializing]);

  // Initialize Firebase auth listener
  useEffect(() => {
    console.log('🔥 Setting up Firebase auth listener...');
    const subscriber = authService.onAuthStateChanged(handleAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, [handleAuthStateChanged]);

  // Load user-specific data when user changes
  useEffect(() => {
    if (user) {
      loadUserData();
      initializeEncryption();
    } else {
      // Clear user data when signed out
      setUserProfiles([]);
      setUserPosts([]);
      setUserComments([]);
      setLikedPosts([]);
      setMessages([]);
      setEncryptionInitialized(false);
    }
  }, [user]);

  // Initialize encryption for the user
  const initializeEncryption = async () => {
    try {
      if (!user) return;
      
      // Check if encryption is already initialized
      const isInitialized = await encryptionService.isEncryptionInitialized(user.uid);
      
      if (!isInitialized) {
        // Initialize with simple method (using user ID as key)
        await encryptionService.initializeSimple(user.uid);
        console.log('✅ Encryption initialized for user:', user.uid);
      }
      
      setEncryptionInitialized(true);
    } catch (error) {
      console.error('❌ Error initializing encryption:', error);
      setEncryptionInitialized(false);
    }
  };

  const loadUserData = async () => {
    try {
      // Initialize notification trigger service
      await notificationTriggerService.initialize();
      
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

  const reauthenticateWithPassword = async (email, password) => {
    try {
      return await authService.reauthenticateWithPassword(email, password);
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

  const signInAnonymously = async () => {
    try {
      const user = await authService.signInAnonymously();
      return user;
    } catch (error) {
      throw error;
    }
  };

  // Get ID token for backend authentication
  const getIdToken = async () => {
    try {
      const token = await authService.getIdToken();
      return token;
    } catch (error) {
      throw error;
    }
  };

  // Delete account and all related data
  const deleteAccountAndData = async () => {
    if (!user?.uid) throw new Error('No user is currently signed in');
    setLoading(true);
    try {
      const dataSummary = await accountService.deleteAllUserData(user.uid);
      let deletedAuthUser = false;
      let reauthRequired = false;
      try {
        await authService.deleteCurrentUser();
        deletedAuthUser = true;
      } catch (e) {
        if (e?.code === 'auth/requires-recent-login') {
          reauthRequired = true;
        } else {
          throw e;
        }
      }

      return { ...dataSummary, deletedAuthUser, reauthRequired };
    } finally {
      setLoading(false);
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
    initializing, // New: Add initializing state
    profiles,
    posts,
    userProfiles,
    userPosts,
    userComments,
    likedPosts,
    messages,
    encryptionInitialized,

    // Auth methods
    signIn,
    signUp,
    signInWithGoogle,
    signInAnonymously, // New: Anonymous sign-in
    signOut,
    resetPassword,
    getIdToken, // New: Backend authentication token
    reauthenticateWithPassword,
    deleteAccountAndData,

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

  // Prevent rendering until Firebase connection is established
  if (initializing) {
    console.log('🔥 Firebase initializing...');
    return null;
  }

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
};
