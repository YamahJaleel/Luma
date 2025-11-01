# Caching Implementation Guide

This document explains how caching has been implemented in your React Native app and how to use it.

## Overview

Caching has been added to improve app performance and reduce Firebase read operations. The cache stores data locally using AsyncStorage and automatically expires based on configurable TTL (Time To Live) values.

## Cache Service

The `cacheService` (`services/cacheService.js`) provides:

- **Automatic expiration**: Data expires based on TTL
- **Smart invalidation**: Cache is automatically invalidated when data changes
- **Stale-while-revalidate**: Returns stale data if fetch fails
- **Easy integration**: Simple wrapper functions for common patterns

## Cache Configuration

Default TTL values (can be adjusted in `cacheService.js`):

- **Posts**: 2 minutes
- **Profiles**: 10 minutes
- **User Data**: 5 minutes
- **Comments**: 1 minute
- **Messages**: 30 seconds
- **Notifications**: 1 minute

## Integration Options

### Option 1: Use Cached Services (Recommended)

Replace your existing service imports with cached versions:

```javascript
// Before
import { postService } from '../services/postService';

// After
import { cachedPostService } from '../services/cachedServices';

// Usage remains the same
const posts = await cachedPostService.getPosts(category, sortBy);
```

### Option 2: Add Caching to Existing Services

Modify your existing services to use caching internally:

```javascript
// In postService.js
import cacheService from './cacheService';

export const postService = {
  getPosts: async (category = null, sortBy = 'recent', limitCount = 50) => {
    const key = cacheService.keys.POSTS(category, sortBy);
    return cacheService.wrapper(
      key,
      async () => {
        // Your existing Firebase query logic
        const q = query(...);
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(...);
      },
      cacheService.config.POSTS_TTL
    );
  },
  
  createPost: async (postData, userId) => {
    const result = await addDoc(...);
    // Invalidate cache after creation
    await cacheService.invalidate('cache:posts:');
    return result;
  },
};
```

### Option 3: Use Cache Service Directly in Screens

Use the cache service directly in your components:

```javascript
import cacheService from '../services/cacheService';
import { postService } from '../services/postService';

const HomeScreen = () => {
  const loadPosts = async () => {
    const posts = await cacheService.getPosts(
      category,
      sortBy,
      () => postService.getPosts(category, sortBy),
      false // forceRefresh
    );
    setPosts(posts);
  };
};
```

## Common Patterns

### Pull-to-Refresh

```javascript
const handleRefresh = async () => {
  const posts = await cachedPostService.getPosts(category, sortBy, 50, true);
  // true = forceRefresh, bypasses cache
  setPosts(posts);
};
```

### Cache Invalidation

```javascript
// After creating/updating/deleting data
await cachedPostService.createPost(postData, userId);
// Cache is automatically invalidated

// Manual invalidation if needed
await cacheService.invalidatePost(postId);
await cacheService.invalidateProfile(profileId);
await cacheService.invalidateUser(userId);
```

### Clear Cache on Logout

```javascript
import cacheService from '../services/cacheService';

const handleLogout = async () => {
  await cacheService.clear(); // Clears all cache
  // ... rest of logout logic
};
```

### Check Cache Stats (Debugging)

```javascript
const stats = await cacheService.stats();
console.log('Cache entries:', stats.totalEntries);
console.log('By type:', stats.entries);
```

## Migration Steps

1. **Start with critical screens**: Add caching to HomeScreen and other frequently accessed screens first
2. **Test thoroughly**: Verify that data updates correctly after cache invalidation
3. **Monitor performance**: Check cache hit rates and adjust TTL values as needed
4. **Handle edge cases**: Consider offline scenarios and error handling

## Example: Updating HomeScreen

```javascript
// Before
const loadPosts = useCallback(async () => {
  const fetchedPosts = await postService.getPosts(category, selectedSort);
  setPosts(fetchedPosts);
}, [category, selectedSort]);

// After
import { cachedPostService } from '../services/cachedServices';

const loadPosts = useCallback(async () => {
  const fetchedPosts = await cachedPostService.getPosts(
    category,
    selectedSort,
    50,
    false // Use cache
  );
  setPosts(fetchedPosts);
}, [category, selectedSort]);

// Pull-to-refresh
const onTriggerRefresh = useCallback(async () => {
  const fetchedPosts = await cachedPostService.getPosts(
    category,
    selectedSort,
    50,
    true // Force refresh
  );
  setPosts(fetchedPosts);
}, [category, selectedSort]);
```

## Benefits

- ✅ **Faster load times**: Cached data loads instantly
- ✅ **Reduced Firebase costs**: Fewer read operations
- ✅ **Better offline experience**: Stale cache available when offline
- ✅ **Improved UX**: Instant data display on navigation
- ✅ **Automatic management**: No manual cache cleanup needed

## Notes

- Cache automatically expires based on TTL
- Cache is invalidated when data is created/updated/deleted
- Stale cache is returned if fetch fails (helps with offline scenarios)
- Cache uses AsyncStorage (persists across app restarts)
- Cache size is automatically managed

