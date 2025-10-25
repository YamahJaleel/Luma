import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';
import { useOnboarding } from '../components/OnboardingContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useTabContext } from '../components/TabContext';

const CreateAccountScreenCopy = ({ navigation }) => {
  const { setIsOnboarded } = useOnboarding();
  const theme = useTheme();
  const { setTabHidden } = useTabContext();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    pseudonym: '',
    dateOfBirth: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setTabHidden(true);
      return () => setTabHidden(false);
    }, [])
  );

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    // First/Last name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Pseudonym validation
    if (!formData.pseudonym.trim()) {
      newErrors.pseudonym = 'Pseudonym is required';
    } else if (formData.pseudonym.trim().length < 3) {
      newErrors.pseudonym = 'Pseudonym must be at least 3 characters';
    } else if (formData.pseudonym.trim().length > 20) {
      newErrors.pseudonym = 'Pseudonym must be 20 characters or less';
    }

    // Date of birth validation
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else {
      const today = new Date();
      const birthDate = new Date(formData.dateOfBirth);
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 18) {
        newErrors.dateOfBirth = 'You must be at least 18 years old';
      }
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

  const handleCreateAccount = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Save user data to AsyncStorage (in a real app, this would go to your backend)
      const userData = {
        ...formData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        isVerified: false,
      };

      await AsyncStorage.setItem('userData', JSON.stringify(userData));

      // After account creation, navigate to main app
      const fullName = [formData.firstName, formData.lastName].filter(Boolean).join(' ');
      Alert.alert('Account Created!', 'Welcome to Luma! Your account has been created successfully.');
      setIsOnboarded(true);
      setCurrentTab('Home');
      
      // Clear form after successful account creation
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        pseudonym: '',
      });
    } catch (error) {
      console.error('Error creating account:', error);
      Alert.alert('Error', 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderInput = (field, label, placeholder, options = {}) => {
    const {
      secureTextEntry = false,
      keyboardType = 'default',
      autoCapitalize = 'words',
      multiline = false,
      numberOfLines = 1,
    } = options;

    // Add example text for pseudonym field
    const displayLabel = field === 'pseudonym' ? `${label} (e.g., ScarlettX92)` : label;

    return (
      <View style={styles.inputContainer}>
        <Text style={[styles.inputLabel, { color: theme.colors.text }]}>{displayLabel}</Text>
        <View style={[styles.inputWrapper, { borderColor: errors[field] ? theme.colors.error : '#E2E8F0' }]}>
          <TextInput
            style={[styles.textInput, { color: theme.colors.text }]}
            placeholder={placeholder}
            placeholderTextColor={theme.colors.placeholder}
            value={formData[field]}
            onChangeText={(value) => handleInputChange(field, value)}
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            multiline={multiline}
            numberOfLines={numberOfLines}
            autoCorrect={false}
          />
          {field === 'password' && (
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? 'eye-off' : 'eye'}
                size={20}
                color={theme.colors.placeholder}
              />
            </TouchableOpacity>
          )}
          {field === 'confirmPassword' && (
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Ionicons
                name={showConfirmPassword ? 'eye-off' : 'eye'}
                size={20}
                color={theme.colors.placeholder}
              />
            </TouchableOpacity>
          )}
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
          <Text style={styles.headerTitle}>Create Account</Text>
          <TouchableOpacity
            style={styles.skipButton}
            onPress={() => {
              // Skip account creation and go to sign in
              navigation.navigate('SignIn');
            }}
          >
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          {...(Platform.OS === 'web' && {
            style: [styles.scrollView, { height: '100vh', overflow: 'auto' }],
          })}
        >
          {/* Welcome Section */}
          <View style={styles.welcomeSection}>
            <View style={styles.iconContainer}>
              <View style={styles.iconCircle}>
                <Ionicons name="person-add" size={32} color="white" />
              </View>
            </View>
            <Text style={styles.welcomeTitle}>Join Luma</Text>
            <Text style={styles.welcomeSubtitle}>
              Create your account with a pseudonym to maintain privacy in our safety-first community
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            {renderInput('firstName', 'First Name', 'Enter your first name')}
            {renderInput('lastName', 'Last Name', 'Enter your last name')}
            {renderInput('pseudonym', 'Pseudonym', 'Choose a unique username')}
            {renderInput('email', 'Email', 'Enter your email address')}
            {renderInput('dateOfBirth', 'Date of Birth', 'MM/DD/YYYY', { keyboardType: 'default' })}
            {renderInput('password', 'Password', 'Create a strong password', { secureTextEntry: !showPassword })}
            {renderInput('confirmPassword', 'Confirm Password', 'Confirm your password', { secureTextEntry: !showConfirmPassword })}
          </View>

          {/* Terms and Privacy */}
          <View style={styles.termsContainer}>
            <Text style={styles.termsText}>
              By creating an account, you agree to our{' '}
              <Text 
                style={styles.linkText}
                onPress={() => navigation.navigate('TermsOfService')}
              >
                Terms of Service
              </Text>{' '}
              and{' '}
              <Text 
                style={styles.linkText}
                onPress={() => navigation.navigate('PrivacyPolicy')}
              >
                Privacy Policy
              </Text>
            </Text>
          </View>

          {/* Create Account Button */}
          <TouchableOpacity
            style={[styles.createButton, isLoading && styles.createButtonDisabled]}
            onPress={handleCreateAccount}
            disabled={isLoading}
          >
            <LinearGradient
              colors={['#3E5F44', '#4A7C59']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {isLoading ? (
                <Text style={styles.createButtonText}>Creating Account...</Text>
              ) : (
                <>
                  <Text style={styles.createButtonText}>Next</Text>
                  <Ionicons name="arrow-forward" size={20} color="white" style={styles.arrowIcon} />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Sign In Link */}
          <View style={styles.signInContainer}>
            <Text style={styles.signInText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignInCopy')}>
              <Text style={styles.signInLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
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
  inputContainer: { marginBottom: 20 },
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  eyeIcon: {
    padding: 4,
  },
  errorText: {
    fontSize: 14,
    marginTop: 6,
    marginLeft: 4,
  },
  termsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  termsText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  linkText: {
    color: '#3E5F44',
    fontWeight: '600',
  },
  linkTouchable: {
    alignSelf: 'flex-end',
  },
  createButton: {
    borderRadius: 28,
    marginHorizontal: 20,
    marginBottom: 24,
    shadowColor: '#3E5F44',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  createButtonDisabled: {
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
  createButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  arrowIcon: { marginLeft: 12 },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInText: {
    fontSize: 16,
    color: '#6B7280',
  },
  signInLink: {
    fontSize: 16,
    color: '#3E5F44',
    fontWeight: '600',
  },
  skipButton: {
    padding: 8,
  },
  skipButtonText: {
    fontSize: 16,
    color: '#3E5F44',
    fontWeight: '600',
  },
});

export default CreateAccountScreenCopy;


