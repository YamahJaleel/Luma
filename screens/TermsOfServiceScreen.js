import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';

const TermsOfServiceScreen = ({ navigation }) => {
  const theme = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.background, borderBottomColor: theme.colors.outline }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Terms of Service</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="document-text" size={48} color={theme.colors.primary} />
          </View>
        </View>
        
        <Text style={[styles.title, { color: theme.colors.text }]}>Terms of Service</Text>
        
        <View style={[styles.termsContent, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.termsText, { color: theme.colors.text }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>1. Acceptance of Terms{'\n\n'}</Text>
            By accessing and using the Luma application, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.{'\n\n'}
            
            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>2. Privacy and Safety{'\n\n'}</Text>
            Your privacy and safety are our top priorities. All personal information shared within the app is encrypted and protected. Users are encouraged to maintain anonymity and use pseudonyms for their safety.{'\n\n'}
            
            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>3. Community Guidelines{'\n\n'}</Text>
            Users must respect community guidelines and maintain a safe environment. Harassment, hate speech, or any form of abuse will not be tolerated and may result in account termination.{'\n\n'}
            
            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>4. User Responsibilities{'\n\n'}</Text>
            Users are responsible for the content they post and share. All information should be accurate and helpful to the community. Users must not share false or misleading information.{'\n\n'}
            
            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>5. Data Protection{'\n\n'}</Text>
            We implement industry-standard security measures to protect your data. Your information is never sold to third parties and is only used to provide and improve our services.{'\n\n'}
            
            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>6. Service Modifications{'\n\n'}</Text>
            We reserve the right to modify or discontinue the service at any time. Users will be notified of significant changes to these terms.{'\n\n'}
            
            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>7. Contact Information{'\n\n'}</Text>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
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
    marginBottom: 20,
    textAlign: 'center',
  },

  termsContent: {
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
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
});

export default TermsOfServiceScreen; 