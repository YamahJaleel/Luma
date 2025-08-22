import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TermsOfServiceScreen = ({ navigation }) => {



  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#3E5F44" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms of Service</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="document-text" size={48} color="#3E5F44" />
          </View>
        </View>
        
        <Text style={styles.title}>Terms of Service</Text>
        
        <View style={styles.termsContent}>
          <Text style={styles.termsText}>
            <Text style={styles.sectionTitle}>1. Acceptance of Terms{'\n\n'}</Text>
            By accessing and using the Luma application, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.{'\n\n'}
            
            <Text style={styles.sectionTitle}>2. Privacy and Safety{'\n\n'}</Text>
            Your privacy and safety are our top priorities. All personal information shared within the app is encrypted and protected. Users are encouraged to maintain anonymity and use pseudonyms for their safety.{'\n\n'}
            
            <Text style={styles.sectionTitle}>3. Community Guidelines{'\n\n'}</Text>
            Users must respect community guidelines and maintain a safe environment. Harassment, hate speech, or any form of abuse will not be tolerated and may result in account termination.{'\n\n'}
            
            <Text style={styles.sectionTitle}>4. User Responsibilities{'\n\n'}</Text>
            Users are responsible for the content they post and share. All information should be accurate and helpful to the community. Users must not share false or misleading information.{'\n\n'}
            
            <Text style={styles.sectionTitle}>5. Data Protection{'\n\n'}</Text>
            We implement industry-standard security measures to protect your data. Your information is never sold to third parties and is only used to provide and improve our services.{'\n\n'}
            
            <Text style={styles.sectionTitle}>6. Service Modifications{'\n\n'}</Text>
            We reserve the right to modify or discontinue the service at any time. Users will be notified of significant changes to these terms.{'\n\n'}
            
            <Text style={styles.sectionTitle}>7. Contact Information{'\n\n'}</Text>
            For questions about these terms, please contact our support team through the app or at luma312003@gmail.com
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3E5F44',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 20,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0E4D3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#3E5F44',
    marginBottom: 20,
    textAlign: 'center',
  },

  termsContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  termsText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3E5F44',
    marginBottom: 8,
  },
});

export default TermsOfServiceScreen; 