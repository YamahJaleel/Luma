import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserCommentsScreen = ({ navigation }) => {
  const theme = useTheme();
  const [comments, setComments] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);

  const load = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const raw = await AsyncStorage.getItem('userCommunityComments');
      const items = raw ? JSON.parse(raw) : [];
      setComments(Array.isArray(items) ? items : []);
    } catch (e) {
      setComments([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const unsub = navigation.addListener('focus', load);
    load();
    return unsub;
  }, [navigation, load]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.row, { backgroundColor: theme.colors.surface, borderColor: theme.dark ? '#374151' : '#E5E7EB' }]}
      onPress={() => navigation.navigate('PostDetail', { post: item.post, comments: item.passedComments })}
    >
      <View style={styles.headerRow}>
        <Text style={[styles.community, { color: theme.dark ? theme.colors.text : '#6B7280' }]} numberOfLines={1}>
          {item.post?.community || 'Community'}
        </Text>
        <Text style={[styles.timestamp, { color: theme.dark ? theme.colors.text : '#9CA3AF' }]}>{item.timestamp || ''}</Text>
      </View>
      <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={1}>
        {item.post?.title || item.post?.text || 'Post'}
      </Text>
      <Text style={[styles.commentText, theme.dark && { color: theme.colors.text }]} numberOfLines={3}>
        {item.text}
      </Text>
      <View style={styles.footerRow}>
        <View style={styles.metaRow}>
          <Ionicons name="chatbubble-outline" size={14} color={theme.dark ? '#9CA3AF' : '#6B7280'} />
          <Text style={[styles.metaText, theme.dark && { color: theme.colors.text }]}>{item.post?.comments || 0}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>My Comments</Text>
        <View style={{ width: 24 }} />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>Loading...</Text>
        </View>
      ) : comments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbubble-ellipses-outline" size={64} color={theme.dark ? '#9CA3AF' : '#6B7280'} />
          <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No Comments Yet</Text>
          <Text style={[styles.emptySubtitle, { color: theme.dark ? '#9CA3AF' : '#6B7280' }]}>Your comments on community posts will appear here.</Text>
        </View>
      ) : (
        <FlatList
          data={comments}
          renderItem={renderItem}
          keyExtractor={(item, index) => String(item.id) || `comment-${index}`}
          contentContainerStyle={{ paddingBottom: 12 }}
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
  headerTitle: { fontSize: 19, fontWeight: 'bold' },
  row: { marginHorizontal: 12, marginBottom: 10, padding: 12, borderRadius: 12, borderWidth: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  community: { fontSize: 12, fontWeight: '600' },
  timestamp: { fontSize: 12, fontWeight: '600' },
  title: { fontSize: 15, fontWeight: '700', marginBottom: 6 },
  commentText: { fontSize: 14 },
  footerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 13, fontWeight: '600' },
  // Loading and empty
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 16, marginBottom: 8 },
  emptySubtitle: { fontSize: 16, textAlign: 'center', lineHeight: 22 },
});

export default UserCommentsScreen;


