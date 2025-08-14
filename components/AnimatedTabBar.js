import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Pressable, Text } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTabContext } from './TabContext';
import { useSettings } from './SettingsContext';
import { useTheme } from 'react-native-paper';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, interpolate } from 'react-native-reanimated';

const AnimatedTabBar = () => {
  const navigation = useNavigation();
  const { currentTab, setCurrentTab } = useTabContext();
  const { notificationsEnabled } = useSettings();
  const theme = useTheme();

  // Colors updated per request
  const BAR_BG = '#FFFFFF';
  const ACTIVE_BG = theme.colors.primary;
  const ICON_ACTIVE = '#FFFFFF';
  const ICON_INACTIVE = theme.dark ? '#9AA0A6' : '#9CA3AF';

  const tabs = [
    { name: 'Home', label: 'Home', icon: 'home' },
    { name: 'Messages', label: 'Messages', icon: 'chatbubble' },
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

  // inner horizontal padding inside wrapper (paddingHorizontal: 6)
  const WRAP_PAD_X = 6;
  const ACTIVE_INSET_X = 0; // activeBg style left offset
  const effectiveLeft = WRAP_PAD_X + ACTIVE_INSET_X;
  const NUDGE_RIGHT = 6; // small rightward tweak

  // store measured centers per tab (relative to wrapper content)
  const centersRef = useRef([]);
  const setCenter = (index, x, width) => {
    const centerX = x + width / 2; // relative to wrapper content (after padding)
    centersRef.current[index] = centerX;
  };

  const indicatorWidth = useMemo(() => {
    // keep a consistent visual bubble size across tabs
    const w = buttonWidth ? Math.min(buttonWidth - 12, 56) : 56;
    return Math.max(44, w);
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
      xPos.value = withSpring(computeX(idx), { duration: 450 });
    }
  }, [currentTab, buttonWidth, indicatorWidth]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: xPos.value }],
  }));

  const hasUnread = true; // Placeholder

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

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      <View style={[styles.wrapper, { backgroundColor: BAR_BG }]} onLayout={onBarLayout}>
        {dims.width > 0 && (
          <Animated.View
            style={[
              styles.activeBg,
              { width: indicatorWidth, height: Math.max(44, dims.height - 15), backgroundColor: ACTIVE_BG },
              indicatorStyle,
            ]}
          />
        )}

        {tabs.map((tab, index) => {
          const isFocused = currentTab === tab.name;

          const onPress = () => {
            if (buttonWidth) {
              xPos.value = withSpring(computeX(index), { duration: 450 });
            }
            if (tab.name === 'Home') {
              navigation.popToTop();
              setCurrentTab('Home');
              return;
            }
            if (!isFocused) {
              navigation.navigate(tab.name);
              setCurrentTab(tab.name);
            }
          };

          // Animations per button
          const scale = useSharedValue(isFocused ? 1 : 0);
          useEffect(() => {
            scale.value = withSpring(isFocused ? 1 : 0, { duration: 300 });
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

          const iconName = getIconName(tab.name, isFocused);
          const tint = isFocused ? ICON_ACTIVE : ICON_INACTIVE;

          return (
            <Pressable
              key={tab.name}
              onPress={onPress}
              onLayout={(e) => setCenter(index, e.nativeEvent.layout.x, e.nativeEvent.layout.width)}
              style={styles.item}
              android_ripple={{ foreground: true }}
            >
              <Animated.View style={[styles.iconWrap, iconWrapStyle]}>
                <Ionicons name={iconName} size={22} color={tint} />
                {tab.name === 'Notifications' && notificationsEnabled && hasUnread && (
                  <View style={[styles.badgeDot]} />
                )}
              </Animated.View>
              <Animated.Text style={[styles.label, labelStyle]}>{tab.label}</Animated.Text>
            </Pressable>
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
    bottom: 28,
    borderRadius: 32,
    paddingVertical: 10,
    paddingHorizontal: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000000',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  activeBg: {
    position: 'absolute',
    left: 0,
    borderRadius: 28,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: 6,
    borderRadius: 28,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 11,
    color: '#6B7280',
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