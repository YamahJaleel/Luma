import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import ScreenProtectionModule from '../modules/ScreenProtectionModule';

/**
 * Screen Protection Test Component
 * 
 * This component provides a simple interface to test the screen protection functionality.
 * It shows the current status and allows users to enable/disable protection.
 * 
 * Usage: Add this component to any screen for testing purposes
 */
const ScreenProtectionTest = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [platformInfo, setPlatformInfo] = useState(null);

  useEffect(() => {
    // Check initial status
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const supported = ScreenProtectionModule.isSupported();
      setIsSupported(supported);

      if (supported) {
        const enabled = await ScreenProtectionModule.isEnabled();
        setIsEnabled(enabled);
        
        const info = ScreenProtectionModule.getPlatformInfo();
        setPlatformInfo(info);
      }
    } catch (error) {
      console.error('Error checking screen protection status:', error);
    }
  };

  const handleEnable = async () => {
    try {
      const result = await ScreenProtectionModule.enable();
      if (result) {
        setIsEnabled(true);
        Alert.alert('Success', 'Screen protection enabled');
      } else {
        Alert.alert('Error', 'Failed to enable screen protection');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to enable screen protection: ' + error.message);
    }
  };

  const handleDisable = async () => {
    try {
      const result = await ScreenProtectionModule.disable();
      if (result) {
        setIsEnabled(false);
        Alert.alert('Success', 'Screen protection disabled');
      } else {
        Alert.alert('Error', 'Failed to disable screen protection');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to disable screen protection: ' + error.message);
    }
  };

  const handleTestScreenshot = () => {
    Alert.alert(
      'Test Screenshot',
      'Try taking a screenshot now. On Android, it should be blocked. On iOS, the screen should blur briefly.',
      [{ text: 'OK' }]
    );
  };

  if (!isSupported) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Screen Protection Test</Text>
        <Text style={styles.unsupported}>Screen protection not supported on this platform</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Screen Protection Test</Text>
      
      <View style={styles.statusContainer}>
        <Text style={styles.statusLabel}>Status:</Text>
        <Text style={[styles.statusValue, { color: isEnabled ? '#10B981' : '#EF4444' }]}>
          {isEnabled ? 'Enabled' : 'Disabled'}
        </Text>
      </View>

      {platformInfo && (
        <View style={styles.infoContainer}>
          <Text style={styles.infoLabel}>Platform: {platformInfo.platform}</Text>
          <Text style={styles.infoLabel}>Version: {platformInfo.version}</Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.enableButton]}
          onPress={handleEnable}
          disabled={isEnabled}
        >
          <Text style={styles.buttonText}>Enable Protection</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.disableButton]}
          onPress={handleDisable}
          disabled={!isEnabled}
        >
          <Text style={styles.buttonText}>Disable Protection</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.testButton]}
          onPress={handleTestScreenshot}
        >
          <Text style={styles.buttonText}>Test Screenshot</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.refreshButton]}
          onPress={checkStatus}
        >
          <Text style={styles.buttonText}>Refresh Status</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    margin: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#1F2937',
  },
  unsupported: {
    fontSize: 16,
    textAlign: 'center',
    color: '#6B7280',
    fontStyle: 'italic',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginRight: 8,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoContainer: {
    marginBottom: 20,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 4,
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  enableButton: {
    backgroundColor: '#10B981',
  },
  disableButton: {
    backgroundColor: '#EF4444',
  },
  testButton: {
    backgroundColor: '#3B82F6',
  },
  refreshButton: {
    backgroundColor: '#6B7280',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ScreenProtectionTest;
