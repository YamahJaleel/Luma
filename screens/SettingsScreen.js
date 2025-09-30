import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  Modal,
} from 'react-native';
import { Card, List, Button, Divider, useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useSettings } from '../components/SettingsContext';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTabContext } from '../components/TabContext';

const SettingsScreen = ({ navigation }) => {
  const theme = useTheme();
  const { setTabHidden } = useTabContext();
  const scrollYRef = React.useRef(0);
  const {
    notificationsEnabled,
    setNotificationsEnabled,
    communityAlertsEnabled,
    setCommunityAlertsEnabled,
    locationEnabled,
    setLocationEnabled,
    darkModeEnabled,
    setDarkModeEnabled,
  } = useSettings();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => Alert.alert('Logged Out', 'You have been successfully logged out.') },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert('Delete Account', 'This action cannot be undone. All your data will be permanently deleted.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { Alert.alert('Account Deleted', 'Your account has been deleted.'); } },
    ]);
  };

  const onToggleLocation = async (next) => {
    if (next) {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Location permission was not granted.');
        return;
      }
    }
    setLocationEnabled(next);
  };


  const settingsSections = [
    {
      title: 'Notifications',
      items: [
        {
          id: 'push_notifications',
          title: 'Push Notifications',
          subtitle: 'Receive alerts for new posts and updates',
          icon: 'bell-outline',
          type: 'toggle',
          value: notificationsEnabled,
          onValueChange: setNotificationsEnabled,
        },
        {
          id: 'community_alerts',
          title: 'Community Alerts',
          subtitle: 'Notifications for community activity',
          icon: 'account-group-outline',
          type: 'toggle',
          value: communityAlertsEnabled,
          onValueChange: setCommunityAlertsEnabled,
        },
      ],
    },
    {
      title: 'Privacy & Safety',
      items: [
        {
          id: 'location_services',
          title: 'Location Services',
          subtitle: 'Allow location for safety features',
          icon: 'map-marker-outline',
          type: 'toggle',
          value: locationEnabled,
          onValueChange: onToggleLocation,
        },
        { id: 'privacy_settings', title: 'Privacy Settings', subtitle: 'Manage your data and privacy', icon: 'shield-check-outline', type: 'navigate' },
        { id: 'safety_resources', title: 'Safety Resources', subtitle: 'Access safety tips and resources', icon: 'medical-bag', type: 'navigate' },
      ],
    },
    {
      title: 'Account',
      items: [
        { id: 'edit_profile', title: 'Edit Profile', subtitle: 'Update your profile information', icon: 'account-outline', type: 'navigate' },
        { id: 'change_password', title: 'Change Password', subtitle: 'Update your account password', icon: 'lock-outline', type: 'navigate' },
        { id: 'two_factor', title: 'Two-Factor Authentication', subtitle: 'Add an extra layer of security', icon: 'shield-outline', type: 'navigate' },
      ],
    },
    {
      title: 'App Preferences',
      items: [
        {
          id: 'dark_mode',
          title: 'Dark Mode',
          subtitle: 'Switch to dark theme',
          icon: 'moon-waning-crescent',
          type: 'toggle',
          value: darkModeEnabled,
          onValueChange: setDarkModeEnabled,
        },
        { id: 'clear_cache', title: 'Clear Cache', subtitle: 'Free up storage space', icon: 'trash-can-outline', type: 'action' },
      ],
    },
    {
      title: 'Support',
      items: [
        { id: 'contact_support', title: 'Contact Support', subtitle: 'Get in touch with our team', icon: 'chat-outline', type: 'navigate' },
        { id: 'report_bug', title: 'Report a Bug', subtitle: 'Help us improve the app', icon: 'bug-outline', type: 'navigate' },
        { id: 'feedback', title: 'Send Feedback', subtitle: 'Share your thoughts with us', icon: 'message-outline', type: 'navigate' },
      ],
    },
    {
      title: 'About',
      items: [
        { id: 'privacy_policy', title: 'Privacy Policy', subtitle: 'Read our privacy policy', icon: 'file-document-outline', type: 'navigate' },
        { id: 'terms_of_service', title: 'Terms of Service', subtitle: 'Read our terms of service', icon: 'file-outline', type: 'navigate' },
        { id: 'community_guidelines', title: 'Community Guidelines', subtitle: 'Our community standards', icon: 'account-group', type: 'navigate' },
        { id: 'app_version', title: 'App Version', subtitle: 'Luma v1.0.0', icon: 'cellphone-iphone', type: 'info' },
      ],
    },
  ];

  const renderMenuItem = (item) => {
    if (!item || !item.id) return null;
    if (item.id === 'about_luma') return null;

    if (item.type === 'toggle') {
      return (
        <List.Item
          key={item.id}
          title={item.title || ''}
          description={item.subtitle || ''}
          left={(props) => <List.Icon {...props} icon={item.icon || 'help-circle-outline'} color={theme.colors.primary} />}
          titleStyle={[styles.menuItemTitle, { color: theme.colors.text }]}
          descriptionStyle={[styles.menuItemDescription, theme.dark && { color: theme.colors.text }]}
          right={() => (
            <Switch
              value={item.value}
              onValueChange={item.onValueChange}
              trackColor={{ false: '#E2E8F0', true: theme.colors.primary }}
              thumbColor={'#FFFFFF'}
            />
          )}
          style={styles.menuItem}
        />
      );
    }

    if (item.type === 'action') {
      return (
        <List.Item
          key={item.id}
          title={item.title || ''}
          description={item.subtitle || ''}
          left={(props) => <List.Icon {...props} icon={item.icon || 'help-circle-outline'} color={theme.colors.primary} />}
          titleStyle={[styles.menuItemTitle, { color: theme.colors.text }]}
          descriptionStyle={[styles.menuItemDescription, theme.dark && { color: theme.colors.text }]}
          right={(props) => <List.Icon {...props} icon="chevron-right" color="#A0AEC0" />}
          style={styles.menuItem}
          onPress={async () => {
            if (item.id === 'clear_cache') {
              Alert.alert('Clear Cache', 'This will free up storage space. Continue?', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Clear', onPress: async () => { await AsyncStorage.clear(); Alert.alert('Success', 'Cache cleared successfully!'); } },
              ]);
            }
          }}
        />
      );
    }

    if (item.type === 'info') {
      return (
        <List.Item
          key={item.id}
          title={item.title || ''}
          description={item.subtitle || ''}
          left={(props) => 
            item.id === 'app_version' ? (
              <List.Icon {...props} icon={() => <MaterialCommunityIcons name="cellphone" size={24} color={theme.colors.primary} />} />
            ) : (
              <List.Icon {...props} icon={item.icon || 'help-circle-outline'} color={theme.colors.primary} />
            )
          }
          titleStyle={[styles.menuItemTitle, { color: theme.colors.text }]}
          descriptionStyle={[styles.menuItemDescription, theme.dark && { color: theme.colors.text }]}
          style={styles.menuItem}
        />
      );
    }

    return (
      <List.Item
        key={item.id}
        title={item.title || ''}
        description={item.subtitle || ''}
        left={(props) => <List.Icon {...props} icon={item.icon || 'help-circle-outline'} color={theme.colors.primary} />}
        titleStyle={[styles.menuItemTitle, { color: theme.colors.text }]}
        descriptionStyle={[styles.menuItemDescription, theme.dark && { color: theme.colors.text }]}
        right={(props) => <List.Icon {...props} icon="chevron-right" color="#A0AEC0" />}
        style={styles.menuItem}
        onPress={() => {
          if (item.id === 'about_luma') {
            Alert.alert(
              '',
              `Luma is a safety-first platform made to provide a truly protected space in the dating world.

 Our Mission:
 Help you share experiences, verify concerns, and feel empowered without fear of exposure.

 Key Features:
 Women-Only Access
 Anonymous Experience Sharing  
 Search & Verify
 Community Support Forum
 Secure & Private by Design

 Privacy is our foundation we use secure systems to ensure user information is never exposed.`,
              [{ text: 'OK', style: 'default' }]
            );
          } else {
            Alert.alert('Feature', `${item.title || 'This feature'} coming soon!`);
          }
        }}
      />
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
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
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={[styles.backButton, { backgroundColor: theme.colors.surface }]} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Settings</Text>
          <View style={styles.headerSpacer} />
        </View>
      </View>

      {/* Settings Sections */}
      {settingsSections.map((section) => (
        <Card key={section.title} style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content style={styles.sectionContent}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{section.title}</Text>
            {section.items.map(renderMenuItem)}
          </Card.Content>
        </Card>
      ))}

      {/* Account Actions */}
      <Card style={[styles.dangerCard, { backgroundColor: theme.colors.surface }]}>
        <Card.Content style={styles.sectionContent}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Account Actions</Text>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
            <Ionicons name="trash-outline" size={20} color="#FC8181" />
            <Text style={styles.deleteText}>Delete Account</Text>
          </TouchableOpacity>
        </Card.Content>
      </Card>
    </ScrollView>
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
  sectionCard: {
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dangerCard: {
    marginHorizontal: 20,
    marginBottom: 30,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionContent: { padding: 0 },
  sectionTitle: { fontSize: 19, fontWeight: 'bold', marginBottom: 15, paddingHorizontal: 16, paddingTop: 16 },
  menuItem: { paddingVertical: 8 },
  menuItemTitle: { fontSize: 17 },
  menuItemDescription: { color: '#718096', fontSize: 14 },
  logoutButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16 },
  logoutText: { color: '#FC8181', fontSize: 16, fontWeight: '600', marginLeft: 12 },
  deleteButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16 },
  deleteText: { color: '#FC8181', fontSize: 16, fontWeight: '600', marginLeft: 12 },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default SettingsScreen; 