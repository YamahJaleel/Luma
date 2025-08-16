import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
} from 'react-native';
import { Card, List, useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../components/SettingsContext';
import { useTabContext } from '../components/TabContext';

const CommunityNotificationSettingsScreen = ({ navigation }) => {
  const theme = useTheme();
  const { setTabHidden } = useTabContext();
  const scrollYRef = React.useRef(0);
  const {
    communityNotificationSettings,
    updateCommunityNotificationSetting,
    isCommunityNotificationEnabled,
  } = useSettings();
  
  const [searchQuery, setSearchQuery] = useState('');

  // Mock communities - in a real app, this would come from your data source
  const communities = useMemo(() => [
    { id: 'dating-advice', name: 'Dating Advice', icon: 'heart', color: '#F1B8B2', memberCount: 15420 },
    { id: 'red-flags', name: 'Red Flags', icon: 'warning', color: '#EF4444', memberCount: 8920 },
    { id: 'success-stories', name: 'Success Stories', icon: 'star', color: '#10B981', memberCount: 12340 },
    { id: 'safety-tips', name: 'Safety Tips', icon: 'shield', color: '#F59E0B', memberCount: 9870 },
    { id: 'vent-space', name: 'Vent Space', icon: 'chatbubble', color: '#8B5CF6', memberCount: 11230 },
    { id: 'meetup-ideas', name: 'Meetup Ideas', icon: 'location', color: '#3B82F6', memberCount: 7650 },
    { id: 'relationship-advice', name: 'Relationship Advice', icon: 'people', color: '#34D399', memberCount: 13450 },
    { id: 'dating-tips', name: 'Dating Tips', icon: 'bulb', color: '#F59E0B', memberCount: 9870 },
    { id: 'online-dating', name: 'Online Dating', icon: 'globe', color: '#8B5CF6', memberCount: 8760 },
    { id: 'first-dates', name: 'First Dates', icon: 'calendar', color: '#EF4444', memberCount: 6540 },
  ], []);

  const filteredCommunities = useMemo(() => {
    if (!searchQuery.trim()) return communities;
    const query = searchQuery.toLowerCase();
    return communities.filter(community => 
      community.name.toLowerCase().includes(query) ||
      community.id.toLowerCase().includes(query)
    );
  }, [communities, searchQuery]);

  const handleToggleCommunity = (communityId, enabled) => {
    updateCommunityNotificationSetting(communityId, enabled);
  };

  const renderCommunity = (community) => {
    const isEnabled = isCommunityNotificationEnabled(community.id);
    
    return (
      <List.Item
        key={community.id}
        title={community.name}
        description={`${community.memberCount.toLocaleString()} members`}
        left={(props) => (
          <View style={[styles.communityIcon, { backgroundColor: `${community.color}15` }]}>
            <Ionicons name={community.icon} size={20} color={community.color} />
          </View>
        )}
        right={() => (
          <Switch
            value={isEnabled}
            onValueChange={(enabled) => handleToggleCommunity(community.id, enabled)}
            trackColor={{ false: '#E2E8F0', true: theme.colors.primary }}
            thumbColor={'#FFFFFF'}
          />
        )}
        titleStyle={[styles.communityTitle, { color: theme.colors.text }]}
        descriptionStyle={[styles.communityDescription, theme.dark && { color: theme.colors.text }]}
        style={styles.communityItem}
      />
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={[styles.backButton, { backgroundColor: theme.colors.surface }]} 
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Community Notifications</Text>
          <View style={styles.headerSpacer} />
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: theme.colors.surface }]}>
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text }]}
            placeholder="Search communities..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Info Card */}
      <Card style={[styles.infoCard, { backgroundColor: theme.colors.surface }]}>
        <Card.Content style={styles.infoContent}>
          <Ionicons name="information-circle" size={24} color={theme.colors.primary} />
          <Text style={[styles.infoText, { color: theme.colors.text }]}>
            All community notifications are disabled by default. Enable notifications for communities you want to stay updated on.
          </Text>
        </Card.Content>
      </Card>

      {/* Communities List */}
      <ScrollView
        style={styles.communitiesList}
        onScroll={(e) => {
          const y = e.nativeEvent.contentOffset.y;
          const prevY = scrollYRef.current || 0;
          const dy = y - prevY;
          if (dy > 5 && y > 20) {
            setTabHidden(true);
          } else if (dy < -5 || y <= 20) {
            setTabHidden(false);
          }
          scrollYRef.current = y;
        }}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        <Card style={[styles.communitiesCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content style={styles.communitiesContent}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Communities ({filteredCommunities.length})
            </Text>
            {filteredCommunities.map(renderCommunity)}
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, paddingTop: 60 },
  headerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: { fontSize: 26, fontWeight: 'bold' },
  headerSpacer: { width: 40 },
  searchContainer: { paddingHorizontal: 20, marginBottom: 16 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
  },
  infoCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    lineHeight: 22,
    color: '#6B7280',
  },
  communitiesList: { flex: 1 },
  communitiesCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  communitiesContent: { padding: 0 },
  sectionTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  communityItem: { paddingVertical: 8 },
  communityIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  communityTitle: { fontSize: 17, fontWeight: '600' },
  communityDescription: { color: '#718096', fontSize: 14 },
});

export default CommunityNotificationSettingsScreen; 