import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Animated,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const ExpandingSearchBox = ({ 
  onSearch, 
  placeholder = "", 
  searchIconColor = "#D9A299",
  backgroundColor = "white",
  borderRadius = 12,
  fontSize = 16,
  animationSpeed = 300 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchText, setSearchText] = useState('');
  const animatedWidth = useRef(new Animated.Value(0)).current;
  const inputRef = useRef(null);

  const expandSearch = () => {
    setIsExpanded(true);
    Animated.timing(animatedWidth, {
      toValue: 1,
      duration: animationSpeed,
      useNativeDriver: false,
    }).start(() => {
      inputRef.current?.focus();
    });
  };

  const collapseSearch = () => {
    if (searchText.trim() === '') {
      Animated.timing(animatedWidth, {
        toValue: 0,
        duration: animationSpeed,
        useNativeDriver: false,
      }).start(() => {
        setIsExpanded(false);
      });
    }
  };

  const handleSearch = (text) => {
    setSearchText(text);
    if (onSearch) {
      onSearch(text);
    }
  };

  const handleClear = () => {
    setSearchText('');
    if (onSearch) {
      onSearch('');
    }
    collapseSearch();
  };

  return (
    <View style={styles.container}>
      {isExpanded ? (
        <Animated.View
          style={[
            styles.searchContainer,
            {
              width: animatedWidth.interpolate({
                inputRange: [0, 1],
                outputRange: [48, width - 40], // 48 is the button width, 40 is total padding
              }),
              backgroundColor,
              borderRadius,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.searchIcon}
            onPress={expandSearch}
          >
            <Ionicons name="search" size={20} color={searchIconColor} />
          </TouchableOpacity>
          
          <TextInput
            ref={inputRef}
            style={[
              styles.textInput,
              {
                fontSize,
                color: '#2D3748',
              },
            ]}
            placeholder={placeholder}
            placeholderTextColor="#A0AEC0"
            value={searchText}
            onChangeText={handleSearch}
            onBlur={collapseSearch}
            autoFocus={true}
          />
          
          {searchText.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClear}
            >
              <Ionicons name="close-circle" size={20} color="#A0AEC0" />
            </TouchableOpacity>
          )}
        </Animated.View>
      ) : (
        <TouchableOpacity
          style={[
            styles.searchButton,
            {
              backgroundColor,
              borderRadius,
            },
          ]}
          onPress={expandSearch}
        >
          <Ionicons name="search" size={24} color={searchIconColor} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    paddingVertical: 0,
  },
  clearButton: {
    marginLeft: 8,
  },
});

export default ExpandingSearchBox; 