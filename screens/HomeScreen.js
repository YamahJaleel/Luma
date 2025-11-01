import React, { useState, useEffect, useCallback, useRef } from 'react';
import { StyleSheet, View, FlatList, Text, StatusBar, TouchableOpacity, ScrollView, Image, Modal, TextInput, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from 'react-native-paper';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { useTabContext } from '../components/TabContext';
import { cachedPostService } from '../services/cachedServices';
import LottieView from 'lottie-react-native';
import { auth } from '../config/firebase';
import { normalizeForSearch } from '../utils/normalization';

// Categories data (could be moved to Firestore later)
const CATEGORIES = [
  { id: 'dating', label: 'Dating' },
  { id: 'red flags', label: 'Red Flags' },
  { id: 'green flags', label: 'Green Flags' },
  { id: 'safety', label: 'Safety' },
  { id: 'vent', label: 'Vent' },
];

// Category metadata
const CATEGORY_META = {
  'dating': { icon: 'heart', color: '#EC4899' },
  'red flags': { icon: 'warning', color: '#EF4444' },
  'green flags': { icon: 'checkmark-circle', color: '#10B981' },
  'safety': { icon: 'shield-checkmark', color: '#3B82F6' },
  'vent': { icon: 'chatbubble', color: '#8B5CF6' },
};

// Community Dropdown Component
const CommunityDropdown = ({ selectedCategory, onCategoryChange, theme, onToggle, isOpen }) => {
  const [animation] = useState(new Animated.Value(0));
  const [rotateAnimation] = useState(new Animated.Value(0));

  useEffect(() => {
    const toValue = isOpen ? 1 : 0;
    const rotateToValue = isOpen ? 1 : 0;
    
    Animated.parallel([
      Animated.timing(animation, {
        toValue,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(rotateAnimation, {
        toValue: rotateToValue,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isOpen]);

  const handleCategorySelect = (categoryId) => {
    onCategoryChange(categoryId);
    onToggle();
  };

  const selectedCategoryData = CATEGORIES.find(c => c.id === selectedCategory);
  const selectedMeta = CATEGORY_META[selectedCategory];

  const dropdownHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, CATEGORIES.length * 28], // Much smaller height per item
  });

  const rotateInterpolate = rotateAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View style={styles.dropdownContainer}>
      <TouchableOpacity 
        style={styles.dropdownArrow}
        onPress={onToggle}
        activeOpacity={0.8}
      >
        <Animated.View style={{ transform: [{ rotate: rotateInterpolate }] }}>
          <Ionicons name="chevron-down" size={16} color={theme.colors.primary} />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
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
  const [category, setCategory] = useState('dating');
  const [isLoading, setIsLoading] = useState(false);
  const pullY = useRef(new Animated.Value(0)).current;
  const [isPulling, setIsPulling] = useState(false);
  const [pullProgress, setPullProgress] = useState(0);
  const PULL_THRESHOLD = 90;
  const [showSortModal, setShowSortModal] = useState(false);
  const [selectedSort, setSelectedSort] = useState('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  // Load posts from Firebase with caching
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

  // Load initial data
  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  // Hide/show tab bar when screen is focused/unfocused
  useFocusEffect(
    useCallback(() => {
      setTabHidden(false);
      // If navigated back with a refresh flag or a deleted post id, refresh feed
      if (route?.params?.refresh || route?.params?.deletedPostId) {
        if (route.params.deletedPostId && Array.isArray(posts)) {
          // Optimistically remove the deleted post from current state
          setPosts(prev => (prev ? prev.filter(p => p.id !== route.params.deletedPostId) : prev));
        }
        // Reload posts to ensure consistency
        loadPosts();
        // Clear params so we don't reload again on next focus
        navigation.setParams({ refresh: undefined, deletedPostId: undefined });
      }
    }, [setTabHidden])
  );

  // Custom pull-to-refresh handlers - force refresh to bypass cache
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
    setSearchInput(query);
  }, []);

  // Handle search input change
  const handleSearchInputChange = useCallback((text) => {
    setSearchInput(text);
    setSearchQuery(text);
  }, []);

  // Filter posts by search query
  const filterPosts = useCallback((postsToFilter) => {
    const query = normalizeForSearch(searchQuery);
    if (!query) return postsToFilter;
    return postsToFilter.filter((p) =>
      normalizeForSearch(p.title).includes(query) ||
      normalizeForSearch(p.text).includes(query)
    );
  }, [searchQuery]);

  const sortOptions = [
    { id: 'recent', name: 'Most Recent', icon: 'time', description: 'Latest posts first' },
    { id: 'liked', name: 'Most Liked', icon: 'heart', description: 'Highest engagement' },
    { id: 'comments', name: 'Most Comments', icon: 'chatbubble', description: 'Most discussed' },
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
            <View style={{ zIndex: 10000 }}>
              <View>
                {/* Pull-to-refresh header */}
                <Animated.View style={{ height: pullY, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 0 }}>
                  {isLoading ? (
                    <View style={{ width: 180, height: 100, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', marginTop: 12 }}>
                      <LottieView
                        source={require('../assets/animations/Load.json')}
                        style={{ width: 220, height: 160 }}
                        autoPlay
                        loop
                      />
                    </View>
                  ) : (
                    <View style={{ width: 180, height: 100, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', marginTop: 12 }}>
                      <LottieView
                        source={require('../assets/animations/Load.json')}
                        style={{ width: 220, height: 160 }}
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
                      <CommunityDropdown 
                        selectedCategory={category} 
                        onCategoryChange={setCategory}
                        theme={{ colors }}
                        onToggle={() => setShowDropdown(!showDropdown)}
                        isOpen={showDropdown}
                      />
                    </View>
                    <View style={styles.headerRightButtons}>
                      <TouchableOpacity 
                        style={[styles.headerIconSquare, { backgroundColor: colors.surface }]}
                        onPress={() => setShowSearchModal(true)}
                      >
                        <Ionicons name="search" size={16} color={colors.primary} />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.headerIconSquare, { backgroundColor: colors.surface }]} 
                        onPress={() => setShowSortModal(true)}
                      >
                        <Ionicons name="filter" size={18} color={colors.primary} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.headerIconSquare, { backgroundColor: colors.surface, opacity: canCreate ? 1 : 0.5 }]}
                        onPress={canCreate ? () => navigation.navigate('CreatePost', { communityId: category }) : undefined}
                        disabled={!canCreate}
                      >
                        <Ionicons name="add" size={18} color={canCreate ? colors.primary : colors.placeholder} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          }
          ListHeaderComponentStyle={[styles.categoryPicker, { backgroundColor: 'transparent' }]}
          ListEmptyComponent={null}
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
          <View style={[styles.sortModalContent, { backgroundColor: '#FFFFFF' }]}>
            <View style={styles.sortModalHeader}>
              <View style={styles.sortModalTitleContainer}>
                <Ionicons name="swap-vertical" size={20} color="#3E5F44" />
                <Text style={styles.sortModalTitle}>Sort Posts</Text>
              </View>
              <TouchableOpacity 
                style={styles.sortModalCloseButton}
                onPress={() => setShowSortModal(false)}
              >
                <Ionicons name="close" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.sortOptionsContainer}>
              {sortOptions.map((opt) => (
                <TouchableOpacity
                  key={opt.id}
                  style={[
                    styles.sortOptionCard, 
                    selectedSort === opt.id && styles.selectedSortOptionCard
                  ]}
                    onPress={() => {
                      setSelectedSort(opt.id);
                      setShowSortModal(false);
                      // loadPosts will be called automatically via useEffect dependency
                    }}
                >
                  <View style={[
                    styles.sortOptionIconContainer,
                    selectedSort === opt.id && styles.selectedSortOptionIconContainer
                  ]}>
                    <Ionicons 
                      name={opt.icon} 
                      size={18} 
                      color={selectedSort === opt.id ? '#FFFFFF' : '#3E5F44'} 
                    />
                  </View>
                  <View style={styles.sortOptionTextContainer}>
                    <Text style={[
                      styles.sortOptionText, 
                      selectedSort === opt.id && styles.selectedSortOptionText
                    ]}>
                      {opt.name}
                    </Text>
                    <Text style={[
                      styles.sortOptionDescription,
                      selectedSort === opt.id && styles.selectedSortOptionDescription
                    ]}>
                      {opt.description}
                    </Text>
                  </View>
                  {selectedSort === opt.id && (
                    <Ionicons name="checkmark-circle" size={20} color="#3E5F44" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Search Modal */}
      <Modal visible={showSearchModal} transparent={true} animationType="fade" onRequestClose={() => setShowSearchModal(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSearchModal(false)}
        >
          <View style={[styles.searchModalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Search Posts</Text>
              <TouchableOpacity onPress={() => setShowSearchModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            {/* Search Input */}
            <View style={[styles.searchInputContainer, { backgroundColor: '#FFFFFF' }]}>
              <Ionicons name="search" size={20} color={colors.primary} style={styles.searchIcon} />
              <TextInput
                style={[styles.searchTextInput, { color: '#1F2937' }]}
                placeholder="Search posts..."
                placeholderTextColor="#6B7280"
                value={searchInput}
                onChangeText={handleSearchInputChange}
                autoFocus
              />
              {searchInput.length > 0 && (
                <TouchableOpacity onPress={() => handleSearch('')}>
                  <Ionicons name="close-circle" size={20} color="#6B7280" />
                </TouchableOpacity>
              )}
            </View>

            {/* Search Results */}
            <FlatList
              data={filterPosts(posts || [])}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <PostItem
                  item={item}
                  onPress={() => {
                    setShowSearchModal(false);
                    navigation.navigate('PostDetail', { post: item });
                  }}
                  onComment={() => {
                    setShowSearchModal(false);
                    navigation.navigate('PostDetail', { post: item });
                  }}
                  onLike={() => handleLike(item.id)}
                />
              )}
              contentContainerStyle={{ paddingBottom: 12 }}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                searchInput.trim() ? (
                  <View style={styles.emptySearchContainer}>
                    <Ionicons name="search" size={48} color="#E2E8F0" />
                    <Text style={[styles.emptySearchTitle, { color: colors.text }]}>No Results Found</Text>
                    <Text style={[styles.emptySearchSubtitle, { color: colors.placeholder }]}>
                      No posts found for "{searchInput}". Try searching with different keywords.
                    </Text>
                  </View>
                ) : (
                  <View style={styles.emptySearchContainer}>
                    <Ionicons name="search" size={48} color="#E2E8F0" />
                    <Text style={[styles.emptySearchTitle, { color: colors.text }]}>Search Posts</Text>
                    <Text style={[styles.emptySearchSubtitle, { color: colors.placeholder }]}>
                      Enter keywords to search through post titles and content.
                    </Text>
                  </View>
                )
              }
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Dropdown Modal - Rendered outside FlatList */}
      <Modal visible={showDropdown} transparent={true} animationType="fade" onRequestClose={() => setShowDropdown(false)}>
        <TouchableOpacity
          style={styles.dropdownModalOverlay}
          activeOpacity={1}
          onPress={() => setShowDropdown(false)}
        >
          <View style={[styles.dropdownModalContent, { backgroundColor: colors.surface }]}>
            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 0, paddingTop: 0 }}
            >
              {CATEGORIES.map((categoryItem) => {
                const meta = CATEGORY_META[categoryItem.id];
                const isSelected = category === categoryItem.id;
                
                return (
                  <TouchableOpacity
                    key={categoryItem.id}
                    style={[
                      styles.dropdownItem,
                      isSelected && { backgroundColor: `${meta.color}15` },
                      categoryItem.id === CATEGORIES[CATEGORIES.length - 1].id && { borderBottomWidth: 0 }
                    ]}
                    onPress={() => {
                      setCategory(categoryItem.id);
                      setShowDropdown(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.dropdownItemContent}>
                      <Ionicons 
                        name={meta.icon} 
                        size={16} 
                        color={isSelected ? meta.color : colors.text} 
                      />
                      <Text style={[
                        styles.dropdownItemText, 
                        { 
                          color: isSelected ? meta.color : colors.text,
                          fontWeight: isSelected ? '600' : '400'
                        }
                      ]}>
                        {categoryItem.label}
                      </Text>
                      {isSelected && (
                        <Ionicons name="checkmark" size={16} color={meta.color} />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 0, zIndex: 10000 },
  headerTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', zIndex: 10000 },
  headerRow: { flexDirection: 'row', alignItems: 'center', flex: 1, zIndex: 10000 },
  headerRightButtons: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerLogo: { width: 40, height: 40, borderRadius: 12, marginRight: 10 },
  headerTitle: { fontSize: 26, fontWeight: 'bold', marginRight: 2 },
  headerIconSquare: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  // Dropdown styles
  dropdownContainer: {
    position: 'relative',
    zIndex: 9999,
  },
  dropdownArrow: {
    padding: 4,
  },
  dropdownList: {
    position: 'absolute',
    top: '100%',
    left: -60,
    right: -60,
    minWidth: 200,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    overflow: 'hidden',
    marginTop: 4,
    zIndex: 9999,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dropdownItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dropdownItemText: {
    fontSize: 15,
    flex: 1,
  },
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 4,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  searchBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    marginRight: 16,
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
  
  // New Sort Modal Styles
  sortModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  sortModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sortModalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginLeft: 8,
  },
  sortModalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sortOptionsContainer: {
    gap: 8,
  },
  sortOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedSortOptionCard: {
    backgroundColor: '#ECFDF5',
    borderColor: '#3E5F44',
    borderWidth: 2,
  },
  sortOptionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedSortOptionIconContainer: {
    backgroundColor: '#3E5F44',
    borderColor: '#3E5F44',
  },
  sortOptionTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  sortOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  selectedSortOptionText: {
    color: '#3E5F44',
  },
  sortOptionDescription: {
    fontSize: 13,
    fontWeight: '400',
    color: '#6B7280',
  },
  selectedSortOptionDescription: {
    color: '#059669',
  },
  // Search Modal Styles
  searchModalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    width: '90%',
    maxHeight: '80%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: { marginRight: 12 },
  searchTextInput: { flex: 1, fontSize: 16, paddingVertical: 0 },
  emptySearchContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptySearchTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 16, marginBottom: 8 },
  emptySearchSubtitle: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  // Dropdown Modal Styles
  dropdownModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 100, // Position below the header
  },
  dropdownModalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    overflow: 'hidden',
    minWidth: 200,
    maxHeight: 160, // Much smaller max height
  },
});

export default HomeScreen;