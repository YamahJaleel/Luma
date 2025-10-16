import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Card, Avatar, Chip, useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../components/SettingsContext';
import { useTabContext } from '../components/TabContext';
import { useFocusEffect } from '@react-navigation/native';
import { useFirebase } from '../contexts/FirebaseContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import notificationService from '../services/notificationService';
import { notificationService as firebaseNotificationService } from '../services/firebaseService';

const NotificationsScreen = ({ navigation }) => {
  const theme = useTheme();
  const { notificationsEnabled, isCommunityNotificationEnabled } = useSettings();
  const { setTabHidden, setHasUnreadNotifications } = useTabContext();
  const { user } = useFirebase();
  const scrollYRef = React.useRef(0);
  
  // Mock post data for navigation
  const mockPosts = {
    'dating-advice-post-1': {
      id: 'dating-advice-post-1',
      title: 'First Date Tips That Actually Work',
      content: 'I\'ve been on quite a few first dates and here are the things that have consistently made them successful...',
      author: 'MysticWolf',
      timestamp: '2 minutes ago',
      community: 'Dating Advice',
      type: 'dating-advice',
      likes: 24,
      comments: 8,
    },
    'red-flags-post-1': {
      id: 'red-flags-post-1',
      title: 'Controlling Behavior Warning',
      content: 'I recently encountered someone who showed several concerning behaviors. Here\'s what to watch out for...',
      author: 'NeonStar',
      timestamp: '15 minutes ago',
      community: 'Red Flags',
      type: 'red-flags',
      likes: 156,
      comments: 42,
    },
    'success-stories-post-1': {
      id: 'success-stories-post-1',
      title: 'Found Love Through This Community!',
      content: 'After months of reading advice and sharing experiences here, I finally met someone amazing...',
      author: 'QuantumFlame',
      timestamp: '1 hour ago',
      community: 'Success Stories',
      type: 'success-stories',
      likes: 89,
      comments: 23,
    },
    'safety-tips-post-1': {
      id: 'safety-tips-post-1',
      title: 'Online Dating Safety Checklist',
      content: 'Before meeting someone from a dating app, make sure you\'ve covered these safety basics...',
      author: 'ShadowRider',
      timestamp: '2 hours ago',
      community: 'Safety Tips',
      type: 'safety-tips',
      likes: 203,
      comments: 67,
    },
    'vent-space-post-1': {
      id: 'vent-space-post-1',
      title: 'Frustrated with Dating Apps',
      content: 'I need to vent about the current state of dating apps. It feels like everyone is just playing games...',
      author: 'Starlight',
      timestamp: '3 hours ago',
      community: 'Vent Space',
      type: 'vent-space',
      likes: 45,
      comments: 31,
    },
  };

  const [notifications, setNotifications] = useState([]);

  // Load notifications from storage on component mount
  useEffect(() => {
    loadNotifications();
  }, []);

  // Function to reset notifications (for development/testing)
  const resetNotifications = async () => {
    try {
      await AsyncStorage.removeItem('notifications');
      loadNotifications();
    } catch (error) {
      console.log('Error resetting notifications:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      if (!user) {
        setNotifications([]);
        return;
      }

      // Load from Firebase first
      try {
        const firebaseNotifications = await firebaseNotificationService.getUserNotifications(user.uid);
        if (firebaseNotifications.length > 0) {
          setNotifications(firebaseNotifications);
          return;
        }
      } catch (error) {
        console.log('Error loading Firebase notifications:', error);
      }

      // Fallback to local storage
      const savedNotifications = await AsyncStorage.getItem('notifications');
      if (savedNotifications) {
        const parsed = JSON.parse(savedNotifications);
        // Filter out legacy welcome/system notifications
        const filtered = parsed.filter(n => !(n?.type === 'system' && (n?.title === 'Welcome to Luma!' || n?.communityId === 'system' || n?.community === 'Welcome')));
        setNotifications(filtered);
        if (filtered.length !== parsed.length) {
          await AsyncStorage.setItem('notifications', JSON.stringify(filtered));
        }
      } else {
        // No defaults anymore; start empty
        setNotifications([]);
        await AsyncStorage.setItem('notifications', JSON.stringify([]));
      }
    } catch (error) {
      console.log('Error loading notifications:', error);
      // Fallback to empty list
      setNotifications([]);
    }
  };

  const saveNotifications = async (newNotifications) => {
    try {
      await AsyncStorage.setItem('notifications', JSON.stringify(newNotifications));
    } catch (error) {
      console.log('Error saving notifications:', error);
    }
  };

  const markAsRead = async (id) => {
    try {
      // Mark as read in Firebase if user is logged in
      if (user) {
        try {
          await firebaseNotificationService.markNotificationAsRead(id);
        } catch (error) {
          console.log('Error marking notification as read in Firebase:', error);
        }
      }

      // Update local state
      setNotifications((prev) => {
        const updated = prev.map((notification) =>
          notification.id === id ? { ...notification, isRead: true } : notification
        );
        
        // Check if all notifications are now read
        const allRead = updated.every(notification => notification.isRead);
        setHasUnreadNotifications(!allRead);
        
        // Save to storage
        saveNotifications(updated);
        
        return updated;
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleNotificationPress = async (notification) => {
    // Mark as read first
    markAsRead(notification.id);
    
    // Check if notifications are enabled for this community
    if (notification.communityId && notification.communityId !== 'system') {
      const communityNotificationsEnabled = isCommunityNotificationEnabled(notification.communityId);
      if (!communityNotificationsEnabled) {
        // Show a message that notifications are disabled for this community
        return;
      }
    }
    
    // Navigate to post if available
    if (notification.postId) {
      let post = mockPosts[notification.postId];
      if (!post) {
        try {
          const createdPostsRaw = await AsyncStorage.getItem('createdPosts');
          const createdPosts = createdPostsRaw ? JSON.parse(createdPostsRaw) : [];
          post = createdPosts.find(p => p.id === notification.postId);
        } catch {}
      }
      if (post) {
        navigation.navigate('PostDetail', { 
          post,
          comments: [],
        });
      }
    }
  };

  // Function to add a new post notification (this would be called when a new post is created)
  const addNewPostNotification = (post, community) => {
    const communityId = post.type; // Using post type as community ID
    const isEnabled = isCommunityNotificationEnabled(communityId);
    
    if (!isEnabled) {
      return; // Don't add notification if community notifications are disabled
    }

    const newNotification = {
      id: Date.now(),
      type: 'community',
      title: `New post in ${community}`,
      message: post.title,
      timestamp: 'Just now',
      isRead: false,
      community: community,
      communityId: communityId,
      postId: post.id,
      icon: getNotificationIcon('community'),
      color: getNotificationColor('community'),
    };

    setNotifications(prev => {
      const updated = [newNotification, ...prev];
      saveNotifications(updated);
      return updated;
    });
  };

  // Function to simulate receiving a new post notification (for testing)
  const simulateNewPost = () => {
    const samplePost = {
      id: `sample-post-${Date.now()}`,
      title: 'Sample New Post',
      content: 'This is a sample new post content...',
      author: 'Moonbeam',
      timestamp: 'Just now',
      community: 'Dating Advice',
      type: 'dating-advice',
      likes: 0,
      comments: 0,
    };

    // Add to mock posts
    mockPosts[samplePost.id] = samplePost;
    
    // Add notification
    addNewPostNotification(samplePost, 'Dating Advice');
  };

  // Clear all notifications
  const clearAllNotifications = async () => {
    try {
      if (user) {
        // Delete all user notifications from Firebase so they don't reappear on reload
        try {
          const userNotifs = await firebaseNotificationService.getUserNotifications(user.uid, 100);
          if (Array.isArray(userNotifs) && userNotifs.length > 0) {
            await Promise.all(
              userNotifs.map((n) => firebaseNotificationService.deleteNotification(n.id))
            );
          } else {
            // Fallback: mark all as read if none fetched
            await firebaseNotificationService.markAllNotificationsAsRead(user.uid);
          }
        } catch (error) {
          console.log('Error deleting Firebase notifications:', error);
        }
      }

      // Clear local notifications and badge
      await notificationService.clearAllNotifications();
      setNotifications([]);
      setHasUnreadNotifications(false);
      
      console.log('✅ All notifications cleared');
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'community':
        return 'people';
      case 'warning':
        return 'warning';
      case 'success':
        return 'heart';
      case 'safety':
        return 'shield';
      case 'system':
        return 'settings';
      default:
        return 'notifications';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'warning':
        return '#EF4444';
      case 'success':
        return '#10B981';
      case 'safety':
        return '#F59E0B';
      case 'system':
        return '#3E5F44';
      default:
        return '#6B7280';
    }
  };

  const renderNotification = ({ item }) => {
    const communityNotificationsEnabled = item.communityId && item.communityId !== 'system' 
      ? isCommunityNotificationEnabled(item.communityId) 
      : true;
    
    const isClickable = item.postId || item.communityId === 'system'; // System notifications are always clickable
    
    return (
      <TouchableOpacity
        style={[
          styles.notificationCard, 
          !item.isRead && styles.unreadCard
        ]}
        onPress={() => handleNotificationPress(item)}
        disabled={!notificationsEnabled || !isClickable}
      >
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.notificationTextContainer}>
              <Text style={[styles.notificationTitle, { color: theme.colors.text }]}>{item.title}</Text>
              <Text style={[styles.notificationMessage, { color: theme.colors.text }]}>{item.message}</Text>
              <Text style={[styles.notificationCommunity, { color: theme.colors.text }]}>{item.community}</Text>
              <Text style={[styles.timestamp, { color: theme.colors.text }]}>{item.timestamp}</Text>
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Update tab context when notifications change
  React.useEffect(() => {
    const hasUnread = notifications.some(notification => !notification.isRead);
    setHasUnreadNotifications(hasUnread);
  }, [notifications, setHasUnreadNotifications]);

  // Update tab context every time the screen is focused
  useFocusEffect(
    React.useCallback(() => {
      const hasUnread = notifications.some(notification => !notification.isRead);
      setHasUnreadNotifications(hasUnread);
    }, [notifications, setHasUnreadNotifications])
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerText}>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Notifications</Text>
            {unreadCount > 0 && notificationsEnabled && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.checkBtn, { backgroundColor: theme.colors.surface }]}
              onPress={clearAllNotifications}
            >
              <Ionicons name="checkmark" size={22} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {!notificationsEnabled && (
        <View style={[styles.banner, { backgroundColor: theme.colors.accent }]}>
          <Ionicons name="notifications-off" size={16} color="#9CA3AF" />
          <Text style={styles.bannerText}>Push notifications are disabled in Settings</Text>
        </View>
      )}

      {/* Notifications List */}
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.notificationsList}
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
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off" size={64} color="#E2E8F0" />
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No Notifications</Text>
            <Text style={styles.emptySubtitle}>You're all caught up! New notifications will appear here.</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, paddingTop: 60 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerText: { flexDirection: 'row', alignItems: 'center' },
  buttonContainer: { flexDirection: 'row', gap: 8 },
  checkBtn: {
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
  headerTitle: { fontSize: 26, fontWeight: 'bold' },
  badge: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  badgeText: { color: 'white', fontSize: 13, fontWeight: 'bold' },
  notificationsList: { paddingHorizontal: 20, paddingBottom: 20 },
  notificationCard: { marginBottom: 12 },
  unreadCard: { opacity: 1 },
  disabledCard: { opacity: 0.6 },
  card: {
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardContent: { padding: 16 },
  notificationTextContainer: { flex: 1 },
  notificationTitle: { fontSize: 17, fontWeight: 'bold', marginBottom: 6 },
  notificationMessage: { fontSize: 14, lineHeight: 20, marginBottom: 6 },
  notificationCommunity: { fontSize: 13, fontWeight: '600', marginBottom: 4 },
  timestamp: { fontSize: 12, opacity: 0.7 },
  disabledText: { fontSize: 13, color: '#EF4444', fontStyle: 'italic' },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, paddingTop: 100 },
  emptyTitle: { fontSize: 22, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
  emptySubtitle: { fontSize: 15, color: '#718096', textAlign: 'center', lineHeight: 22 },
  banner: { marginHorizontal: 20, marginBottom: 8, padding: 10, borderRadius: 10, flexDirection: 'row', alignItems: 'center', gap: 8 },
  bannerText: { color: '#64748B', fontSize: 13 },
});

export default NotificationsScreen; 