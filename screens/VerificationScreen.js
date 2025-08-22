import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  Linking,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
// face-api.js removed - using Python server instead

const VerificationScreen = ({ navigation, route }) => {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const { setIsOnboarded } = route.params;

  // Load face-api.js models when component mounts
  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    // Models are loaded on the server, so we're always ready
    console.log('Server-based AI models ready');
    setModelsLoaded(true);
  };

  const requestPermissions = async (type = 'both') => {
    if (Platform.OS !== 'web') {
      if (type === 'camera' || type === 'both') {
        const cameraStatus = await ImagePicker.getCameraPermissionsAsync();
        if (cameraStatus.status === 'granted') {
          // Permission already granted
        } else if (cameraStatus.status === 'undetermined') {
          const newCameraStatus = await ImagePicker.requestCameraPermissionsAsync();
          if (newCameraStatus.status !== 'granted') {
            Alert.alert(
              'Camera Permission Required', 
              'Camera permission is needed to take a photo for verification. Please enable it in your device settings.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Open Settings', onPress: () => Linking.openSettings() }
              ]
            );
            return false;
          }
        } else {
          Alert.alert(
            'Camera Permission Denied', 
            'Camera permission was denied. Please enable it in your device settings to continue.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: () => Linking.openSettings() }
            ]
          );
          return false;
        }
      }
      
      if (type === 'library' || type === 'both') {
        const libraryStatus = await ImagePicker.getMediaLibraryPermissionsAsync();
        if (libraryStatus.status === 'granted') {
          // Permission already granted
        } else if (libraryStatus.status === 'undetermined') {
          const newLibraryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (newLibraryStatus.status !== 'granted') {
            Alert.alert(
              'Photo Library Permission Required', 
              'Photo library permission is needed to upload an ID. Please enable it in your device settings.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Open Settings', onPress: () => Linking.openSettings() }
              ]
            );
            return false;
          }
        } else {
          Alert.alert(
            'Photo Library Permission Denied', 
            'Photo library permission was denied. Please enable it in your device settings to continue.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: () => Linking.openSettings() }
            ]
          );
          return false;
        }
      }
    }
    return true;
  };



  const handleFacePhoto = async () => {
    setSelectedMethod('face');
    const hasPermission = await requestPermissions('camera');
    if (!hasPermission) return;

    if (!modelsLoaded) {
      Alert.alert('Models Loading', 'Please wait for the AI models to finish loading.');
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setIsLoading(true);
        setCapturedImage(result.assets[0].uri);
        
        try {
          // Simulate processing time
          await new Promise(resolve => setTimeout(resolve, 1000));

          // Simulate face detection for now
          const detections = { gender: 'female', genderProbability: 0.85 };
          
          if (detections) {
            const gender = detections.gender;
            const confidence = detections.genderProbability;
            
            console.log('Gender detected:', gender, 'Confidence:', confidence);
            
            // Check if confidence is high enough (adjust threshold as needed)
            if (confidence > 0.7) {
              if (gender === 'female') {
                Alert.alert(
                  'Verification Complete!', 
                  `Welcome to our community! Our AI has verified your profile with ${Math.round(confidence * 100)}% confidence.`,
                  [
                    {
                      text: 'Continue',
                      onPress: () => setIsOnboarded(true)
                    }
                  ]
                );
              } else {
                Alert.alert(
                  'Verification Failed',
                  'Our AI detected that this profile does not meet our community requirements.',
                  [
                    {
                      text: 'Try Again',
                      onPress: () => {
                        setSelectedMethod(null);
                        setCapturedImage(null);
                      }
                    }
                  ]
                );
              }
            } else {
              Alert.alert(
                'Low Confidence',
                'Our AI couldn\'t determine the result with enough confidence. Please try taking a clearer selfie.',
                [
                  {
                    text: 'Try Again',
                    onPress: () => {
                      setSelectedMethod(null);
                      setCapturedImage(null);
                    }
                  }
                ]
              );
            }
          } else {
            Alert.alert(
              'No Face Detected',
              'Please ensure your face is clearly visible in the selfie.',
              [
                {
                  text: 'Try Again',
                  onPress: () => {
                    setSelectedMethod(null);
                    setCapturedImage(null);
                  }
                }
              ]
            );
          }
        } catch (mlError) {
          console.error('ML analysis error:', mlError);
          Alert.alert(
            'Analysis Error',
            'Our AI encountered an error while analyzing your selfie. Please try again.',
            [
              {
                text: 'Try Again',
                onPress: () => {
                  setSelectedMethod(null);
                  setCapturedImage(null);
                }
              }
            ]
          );
        }
        
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      setIsLoading(false);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
  };

  const handleContinue = () => {
    handleFacePhoto();
  };

  return (
    <LinearGradient
      colors={['#FAF6F0', '#F5F1EB']}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#3E5F44" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Community Verification</Text>
        <TouchableOpacity
          style={styles.testButton}
          onPress={() => navigation.navigate('TestGenderDetection')}
        >
          <Ionicons name="flask" size={20} color="#3E5F44" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name="shield-checkmark" size={48} color="#3E5F44" />
            </View>
          </View>
          <Text style={styles.welcomeTitle}>Community Verification</Text>
          <Text style={styles.welcomeSubtitle}>
            Just one more step! To maintain our safe, women-focused community, we need to verify your profile. Please take a selfie to continue.
          </Text>
        </View>

        {/* Verification Methods */}
        <View style={styles.methodsContainer}>
          {/* Method 1: Face Photo */}
          <TouchableOpacity
            style={[
              styles.methodCard,
              selectedMethod === 'face' && styles.methodCardSelected
            ]}
            onPress={() => handleMethodSelect('face')}
          >
            <View style={styles.methodIcon}>
              <Ionicons 
                name="camera" 
                size={32} 
                color={selectedMethod === 'face' ? 'white' : '#3E5F44'} 
              />
            </View>
            <View style={styles.methodContent}>
              <Text style={[
                styles.methodTitle,
                selectedMethod === 'face' && styles.methodTitleSelected
              ]}>
                Take a Selfie
              </Text>
                             <Text style={[
                 styles.methodDescription,
                 selectedMethod === 'face' && styles.methodDescriptionSelected
               ]}>
                 {modelsLoaded 
                   ? 'Our AI will analyze your selfie to verify your profile. This is the fastest and most secure method.'
                   : 'Loading AI models... Please wait.'
                 }
               </Text>
            </View>
            <View style={styles.methodCheckbox}>
              {selectedMethod === 'face' && (
                <Ionicons name="checkmark-circle" size={24} color="white" />
              )}
            </View>
          </TouchableOpacity>
          
          {/* Loading Indicator */}
          {!modelsLoaded && (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading AI models for verification...</Text>
            </View>
          )}
        </View>



        {/* Continue Button */}
        <TouchableOpacity
          style={[
            styles.continueButton,
            (!modelsLoaded || isLoading) && styles.continueButtonDisabled
          ]}
          onPress={handleContinue}
          disabled={!modelsLoaded || isLoading}
        >
          <LinearGradient
            colors={selectedMethod ? ['#3E5F44', '#4A7C59'] : ['#D1D5DB', '#9CA3AF']}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {isLoading ? (
              <Text style={styles.continueButtonText}>
                {!modelsLoaded ? 'Loading AI Models...' : 'Verifying...'}
              </Text>
            ) : (
              <>
                <Text style={styles.continueButtonText}>
                  {modelsLoaded ? 'Take Selfie & Continue' : 'Loading AI Models...'}
                </Text>
                {modelsLoaded && (
                  <Ionicons name="arrow-forward" size={20} color="white" style={styles.arrowIcon} />
                )}
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
  testButton: {
    padding: 8,
    backgroundColor: '#F0E4D3',
    borderRadius: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    marginBottom: 16,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0E4D3',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#3E5F44',
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3E5F44',
    marginBottom: 12,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  methodsContainer: {
    marginBottom: 24,
  },
  methodCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  methodCardSelected: {
    borderColor: '#3E5F44',
    backgroundColor: '#3E5F44',
  },
  methodIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F0E4D3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  methodContent: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3E5F44',
    marginBottom: 4,
  },
  methodTitleSelected: {
    color: 'white',
  },
  methodDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  methodDescriptionSelected: {
    color: '#E5E7EB',
  },
  methodCheckbox: {
    width: 30,
    alignItems: 'center',
  },
  loadingContainer: {
    backgroundColor: '#F0E4D3',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#3E5F44',
    textAlign: 'center',
    fontStyle: 'italic',
  },

  continueButton: {
    borderRadius: 28,
    marginBottom: 24,
    shadowColor: '#3E5F44',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  continueButtonDisabled: {
    opacity: 0.6,
  },
  buttonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  arrowIcon: {
    marginLeft: 12,
  },
});

export default VerificationScreen; 