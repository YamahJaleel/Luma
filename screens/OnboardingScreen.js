import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const OnboardingScreen = ({ onComplete }) => {
  const [currentPage, setCurrentPage] = useState(0);
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
      color: '#3E5F44', // Deep forest green
    },
    {
      title: 'Anonymous Sharing',
      subtitle: 'Share experiences safely',
      description: 'Post about your dating experiences anonymously. Your privacy is our top priority.',
      icon: 'eye-off',
      color: '#3E5F44', // Deep forest green
    },
    {
      title: 'Search & Verify',
      subtitle: 'Check before you connect',
      description: 'Search names to see if others have shared experiences or red flags about someone.',
      icon: 'search',
      color: '#3E5F44', // Deep forest green
    },
    {
      title: 'Community Support',
      subtitle: 'You\'re not alone',
      description: 'Get advice, share stories, and support each other in a safe, moderated environment.',
      icon: 'people',
      color: '#3E5F44', // Deep forest green
    },
    {
      title: 'Protected by Encryption',
      subtitle: 'Your data is secure',
      description: 'All your information is encrypted and protected. Your privacy and security are our highest priorities.',
      icon: 'lock-closed',
      color: '#3E5F44', // Deep forest green
      hasLearnMore: true,
    },
  ];

  const animatedValues = useRef(
    onboardingData.map(() => new Animated.Value(0))
  ).current;

  // Initialize first dot as active
  React.useEffect(() => {
    animatePagination(0);
  }, []);

  const animatePagination = (newPage) => {
    // Reset all dots
    animatedValues.forEach((value, index) => {
      Animated.timing(value, {
        toValue: index === newPage ? 1 : 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    });
  };

  const handleLearnMore = () => {
    setShowLearnMore(true);
    setHasSeenLearnMore(true);
    Animated.timing(learnMoreAnimation, {
      toValue: 1,
      duration: 400,
      useNativeDriver: false,
    }).start();
  };

  const closeLearnMore = () => {
    Animated.timing(learnMoreAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      setShowLearnMore(false);
    });
  };

  const nextPage = () => {
    if (onboardingData[currentPage]?.hasLearnMore && !hasSeenLearnMore) {
      handleLearnMore();
    } else if (currentPage < onboardingData.length - 1) {
      const nextPageIndex = currentPage + 1;
      setCurrentPage(nextPageIndex);
      animatePagination(nextPageIndex);
      scrollViewRef.current?.scrollTo({
        x: nextPageIndex * width,
        animated: true,
      });
    } else {
      onComplete();
    }
  };



  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FDF8F3', '#FFFFFF']}
        style={styles.gradient}
      >
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => {
            const page = Math.round(event.nativeEvent.contentOffset.x / width);
            setCurrentPage(page);
            animatePagination(page);
          }}
          style={styles.scrollView}
        >
          {onboardingData.map((item, index) => (
            <View key={index} style={styles.page}>
              <View style={styles.iconContainer}>
                <View style={[styles.iconCircle, { backgroundColor: item.color }]}>
                  <Ionicons name={item.icon} size={60} color="white" />
                </View>
              </View>
              
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.subtitle}>{item.subtitle}</Text>
              <Text style={styles.description}>{item.description}</Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.pagination}>
            {onboardingData.map((_, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.paginationDot,
                  {
                    width: animatedValues[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: [8, 24],
                    }),
                    backgroundColor: animatedValues[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: ['#E2E8F0', '#3E5F44'], // Deep forest green
                    }),
                  },
                ]}
              />
            ))}
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={nextPage} style={styles.nextButton}>
              <Text style={styles.nextText}>
                {onboardingData[currentPage]?.hasLearnMore && !hasSeenLearnMore ? 'Learn More' : 
                 currentPage === onboardingData.length - 1 ? 'Get Started' : 'Next'}
              </Text>
              <Ionicons 
                name="arrow-forward" 
                size={20} 
                color="white" 
                style={styles.arrowIcon}
              />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Learn More Overlay */}
      {showLearnMore && (
        <Animated.View
          style={[
            styles.learnMoreOverlay,
            {
              opacity: learnMoreAnimation,
              transform: [
                {
                  scale: learnMoreAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.learnMoreContent}>
            <View style={styles.learnMoreHeader}>
              <Text style={styles.learnMoreTitle}>Protected by Encryption</Text>
              <TouchableOpacity onPress={closeLearnMore} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#2D3748" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.learnMoreScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.learnMoreSectionTitle}>End-to-End Encryption</Text>
              <Text style={styles.learnMoreText}>
                Your data is protected using multiple layers of end-to-end encryption. Your information stays private and secure throughout its entire journey.
              </Text>
              
              <Text style={styles.learnMoreSectionTitle}>Privacy First</Text>
              <Text style={styles.learnMoreText}>
                We do not store information in readable formats. Your identity remains private while still enabling meaningful and safe interactions within the community.
              </Text>
              
              <Text style={styles.learnMoreSectionTitle}>Secure Communication</Text>
              <Text style={styles.learnMoreText}>
                All connections between your device and our servers are encrypted using secure communication protocols, preventing interception or tampering during data transmission.
              </Text>
              
              <Text style={styles.learnMoreSectionTitle}>Data Protection</Text>
              <Text style={styles.learnMoreText}>
                We adhere to strict data protection principles and never share your information with third parties. Your trust and privacy are at the core of our platform.
              </Text>
            </ScrollView>
          </View>
        </Animated.View>
      )}
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
  scrollView: {
    flex: 1,
  },
  page: {
    width,
    height: height * 0.7,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    marginBottom: 40,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2D3748',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#3E5F44', // Deep forest green
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '600',
  },
  description: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: 40,
    paddingBottom: 40,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#3E5F44', // Deep forest green
    width: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButton: {
    backgroundColor: '#3E5F44', // Deep forest green
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#3E5F44', // Deep forest green
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  nextText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  arrowIcon: {
    marginLeft: 8,
  },
  learnMoreOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  learnMoreContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    margin: 20,
    maxHeight: height * 0.8,
    width: width - 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  learnMoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  learnMoreTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  closeButton: {
    padding: 5,
  },
  learnMoreScroll: {
    padding: 20,
  },
  learnMoreSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3E5F44', // Deep forest green
    marginBottom: 10,
    marginTop: 20,
  },
  learnMoreText: {
    fontSize: 16,
    color: '#718096',
    lineHeight: 24,
    marginBottom: 15,
  },
});

export default OnboardingScreen; 