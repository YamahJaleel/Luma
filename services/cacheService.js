import AsyncStorage from '@react-native-async-storage/async-storage';

// Cache configuration
const CACHE_CONFIG = {
  // Default TTL in milliseconds
  DEFAULT_TTL: 5 * 60 * 1000, // 5 minutes
  POSTS_TTL: 2 * 60 * 1000, // 2 minutes for posts (more dynamic)
  PROFILES_TTL: 10 * 60 * 1000, // 10 minutes for profiles (less dynamic)
  USER_DATA_TTL: 5 * 60 * 1000, // 5 minutes for user data
  COMMENTS_TTL: 1 * 60 * 1000, // 1 minute for comments (very dynamic)
  MESSAGES_TTL: 30 * 1000, // 30 seconds for messages (very dynamic)
  NOTIFICATIONS_TTL: 1 * 60 * 1000, // 1 minute for notifications
};

// Cache keys
const CACHE_KEYS = {
  POSTS: (category, sortBy) => `cache:posts:${category || 'all'}:${sortBy || 'recent'}`,
  POST: (postId) => `cache:post:${postId}`,
  POSTS_BY_USER: (userId) => `cache:posts:user:${userId}`,
  LIKED_POSTS: (userId) => `cache:likedPosts:${userId}`,
  PROFILES: 'cache:profiles:all',
  PROFILE: (profileId) => `cache:profile:${profileId}`,
  USER_PROFILES: (userId) => `cache:userProfiles:${userId}`,
  POST_COMMENTS: (postId) => `cache:comments:post:${postId}`,
  PROFILE_COMMENTS: (profileId) => `cache:comments:profile:${profileId}`,
  USER_COMMENTS: (userId) => `cache:comments:user:${userId}`,
  CONVERSATIONS: (userId) => `cache:conversations:${userId}`,
  MESSAGES: (threadKey) => `cache:messages:${threadKey}`,
  NOTIFICATIONS: (userId) => `cache:notifications:${userId}`,
  USER_PROFILE: (userId) => `cache:userProfile:${userId}`,
  USER_SETTINGS: (userId) => `cache:userSettings:${userId}`,
};

/**
 * Cache entry structure:
 * {
 *   data: any,
 *   timestamp: number,
 *   ttl: number
 * }
 */

/**
 * Get cached data if it exists and hasn't expired
 */
const getCached = async (key, ttl = CACHE_CONFIG.DEFAULT_TTL) => {
  try {
    const cached = await AsyncStorage.getItem(key);
    if (!cached) return null;

    const parsed = JSON.parse(cached);
    const now = Date.now();
    const age = now - parsed.timestamp;

    // Check if cache is expired
    if (age > parsed.ttl) {
      // Remove expired cache
      await AsyncStorage.removeItem(key);
      return null;
    }

    return parsed.data;
  } catch (error) {
    console.error(`Error reading cache for key ${key}:`, error);
    return null;
  }
};

/**
 * Set cache data with TTL
 */
const setCached = async (key, data, ttl = CACHE_CONFIG.DEFAULT_TTL) => {
  try {
    const cacheEntry = {
      data,
      timestamp: Date.now(),
      ttl,
    };
    await AsyncStorage.setItem(key, JSON.stringify(cacheEntry));
  } catch (error) {
    console.error(`Error setting cache for key ${key}:`, error);
  }
};

/**
 * Remove cached data
 */
