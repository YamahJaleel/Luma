import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
// face-api.js has environment issues in React Native, using alternative approach
// import * as faceapi from 'face-api.js';

const { width } = Dimensions.get('window');

// face-api.js models directory (downloaded and ready)
const MODELS_PATH = './assets/models';

const TestGenderDetectionScreen = ({ navigation }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false); // Will be true when models are loaded
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);

  // Load AI models when component mounts
  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Loading AI models...');
      
      // For React Native compatibility, we'll simulate model loading
      // In production, you could use react-native-ml-kit or similar
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate loading time
      
      console.log('Models loaded successfully! (Simulated for React Native)');
      setModelsLoaded(true);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading models:', error);
      setError('Failed to load AI models. Please try again.');
      setIsLoading(false);
    }
  };

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Camera Permission', 'Please grant camera permission to take photos.');
        return false;
      }
    }
    return true;
  };

  const takePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
        setAnalysisResult(null);
        setError(null);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: [ImagePicker.MediaType.Image],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
        setAnalysisResult(null);
        setError(null);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage || !modelsLoaded) {
      Alert.alert('Error', 'Please select an image and ensure models are loaded.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setAnalysisResult(null);

      console.log('Starting AI analysis...');

      // Simulate AI processing time
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log('Analyzing image...');

      // For testing purposes, simulate realistic ML results
      // In production, this would use a real ML library
      const isFemale = Math.random() > 0.4; // 60% chance of female for testing
      const confidence = 0.7 + Math.random() * 0.25; // 70-95% confidence
      const age = 20 + Math.floor(Math.random() * 40); // 20-59 years
      const ageConfidence = 0.75 + Math.random() * 0.2; // 75-95% confidence

      const result = {
        gender: isFemale ? 'female' : 'male',
        genderProbability: confidence,
        age: age,
        ageProbability: ageConfidence,
        faceDetected: true,
        confidence: confidence,
      };
      
      setAnalysisResult(result);
      console.log('Analysis complete (simulated):', result);
    } catch (error) {
      console.error('Analysis error:', error);
      setError(`Analysis failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setSelectedImage(null);
    setAnalysisResult(null);
    setError(null);
  };

  const getGenderColor = (gender) => {
    return gender === 'female' ? '#EC4899' : '#3B82F6';
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return '#10B981'; // Green for high confidence
    if (confidence >= 0.6) return '#F59E0B'; // Yellow for medium confidence
    return '#EF4444'; // Red for low confidence
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
        <Text style={styles.headerTitle}>Gender Detection Test</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Section */}
        <View style={styles.statusSection}>
          <View style={styles.statusIcon}>
            <Ionicons 
              name={modelsLoaded ? "checkmark-circle" : "time"} 
              size={32} 
              color={modelsLoaded ? "#10B981" : "#F59E0B"} 
            />
          </View>
          <Text style={styles.statusTitle}>
            {modelsLoaded ? 'AI Models Ready' : 'Loading AI Models...'}
          </Text>
          <Text style={styles.statusSubtitle}>
            {modelsLoaded 
              ? 'You can now test gender detection (Simulated for React Native)'
              : 'Please wait while we load the required AI models'
            }
          </Text>
        </View>

        {/* Image Selection */}
        <View style={styles.imageSection}>
          <Text style={styles.sectionTitle}>Select Test Image</Text>
          
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.actionButton} onPress={takePhoto}>
              <Ionicons name="camera" size={24} color="white" />
              <Text style={styles.buttonText}>Take Photo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} onPress={pickImage}>
              <Ionicons name="images" size={24} color="white" />
              <Text style={styles.buttonText}>Pick Image</Text>
            </TouchableOpacity>
          </View>

          {selectedImage && (
            <View style={styles.imageContainer}>
              <Image source={{ uri: selectedImage }} style={styles.previewImage} />
              <TouchableOpacity style={styles.clearButton} onPress={clearResults}>
                <Ionicons name="close-circle" size={24} color="#EF4444" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Analysis Button */}
        {selectedImage && modelsLoaded && (
          <TouchableOpacity
            style={[styles.analyzeButton, isLoading && styles.analyzeButtonDisabled]}
            onPress={analyzeImage}
            disabled={isLoading}
          >
            <LinearGradient
              colors={['#3E5F44', '#4A7C59']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {isLoading ? (
                <Text style={styles.analyzeButtonText}>Analyzing...</Text>
              ) : (
                <>
                  <Text style={styles.analyzeButtonText}>Analyze Image</Text>
                  <Ionicons name="analytics" size={20} color="white" style={styles.arrowIcon} />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Results Section */}
        {analysisResult && (
          <View style={styles.resultsSection}>
            <Text style={styles.sectionTitle}>Analysis Results</Text>
            
            <View style={styles.resultCard}>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Gender:</Text>
                <Text style={[
                  styles.resultValue, 
                  { color: getGenderColor(analysisResult.gender) }
                ]}>
                  {analysisResult.gender.charAt(0).toUpperCase() + analysisResult.gender.slice(1)}
                </Text>
              </View>
              
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Confidence:</Text>
                <Text style={[
                  styles.resultValue, 
                  { color: getConfidenceColor(analysisResult.confidence) }
                ]}>
                  {Math.round(analysisResult.confidence * 100)}%
                </Text>
              </View>
              
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Age:</Text>
                <Text style={styles.resultValue}>
                  {Math.round(analysisResult.age)} years
                </Text>
              </View>
              
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Age Confidence:</Text>
                <Text style={styles.resultValue}>
                  {Math.round(analysisResult.ageProbability * 100)}%
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Error Section */}
        {error && (
          <View style={styles.errorSection}>
            <View style={styles.errorIcon}>
              <Ionicons name="alert-circle" size={24} color="#EF4444" />
            </View>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Debug Info */}
        <View style={styles.debugSection}>
          <Text style={styles.debugTitle}>Debug Information</Text>
          <Text style={styles.debugText}>Models Loaded: {modelsLoaded ? 'Yes' : 'No'}</Text>
          <Text style={styles.debugText}>Image Selected: {selectedImage ? 'Yes' : 'No'}</Text>
          <Text style={styles.debugText}>Analysis Complete: {analysisResult ? 'Yes' : 'No'}</Text>
          <Text style={styles.debugText}>Mode: Simulation (React Native Compatible)</Text>
        </View>
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statusSection: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statusIcon: {
    marginBottom: 12,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3E5F44',
    marginBottom: 8,
    textAlign: 'center',
  },
  statusSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  imageSection: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3E5F44',
    marginBottom: 16,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: '#3E5F44',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 120,
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  imageContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  previewImage: {
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: 12,
    marginBottom: 12,
  },
  clearButton: {
    position: 'absolute',
    top: -8,
    right: width * 0.15,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  analyzeButton: {
    borderRadius: 28,
    marginBottom: 24,
    shadowColor: '#3E5F44',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  analyzeButtonDisabled: {
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
  analyzeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  arrowIcon: {
    marginLeft: 12,
  },
  resultsSection: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  resultCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  resultLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  resultValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  errorSection: {
    flexDirection: 'row',
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#DC2626',
    lineHeight: 20,
  },
  debugSection: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  debugTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 12,
  },
  debugText: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
});

export default TestGenderDetectionScreen; 