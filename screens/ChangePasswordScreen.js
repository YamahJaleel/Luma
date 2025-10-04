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
import { useTabContext } from '../components/TabContext';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ChangePasswordScreen = ({ navigation }) => {
  const theme = useTheme();
  const { setTabHidden } = useTabContext();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Hide tab bar when screen is focused
  useFocusEffect(
    useCallback(() => {
      setTabHidden(true);
      return () => setTabHidden(false);
    }, [setTabHidden])
  );

  const validateForm = () => {
    const newErrors = {};

    // Old password validation
    if (!formData.oldPassword) {
      newErrors.oldPassword = 'Current password is required';
    }

    // New password validation
    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)) {
      newErrors.newPassword = 'Password must contain uppercase, lowercase, and number';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Check if new password is different from old password
    if (formData.oldPassword && formData.newPassword && formData.oldPassword === formData.newPassword) {
      newErrors.newPassword = 'New password must be different from current password';
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

  const handleChangePassword = async () => {
    if (!user?.uid) {
      Alert.alert('Error', 'You must be logged in to change your password');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Use Firebase Auth to change password
      await authService.changePassword(formData.oldPassword, formData.newPassword);
      
      Alert.alert('Success', 'Password changed successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error changing password:', error);
      
      let errorMessage = 'Failed to change password. Please try again.';
      
      if (error.code === 'auth/wrong-password') {
        errorMessage = 'Current password is incorrect.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'New password is too weak. Please choose a stronger password.';
      } else if (error.code === 'auth/requires-recent-login') {
        errorMessage = 'Please sign out and sign back in before changing your password.';
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const renderInput = (field, label, placeholder, options = {}) => {
    const {
      secureTextEntry = false,
      keyboardType = 'default',
      autoCapitalize = 'none',
    } = options;

    return (
      <View style={styles.inputContainer}>
        <Text style={[styles.inputLabel, { color: theme.colors.text }]}>{label}</Text>
        <View style={[styles.inputWrapper, { 
          borderColor: errors[field] ? theme.colors.error : '#E2E8F0',
          backgroundColor: theme.colors.surface 
        }]}>
          <TextInput
            style={[styles.textInput, { color: theme.colors.text }]}
            placeholder={placeholder}
            placeholderTextColor={theme.colors.placeholder}
            value={formData[field]}
            onChangeText={(value) => handleInputChange(field, value)}
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            autoCorrect={false}
          />
          {field === 'oldPassword' && (
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowOldPassword(!showOldPassword)}
            >
              <Ionicons
                name={showOldPassword ? 'eye-off' : 'eye'}
                size={20}
                color={theme.colors.placeholder}
              />
            </TouchableOpacity>
          )}
          {field === 'newPassword' && (
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowNewPassword(!showNewPassword)}
            >
              <Ionicons
                name={showNewPassword ? 'eye-off' : 'eye'}
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
        colors={theme.dark ? ['#1F2937', '#111827'] : ['#FAF6F0', '#F5F1EB']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Change Password</Text>
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
                <Ionicons name="lock-closed" size={32} color="white" />
              </View>
            </View>
            <Text style={[styles.welcomeTitle, { color: theme.colors.text }]}>Update Your Password</Text>
            <Text style={[styles.welcomeSubtitle, { color: theme.colors.text }]}>
              Keep your account secure with a strong password
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            {renderInput('oldPassword', 'Current Password', 'Enter your current password', { 
              secureTextEntry: !showOldPassword 
            })}
            {renderInput('newPassword', 'New Password', 'Enter your new password', { 
              secureTextEntry: !showNewPassword 
            })}
            {renderInput('confirmPassword', 'Confirm New Password', 'Confirm your new password', { 
              secureTextEntry: !showConfirmPassword 
            })}
          </View>

          {/* Password Requirements */}
          <View style={styles.requirementsContainer}>
            <Text style={[styles.requirementsTitle, { color: theme.colors.text }]}>Password Requirements:</Text>
            <Text style={[styles.requirement, { color: theme.colors.text }]}>• At least 8 characters long</Text>
            <Text style={[styles.requirement, { color: theme.colors.text }]}>• Contains uppercase and lowercase letters</Text>
            <Text style={[styles.requirement, { color: theme.colors.text }]}>• Contains at least one number</Text>
          </View>

          {/* Change Password Button */}
          <TouchableOpacity
            style={[styles.changeButton, isLoading && styles.changeButtonDisabled]}
            onPress={handleChangePassword}
            disabled={isLoading}
          >
            <LinearGradient
              colors={['#3E5F44', '#4A7C59']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {isLoading ? (
                <Text style={styles.changeButtonText}>Changing...</Text>
              ) : (
                <>
                  <Text style={styles.changeButtonText}>Change Password</Text>
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
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
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
  },
  inputWrapper: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 4,
  },
  errorText: {
    fontSize: 14,
    marginTop: 6,
    marginLeft: 4,
  },
  requirementsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  requirementsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  requirement: {
    fontSize: 14,
    marginBottom: 4,
  },
  changeButton: {
    borderRadius: 28,
    marginHorizontal: 20,
    marginBottom: 24,
    shadowColor: '#3E5F44',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  changeButtonDisabled: {
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
  changeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  checkIcon: { marginLeft: 12 },
});

export default ChangePasswordScreen;