const removeCached = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing cache for key ${key}:`, error);
  }
};

/**
 * Clear all cache entries (or specific pattern)
 */
const clearCache = async (pattern = null) => {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const keysToRemove = pattern
      ? allKeys.filter(key => key.includes(pattern))
      : allKeys.filter(key => key.startsWith('cache:'));

    if (keysToRemove.length > 0) {
      await AsyncStorage.multiRemove(keysToRemove);
      console.log(`✅ Cleared ${keysToRemove.length} cache entries`);
    }
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
};

/**
 * Invalidate cache for a specific key pattern
 */
const invalidateCache = async (pattern) => {
  return clearCache(pattern);
};

/**
 * Get cache statistics
 */
const getCacheStats = async () => {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const cacheKeys = allKeys.filter(key => key.startsWith('cache:'));
    const stats = {
      totalEntries: cacheKeys.length,
      entries: {},
    };

    // Count entries by type
    for (const key of cacheKeys) {
      const parts = key.split(':');
      const type = parts[1] || 'unknown';
      stats.entries[type] = (stats.entries[type] || 0) + 1;
    }

    return stats;
  } catch (error) {
    console.error('Error getting cache stats:', error);
    return { totalEntries: 0, entries: {} };
  }
};

/**
 * Cache wrapper function that handles fetch-or-cache logic
 */
const cacheWrapper = async (key, fetchFn, ttl = CACHE_CONFIG.DEFAULT_TTL, options = {}) => {
  const { forceRefresh = false, onCacheHit, onCacheMiss } = options;

  // Check cache first if not forcing refresh
  if (!forceRefresh) {
    const cached = await getCached(key, ttl);
    if (cached !== null) {
      onCacheHit?.(cached);
      return cached;
    }
  }

  // Fetch fresh data
  try {
    const data = await fetchFn();
    
    // Cache the result
    if (data !== null && data !== undefined) {
      await setCached(key, data, ttl);
    }
    
    onCacheMiss?.(data);
    return data;
  } catch (error) {
    // If fetch fails, try to return stale cache
    if (!forceRefresh) {
      const staleCache = await getCached(key, Infinity); // Get even if expired
      if (staleCache !== null) {
        console.warn('⚠️ Using stale cache due to fetch error');
        return staleCache;
      }
    }
    throw error;
  }
};

// Export cache service
export const cacheService = {
  // Core cache operations
  get: getCached,
  set: setCached,
  remove: removeCached,
  clear: clearCache,
  invalidate: invalidateCache,
  stats: getCacheStats,
  wrapper: cacheWrapper,

  // Cache keys helper
  keys: CACHE_KEYS,

  // Cache config
  config: CACHE_CONFIG,

  // Convenience methods for common cache patterns
  async getPosts(category, sortBy, fetchFn, forceRefresh = false) {
    const key = CACHE_KEYS.POSTS(category, sortBy);
    return cacheWrapper(key, fetchFn, CACHE_CONFIG.POSTS_TTL, { forceRefresh });
  },

  async getPost(postId, fetchFn, forceRefresh = false) {
    const key = CACHE_KEYS.POST(postId);
    return cacheWrapper(key, fetchFn, CACHE_CONFIG.POSTS_TTL, { forceRefresh });
  },

  async getProfiles(fetchFn, forceRefresh = false) {
    const key = CACHE_KEYS.PROFILES;
    return cacheWrapper(key, fetchFn, CACHE_CONFIG.PROFILES_TTL, { forceRefresh });
  },

  async getProfile(profileId, fetchFn, forceRefresh = false) {
    const key = CACHE_KEYS.PROFILE(profileId);
    return cacheWrapper(key, fetchFn, CACHE_CONFIG.PROFILES_TTL, { forceRefresh });
  },

  async getUserProfiles(userId, fetchFn, forceRefresh = false) {
    const key = CACHE_KEYS.USER_PROFILES(userId);
    return cacheWrapper(key, fetchFn, CACHE_CONFIG.USER_DATA_TTL, { forceRefresh });
  },

  async getPostComments(postId, fetchFn, forceRefresh = false) {
    const key = CACHE_KEYS.POST_COMMENTS(postId);
    return cacheWrapper(key, fetchFn, CACHE_CONFIG.COMMENTS_TTL, { forceRefresh });
  },

  async getProfileComments(profileId, fetchFn, forceRefresh = false) {
    const key = CACHE_KEYS.PROFILE_COMMENTS(profileId);
    return cacheWrapper(key, fetchFn, CACHE_CONFIG.COMMENTS_TTL, { forceRefresh });
  },

  async getNotifications(userId, fetchFn, forceRefresh = false) {
    const key = CACHE_KEYS.NOTIFICATIONS(userId);
    return cacheWrapper(key, fetchFn, CACHE_CONFIG.NOTIFICATIONS_TTL, { forceRefresh });
  },

  // Invalidation helpers
  async invalidatePost(postId) {
    await Promise.all([
      removeCached(CACHE_KEYS.POST(postId)),
      invalidateCache('cache:posts:'), // Invalidate all post lists
    ]);
  },

  async invalidateProfile(profileId) {
    await Promise.all([
      removeCached(CACHE_KEYS.PROFILE(profileId)),
      removeCached(CACHE_KEYS.PROFILES), // Invalidate profiles list
      removeCached(CACHE_KEYS.PROFILE_COMMENTS(profileId)),
    ]);
  },

  async invalidateUser(userId) {
    await Promise.all([
      removeCached(CACHE_KEYS.USER_PROFILES(userId)),
      removeCached(CACHE_KEYS.POSTS_BY_USER(userId)),
      removeCached(CACHE_KEYS.LIKED_POSTS(userId)),
      removeCached(CACHE_KEYS.USER_COMMENTS(userId)),
      removeCached(CACHE_KEYS.CONVERSATIONS(userId)),
      removeCached(CACHE_KEYS.NOTIFICATIONS(userId)),
      removeCached(CACHE_KEYS.USER_PROFILE(userId)),
      removeCached(CACHE_KEYS.USER_SETTINGS(userId)),
    ]);
  },

  async invalidateComments(postId = null, profileId = null) {
    if (postId) {
      await removeCached(CACHE_KEYS.POST_COMMENTS(postId));
    }
    if (profileId) {
      await removeCached(CACHE_KEYS.PROFILE_COMMENTS(profileId));
    }
    if (!postId && !profileId) {
      await invalidateCache('cache:comments:');
    }
  },
};

export default cacheService;

