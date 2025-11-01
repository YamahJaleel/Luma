/**
 * Example: How to integrate caching with your existing services
 * 
 * This file shows how to add caching to your Firebase services.
 * You can either:
 * 1. Modify your existing services to use caching (recommended)
 * 2. Create wrapper functions that add caching on top
 * 3. Use cacheService directly in your screens
 */

import cacheService from './cacheService';
import { postService as originalPostService } from './postService';
import { profileService as originalProfileService } from './firebaseService';
import { commentService as originalCommentService } from './firebaseService';
import { notificationService as originalNotificationService } from './firebaseService';

/**
 * Cached Post Service
 * Example of how to add caching to post operations
 */
export const cachedPostService = {
  // Get posts with caching
  getPosts: async (category = null, sortBy = 'recent', limitCount = 50, forceRefresh = false) => {
    return cacheService.getPosts(
      category,
      sortBy,
      () => originalPostService.getPosts(category, sortBy, limitCount),
      forceRefresh
    );
  },

  // Get single post with caching
  getPost: async (postId, forceRefresh = false) => {
    return cacheService.getPost(
      postId,
      () => originalPostService.getPost(postId),
      forceRefresh
    );
  },

  // Get user posts with caching
  getUserPosts: async (userId, forceRefresh = false) => {
    const key = cacheService.keys.POSTS_BY_USER(userId);
    return cacheService.wrapper(
      key,
      () => originalPostService.getUserPosts(userId),
      cacheService.config.USER_DATA_TTL,
      { forceRefresh }
    );
  },

  // Get liked posts with caching
  getLikedPosts: async (userId, forceRefresh = false) => {
    const key = cacheService.keys.LIKED_POSTS(userId);
    return cacheService.wrapper(
      key,
      () => originalPostService.getLikedPosts(userId),
      cacheService.config.USER_DATA_TTL,
      { forceRefresh }
    );
  },

  // Create post (invalidate cache after creation)
  createPost: async (postData, userId) => {
    const result = await originalPostService.createPost(postData, userId);
    // Invalidate post lists cache
    await cacheService.invalidate('cache:posts:');
    return result;
  },

  // Update post (invalidate cache)
  updatePost: async (postId, updateData) => {
    const result = await originalPostService.updatePost(postId, updateData);
    await cacheService.invalidatePost(postId);
    return result;
  },

  // Delete post (invalidate cache)
  deletePost: async (postId) => {
    const result = await originalPostService.deletePost(postId);
    await cacheService.invalidatePost(postId);
    return result;
  },

  // Like/unlike post (invalidate cache)
  likePost: async (postId, userId) => {
    const result = await originalPostService.likePost(postId, userId);
    await cacheService.invalidatePost(postId);
    await cacheService.remove(cacheService.keys.LIKED_POSTS(userId));
    return result;
  },

  unlikePost: async (postId, userId) => {
    const result = await originalPostService.unlikePost(postId, userId);
    await cacheService.invalidatePost(postId);
    await cacheService.remove(cacheService.keys.LIKED_POSTS(userId));
    return result;
  },

  // Search posts (no caching for search results)
  searchPosts: async (searchQuery) => {
    return originalPostService.searchPosts(searchQuery);
  },
};

/**
 * Cached Profile Service
 */
export const cachedProfileService = {
  getProfiles: async (forceRefresh = false) => {
    return cacheService.getProfiles(
      () => originalProfileService.getProfiles(),
      forceRefresh
    );
  },

  getProfile: async (profileId, forceRefresh = false) => {
    return cacheService.getProfile(
      profileId,
      () => originalProfileService.getProfile(profileId),
      forceRefresh
    );
  },

  getUserProfiles: async (userId, forceRefresh = false) => {
    return cacheService.getUserProfiles(
      userId,
      () => originalProfileService.getUserProfiles(userId),
      forceRefresh
    );
  },

  createProfile: async (profileData) => {
    const result = await originalProfileService.createProfile(profileData);
    await cacheService.invalidate('cache:profiles:');
    return result;
  },

  updateProfile: async (profileId, updateData) => {
    const result = await originalProfileService.updateProfile(profileId, updateData);
    await cacheService.invalidateProfile(profileId);
    return result;
  },

  deleteProfile: async (profileId) => {
    const result = await originalProfileService.deleteProfile(profileId);
    await cacheService.invalidateProfile(profileId);
    return result;
  },
};

