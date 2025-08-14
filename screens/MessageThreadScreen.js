import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

const initialMessages = [
  { id: 'm1', from: 'them', text: 'Hey! How are you?', time: '2:15 PM' },
  { id: 'm2', from: 'me', text: "I'm good, you?", time: '2:16 PM' },
  { id: 'm3', from: 'them', text: 'Doing well. Free this evening?', time: '2:17 PM' },
];

const MessageBubble = ({ message, theme }) => {
  const isMe = message.from === 'me';
  return (
    <View style={[styles.bubbleRow, { justifyContent: isMe ? 'flex-end' : 'flex-start' }]}>
      <View
        style={[
          styles.bubble,
          isMe ? styles.bubbleMe : styles.bubbleThem,
          { backgroundColor: isMe ? theme.colors.primary : theme.colors.surface },
        ]}
      >
        <Text style={[styles.bubbleText, { color: isMe ? 'white' : theme.colors.text }]}>{message.text}</Text>
        <Text style={[styles.bubbleTime, { color: isMe ? '#E6FFFA' : '#9CA3AF' }]}>{message.time}</Text>
      </View>
    </View>
  );
};

const MessageThreadScreen = ({ route, navigation }) => {
  const theme = useTheme();
  const { conversation } = route.params || {};
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState('');
  const listRef = useRef(null);

  useEffect(() => {
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 0);
  }, []);

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [...prev, { id: `${Date.now()}`, from: 'me', text, time }]);
    setDraft('');
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 0);
  };

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: theme.colors.background }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <TouchableOpacity style={[styles.iconButton, { backgroundColor: theme.colors.surface }]} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]} numberOfLines={1}>{conversation?.name || 'Chat'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        renderItem={({ item }) => <MessageBubble message={item} theme={theme} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.thread}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
      />

      <View style={[styles.inputBar, { backgroundColor: theme.colors.surface, borderTopColor: '#E5E7EB' }]}> 
        <TextInput
          style={[styles.input, { color: theme.colors.text }]}
          placeholder="Message..."
          placeholderTextColor={theme.colors.placeholder}
          value={draft}
          onChangeText={setDraft}
          multiline
        />
        <TouchableOpacity style={[styles.sendBtn, { backgroundColor: theme.colors.primary }]} onPress={send}>
          <Ionicons name="send" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      <View style={{ height: 12, backgroundColor: theme.colors.surface }} />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 56 },
  iconButton: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', maxWidth: '70%' },
  thread: { padding: 12 },
  bubbleRow: { flexDirection: 'row', marginVertical: 4 },
  bubble: { maxWidth: '80%', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 8 },
  bubbleMe: { borderTopRightRadius: 4 },
  bubbleThem: { borderTopLeftRadius: 4, borderWidth: 1, borderColor: '#E5E7EB' },
  bubbleText: { fontSize: 14 },
  bubbleTime: { fontSize: 10, marginTop: 4, textAlign: 'right' },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', padding: 10, borderTopWidth: 1 },
  input: { flex: 1, maxHeight: 120, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  sendBtn: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
});

export default MessageThreadScreen; 