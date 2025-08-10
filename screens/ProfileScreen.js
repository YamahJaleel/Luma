import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Card, List, Button, Avatar, useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

const ProfileScreen = ({ navigation }) => {
  const theme = useTheme();
  const [isVerified, setIsVerified] = useState(false);

  const handleVerification = () => {
    Alert.alert(
      'Verify Your Account',
      'To ensure community safety, we require phone or email verification. This helps prevent spam and fake accounts.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Verify Now',
          onPress: () => {
            setTimeout(() => {
              setIsVerified(true);
              Alert.alert('Success!', 'Your account has been verified.');
            }, 1200);
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.profileInfo}>
            <Avatar.Text size={80} label="LU" style={{ backgroundColor: theme.colors.primary, marginRight: 15 }} color="white" labelStyle={styles.avatarLabel} labelProps={{ numberOfLines: 1 }} />
            <View style={styles.profileText}>
              <Text style={[styles.profileName, { color: theme.colors.text }]}>Luma User</Text>
              <View style={styles.verificationContainer}>
                {isVerified ? (
                  <View style={styles.verifiedBadge}>
                    <Ionicons name="checkmark-circle" size={16} color="#68D391" />
                    <Text style={[styles.verificationText, theme.dark && { color: theme.colors.text }]}>Verified Profile</Text>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.verifyButton} onPress={handleVerification}>
                    <Ionicons name="warning" size={16} color="#F6AD55" />
                    <Text style={[styles.verifyText, theme.dark && { color: theme.colors.text }]}>Verify Account</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
          <TouchableOpacity style={[styles.settingsButton, { backgroundColor: theme.colors.surface }]} onPress={() => navigation.navigate('Settings')}>
            <Ionicons name="settings-outline" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Verification Card */}
      {!isVerified && (
        <Card style={[styles.verificationCard, { backgroundColor: '#FEF5E7', borderColor: '#F6AD55' }]}>
          <Card.Content style={{ padding: 16 }}>
            <View style={styles.verificationContent}>
              <Ionicons name="shield-checkmark" size={24} color="#F6AD55" />
              <View style={styles.verificationTextBlock}>
                <Text style={[styles.verificationTitle, theme.dark && { color: theme.colors.text }]}>Verify Your Account</Text>
                <Text style={[styles.verificationSubtitle, theme.dark && { color: theme.colors.text }]}>Verification helps keep our community safe</Text>
              </View>
            </View>
            <Button mode="contained" onPress={handleVerification} style={styles.verifyAccountButton} buttonColor={theme.colors.primary}>
              Verify Now
            </Button>
          </Card.Content>
        </Card>
      )}

      {/* User Statistics */}
      <Card style={[styles.userStatsCard, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>My Activity</Text>
          <View style={styles.userStats}>
            <View style={styles.userStat}>
              <Text style={[styles.userStatNumber, { color: theme.dark ? theme.colors.text : theme.colors.primary }]}>12</Text>
              <Text style={[styles.userStatLabel, theme.dark && { color: theme.colors.text }]}>Posts</Text>
            </View>
            <View style={styles.userStat}>
              <Text style={[styles.userStatNumber, { color: theme.dark ? theme.colors.text : theme.colors.primary }]}>45</Text>
              <Text style={[styles.userStatLabel, theme.dark && { color: theme.colors.text }]}>Helped</Text>
            </View>
            <View style={styles.userStat}>
              <Text style={[styles.userStatNumber, { color: theme.dark ? theme.colors.text : theme.colors.primary }]}>8</Text>
              <Text style={[styles.userStatLabel, theme.dark && { color: theme.colors.text }]}>Watched</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Activity link (hidden, merged into Quick Links) */}
      {false && (
        <Card style={[styles.menuCard, { backgroundColor: theme.colors.surface }]}> 
          <Card.Content style={styles.menuContent}>
            <List.Item
              title="Liked Posts"
              description="See posts you've liked"
              left={(props) => <List.Icon {...props} icon="heart" color={theme.colors.primary} />}
              right={(props) => <List.Icon {...props} icon="chevron-right" color="#A0AEC0" />}
              titleStyle={{ color: theme.colors.text }}
              descriptionStyle={[styles.menuItemDescription, theme.dark && { color: theme.colors.text }]}
              style={styles.menuItem}
              onPress={() => navigation.navigate('LikedPosts')}
            />
          </Card.Content>
        </Card>
      )}

      {/* Quick Links */}
      <Card style={[styles.menuCard, { backgroundColor: theme.colors.surface }]}>
        <Card.Content style={styles.menuContent}>
          <List.Item
            title="Edit Profile"
            description="Update your profile information"
            left={(props) => <List.Icon {...props} icon="account-outline" color={theme.colors.primary} />}
            right={(props) => <List.Icon {...props} icon="chevron-right" color="#A0AEC0" />}
            titleStyle={{ color: theme.colors.text }}
            descriptionStyle={[styles.menuItemDescription, theme.dark && { color: theme.colors.text }]}
            style={styles.menuItem}
            onPress={() => Alert.alert('Feature', 'Edit Profile coming soon!')}
          />
          <List.Item
            title="Liked Posts"
            description="See posts you've liked"
            left={(props) => <List.Icon {...props} icon="heart" color={theme.colors.primary} />} 
            right={(props) => <List.Icon {...props} icon="chevron-right" color="#A0AEC0" />}
            titleStyle={{ color: theme.colors.text }}
            descriptionStyle={[styles.menuItemDescription, theme.dark && { color: theme.colors.text }]}
            style={styles.menuItem}
            onPress={() => navigation.navigate('LikedPosts')}
          />
          <List.Item
            title="About Luma"
            description="Our mission and values"
            left={(props) => <List.Icon {...props} icon="information-outline" color={theme.colors.primary} />}
            right={(props) => <List.Icon {...props} icon="chevron-right" color="#A0AEC0" />}
            titleStyle={{ color: theme.colors.text }}
            descriptionStyle={[styles.menuItemDescription, theme.dark && { color: theme.colors.text }]}
            style={styles.menuItem}
            onPress={() => Alert.alert('About', 'Luma is a safety-first platform built for a better dating world.')}
          />
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, paddingTop: 60 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  profileInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, flex: 1 },
  avatarLabel: { fontSize: 24, fontWeight: 'bold' },
  profileText: { flex: 1 },
  profileName: { fontSize: 20, fontWeight: 'bold', marginBottom: 5 },
  verificationContainer: { flexDirection: 'row', alignItems: 'center' },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center' },
  verificationText: { color: '#68D391', fontSize: 14, marginLeft: 8 },
  verifyButton: { flexDirection: 'row', alignItems: 'center' },
  verifyText: { fontSize: 14, color: '#F6AD55', fontWeight: '500', marginLeft: 4 },
  userStatsCard: { marginHorizontal: 20, marginBottom: 15, borderRadius: 12, elevation: 2 },
  userStats: { flexDirection: 'row', justifyContent: 'space-around' },
  userStat: { alignItems: 'center' },
  userStatNumber: { fontSize: 24, fontWeight: 'bold' },
  userStatLabel: { fontSize: 14, color: '#718096', marginTop: 4, textAlign: 'center' },
  activityCard: { marginHorizontal: 20, marginBottom: 15, borderRadius: 12, elevation: 2 },
  activitySubtitle: { fontSize: 14, fontWeight: '600', marginBottom: 8, opacity: 0.8 },
  verificationCard: { marginHorizontal: 20, marginBottom: 15, borderWidth: 1, borderRadius: 12 },
  verificationContent: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 15 },
  verificationTextBlock: { flex: 1, marginLeft: 12, paddingRight: 8 },
  verificationTitle: { fontSize: 16, fontWeight: 'bold', color: '#C05621' },
  verificationSubtitle: { fontSize: 14, color: '#DD6B20', marginTop: 2, lineHeight: 18 },
  verifyAccountButton: { borderRadius: 8 },
  menuCard: { marginHorizontal: 20, marginBottom: 15, borderRadius: 12, elevation: 2 },
  menuContent: { padding: 0 },
  menuItem: { paddingVertical: 8 },
  menuItemDescription: { fontSize: 14 },
  settingsButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginTop: 10,
  },
});

export default ProfileScreen; 