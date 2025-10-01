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
        
        <View style={[styles.policyContent, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.policyText, { color: theme.colors.text }]}>

            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>1. Acceptance of Terms{'\n\n'}</Text>
            By accessing or using this application (“Luma”), you agree to be bound by these Terms of Service, together with our Privacy Policy and Community Guidelines. If you do not agree, you must not use the platform.{'\n\n'}

            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>2. Eligibility{'\n\n'}</Text>
            The platform is intended solely for individuals aged 18 years or older. By using the platform, you represent and warrant that you are at least 18 years of age and legally capable of entering into these Terms.{'\n\n'}

            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>3. User Accounts and Responsibilities{'\n\n'}</Text>
            Users are responsible for maintaining the confidentiality of their login credentials and for all activities conducted under their account. You agree to immediately notify us of any unauthorized use of your account or security breach.{'\n\n'}

            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>4. Prohibited Uses{'\n\n'}</Text>
            You agree not to use the platform for any unlawful or harmful purpose, including but not limited to:{'\n\n'}
            • Posting defamatory, libelous, or slanderous statements{'\n'}
            • Harassment, bullying, or targeted abuse of individuals or groups{'\n'}
            • Hate speech or discriminatory conduct{'\n'}
            • Sharing personal information of others without consent{'\n'}
            • Uploading obscene, sexually explicit, or harmful content{'\n'}
            • Attempting to hack, disrupt, or compromise the platform’s security{'\n'}
            • Engaging in spam, scams, or fraudulent activity{'\n\n'}

            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>5. Defamation and Harmful Conduct{'\n\n'}</Text>
            This platform is intended to provide empowerment, safety, and peace of mind. Users are strictly prohibited from posting or transmitting content that harms the reputation, character, or dignity of others. This includes false statements, personal attacks, or malicious rumors.{'\n\n'}

            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>6. Intellectual Property{'\n\n'}</Text>
            All intellectual property rights in the platform, including trademarks, logos, and content created by Luma, are owned by us. Users retain ownership of content they create but grant Luma a limited license to host, display, and share it within the platform in accordance with these Terms.{'\n\n'}

            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>7. Enforcement and Termination{'\n\n'}</Text>
            We reserve the right to investigate violations of these Terms. Depending on the severity of misconduct, actions may include:{'\n\n'}
            • Immediate removal of offending content{'\n'}
            • Issuance of account warnings{'\n'}
            • Temporary suspension of account privileges{'\n'}
            • Permanent termination of account access{'\n'}
            • Referral to law enforcement or legal authorities, where appropriate{'\n\n'}

            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>8. Disclaimers{'\n\n'}</Text>
            The platform is provided on an “as is” and “as available” basis. We do not warrant that the platform will be uninterrupted, error-free, or completely secure. We do not guarantee the accuracy, reliability, or completeness of user-generated content.{'\n\n'}

            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>9. Limitation of Liability{'\n\n'}</Text>
            To the maximum extent permitted by law, Luma shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the platform, including but not limited to emotional distress, reputational harm, or loss of data.{'\n\n'}

            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>10. Indemnification{'\n\n'}</Text>
            You agree to indemnify, defend, and hold harmless Luma, its affiliates, and team members from any claims, damages, or expenses arising from your violation of these Terms or misuse of the platform.{'\n\n'}

            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>11. Governing Law and Jurisdiction{'\n\n'}</Text>
            These Terms shall be governed by and construed under the laws of Ontario, Canada. Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the courts located in Ontario.{'\n\n'}

            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>12. Changes to the Terms{'\n\n'}</Text>
            We may update or modify these Terms at any time. Material changes will be communicated through the app. Continued use of the platform after changes take effect constitutes acceptance of the revised Terms.{'\n\n'}

            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>13. Contact Information{'\n\n'}</Text>
            For questions regarding these Terms of Service, please contact us at:{'\n\n'}
            luma312003@gmail.com{'\n'}
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

export default TermsOfServiceScreen;
