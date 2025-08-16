import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useTheme, Card } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

const mockLikedPosts = [
  { id: 1, community: 'Red Flags', type: 'warning', title: '🚩 Love Bombing Alert', timestamp: '30 minutes ago' },
  { id: 2, community: 'Dating Advice', type: 'experience', title: 'Ghosting Recovery', timestamp: '3 hours ago' },
  { id: 3, community: 'Success Stories', type: 'positive', title: '💕 Found Love After Heartbreak', timestamp: '5 hours ago' },
];

const typeIcon = (type) => {
  switch (type) {
    case 'warning':
      return { name: 'warning', color: '#EF4444' };
    case 'question':
      return { name: 'help-circle', color: '#F59E0B' };
    case 'positive':
      return { name: 'heart', color: '#10B981' };
    case 'experience':
      return { name: 'document-text', color: '#3E5F44' };
    default:
      return { name: 'chatbubble', color: '#6B7280' };
  }
};

const LikedPostsScreen = ({ navigation }) => {
  const theme = useTheme();

  const renderItem = ({ item }) => {
    const icon = typeIcon(item.type);
    return (
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}> 
        <Card.Content style={styles.cardContent}>
          <View style={styles.headerRow}>
            <View style={[styles.iconContainer, { backgroundColor: `${icon.color}15` }]}>
              <Ionicons name={icon.name} size={16} color={icon.color} />
            </View>
            <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={2}>{item.title}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={[styles.meta, { color: theme.dark ? theme.colors.text : '#6B7280' }]}>{item.community}</Text>
            <Text style={[styles.meta, { color: theme.dark ? theme.colors.text : '#9CA3AF' }]}>{item.timestamp}</Text>
          </View>
        </Card.Content>
      </Card>
    );
  };

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
        data={mockLikedPosts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 56 },
  backBtn: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 19, fontWeight: 'bold' },
  list: { padding: 16 },
  card: { borderRadius: 14, marginBottom: 10, elevation: 1 },
  cardContent: { padding: 14 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  iconContainer: { width: 24, height: 24, borderRadius: 6, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  title: { fontSize: 17, fontWeight: 'bold' },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between' },
  meta: { fontSize: 13 },
});

export default LikedPostsScreen; 