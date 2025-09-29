import React from 'react';
import { StyleSheet, View, FlatList, Text, StatusBar, TouchableOpacity, ScrollView, Image, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useTabContext } from '../components/TabContext';

// Local mock categories/posts to emulate the pasted clone Home
const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'dating-advice', label: 'Dating' },
  { id: 'red-flags', label: 'Red Flags' },
  { id: 'success-stories', label: 'Green Flags' },
  { id: 'safety-tips', label: 'Safety' },
  { id: 'vent-space', label: 'Vent' },
];

const MOCK_POSTS = [
  {
    id: 'p1',
    score: 45,
    type: 'experience',
    title: 'Red Flag Alert',
    author: 'u/alex',
    category: 'red-flags',
    text:
      'Sharing an experience from last week: things moved way too fast, and compliments turned into pressure. It started with constant texting, then subtle guilt trips when I needed space. Please watch for sudden "you\'re my everything" talk paired with boundary pushing. If your gut tenses up, listen to it. You don\'t owe endless explanations for needing time, and respectful people won\'t keep testing limits. Stay safe and trust your pace.',
    comments: 12,
    likes: 67,
    created: '2h',
    url: '',
    votes: {},
    views: 321,
  },
  {
    id: 'p2',
    score: 23,
    type: 'question',
    title: 'Advice Needed',
    author: 'u/sam',
    category: 'dating-advice',
    text:
      'Is it normal for someone you just started chatting with to ask for your live location? I set a boundary and said I\'m not comfortable sharing that, but they keep asking for "just a quick ping." How would you respond or shut this down kindly but firmly? Any sample scripts that worked for you are appreciated.',
    comments: 8,
    likes: 34,
    created: '4h',
    url: '',
    votes: {},
    views: 210,
  },
  {
    id: 'p3',
    score: 67,
    type: 'positive',
    title: 'Success Story',
    author: 'u/jane',
    category: 'success-stories',
    text:
      'Wanted to share a bright spot: I slowed down, prioritized my comfort, and met someone who genuinely respected my pace. We planned daytime coffee first, had clear check-ins, and they consistently honored my boundaries. It felt calm and easy. If you\'re in a tough patch, there are kind people out there who will meet you where you are.',
    comments: 15,
    likes: 123,
    created: '1d',
    url: '',
    votes: {},
    views: 589,
  },
  {
    id: 'p4',
    score: 34,
    type: 'question',
    title: 'First Date Tips',
    author: 'u/lily',
    category: 'dating-advice',
    text:
      'First date in a while and I\'m nervous. Any practical tips to keep conversation flowing without oversharing? I\'m thinking open-ended questions about hobbies, travel, and favorite local spots, plus a hard stop time so I can leave on a high note. What else helps you feel grounded and confident?',
    comments: 18,
    likes: 56,
    created: '1h',
    url: '',
    votes: {},
    views: 145,
  },
  {
    id: 'p5',
    score: 78,
    type: 'warning',
    title: 'Love Bombing Alert',
    author: 'u/max',
    category: 'red-flags',
    text:
      'PSA: If someone you barely know is already future-planning intensely, flooding you with gifts, and getting upset when you need time alone—please pause. Love bombing can feel flattering at first, but it\'s often followed by control. Slow the pace, loop in a friend, and check how you feel after a little distance.',
    comments: 31,
    likes: 145,
    created: '30m',
    url: '',
    votes: {},
    views: 802,
  },
];

// Category icon/color metas for nicer chips
const CATEGORY_META = {
  'all': { icon: 'grid', color: '#0D9488' },
  'dating-advice': { icon: 'heart', color: '#EC4899' },
  'red-flags': { icon: 'warning', color: '#EF4444' },
  'success-stories': { icon: 'checkmark-circle', color: '#10B981' },
  'safety-tips': { icon: 'shield-checkmark', color: '#3B82F6' },
  'vent-space': { icon: 'chatbubble', color: '#8B5CF6' },
};

