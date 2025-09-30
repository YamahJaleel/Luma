import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View, Text, Alert, ActivityIndicator, StyleSheet, TouchableOpacity, Image, ScrollView, Linking } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';
import { useOnboarding } from '../components/OnboardingContext';
import { useFocusEffect } from '@react-navigation/native';
import { useTabContext } from '../components/TabContext';
import LottieView from 'lottie-react-native';

// Utility: normalize a name into a set of tokens for rough matching
const tokenizeName = (name) => {
  if (!name) return [];
  return name
    .toLowerCase()
    .replace(/[^a-z\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
};

const normalizeLetters = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z]/g, '');
};

const collapseRepeats = (text) => text.replace(/(.)\1+/g, '$1');

// Return the fraction of characters of needle that appear in order within haystack (not necessarily contiguous)
const subsequenceMatchRatio = (needle, haystack) => {
  if (!needle) return 0;
  let i = 0;
  for (let j = 0; j < haystack.length && i < needle.length; j++) {
    if (haystack[j] === needle[i]) i++;
  }
  return i / needle.length;
};

const roughlyNamesMatch = (extractedText, signupName) => {
  if (!extractedText || !signupName) return false;
  const haystackRaw = normalizeLetters(extractedText);
  const haystack = haystackRaw;
  const haystackCollapsed = collapseRepeats(haystackRaw);
  const tokens = tokenizeName(signupName).map(normalizeLetters).filter(Boolean);
  if (tokens.length === 0) return false;

  // Threshold tolerant to OCR noise
  const threshold = 0.6;

  const tokenPasses = (token) => {
    const r1 = subsequenceMatchRatio(token, haystack);
    const r2 = subsequenceMatchRatio(token, haystackCollapsed);
    const r = Math.max(r1, r2);
    return r >= threshold || (token.length >= 5 && r >= 0.55);
  };

  // If there are 2+ tokens, require at least two tokens to meet threshold (order-insensitive across tokens)
  if (tokens.length >= 2) {
    const matches = tokens.reduce((acc, token) => acc + (tokenPasses(token) ? 1 : 0), 0);
    return matches >= 2;
  }

  // Single-token names: require that one token matches
  return tokenPasses(tokens[0]);
};

