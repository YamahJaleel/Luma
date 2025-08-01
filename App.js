import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { TabProvider } from './components/TabContext';

// Import screens
import OnboardingScreen from './screens/OnboardingScreen';
import ProfileDetailScreen from './screens/ProfileDetailScreen';
import MainStackNavigator from './components/MainStackNavigator';

const Stack = createStackNavigator();

// Custom theme with Luma's new warm color palette
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#D9A299', // Warm pink
    secondary: '#DCC5B2', // Light warm brown
    background: '#FDF8F3', // Very light cream (unchanged)
    surface: '#FFFFFF',
    text: '#2D3748',
    placeholder: '#A0AEC0',
    accent: '#F0E4D3', // Light warm cream
    success: '#68D391',
    warning: '#F6AD55',
    error: '#FC8181',
  },
};





export default function App() {
  const [isOnboarded, setIsOnboarded] = React.useState(false);

  return (
    <PaperProvider theme={theme}>
      <TabProvider>
        <NavigationContainer>
          <View style={styles.container}>
            <StatusBar style="dark" backgroundColor={theme.colors.background} />
            {!isOnboarded ? (
              <OnboardingScreen onComplete={() => setIsOnboarded(true)} />
            ) : (
              <Stack.Navigator 
                screenOptions={{ 
                  headerShown: false,
                  cardStyleInterpolator: ({ current, layouts }) => {
                    return {
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
                    };
                  },
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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
});