// CategoryPicker (inline, mimics clone props)
const CategoryPicker = ({ selectedCategory, onClick, addAll = true }) => {
  const theme = useTheme();
  const items = addAll ? CATEGORIES : CATEGORIES.filter((c) => c.id !== 'all');
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catList}>
      {items.map((c) => {
        const isActive = (selectedCategory || 'all') === c.id;
        const meta = CATEGORY_META[c.id] || CATEGORY_META['all'];
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

// Post item (inline, lightweight)
const PostItem = ({ item, onPress, onComment, onLike }) => {
  const theme = useTheme();
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
      <View style={[styles.postCard, { backgroundColor: theme.colors.surface, borderColor: theme.dark ? '#374151' : '#E5E7EB' }]}>
        <View style={styles.postHeaderRow}>
          <View style={{ flex: 1 }} />
          <Text style={[styles.postMeta, { color: theme.dark ? theme.colors.text : '#9CA3AF' }]}>{item.created}</Text>
        </View>
      <Text style={[styles.postTitle, { color: theme.colors.text }]} numberOfLines={2}>{item.title}</Text>
      {item.text?.length ? (
        <Text style={[styles.postBody, theme.dark && { color: theme.colors.text }]} numberOfLines={3}>{item.text}</Text>
      ) : null}
      <View style={styles.postFooter}>
        <View style={styles.postActions}>
          <TouchableOpacity style={styles.postActionBtn} onPress={onComment}>
            <Ionicons name="chatbubble-outline" size={16} color={theme.dark ? '#9CA3AF' : '#6B7280'} />
            <Text style={[styles.actionText, theme.dark && { color: theme.colors.text }]}>{item.comments}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.postActionBtn} onPress={onLike}>
            <Ionicons name={item.liked ? 'heart' : 'heart-outline'} size={16} color={item.liked ? '#EF4444' : (theme.dark ? '#9CA3AF' : '#6B7280')} />
            <Text style={[styles.actionText, theme.dark && { color: theme.colors.text }]}>{item.likes || 0}</Text>
          </TouchableOpacity>
        </View>
      </View>
      </View>
    </TouchableOpacity>
  );
};

// Loaders (simple placeholders)
const PostLoader = () => <View style={styles.postLoader} />;
const CategoryLoader = () => <View style={styles.categoryLoader} />;

const HomeScreen = () => {
  const { dark, colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { setTabHidden, setHasUnreadNotifications } = useTabContext();
  const scrollYRef = React.useRef(0);

  const [postData, setPostData] = React.useState(null);
  const [category, setCategory] = React.useState('all');
  const [isLoading, setIsLoading] = React.useState(false);
  const [showSortModal, setShowSortModal] = React.useState(false);
  const [selectedSort, setSelectedSort] = React.useState('recent');
  const [showSearchModal, setShowSearchModal] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  // Handle new post from CreatePostScreen
  React.useEffect(() => {
    if (route.params?.newPost) {
      const newPost = route.params.newPost;
      // Add the new post to the beginning of the current posts
      setPostData(prev => {
        if (!prev) return [newPost];
        return [newPost, ...prev];
      });
      
      // Save the new post to AsyncStorage for CreatedPostsScreen
      (async () => {
        try {
          const createdPostsData = await AsyncStorage.getItem('createdPosts');
          const createdPosts = createdPostsData ? JSON.parse(createdPostsData) : [];
          
          // Check if post already exists (to avoid duplicates)
          const exists = createdPosts.some(post => post.id === newPost.id);
          if (!exists) {
            // Add new post to the beginning of createdPosts array
            const updatedPosts = [newPost, ...createdPosts];
            await AsyncStorage.setItem('createdPosts', JSON.stringify(updatedPosts));
          }

          // Create an in-app notification for the new post
          try {
            const notificationsRaw = await AsyncStorage.getItem('notifications');
            const notifications = notificationsRaw ? JSON.parse(notificationsRaw) : [];
            const categoryLabel = (CATEGORIES.find(c => c.id === (newPost.category || ''))?.label) || 'Community';
            const newNotification = {
              id: Date.now(),
              type: 'community',
              title: `New post in ${categoryLabel}`,
              message: newPost.title,
              timestamp: 'Just now',
              isRead: false,
              community: categoryLabel,
              communityId: newPost.category,
              postId: newPost.id,
              icon: 'people',
              color: '#6B7280',
            };
            const updatedNotifications = [newNotification, ...notifications];
            await AsyncStorage.setItem('notifications', JSON.stringify(updatedNotifications));
            // Mark app tab as having unread notifications
            setHasUnreadNotifications(true);
          } catch (err) {
            // ignore in dev
          }
        } catch (error) {
          console.error('Error saving new post to AsyncStorage:', error);
        }
      })();
      
      // Clear the route params to prevent re-adding on re-renders
      navigation.setParams({ newPost: undefined });
    }
  }, [route.params?.newPost, navigation]);

  // Handle deleted post from PostDetailScreen
  React.useEffect(() => {
    if (route.params?.deletedPostId) {
      const deletedPostId = route.params.deletedPostId;
      // Remove the deleted post from the current posts
      setPostData(prev => {
        if (!prev) return prev;
        return prev.filter(post => post.id !== deletedPostId);
      });
      // Clear the route params to prevent re-removing on re-renders
      navigation.setParams({ deletedPostId: undefined });
    }
  }, [route.params?.deletedPostId, navigation]);

  const toggleLike = React.useCallback((id) => {
    setPostData((prev) => {
      if (!prev) return prev;
      const updated = prev.map((p) => {
        if (p.id !== id) return p;
        const liked = !p.liked;
        const likes = (p.likes || 0) + (liked ? 1 : -1);
        const next = { ...p, liked, likes: likes < 0 ? 0 : likes };
        // Persist liked posts to AsyncStorage
        (async () => {
          try {
            const raw = await AsyncStorage.getItem('likedPosts');
            const current = raw ? JSON.parse(raw) : [];
            const exists = current.some((x) => x.id === next.id);
            let nextArr = current;
            if (next.liked && !exists) {
              nextArr = [{ ...next }, ...current].slice(0, 200);
            } else if (!next.liked && exists) {
              nextArr = current.filter((x) => x.id !== next.id);
            }
            await AsyncStorage.setItem('likedPosts', JSON.stringify(nextArr));
          } catch (e) {
            // ignore storage errors in dev
          }
        })();
        return next;
      });
      return updated;
    });
  }, []);

  const sortOptions = [
    { id: 'recent', name: 'Most Recent', icon: 'time' },
    { id: 'top', name: 'Top Posts', icon: 'trending-up' },
    { id: 'liked', name: 'Most Liked', icon: 'heart' },
    { id: 'trending', name: 'Trending', icon: 'flame' },
    { id: 'comments', name: 'Most Comments', icon: 'chatbubble' },
  ];

  const sortPosts = React.useCallback((posts) => {
    switch (selectedSort) {
      case 'recent':
        return [...posts].sort((a, b) => {
          const toHours = (t) => {
            if (!t) return 0;
            if (t.includes('m')) return Math.max(0, parseInt(t)) / 60;
            if (t.includes('h')) return parseInt(t);
            if (t.includes('d')) return parseInt(t) * 24;
            return 0;
          };
          return toHours(a.created) - toHours(b.created);
        });
      case 'top':
        return [...posts].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
      case 'liked':
        return [...posts].sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0));
      case 'trending':
        return [...posts].sort((a, b) => (b.views ?? 0) - (a.views ?? 0));
      case 'comments':
        return [...posts].sort((a, b) => (b.comments ?? 0) - (a.comments ?? 0));
      default:
        return posts;
    }
  }, [selectedSort]);

  const getPostData = React.useCallback(async () => {
    setIsLoading(true);
    // Simulate network delay and filter by category
    setTimeout(async () => {
      try {
        // Load liked posts from AsyncStorage
        const raw = await AsyncStorage.getItem('likedPosts');
        const likedPosts = raw ? JSON.parse(raw) : [];
        const likedMap = {};
        const likesMap = {};
        likedPosts.forEach(post => {
          likedMap[post.id] = true;
          likesMap[post.id] = post.likes; // Store the actual like count
        });

        // Filter posts by category and restore liked state
        const filteredPosts = category === 'all' ? MOCK_POSTS : MOCK_POSTS.filter((p) => p.category === category);
        const dataWithLikes = filteredPosts.map(post => ({
          ...post,
          liked: !!likedMap[post.id],
          likes: likesMap[post.id] !== undefined ? likesMap[post.id] : post.likes // Use stored like count if available
        }));
        
        // Load created posts to check for deletions
        const createdPostsRaw = await AsyncStorage.getItem('createdPosts');
        const createdPosts = createdPostsRaw ? JSON.parse(createdPostsRaw) : [];
        const createdPostIds = new Set(createdPosts.map(p => p.id));
        
        // Preserve any new posts that were added locally (not in MOCK_POSTS)
        setPostData(prev => {
          if (!prev) return dataWithLikes;
          
          // Find posts that are not in MOCK_POSTS (these are new posts)
          const mockPostIds = new Set(MOCK_POSTS.map(p => p.id));
          const newPosts = prev.filter(post => !mockPostIds.has(post.id));
          
          // Filter out posts that have been deleted from createdPosts
          const validNewPosts = newPosts.filter(post => createdPostIds.has(post.id));
          
          // Filter new posts by category if needed
          const filteredNewPosts = category === 'all' ? validNewPosts : validNewPosts.filter(p => p.category === category);
          
          // Apply liked state to new posts as well
          const newPostsWithLikes = filteredNewPosts.map(post => ({
            ...post,
            liked: !!likedMap[post.id],
            likes: likesMap[post.id] !== undefined ? likesMap[post.id] : post.likes
          }));
          
          // Combine new posts with filtered mock posts
          return [...newPostsWithLikes, ...dataWithLikes];
        });
      } catch (e) {
        console.error('Error loading posts:', e);
        const data = category === 'all' ? MOCK_POSTS : MOCK_POSTS.filter((p) => p.category === category);
        
        // Load created posts to check for deletions (even in error case)
        const createdPostsRaw = await AsyncStorage.getItem('createdPosts');
        const createdPosts = createdPostsRaw ? JSON.parse(createdPostsRaw) : [];
        const createdPostIds = new Set(createdPosts.map(p => p.id));
        
        // Preserve any new posts that were added locally (not in MOCK_POSTS)
        setPostData(prev => {
          if (!prev) return data;
          
          // Find posts that are not in MOCK_POSTS (these are new posts)
          const mockPostIds = new Set(MOCK_POSTS.map(p => p.id));
          const newPosts = prev.filter(post => !mockPostIds.has(post.id));
          
          // Filter out posts that have been deleted from createdPosts
          const validNewPosts = newPosts.filter(post => createdPostIds.has(post.id));
          
          // Filter new posts by category if needed
          const filteredNewPosts = category === 'all' ? validNewPosts : validNewPosts.filter(p => p.category === category);
          
          // Apply liked state to new posts as well (even in error case)
          const newPostsWithLikes = filteredNewPosts.map(post => ({
            ...post,
            liked: !!likedMap[post.id],
            likes: likesMap[post.id] !== undefined ? likesMap[post.id] : post.likes
          }));
          
          // Combine new posts with filtered mock posts
          return [...newPostsWithLikes, ...data];
        });
      } finally {
        setIsLoading(false);
      }
    }, 500);
  }, [category]);

  const handleSearch = React.useCallback((q) => setSearchQuery(q), []);

  const filterPosts = React.useCallback((posts) => {
    const q = (searchQuery || '').trim().toLowerCase();
    if (!q) return posts;
    return posts.filter((p) =>
      (p.title || '').toLowerCase().includes(q) ||
      (p.text || '').toLowerCase().includes(q)
    );
  }, [searchQuery]);

  React.useEffect(() => {
    getPostData();
  }, [getPostData]);

  // Reload data when screen comes into focus (e.g., returning from PostDetailScreen)
  useFocusEffect(
    React.useCallback(() => {
      getPostData();
    }, [getPostData])
  );

  const canCreate = category !== 'all';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      {postData ? (
        <FlatList
          data={filterPosts(sortPosts(postData))}
          extraData={isLoading}
          refreshing={isLoading}
          onRefresh={() => getPostData()}
          keyExtractor={(item, index) => item.id || `post-${index}`}
          onScroll={(e) => {
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
          scrollEventThrottle={16}
          ListHeaderComponent={
            <View>
              <View style={styles.header}>
                <View style={styles.headerTopRow}>
                  <View style={styles.headerRow}>
                    <Image source={require('../assets/AppIcon.png')} style={styles.headerLogo} />
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Luma</Text>
                  </View>
                </View>
              </View>
              <CategoryPicker selectedCategory={category} onClick={setCategory} addAll />
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
                <TouchableOpacity style={[styles.iconSquare, { backgroundColor: colors.surface }]} onPress={() => setShowSortModal(true)}>
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
          ListEmptyComponent={<Text style={[styles.empty, { color: colors.text }]}>Ups! Not found any post!</Text>}
          renderItem={({ item }) => (
            <PostItem
              item={item}
              onPress={() => navigation.navigate('PostDetail', { post: item })}
              onComment={() => navigation.navigate('PostDetail', { post: item })}
              onLike={() => toggleLike(item.id)}
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
          <View style={[styles.modalContent, { backgroundColor: colors.surface }] }>
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
                }}
              >
                <Ionicons name={opt.icon} size={16} color={selectedSort === opt.id ? 'white' : '#6B7280'} />
                <Text style={[styles.sortOptionText, selectedSort === opt.id && styles.selectedSortOptionText]}>{opt.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Search Modal */}
      <Modal visible={showSearchModal} transparent={true} animationType="fade" onRequestClose={() => setShowSearchModal(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowSearchModal(false)}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Search Posts</Text>
              <TouchableOpacity onPress={() => setShowSearchModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <View style={styles.searchModalContent}>
              <View style={styles.searchModalBar}>
                <Ionicons name="search" size={20} color="#3E5F44" style={styles.searchModalIcon} />
                <TextInput
                  style={styles.searchModalInput}
                  placeholder="Search posts..."
                  placeholderTextColor="#A0AEC0"
                  value={searchQuery}
                  onChangeText={handleSearch}
                  autoFocus={true}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => handleSearch('')}>
                    <Ionicons name="close-circle" size={20} color="#A0AEC0" />
                  </TouchableOpacity>
                )}
              </View>
              {searchQuery.length > 0 && (
                <Text style={styles.searchResultsText}>
                  {filterPosts(sortPosts(postData || [])).length} result{filterPosts(sortPosts(postData || [])).length !== 1 ? 's' : ''} found
                </Text>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 0,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLogo: { width: 40, height: 40, borderRadius: 12, marginRight: 10 },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: '#2D3748' },
  categoryPicker: {
    padding: 5,
    marginTop: 0,
    marginBottom: 4,
    elevation: 3,
  },
  catList: { paddingHorizontal: 10, paddingVertical: 6, gap: 8, backgroundColor: 'transparent' },
  catChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
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
  empty: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 50,
    fontSize: 22,
  },
  postCard: {
    marginHorizontal: 12,
    marginBottom: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  postHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  postMeta: {
    fontSize: 12,
    fontWeight: '600',
  },
  postTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  postBody: {
    fontSize: 14,
    marginBottom: 8,
  },
  postFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
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
  iconSquare: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E5E7EB', marginLeft: 8 },
  // Modal styles copied to match HomeScreen pattern
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
  modalTitle: { fontSize: 17, fontWeight: 'bold', color: '#1F2937' },
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
  searchPill: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: '#E5E7EB', marginRight: 10, flex: 1 },
  searchPillInput: { flex: 1, fontSize: 13, paddingVertical: 0 },
  searchModalContent: { paddingTop: 12 },
  searchModalBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 10,
  },
  searchModalIcon: { marginRight: 10 },
  searchModalInput: { flex: 1, fontSize: 15, color: '#2D3748', paddingVertical: 0 },
  searchResultsText: { fontSize: 13, color: '#6B7280', textAlign: 'center', fontStyle: 'italic' },
});

export default HomeScreen; 
