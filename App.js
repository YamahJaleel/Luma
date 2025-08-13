import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { TabProvider } from './components/TabContext';
import { SettingsProvider, useSettings } from './components/SettingsContext';

// Import screens
import OnboardingScreen from './screens/OnboardingScreen';
import ProfileDetailScreen from './screens/ProfileDetailScreen';
import MainStackNavigator from './components/MainStackNavigator';

const Stack = createStackNavigator();

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
  },
};

const AppContent = () => {
  const { darkModeEnabled } = useSettings();
  const theme = darkModeEnabled ? darkTheme : lightTheme;
  const [isOnboarded, setIsOnboarded] = React.useState(false);

  return (
    <PaperProvider theme={theme}>
      <TabProvider>
        <NavigationContainer>
          <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
            <StatusBar style={darkModeEnabled ? 'light' : 'dark'} backgroundColor={theme.colors.background} />
            {!isOnboarded ? (
              <OnboardingScreen onComplete={() => setIsOnboarded(true)} />
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
  },
});