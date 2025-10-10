import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OnboardingContext = createContext();
const ONBOARDING_COMPLETE_KEY = '@onboarding_complete';

export const OnboardingProvider = ({ children }) => {
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user has completed onboarding when app starts
  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      // Simulate first-time download - clear onboarding status once
      const hasBeenReset = await AsyncStorage.getItem('@onboarding_reset');
      if (!hasBeenReset) {
        // First time running after reset - clear onboarding and mark as reset
        await AsyncStorage.removeItem(ONBOARDING_COMPLETE_KEY);
        await AsyncStorage.setItem('@onboarding_reset', 'true');
        setIsOnboarded(false);
      } else {
        // Normal behavior - check if onboarding was completed
        const value = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
        setIsOnboarded(value === 'true');
      }
    } catch (error) {
      console.error('Error reading onboarding status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
      setIsOnboarded(true);
    } catch (error) {
      console.error('Error saving onboarding status:', error);
    }
  };

  if (isLoading) {
    return null; // Or a loading spinner
  }

  return (
    <OnboardingContext.Provider value={{ 
      isOnboarded, 
      setIsOnboarded: (value) => {
        if (value === true) {
          completeOnboarding();
        } else {
          setIsOnboarded(value);
        }
      }
    }}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};
