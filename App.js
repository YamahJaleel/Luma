import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Platform } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { TabProvider } from './components/TabContext';
import { SettingsProvider, useSettings } from './components/SettingsContext';
import * as Notifications from 'expo-notifications';

// Import screens
import OnboardingScreen from './screens/OnboardingScreen';
import CreateAccountScreen from './screens/CreateAccountScreen';
import IconsDemoScreen from './screens/IconsDemoScreen';
import ProfileDetailScreen from './screens/ProfileDetailScreen';
import MainStackNavigator from './components/MainStackNavigator';

const Stack = createStackNavigator();

// Configure notification behavior (foreground)
Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowAlert: true, shouldPlaySound: false, shouldSetBadge: false }),
});

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
  const [isOnboarded, setIsOnboarded] = React.useState(false);

  React.useEffect(() => {
    const ensurePermissions = async () => {
      if (!notificationsEnabled) return;
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        console.log('Notifications permission not granted');
        return;
      }
      // Get expo push token (requires EAS or Expo Go support)
      try {
        const token = await Notifications.getExpoPushTokenAsync();
        console.log('Expo push token', token?.data);
      } catch (e) {
        console.log('Failed to get push token', e);
      }
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.DEFAULT,
        });
      }
    };
    ensurePermissions();
  }, [notificationsEnabled]);

  return (
    <PaperProvider theme={theme}>
      <TabProvider>
        <NavigationContainer>
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
                  initialParams={{ setIsOnboarded }}
                />
                <Stack.Screen 
                  name="CreateAccount" 
                  component={CreateAccountScreen}
                  initialParams={{ setIsOnboarded }}
                />
                <Stack.Screen 
                  name="IconsDemo" 
                  component={IconsDemoScreen}
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
                <Stack.Screen name="Main" component={MainStackNavigator} />
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
    <SettingsProvider>
      <AppContent />
    </SettingsProvider>
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