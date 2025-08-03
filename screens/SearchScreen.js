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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const screenPadding = 20;
const availableWidth = width - (screenPadding * 2);
const gap = 10;

const SearchScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProfiles, setFilteredProfiles] = useState([]);

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
  ];

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredProfiles([]);
    } else {
      const filtered = mockProfiles.filter(
        (profile) =>
          profile.name.toLowerCase().includes(query.toLowerCase()) ||
          profile.username.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredProfiles(filtered);
    }
  };

  const getSizeStyle = (size) => {
    switch (size) {
      case 'large':
        // Two large squares per row with gap
        const largeSize = (availableWidth - gap) / 2;
        return { width: largeSize, height: largeSize };
      case 'small':
        // Three small squares per row with gaps
        const smallSize = (availableWidth - (gap * 2)) / 3;
        return { width: smallSize, height: smallSize };
      default:
        return { width: 100, height: 100 };
    }
  };

  const renderProfileSquare = ({ item }) => (
    <TouchableOpacity 
      style={[styles.profileSquare, getSizeStyle(item.size)]}
      onPress={() => navigation.navigate('ProfileDetail', { profile: item })}
    >
      <Image source={{ uri: item.avatar }} style={styles.profileImage} />
    </TouchableOpacity>
  );

  const displayProfiles = searchQuery.trim() === '' ? mockProfiles : filteredProfiles;

  // Create rows for the alternating pattern
  const createRows = () => {
    const rows = [];
    let currentIndex = 0;
    
    while (currentIndex < displayProfiles.length) {
      // Large row (2 squares)
      if (currentIndex < displayProfiles.length) {
        rows.push({
          type: 'large',
          items: displayProfiles.slice(currentIndex, currentIndex + 2)
        });
        currentIndex += 2;
      }
      
      // Small row (3 squares)
      if (currentIndex < displayProfiles.length) {
        rows.push({
          type: 'small',
          items: displayProfiles.slice(currentIndex, currentIndex + 3)
        });
        currentIndex += 3;
      }
    }
    
    return rows;
  };

  const rows = createRows();

  return (
    <View style={styles.container}>
      {/* Search Container */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#3E5F44" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search profiles..."
            placeholderTextColor="#A0AEC0"
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Ionicons name="close-circle" size={20} color="#A0AEC0" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Profile Grid */}
      <FlatList
        data={rows}
        renderItem={({ item, index }) => (
          <View style={styles.row}>
            {item.items.map((profile) => (
              <View key={profile.id} style={styles.squareContainer}>
                {renderProfileSquare({ item: profile })}
              </View>
            ))}
          </View>
        )}
        keyExtractor={(item, index) => `row-${index}`}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.gridContainer}
      />

      {/* Empty State */}
      {searchQuery.trim() !== '' && filteredProfiles.length === 0 && (
        <View style={styles.emptyContainer}>
          <Ionicons name="search" size={64} color="#E2E8F0" />
          <Text style={styles.emptyTitle}>No Results Found</Text>
          <Text style={styles.emptySubtitle}>
            No profiles found for "{searchQuery}". Try searching with a different name or username.
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDF8F3',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FDF8F3',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#2D3748',
    paddingVertical: 0,
  },
  gridContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  squareContainer: {
    flex: 1,
    marginHorizontal: 5,
  },
  profileSquare: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F0F0F0',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3748',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default SearchScreen; 