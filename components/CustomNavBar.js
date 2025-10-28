import React, { useMemo, useCallback } from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Platform } from 'react-native';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import Feather from '@expo/vector-icons/Feather';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Ionicons from '@expo/vector-icons/Ionicons';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import { useTabContext } from './TabContext';
import { useTheme } from 'react-native-paper';
import { useSettings } from './SettingsContext';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedText = Animated.createAnimatedComponent(Text);

const LIGHT_ICON_COLOR = '#2c5f34';
const DARK_ICON_COLOR = '#FFFFFF';

const TABS = [
  { name: 'Home', label: 'Home', icon: 'home' },
  { name: 'Messages', label: 'Messages', icon: 'chatbubble-outline' },
  { name: 'Search', label: 'Search', icon: 'search' },
  { name: 'Notifications', label: 'Alerts', icon: 'bell' },
  { name: 'Profile', label: 'Profile', icon: 'circle-user' },
];

// Move static styles outside component for better performance
const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '77%',
    alignSelf: 'center',
    bottom: 40,
    borderRadius: 40,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    borderWidth: 1,
    ...(Platform.OS === 'web' && {
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    }),
  },
  tabItem: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 36,
    paddingHorizontal: 10,
    borderRadius: 30,
    marginHorizontal: 2,
  },
  text: {
    marginLeft: 6,
    fontWeight: '500',
    fontSize: 14,
  },
});

// Memoized icon component for better performance
const TabIcon = React.memo(({ iconType, iconName, color }) => {
  switch (iconType) {
    case 'Feather':
      return <Feather name={iconName} size={22} color={color} />;
    case 'FontAwesome6':
      return <FontAwesome6 name={iconName} size={22} color={color} />;
    case 'Ionicons':
      return <Ionicons name={iconName} size={22} color={color} />;
    default:
      return <Feather name="home" size={22} color={color} />;
  }
});

const getIconByRouteName = (routeName, color) => {
  switch (routeName) {
    case 'Home':
      return <Feather name="home" size={22} color={color} />;
    case 'Search':
      return <Feather name="search" size={22} color={color} />;
    case 'Messages':
      return <Ionicons name="chatbubble-outline" size={22} color={color} />;
    case 'Notifications':
      return <Feather name="bell" size={22} color={color} />;
    case 'Profile':
      return <FontAwesome6 name="circle-user" size={22} color={color} />;
    default:
      return <Feather name="home" size={22} color={color} />;
  }
};

const CustomNavBar = () => {
  const navigation = useNavigation();
  const { currentTab, setCurrentTab, tabHidden } = useTabContext();
  const { darkModeEnabled } = useSettings();

  // Memoize computed values
  const backgroundColor = useMemo(() => 
    darkModeEnabled ? 'rgba(31, 41, 55, 0.7)' : 'rgba(255, 255, 255, 0.7)',
    [darkModeEnabled]
  );
  const iconColor = useMemo(() => 
    darkModeEnabled ? DARK_ICON_COLOR : LIGHT_ICON_COLOR,
    [darkModeEnabled]
  );
  const borderColor = useMemo(() =>
    darkModeEnabled ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.3)',
    [darkModeEnabled]
  );

  // Optimized route hiding check
  const shouldHide = useNavigationState((state) => {
    if (!state?.routes || state.index === undefined) return false;
    const currentRoute = state.routes[state.index];
    const hideableRoutes = ['PostDetail', 'MessageThread', 'ProfileDetail', 'SignInCopy', 'CreateAccountCopy', 'Congrats', 'CreatePost', 'CreateProfile'];
    return hideableRoutes.includes(currentRoute?.name);
  });

  // Create navigation handlers with useCallback for performance
  const handlePress = useCallback((routeName, isFocused) => {
    if (!isFocused) {
      // Navigate to screen within the Main stack using nested navigation
      navigation.navigate('Main', { screen: routeName });
      setCurrentTab(routeName);
    }
  }, [navigation, setCurrentTab]);

  if (shouldHide || tabHidden) return null;

  return (
    <View style={[styles.container, { backgroundColor, borderColor }]}>
      {TABS.map((route) => {
        const isFocused = currentTab === route.name;
        
        return (
          <AnimatedTouchableOpacity
            layout={LinearTransition.springify().mass(0.5)}
            key={route.name}
            onPress={() => handlePress(route.name, isFocused)}
            style={[
              styles.tabItem,
              { backgroundColor: isFocused ? (darkModeEnabled ? '#374151' : '#F3F4F6') : 'transparent' },
            ]}
          >
            {getIconByRouteName(route.name, iconColor)}
            {isFocused && (
              <AnimatedText
                entering={FadeIn.duration(200)}
                exiting={FadeOut.duration(200)}
                style={[styles.text, { color: iconColor }]}
              >
                {route.label}
              </AnimatedText>
            )}
          </AnimatedTouchableOpacity>
        );
      })}
    </View>
  );
};

export default CustomNavBar;


