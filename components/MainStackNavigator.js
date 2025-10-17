import React from 'react';
import { View, StyleSheet, Easing } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import UserScreen from '../screens/UserScreen';
import SettingsScreen from '../screens/SettingsScreen';
import CustomNavBar from './CustomNavBar';
import CreatePostScreen from '../screens/CreatePostScreen';
import BrowseCommunitiesScreen from '../screens/BrowseCommunitiesScreen';
import LikedPostsScreen from '../screens/LikedPostsScreen';
import CreatedPostsScreen from '../screens/CreatedPostsScreen';
import CreatedProfilesScreen from '../screens/CreatedProfilesScreen';
import UserCommentsScreen from '../screens/UserCommentsScreen';
import PostDetailScreen from '../screens/PostDetailScreen';
import CreateProfileScreen from '../screens/CreateProfileScreen';
import MessagesScreen from '../screens/MessagesScreen';
import MessageThreadScreen from '../screens/MessageThreadScreen';
import CreateCommunityScreen from '../screens/CreateCommunityScreen';
import ProfileDetailScreen from '../screens/ProfileDetailScreen';
import CommunityNotificationSettingsScreen from '../screens/CommunityNotificationSettingsScreen';
import VideoScrollScreen from '../screens/VideoScrollScreen';
import LicenseVerificationScreen from '../screens/VerificationScreen';
import LumaAIScreen from '../screens/LumaAIScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import TermsOfServiceScreen from '../screens/TermsOfServiceScreen';
import CommunityGuidelinesScreen from '../screens/CommunityGuidelinesScreen';
import CongratsScreen from '../screens/CongratsScreen';
import SignInScreenCopy from '../screens/SignInScreenCopy';
import CreateAccountScreenCopy from '../screens/CreateAccountScreenCopy';
import EditProfileScreen from '../screens/EditProfileScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import ContactSupportScreen from '../screens/ContactSupportScreen';
import ReportBugScreen from '../screens/ReportBugScreen';
import SendFeedbackScreen from '../screens/SendFeedbackScreen';
import NotificationTestScreen from '../screens/NotificationTestScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import SignInToDeleteScreen from '../screens/SignInToDeleteScreen';

const Stack = createStackNavigator();

const MainStackNavigator = () => {
  return (
    <View style={styles.container}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          // Optimized transitions for snappier feel
          transitionSpec: {
            open: {
              animation: 'timing',
              config: {
                duration: 150, // Reduced from 200ms
                easing: Easing.out(Easing.quad), // Faster easing
              },
            },
            close: {
              animation: 'timing',
              config: {
                duration: 150, // Reduced from 200ms
                easing: Easing.in(Easing.quad), // Faster easing
              },
            },
          },
          // Simplified card interpolator for better performance
          cardStyleInterpolator: ({ current }) => {
            return {
              cardStyle: {
                opacity: current.progress,
              },
            };
          },
          // Disable gesture for faster transitions
          gestureEnabled: false,
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Search" component={SearchScreen} />
        <Stack.Screen name="Videos" component={VideoScrollScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="Profile" component={UserScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="CreatePost" component={CreatePostScreen} />
        <Stack.Screen name="BrowseCommunities" component={BrowseCommunitiesScreen} />
        <Stack.Screen name="LikedPosts" component={LikedPostsScreen} />
        <Stack.Screen name="CreatedPosts" component={CreatedPostsScreen} />
        <Stack.Screen name="CreatedProfiles" component={CreatedProfilesScreen} />
        <Stack.Screen name="UserComments" component={UserCommentsScreen} />
        <Stack.Screen name="PostDetail" component={PostDetailScreen} />
        <Stack.Screen name="ProfileDetail" component={ProfileDetailScreen} />
        <Stack.Screen name="CreateProfile" component={CreateProfileScreen} />
        <Stack.Screen name="Messages" component={MessagesScreen} />
        <Stack.Screen name="MessageThread" component={MessageThreadScreen} />
        <Stack.Screen name="CreateCommunity" component={CreateCommunityScreen} />
        <Stack.Screen name="CommunityNotificationSettings" component={CommunityNotificationSettingsScreen} />
        <Stack.Screen name="LicenseVerification" component={LicenseVerificationScreen} />
        <Stack.Screen name="LumaAI" component={LumaAIScreen} />
        <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
        <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} />
        <Stack.Screen name="CommunityGuidelines" component={CommunityGuidelinesScreen} />
        <Stack.Screen name="Congrats" component={CongratsScreen} />
        <Stack.Screen name="SignInCopy" component={SignInScreenCopy} />
        <Stack.Screen name="CreateAccountCopy" component={CreateAccountScreenCopy} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
        <Stack.Screen name="ContactSupport" component={ContactSupportScreen} />
        <Stack.Screen name="ReportBug" component={ReportBugScreen} />
        <Stack.Screen name="SendFeedback" component={SendFeedbackScreen} />
        <Stack.Screen name="NotificationTest" component={NotificationTestScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        <Stack.Screen name="SignInToDelete" component={SignInToDeleteScreen} />
      </Stack.Navigator>
      <CustomNavBar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default MainStackNavigator;
