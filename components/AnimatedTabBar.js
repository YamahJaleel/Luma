import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTabContext } from './TabContext';
import { useSettings } from './SettingsContext';
import { useTheme } from 'react-native-paper';

const AnimatedTabBar = () => {
  const navigation = useNavigation();
  const { currentTab, setCurrentTab } = useTabContext();
  const { notificationsEnabled } = useSettings();
  const theme = useTheme();

  const colors = {
    primary: theme.colors.primary,
    placeholder: theme.colors.placeholder,
    surface: theme.colors.surface,
    badge: theme.colors.error || '#EF4444',
    accent: theme.colors.accent,
  };

  const getIconName = (routeName, focused) => {
    switch (routeName) {
      case 'Home':
        return focused ? 'home' : 'home-outline';
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

  const tabs = [
    { name: 'Home', icon: 'home' },
    { name: 'Search', icon: 'search' },
    { name: 'Notifications', icon: 'notifications' },
    { name: 'Profile', icon: 'person' },
  ];

  const hasUnread = true; // Placeholder

  return (
    <View style={[styles.tabBar, { backgroundColor: colors.surface, borderTopColor: colors.surface }]}>
      {tabs.map((tab) => {
        const isFocused = currentTab === tab.name;
        const iconName = getIconName(tab.name, isFocused);

        const onPress = () => {
          if (!isFocused) {
            navigation.navigate(tab.name);
            setCurrentTab(tab.name);
          }
        };

        return (
          <TouchableOpacity key={tab.name} style={styles.tab} onPress={onPress}>
            <View style={[styles.iconContainer, isFocused && { backgroundColor: colors.accent }]}>
              <Ionicons name={iconName} size={24} color={isFocused ? colors.primary : colors.placeholder} />
              {tab.name === 'Notifications' && notificationsEnabled && hasUnread && (
                <View style={[styles.badgeDot, { backgroundColor: colors.badge }]} />
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingBottom: 23,
    paddingTop: 0,
    height: 63,
    marginBottom: 0,
  },
  tab: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  iconContainer: {
    padding: 8,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

export default AnimatedTabBar; 