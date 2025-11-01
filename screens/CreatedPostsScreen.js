import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute } from '@react-navigation/native';
import { useFirebase } from '../contexts/FirebaseContext';
import { auth } from '../config/firebase';
import { cachedPostService } from '../services/cachedServices';

// Mock posts IDs to identify user-created posts (moved outside component)
const MOCK_POSTS = [
  { id: 'p1' }, { id: 'p2' }, { id: 'p3' }, { id: 'p4' }, { id: 'p5' },
  { id: 'p6' }, { id: 'p7' }, { id: 'p8' }, { id: 'p9' }, { id: 'p10' },
  { id: 'p11' }, { id: 'p12' }, { id: 'p13' }, { id: 'p14' }, { id: 'p15' }
];
const mockPostIds = new Set(MOCK_POSTS.map(p => p.id));

const CreatedPostsScreen = ({ navigation }) => {
  const theme = useTheme();
  const route = useRoute();
  const { user } = useFirebase();
  const [data, setData] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);

  const load = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser?.uid) {
        setData([]);
        return;
      }

      // Use cached service to fetch user posts
      const posts = await cachedPostService.getUserPosts(currentUser.uid, false);
      
      // Sort by creation date, newest first
      const sortedPosts = posts.sort((a, b) => {
        const aDate = a.createdAt?.toDate?.() || new Date(0);
        const bDate = b.createdAt?.toDate?.() || new Date(0);
        return bDate - aDate;
      });
      
      setData(sortedPosts);
    } catch (e) {
      console.error('Error loading created posts:', e);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle deleted post from PostDetailScreen
  React.useEffect(() => {
    if (route.params?.deletedPostId) {
      const deletedPostId = route.params.deletedPostId;
      // Remove the deleted post from the current posts
      setData(prev => {
        if (!prev) return prev;
        return prev.filter(post => post.id !== deletedPostId);
      });
      // Clear the route params to prevent re-removing on re-renders
      navigation.setParams({ deletedPostId: undefined });
    }
  }, [route.params?.deletedPostId, navigation]); // Removed mockPostIds dependency since it's now outside component

  React.useEffect(() => {
    const unsub = navigation.addListener('focus', load);
    load();
    return unsub;
  }, [navigation, load]);

  const PostItem = ({ item }) => {
    const formatDate = (timestamp) => {
      if (!timestamp) return '';
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
      <TouchableOpacity 
        style={[styles.postCard, { backgroundColor: theme.colors.surface, borderColor: theme.dark ? '#374151' : '#E5E7EB' }]}
        onPress={() => navigation.navigate('PostDetail', { post: item })}
      >
        <View style={styles.postHeaderRow}>
          <View style={{ flex: 1 }} />
          <Text style={[styles.postMeta, { color: theme.dark ? theme.colors.text : '#9CA3AF' }]}>
            {formatDate(item.createdAt)}
          </Text>
        </View>
        
        <Text style={[styles.postTitle, { color: theme.colors.text }]} numberOfLines={2}>{item.title}</Text>
        {item.text?.length ? (
          <Text style={[styles.postBody, theme.dark && { color: theme.colors.text }]} numberOfLines={3}>{item.text}</Text>
        ) : null}
        
        <View style={styles.postFooter}>
          <View style={styles.postActions}>
            <TouchableOpacity style={styles.postActionBtn} onPress={() => navigation.navigate('PostDetail', { post: item })}>
              <Ionicons name="chatbubble-outline" size={16} color={theme.dark ? '#9CA3AF' : '#6B7280'} />
              <Text style={[styles.actionText, theme.dark && { color: theme.colors.text }]}>{item.comments || 0}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Created Posts</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Created Posts</Text>
        <View style={{ width: 24 }} />
      </View>

      {data.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="create-outline" size={64} color={theme.dark ? '#9CA3AF' : '#6B7280'} />
          <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No Posts Created</Text>
          <Text style={[styles.emptySubtitle, { color: theme.dark ? '#9CA3AF' : '#6B7280' }]}>
            You haven't created any posts yet. Start sharing your experiences!
          </Text>
        </View>
      ) : (
        <FlatList
          data={data}
          renderItem={({ item }) => <PostItem item={item} />}
          keyExtractor={(item, index) => String(item.id) || `created-post-${index}`}
          contentContainerStyle={{ paddingBottom: 12 }}
          ListEmptyComponent={<Text style={[styles.empty, { color: theme.colors.text }]}>No created posts yet.</Text>}
          refreshing={isLoading}
          onRefresh={load}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 56 },
  backBtn: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 19, fontWeight: 'bold' },
  empty: { fontWeight: 'bold', textAlign: 'center', marginTop: 50, fontSize: 22 },
  
  // Loading styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 12,
  },
  
  // Empty state styles
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Match Home1Screen.js card format
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
});

export default CreatedPostsScreen;
