import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { Card, List, Button, Divider, Avatar, useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../components/SettingsContext';

const SettingsScreen = ({ navigation }) => {
  const theme = useTheme();
  const {
    notificationsEnabled,
    setNotificationsEnabled,
    communityAlertsEnabled,
    setCommunityAlertsEnabled,
    locationEnabled,
    setLocationEnabled,
    darkModeEnabled,
    setDarkModeEnabled,
    biometricEnabled,
    setBiometricEnabled,
    autoBackupEnabled,
    setAutoBackupEnabled,
    dataUsageEnabled,
    setDataUsageEnabled,
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
          onValueChange: setLocationEnabled,
        },
        {
          id: 'biometric_lock',
          title: 'Biometric Lock',
          subtitle: 'Use fingerprint or face ID',
          icon: 'fingerprint',
          type: 'toggle',
          value: biometricEnabled,
          onValueChange: setBiometricEnabled,
        },
        { id: 'privacy_settings', title: 'Privacy Settings', subtitle: 'Manage your data and privacy', icon: 'shield-check-outline', type: 'navigate' },
        { id: 'safety_resources', title: 'Safety Resources', subtitle: 'Access safety tips and resources', icon: 'medical-bag', type: 'navigate' },
        { id: 'blocked_users', title: 'Blocked Users', subtitle: 'Manage blocked accounts', icon: 'account-remove-outline', type: 'navigate' },
      ],
    },
    {
      title: 'Account',
      items: [
        { id: 'edit_profile', title: 'Edit Profile', subtitle: 'Update your profile information', icon: 'account-outline', type: 'navigate' },
        { id: 'change_password', title: 'Change Password', subtitle: 'Update your account password', icon: 'lock-outline', type: 'navigate' },
        { id: 'two_factor', title: 'Two-Factor Authentication', subtitle: 'Add an extra layer of security', icon: 'shield-outline', type: 'navigate' },
        { id: 'connected_accounts', title: 'Connected Accounts', subtitle: 'Manage linked social accounts', icon: 'link-variant', type: 'navigate' },
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
        {
          id: 'auto_backup',
          title: 'Auto Backup',
          subtitle: 'Automatically backup your data',
          icon: 'cloud-upload-outline',
          type: 'toggle',
          value: autoBackupEnabled,
          onValueChange: setAutoBackupEnabled,
        },
        {
          id: 'data_usage',
          title: 'Data Saver',
          subtitle: 'Reduce data usage',
          icon: 'signal-cellular-outline',
          type: 'toggle',
          value: dataUsageEnabled,
          onValueChange: setDataUsageEnabled,
        },
        { id: 'language', title: 'Language', subtitle: 'English', icon: 'translate', type: 'navigate' },
        { id: 'clear_cache', title: 'Clear Cache', subtitle: 'Free up storage space', icon: 'trash-can-outline', type: 'action' },
      ],
    },
    {
      title: 'Support',
      items: [
        { id: 'help_center', title: 'Help Center', subtitle: 'Get help and find answers', icon: 'information-outline', type: 'navigate' },
        { id: 'contact_support', title: 'Contact Support', subtitle: 'Get in touch with our team', icon: 'chat-outline', type: 'navigate' },
        { id: 'report_bug', title: 'Report a Bug', subtitle: 'Help us improve the app', icon: 'bug-outline', type: 'navigate' },
        { id: 'feedback', title: 'Send Feedback', subtitle: 'Share your thoughts with us', icon: 'message-outline', type: 'navigate' },
      ],
    },
    {
      title: 'About',
      items: [
        { id: 'about_luma', title: 'About Luma', subtitle: 'Learn more about Luma', icon: 'information-outline', type: 'navigate' },
        { id: 'privacy_policy', title: 'Privacy Policy', subtitle: 'Read our privacy policy', icon: 'file-document-outline', type: 'navigate' },
        { id: 'terms_of_service', title: 'Terms of Service', subtitle: 'Read our terms of service', icon: 'file-outline', type: 'navigate' },
        { id: 'community_guidelines', title: 'Community Guidelines', subtitle: 'Our community standards', icon: 'account-group', type: 'navigate' },
        { id: 'app_version', title: 'App Version', subtitle: 'Luma v1.0.0', icon: 'cellphone-iphone', type: 'info' },
      ],
    },
  ];

  const renderMenuItem = (item) => {
    if (!item || !item.id) return null;

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
          onPress={() => {
            if (item.id === 'clear_cache') {
              Alert.alert('Clear Cache', 'This will free up storage space. Continue?', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Clear', onPress: () => Alert.alert('Success', 'Cache cleared successfully!') },
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
          left={(props) => <List.Icon {...props} icon={item.icon || 'help-circle-outline'} color={theme.colors.primary} />}
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
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
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
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#FC8181" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
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
  headerTitle: { fontSize: 24, fontWeight: 'bold' },
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
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, paddingHorizontal: 16, paddingTop: 16 },
  menuItem: { paddingVertical: 8 },
  menuItemTitle: { fontSize: 16 },
  menuItemDescription: { color: '#718096', fontSize: 14 },
  logoutButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16 },
  logoutText: { color: '#FC8181', fontSize: 16, fontWeight: '500', marginLeft: 12 },
  deleteButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16 },
  deleteText: { color: '#FC8181', fontSize: 16, fontWeight: '500', marginLeft: 12 },
});

export default SettingsScreen; 