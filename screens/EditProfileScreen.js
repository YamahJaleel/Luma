import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { useTabContext } from '../components/TabContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EditProfileScreen = ({ navigation }) => {
  const theme = useTheme();
  const { setTabHidden } = useTabContext();
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setTabHidden(true);
      return () => setTabHidden(false);
    }, [])
  );

  // Load current user data on mount
  React.useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const parsed = JSON.parse(userData);
        setFormData({
          username: parsed.pseudonym || '',
          firstName: parsed.firstName || '',
          lastName: parsed.lastName || '',
          email: parsed.email || '',
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.trim().length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (formData.username.trim().length > 20) {
      newErrors.username = 'Username must be 20 characters or less';
    }

    // First/Last name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update user data in AsyncStorage
      const existingUserData = await AsyncStorage.getItem('userData');
      if (existingUserData) {
        const userData = JSON.parse(existingUserData);
        const updatedUserData = {
          ...userData,
          pseudonym: formData.username.trim(),
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
        };

        await AsyncStorage.setItem('userData', JSON.stringify(updatedUserData));
        Alert.alert('Success', 'Profile updated successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Error', 'No user data found. Please try again.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderInput = (field, label, placeholder, options = {}) => {
    const {
      keyboardType = 'default',
      autoCapitalize = 'words',
    } = options;

    return (
      <View style={styles.inputContainer}>
        <Text style={[styles.inputLabel, { color: theme.colors.text }]}>{label}</Text>
        <View style={[styles.inputWrapper, { borderColor: errors[field] ? theme.colors.error : '#E2E8F0' }]}>
          <TextInput
            style={[styles.textInput, { color: theme.colors.text }]}
            placeholder={placeholder}
            placeholderTextColor={theme.colors.placeholder}
            value={formData[field]}
            onChangeText={(value) => handleInputChange(field, value)}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            autoCorrect={false}
          />
        </View>
        {errors[field] && (
          <Text style={[styles.errorText, { color: theme.colors.error }]}>{errors[field]}</Text>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#FAF6F0', '#F5F1EB']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#3E5F44" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Welcome Section */}
          <View style={styles.welcomeSection}>
            <View style={styles.iconContainer}>
              <View style={styles.iconCircle}>
                <Ionicons name="person" size={32} color="white" />
              </View>
            </View>
            <Text style={styles.welcomeTitle}>Update Your Profile</Text>
            <Text style={styles.welcomeSubtitle}>
              Keep your information up to date
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            {renderInput('username', 'Username', 'Enter your username')}
            {renderInput('firstName', 'First Name', 'Enter your first name')}
            {renderInput('lastName', 'Last Name', 'Enter your last name')}
            {renderInput('email', 'Email', 'Enter your email address', { keyboardType: 'email-address', autoCapitalize: 'none' })}
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isLoading}
          >
            <LinearGradient
              colors={['#3E5F44', '#4A7C59']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {isLoading ? (
                <Text style={styles.saveButtonText}>Saving...</Text>
              ) : (
                <>
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                  <Ionicons name="checkmark" size={20} color="white" style={styles.checkIcon} />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3E5F44',
  },
  placeholder: { width: 40 },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  welcomeSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  iconContainer: { marginBottom: 16 },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#3E5F44',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#4A7C59',
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3E5F44',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  formContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#374151',
  },
  inputWrapper: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: 'white',
  },
  textInput: {
    fontSize: 16,
    color: '#1F2937',
  },
  errorText: {
    fontSize: 14,
    marginTop: 6,
    marginLeft: 4,
  },
  saveButton: {
    borderRadius: 28,
    marginHorizontal: 20,
    marginBottom: 24,
    shadowColor: '#3E5F44',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  buttonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  checkIcon: { marginLeft: 12 },
});

export default EditProfileScreen;
