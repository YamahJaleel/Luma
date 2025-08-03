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
import { Card, List, Button, Divider, Avatar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

const ProfileScreen = ({ navigation }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const handleVerification = () => {
    Alert.alert(
      'Verify Your Account',
      'To ensure community safety, we require phone or email verification. This helps prevent spam and fake accounts.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Verify Now',
          onPress: () => {
            // Simulate verification process
            setTimeout(() => {
              setIsVerified(true);
              Alert.alert('Success!', 'Your account has been verified.');
            }, 2000);
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            // Handle logout
            Alert.alert('Logged Out', 'You have been successfully logged out.');
          },
        },
      ]
    );
  };

  const menuItems = [
    {
      id: 'notifications',
      title: 'Notifications',
      subtitle: 'Get alerts for new posts and updates',
      icon: 'bell-outline',
      type: 'toggle',
      value: notificationsEnabled,
      onValueChange: setNotificationsEnabled,
    },
    {
      id: 'location',
      title: 'Location Services',
      subtitle: 'Allow location for safety features',
      icon: 'map-marker-outline',
      type: 'toggle',
      value: locationEnabled,
      onValueChange: setLocationEnabled,
    },
    {
      id: 'privacy',
      title: 'Privacy Settings',
      subtitle: 'Manage your data and privacy',
      icon: 'shield-account-outline',
      type: 'navigate',
    },
    {
      id: 'safety',
      title: 'Safety Resources',
      subtitle: 'Access safety tips and resources',
      icon: 'medical-bag',
      type: 'navigate',
    },
    {
      id: 'help',
      title: 'Help & Support',
      subtitle: 'Get help and contact support',
      icon: 'help-circle-outline',
      type: 'navigate',
    },
    {
      id: 'about',
      title: 'About Luma',
      subtitle: 'Learn more about our mission',
      icon: 'information-outline',
      type: 'navigate',
    },
  ];

  const renderMenuItem = (item) => {
    if (!item || !item.id) {
      return null;
    }
    
    if (item.type === 'toggle') {
      return (
        <List.Item
          key={item.id}
          title={item.title || ''}
          description={item.subtitle || ''}
          left={(props) => <List.Icon {...props} icon={item.icon || 'help-circle-outline'} color="#3E5F44" />} // Deep forest green
          titleStyle={styles.menuItemTitle}
          descriptionStyle={styles.menuItemDescription}
          right={() => (
            <Switch
              value={item.value}
              onValueChange={item.onValueChange}
              trackColor={{ false: '#E2E8F0', true: '#3E5F44' }} // Deep forest green
              thumbColor={item.value ? '#FFFFFF' : '#FFFFFF'}
            />
          )}
          style={styles.menuItem}
        />
      );
    }

    return (
      <List.Item
        key={item.id}
        title={item.title || ''}
        description={item.subtitle || ''}
        left={(props) => <List.Icon {...props} icon={item.icon || 'help-circle-outline'} color="#3E5F44" />} // Deep forest green
        titleStyle={styles.menuItemTitle}
        descriptionStyle={styles.menuItemDescription}
        right={(props) => <List.Icon {...props} icon="chevron-right" color="#A0AEC0" />}
        style={styles.menuItem}
        onPress={() => Alert.alert('Feature', `${item.title || 'This feature'} coming soon!`)}
      />
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.profileInfo}>
            <Avatar.Text
              size={80}
              label="LU"
              style={styles.avatar}
              color="white"
              labelStyle={styles.avatarLabel}
              labelProps={{ numberOfLines: 1 }}
            />
            <View style={styles.profileText}>
              <Text style={styles.profileName}>Luma User</Text>
              <View style={styles.verificationContainer}>
                {isVerified ? (
                  <View style={styles.verifiedBadge}>
                    <Ionicons name="checkmark-circle" size={16} color="#68D391" />
                    <Text style={styles.verificationText}>Verified Profile</Text>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.verifyButton} onPress={handleVerification}>
                    <Ionicons name="warning" size={16} color="#F6AD55" />
                    <Text style={styles.verifyText}>Verify Account</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.settingsButton}
            onPress={() => navigation.navigate('Settings')}
          >
            <Ionicons name="settings-outline" size={24} color="#3E5F44" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Verification Card */}
      {!isVerified && (
        <Card style={styles.verificationCard}>
          <Card.Content style={{ padding: 16 }}>
            <View style={styles.verificationContent}>
              <Ionicons name="shield-checkmark" size={24} color="#F6AD55" />
              <View style={styles.verificationText}>
                <Text style={styles.verificationTitle}>Verify Your Account</Text>
                <Text style={styles.verificationSubtitle}>
                  Verification helps keep our community safe
                </Text>
              </View>
            </View>
            <Button
              mode="contained"
              onPress={handleVerification}
              style={styles.verifyAccountButton}
              buttonColor="#3E5F44"
            >
              Verify Now
            </Button>
          </Card.Content>
        </Card>
      )}

            {/* User Statistics */}
      <Card style={styles.userStatsCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>My Activity</Text>
          <View style={styles.userStats}>
            <View style={styles.userStat}>
              <Text style={styles.userStatNumber}>12</Text>
              <Text style={styles.userStatLabel}>Posts</Text>
            </View>
            <View style={styles.userStat}>
              <Text style={styles.userStatNumber}>45</Text>
              <Text style={styles.userStatLabel}>Helped</Text>
            </View>
            <View style={styles.userStat}>
              <Text style={styles.userStatNumber}>8</Text>
              <Text style={styles.userStatLabel}>Watched</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Settings Menu */}
      <Card style={styles.menuCard}>
        <Card.Content style={styles.menuContent}>
          {menuItems && menuItems.length > 0 ? menuItems.map(renderMenuItem) : null}
        </Card.Content>
      </Card>

      {/* Safety Features */}
      <Card style={styles.safetyCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Safety Features</Text>
          <View style={styles.safetyFeatures}>
            <View style={styles.safetyFeature}>
              <Ionicons name="shield-checkmark" size={20} color="#3E5F44" />
              <Text style={styles.safetyFeatureText}>Block & Report</Text>
            </View>
            <View style={styles.safetyFeature}>
              <Ionicons name="eye-off" size={20} color="#3E5F44" />
              <Text style={styles.safetyFeatureText}>Privacy Controls</Text>
            </View>
            <View style={styles.safetyFeature}>
              <Ionicons name="lock-closed" size={20} color="#3E5F44" />
              <Text style={styles.safetyFeatureText}>Secure Messaging</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* App Info */}
      {/* Logout Button */}
    </ScrollView>
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
    alignItems: 'flex-start',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    flex: 1,
  },
  avatar: {
    backgroundColor: '#3E5F44',
    marginRight: 15,
  },
  avatarLabel: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileText: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 5,
  },
  verificationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifiedText: {
    fontSize: 14,
    color: '#68D391',
    fontWeight: '500',
    marginLeft: 4,
  },
  verifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifyText: {
    fontSize: 14,
    color: '#F6AD55',
    fontWeight: '500',
    marginLeft: 4,
  },
  userStatsCard: {
    marginHorizontal: 20,
    marginBottom: 15,
    backgroundColor: 'white',
    elevation: 2,
  },
  userStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  userStat: {
    alignItems: 'center',
  },
  userStatNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3E5F44',
  },
  userStatLabel: {
    fontSize: 14,
    color: '#718096',
    marginTop: 4,
    textAlign: 'center',
  },
  verificationCard: {
    marginHorizontal: 20,
    marginBottom: 15,
    backgroundColor: '#FEF5E7',
    borderColor: '#F6AD55',
    borderWidth: 1,
    borderRadius: 12,
  },
  verificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  verificationText: {
    flex: 1,
    marginLeft: 12,
    paddingRight: 8,
  },
  verificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#C05621',
  },
  verificationSubtitle: {
    fontSize: 14,
    color: '#DD6B20',
    marginTop: 2,
    lineHeight: 18,
  },
  verifyAccountButton: {
    borderRadius: 8,
  },
  menuCard: {
    marginHorizontal: 20,
    marginBottom: 15,
    backgroundColor: 'white',
    elevation: 2,
  },
  menuContent: {
    padding: 0,
  },
  menuItem: {
    paddingVertical: 8,
  },
  safetyCard: {
    marginHorizontal: 20,
    marginBottom: 15,
    backgroundColor: 'white',
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 15,
  },
  safetyFeatures: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  safetyFeature: {
    alignItems: 'center',
  },
  safetyFeatureText: {
    fontSize: 12,
    color: '#718096',
    marginTop: 4,
    textAlign: 'center',
  },
  infoCard: {
    marginHorizontal: 20,
    marginBottom: 15,
    backgroundColor: 'white',
    elevation: 2,
  },
  appVersion: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3748',
    textAlign: 'center',
    marginBottom: 5,
  },
  appDescription: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    marginBottom: 15,
  },
  appLinks: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  appLink: {
    paddingVertical: 5,
  },
  appLinkText: {
    fontSize: 12,
    color: '#3E5F44',
    textDecorationLine: 'underline',
  },
  logoutContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  logoutButton: {
    borderColor: '#FC8181',
    borderRadius: 8,
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
    marginTop: 10,
  },
  primaryButton: {
    backgroundColor: '#3E5F44', // Deep forest green
    marginBottom: 12,
    borderRadius: 8,
  },
  secondaryButton: {
    borderColor: '#FC8181',
    borderRadius: 8,
  },
  verificationText: {
    color: '#68D391',
    fontSize: 14,
    marginLeft: 8,
  },
  safetyText: {
    color: '#3E5F44', // Deep forest green
    fontSize: 14,
    marginLeft: 8,
  },
  sectionTitle: {
    color: '#718096',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  verificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  safetyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  menuItemTitle: {
    color: '#2D3748',
    fontSize: 16,
  },
  menuItemDescription: {
    color: '#718096',
    fontSize: 14,
  },
  verificationSection: {
    backgroundColor: '#E2E8F0',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  warningSection: {
    backgroundColor: '#FEF5E7',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    borderColor: '#F6AD55',
    borderWidth: 1,
  },
  warningTitle: {
    color: '#C05621',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  warningText: {
    color: '#DD6B20',
    fontSize: 14,
  },
});

export default ProfileScreen; 