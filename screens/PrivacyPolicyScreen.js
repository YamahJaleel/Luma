import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';

const PrivacyPolicyScreen = ({ navigation }) => {
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
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Privacy Policy</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="shield-checkmark" size={48} color={theme.colors.primary} />
          </View>
        </View>
        
        <Text style={[styles.title, { color: theme.colors.text }]}>Privacy Policy</Text>
        
        <View style={[styles.policyContent, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.policyText, { color: theme.colors.text }]}>

            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>1. Introduction{'\n\n'}</Text>
            This Privacy Policy explains how Luma collects, uses, discloses, and protects your personal information. By using this platform, you consent to the practices described herein.{'\n\n'}

            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>2. Information We Collect{'\n\n'}</Text>
            We collect the following categories of information:{'\n\n'}
            • Information you provide directly, such as your pseudonym, email address, and content you choose to share{'\n'}
            • Technical and device-related information, including identifiers, usage data, and log information{'\n'}
            • Communications and interactions with other users or with the support team{'\n\n'}

            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>3. How We Use Information{'\n\n'}</Text>
            We use your information to:{'\n\n'}
            • Operate, maintain, and improve the platform{'\n'}
            • Enforce our Terms of Service and Community Guidelines{'\n'}
            • Provide support and respond to inquiries{'\n'}
            • Protect user safety and security{'\n'}
            • Comply with applicable legal obligations{'\n\n'}

            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>4. Sharing and Disclosure{'\n\n'}</Text>
            We do not sell or rent your personal data. Information may be shared only in the following circumstances:{'\n\n'}
            • When required by law or in response to valid legal process{'\n'}
            • To protect the rights, property, or safety of the platform or its users{'\n'}
            • With trusted service providers who support our operations under strict confidentiality obligations{'\n\n'}

            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>5. Data Security{'\n\n'}</Text>
            We implement administrative, technical, and physical safeguards to secure your information. Sensitive data is encrypted both in transit and at rest to mitigate risks of unauthorized access, disclosure, or misuse.{'\n\n'}

            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>6. Your Rights and Choices{'\n\n'}</Text>
            You may exercise the following rights:{'\n\n'}
            • Access and update your personal information{'\n'}
            • Control visibility of your information within the app{'\n'}
            • Request deletion of your account and associated data, subject to legal retention requirements{'\n\n'}

            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>7. Data Retention{'\n\n'}</Text>
            We retain information only for as long as necessary to provide services or comply with legal requirements. Upon account deletion, personal data will either be deleted or irreversibly anonymized, unless retention is required by law.{'\n\n'}

            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>8. Children’s Privacy{'\n\n'}</Text>
            This platform is not directed to individuals under the age of 18. We do not knowingly collect data from minors. If such data is inadvertently collected, it will be promptly deleted in compliance with applicable law.{'\n\n'}

            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>9. International Data Transfers{'\n\n'}</Text>
            Your information may be transferred to and processed in countries other than your own. Where such transfers occur, we ensure that appropriate safeguards are in place to protect your personal information in accordance with applicable data protection laws.{'\n\n'}

            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>10. Changes to This Policy{'\n\n'}</Text>
            We may update this Privacy Policy periodically to reflect changes in our practices, services, or legal obligations. Material changes will be communicated through the application, and the effective date will be updated accordingly.{'\n\n'}

            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>11. Contact Information{'\n\n'}</Text>
            For questions, concerns, or requests regarding this Privacy Policy, please contact us at:{'\n\n'}
            Email: luma312003@gmail.com{'\n'}
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

  policyContent: {
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
  policyText: {
    fontSize: 16,
    lineHeight: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
});

export default PrivacyPolicyScreen;
