import notificationService, { NOTIFICATION_TYPES, NOTIFICATION_PRIORITIES } from './notificationService';
import { notificationService as firebaseNotificationService } from './firebaseService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../config/firebase';

// Notification trigger service for automatic notifications
class NotificationTriggerService {
  constructor() {
    this.isInitialized = false;
  }

  // Initialize the trigger service
  async initialize() {
    if (this.isInitialized) return;
    this.isInitialized = true;
    console.log('✅ Notification trigger service initialized');
  }

  // Trigger notification when a new post is created
  async triggerNewPostNotification(postData, communityId) {
    try {
      const user = auth.currentUser;
      if (!user) return;

      // Respect global and community notification settings
      const allowed = await this.shouldSendForCommunity(communityId);
      if (!allowed) {
        return;
      }

      // Create notification data
      const notificationData = {
        userId: user.uid,
        type: NOTIFICATION_TYPES.NEW_POST,
        title: `New post in ${this.getCommunityName(communityId)}`,
        body: postData.title,
        data: {
          type: NOTIFICATION_TYPES.NEW_POST,
          postId: postData.id,
          communityId: communityId,
          priority: NOTIFICATION_PRIORITIES.NORMAL
        },
        priority: NOTIFICATION_PRIORITIES.NORMAL
      };

      // Store in Firebase (backend/Cloud Function should pick this up to send push)
      await firebaseNotificationService.createNotification(notificationData);

      // Optional: Local foreground toast
      await notificationService.sendLocalNotification({
        title: notificationData.title,
        body: notificationData.body,
        data: notificationData.data,
        priority: notificationData.priority
      });

      console.log('📱 New post notification triggered');
    } catch (error) {
      console.error('❌ Error triggering new post notification:', error);
    }
  }

  // Trigger notification when a new comment is added
  async triggerNewCommentNotification(commentData, postId, profileId = null) {
    try {
      const user = auth.currentUser;
      if (!user) return;

      // Determine notification target
      const targetUserId = profileId ? profileId : postId; // Simplified for now

      // Respect global notification settings (no community context here)
      const allowed = await this.shouldSendForCommunity(null);
      if (!allowed) {
        return;
      }
      
      const notificationData = {
        userId: targetUserId,
        type: NOTIFICATION_TYPES.NEW_COMMENT,
        title: 'New comment',
        body: commentData.text || 'Someone commented on your post',
        data: {
          type: NOTIFICATION_TYPES.NEW_COMMENT,
          commentId: commentData.id,
          postId: postId,
          profileId: profileId,
          priority: NOTIFICATION_PRIORITIES.NORMAL
        },
        priority: NOTIFICATION_PRIORITIES.NORMAL
      };

      // Store in Firebase (backend/Cloud Function should pick this up to send push)
      await firebaseNotificationService.createNotification(notificationData);

      // Optional: Local foreground toast
      await notificationService.sendLocalNotification({
        title: notificationData.title,
        body: notificationData.body,
        data: notificationData.data,
        priority: notificationData.priority
      });

      console.log('📱 New comment notification triggered');
    } catch (error) {
      console.error('❌ Error triggering new comment notification:', error);
    }
  }

  // Trigger notification when a new message is received
  async triggerNewMessageNotification(messageData, recipientId) {
    try {
      // Respect global notification settings
      const allowed = await this.shouldSendForCommunity(null);
      if (!allowed) {
        return;
      }

      const notificationData = {
        userId: recipientId,
        type: NOTIFICATION_TYPES.NEW_MESSAGE,
        title: `New message from ${messageData.senderName || 'Someone'}`,
        body: messageData.text,
        data: {
          type: NOTIFICATION_TYPES.NEW_MESSAGE,
          messageId: messageData.id,
          senderId: messageData.senderId,
          senderName: messageData.senderName,
          priority: NOTIFICATION_PRIORITIES.HIGH
        },
        priority: NOTIFICATION_PRIORITIES.HIGH
      };

      // Store in Firebase (backend/Cloud Function should pick this up to send push)
      await firebaseNotificationService.createNotification(notificationData);

      // Do NOT send push from client; backend will deliver

      console.log('📱 New message notification triggered');
    } catch (error) {
      console.error('❌ Error triggering new message notification:', error);
    }
  }


  // Get community name from ID
  getCommunityName(communityId) {
    const communityNames = {
      'dating': 'Dating',
      'red flags': 'Red Flags',
      'green flags': 'Green Flags',
      'safety': 'Safety',
      'vent': 'Vent',
      'dating-advice': 'Dating Advice',
      'red-flags': 'Red Flags',
      'success-stories': 'Success Stories',
      'safety-tips': 'Safety Tips',
      'vent-space': 'Vent Space'
    };
    
    return communityNames[communityId] || 'Community';
  }

  // Check settings to decide if we should send notifications (global + per-community)
  async shouldSendForCommunity(communityId) {
    try {
      const enabled = await AsyncStorage.getItem('settings.notificationsEnabled');
      if (enabled === 'false') return false;

      // Per-community settings: if key missing, default allow
      if (communityId) {
        const raw = await AsyncStorage.getItem('settings.communityNotificationSettings');
        if (raw) {
          try {
            const map = JSON.parse(raw);
            if (Object.prototype.hasOwnProperty.call(map, communityId)) {
              return map[communityId] === true;
            }
          } catch {}
        }
      }
      return true;
    } catch {
      return true;
    }
  }

  // Schedule reminder notification
  async scheduleReminderNotification({
    userId,
    title,
    body,
    triggerDate,
    data = {}
  }) {
    try {
      const notificationId = await notificationService.scheduleNotification({
        title,
        body,
        data: {
          ...data,
          type: NOTIFICATION_TYPES.SYSTEM
        },
        trigger: {
          date: triggerDate
        },
        priority: NOTIFICATION_PRIORITIES.NORMAL
      });

      console.log('⏰ Reminder notification scheduled:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('❌ Error scheduling reminder notification:', error);
      return null;
    }
  }

  // Cancel scheduled reminder
  async cancelReminderNotification(notificationId) {
    try {
      await notificationService.cancelScheduledNotification(notificationId);
      console.log('❌ Reminder notification cancelled:', notificationId);
    } catch (error) {
      console.error('❌ Error cancelling reminder notification:', error);
    }
  }
}

// Create singleton instance
const notificationTriggerService = new NotificationTriggerService();

export default notificationTriggerService;
