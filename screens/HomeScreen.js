import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  FlatList,
  Modal,
  TextInput,
} from 'react-native';
import { Card, Chip, Avatar, Button, useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

const HomeScreen = ({ navigation }) => {
  const theme = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState('dating-advice');
  const [selectedCommunityMeta, setSelectedCommunityMeta] = useState(null);
  const [selectedSort, setSelectedSort] = useState('recent');
  const [showSortModal, setShowSortModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [favoriteCommunities, setFavoriteCommunities] = useState([]); // array of {id,name,icon,color,memberCount}

  // Mock data for subcommunities
  const defaultSubcommunities = [
    {
      id: 'dating-advice',
      name: 'Dating Advice',
      icon: 'heart',
      color: '#F1B8B2',
      memberCount: 892,
    },
    {
      id: 'red-flags',
      name: 'Red Flags',
      icon: 'warning',
      color: '#EF4444',
      memberCount: 567,
    },
    {
      id: 'success-stories',
      name: 'Success Stories',
      icon: 'star',
      color: '#10B981',
      memberCount: 423,
    },
    {
      id: 'safety-tips',
      name: 'Safety Tips',
      icon: 'shield',
      color: '#F59E0B',
      memberCount: 345,
    },
    {
      id: 'vent-space',
      name: 'Vent Space',
      icon: 'chatbubble',
      color: '#8B5CF6',
      memberCount: 234,
    },
  ];

  useEffect(() => {
    if (!selectedCommunityMeta) {
      const initial = defaultSubcommunities.find((c) => c.id === selectedCommunity);
      if (initial) setSelectedCommunityMeta(initial);
    }
  }, []);

  const displayedSubcommunities = React.useMemo(() => {
    const byId = new Map();
    // Favorites first
    favoriteCommunities.forEach((c) => byId.set(c.id, c));
    // Then defaults (skip duplicates)
    defaultSubcommunities.forEach((c) => {
      if (!byId.has(c.id)) byId.set(c.id, c);
    });
    return Array.from(byId.values());
  }, [favoriteCommunities]);

  const handleToggleFavoriteCommunity = (community) => {
    setFavoriteCommunities((prev) => {
      const exists = prev.some((c) => c.id === community.id);
      if (exists) {
        return prev.filter((c) => c.id !== community.id);
      }
      return [community, ...prev];
    });
  };

  // Sort options
  const sortOptions = [
    { id: 'recent', name: 'Most Recent', icon: 'time' },
    { id: 'top', name: 'Top Posts', icon: 'trending-up' },
    { id: 'liked', name: 'Most Liked', icon: 'heart' },
    { id: 'trending', name: 'Trending', icon: 'flame' },
    { id: 'comments', name: 'Most Comments', icon: 'chatbubble' },
  ];

  // Mock data for community posts organized by subcommunity
  const initialPosts = {
    all: [
      {
        id: 1,
        community: 'red-flags',
        type: 'experience',
        title: 'Red Flag Alert',
        content: 'Met someone on Hinge who seemed perfect at first, but then started showing controlling behavior. Be careful with anyone who tries to isolate you from friends.',
        tags: ['red-flag', 'controlling', 'hinge'],
        timestamp: '2 hours ago',
        upvotes: 45,
        comments: 12,
        likes: 67,
        trending: 89,
      },
      {
        id: 2,
        community: 'dating-advice',
        type: 'question',
        title: 'Advice Needed',
        content: 'Is it normal for someone to ask for your location constantly? This guy I\'m talking to wants to know where I am all the time.',
        tags: ['advice', 'location', 'boundaries'],
        timestamp: '4 hours ago',
        upvotes: 23,
        comments: 8,
        likes: 34,
        trending: 45,
      },
      {
        id: 3,
        community: 'success-stories',
        type: 'positive',
        title: 'Success Story',
        content: 'Found my person through this community! We\'ve been together for 6 months now. Thank you all for the support and advice.',
        tags: ['success', 'relationship', 'positive'],
        timestamp: '1 day ago',
        upvotes: 67,
        comments: 15,
        likes: 123,
        trending: 156,
      },
    ],
    'dating-advice': [
      {
        id: 4,
        community: 'dating-advice',
        type: 'question',
        title: 'First Date Tips',
        content: 'Going on my first date in months. Any tips for keeping the conversation flowing naturally?',
        tags: ['first-date', 'conversation', 'tips'],
        timestamp: '1 hour ago',
        upvotes: 34,
        comments: 18,
        likes: 56,
        trending: 78,
      },
      {
        id: 5,
        community: 'dating-advice',
        type: 'experience',
        title: 'Ghosting Recovery',
        content: 'How do you move on when someone you really connected with just disappears? Looking for advice on healing.',
        tags: ['ghosting', 'healing', 'moving-on'],
        timestamp: '3 hours ago',
        upvotes: 56,
        comments: 22,
        likes: 89,
        trending: 112,
      },
    ],
    'red-flags': [
      {
        id: 6,
        community: 'red-flags',
        type: 'warning',
        title: '🚩 Love Bombing Alert',
        content: 'Watch out for people who shower you with attention and gifts immediately. This is often a manipulation tactic.',
        tags: ['love-bombing', 'manipulation', 'warning'],
        timestamp: '30 minutes ago',
        upvotes: 89,
        comments: 31,
        likes: 145,
        trending: 234,
      },
      {
        id: 7,
        community: 'red-flags',
        type: 'experience',
        title: 'Controlling Behavior',
        content: 'My ex would get angry if I spent time with friends. Took me too long to realize this was controlling behavior.',
        tags: ['controlling', 'boundaries', 'red-flag'],
        timestamp: '2 hours ago',
        upvotes: 67,
        comments: 19,
        likes: 98,
        trending: 134,
      },
    ],
    'success-stories': [
      {
        id: 8,
        community: 'success-stories',
        type: 'positive',
        title: '💕 Found Love After Heartbreak',
        content: 'After my divorce, I never thought I\'d find love again. But here I am, 2 years later, engaged to the most amazing person!',
        tags: ['love', 'second-chance', 'engagement'],
        timestamp: '5 hours ago',
        upvotes: 123,
        comments: 28,
        likes: 234,
        trending: 345,
      },
    ],
    'safety-tips': [
      {
        id: 9,
        community: 'safety-tips',
        type: 'experience',
        title: 'Meeting in Public',
        content: 'Always meet in a public place for first dates. Coffee shops are perfect - easy to leave if needed.',
        tags: ['safety', 'first-date', 'public-meeting'],
        timestamp: '1 day ago',
        upvotes: 78,
        comments: 12,
        likes: 112,
        trending: 156,
      },
    ],
    'vent-space': [
      {
        id: 10,
        community: 'vent-space',
        type: 'experience',
        title: 'Frustrated with Dating Apps',
        content: 'Just needed to vent - dating apps are exhausting. So many fake profiles and ghosting. Anyone else feeling this?',
        tags: ['venting', 'dating-apps', 'frustration'],
        timestamp: '4 hours ago',
        upvotes: 45,
        comments: 33,
        likes: 67,
        trending: 89,
      },
    ],
  };
  const [postsByCommunity, setPostsByCommunity] = useState(initialPosts);

  const handleAddPost = (newPost) => {
    setPostsByCommunity((prev) => {
      const communityId = newPost.community;
      const updatedCommunityPosts = [newPost, ...(prev[communityId] || [])];
      const updatedAll = prev.all ? [newPost, ...prev.all] : undefined;
      return {
        ...prev,
        [communityId]: updatedCommunityPosts,
        ...(updatedAll ? { all: updatedAll } : {}),
      };
    });
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  const getPostIcon = (type) => {
    switch (type) {
      case 'red-flag':
      case 'warning':
        return 'warning';
      case 'question':
        return 'help-circle';
      case 'positive':
        return 'heart';
      case 'experience':
        return 'document-text';
      default:
        return 'chatbubble';
    }
  };

  const getPostColor = (type) => {
    switch (type) {
      case 'red-flag':
      case 'warning':
        return '#EF4444';
      case 'question':
        return '#F59E0B';
      case 'positive':
        return '#10B981';
      case 'experience':
        return '#3E5F44';
      default:
        return '#6B7280';
    }
  };

  const sortPosts = (posts) => {
    switch (selectedSort) {
      case 'recent':
        return [...posts].sort((a, b) => {
          // Sort by timestamp (newest first)
          const timeA = a.timestamp.includes('hour') ? parseInt(a.timestamp) : 
                       a.timestamp.includes('day') ? parseInt(a.timestamp) * 24 : 0;
          const timeB = b.timestamp.includes('hour') ? parseInt(b.timestamp) : 
                       b.timestamp.includes('day') ? parseInt(b.timestamp) * 24 : 0;
          return timeA - timeB;
        });
      case 'top':
        return [...posts].sort((a, b) => b.upvotes - a.upvotes);
      case 'liked':
        return [...posts].sort((a, b) => b.likes - a.likes);
      case 'trending':
        return [...posts].sort((a, b) => b.trending - a.trending);
      case 'comments':
        return [...posts].sort((a, b) => b.comments - a.comments);
      default:
        return posts;
    }
  };

  const renderCommunityItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.communityItem,
        { backgroundColor: theme.colors.surface },
        selectedCommunity === item.id && styles.selectedCommunityItem,
      ]}
      onPress={() => {
        setSelectedCommunity(item.id);
        setSelectedCommunityMeta(item);
        setSelectedSort('recent'); // Reset to recent when changing community
      }}
    >
      <View style={[styles.communityIcon, { backgroundColor: `${item.color}15` }]}>
        <Ionicons name={item.icon} size={20} color={item.color} />
      </View>
      <Text style={[styles.communityName, selectedCommunity === item.id && styles.selectedCommunityName]}>
        {item.name}
      </Text>
      <Text style={[styles.memberCount, theme.dark && { color: theme.colors.text }]}>{item.memberCount} members</Text>
    </TouchableOpacity>
  );

  const renderSortOption = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.sortOption,
        selectedSort === item.id && styles.selectedSortOption,
      ]}
      onPress={() => {
        setSelectedSort(item.id);
        setShowSortModal(false);
      }}
    >
      <Ionicons 
        name={item.icon} 
        size={16} 
        color={selectedSort === item.id ? 'white' : '#6B7280'} 
      />
      <Text style={[
        styles.sortOptionText,
        selectedSort === item.id && styles.selectedSortOptionText,
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderPost = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate('PostDetail', { post: item })} activeOpacity={0.9}>
      <Card style={[styles.postCard, { backgroundColor: theme.colors.surface }]}>
        <Card.Content style={styles.postContent}>
          <View style={styles.postHeader}>
            <View style={styles.postTypeContainer}>
              <View style={[styles.iconContainer, { backgroundColor: `${getPostColor(item.type)}15` }]}>
                <Ionicons name={getPostIcon(item.type)} size={14} color={getPostColor(item.type)} />
              </View>
              <Text style={[styles.postType, { color: getPostColor(item.type) }]}>
                {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
              </Text>
            </View>
            <Text style={[styles.timestamp, theme.dark && { color: theme.colors.text }]}>{item.timestamp}</Text>
          </View>

          <View style={styles.authorRow}>
            <View style={styles.authorAvatar}>
              <Text style={styles.authorInitial}>{(item.author || 'Anonymous').charAt(0)}</Text>
            </View>
            <Text style={[styles.authorName, theme.dark && { color: theme.colors.text }]}>{item.author || 'Anonymous'}</Text>
          </View>

          <Text style={[styles.postTitle, { color: theme.colors.text }]} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={[styles.postDescription, theme.dark && { color: theme.colors.text }]} numberOfLines={3}>
            {item.content}
          </Text>

          <View style={styles.divider} />

          <View style={styles.postActions}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="chatbubble-outline" size={16} color="#6B7280" />
              <Text style={[styles.actionText, theme.dark && { color: theme.colors.text }]}>{item.comments}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="heart-outline" size={16} color="#6B7280" />
              <Text style={[styles.actionText, theme.dark && { color: theme.colors.text }]}>{item.likes}</Text>
            </TouchableOpacity>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const filterPosts = (posts) => {
    if (searchQuery.trim() === '') {
      return posts;
    }
    return posts.filter(post => 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  };

  const currentPosts = sortPosts(
    filterPosts(postsByCommunity[selectedCommunity] || postsByCommunity['dating-advice'] || [])
  );
  const currentSortOption = sortOptions.find(option => option.id === selectedSort);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerText}>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Luma</Text>
          </View>
          <TouchableOpacity style={[styles.dmButton, { backgroundColor: theme.colors.surface }]} onPress={() => navigation.navigate('Messages')}>
            <Ionicons name="chatbubble" size={24} color="#3E5F44" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Subcommunities */}
      <View style={styles.communitiesSection}>
        <TouchableOpacity
          style={[styles.communitiesButton, { backgroundColor: theme.colors.surface }]}
          onPress={() =>
            navigation.navigate('BrowseCommunities', {
              onSelectCommunity: (c) => {
                setSelectedCommunity(c.id);
                setSelectedCommunityMeta(c);
              },
              onToggleFavoriteCommunity: (c) => handleToggleFavoriteCommunity(c),
              favoriteIds: favoriteCommunities.map((f) => f.id),
            })
          }
        >
          <Ionicons name="search" size={16} color={theme.colors.primary} style={{ marginRight: 8 }} />
          <Text style={[styles.communitiesButtonText, { color: theme.colors.text }]}>Communities</Text>
        </TouchableOpacity>
        <FlatList
          data={displayedSubcommunities}
          renderItem={renderCommunityItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.communitiesList}
        />
      </View>

      {/* Posts Section */}
      <View style={styles.postsSection}>


        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {selectedCommunityMeta?.name || displayedSubcommunities.find((c) => c.id === selectedCommunity)?.name || ''}
          </Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity style={[styles.sortButton, { backgroundColor: theme.colors.surface }]} onPress={() => setShowSortModal(true)}>
              <Ionicons name="filter" size={20} color="#3E5F44" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.searchButton, { backgroundColor: theme.colors.surface }]} onPress={() => setShowSearchModal(true)}>
              <Ionicons name="search" size={20} color="#3E5F44" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.addPostButton, { backgroundColor: theme.colors.surface }]
              }
              onPress={() =>
                navigation.navigate('CreatePost', {
                  communityId: selectedCommunity,
                  onSubmit: (newPost) => handleAddPost(newPost),
                })
              }
            >
              <Ionicons name="add" size={20} color="#3E5F44" />
            </TouchableOpacity>
          </View>
        </View>

        <FlatList
          data={currentPosts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={styles.postsList}
        />
      </View>

      {/* Sort Modal */}
      <Modal visible={showSortModal} transparent={true} animationType="fade" onRequestClose={() => setShowSortModal(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSortModal(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Sort Posts</Text>
              <TouchableOpacity onPress={() => setShowSortModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={sortOptions}
              renderItem={renderSortOption}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
            />
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
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Search Posts</Text>
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
                <Text style={[styles.searchResultsText, theme.dark && { color: theme.colors.text }]}>
                  {currentPosts.length} result{currentPosts.length !== 1 ? 's' : ''} found
                </Text>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF6F0',
  },
  header: {
    padding: 16,
    paddingTop: 56,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: { flex: 1 },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2D3748',
    letterSpacing: -0.5,
  },
  dmButton: {
    width: 44,
    height: 44,
    backgroundColor: 'white',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  communitiesSection: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    marginBottom: 8,
  },
  communitiesButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    marginBottom: 12,
  },
  communitiesButtonText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  communitiesTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  communitiesList: {
    paddingRight: 16,
    paddingBottom: 2,
  },
  communityItem: {
    alignItems: 'center',
    marginRight: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: 'white',
    borderRadius: 14,
    minWidth: 92,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  selectedCommunityItem: { backgroundColor: '#3E5F44' },
  communityIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  communityName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 2,
  },
  selectedCommunityName: { color: 'white' },
  memberCount: { fontSize: 10, color: '#9CA3AF', textAlign: 'center' },
  postsSection: { flex: 1 },
  headerButtons: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    letterSpacing: -0.3,
  },
  sortButton: {
    width: 40,
    height: 40,
    backgroundColor: 'white',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  searchButton: {
    width: 40,
    height: 40,
    backgroundColor: 'white',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  addPostButton: {
    width: 40,
    height: 40,
    backgroundColor: 'white',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  postsList: { paddingHorizontal: 16, paddingBottom: 16 },
  postCard: {
    marginBottom: 10,
    backgroundColor: 'white',
    borderRadius: 14,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  postContent: { padding: 14 },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  postTypeContainer: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  postType: { fontSize: 12, fontWeight: '600', letterSpacing: 0.2 },
  dot: { marginHorizontal: 6, color: '#CBD5E1' },
  communityTag: { fontSize: 12, color: '#9CA3AF', fontWeight: '500' },
  timestamp: { fontSize: 12, color: '#9CA3AF', fontWeight: '500' },
  postTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 6,
    lineHeight: 22,
    letterSpacing: -0.2,
  },
  postDescription: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 10,
  },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
  tag: { marginRight: 6, marginBottom: 6, backgroundColor: '#F3F4F6', borderRadius: 8, height: 26 },
  tagText: { fontSize: 11, color: '#6B7280', fontWeight: '500' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginBottom: 8 },
  postActions: { flexDirection: 'row', alignItems: 'center' },
  actionButton: { flexDirection: 'row', alignItems: 'center', marginRight: 18, paddingVertical: 2 },
  actionText: { fontSize: 13, color: '#6B7280', marginLeft: 4, fontWeight: '500' },
  // Modal styles
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
  modalTitle: { fontSize: 16, fontWeight: '700', color: '#1F2937' },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 6,
  },
  selectedSortOption: { backgroundColor: '#3E5F44' },
  sortOptionText: { fontSize: 14, fontWeight: '600', color: '#6B7280', marginLeft: 10 },
  selectedSortOptionText: { color: 'white' },
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
  authorRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  authorAvatar: { width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', marginRight: 8, backgroundColor: '#3E5F44' },
  authorInitial: { color: 'white', fontSize: 9, fontWeight: '700' },
  authorName: { fontSize: 12, fontWeight: '600', color: '#1F2937' },
});

export default HomeScreen; 