// Example integration snippet for HomeScreen.js
// Replace the loadPosts function with this cached version

import { cachedPostService } from '../services/cachedServices';

// Updated loadPosts with caching
const loadPosts = useCallback(async () => {
  try {
    // Use cached service - automatically uses cache if available
    const fetchedPosts = await cachedPostService.getPosts(
      category,
      selectedSort,
      50, // limitCount
      false // forceRefresh = false (use cache)
    );

    // Get current user's likes (also cached)
    const user = auth.currentUser;
    if (user) {
      const likedPosts = await cachedPostService.getLikedPosts(user.uid, false);
      const likedPostIds = new Set(likedPosts.map(post => post.id));
      
      // Mark liked posts
      fetchedPosts.forEach(post => {
        post.isLiked = likedPostIds.has(post.id);
      });
    }

    setPosts(fetchedPosts);
  } catch (error) {
    console.error('Error loading posts:', error);
    // Keep existing posts if there's an error
  } finally {
    // Caller controls isLoading timing to keep the Lottie animation visible
  }
}, [category, selectedSort]);

// Updated pull-to-refresh handler - force refresh to bypass cache
const onTriggerRefresh = useCallback(async () => {
  if (isLoading) return;
  const REFRESH_MIN_MS = 2000;
  const startedAt = Date.now();
  setIsLoading(true);
  try {
    // Force refresh - bypasses cache
    const fetchedPosts = await cachedPostService.getPosts(
      category,
      selectedSort,
      50,
      true // forceRefresh = true (bypass cache)
    );

    // Get fresh liked posts
    const user = auth.currentUser;
    if (user) {
      const likedPosts = await cachedPostService.getLikedPosts(user.uid, true);
      const likedPostIds = new Set(likedPosts.map(post => post.id));
      
      fetchedPosts.forEach(post => {
        post.isLiked = likedPostIds.has(post.id);
      });
    }

    setPosts(fetchedPosts);
  } finally {
    const elapsed = Date.now() - startedAt;
    const remaining = Math.max(0, REFRESH_MIN_MS - elapsed);
    setTimeout(() => {
      Animated.timing(pullY, { toValue: 0, duration: 300, useNativeDriver: false }).start(() => {
        setIsPulling(false);
        setIsLoading(false);
      });
    }, remaining);
  }
}, [isLoading, category, selectedSort, pullY]);

// Also update handleLike to use cached service for cache invalidation
const handleLike = async (postId) => {
  const user = auth.currentUser;
  if (!user) {
    navigation.navigate('SignIn');
    return;
  }

  try {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    // Optimistically update UI
    setPosts(currentPosts => 
      currentPosts.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            isLiked: !p.isLiked,
            likes: p.likes + (p.isLiked ? -1 : 1)
          };
        }
        return p;
      })
    );

    // Update in Firebase (cached service handles cache invalidation)
    if (post.isLiked) {
      await cachedPostService.unlikePost(postId, user.uid);
    } else {
      await cachedPostService.likePost(postId, user.uid);
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    // Revert optimistic update on error
    loadPosts();
  }
};

