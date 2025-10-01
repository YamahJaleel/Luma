import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, Linking, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const EMAIL = 'luma312003@gmail.com';

const ReportBugScreen = ({ navigation }) => {
  const theme = useTheme();
  const [title, setTitle] = React.useState('Bug Report');
  const [steps, setSteps] = React.useState('');
  const [expected, setExpected] = React.useState('');
  const [actual, setActual] = React.useState('');

  const sendEmail = async () => {
    const parts = [
      `Title: ${title.trim()}`,
      `\nSteps to Reproduce:\n${steps.trim()}`,
      `\nExpected Result:\n${expected.trim()}`,
      `\nActual Result:\n${actual.trim()}`,
    ];
    const body = encodeURIComponent(parts.join('\n\n'));
    const sub = encodeURIComponent('Bug Report');
    const url = `mailto:${EMAIL}?subject=${sub}&body=${body}`;
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (!canOpen) throw new Error('No mail app available');
      await Linking.openURL(url);
      Alert.alert('Opened Mail', 'Finish sending your bug report in your email app.');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'Could not open your email app.');
    }
  };

  const canSend = steps.trim() && expected.trim() && actual.trim();

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <LinearGradient colors={theme.dark ? ['#1F2937', '#111827'] : ['#FAF6F0', '#F5F1EB']} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Report a Bug</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {/* Welcome */}
          <View style={styles.welcomeSection}>
            <View style={styles.iconCircle}><Ionicons name="bug" size={32} color="#FFFFFF" /></View>
            <Text style={[styles.welcomeTitle, { color: theme.colors.text }]}>Help us fix issues</Text>
            <Text style={[styles.welcomeSubtitle, { color: theme.colors.text }]}>Provide details so we can reproduce and resolve the bug.</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Bug Title</Text>
            <View style={[styles.inputWrapper, { backgroundColor: theme.colors.surface }]}>
              <TextInput value={title} onChangeText={setTitle} placeholder="Short summary" placeholderTextColor={theme.colors.placeholder} style={[styles.textInput, { color: theme.colors.text }]} />
            </View>

            <Text style={[styles.label, { color: theme.colors.text }]}>Steps to Reproduce</Text>
            <View style={[styles.inputWrapper, { backgroundColor: theme.colors.surface }]}>
              <TextInput value={steps} onChangeText={setSteps} placeholder={'1) ...\n2) ...\n3) ...'} placeholderTextColor={theme.colors.placeholder} style={[styles.textAreaInput, { color: theme.colors.text }]} multiline numberOfLines={6} textAlignVertical="top" />
            </View>

            <Text style={[styles.label, { color: theme.colors.text }]}>Expected Result</Text>
            <View style={[styles.inputWrapper, { backgroundColor: theme.colors.surface }]}>
              <TextInput value={expected} onChangeText={setExpected} placeholder="What you expected to happen" placeholderTextColor={theme.colors.placeholder} style={[styles.textAreaInput, { color: theme.colors.text }]} multiline numberOfLines={4} textAlignVertical="top" />
            </View>

            <Text style={[styles.label, { color: theme.colors.text }]}>Actual Result</Text>
            <View style={[styles.inputWrapper, { backgroundColor: theme.colors.surface }]}>
              <TextInput value={actual} onChangeText={setActual} placeholder="What actually happened" placeholderTextColor={theme.colors.placeholder} style={[styles.textAreaInput, { color: theme.colors.text }]} multiline numberOfLines={4} textAlignVertical="top" />
            </View>
          </View>

          <TouchableOpacity style={[styles.primaryBtn, !canSend && styles.primaryBtnDisabled]} onPress={sendEmail} disabled={!canSend}>
            <LinearGradient colors={['#3E5F44', '#4A7C59']} style={styles.primaryBtnGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Text style={styles.primaryBtnText}>Send</Text>
              <Ionicons name="send" size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20 },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  backBtn: { padding: 8 },
  content: { paddingBottom: 40 },
  welcomeSection: { alignItems: 'center', paddingHorizontal: 20, marginBottom: 24 },
  iconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#3E5F44', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#4A7C59', marginBottom: 12 },
  welcomeTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 6 },
  welcomeSubtitle: { fontSize: 15, textAlign: 'center', lineHeight: 22, paddingHorizontal: 20 },
  formContainer: { paddingHorizontal: 20, marginBottom: 12 },
  label: { fontSize: 15, fontWeight: '600', marginBottom: 8, marginTop: 12 },
  inputWrapper: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  textInput: { fontSize: 16 },
  textAreaInput: { fontSize: 16, minHeight: 120 },
  primaryBtn: { borderRadius: 28, marginHorizontal: 20, marginBottom: 24, marginTop: 8, elevation: 12, shadowColor: '#3E5F44', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16 },
  primaryBtnDisabled: { opacity: 0.7 },
  primaryBtnGradient: { paddingVertical: 16, paddingHorizontal: 24, borderRadius: 28, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  primaryBtnText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
});

export default ReportBugScreen;


