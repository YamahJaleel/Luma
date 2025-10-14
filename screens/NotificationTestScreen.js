import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Card, useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../components/SettingsContext';
import { useTabContext } from '../components/TabContext';
import notificationService, { NOTIFICATION_TYPES, NOTIFICATION_PRIORITIES } from '../services/notificationService';
import notificationTriggerService from '../services/notificationTriggerService';

const NotificationTestScreen = ({ navigation }) => {
  const theme = useTheme();
  const { notificationsEnabled } = useSettings();
  const { setTabHidden } = useTabContext();
  const [isLoading, setIsLoading] = useState(false);

  const testLocalNotification = async () => {
    try {
      setIsLoading(true);
      await notificationService.sendLocalNotification({
        title: 'Test Local Notification',
        body: 'This is a test local notification from Luma!',
        data: {
          type: NOTIFICATION_TYPES.SYSTEM,
          testId: Date.now()
        },
        priority: NOTIFICATION_PRIORITIES.NORMAL
      });
      Alert.alert('Success', 'Local notification sent!');
    } catch (error) {
      Alert.alert('Error', 'Failed to send local notification');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const testHighPriorityNotification = async () => {
    try {
      setIsLoading(true);
      await notificationService.sendLocalNotification({
        title: 'High Priority Alert',
        body: 'This is a high priority notification!',
        data: {
          type: NOTIFICATION_TYPES.SAFETY_ALERT,
          priority: NOTIFICATION_PRIORITIES.HIGH
        },
        priority: NOTIFICATION_PRIORITIES.HIGH
      });
      Alert.alert('Success', 'High priority notification sent!');
    } catch (error) {
      Alert.alert('Error', 'Failed to send high priority notification');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const testScheduledNotification = async () => {
    try {
      setIsLoading(true);
      const triggerDate = new Date();
      triggerDate.setSeconds(triggerDate.getSeconds() + 5); // 5 seconds from now
      
      const notificationId = await notificationService.scheduleNotification({
        title: 'Scheduled Notification',
        body: 'This notification was scheduled 5 seconds ago!',
        data: {
          type: NOTIFICATION_TYPES.SYSTEM,
          scheduled: true
        },
        trigger: {
          date: triggerDate
        },
        priority: NOTIFICATION_PRIORITIES.NORMAL
      });
      
      Alert.alert('Success', `Scheduled notification (ID: ${notificationId})`);
    } catch (error) {
      Alert.alert('Error', 'Failed to schedule notification');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const testPostNotification = async () => {
    try {
      setIsLoading(true);
      await notificationTriggerService.triggerNewPostNotification({
        id: 'test-post-' + Date.now(),
        title: 'Test Post Notification',
        text: 'This is a test post notification'
      }, 'dating');
      Alert.alert('Success', 'Post notification triggered!');
    } catch (error) {
      Alert.alert('Error', 'Failed to trigger post notification');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const testMessageNotification = async () => {
    try {
      setIsLoading(true);
      await notificationTriggerService.triggerNewMessageNotification({
        id: 'test-message-' + Date.now(),
        text: 'This is a test message',
        senderId: 'test-sender',
        senderName: 'Test User'
      }, 'test-recipient');
      Alert.alert('Success', 'Message notification triggered!');
    } catch (error) {
      Alert.alert('Error', 'Failed to trigger message notification');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };


  const clearAllNotifications = async () => {
    try {
      setIsLoading(true);
      await notificationService.clearAllNotifications();
      Alert.alert('Success', 'All notifications cleared!');
    } catch (error) {
      Alert.alert('Error', 'Failed to clear notifications');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      Alert.alert('Unread Count', `You have ${count} unread notifications`);
    } catch (error) {
      Alert.alert('Error', 'Failed to get unread count');
      console.error('Error:', error);
    }
  };

  const TestButton = ({ title, onPress, icon, color = theme.colors.primary }) => (
    <TouchableOpacity
      style={[styles.testButton, { backgroundColor: color }]}
      onPress={onPress}
      disabled={isLoading}
    >
      <Ionicons name={icon} size={20} color="#FFFFFF" />
      <Text style={styles.testButtonText}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={[styles.backButton, { backgroundColor: theme.colors.surface }]} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Notification Tests</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Status Banner */}
      <Card style={[styles.statusCard, { backgroundColor: theme.colors.surface }]}>
        <Card.Content style={styles.statusContent}>
          <Ionicons 
            name={notificationsEnabled ? "notifications" : "notifications-off"} 
            size={24} 
            color={notificationsEnabled ? "#10B981" : "#EF4444"} 
          />
          <Text style={[styles.statusText, { color: theme.colors.text }]}>
            Notifications: {notificationsEnabled ? 'Enabled' : 'Disabled'}
          </Text>
        </Card.Content>
      </Card>

      {/* Test Buttons */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Card style={[styles.testCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Basic Notifications</Text>
            
            <TestButton
              title="Test Local Notification"
              onPress={testLocalNotification}
              icon="notifications"
            />
            
            <TestButton
              title="High Priority Alert"
              onPress={testHighPriorityNotification}
              icon="warning"
              color="#EF4444"
            />
            
            <TestButton
              title="Scheduled Notification (5s)"
              onPress={testScheduledNotification}
              icon="time"
              color="#F59E0B"
            />
          </Card.Content>
        </Card>

        <Card style={[styles.testCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>App-Specific Notifications</Text>
            
            <TestButton
              title="Test Post Notification"
              onPress={testPostNotification}
              icon="document-text"
              color="#3B82F6"
            />
            
            <TestButton
              title="Test Message Notification"
              onPress={testMessageNotification}
              icon="chatbubble"
              color="#8B5CF6"
            />
          </Card.Content>
        </Card>

        <Card style={[styles.testCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Management</Text>
            
            <TestButton
              title="Get Unread Count"
              onPress={getUnreadCount}
              icon="list"
              color="#6B7280"
            />
            
            <TestButton
              title="Clear All Notifications"
              onPress={clearAllNotifications}
              icon="trash"
              color="#EF4444"
            />
          </Card.Content>
        </Card>

        {/* Instructions */}
        <Card style={[styles.instructionsCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text style={[styles.instructionsTitle, { color: theme.colors.text }]}>Instructions</Text>
            <Text style={[styles.instructionsText, { color: theme.colors.text }]}>
              • Tap any button to test different notification types{'\n'}
              • Check your device's notification panel{'\n'}
              • High priority notifications will play sound{'\n'}
              • Scheduled notifications appear after 5 seconds{'\n'}
              • All notifications are stored locally and in Firebase
            </Text>
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
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
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSpacer: {
    width: 40,
  },
  statusCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  testCard: {
    marginBottom: 16,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  instructionsCard: {
    marginBottom: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#6B7280',
  },
});

export default NotificationTestScreen;
