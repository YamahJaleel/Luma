import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  serverTimestamp,
  setDoc,
  arrayUnion,
  arrayRemove,
  increment
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { db, storage } from '../config/firebase';

// Collection names
const COLLECTIONS = {
  PROFILES: 'profiles',
  POSTS: 'posts',
  COMMENTS: 'comments',
  MESSAGES: 'messages',
  NOTIFICATIONS: 'notifications',
  USER_PROFILES: 'userProfiles',
  USER_POSTS: 'userPosts',
  USER_COMMENTS: 'userComments',
  LIKED_POSTS: 'likedPosts'
};

// Profile operations
export const profileService = {
  // Create a new profile
  createProfile: async (profileData) => {
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.PROFILES), {
        ...profileData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating profile:', error);
      throw error;
    }
  },

  // Get all profiles
  getProfiles: async () => {
    try {
      const querySnapshot = await getDocs(collection(db, COLLECTIONS.PROFILES));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting profiles:', error);
      throw error;
    }
  },

  // Get profile by ID
  getProfile: async (profileId) => {
    try {
      const docRef = doc(db, COLLECTIONS.PROFILES, profileId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      console.error('Error getting profile:', error);
      throw error;
    }
  },

  // Update profile
  updateProfile: async (profileId, updateData) => {
    try {
      const docRef = doc(db, COLLECTIONS.PROFILES, profileId);
      await updateDoc(docRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  // Atomically increment/decrement flag counts
  incrementFlags: async (profileId, deltaGreen = 0, deltaRed = 0) => {
    try {
      const docRef = doc(db, COLLECTIONS.PROFILES, profileId);
      const update = {};
      if (deltaGreen !== 0) update.greenFlagCount = increment(deltaGreen);
      if (deltaRed !== 0) update.redFlagCount = increment(deltaRed);
      if (Object.keys(update).length > 0) {
        await updateDoc(docRef, update);
      }
    } catch (error) {
      console.error('Error incrementing flags:', error);
      throw error;
    }
  },

  // Delete profile
  deleteProfile: async (profileId) => {
    try {
      const docRef = doc(db, COLLECTIONS.PROFILES, profileId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting profile:', error);
      throw error;
    }
  },

  // Get profiles by user ID
  getUserProfiles: async (userId) => {
    try {
      const q = query(
        collection(db, COLLECTIONS.PROFILES),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting user profiles:', error);
      throw error;
    }
  }
};

// Post operations
export const postService = {
  // Create a new post
  createPost: async (postData) => {
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.POSTS), {
        ...postData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  },

  // Get all posts
  getPosts: async () => {
    try {
      const q = query(
        collection(db, COLLECTIONS.POSTS),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting posts:', error);
      throw error;
    }
  },

  // Get posts by category
  getPostsByCategory: async (category) => {
    try {
      const q = query(
        collection(db, COLLECTIONS.POSTS),
        where('category', '==', category),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting posts by category:', error);
      throw error;
    }
  },

  // Update post
  updatePost: async (postId, updateData) => {
    try {
      const docRef = doc(db, COLLECTIONS.POSTS, postId);
      await updateDoc(docRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
    }
  },

  // Delete post
  deletePost: async (postId) => {
    try {
      const docRef = doc(db, COLLECTIONS.POSTS, postId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  },

  // Get posts by user ID
  getUserPosts: async (userId) => {
    try {
      const q = query(
        collection(db, COLLECTIONS.POSTS),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting user posts:', error);
      throw error;
    }
  },

  // Get liked posts by user ID
  getLikedPosts: async (userId) => {
    try {
      const q = query(
        collection(db, COLLECTIONS.POSTS),
        where('likedBy', 'array-contains', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting liked posts:', error);
      throw error;
    }
  }
};

// Comment operations
export const commentService = {
  // Create a new comment
  createComment: async (commentData) => {
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.COMMENTS), {
        ...commentData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating comment:', error);
      throw error;
    }
  },

  // Get comments for a profile
  getProfileComments: async (profileId) => {
    try {
      const q = query(
        collection(db, COLLECTIONS.COMMENTS),
        where('profileId', '==', profileId),
        orderBy('createdAt', 'asc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting profile comments:', error);
      throw error;
    }
  },

  // Get comments for a post
  getPostComments: async (postId) => {
    try {
      const q = query(
        collection(db, COLLECTIONS.COMMENTS),
        where('postId', '==', postId),
        orderBy('createdAt', 'asc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting post comments:', error);
      throw error;
    }
  },

  // Update comment
  updateComment: async (commentId, updateData) => {
    try {
      const docRef = doc(db, COLLECTIONS.COMMENTS, commentId);
      await updateDoc(docRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating comment:', error);
      throw error;
    }
  },

  // Delete comment
  deleteComment: async (commentId) => {
    try {
      const docRef = doc(db, COLLECTIONS.COMMENTS, commentId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  },

  // Get comments by user ID
  getUserComments: async (userId) => {
    try {
      const q = query(
        collection(db, COLLECTIONS.COMMENTS),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
	  const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting user comments:', error);
      throw error;
    }
  }
};

// Message operations
export const messageService = {
  // Create a new message
  createMessage: async (messageData) => {
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.MESSAGES), {
        ...messageData,
        unreadBy: arrayUnion(messageData.recipientId),
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating message:', error);
      throw error;
    }
  },

  // Mark all messages in a thread as read for a user
  markThreadRead: async (threadKey, userId) => {
    try {
      const q = query(
        collection(db, COLLECTIONS.MESSAGES),
        where('threadKey', '==', threadKey),
        where('unreadBy', 'array-contains', userId)
      );
      const snapshot = await getDocs(q);
      const updates = snapshot.docs.map(d => updateDoc(doc(db, COLLECTIONS.MESSAGES, d.id), {
        unreadBy: arrayRemove(userId)
      }));
      await Promise.all(updates);
    } catch (error) {
      console.error('Error marking thread read:', error);
    }
  },

  // Get messages between two users
  getMessages: async (userId1, userId2) => {
    try {
      const q = query(
        collection(db, COLLECTIONS.MESSAGES),
        where('participants', 'array-contains', userId1),
        orderBy('createdAt', 'asc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(message => 
          message.participants.includes(userId2)
        );
    } catch (error) {
      console.error('Error getting messages:', error);
      throw error;
    }
  },

  // Get user's conversations
  getUserConversations: async (userId) => {
    try {
      const q = query(
        collection(db, COLLECTIONS.MESSAGES),
        where('participants', 'array-contains', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting user conversations:', error);
      throw error;
    }
  },

  // Get messages by user ID
  getUserMessages: async (userId) => {
    try {
      const q = query(
        collection(db, COLLECTIONS.MESSAGES),
        where('participants', 'array-contains', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting user messages:', error);
      throw error;
    }
  }
};

// Storage operations
export const storageService = {
  // Upload image
  uploadImage: async (file, path) => {
    try {
      const storageRef = ref(storage, path);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  },

  // Delete image
  deleteImage: async (path) => {
    try {
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  }
};

// Real-time listeners
export const realtimeService = {
  // Listen to profile changes
  listenToProfiles: (callback) => {
    const q = query(collection(db, COLLECTIONS.PROFILES));
    return onSnapshot(q, (querySnapshot) => {
      const profiles = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(profiles);
    });
  },

  // Listen to a single profile by id
  listenToProfile: (profileId, callback) => {
    const refDoc = doc(db, COLLECTIONS.PROFILES, profileId);
    return onSnapshot(refDoc, (snap) => {
      if (snap.exists()) callback({ id: snap.id, ...snap.data() });
      else callback(null);
    });
  },

  // Listen to post changes
  listenToPosts: (callback) => {
    const q = query(
      collection(db, COLLECTIONS.POSTS),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (querySnapshot) => {
      const posts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(posts);
    });
  },

  // Listen to comment changes for a profile
  listenToProfileComments: (profileId, callback) => {
    const q = query(
      collection(db, COLLECTIONS.COMMENTS),
      where('profileId', '==', profileId),
      orderBy('createdAt', 'asc')
    );
    return onSnapshot(q, (querySnapshot) => {
      const comments = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(comments);
    });
  },

  // Listen to user's conversations (aggregated from latest messages)
  listenToConversations: (userId, callback) => {
    const q = query(
      collection(db, COLLECTIONS.MESSAGES),
      where('participants', 'array-contains', userId),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (querySnapshot) => {
      const messages = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Aggregate latest message and unread count per other participant
      const conversationMap = {};
      for (const message of messages) {
        const otherUserId = message.senderId === userId ? message.recipientId : message.senderId;
        if (!otherUserId) continue;

        const otherUserName = message.senderId === userId ? (message.recipient || 'Unknown User') : (message.sender || 'Unknown User');
        let time = '';
        try {
          if (message.createdAt?.toDate) {
            const date = message.createdAt.toDate();
            time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
          }
        } catch (e) {
          // no-op
        }

        // Initialize conversation if not existing or keep existing latest
        if (!conversationMap[otherUserId]) {
          conversationMap[otherUserId] = {
            id: otherUserId,
            name: otherUserName,
            lastMessage: message.text || '',
            time,
            unread: 0
          };
        }

        // Increment unread if message not from current user and marked unread for user
        if (message.senderId !== userId && Array.isArray(message.unreadBy) && message.unreadBy.includes(userId)) {
          conversationMap[otherUserId].unread += 1;
        }
      }

      callback(Object.values(conversationMap));
    });
  },

  // Listen to messages within a thread by threadKey (sorted uid1_uid2)
  listenToThreadMessages: (threadKey, callback) => {
    const q = query(
      collection(db, COLLECTIONS.MESSAGES),
      where('threadKey', '==', threadKey),
      orderBy('createdAt', 'asc')
    );

    return onSnapshot(q, (querySnapshot) => {
      const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(items);
    });
  },

  // Typing indicator: listen to typing doc for thread
  listenToTyping: (threadKey, callback) => {
    const typingDocRef = doc(db, 'typing', threadKey);
    return onSnapshot(typingDocRef, (snap) => {
      callback(snap.exists() ? snap.data() : {});
    });
  }
};

// Typing API
export const typingService = {
  setTyping: async (threadKey, userId, isTyping) => {
    try {
      const typingDocRef = doc(db, 'typing', threadKey);
      await setDoc(typingDocRef, { [userId]: isTyping, updatedAt: serverTimestamp() }, { merge: true });
    } catch (error) {
      console.error('Error setting typing status:', error);
    }
  }
};

export default {
  profileService,
  postService,
  commentService,
  messageService,
  storageService,
  realtimeService,
  typingService
};
