import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Card, Avatar, Chip } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

const NotificationsScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'community',
      title: 'New post in Dating Advice',
      message: 'Someone shared a new experience about first dates',
      timestamp: '2 minutes ago',
      isRead: false,
      community: 'Dating Advice',
      icon: 'heart',
      color: '#F1B8B2',
    },
    {
      id: 2,
      type: 'warning',
      title: 'Red flag alert',
      message: 'A new warning was posted about controlling behavior',
      timestamp: '15 minutes ago',
      isRead: false,
      community: 'Red Flags',
      icon: 'warning',
      color: '#EF4444',
    },
    {
      id: 3,
      type: 'success',
      title: 'Success story shared',
      message: 'Someone found love through the community!',
      timestamp: '1 hour ago',
      isRead: true,
      community: 'Success Stories',
      icon: 'star',
      color: '#10B981',
    },
    {
      id: 4,
      type: 'safety',
      title: 'New safety tip',
      message: 'Important safety advice for meeting people online',
      timestamp: '2 hours ago',
      isRead: true,
      community: 'Safety Tips',
      icon: 'shield',
      color: '#F59E0B',
    },
    {
      id: 5,
      type: 'community',
      title: 'Trending post',
      message: 'A post in Vent Space is getting lots of attention',
      timestamp: '3 hours ago',
      isRead: true,
      community: 'Vent Space',
      icon: 'chatbubble',
      color: '#8B5CF6',
    },
    {
      id: 6,
      type: 'system',
      title: 'Welcome to Luma!',
      message: 'Your account has been successfully created',
      timestamp: '1 day ago',
      isRead: true,
      icon: 'checkmark-circle',
      color: '#3E5F44',
    },
  ]);

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isRead: true }
          : notification
      )
    );
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

  const renderNotification = ({ item }) => (
    <TouchableOpacity
      style={[styles.notificationCard, !item.isRead && styles.unreadCard]}
      onPress={() => markAsRead(item.id)}
    >
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.notificationHeader}>
            <View style={[styles.iconContainer, { backgroundColor: `${item.color}15` }]}>
              <Ionicons name={item.icon} size={20} color={item.color} />
            </View>
            <View style={styles.notificationInfo}>
              <Text style={styles.notificationTitle}>{item.title}</Text>
              <Text style={styles.notificationMessage}>{item.message}</Text>
              <View style={styles.notificationMeta}>
                <Chip 
                  style={[styles.communityChip, { backgroundColor: `${item.color}15` }]}
                  textStyle={[styles.communityText, { color: item.color }]}
                >
                  {item.community}
                </Chip>
                <Text style={styles.timestamp}>{item.timestamp}</Text>
              </View>
            </View>
            {!item.isRead && <View style={styles.unreadDot} />}
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Notifications</Text>
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Notifications List */}
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.notificationsList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off" size={64} color="#E2E8F0" />
            <Text style={styles.emptyTitle}>No Notifications</Text>
            <Text style={styles.emptySubtitle}>
              You're all caught up! New notifications will appear here.
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDF8F3',
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  badge: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  settingsButton: {
    width: 48,
    height: 48,
    backgroundColor: 'white',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  notificationsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  notificationCard: {
    marginBottom: 12,
  },
  unreadCard: {
    opacity: 1,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardContent: {
    padding: 16,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationInfo: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 8,
  },
  notificationMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  communityChip: {
    height: 24,
  },
  communityText: {
    fontSize: 12,
    fontWeight: '500',
  },
  timestamp: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    marginLeft: 8,
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingTop: 100,
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

export default NotificationsScreen; 