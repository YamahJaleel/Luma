import React, { useState, useEffect, useCallback, useRef } from 'react';
import { StyleSheet, View, FlatList, Text, StatusBar, TouchableOpacity, ScrollView, Image, Modal, TextInput, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from 'react-native-paper';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { useTabContext } from '../components/TabContext';
import { postService } from '../services/postService';
import LottieView from 'lottie-react-native';
import { auth } from '../config/firebase';

// Categories data (could be moved to Firestore later)
const CATEGORIES = [
  { id: 'dating-advice', label: 'Dating' },
  { id: 'red-flags', label: 'Red Flags' },
  { id: 'success-stories', label: 'Green Flags' },
  { id: 'safety-tips', label: 'Safety' },
  { id: 'vent-space', label: 'Vent' },
];

// Category metadata
const CATEGORY_META = {
  'dating-advice': { icon: 'heart', color: '#EC4899' },
  'red-flags': { icon: 'warning', color: '#EF4444' },
  'success-stories': { icon: 'checkmark-circle', color: '#10B981' },
  'safety-tips': { icon: 'shield-checkmark', color: '#3B82F6' },
  'vent-space': { icon: 'chatbubble', color: '#8B5CF6' },
};

// CategoryPicker component
const CategoryPicker = ({ selectedCategory, onClick }) => {
  const theme = useTheme();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catList}>
      {CATEGORIES.map((c) => {
        const isActive = selectedCategory === c.id;
        const meta = CATEGORY_META[c.id];
        const bgColor = isActive ? theme.colors.primary : `${meta.color}25`;
        const borderColor = isActive ? theme.colors.primary : `${meta.color}40`;
        const iconColor = isActive ? '#FFFFFF' : meta.color;
        const textColor = isActive ? '#FFFFFF' : theme.colors.text;
        return (
          <TouchableOpacity
            key={c.id}
            style={[styles.catChip, { backgroundColor: bgColor, borderColor }, isActive && styles.catChipActive]}
            onPress={() => onClick(c.id)}
            activeOpacity={0.9}
          >
            <View style={styles.catChipContent}>
              <Ionicons name={meta.icon} size={14} color={iconColor} style={styles.catChipIcon} />
              <Text style={[styles.catChipText, { color: textColor }]}>{c.label}</Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

// Post item component
const PostItem = ({ item, onPress, onComment, onLike }) => {
  const theme = useTheme();
  const timeAgo = (date) => {
    if (!date) return 'just now';
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  };

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
      <View style={[styles.postCard, { backgroundColor: theme.colors.surface, borderColor: theme.dark ? '#374151' : '#E5E7EB' }]}>
        <View style={styles.postHeaderRow}>
          <View style={{ flex: 1 }} />
          <Text style={[styles.postMeta, { color: theme.dark ? theme.colors.text : '#9CA3AF' }]}>
            {timeAgo(item.createdAt)}
          </Text>
        </View>
        <Text style={[styles.postTitle, { color: theme.colors.text }]} numberOfLines={2}>{item.title}</Text>
        {item.text?.length ? (
          <Text style={[styles.postBody, theme.dark && { color: theme.colors.text }]} numberOfLines={3}>{item.text}</Text>
        ) : null}
        <View style={styles.postFooter}>
          <View style={styles.postActions}>
            <TouchableOpacity style={styles.postActionBtn} onPress={onComment}>
              <Ionicons name="chatbubble-outline" size={16} color={theme.dark ? '#9CA3AF' : '#6B7280'} />
              <Text style={[styles.actionText, theme.dark && { color: theme.colors.text }]}>{item.comments || 0}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.postActionBtn} onPress={onLike}>
              <Ionicons 
                name={item.isLiked ? 'heart' : 'heart-outline'} 
                size={16} 
                color={item.isLiked ? '#EF4444' : (theme.dark ? '#9CA3AF' : '#6B7280')} 
              />
              <Text style={[styles.actionText, theme.dark && { color: theme.colors.text }]}>{item.likes || 0}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Loading components
const PostLoader = () => <View style={styles.postLoader} />;
const CategoryLoader = () => <View style={styles.categoryLoader} />;

const HomeScreen = () => {
  const { dark, colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { setTabHidden, setHasUnreadNotifications } = useTabContext();
  const scrollYRef = useRef(0);

  const [posts, setPosts] = useState(null);
  const [category, setCategory] = useState('dating-advice');
  const [isLoading, setIsLoading] = useState(false);
  const pullY = useRef(new Animated.Value(0)).current;
  const [isPulling, setIsPulling] = useState(false);
  const [pullProgress, setPullProgress] = useState(0);
  const PULL_THRESHOLD = 90;
  const [showSortModal, setShowSortModal] = useState(false);
  const [selectedSort, setSelectedSort] = useState('recent');
  const [searchQuery, setSearchQuery] = useState('');

  // Load posts from Firebase
  const loadPosts = useCallback(async () => {
    try {
      const fetchedPosts = await postService.getPosts(
        category,
        selectedSort
      );

      // Get current user's likes
      const user = auth.currentUser;
      if (user) {
        const likedPosts = await postService.getLikedPosts(user.uid);
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

  // Handle post likes
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

      // Update in Firebase
      if (post.isLiked) {
        await postService.unlikePost(postId, user.uid);
      } else {
        await postService.likePost(postId, user.uid);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert optimistic update on error
      loadPosts();
    }
  };

  // Load initial data
  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  // Reload when screen is focused
  useFocusEffect(
    useCallback(() => {
      setTabHidden(false);
      loadPosts();
    }, [loadPosts])
  );

  // Custom pull-to-refresh handlers
  const onTriggerRefresh = useCallback(async () => {
    if (isLoading) return;
    const REFRESH_MIN_MS = 2000;
    const startedAt = Date.now();
    setIsLoading(true);
    try {
      await loadPosts();
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
  }, [isLoading, loadPosts, pullY]);

  const handlePullScroll = useCallback((e) => {
    const y = e.nativeEvent.contentOffset.y;
    if (y < 0 && !isLoading) {
      const dist = Math.min(-y, 140);
      pullY.setValue(dist);
      setIsPulling(true);
    } else if (!isLoading) {
      pullY.setValue(0);
      setIsPulling(false);
    }
  }, [isLoading, pullY]);

  const handlePullEnd = useCallback(() => {
    pullY.stopAnimation((val) => {
      if (val >= PULL_THRESHOLD && !isLoading) {
        onTriggerRefresh();
      } else {
        Animated.timing(pullY, { toValue: 0, duration: 180, useNativeDriver: false }).start(() => setIsPulling(false));
      }
    });
  }, [PULL_THRESHOLD, isLoading, onTriggerRefresh, pullY]);

  useEffect(() => {
    const id = pullY.addListener(({ value }) => {
      const p = Math.max(0, Math.min(1, value / PULL_THRESHOLD));
      setPullProgress(p);
    });
    return () => pullY.removeListener(id);
  }, [PULL_THRESHOLD, pullY]);

  // Handle search
  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  // Filter posts by search query
  const filterPosts = useCallback((postsToFilter) => {
    const query = (searchQuery || '').trim().toLowerCase();
    if (!query) return postsToFilter;
    return postsToFilter.filter((p) =>
      (p.title || '').toLowerCase().includes(query) ||
      (p.text || '').toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const sortOptions = [
    { id: 'recent', name: 'Most Recent', icon: 'time' },
    { id: 'top', name: 'Top Posts', icon: 'trending-up' },
    { id: 'liked', name: 'Most Liked', icon: 'heart' },
    { id: 'trending', name: 'Trending', icon: 'flame' },
    { id: 'comments', name: 'Most Comments', icon: 'chatbubble' },
  ];

  const canCreate = true;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      {posts ? (
        <FlatList
          data={filterPosts(posts)}
          extraData={isLoading}
          keyExtractor={(item) => item.id}
          onScroll={(e) => {
            handlePullScroll(e);
            const y = e.nativeEvent.contentOffset.y;
            const prevY = scrollYRef.current || 0;
            const dy = y - prevY;
            if (dy > 5 && y > 20) {
              setTabHidden(true);
            } else if (dy < -15 || y <= 20) {
              setTabHidden(false);
            }
            scrollYRef.current = y;
          }}
          onScrollEndDrag={handlePullEnd}
          scrollEventThrottle={16}
          ListHeaderComponent={
            <View>
              {/* Pull-to-refresh header */}
              <Animated.View style={{ height: pullY, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 0 }}>
                {isLoading ? (
                  <View style={{ width: 140, height: 84, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', marginTop: 12 }}>
                    <LottieView
                      source={require('../assets/animations/Load.json')}
                      style={{ width: 180, height: 132 }}
                      autoPlay
                      loop
                    />
                  </View>
                ) : (
                  <View style={{ width: 140, height: 84, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', marginTop: 12 }}>
                    <LottieView
                      source={require('../assets/animations/Load.json')}
                      style={{ width: 180, height: 132 }}
                      autoPlay={false}
                      loop={false}
                      progress={pullProgress}
                    />
                  </View>
                )}
              </Animated.View>
              <View style={styles.header}>
                <View style={styles.headerTopRow}>
                  <View style={styles.headerRow}>
                    <Image source={require('../assets/AppIcon.png')} style={styles.headerLogo} />
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Luma</Text>
                  </View>
                </View>
              </View>
              <CategoryPicker selectedCategory={category} onClick={setCategory} />
              <View style={styles.actionsUnderCats}>
                <View style={[styles.searchPill, { backgroundColor: colors.surface }]}>
                  <Ionicons name="search" size={16} color={colors.primary} />
                  <TextInput
                    style={[styles.searchPillInput, { color: colors.text }]}
                    placeholder="Search posts"
                    placeholderTextColor={colors.placeholder}
                    value={searchQuery}
                    onChangeText={handleSearch}
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => handleSearch('')}>
                      <Ionicons name="close-circle" size={18} color={colors.placeholder} />
                    </TouchableOpacity>
                  )}
                </View>
                <TouchableOpacity 
                  style={[styles.iconSquare, { backgroundColor: colors.surface }]} 
                  onPress={() => setShowSortModal(true)}
                >
                  <Ionicons name="filter" size={18} color="#3E5F44" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.iconSquare, { backgroundColor: colors.surface, opacity: canCreate ? 1 : 0.5 }]}
                  onPress={canCreate ? () => navigation.navigate('CreatePost', { communityId: category }) : undefined}
                  disabled={!canCreate}
                >
                  <Ionicons name="add" size={18} color={canCreate ? '#3E5F44' : colors.placeholder} />
                </TouchableOpacity>
              </View>
            </View>
          }
          ListHeaderComponentStyle={[styles.categoryPicker, { backgroundColor: 'transparent' }]}
          ListEmptyComponent={
            <Text style={[styles.empty, { color: colors.text }]}>
              {searchQuery ? 'No posts found matching your search' : 'No posts yet'}
            </Text>
          }
          renderItem={({ item }) => (
            <PostItem
              item={item}
              onPress={() => navigation.navigate('PostDetail', { post: item })}
              onComment={() => navigation.navigate('PostDetail', { post: item })}
              onLike={() => handleLike(item.id)}
            />
          )}
          contentContainerStyle={{ paddingBottom: 12 }}
        />
      ) : (
        <>
          <CategoryLoader />
          {[1, 2, 3, 4, 5].map((i) => (
            <PostLoader key={i} />
          ))}
        </>
      )}

      {/* Sort Modal */}
      <Modal visible={showSortModal} transparent={true} animationType="fade" onRequestClose={() => setShowSortModal(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSortModal(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Sort Posts</Text>
              <TouchableOpacity onPress={() => setShowSortModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            {sortOptions.map((opt) => (
              <TouchableOpacity
                key={opt.id}
                style={[styles.sortOption, selectedSort === opt.id && styles.selectedSortOption]}
                onPress={() => {
                  setSelectedSort(opt.id);
                  setShowSortModal(false);
                  loadPosts();
                }}
              >
                <Ionicons name={opt.icon} size={16} color={selectedSort === opt.id ? 'white' : '#6B7280'} />
                <Text style={[styles.sortOptionText, selectedSort === opt.id && styles.selectedSortOptionText]}>
                  {opt.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 0 },
  headerTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  headerLogo: { width: 40, height: 40, borderRadius: 12, marginRight: 10 },
  headerTitle: { fontSize: 26, fontWeight: 'bold' },
  categoryPicker: { padding: 5, marginTop: 0, marginBottom: 4, elevation: 3 },
  catList: { paddingHorizontal: 10, paddingVertical: 6, gap: 8, backgroundColor: 'transparent' },
  catChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1 },
  catChipActive: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  catChipContent: { flexDirection: 'row', alignItems: 'center' },
  catChipIcon: { marginRight: 6 },
  catChipText: { fontWeight: '700', fontSize: 13, textTransform: 'capitalize' },
  empty: { fontWeight: 'bold', textAlign: 'center', marginTop: 50, fontSize: 22 },
  postCard: {
    marginHorizontal: 12,
    marginBottom: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  postHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  postMeta: { fontSize: 12, fontWeight: '600' },
  postTitle: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
  postBody: { fontSize: 14, marginBottom: 8 },
  postFooter: { flexDirection: 'row', alignItems: 'center' },
  postActions: { flexDirection: 'row', alignItems: 'center' },
  postActionBtn: { flexDirection: 'row', alignItems: 'center', marginRight: 18, paddingVertical: 2 },
  actionText: { fontSize: 13, color: '#6B7280', marginLeft: 4, fontWeight: '600' },
  postLoader: {
    height: 100,
    marginHorizontal: 12,
    marginBottom: 10,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
  },
  categoryLoader: {
    height: 42,
    marginHorizontal: 12,
    marginTop: 10,
    marginBottom: 4,
    borderRadius: 999,
    backgroundColor: '#E5E7EB',
  },
  actionsUnderCats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 4,
    paddingHorizontal: 16,
  },
  iconSquare: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginLeft: 8,
  },
  searchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 10,
    flex: 1,
  },
  searchPillInput: { flex: 1, fontSize: 13, paddingVertical: 0 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    width: '80%',
    maxHeight: '60%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: { fontSize: 17, fontWeight: 'bold' },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 6,
  },
  selectedSortOption: { backgroundColor: '#3E5F44' },
  sortOptionText: { fontSize: 15, fontWeight: '600', color: '#6B7280', marginLeft: 10 },
  selectedSortOptionText: { color: 'white' },
});

export default HomeScreen;