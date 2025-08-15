import React from 'react';
import { View, StyleSheet, Easing } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AnimatedTabBar from './AnimatedTabBar';
import CreatePostScreen from '../screens/CreatePostScreen';
import BrowseCommunitiesScreen from '../screens/BrowseCommunitiesScreen';
import LikedPostsScreen from '../screens/LikedPostsScreen';
import PostDetailScreen from '../screens/PostDetailScreen';
import CreateProfileScreen from '../screens/CreateProfileScreen';
import MessagesScreen from '../screens/MessagesScreen';
import MessageThreadScreen from '../screens/MessageThreadScreen';
import CreateCommunityScreen from '../screens/CreateCommunityScreen';
import ProfileDetailScreen from '../screens/ProfileDetailScreen';
import CommunityNotificationSettingsScreen from '../screens/CommunityNotificationSettingsScreen';

const Stack = createStackNavigator();

const MainStackNavigator = () => {
  return (
    <View style={styles.container}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          transitionSpec: {
            open: {
              animation: 'timing',
              config: {
                duration: 200,
                easing: Easing.out(Easing.cubic),
              },
            },
            close: {
              animation: 'timing',
              config: {
                duration: 200,
                easing: Easing.in(Easing.cubic),
              },
            },
          },
          cardStyleInterpolator: ({ current }) => {
            return {
              cardStyle: {
                opacity: current.progress,
              },
            };
          },
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Search" component={SearchScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="CreatePost" component={CreatePostScreen} />
        <Stack.Screen name="BrowseCommunities" component={BrowseCommunitiesScreen} />
        <Stack.Screen name="LikedPosts" component={LikedPostsScreen} />
        <Stack.Screen name="PostDetail" component={PostDetailScreen} />
        <Stack.Screen name="ProfileDetail" component={ProfileDetailScreen} />
        <Stack.Screen name="CreateProfile" component={CreateProfileScreen} />
        <Stack.Screen name="Messages" component={MessagesScreen} />
        <Stack.Screen name="MessageThread" component={MessageThreadScreen} />
        <Stack.Screen name="CreateCommunity" component={CreateCommunityScreen} />
        <Stack.Screen name="CommunityNotificationSettings" component={CommunityNotificationSettingsScreen} />
      </Stack.Navigator>
      <AnimatedTabBar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default MainStackNavigator; 