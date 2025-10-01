import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';

const CommunityGuidelinesScreen = ({ navigation }) => {
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
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Community Guidelines</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="people" size={48} color={theme.colors.primary} />
          </View>
        </View>
        
        <Text style={[styles.title, { color: theme.colors.text }]}>Community Guidelines</Text>
        
        <View style={[styles.guidelinesContent, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.guidelinesText, { color: theme.colors.text }]}>

            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>1. Purpose of the Guidelines{'\n\n'}</Text>
            Luma is designed as a safety-first platform that empowers women in their relationships by offering protection, security, and peace of mind. These Community Guidelines establish the expectations and responsibilities for all users to ensure that the platform remains respectful, supportive, and safe.{'\n\n'}

            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>2. Core Principles{'\n\n'}</Text>
            <Text style={[styles.subsectionTitle, { color: theme.colors.primary }]}>a) Safety{'\n'}</Text>
            Safety is our highest priority. Users are expected to use the platform in a manner that does not endanger or compromise others.{'\n\n'}
            <Text style={[styles.subsectionTitle, { color: theme.colors.primary }]}>b) Respect{'\n'}</Text>
            Interactions must be courteous and free from harassment, intimidation, or discrimination of any kind.{'\n\n'}
            <Text style={[styles.subsectionTitle, { color: theme.colors.primary }]}>c) Integrity{'\n'}</Text>
            All contributions should be honest, authentic, and free from intentional deception or misinformation.{'\n\n'}
            <Text style={[styles.subsectionTitle, { color: theme.colors.primary }]}>d) Privacy{'\n'}</Text>
            Users must respect the confidentiality and anonymity of others, refraining from disclosing personal or identifying information without consent.{'\n\n'}

            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>3. Prohibited Content{'\n\n'}</Text>
            The following types of content are expressly prohibited:{'\n\n'}
            • Harassment, threats, or intimidation{'\n'}
            • Defamatory, libelous, or slanderous statements{'\n'}
            • Hate speech or discriminatory language{'\n'}
            • Spam, fraudulent activity, or unsolicited promotions{'\n'}
            • Sharing of personal or sensitive information without consent{'\n'}
            • Inappropriate, obscene, or sexually explicit material{'\n'}
            • Misinformation, false claims, or deceptive content{'\n\n'}

            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>4. Defamation and Harmful Conduct{'\n\n'}</Text>
            Users are strictly prohibited from engaging in any form of defamation or reputational harm. Specifically:{'\n\n'}
            • Publishing false statements presented as fact that may damage another’s reputation{'\n'}
            • Engaging in personal attacks or derogatory commentary{'\n'}
            • Circulating malicious rumors or targeted harassment campaigns{'\n\n'}
            The platform is not intended to disparage individuals, but to provide empowerment, protection, and constructive dialogue.{'\n\n'}

            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>5. Reporting and Enforcement{'\n\n'}</Text>
            Users are encouraged to report content or behavior that violates these Guidelines. All reports will be reviewed by our moderation team. Depending on severity and frequency, enforcement actions may include:{'\n\n'}
            • Removal of violating content{'\n'}
            • Issuance of formal warnings{'\n'}
            • Temporary suspension of account privileges{'\n'}
            • Permanent termination of accounts{'\n'}
            • Referral to law enforcement or legal authorities when appropriate{'\n\n'}

            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>6. Shared Responsibility{'\n\n'}</Text>
            Every member of the community contributes to maintaining an environment of trust and respect. By using Luma, you agree to uphold these standards, act responsibly, and contribute positively to the well-being of all members.{'\n\n'}

            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>7. Questions and Clarifications{'\n\n'}</Text>
            For questions about these Community Guidelines or to seek clarification, users contact us at:{'\n\n'}
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
  guidelinesContent: {
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
  guidelinesText: {
    fontSize: 16,
    lineHeight: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
  },
});

export default CommunityGuidelinesScreen;
