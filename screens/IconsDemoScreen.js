import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

const IconsDemoScreen = ({ navigation }) => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Icon categories with their icons
  const iconCategories = {
    all: {
      name: 'All Icons',
      icons: [
        // Tree & Nature
        'leaf', 'leaf-outline', 'leaf-sharp', 'leaf-sharp-outline',
        'tree', 'tree-outline', 'seedling', 'seedling-outline',
        'flower', 'flower-outline', 'rose', 'rose-outline',
        'forest', 'forest-outline',
        
        // Common UI
        'heart', 'heart-outline', 'heart-sharp', 'heart-sharp-outline',
        'star', 'star-outline', 'star-sharp', 'star-sharp-outline',
        'thumbs-up', 'thumbs-up-outline', 'thumbs-down', 'thumbs-down-outline',
        'checkmark', 'checkmark-outline', 'checkmark-circle', 'checkmark-circle-outline',
        'close', 'close-outline', 'close-circle', 'close-circle-outline',
        
        // Navigation
        'arrow-back', 'arrow-forward', 'arrow-up', 'arrow-down',
        'chevron-back', 'chevron-forward', 'chevron-up', 'chevron-down',
        'menu', 'menu-outline', 'menu-sharp',
        
        // Communication
        'chatbubble', 'chatbubble-outline', 'chatbubble-ellipses', 'chatbubble-ellipses-outline',
        'mail', 'mail-outline', 'mail-sharp', 'call', 'call-outline', 'call-sharp',
        
        // People
        'person', 'person-outline', 'person-sharp', 'people', 'people-outline', 'people-sharp',
        'person-add', 'person-add-outline', 'person-remove', 'person-remove-outline',
        
        // Actions
        'add', 'add-outline', 'add-circle', 'add-circle-outline',
        'remove', 'remove-outline', 'remove-circle', 'remove-circle-outline',
        'create', 'create-outline', 'trash', 'trash-outline', 'trash-sharp',
        
        // Settings & Tools
        'settings', 'settings-outline', 'settings-sharp',
        'cog', 'cog-outline', 'cog-sharp', 'options', 'options-outline',
        
        // Media
        'camera', 'camera-outline', 'camera-sharp',
        'image', 'image-outline', 'image-sharp',
        'videocam', 'videocam-outline', 'videocam-sharp',
        
        // Social & Community
        'share', 'share-outline', 'share-sharp',
        'bookmark', 'bookmark-outline', 'bookmark-sharp',
        'flag', 'flag-outline', 'flag-sharp',
        
        // Safety & Security
        'shield', 'shield-outline', 'shield-sharp',
        'shield-checkmark', 'shield-checkmark-outline',
        'warning', 'warning-outline', 'warning-sharp',
        'alert', 'alert-outline', 'alert-sharp',
        'alert-circle', 'alert-circle-outline', 'alert-circle-sharp',
        
        // Time & Status
        'time', 'time-outline', 'time-sharp',
        'clock', 'clock-outline', 'clock-sharp',
        'calendar', 'calendar-outline', 'calendar-sharp',
        
        // Location
        'location', 'location-outline', 'location-sharp',
        'map', 'map-outline', 'map-sharp',
        'navigate', 'navigate-outline', 'navigate-sharp',
        
        // Search & Discovery
        'search', 'search-outline', 'search-sharp',
        'filter', 'filter-outline', 'filter-sharp',
        'options', 'options-outline', 'options-sharp',
        
        // Notifications
        'notifications', 'notifications-outline', 'notifications-sharp',
        'notifications-off', 'notifications-off-outline', 'notifications-off-sharp',
        'bell', 'bell-outline', 'bell-sharp',
        
        // Emotions & Reactions
        'happy', 'happy-outline', 'happy-sharp',
        'sad', 'sad-outline', 'sad-sharp',
        'thumbs-up', 'thumbs-up-outline', 'thumbs-up-sharp',
        'thumbs-down', 'thumbs-down-outline', 'thumbs-down-sharp',
        
        // Business & Finance
        'card', 'card-outline', 'card-sharp',
        'wallet', 'wallet-outline', 'wallet-sharp',
        'business', 'business-outline', 'business-sharp',
        
        // Health & Wellness
        'fitness', 'fitness-outline', 'fitness-sharp',
        'medical', 'medical-outline', 'medical-sharp',
        'heart', 'heart-outline', 'heart-sharp',
        
        // Technology
        'phone-portrait', 'phone-portrait-outline', 'phone-portrait-sharp',
        'laptop', 'laptop-outline', 'laptop-sharp',
        'wifi', 'wifi-outline', 'wifi-sharp',
        'bluetooth', 'bluetooth-outline', 'bluetooth-sharp',
        
        // Food & Dining
        'restaurant', 'restaurant-outline', 'restaurant-sharp',
        'cafe', 'cafe-outline', 'cafe-sharp',
        'wine', 'wine-outline', 'wine-sharp',
        
        // Transportation
        'car', 'car-outline', 'car-sharp',
        'bicycle', 'bicycle-outline', 'bicycle-sharp',
        'airplane', 'airplane-outline', 'airplane-sharp',
        'boat', 'boat-outline', 'boat-sharp',
        
        // Home & Living
        'home', 'home-outline', 'home-sharp',
        'bed', 'bed-outline', 'bed-sharp',
        'kitchen', 'kitchen-outline', 'kitchen-sharp',
        
        // Education & Learning
        'school', 'school-outline', 'school-sharp',
        'library', 'library-outline', 'library-sharp',
        'book', 'book-outline', 'book-sharp',
        
        // Entertainment
        'game-controller', 'game-controller-outline', 'game-controller-sharp',
        'musical-notes', 'musical-notes-outline', 'musical-notes-sharp',
        'film', 'film-outline', 'film-sharp',
        
        // Sports & Recreation
        'football', 'football-outline', 'football-sharp',
        'basketball', 'basketball-outline', 'basketball-sharp',
        'tennisball', 'tennisball-outline', 'tennisball-sharp',
        
        // Weather & Nature
        'sunny', 'sunny-outline', 'sunny-sharp',
        'moon', 'moon-outline', 'moon-sharp',
        'rainy', 'rainy-outline', 'rainy-sharp',
        'snow', 'snow-outline', 'snow-sharp',
        'thunderstorm', 'thunderstorm-outline', 'thunderstorm-sharp',
        
        // Animals
        'paw', 'paw-outline', 'paw-sharp',
        'fish', 'fish-outline', 'fish-sharp',
        'bird', 'bird-outline', 'bird-sharp',
        
        // Objects & Tools
        'hammer', 'hammer-outline', 'hammer-sharp',
        'wrench', 'wrench-outline', 'wrench-sharp',
        'construct', 'construct-outline', 'construct-sharp',
        'build', 'build-outline', 'build-sharp',
        
        // Symbols & Shapes
        'diamond', 'diamond-outline', 'diamond-sharp',
        'triangle', 'triangle-outline', 'triangle-sharp',
        'square', 'square-outline', 'square-sharp',
        'circle', 'circle-outline', 'circle-sharp',
        
        // Special & Unique
        'flash', 'flash-outline', 'flash-sharp',
        'thunder', 'thunder-outline', 'thunder-sharp',
        'rocket', 'rocket-outline', 'rocket-sharp',
        'planet', 'planet-outline', 'planet-sharp',
        'infinite', 'infinite-outline', 'infinite-sharp',
        'sparkles', 'sparkles-outline', 'sparkles-sharp',
      ]
    },
    trees: {
      name: 'Trees & Nature',
      icons: [
        'leaf', 'leaf-outline', 'leaf-sharp', 'leaf-sharp-outline',
        'tree', 'tree-outline', 'seedling', 'seedling-outline',
        'flower', 'flower-outline', 'rose', 'rose-outline',
        'forest', 'forest-outline', 'paw', 'paw-outline',
        'fish', 'fish-outline', 'bird', 'bird-outline',
        'sunny', 'sunny-outline', 'moon', 'moon-outline',
        'rainy', 'rainy-outline', 'snow', 'snow-outline',
        'thunderstorm', 'thunderstorm-outline',
      ]
    },
    ui: {
      name: 'UI Elements',
      icons: [
        'heart', 'heart-outline', 'star', 'star-outline',
        'thumbs-up', 'thumbs-up-outline', 'thumbs-down', 'thumbs-down-outline',
        'checkmark', 'checkmark-outline', 'checkmark-circle', 'checkmark-circle-outline',
        'close', 'close-outline', 'close-circle', 'close-circle-outline',
        'add', 'add-outline', 'add-circle', 'add-circle-outline',
        'remove', 'remove-outline', 'remove-circle', 'remove-circle-outline',
      ]
    },
    navigation: {
      name: 'Navigation',
      icons: [
        'arrow-back', 'arrow-forward', 'arrow-up', 'arrow-down',
        'chevron-back', 'chevron-forward', 'chevron-up', 'chevron-down',
        'menu', 'menu-outline', 'menu-sharp',
        'home', 'home-outline', 'home-sharp',
      ]
    },
    people: {
      name: 'People & Social',
      icons: [
        'person', 'person-outline', 'person-sharp',
        'people', 'people-outline', 'people-sharp',
        'person-add', 'person-add-outline', 'person-remove', 'person-remove-outline',
        'chatbubble', 'chatbubble-outline', 'chatbubble-ellipses', 'chatbubble-ellipses-outline',
        'share', 'share-outline', 'share-sharp',
        'bookmark', 'bookmark-outline', 'bookmark-sharp',
      ]
    },
    safety: {
      name: 'Safety & Security',
      icons: [
        'shield', 'shield-outline', 'shield-sharp',
        'shield-checkmark', 'shield-checkmark-outline',
        'warning', 'warning-outline', 'warning-sharp',
        'alert', 'alert-outline', 'alert-sharp',
        'alert-circle', 'alert-circle-outline', 'alert-circle-sharp',
        'flag', 'flag-outline', 'flag-sharp',
        'checkmark-circle', 'checkmark-circle-outline',
      ]
    }
  };

  const filteredIcons = iconCategories[selectedCategory]?.icons.filter(icon =>
    icon.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const renderIcon = ({ item }) => (
    <TouchableOpacity 
      style={[styles.iconItem, { backgroundColor: theme.colors.surface }]}
      onPress={() => {
        // Copy icon name to clipboard or show details
        console.log('Icon selected:', item);
      }}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${theme.colors.primary}15` }]}>
        <Ionicons name={item} size={24} color={theme.colors.primary} />
      </View>
      <Text style={[styles.iconName, { color: theme.colors.text }]} numberOfLines={2}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  const renderCategoryButton = (categoryKey, categoryData) => (
    <TouchableOpacity
      key={categoryKey}
      style={[
        styles.categoryButton,
        selectedCategory === categoryKey && { backgroundColor: theme.colors.primary }
      ]}
      onPress={() => setSelectedCategory(categoryKey)}
    >
      <Text style={[
        styles.categoryButtonText,
        selectedCategory === categoryKey && { color: 'white' }
      ]}>
        {categoryData.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Icons Demo</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: theme.colors.surface }]}>
        <Ionicons name="search" size={20} color={theme.colors.placeholder} />
        <TextInput
          style={[styles.searchInput, { color: theme.colors.text }]}
          placeholder="Search icons..."
          placeholderTextColor={theme.colors.placeholder}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Category Buttons */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {Object.entries(iconCategories).map(([key, data]) => 
          renderCategoryButton(key, data)
        )}
      </ScrollView>

      {/* Icons Grid */}
      <FlatList
        data={filteredIcons}
        renderItem={renderIcon}
        keyExtractor={(item) => item}
        numColumns={3}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.iconsGrid}
        ListHeaderComponent={
          <Text style={[styles.resultsCount, { color: theme.colors.text }]}>
            {filteredIcons.length} icons found
          </Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  placeholder: { width: 40 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  categoriesContent: {
    paddingHorizontal: 20,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#F3F4F6',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  resultsCount: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  iconsGrid: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  iconItem: {
    flex: 1,
    margin: 4,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  iconName: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 16,
  },
});

export default IconsDemoScreen; 