/**
 * Cached Comment Service
 */
export const cachedCommentService = {
  getPostComments: async (postId, forceRefresh = false) => {
    return cacheService.getPostComments(
      postId,
      () => originalCommentService.getPostComments(postId),
      forceRefresh
    );
  },

  getProfileComments: async (profileId, forceRefresh = false) => {
    return cacheService.getProfileComments(
      profileId,
      () => originalCommentService.getProfileComments(profileId),
      forceRefresh
    );
  },

  getUserComments: async (userId, forceRefresh = false) => {
    const key = cacheService.keys.USER_COMMENTS(userId);
    return cacheService.wrapper(
      key,
      () => originalCommentService.getUserComments(userId),
      cacheService.config.USER_DATA_TTL,
      { forceRefresh }
    );
  },

  createComment: async (commentData) => {
    const result = await originalCommentService.createComment(commentData);
    // Invalidate comments cache
    if (commentData.postId) {
      await cacheService.invalidateComments(commentData.postId);
    }
    if (commentData.profileId) {
      await cacheService.invalidateComments(null, commentData.profileId);
    }
    return result;
  },

  updateComment: async (commentId, updateData) => {
    const result = await originalCommentService.updateComment(commentId, updateData);
    await cacheService.invalidateComments(); // Invalidate all comments
    return result;
  },

  deleteComment: async (commentId) => {
    const result = await originalCommentService.deleteComment(commentId);
    await cacheService.invalidateComments(); // Invalidate all comments
    return result;
  },
};

/**
 * Cached Notification Service
 */
export const cachedNotificationService = {
  getUserNotifications: async (userId, limitCount = 50, forceRefresh = false) => {
    return cacheService.getNotifications(
      userId,
      () => originalNotificationService.getUserNotifications(userId, limitCount),
      forceRefresh
    );
  },

  markNotificationAsRead: async (notificationId) => {
    const result = await originalNotificationService.markNotificationAsRead(notificationId);
    await cacheService.invalidate('cache:notifications:');
    return result;
  },

  markAllNotificationsAsRead: async (userId) => {
    const result = await originalNotificationService.markAllNotificationsAsRead(userId);
    await cacheService.invalidate('cache:notifications:');
    return result;
  },

  createNotification: async (notificationData) => {
    const result = await originalNotificationService.createNotification(notificationData);
    await cacheService.invalidate('cache:notifications:');
    return result;
  },
};

/**
 * USAGE EXAMPLES:
 * 
 * // In your screens/components:
 * 
 * // 1. Use cached services directly
 * import { cachedPostService } from '../services/cachedServices';
 * 
 * const loadPosts = async () => {
 *   const posts = await cachedPostService.getPosts(category, sortBy);
 *   // First call: fetches from Firebase and caches
 *   // Subsequent calls: returns cached data if still valid
 * };
 * 
 * // 2. Force refresh when needed
 * const refreshPosts = async () => {
 *   const posts = await cachedPostService.getPosts(category, sortBy, 50, true);
 *   // Forces fresh fetch from Firebase
 * };
 * 
 * // 3. Use cacheService directly for more control
 * import cacheService from '../services/cacheService';
 * 
 * const loadPosts = async () => {
 *   const posts = await cacheService.getPosts(
 *     category,
 *     sortBy,
 *     () => postService.getPosts(category, sortBy),
 *     false // forceRefresh
 *   );
 * };
 * 
 * // 4. Clear cache when user logs out
 * import cacheService from '../services/cacheService';
 * 
 * const handleLogout = async () => {
 *   await cacheService.clear();
 *   // ... logout logic
 * };
 * 
 * // 5. Check cache stats (for debugging)
 * const stats = await cacheService.stats();
 * console.log('Cache stats:', stats);
 */

