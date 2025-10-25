import React, { useMemo } from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import Feather from '@expo/vector-icons/Feather';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Ionicons from '@expo/vector-icons/Ionicons';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import { useTabContext } from './TabContext';
import { useTheme } from 'react-native-paper';
import { useSettings } from './SettingsContext';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const LIGHT_BACKGROUND = '#FFFFFF';
const DARK_BACKGROUND = '#1F2937';
const LIGHT_ICON_COLOR = '#2c5f34';
const DARK_ICON_COLOR = '#FFFFFF';

const TABS = [
  { name: 'Home', label: 'Home' },
  { name: 'Messages', label: 'Messages' },
  { name: 'Search', label: 'Search' },
  { name: 'Notifications', label: 'Alerts' },
  { name: 'Profile', label: 'Profile' },
];

const CustomNavBar = () => {
  const navigation = useNavigation();
  const { currentTab, setCurrentTab, tabHidden } = useTabContext();
  const theme = useTheme();
  const { darkModeEnabled } = useSettings();

  const backgroundColor = darkModeEnabled ? DARK_BACKGROUND : LIGHT_BACKGROUND;
  const iconColor = darkModeEnabled ? DARK_ICON_COLOR : LIGHT_ICON_COLOR;

  // Determine if bar should hide on certain routes (detail screens, auth, etc.)
  const shouldHide = useNavigationState((state) => {
    const contains = (s) => {
      if (!s || !s.routes) return false;
      for (let i = 0; i < s.routes.length; i++) {
        const route = s.routes[i];
        if (
          route?.name === 'PostDetail' ||
          route?.name === 'MessageThread' ||
          route?.name === 'ProfileDetail' ||
          route?.name === 'SignInCopy' ||
          route?.name === 'CreateAccountCopy' ||
          route?.name === 'Congrats' ||
          route?.name === 'CreatePost' ||
          route?.name === 'CreateProfile'
        ) return true;
        if (route?.state && contains(route.state)) return true;
      }
      return false;
    };
    return contains(state);
  });

  const routes = useMemo(() => TABS, []);

  if (shouldHide || tabHidden) return null;

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

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {routes.map((route) => {
        const isFocused = currentTab === route.name;
        const onPress = () => {
          if (!isFocused) {
            navigation.navigate(route.name);
            setCurrentTab(route.name);
          }
        };

        return (
          <AnimatedTouchableOpacity
            layout={LinearTransition.springify().mass(0.5)}
            key={route.name}
            onPress={onPress}
            style={[
              styles.tabItem,
              { backgroundColor: isFocused ? (darkModeEnabled ? '#374151' : '#F3F4F6') : 'transparent' },
            ]}
          >
            {getIconByRouteName(route.name, iconColor)}
            {isFocused && (
              <Animated.Text
                entering={FadeIn.duration(200)}
                exiting={FadeOut.duration(200)}
                style={[styles.text, { color: iconColor }]}
              >
                {route.label}
              </Animated.Text>
            )}
          </AnimatedTouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '88%',
    alignSelf: 'center',
    bottom: 40,
    borderRadius: 40,
    paddingHorizontal: 16,
    paddingVertical: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
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

export default CustomNavBar;


