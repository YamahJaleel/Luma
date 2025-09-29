import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Card, List, useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useTabContext } from '../components/TabContext';

const UserScreen = ({ navigation }) => {
  const theme = useTheme();
  const { setTabHidden } = useTabContext();
  const scrollYRef = React.useRef(0);
  

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
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.profileInfo}>
            <View style={styles.profileAvatar}>
              <Text style={styles.avatarText}>LU</Text>
            </View>
            <View style={styles.profileText}>
              <View style={styles.nameAndVerifyRow}>
                <Text style={[styles.profileName, { color: theme.colors.text }]}>Luma User</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity style={[styles.settingsButton, { backgroundColor: theme.colors.surface }]} onPress={() => navigation.navigate('Settings')}>
            <Ionicons name="settings-outline" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Verification removed: already performed during sign-up */}

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
          <Text style={[styles.menuSectionTitle, { color: theme.colors.text }]}>My Activity</Text>
          <List.Item
            title="Created Posts"
            description="See posts you've created"
            left={(props) => <List.Icon {...props} icon="post" color={theme.colors.primary} />}
            right={(props) => <List.Icon {...props} icon="chevron-right" color="#A0AEC0" />}
            titleStyle={{ color: theme.colors.text }}
            descriptionStyle={[styles.menuItemDescription, theme.dark && { color: theme.colors.text }]}
            style={styles.menuItem}
            onPress={() => navigation.navigate('CreatedPosts')}
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
            title="My Comments"
            description="See your comments in community posts"
            left={(props) => (
              <View style={props.style}>
                <AntDesign name="comment" size={24} color={theme.colors.primary} />
              </View>
            )}
            right={(props) => <List.Icon {...props} icon="chevron-right" color="#A0AEC0" />}
            titleStyle={{ color: theme.colors.text }}
            descriptionStyle={[styles.menuItemDescription, theme.dark && { color: theme.colors.text }]}
            style={styles.menuItem}
            onPress={() => navigation.navigate('UserComments')}
          />
          <List.Item
            title="About Luma"
            description="Our mission and values"
            left={(props) => <List.Icon {...props} icon="information-outline" color={theme.colors.primary} />}
            right={(props) => <List.Icon {...props} icon="chevron-right" color="#A0AEC0" />}
            titleStyle={{ color: theme.colors.text }}
            descriptionStyle={[styles.menuItemDescription, theme.dark && { color: theme.colors.text }]}
            style={styles.menuItem}
            onPress={() => Alert.alert('About Luma', `Luma is a safety-first platform made to provide a truly protected space in the dating world.

Our Mission:
Help you share experiences, verify concerns, and feel empowered without fear of exposure.

Key Features:
Women-Only Access
Anonymous Experience Sharing  
Search & Verify
Community Support Forum
Secure & Private by Design

Privacy is our foundation we use secure systems to ensure user information is never exposed.`)}
          />
        </Card.Content>
      </Card>
      <Card style={[styles.menuCard, { backgroundColor: theme.colors.surface }]}> 
        <Card.Content style={styles.menuContent}>
          <TouchableOpacity style={[styles.logoutRow]} onPress={() => Alert.alert('Logout', 'Are you sure you want to logout?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Logout', style: 'destructive', onPress: () => Alert.alert('Logged Out', 'You have been successfully logged out.') }
            ])}>
            <Ionicons name="log-out-outline" size={20} color="#FC8181" />
            <Text style={[styles.logoutText, { color: '#FC8181' }]}>Logout</Text>
          </TouchableOpacity>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, paddingTop: 60 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  profileInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  profileText: { flex: 1 },
  profileName: { fontSize: 20, fontWeight: 'bold' },
  
  // Profile Avatar
  profileAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#9FE6B8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3E5F44',
  },
  
  userStatsCard: { marginHorizontal: 20, marginBottom: 15, borderRadius: 12, elevation: 2 },
  userStats: { flexDirection: 'row', justifyContent: 'space-around' },
  userStat: { alignItems: 'center' },
  userStatNumber: { fontSize: 22, fontWeight: 'bold' },
  userStatLabel: { fontSize: 15, color: '#718096', marginTop: 4, textAlign: 'center' },
  activityCard: { marginHorizontal: 20, marginBottom: 15, borderRadius: 12, elevation: 2 },
  activitySubtitle: { fontSize: 15, fontWeight: '600', marginBottom: 8, opacity: 0.8 },
  
  menuCard: { marginHorizontal: 20, marginBottom: 15, borderRadius: 12, elevation: 2 },
  menuContent: { padding: 0 },
  menuItem: { paddingVertical: 8 },
  menuItemDescription: { fontSize: 14 },
  menuSectionTitle: { fontSize: 18, fontWeight: 'bold', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
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
  logoutRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, gap: 8 },
  logoutText: { fontSize: 16, fontWeight: '600', marginLeft: 4 },
  nameAndVerifyRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5, gap: 12 },
});

export default UserScreen;
