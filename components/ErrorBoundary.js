import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console
    console.error('Error caught by ErrorBoundary:', error);
    console.error('Error Info:', errorInfo);
    
    // TODO: Log to Firebase Crashlytics or your error tracking service
    // Example:
    // if (crashlytics) {
    //   crashlytics().recordError(error);
    // }
    
    this.setState({
      error,
      errorInfo: errorInfo.componentStack,
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback 
          error={this.state.error} 
          errorInfo={this.state.errorInfo}
          onReset={this.handleReset}
          theme={this.props.theme}
        />
      );
    }

    return this.props.children;
  }
}

const ErrorFallback = ({ error, errorInfo, onReset, theme }) => {
  const colors = theme?.colors || {};
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background || '#FFFFFF' }]}>
      <View style={styles.content}>
        <Text style={[styles.emoji, { color: colors.text }]}>⚠️</Text>
        <Text style={[styles.title, { color: colors.text }]}>
          Oops! Something went wrong
        </Text>
        <Text style={[styles.message, { color: colors.placeholder || '#666' }]}>
          We're sorry for the inconvenience. The app encountered an unexpected error.
        </Text>
        
        {__DEV__ && (
          <View style={styles.debugContainer}>
            <Text style={[styles.debugTitle, { color: colors.text }]}>Error Details:</Text>
            <Text style={[styles.debugText, { color: colors.text }]}>
              {error?.toString() || 'Unknown error'}
            </Text>
            {errorInfo && (
              <Text style={[styles.debugText, { color: colors.text }]}>
                {errorInfo}
              </Text>
            )}
          </View>
        )}
        
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: colors.primary || '#3E5F44' }]}
          onPress={onReset}
        >
          <Text style={styles.buttonText}>Try Again</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.secondaryButton, { borderColor: colors.primary || '#3E5F44' }]}
          onPress={() => {
            // Could navigate to home or restart app
            if (typeof window !== 'undefined') {
              window.location.reload();
            }
          }}
        >
          <Text style={[styles.buttonText, styles.secondaryButtonText, { color: colors.primary || '#3E5F44' }]}>
            Restart App
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    maxWidth: 400,
    width: '100%',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  debugContainer: {
    width: '100%',
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
    maxHeight: 200,
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  button: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#3E5F44',
  },
});

// HOC wrapper for theme support
export const ErrorBoundaryWithTheme = ({ children }) => {
  const theme = useTheme();
  
  return (
    <ErrorBoundary theme={theme}>
      {children}
    </ErrorBoundary>
  );
};

export default ErrorBoundary;

