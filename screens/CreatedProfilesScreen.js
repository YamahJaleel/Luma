import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image } from 'react-native';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import { useFirebase } from '../contexts/FirebaseContext';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';

const CreatedProfilesScreen = ({ navigation }) => {
  const theme = useTheme();
  const route = useRoute();
  const { user } = useFirebase();
  const [data, setData] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    if (!user?.uid) {
      setData([]);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      const q = query(
        collection(db, 'profiles'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const profiles = [];
      
      querySnapshot.forEach((doc) => {
        profiles.push({ id: doc.id, ...doc.data() });
      });
      
      setData(profiles);
    } catch (error) {
      console.error('Error loading profiles:', error);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid]);

  React.useEffect(() => {
    load();
  }, [load]);

  React.useEffect(() => {
    if (route.params?.deletedProfileId) {
      setData((currentData) => {
        if (!Array.isArray(currentData)) return [];
        return currentData.filter((p) => p.id !== route.params.deletedProfileId);
      });
      navigation.setParams({ deletedProfileId: undefined });
    }
  }, [route.params?.deletedProfileId, navigation]);

  const renderItem = ({ item }) => {
    if (!item || !item.id) return null;
    
    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.dark ? '#374151' : '#E5E7EB' }]}
        onPress={() => navigation.navigate('ProfileDetail', { profile: item, fromScreen: 'CreatedProfiles' })}
      >
        <View style={styles.row}>
          <Image 
            source={item.avatar ? { uri: item.avatar } : require('../assets/profiles/pexels-albert-bilousov-210750737-12471262.jpg')} 
            style={styles.avatar} 
          />
          <View style={{ flex: 1 }}>
            <Text style={[styles.name, { color: theme.colors.text }]} numberOfLines={1}>{item.name || 'Untitled'}</Text>
            {item.location && (
              <Text style={[styles.meta, { color: theme.dark ? theme.colors.text : '#6B7280' }]} numberOfLines={1}>{item.location}</Text>
            )}
          </View>
          <Ionicons name="chevron-forward" size={18} color={theme.dark ? '#9CA3AF' : '#6B7280'} />
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
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Created Profiles</Text>
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
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Created Profiles</Text>
        <View style={{ width: 24 }} />
      </View>

      {data.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="person-add-outline" size={64} color={theme.dark ? '#9CA3AF' : '#6B7280'} />
          <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No Profiles Created</Text>
          <Text style={[styles.emptySubtitle, { color: theme.dark ? '#9CA3AF' : '#6B7280' }]}>Create a profile from the Search screen to see it here.</Text>
        </View>
      ) : (
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={(item, index) => item?.id || `profile-${index}`}
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
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16, marginTop: 12 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 16, marginBottom: 8 },
  emptySubtitle: { fontSize: 16, textAlign: 'center', lineHeight: 22 },
  card: { marginHorizontal: 12, marginBottom: 10, padding: 12, borderRadius: 12, borderWidth: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 8, backgroundColor: '#F0F0F0' },
  name: { fontSize: 16, fontWeight: '700' },
  meta: { fontSize: 13, fontWeight: '600' },
});

export default CreatedProfilesScreen;
