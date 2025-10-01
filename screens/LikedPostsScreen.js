import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LikedPostsScreen = ({ navigation }) => {
  const theme = useTheme();
  const [data, setData] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);

  const load = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const raw = await AsyncStorage.getItem('likedPosts');
      const arr = raw ? JSON.parse(raw) : [];
      setData(arr);
    } catch (e) {
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const unsub = navigation.addListener('focus', load);
    load();
    return unsub;
  }, [navigation, load]);

  const toggleLike = React.useCallback(async (post) => {
    try {
      const liked = !post.liked;
      const updated = { ...post, liked, likes: Math.max(0, (post.likes || 0) + (liked ? 1 : -1)) };
      const raw = await AsyncStorage.getItem('likedPosts');
      const current = raw ? JSON.parse(raw) : [];
      const exists = current.some((x) => x.id === updated.id);
      let nextArr = current;
      if (updated.liked && !exists) {
        nextArr = [{ ...updated }, ...current].slice(0, 200);
      } else if (!updated.liked && exists) {
        nextArr = current.filter((x) => x.id !== updated.id);
      }
      await AsyncStorage.setItem('likedPosts', JSON.stringify(nextArr));
      setData(nextArr);
    } catch (e) {}
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('PostDetail', { post: item })}>
      <View style={[styles.postCard, { backgroundColor: theme.colors.surface, borderColor: theme.dark ? '#374151' : '#E5E7EB' }]}>
        <View style={styles.postHeaderRow}>
          <View style={{ flex: 1 }} />
          <Text style={[styles.postMeta, { color: theme.dark ? theme.colors.text : '#9CA3AF' }]}>{item.created || item.timestamp || ''}</Text>
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
            <TouchableOpacity style={styles.postActionBtn} onPress={() => toggleLike(item)}>
              <Ionicons name={item.liked ? 'heart' : 'heart-outline'} size={16} color={item.liked ? '#EF4444' : (theme.dark ? '#9CA3AF' : '#6B7280')} />
              <Text style={[styles.actionText, theme.dark && { color: theme.colors.text }]}>{item.likes || 0}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity style={[styles.backBtn, { backgroundColor: theme.colors.surface }]} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Liked Posts</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item, index) => String(item.id) || `liked-post-${index}`}
        contentContainerStyle={{ paddingBottom: 12, flexGrow: 1 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="heart-outline" size={64} color={theme.dark ? '#9CA3AF' : '#6B7280'} />
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No Liked Posts</Text>
            <Text style={[styles.emptySubtitle, { color: theme.dark ? '#9CA3AF' : '#6B7280' }]}>Like posts to see them here.</Text>
          </View>
        }
        refreshing={isLoading}
        onRefresh={load}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 56 },
  backBtn: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 19, fontWeight: 'bold' },
  empty: { fontWeight: 'bold', textAlign: 'center', marginTop: 50, fontSize: 22 },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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

export default LikedPostsScreen; 