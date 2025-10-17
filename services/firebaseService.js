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

  // Delete profile and all related data
  deleteProfile: async (profileId) => {
    try {
      // Get profile data first to check for related data
      const profileRef = doc(db, COLLECTIONS.PROFILES, profileId);
      const profileSnap = await getDoc(profileRef);
      
      if (!profileSnap.exists()) {
        console.warn('Profile not found:', profileId);
        return;
      }

      // Delete all comments related to this profile
      try {
        const commentsQuery = query(
          collection(db, COLLECTIONS.COMMENTS),
          where('profileId', '==', profileId)
        );
        const commentsSnapshot = await getDocs(commentsQuery);
        
        // Delete all comments in parallel
        const deletePromises = commentsSnapshot.docs.map(commentDoc => 
          deleteDoc(doc(db, COLLECTIONS.COMMENTS, commentDoc.id))
        );
        await Promise.all(deletePromises);
        
        console.log(`✅ Deleted ${commentsSnapshot.docs.length} comments for profile ${profileId}`);
      } catch (commentError) {
        console.warn('⚠️ Failed to delete profile comments:', commentError);
        // Continue with profile deletion even if comment deletion fails
      }

      // Delete the profile document
      await deleteDoc(profileRef);
      console.log('✅ Profile deleted from Firestore:', profileId);
      
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
      // If this is a post comment, increment post.comments counter
      if (commentData.postId) {
        const postRef = doc(db, COLLECTIONS.POSTS, commentData.postId);
        await updateDoc(postRef, { comments: increment(1) });
      }
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
      // Read comment to know if it targets a post
      const snap = await getDoc(docRef);
      const data = snap.exists() ? snap.data() : null;
      await deleteDoc(docRef);
      if (data?.postId) {
        const postRef = doc(db, COLLECTIONS.POSTS, data.postId);
        await updateDoc(postRef, { comments: increment(-1) });
      }
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
  // Upload image from React Native
  uploadImage: async (imageUri, path) => {
    try {
      console.log('Uploading image from URI:', imageUri);
      
      // Convert image URI to blob for React Native
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      console.log('Blob created, size:', blob.size);
      
      const storageRef = ref(storage, path);
      console.log('Storage ref created:', path);
      
      const snapshot = await uploadBytes(storageRef, blob);
      console.log('Upload completed, getting download URL...');
      
      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log('Download URL obtained:', downloadURL);
      
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  },

  // Upload image from blob (for web compatibility)
  uploadImageBlob: async (blob, path) => {
    try {
      const storageRef = ref(storage, path);
      const snapshot = await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image blob:', error);
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

// Notification operations
export const notificationService = {
  // Create a new notification
  createNotification: async (notificationData) => {
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.NOTIFICATIONS), {
        ...notificationData,
        createdAt: serverTimestamp(),
        isRead: false
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  },

  // Get notifications for a user
  getUserNotifications: async (userId, limitCount = 50) => {
    try {
      const q = query(
        collection(db, COLLECTIONS.NOTIFICATIONS),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting user notifications:', error);
      throw error;
    }
  },

  // Mark notification as read
  markNotificationAsRead: async (notificationId) => {
    try {
      const docRef = doc(db, COLLECTIONS.NOTIFICATIONS, notificationId);
      await updateDoc(docRef, {
        isRead: true,
        readAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  // Mark all notifications as read for a user
  markAllNotificationsAsRead: async (userId) => {
    try {
      const q = query(
        collection(db, COLLECTIONS.NOTIFICATIONS),
        where('userId', '==', userId),
        where('isRead', '==', false)
      );
      const querySnapshot = await getDocs(q);
      
      const updatePromises = querySnapshot.docs.map(doc => 
        updateDoc(doc(db, COLLECTIONS.NOTIFICATIONS, doc.id), {
          isRead: true,
          readAt: serverTimestamp()
        })
      );
      
      await Promise.all(updatePromises);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  },

  // Delete notification
  deleteNotification: async (notificationId) => {
    try {
      const docRef = doc(db, COLLECTIONS.NOTIFICATIONS, notificationId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  },

  // Get unread notification count
  getUnreadCount: async (userId) => {
    try {
      const q = query(
        collection(db, COLLECTIONS.NOTIFICATIONS),
        where('userId', '==', userId),
        where('isRead', '==', false)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.size;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  },

  // Listen to user notifications
  listenToUserNotifications: (userId, callback) => {
    try {
      const q = query(
        collection(db, COLLECTIONS.NOTIFICATIONS),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      
      return onSnapshot(q, (querySnapshot) => {
        const notifications = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        callback(notifications);
      });
    } catch (error) {
      console.error('Error listening to user notifications:', error);
      return null;
    }
  }
};

// Account cleanup operations
export const accountService = {
  // Delete all Firestore data related to a user and remove likes
  deleteAllUserData: async (userId) => {
    const summary = {
      profilesDeleted: 0,
      postsDeleted: 0,
      commentsDeleted: 0,
      messagesDeleted: 0,
      notificationsDeleted: 0,
      tokensDeleted: 0,
      likesRemoved: 0,
      auxiliaryDocsDeleted: 0,
    };

    try {
      // Delete profiles (and attempt to remove associated storage assets)
      try {
        const profilesQ = query(collection(db, COLLECTIONS.PROFILES), where('userId', '==', userId));
        const profilesSnap = await getDocs(profilesQ);
        await Promise.all(profilesSnap.docs.map(async (d) => {
          try {
            const data = d.data();
            const possibleUrls = [];
            if (data?.photoUrl) possibleUrls.push(data.photoUrl);
            if (data?.imageUrl) possibleUrls.push(data.imageUrl);
            if (Array.isArray(data?.images)) possibleUrls.push(...data.images);
            if (Array.isArray(data?.gallery)) possibleUrls.push(...data.gallery);
            const uniqueUrls = Array.from(new Set(possibleUrls.filter(Boolean)));
            await Promise.all(uniqueUrls.map(async (url) => {
              try { await deleteObject(ref(storage, url)); } catch {}
            }));
          } catch {}
          await deleteDoc(doc(db, COLLECTIONS.PROFILES, d.id));
        }));
        summary.profilesDeleted = profilesSnap.size;
      } catch (e) { console.warn('Error deleting user profiles:', e); }

      // Delete posts by user (and attempt to remove associated storage assets)
      try {
        const postsQ = query(collection(db, COLLECTIONS.POSTS), where('userId', '==', userId));
        const postsSnap = await getDocs(postsQ);
        await Promise.all(postsSnap.docs.map(async (d) => {
          try {
            const data = d.data();
            const possibleUrls = [];
            if (data?.imageUrl) possibleUrls.push(data.imageUrl);
            if (Array.isArray(data?.images)) possibleUrls.push(...data.images);
            if (data?.videoUrl) possibleUrls.push(data.videoUrl);
            const uniqueUrls = Array.from(new Set(possibleUrls.filter(Boolean)));
            await Promise.all(uniqueUrls.map(async (url) => {
              try { await deleteObject(ref(storage, url)); } catch {}
            }));
          } catch {}
          await deleteDoc(doc(db, COLLECTIONS.POSTS, d.id));
        }));
        summary.postsDeleted = postsSnap.size;
      } catch (e) { console.warn('Error deleting user posts:', e); }

      // Delete comments by user
      try {
        const commentsQ = query(collection(db, COLLECTIONS.COMMENTS), where('userId', '==', userId));
        const commentsSnap = await getDocs(commentsQ);
        await Promise.all(commentsSnap.docs.map(async (d) => {
          // If the comment targets a post, decrement comment count
          try {
            const data = d.data();
            if (data?.postId) {
              const postRef = doc(db, COLLECTIONS.POSTS, data.postId);
              await updateDoc(postRef, { comments: increment(-1) });
            }
          } catch {}
          await deleteDoc(doc(db, COLLECTIONS.COMMENTS, d.id));
        }));
        summary.commentsDeleted = commentsSnap.size;
      } catch (e) { console.warn('Error deleting user comments:', e); }

      // Delete messages where user is a participant
      try {
        const messagesQ = query(collection(db, COLLECTIONS.MESSAGES), where('participants', 'array-contains', userId));
        const messagesSnap = await getDocs(messagesQ);
        await Promise.all(messagesSnap.docs.map(d => deleteDoc(doc(db, COLLECTIONS.MESSAGES, d.id))));
        summary.messagesDeleted = messagesSnap.size;
      } catch (e) { console.warn('Error deleting user messages:', e); }

      // Remove likes from posts (arrayRemove)
      try {
        const likedQ = query(collection(db, COLLECTIONS.POSTS), where('likedBy', 'array-contains', userId));
        const likedSnap = await getDocs(likedQ);
        await Promise.all(likedSnap.docs.map(d => updateDoc(doc(db, COLLECTIONS.POSTS, d.id), { likedBy: arrayRemove(userId) })));
        summary.likesRemoved = likedSnap.size;
      } catch (e) { console.warn('Error removing likes:', e); }

      // Delete notifications for user
      try {
        const notifQ = query(collection(db, COLLECTIONS.NOTIFICATIONS), where('userId', '==', userId));
        const notifSnap = await getDocs(notifQ);
        await Promise.all(notifSnap.docs.map(d => deleteDoc(doc(db, COLLECTIONS.NOTIFICATIONS, d.id))));
        summary.notificationsDeleted = notifSnap.size;
      } catch (e) { console.warn('Error deleting notifications:', e); }

      // Delete push tokens for user (userTokens collection)
      try {
        const tokensQ = query(collection(db, 'userTokens'), where('userId', '==', userId));
        const tokensSnap = await getDocs(tokensQ);
        await Promise.all(tokensSnap.docs.map(d => deleteDoc(doc(db, 'userTokens', d.id))));
        summary.tokensDeleted = tokensSnap.size;
      } catch (e) { console.warn('Error deleting user tokens:', e); }

      // Cleanup auxiliary user collections if present
      const auxCollections = [
        COLLECTIONS.USER_PROFILES,
        COLLECTIONS.USER_POSTS,
        COLLECTIONS.USER_COMMENTS,
        COLLECTIONS.LIKED_POSTS,
      ];
      for (const coll of auxCollections) {
        try {
          const qy = query(collection(db, coll), where('userId', '==', userId));
          const snap = await getDocs(qy);
          await Promise.all(snap.docs.map(d => deleteDoc(doc(db, coll, d.id))));
          summary.auxiliaryDocsDeleted += snap.size;
        } catch (e) {
          // ignore if collection not used
        }
      }

      return summary;
    } catch (error) {
      console.error('Error deleting all user data:', error);
      throw error;
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
  typingService,
  notificationService,
  accountService
};
