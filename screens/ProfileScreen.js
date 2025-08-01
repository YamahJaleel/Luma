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

const ProfileScreen = () => {
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
    if (item.type === 'toggle') {
      return (
        <List.Item
          key={item.id}
          title={item.title}
          description={item.subtitle}
          left={(props) => <List.Icon {...props} icon={item.icon} color="#D4A574" />}
          right={() => (
            <Switch
              value={item.value}
              onValueChange={item.onValueChange}
              color="#D4A574"
            />
          )}
          style={styles.menuItem}
        />
      );
    }

    return (
      <List.Item
        key={item.id}
        title={item.title}
        description={item.subtitle}
        left={(props) => <List.Icon {...props} icon={item.icon} color="#D4A574" />}
        right={(props) => <List.Icon {...props} icon="chevron-right" color="#A0AEC0" />}
        style={styles.menuItem}
        onPress={() => Alert.alert('Feature', `${item.title} coming soon!`)}
      />
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.profileInfo}>
          <Avatar.Text
            size={80}
            label="LU"
            style={styles.avatar}
            color="white"
            labelStyle={styles.avatarLabel}
          />
          <View style={styles.profileText}>
            <Text style={styles.profileName}>Luma User</Text>
            <View style={styles.verificationContainer}>
              {isVerified ? (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={16} color="#68D391" />
                  <Text style={styles.verifiedText}>Verified</Text>
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

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>45</Text>
            <Text style={styles.statLabel}>Helped</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>8</Text>
            <Text style={styles.statLabel}>Watched</Text>
          </View>
        </View>
      </View>

      {/* Verification Card */}
      {!isVerified && (
        <Card style={styles.verificationCard}>
          <Card.Content>
            <View style={styles.verificationContent}>
              <Ionicons name="shield-checkmark" size={24} color="#F6AD55" />
              <View style={styles.verificationText}>
                <Text style={styles.verificationTitle}>Verify Your Account</Text>
                <Text style={styles.verificationSubtitle}>
                  Verification helps keep our community safe and prevents spam
                </Text>
              </View>
            </View>
            <Button
              mode="contained"
              onPress={handleVerification}
              style={styles.verifyAccountButton}
              buttonColor="#D9A299"
            >
              Verify Now
            </Button>
          </Card.Content>
        </Card>
      )}

      {/* Settings Menu */}
      <Card style={styles.menuCard}>
        <Card.Content style={styles.menuContent}>
          {menuItems.map(renderMenuItem)}
        </Card.Content>
      </Card>

      {/* Safety Features */}
      <Card style={styles.safetyCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Safety Features</Text>
          <View style={styles.safetyFeatures}>
            <View style={styles.safetyFeature}>
              <Ionicons name="shield-checkmark" size={20} color="#68D391" />
              <Text style={styles.safetyFeatureText}>Anonymous Posting</Text>
            </View>
            <View style={styles.safetyFeature}>
              <Ionicons name="eye-off" size={20} color="#68D391" />
              <Text style={styles.safetyFeatureText}>Privacy Protected</Text>
            </View>
            <View style={styles.safetyFeature}>
              <Ionicons name="lock-closed" size={20} color="#68D391" />
              <Text style={styles.safetyFeatureText}>Data Encrypted</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* App Info */}
      <Card style={styles.infoCard}>
        <Card.Content>
          <Text style={styles.appVersion}>Luma v1.0.0</Text>
          <Text style={styles.appDescription}>
            Your safety companion in the dating world
          </Text>
          <View style={styles.appLinks}>
            <TouchableOpacity style={styles.appLink}>
              <Text style={styles.appLinkText}>Privacy Policy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.appLink}>
              <Text style={styles.appLinkText}>Terms of Service</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.appLink}>
              <Text style={styles.appLinkText}>Community Guidelines</Text>
            </TouchableOpacity>
          </View>
        </Card.Content>
      </Card>

      {/* Logout Button */}
      <View style={styles.logoutContainer}>
        <Button
          mode="outlined"
          onPress={handleLogout}
          style={styles.logoutButton}
          textColor="#FC8181"
        >
          Logout
        </Button>
      </View>
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
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    backgroundColor: '#D9A299',
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
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D9A299',
  },
  statLabel: {
    fontSize: 14,
    color: '#718096',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 10,
  },
  verificationCard: {
    marginHorizontal: 20,
    marginBottom: 15,
    backgroundColor: '#FEF5E7',
    borderColor: '#F6AD55',
    borderWidth: 1,
  },
  verificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  verificationText: {
    flex: 1,
    marginLeft: 12,
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
    color: '#D9A299',
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
});

export default ProfileScreen; 