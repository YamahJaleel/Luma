import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TypingIndicator from '../components/TypingIndicator';

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
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const listRef = useRef(null);
  const inputRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [autoReplyTimeout, setAutoReplyTimeout] = useState(null);


  const sendAutoReply = async () => {
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
    
    const newMessage = {
      id: `msg-${Date.now()}`,
      from: 'them',
      text: 'Sounds great!',
      time: time,
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    // Save to AsyncStorage
    try {
      const messagesData = await AsyncStorage.getItem('messages');
      const messages = messagesData ? JSON.parse(messagesData) : [];
      messages.push({
        ...newMessage,
        recipientId: conversation?.id || conversation?.name,
        recipient: conversation?.name,
        sender: 'Crystal',
        timestamp: now.toISOString(),
      });
      await AsyncStorage.setItem('messages', JSON.stringify(messages));
    } catch (error) {
      console.error('Error saving message:', error);
    }
    
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  };

  // Load messages from AsyncStorage for this conversation
  const loadMessages = async () => {
    try {
      const messagesData = await AsyncStorage.getItem('messages');
      if (messagesData) {
        const allMessages = JSON.parse(messagesData);
        
        // Filter messages for this conversation
        const conversationMessages = allMessages.filter(message => 
          message.recipientId === conversation.id || 
          message.recipient === conversation.name ||
          message.senderId === conversation.id
        );
        
        // Convert to the format expected by the UI
        const formattedMessages = conversationMessages.map(message => {
          let time = 'Now';
          try {
            if (message.timestamp) {
              const date = new Date(message.timestamp);
              if (!isNaN(date.getTime())) {
                time = date.toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  hour12: true 
                });
              }
            }
          } catch (error) {
            console.log('Error parsing timestamp:', error);
          }
          
          return {
            id: message.id,
            from: message.sender === 'Luma User' ? 'me' : 'them',
            text: message.text,
            time: time
          };
        });
        
        setMessages(formattedMessages);
      } else {
        // If no messages, show empty array instead of mock data
        setMessages([]);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      setMessages([]);
    }
  };

  useEffect(() => {
    loadMessages();
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    
    // Cleanup timeouts on unmount
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
      if (autoReplyTimeout) {
        clearTimeout(autoReplyTimeout);
      }
    };
  }, [conversation]);

  const send = async () => {
    const text = draft.trim();
    if (!text) return;
    
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
    const newMessage = { id: `${Date.now()}`, from: 'me', text, time };
    
    // Add to local state immediately for UI responsiveness
    setMessages((prev) => [...prev, newMessage]);
    setDraft('');
    inputRef.current?.clear();
    
    // Save to AsyncStorage
    try {
      const existingMessages = await AsyncStorage.getItem('messages');
      const messages = existingMessages ? JSON.parse(existingMessages) : [];
      
      const messageToSave = {
        id: newMessage.id,
        recipient: conversation.name,
        recipientId: conversation.id,
        text: text,
        timestamp: now.toISOString(),
        sender: 'Luma User',
        senderId: 'current_user',
      };
      
      messages.push(messageToSave);
      await AsyncStorage.setItem('messages', JSON.stringify(messages));
    } catch (error) {
      console.error('Error saving message:', error);
    }
    
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 0);
    
    // Auto-reply for Test chat
    if (conversation?.name === 'Test') {
      setTimeout(() => {
        simulateOtherPersonTyping();
        setTimeout(() => {
          sendAutoReply();
        }, 3000);
      }, 1000);
    }
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
        keyExtractor={(item, index) => item.id || `message-${index}`}
        contentContainerStyle={styles.thread}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        ListFooterComponent={() => (
          isTyping ? (
            <View style={[styles.bubbleRow, { justifyContent: 'flex-start' }]}>
              <View style={[styles.bubble, styles.bubbleThem, { backgroundColor: theme.colors.surface }]}>
                <View style={styles.typingDotsContainer}>
                  <TypingIndicator />
                </View>
              </View>
            </View>
          ) : null
        )}
      />

      <View style={[styles.inputBar, { backgroundColor: theme.colors.surface }]}> 
        <TextInput
          ref={inputRef}
          style={[styles.input, { color: theme.colors.text }]}
          placeholder="Message..."
          placeholderTextColor={theme.colors.placeholder}
          value={draft}
          onChangeText={setDraft}
          multiline
          maxLength={500}
        />
        <TouchableOpacity style={[styles.sendBtn, { backgroundColor: theme.colors.primary }]} onPress={send}>
          <Ionicons name="send" size={20} color="#FFFFFF" />
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
  clearButton: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 19, fontWeight: 'bold', maxWidth: '70%' },
  thread: { padding: 12 },
  bubbleRow: { flexDirection: 'row', marginVertical: 4 },
  bubble: { maxWidth: '80%', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 8 },
  bubbleMe: { borderTopRightRadius: 4 },
  bubbleThem: { borderTopLeftRadius: 4, borderWidth: 1, borderColor: '#E5E7EB' },
  bubbleText: { fontSize: 14 },
  bubbleTime: { fontSize: 11, marginTop: 4, textAlign: 'right' },
  inputBar: { 
    flexDirection: 'row', 
    alignItems: 'flex-end', 
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  input: { 
    flex: 1, 
    borderWidth: 1, 
    borderColor: 'rgba(0,0,0,0.2)', 
    borderRadius: 20, 
    paddingHorizontal: 16, 
    paddingVertical: 12, 
    marginRight: 12, 
    fontSize: 16, 
    maxHeight: 100,
  },
  sendBtn: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    alignItems: 'center', 
    justifyContent: 'center',
  },
  typingDotsContainer: {
    paddingVertical: 1,
    paddingHorizontal: 0,
    minHeight: 12,
  },
});

export default MessageThreadScreen; 