import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTabContext } from './TabContext';

const AnimatedTabBar = () => {
  const navigation = useNavigation();
  const { currentTab, setCurrentTab } = useTabContext();

  const colors = {
    primary: '#3E5F44', // Deep forest green
    placeholder: '#A0AEC0',
    surface: '#FFFFFF',
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

  return (
    <View style={styles.tabBar}>
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
          <TouchableOpacity
            key={tab.name}
            style={styles.tab}
            onPress={onPress}
          >
            <View style={[
              styles.iconContainer,
              isFocused && styles.activeIconContainer
            ]}>
              <Ionicons
                name={iconName}
                size={24}
                color={isFocused ? colors.primary : colors.placeholder}
              />
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
    backgroundColor: '#FFFFFF',
    borderTopColor: '#FFFFFF',
    borderTopWidth: 1,
    paddingBottom: 23,
    paddingTop: 0,
    height: 63,
    marginBottom: 0,
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    padding: 8,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeIconContainer: {
    backgroundColor: '#F0E4D3',
  },
});

export default AnimatedTabBar; 