const LicenseVerificationScreen = ({ route, navigation }) => {
  const signupName = route?.params?.signupName || '';
  const { setIsOnboarded } = useOnboarding();
  const { setTabHidden } = useTabContext();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const cameraPermissionAskedRef = useRef(false);
  const theme = useTheme();
  const [photoUri, setPhotoUri] = useState(null);
  const [uploadedUri, setUploadedUri] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState(null); // 'success' | 'failed' | null
  const [forceEnableFinish, setForceEnableFinish] = useState(false);
  
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

  const uploadLicense = useCallback(async (imageUri) => {
    setLoading(true);
    setUploadedUri(imageUri);
    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'license.jpg',
    });

    try {
      const response = await fetch('https://ReactLover-OCR-2.hf.space/extract_gender', {
        method: 'POST',
        headers: { accept: 'application/json' },
        body: formData,
      });

      const data = await response.json();
      if (__DEV__) console.log('API response:', data);

      if (data?.picture_quality === 'not clear') {
        Alert.alert('⚠️ Picture not clear', 'Please retake the photo.');
        // Re-open camera automatically
        setPhotoUri(null);
        openCamera();
        return;
      }

      const isMatch = roughlyNamesMatch(data?.extracted_text || '', signupName || '');
      if (isMatch) {
        Alert.alert('✅ Verification Successful', 'Name verified successfully');
        setVerificationStatus('success');
      } else {
        Alert.alert('❌ Verification Failed', 'Name does not match. Please try again.');
        setVerificationStatus('failed');
      }

      setResult({
        gender: data?.gender,
        picture_quality: data?.picture_quality,
        extracted_text: data?.extracted_text,
      });
    } catch (error) {
      console.error('Upload failed', error);
      Alert.alert('Error', 'Something went wrong, please try again.');
    } finally {
      setLoading(false);
    }
  }, [signupName, openCamera]);

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
                  source={require('../assets/animations/Scan.json')}
                  autoPlay
                  loop
                  style={styles.lottie}
                />
              </View>
              <Text style={styles.title}>Verify your gender</Text>
              <Text style={styles.subtitle}>
                Take a clear photo of your ID. Make sure all text is readable.
              </Text>
              <Text style={styles.tip}>Tip: Align the card edges with the frame and avoid glare.</Text>

              <TouchableOpacity style={[styles.primaryButton, loading && styles.primaryButtonDisabled]} onPress={openCamera} disabled={loading}>
                <LinearGradient colors={["#3E5F44", "#4A7C59"]} style={styles.primaryButtonInner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                  <Ionicons name="camera" size={20} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.primaryButtonText}>Take Picture</Text>
                </LinearGradient>
              </TouchableOpacity>
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

              <TouchableOpacity style={[styles.primaryButton, loading && styles.primaryButtonDisabled]} onPress={() => uploadLicense(photoUri)} disabled={loading}>
                <LinearGradient colors={["#3E5F44", "#4A7C59"]} style={styles.primaryButtonInner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                  {loading ? (
                    <>
                      <ActivityIndicator color="#fff" />
                      <Text style={styles.primaryButtonText}> Verifying...</Text>
                    </>
                  ) : (
                    <>
                      <Ionicons name="cloud-upload" size={20} color="#fff" style={{ marginRight: 8 }} />
                      <Text style={styles.primaryButtonText}>Verify</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </>
          )}

          {!!signupName && (
            <Text style={styles.verifyingFor}>Verifying for: {signupName}</Text>
          )}

          {result && (
            <View style={styles.resultCard}>
              {verificationStatus && (
                <View style={[styles.statusBanner, verificationStatus === 'success' ? styles.statusSuccess : styles.statusFailed]}>
                  <Ionicons name={verificationStatus === 'success' ? 'checkmark-circle' : 'close-circle'} size={18} color="#fff" style={{ marginRight: 6 }} />
                  <Text style={styles.statusText}>{verificationStatus === 'success' ? 'Name verified successfully' : 'Name does not match'}</Text>
                </View>
              )}
              {!!signupName && (
                <>
                  <View style={styles.resultRow}>
                    <Text style={styles.resultLabel}>Provided Name</Text>
                    <Text style={styles.resultValue}>{signupName}</Text>
                  </View>
                  <View style={styles.divider} />
                </>
              )}
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Detected Gender</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name={result.gender?.toLowerCase() === 'male' ? 'male' : 'female'} size={16} color="#111827" style={{ marginRight: 6 }} />
                  <Text style={styles.resultValue}>{result.gender || 'N/A'}</Text>
                </View>
              </View>
              <View style={styles.divider} />
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Picture Quality</Text>
                <View style={[styles.qualityChip, (result.picture_quality === 'clear' ? styles.qualityGood : styles.qualityBad)]}>
                  <Text style={styles.qualityChipText}>{result.picture_quality || 'unknown'}</Text>
                </View>
              </View>
              <View style={styles.divider} />
              <View style={styles.resultColumn}>
                <Text style={styles.resultLabel}>Extracted Text</Text>
                <Text style={styles.extractedText}>{result.extracted_text || '—'}</Text>
              </View>
              <View style={{ height: 8 }} />
              <TouchableOpacity
                style={[styles.primaryButton, (verificationStatus !== 'success' && !forceEnableFinish) && styles.primaryButtonDisabled]}
                onPress={() => {
                  navigation.navigate('Congrats');
                }}
                disabled={verificationStatus !== 'success' && !forceEnableFinish}
              >
                <LinearGradient colors={["#3E5F44", "#4A7C59"]} style={styles.primaryButtonInner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                  <Ionicons name="checkmark" size={20} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.primaryButtonText}>Finish</Text>
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
  headerRightPlaceholder: {
    width: 32,
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
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#3E5F44',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#4A7C59',
    marginTop: 8,
  },
  lottieContainer: {
    width: 240,
    height: 240,
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
  verifyingFor: {
    marginTop: 10,
    color: '#6B7280',
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
  resultColumn: {
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
  submittedThumb: {
    width: '100%',
    height: 180,
    borderRadius: 10,
    marginTop: 8,
    backgroundColor: '#F3F4F6',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
  },
  extractedText: {
    color: '#111827',
    fontSize: 14,
    marginTop: 6,
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
  qualityChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  qualityGood: {
    backgroundColor: '#DCFCE7',
  },
  qualityBad: {
    backgroundColor: '#FEE2E2',
  },
  qualityChipText: {
    color: '#111827',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
  },
});

export default LicenseVerificationScreen;


