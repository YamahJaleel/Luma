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
            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>1. Information We Collect{'\n\n'}</Text>
            We collect information you provide directly to us, such as when you create an account, post content, or communicate with other users. This may include your pseudonym, email address, and any content you choose to share.{'\n\n'}
            
            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>2. How We Use Your Information{'\n\n'}</Text>
            We use the information we collect to provide, maintain, and improve our services, to communicate with you, and to ensure the safety and security of our community. Your personal information is never sold to third parties.{'\n\n'}
            
            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>3. Information Sharing and Disclosure{'\n\n'}</Text>
            We do not share your personal information with third parties except as described in this policy. We may share information when required by law, to protect our rights, or to ensure community safety.{'\n\n'}
            
            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>4. Data Security{'\n\n'}</Text>
            We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. All data is encrypted and stored securely.{'\n\n'}
            
            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>5. Your Privacy Choices{'\n\n'}</Text>
            You can control your privacy settings through the app, including what information is visible to other users. You can also request deletion of your account and associated data at any time.{'\n\n'}
            
            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>6. Data Retention{'\n\n'}</Text>
            We retain your information for as long as your account is active or as needed to provide services. When you delete your account, we will delete or anonymize your personal information.{'\n\n'}
            
            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>7. Children's Privacy{'\n\n'}</Text>
            Our service is not intended for children under 18 years of age. We do not knowingly collect personal information from children under 18. If we become aware of such information, we will delete it immediately.{'\n\n'}
            
            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>8. International Data Transfers{'\n\n'}</Text>
            Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your information in accordance with this policy.{'\n\n'}
            
            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>9. Changes to This Policy{'\n\n'}</Text>
            We may update this privacy policy from time to time. We will notify you of any material changes by posting the new policy in the app and updating the effective date.{'\n\n'}
            
            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>10. Contact Us{'\n\n'}</Text>
            If you have any questions about this privacy policy or our privacy practices, please contact us at luma312003@gmail.com or through the app's support system.
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