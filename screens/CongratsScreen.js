import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import { useOnboarding } from '../components/OnboardingContext';
import { useFocusEffect } from '@react-navigation/native';
import { useTabContext } from '../components/TabContext';

const CongratsScreen = ({ navigation }) => {
  const { isOnboarded, setIsOnboarded } = useOnboarding();
  const { setTabHidden, setCurrentTab } = useTabContext();

  useFocusEffect(
    React.useCallback(() => {
      setTabHidden(true);
      return () => setTabHidden(false);
    }, [])
  );
  return (
    <View style={styles.container}>
      <LinearGradient colors={["#FAF6F0", "#F5F1EB"]} style={styles.gradient}>
        <View style={styles.content}>
          <View style={styles.card}>
            <LottieView
              source={require('../assets/animations/Success.json')}
              autoPlay
              loop
              style={styles.successAnim}
            />
            <Text style={styles.title}>Congrats !</Text>
            <Text style={styles.subtitle}>You have now registered. Welcome to the luma app.</Text>
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => {
              // Ensure the tab bar selects Home
              setCurrentTab && setCurrentTab('Home');
              if (!isOnboarded) {
                setIsOnboarded(true);
                return;
              }
              navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
            }}
          >
            <LinearGradient colors={["#3E5F44", "#4A7C59"]} style={styles.primaryButtonInner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.primaryButtonText}>Enter Luma</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    backgroundColor: 'transparent',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
    marginBottom: 16,
  },
  successAnim: {
    width: 350,
    height: 350,
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1F2937',
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
    marginTop: 8,
  },
  primaryButton: {
    borderRadius: 28,
    marginTop: 28,
    alignSelf: 'stretch',
  },
  primaryButtonInner: {
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default CongratsScreen;


