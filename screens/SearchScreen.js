import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
    TextInput,
  Modal,
 } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../components/SettingsContext';
import { useTheme } from 'react-native-paper';
import { useTabContext } from '../components/TabContext';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const screenPadding = 20;
const availableWidth = width - screenPadding * 2;
const gap = 10;

const SearchScreen = ({ navigation, route }) => {
  const theme = useTheme();
  const { dataUsageEnabled } = useSettings();
  const { setTabHidden } = useTabContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProfiles, setFilteredProfiles] = useState([]);
  const [location, setLocation] = useState('Toronto, ON');
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationInput, setLocationInput] = useState('Toronto, ON');
  const CAN_LOCATIONS = React.useMemo(
    () => [
      'Toronto, ON','Vancouver, BC','Montreal, QC','Calgary, AB','Edmonton, AB','Ottawa, ON','Winnipeg, MB','Quebec City, QC','Hamilton, ON','Kitchener, ON',
      'Mississauga, ON','Brampton, ON','Surrey, BC','Halifax, NS','Victoria, BC','Saskatoon, SK','Regina, SK','London, ON','Markham, ON','Burnaby, BC'
    ],
    []
  );
  const OTHER_LOCATIONS = React.useMemo(
    () => [
      'New York, NY','Los Angeles, CA','Chicago, IL','Houston, TX','Phoenix, AZ','Philadelphia, PA','San Antonio, TX','San Diego, CA','Dallas, TX','San Jose, CA',
      'Austin, TX','Jacksonville, FL','San Francisco, CA','Columbus, OH','Fort Worth, TX','Indianapolis, IN','Charlotte, NC','Seattle, WA','Denver, CO','Washington, DC',
      'Boston, MA','El Paso, TX','Nashville, TN','Detroit, MI','Oklahoma City, OK','Portland, OR','Las Vegas, NV','Memphis, TN','Louisville, KY','Baltimore, MD',
      'Miami, FL','Atlanta, GA','Vancouver, BC','London, UK','Paris, FR','Berlin, DE','Sydney, AU','Melbourne, AU','Tokyo, JP','Seoul, KR','Singapore'
    ],
    []
  );
  const ALL_LOCATIONS = React.useMemo(() => [...CAN_LOCATIONS, ...OTHER_LOCATIONS], [CAN_LOCATIONS, OTHER_LOCATIONS]);
  const filteredLocations = React.useMemo(() => {
    const q = locationInput.trim().toLowerCase();
    if (!q) return CAN_LOCATIONS.slice(0, 8);
    return ALL_LOCATIONS.filter((name) => name.toLowerCase().includes(q)).slice(0, 8);
  }, [locationInput, CAN_LOCATIONS, ALL_LOCATIONS]);

  const scrollYRef = React.useRef(0);

  // Mock profile data with different sizes
  const mockProfiles = [
    {
      id: 1,
      name: 'Tyler Bradshaw',
      username: '@tylerb',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      size: 'large',
      isOnline: true,
      lastSeen: '2 min ago',
      mutualFriends: 3,
      riskLevel: 'green',
      flags: ['trustworthy', 'responsive', 'genuine'],
      reports: 0,
    },
    {
      id: 2,
      name: 'Sarah Chen',
      username: '@sarahchen',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      size: 'large',
      isOnline: false,
      lastSeen: '1 hour ago',
      mutualFriends: 5,
      riskLevel: 'yellow',
      flags: ['inconsistent', 'ghosting'],
      reports: 2,
    },
    {
      id: 3,
      name: 'Mike Johnson',
      username: '@mikej',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      size: 'small',
      isOnline: true,
      lastSeen: '5 min ago',
      mutualFriends: 2,
      riskLevel: 'green',
      flags: ['reliable', 'good_communication'],
      reports: 0,
    },
    {
      id: 4,
      name: 'Emma Wilson',
      username: '@emmaw',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      size: 'small',
      isOnline: false,
      lastSeen: '3 hours ago',
      mutualFriends: 7,
      riskLevel: 'red',
      flags: ['catfish', 'fake_profile', 'harassment'],
      reports: 5,
    },
    {
      id: 5,
      name: 'Alex Rodriguez',
      username: '@alexr',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      size: 'small',
      isOnline: true,
      lastSeen: '1 min ago',
      mutualFriends: 4,
      riskLevel: 'green',
      flags: ['verified', 'helpful'],
      reports: 0,
    },
    {
      id: 6,
      name: 'Lisa Park',
      username: '@lisap',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
      size: 'large',
      isOnline: false,
      lastSeen: '30 min ago',
      mutualFriends: 1,
      riskLevel: 'yellow',
      flags: ['unreliable'],
      reports: 1,
    },
    {
      id: 7,
      name: 'David Kim',
      username: '@davidk',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
      size: 'large',
      isOnline: true,
      lastSeen: 'now',
      mutualFriends: 6,
      riskLevel: 'green',
      flags: ['community_leader', 'trusted'],
      reports: 0,
    },
    {
      id: 8,
      name: 'Rachel Green',
      username: '@rachelg',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
      size: 'small',
      isOnline: false,
      lastSeen: '2 hours ago',
      mutualFriends: 8,
      riskLevel: 'green',
      flags: ['friendly', 'active'],
      reports: 0,
    },
    {
      id: 9,
      name: 'James Brown',
      username: '@jamesb',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      size: 'small',
      isOnline: true,
      lastSeen: '5 min ago',
      mutualFriends: 3,
      riskLevel: 'red',
      flags: ['aggressive', 'inappropriate'],
      reports: 3,
    },
    {
      id: 10,
      name: 'Maria Garcia',
      username: '@mariag',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      size: 'small',
      isOnline: false,
      lastSeen: '1 day ago',
      mutualFriends: 2,
      riskLevel: 'green',
      flags: ['new_user', 'verified'],
      reports: 0,
    },
    {
      id: 11,
      name: 'Chris Lee',
      username: '@chrisl',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      size: 'large',
      isOnline: true,
      lastSeen: 'now',
      mutualFriends: 4,
      riskLevel: 'yellow',
      flags: ['inconsistent'],
      reports: 1,
    },
    {
      id: 12,
      name: 'Amanda Taylor',
      username: '@amandat',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      size: 'large',
      isOnline: false,
      lastSeen: '4 hours ago',
      mutualFriends: 5,
      riskLevel: 'green',
      flags: ['helpful', 'responsive'],
      reports: 0,
    },
    {
      id: 13,
      name: 'Ryan Miller',
      username: '@ryanm',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      size: 'small',
      isOnline: true,
      lastSeen: '2 min ago',
      mutualFriends: 3,
      riskLevel: 'green',
      flags: ['verified', 'trusted'],
      reports: 0,
    },
    {
      id: 14,
      name: 'Jessica White',
      username: '@jessicaw',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
      size: 'small',
      isOnline: false,
      lastSeen: '1 hour ago',
      mutualFriends: 6,
      riskLevel: 'red',
      flags: ['fake_profile', 'harassment'],
      reports: 4,
    },
    {
      id: 15,
      name: 'Kevin Davis',
      username: '@kevind',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
      size: 'small',
      isOnline: true,
      lastSeen: 'now',
      mutualFriends: 2,
      riskLevel: 'green',
      flags: ['friendly'],
      reports: 0,
    },
    {
      id: 16,
      name: 'Sophie Anderson',
      username: '@sophiea',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
      size: 'large',
      isOnline: false,
      lastSeen: '30 min ago',
      mutualFriends: 4,
      riskLevel: 'yellow',
      flags: ['unreliable'],
      reports: 1,
    },
    {
      id: 17,
      name: 'Olivia Martinez',
      username: '@oliviam',
      avatar: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=150&h=150&fit=crop&crop=face',
      size: 'small',
      isOnline: true,
      lastSeen: 'now',
      mutualFriends: 5,
      riskLevel: 'green',
      flags: ['friendly', 'responsive'],
      reports: 0,
    },
    {
      id: 18,
      name: 'Noah Thompson',
      username: '@noaht',
      avatar: 'https://images.unsplash.com/photo-1544005314-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
      size: 'large',
      isOnline: false,
      lastSeen: '10 min ago',
      mutualFriends: 1,
      riskLevel: 'yellow',
      flags: ['inconsistent'],
      reports: 1,
    },
    {
      id: 19,
      name: 'Ava Nguyen',
      username: '@avan',
      avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&h=150&fit=crop&crop=face',
      size: 'small',
      isOnline: true,
      lastSeen: '3 min ago',
      mutualFriends: 6,
      riskLevel: 'green',
      flags: ['trusted', 'verified'],
      reports: 0,
    },
    {
      id: 20,
      name: 'William Clark',
      username: '@willc',
      avatar: 'https://images.unsplash.com/photo-1519340241574-2cec6aef0c01?w=150&h=150&fit=crop&crop=face',
      size: 'small',
      isOnline: false,
      lastSeen: '2 hours ago',
      mutualFriends: 2,
      riskLevel: 'red',
      flags: ['harassment'],
      reports: 3,
    },
    {
      id: 21,
      name: 'Isabella Rossi',
      username: '@isabellar',
      avatar: 'https://images.unsplash.com/photo-1548142813-c348350df52b?w=150&h=150&fit=crop&crop=face',
      size: 'large',
      isOnline: true,
      lastSeen: 'now',
      mutualFriends: 7,
      riskLevel: 'green',
      flags: ['community_leader'],
      reports: 0,
    },
    {
      id: 22,
      name: 'Liam Patel',
      username: '@liamp',
      avatar: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=150&h=150&fit=crop&crop=face',
      size: 'small',
      isOnline: false,
      lastSeen: 'yesterday',
      mutualFriends: 3,
      riskLevel: 'yellow',
      flags: ['slow_response'],
      reports: 1,
    },
    {
      id: 23,
      name: 'Mia Lopez',
      username: '@mial',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
      size: 'large',
      isOnline: true,
      lastSeen: 'now',
      mutualFriends: 9,
      riskLevel: 'green',
      flags: ['helpful', 'verified'],
      reports: 0,
    },
    {
      id: 24,
      name: 'Ethan Walker',
      username: '@ethanw',
      avatar: 'https://images.unsplash.com/photo-1546456073-6712f79251bb?w=150&h=150&fit=crop&crop=face',
      size: 'small',
      isOnline: false,
      lastSeen: '5 hours ago',
      mutualFriends: 2,
      riskLevel: 'green',
      flags: ['genuine'],
      reports: 0,
    },
    {
      id: 25,
      name: 'Charlotte King',
      username: '@charlottek',
      avatar: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=150&h=150&fit=crop&crop=face',
      size: 'large',
      isOnline: false,
      lastSeen: '20 min ago',
      mutualFriends: 4,
      riskLevel: 'yellow',
      flags: ['inconsistent'],
      reports: 2,
    },
    {
      id: 26,
      name: 'Benjamin Scott',
      username: '@bens',
      avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150&h=150&fit=crop&crop=face',
      size: 'small',
      isOnline: true,
      lastSeen: 'now',
      mutualFriends: 1,
      riskLevel: 'green',
      flags: ['responsive'],
      reports: 0,
    },
    {
      id: 27,
      name: 'Harper Young',
      username: '@harpery',
      avatar: 'https://images.unsplash.com/photo-1544005314-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
      size: 'small',
      isOnline: false,
      lastSeen: '3 hours ago',
      mutualFriends: 6,
      riskLevel: 'green',
      flags: ['trusted'],
      reports: 0,
    },
    {
      id: 28,
      name: 'Elijah Rivera',
      username: '@elijahr',
      avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&h=150&fit=crop&crop=face',
      size: 'large',
      isOnline: true,
      lastSeen: 'now',
      mutualFriends: 2,
      riskLevel: 'green',
      flags: ['verified'],
      reports: 0,
    },
    {
      id: 29,
      name: 'Amelia Baker',
      username: '@ameliab',
      avatar: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=150&h=150&fit=crop&crop=face',
      size: 'small',
      isOnline: false,
      lastSeen: 'yesterday',
      mutualFriends: 3,
      riskLevel: 'yellow',
      flags: ['slow_response'],
      reports: 1,
    },
    {
      id: 30,
      name: 'Lucas Bennett',
      username: '@lucasb',
      avatar: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150&h=150&fit=crop&crop=face',
      size: 'large',
      isOnline: true,
      lastSeen: 'now',
      mutualFriends: 8,
      riskLevel: 'green',
      flags: ['community_leader', 'trusted'],
      reports: 0,
    },
  ];

  const [profiles, setProfiles] = useState(mockProfiles);

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredProfiles([]);
    } else {
      const filtered = profiles.filter(
        (profile) =>
          profile.name.toLowerCase().includes(query.toLowerCase()) ||
          profile.username?.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredProfiles(filtered);
    }
  };

  // Receive serializable return from CreateProfile
  useFocusEffect(
    React.useCallback(() => {
      const params = route?.params || {};
      if (params.newProfile && params.newProfile.id) {
        const np = params.newProfile;
        setProfiles((prev) => [np, ...prev]);
        if (searchQuery.trim()) handleSearch(searchQuery);
        navigation.setParams({ newProfile: undefined });
      }
    }, [route?.params, searchQuery])
  );

  const getSizeStyle = (size) => {
    switch (size) {
      case 'large':
        const largeSize = (availableWidth - gap) / 2;
        return { width: largeSize, height: largeSize };
      case 'small':
        const smallSize = (availableWidth - gap * 2) / 3;
        return { width: smallSize, height: smallSize };
      default:
        return { width: 100, height: 100 };
    }
  };

  const withDataSaver = (uri) => {
    if (!dataUsageEnabled) return uri;
    const hasParams = uri.includes('?');
    const joiner = hasParams ? '&' : '?';
    return `${uri}${joiner}q=40&auto=format`;
  };

  const handleProfilePress = (profile) => {
    navigation.navigate('ProfileDetail', { profile });
  };

  // Render a profile square, allowing the grid to override the visual size to
  // enforce the established layout pattern (2 large, then 3 small)
  const renderProfileSquare = ({ item, overrideSize }) => (
    <TouchableOpacity 
      style={[styles.profileSquare, getSizeStyle(overrideSize || item.size)]} 
      onPress={() => handleProfilePress(item)}
      activeOpacity={0.9}
    >
      <Image source={{ uri: withDataSaver(item.avatar) }} style={styles.profileImage} />
    </TouchableOpacity>
  );

  const fullList = searchQuery.trim() === '' ? profiles : filteredProfiles;
  const displayProfiles = dataUsageEnabled ? fullList.slice(0, 24) : fullList;

  // Create rows for the alternating pattern
  const createRows = () => {
    const rows = [];
    let currentIndex = 0;
    
    while (currentIndex < displayProfiles.length) {
      if (currentIndex < displayProfiles.length) {
        rows.push({ type: 'large', items: displayProfiles.slice(currentIndex, currentIndex + 2) });
        currentIndex += 2;
      }
      if (currentIndex < displayProfiles.length) {
        rows.push({ type: 'small', items: displayProfiles.slice(currentIndex, currentIndex + 3) });
        currentIndex += 3;
      }
    }
    
    return rows;
  };

  const rows = createRows();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      {/* Search Container */}
      <View style={styles.searchContainer}>
        <View style={styles.searchHeaderRow}>
          <View style={[styles.searchBar, { backgroundColor: theme.colors.surface }]}> 
            <Ionicons name="search" size={20} color={theme.colors.primary} style={styles.searchIcon} />
          <TextInput
              style={[styles.searchInput, { color: theme.colors.text } ]}
            placeholder="Search name"
              placeholderTextColor={theme.colors.placeholder}
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
                <Ionicons name="close-circle" size={20} color={theme.colors.placeholder} />
            </TouchableOpacity>
          )}
          </View>
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: theme.colors.surface }]}
            onPress={() =>
              navigation.navigate('CreateProfile')
            }
          >
            <Ionicons name="add" size={22} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.locationRow}
          onPress={() => { setLocationInput(location); setShowLocationModal(true); }}
          activeOpacity={0.8}
        >
          <Ionicons name="location" size={12} color="#3E5F44" />
          <Text style={[styles.locationText, { color: "#3E5F44" }]}>{location}</Text>
        </TouchableOpacity>
      </View>

      {/* Profile Grid */}
      <FlatList
        data={rows}
        renderItem={({ item: row }) => (
          <View style={styles.row}>
            {row.items.map((profile) => (
              <View key={profile.id} style={styles.squareContainer}>
                {renderProfileSquare({ item: profile, overrideSize: row.type })}
              </View>
            ))}
          </View>
        )}
        keyExtractor={(item, index) => `row-${index}`}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.gridContainer}
        initialNumToRender={dataUsageEnabled ? 4 : 8}
        windowSize={dataUsageEnabled ? 3 : 5}
        removeClippedSubviews={true}
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
      />

      {/* Empty State */}
      {searchQuery.trim() !== '' && filteredProfiles.length === 0 && (
        <View style={styles.emptyContainer}>
          <Ionicons name="search" size={64} color="#E2E8F0" />
          <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No Results Found</Text>
          <Text style={[styles.emptySubtitle, theme.dark && { color: theme.colors.text }]}> 
            No profiles found for "{searchQuery}". Try searching with a different name or username.
          </Text>
        </View>
      )}

      {/* Location Modal */}
      <Modal visible={showLocationModal} transparent animationType="fade" onRequestClose={() => setShowLocationModal(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowLocationModal(false)}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Change Location</Text>
              <TouchableOpacity onPress={() => setShowLocationModal(false)}>
                <Ionicons name="close" size={22} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <TextInput
                style={[styles.locationInput, { color: theme.colors.text }]}
                placeholder="City, State"
                placeholderTextColor={theme.colors.placeholder}
                value={locationInput}
                onChangeText={setLocationInput}
                autoFocus
              />
              <FlatList
                data={filteredLocations}
                keyExtractor={(item) => item}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.suggestionRow} onPress={() => setLocationInput(item)}>
                    <Ionicons name="location-outline" size={16} color={theme.colors.primary} />
                    <Text style={[styles.suggestionText, { color: theme.colors.text }]} numberOfLines={1}>{item}</Text>
                  </TouchableOpacity>
                )}
                contentContainerStyle={styles.suggestionsList}
              />
              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: theme.colors.primary }]}
                onPress={() => { setLocation(locationInput); setShowLocationModal(false); }}
              >
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchContainer: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 12 },
  searchHeaderRow: { flexDirection: 'row', alignItems: 'center' },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  addBtn: {
    width: 44,
    height: 44,
    marginLeft: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  searchIcon: { marginRight: 12 },
  searchInput: { flex: 1, fontSize: 16, paddingVertical: 0 },
  gridContainer: { paddingHorizontal: 20, paddingBottom: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  squareContainer: { flex: 1, marginHorizontal: 5 },
  profileSquare: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  profileImage: { width: '100%', height: '100%', backgroundColor: '#F0F0F0' },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  emptyTitle: { fontSize: 22, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
  emptySubtitle: { fontSize: 15, color: '#718096', textAlign: 'center', lineHeight: 22 },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingVertical: 4,
  },
  locationText: {
    marginLeft: 4,
    fontSize: 13,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: 'bold',
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  locationInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 15,
    color: '#374151',
    marginBottom: 15,
  },
  saveBtn: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
  },
  suggestionsList: { paddingBottom: 8 },
  suggestionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 8 },
  suggestionText: { fontSize: 14, flex: 1 },
});

export default SearchScreen; 