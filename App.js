import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import navigation from './navigation';
import { createStackNavigator } from '@react-navigation/stack';
import { PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import { SettingsProvider, useSettings } from './components/SettingsContext';
import { TabProvider } from './components/TabContext';
import { OnboardingProvider, useOnboarding } from './components/OnboardingContext';
import { FirebaseProvider, useFirebase } from './contexts/FirebaseContext';
// AuthContext removed; use FirebaseContext instead
import TabNavigator from './components/MainStackNavigator';
import notificationService from './services/notificationService';

import OnboardingScreen from './screens/OnboardingScreen';
import CreateAccountScreen from './screens/CreateAccountScreen';
import SignInScreen from './screens/SignInScreen';
import TermsOfServiceScreen from './screens/TermsOfServiceScreen';
import PrivacyPolicyScreen from './screens/PrivacyPolicyScreen';
import ProfileDetailScreen from './screens/ProfileDetailScreen';
import LicenseVerificationScreen from './screens/VerificationScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import ResetPasswordScreen from './screens/ResetPasswordScreen';
import CongratsScreen from './screens/CongratsScreen';
const Stack = createStackNavigator();

// Web-specific CSS injection for proper scrolling
if (Platform.OS === 'web') {
  const style = document.createElement('style');
  style.textContent = `
    html, body, #root {
      height: 100%;
      overflow: auto;
    }
    .expo-scroll-view {
      height: 100vh !important;
      overflow: auto !important;
    }
  `;
  document.head.appendChild(style);
}

const lightTheme = {
  dark: false,
  colors: {
    primary: '#3E5F44',
    secondary: '#F1B8B2',
    background: '#FDF8F3',
    surface: '#FFFFFF',
    text: '#2D3748',
    placeholder: '#A0AEC0',
    accent: '#F0E4D3',
    success: '#68D391',
    warning: '#F6AD55',
    error: '#FC8181',
    blue: '#7C9AFF',
    lightBlue: '#A8B8FF',
    // Onboarding-inspired accent colors
    searchBlue: '#06B6D4',
    communityGreen: '#10B981',
    encryptionOrange: '#F59E0B',
    getStartedPurple: '#6366F1',
    // Soft gradients for subtle use
    softBlue: '#ECFEFF',
    softGreen: '#ECFDF5',
    softOrange: '#FFFBEB',
    softPurple: '#EEF2FF',
  },
};

const darkTheme = {
  dark: true,
  colors: {
    primary: '#9FE6B8',
    secondary: '#F1B8B2',
    background: '#111827',
    surface: '#1F2937',
    text: '#FFFFFF',
    placeholder: '#D1D5DB',
    accent: '#1F2937',
    success: '#34D399',
    warning: '#F59E0B',
    error: '#F87171',
    blue: '#60A5FA',
    lightBlue: '#93C5FD',
    // Onboarding-inspired accent colors (adjusted for dark mode)
    searchBlue: '#22D3EE',
    communityGreen: '#34D399',
    encryptionOrange: '#FBBF24',
    getStartedPurple: '#A78BFA',
    // Soft gradients for subtle use (darker for dark mode)
    softBlue: '#0C4A6E',
    softGreen: '#064E3B',
    softOrange: '#451A03',
    softPurple: '#1E1B4B',
  },
};

const AppContent = () => {
  const { darkModeEnabled, notificationsEnabled } = useSettings();
  const theme = darkModeEnabled ? darkTheme : lightTheme;
  const { isOnboarded } = useOnboarding();
  const { user } = useFirebase();

  React.useEffect(() => {
    const initializeNotifications = async () => {
      if (!notificationsEnabled) return;
      
      try {
        // Initialize the notification service
        const initialized = await notificationService.initialize();
        if (initialized) {
          console.log('✅ Notification service initialized successfully');
        } else {
          console.log('⚠️ Notification service initialization failed');
        }
      } catch (error) {
        console.error('❌ Error initializing notifications:', error);
      }
    };

    initializeNotifications();
  }, [notificationsEnabled]);

  return (
    <PaperProvider theme={theme}>
          <TabProvider>
            <NavigationContainer
              ref={navigation.navigationRef}
              linking={{
                prefixes: ['https://luma-app-c2412.firebaseapp.com', 'https://lumaapp.page.link', 'luma://'],
                config: {
                  screens: {
                    ResetPassword: '__/auth/action',
                  },
                },
              }}
            >
          <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
            <StatusBar style={darkModeEnabled ? 'light' : 'dark'} backgroundColor={theme.colors.background} />
            {!isOnboarded ? (
              <Stack.Navigator 
                screenOptions={{ headerShown: false }}
                initialRouteName="Onboarding"
              >
                <Stack.Screen 
                  name="Onboarding" 
                  component={OnboardingScreen}
                />
                <Stack.Screen 
                  name="CreateAccount" 
                  component={CreateAccountScreen}
                />
                <Stack.Screen 
                  name="LicenseVerification" 
                  component={LicenseVerificationScreen}
                />
                <Stack.Screen 
                  name="Congrats" 
                  component={CongratsScreen}
                />
                <Stack.Screen 
                  name="SignIn" 
                  component={SignInScreen}
                />
                <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
                <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
                <Stack.Screen 
                  name="TermsOfService"
                  component={TermsOfServiceScreen}
                />
                <Stack.Screen 
                  name="PrivacyPolicy" 
                  component={PrivacyPolicyScreen}
                />
              </Stack.Navigator>
            ) : !user ? (
              <Stack.Navigator 
                screenOptions={{ headerShown: false }}
                initialRouteName="SignIn"
              >
                <Stack.Screen 
                  name="SignIn" 
                  component={SignInScreen}
                />
                <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
                <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
                <Stack.Screen 
                  name="CreateAccount" 
                  component={CreateAccountScreen}
                />
                <Stack.Screen 
                  name="LicenseVerification" 
                  component={LicenseVerificationScreen}
                />
                <Stack.Screen 
                  name="TermsOfService"
                  component={TermsOfServiceScreen}
                />
                <Stack.Screen 
                  name="PrivacyPolicy" 
                  component={PrivacyPolicyScreen}
                />
              </Stack.Navigator>
            ) : (
              <Stack.Navigator 
                screenOptions={{ 
                  headerShown: false,
                  cardStyleInterpolator: ({ current, layouts }) => ({
                      cardStyle: {
                        transform: [
                          {
                            translateX: current.progress.interpolate({
                              inputRange: [0, 1],
                              outputRange: [layouts.screen.width, 0],
                            }),
                          },
                        ],
                      },
                  }),
                }}
              >
                <Stack.Screen name="Main" component={TabNavigator} />
                <Stack.Screen name="ProfileDetail" component={ProfileDetailScreen} />
              </Stack.Navigator>
            )}
          </View>
            </NavigationContainer>
      </TabProvider>
    </PaperProvider>
  );
};

export default function App() {
  return (
    <FirebaseProvider>
      <OnboardingProvider>
        <SettingsProvider>
          <TabProvider>
            <AppContent />
          </TabProvider>
        </SettingsProvider>
      </OnboardingProvider>
    </FirebaseProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // Web-specific styles for proper scrolling
    ...(Platform.OS === 'web' && {
      height: '100vh',
      overflow: 'auto',
    }),
  },
});