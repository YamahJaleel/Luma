import React, { useCallback, useState, useRef } from 'react';
import { View, Text, Alert, ActivityIndicator, StyleSheet, TouchableOpacity, Image, ScrollView, Linking } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';
import { useOnboarding } from '../components/OnboardingContext';
import { useFocusEffect } from '@react-navigation/native';
import { useTabContext } from '../components/TabContext';
import { authService } from '../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LottieView from 'lottie-react-native';

const LicenseVerificationScreen = ({ route, navigation }) => {
  const signupName = route?.params?.signupName || '';
  const pendingUserData = route?.params?.pendingUserData || null;
  const { setIsOnboarded } = useOnboarding();
  const { setTabHidden } = useTabContext();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const cameraPermissionAskedRef = useRef(false);
  const theme = useTheme();
  const [photoUri, setPhotoUri] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState(null); // 'success' | 'failed' | null
  const [detectedGender, setDetectedGender] = useState(null);
  const [creatingAccount, setCreatingAccount] = useState(false);
  
  useFocusEffect(
    React.useCallback(() => {
      setTabHidden(true);
      return () => setTabHidden(false);
    }, [])
  );

  const ensureCameraPermission = useCallback(async () => {
    // Ask only once per session
    if (!cameraPermissionAskedRef.current) {
      cameraPermissionAskedRef.current = true;
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Camera permission required',
          'Please enable camera access in Settings to continue.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings?.() },
          ]
        );
        return false;
      }
    }
    return true;
  }, []);

  const openCamera = useCallback(async () => {
    const permitted = await ensureCameraPermission();
    if (!permitted) return;

    const mediaTypeImages = (ImagePicker.MediaType && ImagePicker.MediaType.Images) || ImagePicker.MediaTypeOptions.Images;
    let res = await ImagePicker.launchCameraAsync({
      mediaTypes: mediaTypeImages,
      quality: 1,
      exif: false,
      allowsEditing: true,
      aspect: undefined,
    });

    if (!res.canceled) {
      // Show immediately, then normalize orientation in background
      const originalUri = res.assets[0].uri;
      setPhotoUri(originalUri);
      setResult(null);
      setVerificationStatus(null);
      setDetectedGender(null);
      try {
        const normalized = await manipulateAsync(
          originalUri,
          [{ rotate: 0 }],
          { compress: 1, format: SaveFormat.JPEG }
        );
        setPhotoUri(normalized.uri);
      } catch (e) {
        // keep original if manipulation fails
      }
    }
  }, [ensureCameraPermission]);

  const uploadSelfie = useCallback(async (imageUri) => {
    setLoading(true);
    console.log('🚀 Starting selfie upload process...');
    console.log('📸 Image URI:', imageUri);
    
    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'selfie.jpg',
    });

    console.log('📡 Making API request to: https://reactlover-gender-api.hf.space/analyze');
    console.log('🔧 FormData:', formData);

    try {
      const response = await fetch('https://reactlover-gender-api.hf.space/analyze', {
        method: 'POST',
        headers: { 
          'Accept': 'application/json',
        },
        body: formData,
      });

      console.log('📊 Response received:');
      console.log('   - Status:', response.status);
      console.log('   - OK:', response.ok);
      console.log('   - Status Text:', response.statusText);
      console.log('   - Headers:', Object.fromEntries(response.headers.entries()));

      // Check if response is ok
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:');
        console.error('   - Status:', response.status);
        console.error('   - Response Body:', errorText);
        Alert.alert('API Error', `Server returned ${response.status}: ${errorText}`);
        setVerificationStatus('failed');
        return;
      }

      // Check content type
      const contentType = response.headers.get('content-type');
      console.log('📄 Content-Type:', contentType);
      
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error('⚠️ Non-JSON Response received:');
        console.error('   - Content-Type:', contentType);
        console.error('   - Response Body:', textResponse);
        console.error('   - First 500 chars:', textResponse.substring(0, 500));
        Alert.alert('Invalid Response', 'The server returned an unexpected response format.');
        setVerificationStatus('failed');
        return;
      }

      console.log('✅ Attempting to parse JSON response...');
      const data = await response.json();
      console.log('🎉 Gender API response parsed successfully:', data);

      if (data && data.gender) {
        console.log('🎯 Gender detected:', data.gender);
        setDetectedGender(data.gender);
        setVerificationStatus('success');
        Alert.alert('✅ Gender Detected', `Detected gender: ${data.gender}`);
      } else {
        console.log('⚠️ No gender detected in response');
        Alert.alert('⚠️ Unable to analyze', 'Could not determine gender from the photo. Please try again.');
        setVerificationStatus('failed');
      }

      setResult({
        gender: data?.gender,
      });
    } catch (error) {
      console.error('💥 Upload failed with error:');
      console.error('   - Error name:', error.name);
      console.error('   - Error message:', error.message);
      console.error('   - Error stack:', error.stack);
      
      if (error.message.includes('JSON Parse error')) {
        console.error('🔍 JSON Parse Error Details:');
        console.error('   - This usually means the server returned HTML instead of JSON');
        console.error('   - Check if the API endpoint is correct and working');
        Alert.alert('Connection Error', 'The server returned an invalid response. Please check your internet connection and try again.');
      } else {
        Alert.alert('Error', 'Something went wrong, please try again.');
      }
      setVerificationStatus('failed');
    } finally {
      setLoading(false);
      console.log('🏁 Upload process finished (loading set to false)');
    }
  }, []);

  // Create Firebase account after gender verification passes
  const createFirebaseAccount = async () => {
    if (!pendingUserData) {
      console.log('⚠️ No pending user data found, proceeding without Firebase account creation');
      navigation.navigate('Congrats');
      return;
    }

    // 🧪 DEV MODE: Skip verification for testing
    if (__DEV__ && false) { // Set to true to enable testing bypass
      console.log('🧪 DEV MODE: Skipping gender verification for testing');
      setDetectedGender('Man');
      setVerificationStatus('success');
      setResult({ gender: 'Man' });
    }

    setCreatingAccount(true);
    console.log('🔥 Creating Firebase account...');

    try {
      // Create Firebase account with the stored form data
      const user = await authService.createUser(
        pendingUserData.email,
        pendingUserData.password,
        pendingUserData.pseudonym
      );

      console.log('✅ Firebase account created successfully:', user.uid);

      // Save additional user data to Firestore (optional)
      const completeUserData = {
        ...pendingUserData,
        firebaseUid: user.uid,
        isVerified: true,
        detectedGender: detectedGender,
        emailVerified: user.emailVerified,
      };

      // Remove pending data from AsyncStorage
      await AsyncStorage.removeItem('pendingUserData');
      
      // Save complete user data 
      await AsyncStorage.setItem('userData', JSON.stringify(completeUserData));

      console.log('🎉 Account setup complete!');
      
      // Set onboarded state and navigate to congrats screen
      setIsOnboarded(true);
      navigation.navigate('Congrats');

    } catch (error) {
      console.error('❌ Failed to create Firebase account:', error);
      
      // Determine the specific error message to show
      let errorMessage = 'There was an error creating your account.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please use a different email or sign in.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'The email address is not valid.';
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = 'Account creation is currently disabled. Please try again later.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'The password is too weak. Please choose a stronger password.';
      }

      Alert.alert(
        'Account Creation Failed',
        errorMessage,
        [
          {
            text: 'Retry',
            onPress: () => createFirebaseAccount()
          }
        ]
      );
    } finally {
      setCreatingAccount(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#FAF6F0", "#F5F1EB"]} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#3E5F44" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Verification</Text>
          <TouchableOpacity
            style={styles.headerRightButton}
            onPress={() => {
              navigation.navigate('Congrats');
            }}
          >
            <Text style={styles.headerRightText}>Skip</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView contentContainerStyle={[styles.content, { alignItems: 'center' }]} showsVerticalScrollIndicator>
          {!photoUri && (
            <>
              <View style={styles.lottieContainer}>
                <LottieView
                  source={require('../assets/animations/Selfie.json')}
                  autoPlay
                  loop
                  style={styles.lottie}
                />
              </View>
              <Text style={styles.title}>Take a Selfie</Text>
              <Text style={styles.subtitle}>
                Take a clear photo of your face for gender verification
              </Text>
              <Text style={styles.tip}>Tip: Make sure your face is well-lit and centered in the frame.</Text>

              <TouchableOpacity style={[styles.primaryButton, loading && styles.primaryButtonDisabled]} onPress={openCamera} disabled={loading}>
                <LinearGradient colors={["#3E5F44", "#4A7C59"]} style={styles.primaryButtonInner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                  <Ionicons name="camera" size={20} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.primaryButtonText}>Take Selfie</Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* 🧪 DEVELOPMENT TEST BUTTON */}
              {__DEV__ && (
                <TouchableOpacity 
                  style={[styles.secondaryButton, { marginTop: 10 }]} 
                  onPress={() => {
                    console.log('🧪 TEST: Simulating successful gender verification');
                    setDetectedGender('Man');
                    setVerificationStatus('success');
                    setResult({ gender: 'Man' });
                  }}
                >
                  <Text style={styles.secondaryButtonText}>🧪 Test: Skip Verification</Text>
                </TouchableOpacity>
              )}
            </>
          )}

          {!!photoUri && (
            <>
              <Text style={styles.resultLabel}>Submitted Photo</Text>
              <View style={styles.previewCard}>
                <Image source={{ uri: photoUri }} style={styles.previewImage} resizeMode="cover" />
              </View>
              <View style={styles.actionsRow}>
                <TouchableOpacity style={[styles.secondaryButton]} onPress={openCamera}>
                  <Ionicons name="crop" size={18} color="#3E5F44" style={{ marginRight: 6 }} />
                  <Text style={styles.secondaryButtonText}>Retake & Crop</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.secondaryButton]} onPress={openCamera}>
                  <Ionicons name="refresh" size={18} color="#3E5F44" style={{ marginRight: 6 }} />
                  <Text style={styles.secondaryButtonText}>Retake</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={[styles.primaryButton, loading && styles.primaryButtonDisabled]} onPress={() => uploadSelfie(photoUri)} disabled={loading}>
                <LinearGradient colors={["#3E5F44", "#4A7C59"]} style={styles.primaryButtonInner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                  {loading ? (
                    <>
                      <ActivityIndicator color="#fff" />
                      <Text style={styles.primaryButtonText}> Analyzing...</Text>
                    </>
                  ) : (
                    <>
                      <Ionicons name="cloud-upload" size={20} color="#fff" style={{ marginRight: 8 }} />
                      <Text style={styles.primaryButtonText}>Analyze</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </>
          )}

          {result && detectedGender && (
            <View style={styles.resultCard}>
              {verificationStatus && (
                <View style={[styles.statusBanner, verificationStatus === 'success' ? styles.statusSuccess : styles.statusFailed]}>
                  <Ionicons name={verificationStatus === 'success' ? 'checkmark-circle' : 'close-circle'} size={18} color="#fff" style={{ marginRight: 6 }} />
                  <Text style={styles.statusText}>{verificationStatus === 'success' ? 'Gender detected successfully' : 'Unable to determine gender'}</Text>
                </View>
              )}
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Detected Gender</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name={detectedGender?.toLowerCase() === 'man' ? 'male' : 'female'} size={16} color="#111827" style={{ marginRight: 6 }} />
                  <Text style={styles.resultValue}>{detectedGender || 'N/A'}</Text>
                </View>
              </View>
              <View style={{ height: 8 }} />
              <TouchableOpacity
                style={[styles.primaryButton, (verificationStatus !== 'success' || creatingAccount) && styles.primaryButtonDisabled]}
                onPress={createFirebaseAccount}
                disabled={verificationStatus !== 'success' || creatingAccount}
              >
                <LinearGradient colors={["#3E5F44", "#4A7C59"]} style={styles.primaryButtonInner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                  {creatingAccount ? (
                    <>
                      <ActivityIndicator color="#fff" />
                      <Text style={styles.primaryButtonText}> Creating Account...</Text>
                    </>
                  ) : (
                    <>
                      <Ionicons name="checkmark" size={20} color="#fff" style={{ marginRight: 8 }} />
                      <Text style={styles.primaryButtonText}>Finish</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </LinearGradient>
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
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
  headerRightButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#3E5F44',
  },
  headerRightText: {
    color: '#fff',
    fontWeight: '700',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  lottieContainer: {
    width: 280,
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  lottie: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3E5F44',
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 8,
  },
  tip: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 6,
  },
  primaryButton: {
    borderRadius: 28,
    marginTop: 24,
    shadowColor: '#3E5F44',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 10,
    alignSelf: 'stretch',
    marginHorizontal: 4,
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonInner: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  previewCard: {
    marginTop: 8,
    width: '100%',
    height: 220,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 24,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  secondaryButtonText: {
    color: '#3E5F44',
    fontSize: 14,
    fontWeight: '600',
  },
  resultCard: {
    marginTop: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  resultLabel: {
    color: '#6B7280',
    fontSize: 14,
  },
  resultValue: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '600',
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  statusSuccess: {
    backgroundColor: '#10B981',
  },
  statusFailed: {
    backgroundColor: '#EF4444',
  },
  statusText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default LicenseVerificationScreen;