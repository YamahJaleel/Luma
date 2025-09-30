import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

const CommunityGuidelinesScreen = ({ navigation }) => {
  const theme = useTheme();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={[styles.backButton, { backgroundColor: theme.colors.surface }]} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Community Guidelines</Text>
          <View style={styles.headerSpacer} />
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Our Community Standards</Text>
        
        <Text style={[styles.paragraph, { color: theme.colors.text }]}>
          Luma is a safety-first platform designed to provide a truly protected space in the dating world. Our community guidelines ensure that every user feels safe, respected, and empowered to share their experiences.
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Core Principles</Text>
        
        <Text style={[styles.subsectionTitle, { color: theme.colors.text }]}>1. Safety First</Text>
        <Text style={[styles.paragraph, { color: theme.colors.text }]}>
          Your safety is our top priority. We maintain strict privacy measures and provide tools to help you verify concerns and share experiences without fear of exposure.
        </Text>

        <Text style={[styles.subsectionTitle, { color: theme.colors.text }]}>2. Respectful Communication</Text>
        <Text style={[styles.paragraph, { color: theme.colors.text }]}>
          Treat all community members with respect and kindness. Harassment, bullying, or abusive behavior will not be tolerated.
        </Text>

        <Text style={[styles.subsectionTitle, { color: theme.colors.text }]}>3. Authentic Sharing</Text>
        <Text style={[styles.paragraph, { color: theme.colors.text }]}>
          Share genuine experiences and insights. False information or misleading content undermines our community's trust and safety.
        </Text>

        <Text style={[styles.subsectionTitle, { color: theme.colors.text }]}>4. Privacy Protection</Text>
        <Text style={[styles.paragraph, { color: theme.colors.text }]}>
          Respect others' privacy and anonymity. Do not attempt to identify or expose other users' personal information.
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Prohibited Content</Text>
        
        <Text style={[styles.paragraph, { color: theme.colors.text }]}>
          • Harassment, threats, or intimidation{'\n'}
          • Hate speech or discriminatory language{'\n'}
          • Spam or promotional content{'\n'}
          • Personal information sharing{'\n'}
          • Inappropriate or explicit content{'\n'}
          • False or misleading information
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Reporting & Enforcement</Text>
        
        <Text style={[styles.paragraph, { color: theme.colors.text }]}>
          If you encounter content or behavior that violates these guidelines, please report it immediately. Our moderation team reviews all reports and takes appropriate action to maintain our community standards.
        </Text>

        <Text style={[styles.paragraph, { color: theme.colors.text }]}>
          Violations may result in content removal, account warnings, or account suspension depending on the severity and frequency of violations.
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Questions?</Text>
        
        <Text style={[styles.paragraph, { color: theme.colors.text }]}>
          If you have questions about these guidelines or need clarification on any policy, please contact our support team.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, paddingTop: 60 },
  headerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: { fontSize: 26, fontWeight: 'bold' },
  headerSpacer: { width: 40 },
  content: { padding: 20 },
  sectionTitle: { fontSize: 22, fontWeight: 'bold', marginTop: 24, marginBottom: 12 },
  subsectionTitle: { fontSize: 18, fontWeight: '600', marginTop: 16, marginBottom: 8 },
  paragraph: { fontSize: 16, lineHeight: 24, marginBottom: 16 },
});

export default CommunityGuidelinesScreen;
