import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput } from 'react-native';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

const iconPool = ['heart', 'warning', 'star', 'shield', 'chatbubble', 'flame', 'time', 'people'];
const colorPool = ['#F1B8B2', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#7C9AFF', '#A78BFA', '#34D399'];

const createMockCommunities = (count = 2000) => {
  const items = [];
  for (let i = 1; i <= count; i++) {
    const id = `community-${i}`;
    const name = `Community ${i}`;
    const icon = iconPool[i % iconPool.length];
    const color = colorPool[i % colorPool.length];
    const memberCount = Math.floor(Math.random() * 9000) + 100;
    items.push({ id, name, icon, color, memberCount });
  }
  return items;
};

const BrowseCommunitiesScreen = ({ route, navigation }) => {
  const theme = useTheme();
  const { favoriteIds = [], defaultCommunities = [] } = route.params || {};
  const [query, setQuery] = useState('');
  const [localFavs, setLocalFavs] = useState(new Set(favoriteIds));

  const baseCommunities = useMemo(() => createMockCommunities(3000), []);

  const mergedCommunities = useMemo(() => {
    const map = new Map();
    // Put defaults first
    defaultCommunities.forEach((c) => map.set(c.id, c));
    baseCommunities.forEach((c) => {
      if (!map.has(c.id)) map.set(c.id, c);
    });
    return Array.from(map.values());
  }, [defaultCommunities, baseCommunities]);

  const filtered = useMemo(() => {
    const list = mergedCommunities;
    if (!query.trim()) return list;
    const q = query.toLowerCase();
    return list.filter((c) => c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q));
  }, [query, mergedCommunities]);

  const renderItem = ({ item }) => {
    const isFavorited = localFavs.has(item.id);
    return (
      <View style={[styles.row, { backgroundColor: theme.colors.surface }]}> 
        <View style={[styles.iconBox, { backgroundColor: `${item.color}25` }]}> 
          <Ionicons name={item.icon} size={18} color={item.color} />
        </View>
        <View style={styles.rowText}>
          <Text style={[styles.name, { color: theme.colors.text }]} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={[styles.meta, { color: theme.dark ? theme.colors.text : '#6B7280' }]} numberOfLines={1}>
            {item.memberCount} members
          </Text>
        </View>
        <View style={styles.actions}> 
          <TouchableOpacity
            style={[styles.iconBoxBtn, { backgroundColor: theme.colors.surface }]}
            onPress={() => {
              setLocalFavs((prev) => {
                const next = new Set(prev);
                if (next.has(item.id)) next.delete(item.id); else next.add(item.id);
                return next;
              });
              navigation.navigate('Home', { favoriteToggle: item });
            }}
          >
            <Ionicons name={isFavorited ? 'heart' : 'heart-outline'} size={18} color={isFavorited ? '#EF4444' : theme.colors.placeholder} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconBoxBtn, { backgroundColor: theme.colors.surface }]}
            onPress={() => {
              navigation.navigate('Home', { selectedCommunityId: item.id, selectedCommunityMeta: item });
            }}
          >
            <Ionicons name="chevron-forward" size={18} color={theme.colors.placeholder} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity style={[styles.iconButton, { backgroundColor: theme.colors.surface }]} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Browse Communities</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.searchWrap}>
        <View style={[styles.searchBar, { backgroundColor: theme.colors.surface }]}>
          <Ionicons name="search" size={18} color={theme.colors.primary} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text }]}
            placeholder="Search communities..."
            placeholderTextColor={theme.colors.placeholder}
            value={query}
            onChangeText={setQuery}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={18} color={theme.colors.placeholder} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={filtered}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        initialNumToRender={20}
        windowSize={10}
        maxToRenderPerBatch={25}
        updateCellsBatchingPeriod={16}
        removeClippedSubviews
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 56 },
  iconButton: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  searchWrap: { paddingHorizontal: 16, paddingBottom: 8 },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4 },
  searchInput: { flex: 1, fontSize: 15 },
  list: { padding: 16 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, marginBottom: 8, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 3 },
  iconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  rowText: { flex: 1 },
  name: { fontSize: 15, fontWeight: '600' },
  meta: { fontSize: 12 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBoxBtn: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4 },
});

export default BrowseCommunitiesScreen; 