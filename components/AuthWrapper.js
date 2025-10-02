import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useFirebase } from '../contexts/FirebaseContext';

/**
 * Authentication wrapper component that demonstrates proper auth state management
 * This shows how to handle the initializing state and conditional rendering
 */
const AuthWrapper = ({ children }) => {
  const { user, initializing } = useFirebase();

  // Show loading during initialization
  if (initializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3E5F44" />
        <Text style={styles.loadingText}>Initializing...</Text>
      </View>
    );
  }

  // Show login screen if user is not authenticated
  if (!user) {
    return (
      <View style={styles.loginContainer}>
        <Text style={styles.loginText}>Please sign in to continue</Text>
      </View>
    );
  }

  // Render authenticated content
  return children;
};

export const AuthContent = ({ children }) => {
  const { user, initializing } = useFirebase();

  // During initialization, don't render anything
  if (initializing) {
    return null;
  }

  // Render content only if user is authenticated
  if (user) {
    return children;
  }

  return null;
};

export const AnonymousAuthCheck = ({ children, fallback }) => {
  const { user, initializing } = useFirebase();

  // During initialization, don't render anything
  if (initializing) {
    return null;
  }

  // Check if user is authenticated (either email/password or anonymous)
  if (user) {
    return children;
  }

  // Render fallback for unauthenticated users
  return fallback || null;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FDF8F3',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#3E5F44',
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FDF8F3',
  },
  loginText: {
    fontSize: 18,
    color: '#3E5F44',
    textAlign: 'center',
  },
});

export default AuthWrapper;
