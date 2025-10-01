import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, Linking, ScrollView } from 'react-native';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

const EMAIL = 'luma312003@gmail.com';

const SendFeedbackScreen = ({ navigation }) => {
  const theme = useTheme();
  const [category, setCategory] = React.useState('General Feedback');
  const [message, setMessage] = React.useState('');

  const sendEmail = async () => {
    const body = encodeURIComponent(`Category: ${category.trim()}\n\n${message.trim()}`);
    const sub = encodeURIComponent('App Feedback');
    const url = `mailto:${EMAIL}?subject=${sub}&body=${body}`;
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (!canOpen) throw new Error('No mail app available');
      await Linking.openURL(url);
      Alert.alert('Opened Mail', 'Finish sending your feedback in your email app.');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'Could not open your email app.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Send Feedback</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={[styles.label, { color: theme.colors.text }]}>Category</Text>
        <TextInput
          value={category}
          onChangeText={setCategory}
          placeholder="Category (e.g., UI, Performance)"
          placeholderTextColor={theme.colors.placeholder}
          style={[styles.input, { color: theme.colors.text, backgroundColor: theme.colors.surface }]}
        />

        <Text style={[styles.label, { color: theme.colors.text }]}>Feedback</Text>
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Share your feedback"
          placeholderTextColor={theme.colors.placeholder}
          style={[styles.textarea, { color: theme.colors.text, backgroundColor: theme.colors.surface }]}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />

        <TouchableOpacity
          style={[styles.sendBtn, { backgroundColor: message.trim() ? theme.colors.primary : '#A0AEC0' }]}
          onPress={sendEmail}
          disabled={!message.trim()}
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
  textarea: { borderRadius: 10, borderWidth: 1, borderColor: '#E5E7EB', paddingHorizontal: 12, paddingVertical: 10, minHeight: 140 },
  sendBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 10, paddingVertical: 12, gap: 8, marginTop: 16 },
  sendText: { color: '#FFFFFF', fontWeight: '700' },
});

export default SendFeedbackScreen;


