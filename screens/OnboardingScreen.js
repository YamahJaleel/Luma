import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const OnboardingScreen = ({ onComplete }) => {
  const [currentPage, setCurrentPage] = useState(0);

  const onboardingData = [
    {
      title: 'Welcome to Luma',
      subtitle: 'Your safety companion in the dating world',
      description: 'Connect with a community that prioritizes your safety and well-being while dating.',
      icon: 'shield-checkmark',
      color: '#D9A299',
    },
    {
      title: 'Anonymous Sharing',
      subtitle: 'Share experiences safely',
      description: 'Post about your dating experiences anonymously. Your privacy is our top priority.',
      icon: 'eye-off',
      color: '#DCC5B2',
    },
    {
      title: 'Search & Verify',
      subtitle: 'Check before you connect',
      description: 'Search names to see if others have shared experiences or red flags about someone.',
      icon: 'search',
      color: '#F0E4D3',
    },
    {
      title: 'Community Support',
      subtitle: 'You\'re not alone',
      description: 'Get advice, share stories, and support each other in a safe, moderated environment.',
      icon: 'people',
      color: '#FAF7F3',
    },
  ];

  const nextPage = () => {
    if (currentPage < onboardingData.length - 1) {
      setCurrentPage(currentPage + 1);
    } else {
      onComplete();
    }
  };

  const skipOnboarding = () => {
    onComplete();
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FDF8F3', '#FFFFFF']}
        style={styles.gradient}
      >
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => {
            const page = Math.round(event.nativeEvent.contentOffset.x / width);
            setCurrentPage(page);
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
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  index === currentPage && styles.paginationDotActive,
                ]}
              />
            ))}
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={skipOnboarding} style={styles.skipButton}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={nextPage} style={styles.nextButton}>
              <Text style={styles.nextText}>
                {currentPage === onboardingData.length - 1 ? 'Get Started' : 'Next'}
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
    color: '#D9A299',
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
    backgroundColor: '#D9A299',
    width: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  skipText: {
    color: '#A0AEC0',
    fontSize: 16,
    fontWeight: '500',
  },
  nextButton: {
    backgroundColor: '#D9A299',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#D9A299',
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
});

export default OnboardingScreen; 