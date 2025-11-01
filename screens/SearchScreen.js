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
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../components/SettingsContext';
import { useTheme } from 'react-native-paper';
import { useTabContext } from '../components/TabContext';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { cachedProfileService } from '../services/cachedServices';
import LottieView from 'lottie-react-native';
import { generateUsername, matchesSearch } from '../utils/normalization';

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
      name: 'Jake Thompson',
      username: '@jaket',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
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
      name: 'Ryan Miller',
      username: '@ryanm',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
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
      name: 'Chris Park',
      username: '@chrisp',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
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
      name: 'Brandon Green',
      username: '@brandong',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
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
      name: 'Angel Garcia',
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
      name: 'John Taylor',
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
      name: 'Thomas White',
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
      name: 'Jack Anderson',
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
      name: 'Michael Martinez',
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
      name: 'Tommy Nguyen',
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
      name: 'Tony Rossi',
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
      name: 'Fernando Lopez',
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
      name: 'Charles King',
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
  ];

  const [profiles, setProfiles] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const pullY = React.useRef(new Animated.Value(0)).current;
  const [isPulling, setIsPulling] = useState(false);
  const [pullProgress, setPullProgress] = useState(0); // 0..1 plain number for Lottie progress
  const PULL_THRESHOLD = 90;

  // Merge helper to avoid duplicates by id
  const mergeUniqueById = (primary, secondary) => {
    const seen = new Set(primary.map((p) => p.id));
    const merged = [...primary];
    for (const p of secondary) {
      if (!seen.has(p.id)) {
        seen.add(p.id);
        merged.push(p);
      }
    }
    return merged;
  };

  // Seed initial list with mock profiles for the current location so UI isn't empty
  React.useEffect(() => {
    setProfiles((prev) => {
      if (prev && prev.length > 0) return prev;
      const seeded = mockProfiles.map((p) => ({ ...p, location }));
      return seeded;
    });
  }, []);

  // Pull fetch helper with caching
  const fetchProfiles = React.useCallback(async (forceRefresh = false) => {
    try {
      // Use cached service - automatically uses cache if available
      const remote = await cachedProfileService.getProfiles(forceRefresh);
      const normalized = (remote || []).map((p) => ({
        id: p.id,
        name: p.name || 'Unknown',
        username: generateUsername(p.name), // Generate username from name
        avatar: p.avatar || 'https://via.placeholder.com/150',
        size: p.size || 'small',
        isOnline: !!p.isOnline,
        lastSeen: p.lastSeen || 'now',
        mutualFriends: p.mutualFriends ?? 0,
        riskLevel: p.riskLevel || 'green', // Default to green if not specified
        flags: Array.isArray(p.flags) ? p.flags : [],
        reports: p.reports ?? 0,
        bio: p.bio || '',
        location: p.location || 'Toronto, ON',
      }));
      setProfiles((prev) => mergeUniqueById(normalized, prev));
    } catch (e) {
      console.log('Error fetching profiles:', e);
    }
  }, []);

  // On focus, fetch once
  useFocusEffect(
    React.useCallback(() => {
      fetchProfiles();
    }, [fetchProfiles])
  );

  // Create one realistic profile with community comments
  React.useEffect(() => {
    (async () => {
      try {
        // Clear all user-created profiles from storage first
        await AsyncStorage.removeItem('userProfiles');
        
        // Create five realistic profiles with unique community comments
        const newProfiles = [
          {
            id: 1,
            name: 'Tyler Bradshaw',
            username: '@tylerb',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
            size: 'large',
            isOnline: true,
            lastSeen: 'now',
            mutualFriends: 3,
            riskLevel: 'yellow',
            flags: ['inconsistent', 'slow_response'],
            reports: 2,
            comments: [
              {
                id: 'c1',
                author: 'Tyler Bradshaw',
                text: 'Hey Toronto! Fresh face in the city and absolutely loving it so far. When I\'m not hiking the trails or snapping photos of the skyline, you\'ll find me hunting down the best ramen spots. Anyone up for an adventure?',
                timestamp: '2 hours ago',
                isOwner: true
              },
              {
                id: 'c2',
                author: 'Sarah_M',
                text: 'I met Tyler last week and he seemed really nice at first, but he never responded to my messages after our coffee date. Kind of disappointing.',
                timestamp: '1 hour ago',
                isOwner: false
              },
              {
                id: 'c3',
                author: 'Mike_J',
                text: 'Tyler and I went hiking together and it was great! He knows some amazing trails around the city. Would definitely recommend meeting up with him.',
                timestamp: '45 min ago',
                isOwner: false
              },
              {
                id: 'c4',
                author: 'Emma_Rose',
                text: 'Tyler cancelled on me twice last minute. First time he said he was sick, second time he just didn\'t show up. Not very reliable.',
                timestamp: '30 min ago',
                isOwner: false
              },
              {
                id: 'c5',
                author: 'Alex_Chen',
                text: 'I\'ve been friends with Tyler for a few months now. He\'s a bit flaky sometimes but he\'s genuinely a good person. Just takes time to respond.',
                timestamp: '15 min ago',
                isOwner: false
              }
            ]
          },
          {
            id: 2,
            name: 'Jake Thompson',
            username: '@jaket',
            avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
            size: 'large',
            isOnline: false,
            lastSeen: '1 hour ago',
            mutualFriends: 7,
            riskLevel: 'green',
            flags: ['verified', 'helpful', 'responsive'],
            reports: 0,
            comments: [
              {
                id: 'c6',
                author: 'Jake Thompson',
                text: 'Bookworm alert! 📚 Our sci-fi book club is where magic happens every Tuesday. We\'re currently diving into some mind-bending dystopian novels and the discussions are absolutely wild. Coffee, books, and great company - what more could you want?',
                timestamp: '3 hours ago',
                isOwner: true
              },
              {
                id: 'c7',
                author: 'David_K',
                text: 'Jake is amazing! He organized a charity fundraiser last month and raised over $2000. Very dedicated and trustworthy person.',
                timestamp: '2 hours ago',
                isOwner: false
              },
              {
                id: 'c8',
                author: 'Lisa_W',
                text: 'Jake helped me move apartments last weekend. He showed up exactly on time and worked all day. Couldn\'t have done it without him!',
                timestamp: '1 hour ago',
                isOwner: false
              },
              {
                id: 'c9',
                author: 'Ryan_T',
                text: 'Met Jake through his book club. He\'s super knowledgeable about literature and always brings snacks. Great host!',
                timestamp: '45 min ago',
                isOwner: false
              },
              {
                id: 'c10',
                author: 'Maya_P',
                text: 'Jake volunteered at the animal shelter with me. He\'s so caring and patient with the animals. Really genuine person.',
                timestamp: '30 min ago',
                isOwner: false
              }
            ]
          },
          {
            id: 3,
            name: 'Mike Johnson',
            username: '@mikej',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
            size: 'small',
            isOnline: true,
            lastSeen: 'now',
            mutualFriends: 4,
            riskLevel: 'red',
            flags: ['aggressive', 'inappropriate'],
            reports: 5,
            comments: [
              {
                id: 'c11',
                author: 'Mike Johnson',
                text: 'Gym rat here! 💪 I live for the pump and love pushing my limits. Whether you\'re a beginner or a beast, I\'m always down to train hard and motivate each other. Let\'s turn those goals into gains together!',
                timestamp: '4 hours ago',
                isOwner: true
              },
              {
                id: 'c12',
                author: 'Chris_L',
                text: 'Mike made inappropriate comments to my girlfriend at the gym. Very uncomfortable situation. Would not recommend.',
                timestamp: '3 hours ago',
                isOwner: false
              },
              {
                id: 'c13',
                author: 'Tom_W',
                text: 'Mike is way too aggressive in the gym. He yelled at me for using "his" equipment and made everyone uncomfortable.',
                timestamp: '2 hours ago',
                isOwner: false
              },
              {
                id: 'c14',
                author: 'Ben_S',
                text: 'I\'ve seen Mike harass women multiple times at different gyms. He\'s been banned from 3 places already. Stay away.',
                timestamp: '1 hour ago',
                isOwner: false
              },
              {
                id: 'c15',
                author: 'Nick_R',
                text: 'Mike sent me unsolicited photos after we met at the gym. Completely inappropriate and creepy behavior.',
                timestamp: '45 min ago',
                isOwner: false
              }
            ]
          },
          {
            id: 4,
            name: 'Ryan Miller',
            username: '@ryanm',
            avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
            size: 'large',
            isOnline: false,
            lastSeen: '2 hours ago',
            mutualFriends: 6,
            riskLevel: 'green',
            flags: ['trustworthy', 'genuine', 'helpful'],
            reports: 0,
            comments: [
              {
                id: 'c16',
                author: 'Ryan Miller',
                text: 'Code wizard by day, tech enthusiast by night! 🚀 I\'m all about building cool stuff and sharing knowledge. Currently working on some exciting projects and always eager to collaborate with fellow developers. Let\'s create something amazing!',
                timestamp: '5 hours ago',
                isOwner: true
              },
              {
                id: 'c17',
                author: 'Anna_K',
                text: 'Ryan helped me debug my code for 3 hours last week. He\'s incredibly patient and knowledgeable. Great mentor!',
                timestamp: '4 hours ago',
                isOwner: false
              },
              {
                id: 'c18',
                author: 'Sam_D',
                text: 'Ryan organized a coding meetup downtown. He\'s really good at bringing people together and creating a welcoming environment.',
                timestamp: '3 hours ago',
                isOwner: false
              },
              {
                id: 'c19',
                author: 'Kevin_M',
                text: 'Met Ryan through a hackathon. He\'s brilliant with algorithms and always willing to help others learn. Very genuine person.',
                timestamp: '2 hours ago',
                isOwner: false
              },
              {
                id: 'c20',
                author: 'Lisa_T',
                text: 'Ryan volunteered to teach coding to kids at the community center. He\'s so good with children and really cares about giving back.',
                timestamp: '1 hour ago',
                isOwner: false
              }
            ]
          },
          {
            id: 5,
            name: 'Brian Ochieng',
            username: '@briano',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
            size: 'small',
            isOnline: true,
            lastSeen: 'now',
            mutualFriends: 2,
            riskLevel: 'yellow',
            flags: ['new_user', 'inconsistent'],
            reports: 1,
            comments: [
              {
                id: 'c21',
                author: 'Brian Ochieng',
                text: 'Toronto newbie here! 🌟 Just landed in this amazing city after graduation and I\'m still figuring out where everything is. Would love to meet some friendly faces who can show me around and maybe grab some coffee?',
                timestamp: '1 day ago',
                isOwner: true
              },
              {
                id: 'c22',
                author: 'Mike_J',
                text: 'Brian seemed nice when we met for coffee, but he\'s been really inconsistent with responding to messages. Takes days to reply.',
                timestamp: '20 hours ago',
                isOwner: false
              },
              {
                id: 'c23',
                author: 'Sarah_L',
                text: 'Brian cancelled on me twice for dinner plans. First time he forgot, second time he said he was too tired. Not very reliable.',
                timestamp: '18 hours ago',
                isOwner: false
              },
              {
                id: 'c24',
                author: 'David_W',
                text: 'Brian is new to the city so I\'ll give him some slack, but he needs to work on his communication skills. Hard to make plans with him.',
                timestamp: '15 hours ago',
                isOwner: false
              },
              {
                id: 'c25',
                author: 'Emma_R',
                text: 'Brian seems like a nice guy but he\'s still figuring out city life. Maybe he\'ll get better with time and experience.',
                timestamp: '12 hours ago',
                isOwner: false
              }
            ]
          },
          {
            id: 6,
            name: 'Chris Anderson',
            username: '@chrisa',
            avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
            size: 'large',
            isOnline: false,
            lastSeen: '30 min ago',
            mutualFriends: 8,
            riskLevel: 'green',
            flags: ['community_leader', 'trusted', 'helpful'],
            reports: 0,
            comments: [
              {
                id: 'c26',
                author: 'Chris Anderson',
                text: 'Community champion! 🌱 I\'m passionate about making Toronto a better place, one volunteer event at a time. From food drives to park cleanups, I organize weekly activities that bring people together for good causes. Join the movement!',
                timestamp: '6 hours ago',
                isOwner: true
              },
              {
                id: 'c27',
                author: 'Sarah_P',
                text: 'Chris organized the biggest food drive our neighborhood has ever seen. He\'s incredibly dedicated and brings everyone together.',
                timestamp: '5 hours ago',
                isOwner: false
              },
              {
                id: 'c28',
                author: 'Mark_T',
                text: 'Chris helped me find housing when I was struggling. He went above and beyond to connect me with resources. Truly caring person.',
                timestamp: '4 hours ago',
                isOwner: false
              },
              {
                id: 'c29',
                author: 'Lisa_C',
                text: 'Chris\'s community events are always well-organized and meaningful. He has a gift for bringing people together for good causes.',
                timestamp: '3 hours ago',
                isOwner: false
              },
              {
                id: 'c30',
                author: 'James_R',
                text: 'Chris is the kind of person who makes our city better. He\'s always looking out for others and organizing positive activities.',
                timestamp: '2 hours ago',
                isOwner: false
              }
            ]
          },
          {
            id: 7,
            name: 'Raj Patel',
            username: '@rajp',
            avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
            size: 'small',
            isOnline: true,
            lastSeen: 'now',
            mutualFriends: 3,
            riskLevel: 'yellow',
            flags: ['unreliable', 'slow_response'],
            reports: 2,
            comments: [
              {
                id: 'c31',
                author: 'Raj Patel',
                text: 'Camera in hand, adventure in heart! 📸 I\'m obsessed with capturing Toronto\'s hidden beauty - from sunrise at the CN Tower to the graffiti alleys of Kensington. Looking for fellow shutterbugs to explore the city\'s photogenic spots with me!',
                timestamp: '1 day ago',
                isOwner: true
              },
              {
                id: 'c32',
                author: 'Emma_L',
                text: 'Raj promised to send me photos from our photo walk but never did. He\'s nice but not very reliable with follow-through.',
                timestamp: '22 hours ago',
                isOwner: false
              },
              {
                id: 'c33',
                author: 'Tom_S',
                text: 'Raj cancelled our photography meetup twice at the last minute. First time he forgot, second time he said he was busy.',
                timestamp: '20 hours ago',
                isOwner: false
              },
              {
                id: 'c34',
                author: 'Anna_W',
                text: 'Raj takes amazing photos but he\'s really slow to respond to messages. Sometimes takes a week to get back to you.',
                timestamp: '18 hours ago',
                isOwner: false
              },
              {
                id: 'c35',
                author: 'Ben_K',
                text: 'Raj seems like a nice guy and his photography skills are impressive, but he needs to work on his communication and reliability.',
                timestamp: '15 hours ago',
                isOwner: false
              }
            ]
          },
          {
            id: 8,
            name: 'Brandon Green',
            username: '@brandong',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
            size: 'large',
            isOnline: false,
            lastSeen: '3 hours ago',
            mutualFriends: 5,
            riskLevel: 'red',
            flags: ['fake_profile', 'harassment'],
            reports: 4,
            comments: [
              {
                id: 'c36',
                author: 'Brandon Green',
                text: 'Hustle hard, dream bigger! 💼 I\'m building my empire one day at a time - from fitness coaching to launching my next big venture. Looking to connect with other ambitious minds who aren\'t afraid to grind and make things happen!',
                timestamp: '2 days ago',
                isOwner: true
              },
              {
                id: 'c37',
                author: 'Rachel_M',
                text: 'Brandon\'s photos look heavily edited and his stories don\'t add up. Something seems off about his profile. Be careful.',
                timestamp: '1 day ago',
                isOwner: false
              },
              {
                id: 'c38',
                author: 'Steve_H',
                text: 'Brandon sent me inappropriate messages after we met. He\'s not who he claims to be. Very uncomfortable experience.',
                timestamp: '20 hours ago',
                isOwner: false
              },
              {
                id: 'c39',
                author: 'Maya_D',
                text: 'Brandon harassed me online after I declined his advances. He kept messaging me even after I asked him to stop.',
                timestamp: '18 hours ago',
                isOwner: false
              },
              {
                id: 'c40',
                author: 'Kevin_L',
                text: 'Brandon\'s business claims seem fake. I looked into his company and couldn\'t find any real information. Red flags everywhere.',
                timestamp: '15 hours ago',
                isOwner: false
              }
            ]
          },
          {
            id: 9,
            name: 'James Brown',
            username: '@jamesb',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
            size: 'small',
            isOnline: true,
            lastSeen: 'now',
            mutualFriends: 4,
            riskLevel: 'green',
            flags: ['friendly', 'responsive', 'genuine'],
            reports: 0,
            comments: [
              {
                id: 'c41',
                author: 'James Brown',
                text: 'Beat maker and vibe creator! 🎵 When I\'m not dropping fire tracks in the studio, I\'m spinning records at local venues. Music is my lifeblood and I love connecting with other artists who share the same passion. Let\'s make some magic!',
                timestamp: '3 hours ago',
                isOwner: true
              },
              {
                id: 'c42',
                author: 'Maria_S',
                text: 'James helped me produce my first track and was incredibly patient with my learning process. He\'s a great teacher and mentor.',
                timestamp: '2 hours ago',
                isOwner: false
              },
              {
                id: 'c43',
                author: 'Carlos_R',
                text: 'James DJ\'d at my birthday party and everyone loved it! He\'s professional, punctual, and really knows how to read a crowd.',
                timestamp: '1 hour ago',
                isOwner: false
              },
              {
                id: 'c44',
                author: 'Sophie_L',
                text: 'James organized a music workshop for local kids. He\'s so passionate about sharing his knowledge and inspiring the next generation.',
                timestamp: '45 min ago',
                isOwner: false
              },
              {
                id: 'c45',
                author: 'Tony_M',
                text: 'James is the real deal. His beats are fire and he\'s always willing to help other artists. Very supportive of the local music scene.',
                timestamp: '30 min ago',
                isOwner: false
              }
            ]
          },
          {
            id: 10,
            name: 'Kevin Davis',
            username: '@kevind',
            avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
            size: 'large',
            isOnline: false,
            lastSeen: '2 hours ago',
            mutualFriends: 6,
            riskLevel: 'yellow',
            flags: ['inconsistent', 'unreliable'],
            reports: 3,
            comments: [
              {
                id: 'c46',
                author: 'Kevin Davis',
                text: 'Culinary artist and flavor explorer! 👨‍🍳 I\'m always experimenting in the kitchen and documenting Toronto\'s incredible food scene. From hole-in-the-wall gems to fine dining experiences, I live for great food and great company. Let\'s eat!',
                timestamp: '1 day ago',
                isOwner: true
              },
              {
                id: 'c47',
                author: 'Nina_W',
                text: 'Kevin promised to cook dinner for our group but cancelled last minute saying he was sick. Then I saw him posting about being at a restaurant.',
                timestamp: '20 hours ago',
                isOwner: false
              },
              {
                id: 'c48',
                author: 'Paul_G',
                text: 'Kevin\'s food photos look amazing but he\'s really inconsistent with following through on plans. We\'ve had several dinner plans fall through.',
                timestamp: '18 hours ago',
                isOwner: false
              },
              {
                id: 'c49',
                author: 'Lisa_H',
                text: 'Kevin seems nice and his cooking skills are impressive, but he needs to work on his reliability. Hard to make concrete plans with him.',
                timestamp: '15 hours ago',
                isOwner: false
              },
              {
                id: 'c50',
                author: 'Mark_K',
                text: 'Kevin cancelled our cooking class twice. First time he forgot, second time he said he had a family emergency. Not very dependable.',
                timestamp: '12 hours ago',
                isOwner: false
              }
            ]
          }
        ];
        
        // Save to AsyncStorage and set state
        await AsyncStorage.setItem('userProfiles', JSON.stringify(newProfiles));
        // Tag initial seed with current location so the location filter includes them
        setProfiles(newProfiles.map((p) => ({ ...p, location })));
        console.log('Created 10 realistic profiles with unique community comments');
      } catch (e) {
        console.log('Error creating profile:', e);
      }
    })();
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredProfiles([]);
    } else {
      const filtered = profiles.filter(
        (profile) => matchesSearch(query, profile.name)
      );
      setFilteredProfiles(filtered);
    }
  };

  // Receive serializable return from CreateProfile
  useFocusEffect(
    React.useCallback(() => {
      const params = route?.params || {};
      // Handle profile deletion coming back from detail
      if (params.deletedProfileId) {
        const deletedId = params.deletedProfileId;
        setProfiles((prev) => prev.filter((p) => p.id !== deletedId));
        if (searchQuery.trim()) handleSearch(searchQuery);
        navigation.setParams({ deletedProfileId: undefined });
      }
      if (params.newProfile && params.newProfile.id) {
        const np = params.newProfile;
        // Update in-memory list (ensure newest first)
        setProfiles((prev) => {
          const withoutDup = prev.filter((p) => p.id !== np.id);
          return [np, ...withoutDup];
        });
        // Persist to storage so it survives navigation/unmounts
        (async () => {
          try {
            const stored = await AsyncStorage.getItem('userProfiles');
            const list = stored ? JSON.parse(stored) : [];
            const withoutDup = Array.isArray(list) ? list.filter((p) => p.id !== np.id) : [];
            const next = [np, ...withoutDup];
            await AsyncStorage.setItem('userProfiles', JSON.stringify(next));
          } catch (e) {
            // ignore write errors
          }
        })();
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

  // Local avatar support: static requires so Metro can bundle images
  const LOCAL_AVATARS = [
    require('../assets/profiles/pexels-albert-bilousov-210750737-12471262.jpg'),
    require('../assets/profiles/pexels-cottonbro-4100484.jpg'),
    require('../assets/profiles/pexels-cottonbro-4812648.jpg'),
    require('../assets/profiles/pexels-cottonbro-7654096.jpg'),
    require('../assets/profiles/pexels-cottonbro-8209192.jpg'),
    require('../assets/profiles/pexels-david-garrison-1128051-2128807.jpg'),
    require('../assets/profiles/pexels-ekaterinabelinskaya-4923041.jpg'),
    require('../assets/profiles/pexels-jeffreyreed-769772.jpg'),
    require('../assets/profiles/pexels-ketut-subiyanto-4584262.jpg'),
    require('../assets/profiles/pexels-mart-production-7290614.jpg'),
    require('../assets/profiles/pexels-olly-3779489.jpg'),
    require('../assets/profiles/pexels-salvador-olague-682304070-17910228.jpg'),
    require('../assets/profiles/pexels-shvets-production-6975110.jpg'),
    require('../assets/profiles/pexels-silverkblack-30535621.jpg'),
    require('../assets/profiles/pexels-waldirevora-15037720.jpg'),
    require('../assets/profiles/pexels-yankrukov-7315748.jpg'),
    require('../assets/profiles/pexels-yaroslav-shuraev-6283228.jpg'),
  ];

  const getAvatarSource = (index, remoteUri) => {
    if (index >= 0 && index < LOCAL_AVATARS.length) return LOCAL_AVATARS[index];
    return { uri: withDataSaver(remoteUri) };
  };

  // Render a profile square, allowing the grid to override the visual size to
  // enforce the established layout pattern (2 large, then 3 small)
  const renderProfileSquare = ({ item, overrideSize }) => {
    const isOriginalProfile = item.id >= 1 && item.id <= 10;
    
    return (
      <TouchableOpacity 
        style={[styles.profileSquare, getSizeStyle(overrideSize || item.size)]} 
        activeOpacity={0.9}
        onPress={() => {
          // Only navigate if it's NOT one of the original 10 profiles
          if (!isOriginalProfile) {
            navigation.navigate('ProfileDetail', { profile: item });
          }
        }}
      >
        <Image source={getAvatarSource((item.id || 1) - 1, item.avatar)} style={styles.profileImage} />
      </TouchableOpacity>
    );
  };

  // Apply location filter first, then search filter
  const locationFiltered = React.useMemo(() => {
    const current = (location || '').toLowerCase();
    return profiles.filter((p) => {
      // Filter by location
      const locationMatch = (p.location || '').toLowerCase() === current;
      return locationMatch;
    });
  }, [profiles, location]);

  const listAfterSearch = searchQuery.trim() === '' ? locationFiltered : filteredProfiles.filter((p) => (p.location || '').toLowerCase() === (location || '').toLowerCase());
  const displayProfiles = dataUsageEnabled ? listAfterSearch.slice(0, 24) : listAfterSearch;

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

  const onTriggerRefresh = React.useCallback(async () => {
    if (refreshing) return;
    setRefreshing(true);
    const REFRESH_MIN_MS = 2000; // ensure the animation is visible long enough
    const startedAt = Date.now();
    try {
      // Force refresh - bypasses cache
      await fetchProfiles(true);
    } finally {
      const elapsed = Date.now() - startedAt;
      const remaining = Math.max(0, REFRESH_MIN_MS - elapsed);
      setTimeout(() => {
        Animated.timing(pullY, { toValue: 0, duration: 300, useNativeDriver: false }).start(() => {
          setRefreshing(false);
          setIsPulling(false);
        });
      }, remaining);
    }
  }, [fetchProfiles, refreshing, pullY]);

  const handlePullScroll = React.useCallback((e) => {
    const y = e.nativeEvent.contentOffset.y;
    if (y < 0 && !refreshing) {
      const dist = Math.min(-y, 140);
      pullY.setValue(dist);
      setIsPulling(true);
    } else if (!refreshing) {
      pullY.setValue(0);
      setIsPulling(false);
    }
  }, [pullY, refreshing]);

  const handlePullEnd = React.useCallback(() => {
    pullY.stopAnimation((val) => {
      if (val >= PULL_THRESHOLD && !refreshing) {
        onTriggerRefresh();
      } else {
        Animated.timing(pullY, { toValue: 0, duration: 180, useNativeDriver: false }).start(() => setIsPulling(false));
      }
    });
  }, [onTriggerRefresh, pullY, refreshing]);

  // Map pull distance to 0..1 numeric progress for Lottie (avoid passing Animated object)
  React.useEffect(() => {
    const id = pullY.addListener(({ value }) => {
      const p = Math.max(0, Math.min(1, value / PULL_THRESHOLD));
      setPullProgress(p);
    });
    return () => pullY.removeListener(id);
  }, [pullY]);

  // Using numeric pullProgress instead of Animated interpolation

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background, paddingTop: 20 }]}> 
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
        ListHeaderComponent={
          <View>
            {/* Pull-to-refresh header */}
              <Animated.View style={{ height: pullY, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 0 }}>
              {refreshing ? (
                <View style={{ width: 180, height: 100, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', marginTop: 12 }}>
                  <LottieView
                    source={require('../assets/animations/Load.json')}
                    style={{ width: 220, height: 160 }}
                    autoPlay
                    loop
                  />
                </View>
              ) : (
                <View style={{ width: 180, height: 100, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', marginTop: 12 }}>
                  <LottieView
                    source={require('../assets/animations/Load.json')}
                    style={{ width: 220, height: 160 }}
                    autoPlay={false}
                    loop={false}
                    progress={pullProgress}
                  />
                </View>
              )}
            </Animated.View>

            {/* Search controls */}
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
                onPress={() => navigation.navigate('CreateProfile')}
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
          </View>
        }
        initialNumToRender={dataUsageEnabled ? 4 : 8}
        windowSize={dataUsageEnabled ? 3 : 5}
        removeClippedSubviews={true}
        onScroll={(e) => {
          handlePullScroll(e);
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
        onScrollEndDrag={handlePullEnd}
        scrollEventThrottle={16}
      />

      {/* Empty State */}
      {searchQuery.trim() !== '' && filteredProfiles.length === 0 && (
        <View style={styles.emptyContainer}>
          <Ionicons name="search" size={64} color="#E2E8F0" />
          <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No Results Found</Text>
          <Text style={[styles.emptySubtitle, theme.dark && { color: theme.colors.text }]}> 
            No profiles found for "{searchQuery}". Try searching with a different name.
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
  searchContainer: { paddingHorizontal: 0, paddingTop: 32, paddingBottom: 12 },
  searchHeaderRow: { flexDirection: 'row', alignItems: 'center', paddingLeft: 0, paddingRight: 0, gap: 8 },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 20,
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
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 120,
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