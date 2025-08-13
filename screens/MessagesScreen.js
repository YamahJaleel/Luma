import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

const mockConversations = [
  { id: 'c1', name: 'Tyler Bradshaw', lastMessage: 'See you at 6?', time: '2m', unread: 2, avatarColor: '#3E5F44' },
  { id: 'c2', name: 'Sarah Chen', lastMessage: 'Thanks for the advice!', time: '15m', unread: 0, avatarColor: '#8B5CF6' },
  { id: 'c3', name: 'Mike Johnson', lastMessage: 'Sent you the link', time: '1h', unread: 1, avatarColor: '#10B981' },
  { id: 'c4', name: 'Emma Wilson', lastMessage: 'Let’s catch up soon', time: '3h', unread: 0, avatarColor: '#F59E0B' },
];

const MessagesScreen = ({ navigation }) => {
  const theme = useTheme();
  const conversations = useMemo(() => mockConversations, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity style={[styles.row, { backgroundColor: theme.colors.surface }]} onPress={() => navigation.navigate('MessageThread', { conversation: item })}>
      <View style={[styles.avatar, { backgroundColor: item.avatarColor }]}>
        <Text style={styles.avatarInitial}>{item.name.charAt(0)}</Text>
      </View>
      <View style={styles.rowText}>
        <Text style={[styles.name, { color: theme.colors.text }]} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.preview} numberOfLines={1}>{item.lastMessage}</Text>
      </View>
      <View style={styles.meta}>
        <Text style={styles.time}>{item.time}</Text>
        {item.unread > 0 && (
          <View style={styles.badge}><Text style={styles.badgeText}>{item.unread}</Text></View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Messages</Text>
        </View>
      </View>

      <FlatList
        data={conversations}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, paddingTop: 60 },
  headerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { fontSize: 28, fontWeight: 'bold' },
  list: { paddingHorizontal: 16, paddingBottom: 16 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarInitial: { color: 'white', fontWeight: '700' },
  rowText: { flex: 1 },
  name: { fontSize: 16, fontWeight: '700' },
  preview: { fontSize: 13, color: '#6B7280' },
  meta: { alignItems: 'flex-end' },
  time: { fontSize: 12, color: '#9CA3AF', marginBottom: 4 },
  badge: { minWidth: 20, height: 20, borderRadius: 10, backgroundColor: '#EF4444', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  badgeText: { color: 'white', fontSize: 12, fontWeight: '700' },
});

export default MessagesScreen; 