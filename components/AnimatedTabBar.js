import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Pressable, Text } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import { useTabContext } from './TabContext';
import { useSettings } from './SettingsContext';
import { useTheme } from 'react-native-paper';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, interpolate } from 'react-native-reanimated';

const AnimatedTabBar = () => {
  const navigation = useNavigation();
  const { currentTab, setCurrentTab, tabHidden, hasUnreadNotifications } = useTabContext();
  const { notificationsEnabled } = useSettings();
  const theme = useTheme();

  // Determine if we should hide (checks nested routes too)
  const shouldHide = useNavigationState((state) => {
    const contains = (s) => {
      if (!s || !s.routes) return false;
      for (let i = 0; i < s.routes.length; i++) {
        const route = s.routes[i];
        if (route?.name === 'PostDetail' || route?.name === 'MessageThread' || route?.name === 'ProfileDetail') return true;
        if (route?.state && contains(route.state)) return true;
      }
      return false;
    };
    return contains(state);
  });

  // Colors updated per request
  const BAR_BG = '#FFFFFF';
  const ACTIVE_BG = theme.colors.primary;
  const ICON_ACTIVE = '#FFFFFF';
  const ICON_INACTIVE = theme.dark ? '#9AA0A6' : '#9CA3AF';

  const tabs = [
    { name: 'Home', label: 'Home', icon: 'home' },
    { name: 'Messages', label: 'Message', icon: 'chatbubble' },
    { name: 'Search', label: 'Search', icon: 'search' },
    { name: 'Notifications', label: 'Alerts', icon: 'notifications' },
    { name: 'Profile', label: 'Profile', icon: 'person' },
  ];

  const [dims, setDims] = useState({ width: 0, height: 0 });
  const buttonWidth = useMemo(
    () => (tabs.length && dims.width ? dims.width / tabs.length : 0),
    [dims.width]
  );

  const xPos = useSharedValue(0);

  const onBarLayout = useCallback((e) => {
    const { width, height } = e.nativeEvent.layout;
    setDims({ width, height });
  }, []);

  // inner horizontal padding inside wrapper (paddingHorizontal: 4)
  const WRAP_PAD_X = 4;
  const ACTIVE_INSET_X = 0; // activeBg style left offset
  const effectiveLeft = WRAP_PAD_X + ACTIVE_INSET_X;
  const NUDGE_RIGHT = 3.5; // fine-tune right by 0.5px

  // store measured centers per tab (relative to wrapper content)
  const centersRef = useRef([]);
  const setCenter = (index, x, width) => {
    const centerX = x + width / 2; // relative to wrapper content (after padding)
    centersRef.current[index] = centerX;
  };

  const indicatorWidth = useMemo(() => {
    // slightly larger bubble
    const w = buttonWidth ? Math.min(buttonWidth - 6, 58) : 58;
    return Math.max(40, w);
  }, [buttonWidth]);

  const computeX = (index) => {
    const fallbackCenter = buttonWidth * index + buttonWidth / 2;
    const centerX = centersRef.current[index] ?? fallbackCenter;
    // translate so that indicator center aligns to centerX
    return centerX - effectiveLeft - indicatorWidth / 2 + NUDGE_RIGHT;
  };

  // Sync indicator to currentTab changes as well
  useEffect(() => {
    const idx = Math.max(0, tabs.findIndex((t) => t.name === currentTab));
    if (buttonWidth) {
      xPos.value = withSpring(computeX(idx), { duration: 150, dampingRatio: 0.8, stiffness: 300 });
    }
  }, [currentTab, buttonWidth, indicatorWidth]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: xPos.value }],
  }));

  const hasUnread = false; // Disable red dot on alerts

  const getIconName = (routeName, focused) => {
    switch (routeName) {
      case 'Home':
        return focused ? 'home' : 'home-outline';
      case 'Messages':
        return focused ? 'chatbubble' : 'chatbubble-outline';
      case 'Search':
        return focused ? 'search' : 'search-outline';
      case 'Notifications':
        return focused ? 'notifications' : 'notifications-outline';
      case 'Profile':
        return focused ? 'person' : 'person-outline';
      default:
        return 'home-outline';
    }
  };

  // Now safe to early-return (after all hooks are declared)
  if (shouldHide || tabHidden) return null;

  const TabItem = ({ isFocused, iconName, tint, label, onPress, onLayout, showBadge }) => {
    const scale = useSharedValue(isFocused ? 1 : 0);
    useEffect(() => {
      scale.value = withSpring(isFocused ? 1 : 0, { duration: 120, dampingRatio: 0.9, stiffness: 400 });
    }, [isFocused]);

    const iconWrapStyle = useAnimatedStyle(() => {
      const s = interpolate(scale.value, [0, 1], [1, 1.1]);
      const top = interpolate(scale.value, [0, 1], [0, 4]);
      return { transform: [{ scale: s }], top };
    });
    const labelStyle = useAnimatedStyle(() => {
      const opacity = interpolate(scale.value, [0, 1], [1, 0.85]);
      return { opacity };
    });

    return (
      <Pressable onPress={onPress} onLayout={onLayout} style={styles.item} android_ripple={{ foreground: true }}>
        <Animated.View style={[styles.iconWrap, iconWrapStyle]}>
          <Ionicons name={iconName} size={21} color={tint} />
          {showBadge && <View style={[styles.badgeDot]} />}
        </Animated.View>
        <Animated.Text style={[styles.label, labelStyle, { color: isFocused ? '#FFFFFF' : '#6B7280' }]}>{label}</Animated.Text>
      </Pressable>
    );
  };

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      <View style={[styles.wrapper, { backgroundColor: BAR_BG }]} onLayout={onBarLayout}>
        {dims.width > 0 && (
          <Animated.View
            style={[
              styles.activeBg,
              { width: indicatorWidth, height: Math.max(46, dims.height - 12), backgroundColor: ACTIVE_BG },
              indicatorStyle,
            ]}
          />
        )}

        {tabs.map((tab, index) => {
          const isFocused = currentTab === tab.name;

          const onPress = () => {
            if (buttonWidth) {
              xPos.value = withSpring(computeX(index), { duration: 120, dampingRatio: 0.7, stiffness: 400 });
            }
            if (!isFocused) {
              navigation.navigate(tab.name);
              setCurrentTab(tab.name);
            }
          };

          const iconName = getIconName(tab.name, isFocused);
          const tint = isFocused ? ICON_ACTIVE : ICON_INACTIVE;

          return (
            <TabItem
              key={tab.name}
              isFocused={isFocused}
              iconName={iconName}
              tint={tint}
              label={tab.label}
              onPress={onPress}
              onLayout={(e) => setCenter(index, e.nativeEvent.layout.x, e.nativeEvent.layout.width)}
              showBadge={false}
            />
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 22,
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  activeBg: {
    position: 'absolute',
    left: 0,
    borderRadius: 20,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: 4,
    borderRadius: 20,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
  },
  badgeDot: {
    position: 'absolute',
    top: 0,
    right: -2,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
  },
});

export default AnimatedTabBar; 