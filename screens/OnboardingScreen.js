import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Animated,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';

const { width, height } = Dimensions.get('window');

const OnboardingScreen = ({ navigation }) => {
  const theme = useTheme();
  const [showLearnMore, setShowLearnMore] = useState(false);
  const [hasSeenLearnMore, setHasSeenLearnMore] = useState(false);
  const scrollViewRef = useRef(null);
  const learnMoreAnimation = useRef(new Animated.Value(0)).current;

  const onboardingData = [
    {
      title: 'Welcome to Luma',
      subtitle: 'Your safety companion in the dating world',
      description: 'Connect with a community that prioritizes your safety and well-being while dating.',
      icon: 'shield-checkmark',
      color: '#3E5F44',
      gradient: ['#FAF6F0', '#F5F1EB'],
    },
    {
      title: 'Anonymous Sharing',
      subtitle: 'Share experiences safely',
      description: 'Post about your dating experiences anonymously. Your privacy is our top priority.',
      icon: 'eye-off',
      color: '#3E5F44',
      gradient: ['#F8F4EE', '#F3EFE9'],
    },
    {
      title: 'Search & Verify',
      subtitle: 'Check before you connect',
      description: 'Search names to see if others have shared experiences or red flags about someone.',
      icon: 'search',
      color: '#3E5F44',
      gradient: ['#F6F2EC', '#F1EDE7'],
    },
    {
      title: 'Community Support',
      subtitle: "You're not alone",
      description: 'Get advice, share stories, and support each other in a safe, moderated environment.',
      icon: 'people',
      color: '#3E5F44',
      gradient: ['#F4F0EA', '#EFEBE5'],
    },
    {
      title: 'Protected by Encryption',
      subtitle: 'Your data is secure',
      description: 'All your information is encrypted and protected. Your privacy and security are our highest priorities.',
      icon: 'lock-closed',
      color: '#3E5F44',
      gradient: ['#F2EEE8', '#EDE9E3'],
      hasLearnMore: true,
    },
  ];

  const handleLearnMore = () => {
    setShowLearnMore(true);
    setHasSeenLearnMore(true);
    Animated.timing(learnMoreAnimation, { toValue: 1, duration: 350, useNativeDriver: true }).start();
  };

  const closeLearnMore = () => {
    Animated.timing(learnMoreAnimation, { toValue: 0, duration: 280, useNativeDriver: true }).start(() => {
      setShowLearnMore(false);
    });
  };

  const handleGetStarted = () => {
    navigation.navigate('CreateAccount');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FAF6F0', '#F5F1EB']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Image source={require('../assets/AppIcon.png')} style={styles.logoImage} />
            </View>
            <Text style={styles.logoText}>Luma</Text>
          </View>
        </View>

        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          {onboardingData.map((item, index) => (
            <View key={index} style={styles.cardContainer}>
              <LinearGradient
                colors={item.gradient}
                style={styles.cardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.cardContent}>
                  <View style={styles.iconContainer}>
                    <View style={styles.iconCircle}>
                      <Ionicons name={item.icon} size={40} color="white" />
                    </View>
                  </View>
                  
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.subtitle}>{item.subtitle}</Text>
                  <Text style={styles.description}>{item.description}</Text>
                  
                  {item.hasLearnMore && (
                    <TouchableOpacity onPress={handleLearnMore} style={styles.learnMoreButton}>
                      <Text style={styles.learnMoreButtonText}>Learn More</Text>
                      <Ionicons name="information-circle" size={18} color="white" />
                    </TouchableOpacity>
                  )}
                </View>
              </LinearGradient>
            </View>
          ))}
          
          {/* Get Started Button */}
          <View style={styles.getStartedContainer}>
            <TouchableOpacity onPress={handleGetStarted} style={styles.getStartedButton}>
              <LinearGradient
                colors={['#3E5F44', '#4A7C59']}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.getStartedText}>Get Started</Text>
                <Ionicons name="arrow-forward" size={20} color="white" style={styles.arrowIcon} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>

      {showLearnMore && (
        <Animated.View
          style={[
            styles.learnMoreOverlay,
            {
              opacity: learnMoreAnimation.interpolate({ inputRange: [0, 1], outputRange: [0, 1] }),
            },
          ]}
        >
          <Animated.View
            style={[
              styles.learnMoreContent,
              {
              transform: [
                {
                    translateY: learnMoreAnimation.interpolate({ inputRange: [0, 1], outputRange: [50, 0] }),
                },
              ],
            },
          ]}
        >
            <View style={styles.learnMoreHeader}>
              <Text style={styles.learnMoreTitle}>Protected by Encryption</Text>
              <TouchableOpacity onPress={closeLearnMore} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.learnMoreScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.learnMoreSectionTitle}>End-to-End Encryption</Text>
              <Text style={styles.learnMoreText}>Your data is protected using multiple layers of end-to-end encryption. Your information stays private and secure throughout its entire journey.</Text>
              <Text style={styles.learnMoreSectionTitle}>Privacy First</Text>
              <Text style={styles.learnMoreText}>We do not store information in readable formats. Your identity remains private while still enabling meaningful and safe interactions within the community.</Text>
              <Text style={styles.learnMoreSectionTitle}>Secure Communication</Text>
              <Text style={styles.learnMoreText}>All connections between your device and our servers are encrypted using secure communication protocols, preventing interception or tampering during data transmission.</Text>
              <Text style={styles.learnMoreSectionTitle}>Data Protection</Text>
              <Text style={styles.learnMoreText}>We adhere to strict data protection principles and never share your information with third parties. Your trust and privacy are at the core of our platform.</Text>
            </ScrollView>
          </Animated.View>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCircle: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3E5F44',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  logoImage: {
    width: 32,
    height: 32,
    borderRadius: 4,
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3E5F44',
    marginLeft: 12,
  },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  cardContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  cardGradient: {
    borderRadius: 24,
    padding: 24,
  },
  cardContent: {
    alignItems: 'center',
  },
  iconContainer: { marginBottom: 20 },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3E5F44',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#4A7C59',
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    textAlign: 'center', 
    marginBottom: 8,
    color: '#3E5F44',
  },
  subtitle: { 
    fontSize: 16, 
    textAlign: 'center', 
    marginBottom: 16, 
    fontWeight: '600',
    color: '#4A7C59',
  },
  description: { 
    fontSize: 15, 
    textAlign: 'center', 
    lineHeight: 22, 
    marginBottom: 20,
    color: '#2D3748',
  },
  learnMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#3E5F44',
    borderWidth: 1,
    borderColor: '#4A7C59',
    gap: 6,
  },
  learnMoreButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  getStartedContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  getStartedButton: {
    borderRadius: 28,
    shadowColor: '#3E5F44',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  buttonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 40,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 28,
  },
  getStartedText: { 
    color: 'white', 
    fontSize: 18, 
    fontWeight: '700',
  },
  arrowIcon: { marginLeft: 12 },
  learnMoreOverlay: { 
    position: 'absolute', 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0, 
    backgroundColor: 'rgba(0, 0, 0, 0.6)', 
    justifyContent: 'flex-end', 
    alignItems: 'stretch', 
    zIndex: 1000 
  },
  learnMoreContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 20,
    maxHeight: height * 0.85,
    width: '100%',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  learnMoreHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 24, 
    borderBottomWidth: 1, 
    borderBottomColor: '#F1F5F9' 
  },
  learnMoreTitle: { 
    fontSize: 22, 
    fontWeight: 'bold',
    color: '#1F2937',
  },
  closeButton: { padding: 8 },
  learnMoreScroll: { padding: 24 },
  learnMoreSectionTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginBottom: 12, 
    marginTop: 20,
    color: '#3E5F44',
  },
  learnMoreText: { 
    fontSize: 16, 
    lineHeight: 24, 
    marginBottom: 20,
    color: '#4B5563',
  },
});

export default OnboardingScreen; 