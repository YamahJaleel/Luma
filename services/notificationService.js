import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  serverTimestamp,
  setDoc,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from '../config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Collection names
const COLLECTIONS = {
  NOTIFICATIONS: 'notifications',
  USER_TOKENS: 'userTokens',
  NOTIFICATION_SETTINGS: 'notificationSettings'
};

// Notification types
export const NOTIFICATION_TYPES = {
  NEW_POST: 'new_post',
  NEW_COMMENT: 'new_comment',
  NEW_MESSAGE: 'new_message',
  SYSTEM: 'system'
};

// Notification priorities
export const NOTIFICATION_PRIORITIES = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent'
};

class NotificationService {
  constructor() {
    this.pushToken = null;
    this.notificationListener = null;
    this.responseListener = null;
    this.isInitialized = false;
  }

  // Initialize the notification service
  async initialize() {
    if (this.isInitialized) return;

    try {
      // Configure notification behavior
      Notifications.setNotificationHandler({
        handleNotification: async (notification) => {
          const { data } = notification.request.content;
          
          // Determine if we should show alert based on priority
          const shouldShowAlert = data?.priority !== NOTIFICATION_PRIORITIES.LOW;
          const shouldPlaySound = data?.priority === NOTIFICATION_PRIORITIES.HIGH || 
                                 data?.priority === NOTIFICATION_PRIORITIES.URGENT;
          const shouldSetBadge = true;

          return {
            shouldShowAlert,
            shouldPlaySound,
            shouldSetBadge,
          };
        },
      });

      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('❌ Notification permissions not granted');
        return false;
      }

      // Get push token
      await this.getPushToken();

      // Set up Android notification channel
      if (Platform.OS === 'android') {
        await this.setupAndroidChannels();
      }

      // Set up listeners
      this.setupNotificationListeners();

      this.isInitialized = true;
      console.log('✅ Notification service initialized');
      return true;

    } catch (error) {
      console.error('❌ Error initializing notification service:', error);
      return false;
    }
  }

  // Get Expo push token
  async getPushToken() {
    try {
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: '6ad1cc87-53bf-4ef9-8996-1d22d425ba2c' // Your EAS project ID
      });
      
      this.pushToken = token.data;
      console.log('📱 Push token obtained:', this.pushToken);
      
      // Store token in Firebase
      await this.storePushToken(this.pushToken);
      
      return this.pushToken;
    } catch (error) {
      console.error('❌ Error getting push token:', error);
      return null;
    }
  }

  // Store push token in Firebase
  async storePushToken(token, userId = null) {
    try {
      if (!userId) {
        // Get current user from auth context
        const { auth } = await import('../config/firebase');
        userId = auth.currentUser?.uid;
      }

      if (!userId) {
        console.warn('⚠️ No user ID available for storing push token');
        return;
      }

      const tokenData = {
        userId,
        token,
        platform: Platform.OS,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: true
      };

      // Check if token already exists
      const existingTokenQuery = query(
        collection(db, COLLECTIONS.USER_TOKENS),
        where('userId', '==', userId),
        where('token', '==', token)
      );
      
      const existingTokens = await getDocs(existingTokenQuery);
      
      if (existingTokens.empty) {
        // Create new token document
        await addDoc(collection(db, COLLECTIONS.USER_TOKENS), tokenData);
        console.log('✅ Push token stored in Firebase');
      } else {
        // Update existing token
        const tokenDoc = existingTokens.docs[0];
        await updateDoc(doc(db, COLLECTIONS.USER_TOKENS, tokenDoc.id), {
          updatedAt: serverTimestamp(),
          isActive: true
        });
        console.log('✅ Push token updated in Firebase');
      }

    } catch (error) {
      console.error('❌ Error storing push token:', error);
    }
  }

  // Setup Android notification channels
  async setupAndroidChannels() {
    try {
      // Default channel
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });

      // High priority channel
      await Notifications.setNotificationChannelAsync('high', {
        name: 'High Priority',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });

      // Urgent channel
      await Notifications.setNotificationChannelAsync('urgent', {
        name: 'Urgent',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });

      console.log('✅ Android notification channels setup complete');
    } catch (error) {
      console.error('❌ Error setting up Android channels:', error);
    }
  }

  // Setup notification listeners
  setupNotificationListeners() {
    // Listen for notifications received while app is foregrounded
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('📱 Notification received:', notification);
      this.handleNotificationReceived(notification);
    });

    // Listen for user interactions with notifications
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👆 Notification response:', response);
      this.handleNotificationResponse(response);
    });
  }

  // Handle notification received
  async handleNotificationReceived(notification) {
    try {
      const { data } = notification.request.content;
      
      // Store notification locally
      await this.storeLocalNotification({
        id: notification.request.identifier,
        title: notification.request.content.title,
        message: notification.request.content.body,
        data: data,
        receivedAt: new Date(),
        isRead: false
      });

      // Update unread count
      await this.updateUnreadCount();

    } catch (error) {
      console.error('❌ Error handling notification received:', error);
    }
  }

  // Handle notification response (user tapped notification)
  async handleNotificationResponse(response) {
    try {
      const { data } = response.notification.request.content;
      
      // Mark notification as read
      await this.markNotificationAsRead(response.notification.request.identifier);
      
      // Handle navigation based on notification type
      await this.handleNotificationNavigation(data);

    } catch (error) {
      console.error('❌ Error handling notification response:', error);
    }
  }

  // Handle navigation based on notification data
  async handleNotificationNavigation(data) {
    try {
      const { navigation } = await import('../components/MainStackNavigator');
      
      if (!data || !navigation) return;

      switch (data.type) {
        case NOTIFICATION_TYPES.NEW_POST:
          if (data.postId) {
            navigation.navigate('PostDetail', { postId: data.postId });
          }
          break;
          
        case NOTIFICATION_TYPES.NEW_COMMENT:
          if (data.postId) {
            navigation.navigate('PostDetail', { postId: data.postId });
          } else if (data.profileId) {
            navigation.navigate('ProfileDetail', { profileId: data.profileId });
          }
          break;
          
        case NOTIFICATION_TYPES.NEW_MESSAGE:
          if (data.senderId) {
            navigation.navigate('MessageThread', { 
              recipientId: data.senderId,
              recipientName: data.senderName 
            });
          }
          break;
          
        default:
          navigation.navigate('Notifications');
      }

    } catch (error) {
      console.error('❌ Error handling notification navigation:', error);
    }
  }

  // Send local notification
  async sendLocalNotification({
    title,
    body,
    data = {},
    priority = NOTIFICATION_PRIORITIES.NORMAL,
    sound = true
  }) {
    try {
      const channelId = this.getChannelId(priority);
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: {
            ...data,
            priority,
            timestamp: Date.now()
          },
          sound: sound,
        },
        trigger: null, // Show immediately
      });

      console.log('📱 Local notification sent:', title);
    } catch (error) {
      console.error('❌ Error sending local notification:', error);
    }
  }

  // Get channel ID based on priority
  getChannelId(priority) {
    switch (priority) {
      case NOTIFICATION_PRIORITIES.HIGH:
        return 'high';
      case NOTIFICATION_PRIORITIES.URGENT:
        return 'urgent';
      default:
        return 'default';
    }
  }

  // Send push notification to specific user
  async sendPushNotification({
    userId,
    title,
    body,
    data = {},
    priority = NOTIFICATION_PRIORITIES.NORMAL
  }) {
    try {
      // Get user's push tokens
      const tokens = await this.getUserPushTokens(userId);
      
      if (tokens.length === 0) {
        console.warn('⚠️ No push tokens found for user:', userId);
        return;
      }

      // Prepare notification payload
      const messages = tokens.map(token => ({
        to: token,
        title,
        body,
        data: {
          ...data,
          priority,
          timestamp: Date.now()
        },
        sound: 'default',
        priority: priority === NOTIFICATION_PRIORITIES.URGENT ? 'high' : 'normal',
        channelId: this.getChannelId(priority)
      }));

      // Send notifications via Expo Push API
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messages),
      });

      const result = await response.json();
      
      if (result.data) {
        console.log('✅ Push notifications sent:', result.data.length);
        
        // Store notification in Firebase
        await this.storeNotification({
          userId,
          title,
          body,
          data,
          priority,
          sentAt: serverTimestamp(),
          status: 'sent'
        });
      } else {
        console.error('❌ Error sending push notifications:', result);
      }

    } catch (error) {
      console.error('❌ Error sending push notification:', error);
    }
  }

  // Get user's push tokens
  async getUserPushTokens(userId) {
    try {
      const tokensQuery = query(
        collection(db, COLLECTIONS.USER_TOKENS),
        where('userId', '==', userId),
        where('isActive', '==', true)
      );
      
      const tokensSnapshot = await getDocs(tokensQuery);
      return tokensSnapshot.docs.map(doc => doc.data().token);
      
    } catch (error) {
      console.error('❌ Error getting user push tokens:', error);
      return [];
    }
  }

  // Store notification in Firebase
  async storeNotification(notificationData) {
    try {
      await addDoc(collection(db, COLLECTIONS.NOTIFICATIONS), {
        ...notificationData,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error('❌ Error storing notification:', error);
    }
  }

  // Store notification locally
  async storeLocalNotification(notification) {
    try {
      const existingNotifications = await this.getLocalNotifications();
      const updatedNotifications = [notification, ...existingNotifications];
      
      // Keep only last 100 notifications
      const trimmedNotifications = updatedNotifications.slice(0, 100);
      
      await AsyncStorage.setItem('notifications', JSON.stringify(trimmedNotifications));
    } catch (error) {
      console.error('❌ Error storing local notification:', error);
    }
  }

  // Get local notifications
  async getLocalNotifications() {
    try {
      const notifications = await AsyncStorage.getItem('notifications');
      return notifications ? JSON.parse(notifications) : [];
    } catch (error) {
      console.error('❌ Error getting local notifications:', error);
      return [];
    }
  }

  // Mark notification as read
  async markNotificationAsRead(notificationId) {
    try {
      const notifications = await this.getLocalNotifications();
      const updatedNotifications = notifications.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true }
          : notification
      );
      
      await AsyncStorage.setItem('notifications', JSON.stringify(updatedNotifications));
      await this.updateUnreadCount();
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
    }
  }

  // Update unread count
  async updateUnreadCount() {
    try {
      const notifications = await this.getLocalNotifications();
      const unreadCount = notifications.filter(n => !n.isRead).length;
      
      // Update badge count
      await Notifications.setBadgeCountAsync(unreadCount);
      
      // Store unread count
      await AsyncStorage.setItem('unreadNotificationCount', unreadCount.toString());
      
    } catch (error) {
      console.error('❌ Error updating unread count:', error);
    }
  }

  // Get unread count
  async getUnreadCount() {
    try {
      const count = await AsyncStorage.getItem('unreadNotificationCount');
      return count ? parseInt(count) : 0;
    } catch (error) {
      console.error('❌ Error getting unread count:', error);
      return 0;
    }
  }

  // Clear all notifications
  async clearAllNotifications() {
    try {
      await AsyncStorage.removeItem('notifications');
      await AsyncStorage.removeItem('unreadNotificationCount');
      await Notifications.setBadgeCountAsync(0);
      console.log('✅ All notifications cleared');
    } catch (error) {
      console.error('❌ Error clearing notifications:', error);
    }
  }

  // Schedule notification for later
  async scheduleNotification({
    title,
    body,
    data = {},
    trigger,
    priority = NOTIFICATION_PRIORITIES.NORMAL
  }) {
    try {
      const channelId = this.getChannelId(priority);
      
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: {
            ...data,
            priority,
            timestamp: Date.now()
          },
        },
        trigger,
      });

      console.log('⏰ Notification scheduled:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('❌ Error scheduling notification:', error);
      return null;
    }
  }

  // Cancel scheduled notification
  async cancelScheduledNotification(notificationId) {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log('❌ Scheduled notification cancelled:', notificationId);
    } catch (error) {
      console.error('❌ Error cancelling scheduled notification:', error);
    }
  }

  // Cancel all scheduled notifications
  async cancelAllScheduledNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('❌ All scheduled notifications cancelled');
    } catch (error) {
      console.error('❌ Error cancelling all scheduled notifications:', error);
    }
  }

  // Listen to notifications from Firebase
  listenToNotifications(userId, callback) {
    try {
      const notificationsQuery = query(
        collection(db, COLLECTIONS.NOTIFICATIONS),
        where('userId', '==', userId),
        orderBy('sentAt', 'desc'),
        limit(50)
      );

      return onSnapshot(notificationsQuery, (snapshot) => {
        const notifications = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        callback(notifications);
      });
    } catch (error) {
      console.error('❌ Error listening to notifications:', error);
      return null;
    }
  }

  // Cleanup
  cleanup() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
    this.isInitialized = false;
  }
}

// Create singleton instance
const notificationService = new NotificationService();

export default notificationService;
