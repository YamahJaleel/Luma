import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, Linking, ScrollView } from 'react-native';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

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
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Report a Bug</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={[styles.label, { color: theme.colors.text }]}>Bug Title</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Short summary"
          placeholderTextColor={theme.colors.placeholder}
          style={[styles.input, { color: theme.colors.text, backgroundColor: theme.colors.surface }]}
        />

        <Text style={[styles.label, { color: theme.colors.text }]}>Steps to Reproduce</Text>
        <TextInput
          value={steps}
          onChangeText={setSteps}
          placeholder="1) ...\n2) ...\n3) ..."
          placeholderTextColor={theme.colors.placeholder}
          style={[styles.textarea, { color: theme.colors.text, backgroundColor: theme.colors.surface }]}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />

        <Text style={[styles.label, { color: theme.colors.text }]}>Expected Result</Text>
        <TextInput
          value={expected}
          onChangeText={setExpected}
          placeholder="What you expected to happen"
          placeholderTextColor={theme.colors.placeholder}
          style={[styles.textarea, { color: theme.colors.text, backgroundColor: theme.colors.surface }]}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        <Text style={[styles.label, { color: theme.colors.text }]}>Actual Result</Text>
        <TextInput
          value={actual}
          onChangeText={setActual}
          placeholder="What actually happened"
          placeholderTextColor={theme.colors.placeholder}
          style={[styles.textarea, { color: theme.colors.text, backgroundColor: theme.colors.surface }]}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        <TouchableOpacity
          style={[styles.sendBtn, { backgroundColor: canSend ? theme.colors.primary : '#A0AEC0' }]}
          onPress={sendEmail}
          disabled={!canSend}
        >
          <Ionicons name="send" size={18} color="#FFFFFF" />
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 56 },
  headerTitle: { fontSize: 19, fontWeight: 'bold' },
  backBtn: { padding: 6 },
  content: { padding: 16 },
  label: { fontSize: 15, fontWeight: '600', marginBottom: 8, marginTop: 12 },
  input: { borderRadius: 10, borderWidth: 1, borderColor: '#E5E7EB', paddingHorizontal: 12, paddingVertical: 10 },
  textarea: { borderRadius: 10, borderWidth: 1, borderColor: '#E5E7EB', paddingHorizontal: 12, paddingVertical: 10, minHeight: 120 },
  sendBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 10, paddingVertical: 12, gap: 8, marginTop: 16 },
  sendText: { color: '#FFFFFF', fontWeight: '700' },
});

export default ReportBugScreen;


