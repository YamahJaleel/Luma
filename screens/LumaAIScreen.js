import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTabContext } from '../components/TabContext';
import { useFocusEffect } from '@react-navigation/native';
import TypingIndicator from '../components/TypingIndicator';
import axios from 'axios';

const LumaAIScreen = ({ navigation }) => {
  const theme = useTheme();
  const { setTabHidden } = useTabContext();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef(null);

  const BACKEND_URL = 'https://proxyyyyyyy.onrender.com/chat';

  // Format messages into Gemini-compatible format
  const formatConversation = (messages) => {
    return messages.map((msg) => ({
      role: msg.sender === "user" ? "user" : "model",
      parts: [{ text: msg.text }],
    }));
  };

  // Clean up markdown formatting from AI responses
  const cleanResponse = (text) => {
    return text
      .replace(/\*\*/g, '') // Remove ** bold markers
      .replace(/\*/g, '') // Remove * italic markers
      .replace(/#{1,6}\s/g, '') // Remove # headers
      .replace(/`/g, '') // Remove ` code markers
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Convert [text](url) to just text
      .trim();
  };

  // Send conversation with truncation (to save tokens)
  const sendConversation = async (messages) => {
    // Keep only the last 4 messages (2 user + 2 bot)
    const recentMessages = messages.slice(-4);
    const contents = formatConversation(recentMessages);

    try {
      const res = await axios.post(BACKEND_URL, { contents });
      return cleanResponse(res.data.reply);
    } catch (err) {
      console.error("Error:", err.response?.data || err.message);
      return "Error talking to the bot.";
    }
  };

  // Load conversation history from AsyncStorage
  const loadConversationHistory = async () => {
    try {
      const savedMessages = await AsyncStorage.getItem('lumaAI_messages');
      if (savedMessages) {
        const parsedMessages = JSON.parse(savedMessages);
        setMessages(parsedMessages);
      } else {
        // Initialize with welcome message if no history
        const welcomeMessage = {
          id: 'welcome-1',
          text: "Welcome to Luma AI! 🤖✨ I'm here to help you navigate the world of dating, relationships, and personal growth. I'm here to listen and provide thoughtful guidance. What's on your mind today?",
          sender: 'model',
          timestamp: new Date().toISOString(),
        };
        setMessages([welcomeMessage]);
      }
    } catch (error) {
      console.error('Error loading conversation history:', error);
      // Fallback to welcome message
      const welcomeMessage = {
        id: 'welcome-1',
        text: "Welcome to Luma AI! 🤖✨ I'm here to help you navigate the world of dating, relationships, and personal growth. I'm here to listen and provide thoughtful guidance. What's on your mind today?",
          sender: 'model',
        timestamp: new Date().toISOString(),
      };
      setMessages([welcomeMessage]);
    }
  };

  // Save conversation history to AsyncStorage
  const saveConversationHistory = async (messagesToSave) => {
    try {
      await AsyncStorage.setItem('lumaAI_messages', JSON.stringify(messagesToSave));
    } catch (error) {
      console.error('Error saving conversation history:', error);
    }
  };

  // Clear chat for development
  const clearChat = async () => {
    try {
      await AsyncStorage.removeItem('lumaAI_messages');
      const welcomeMessage = {
        id: 'welcome-1',
        text: "Welcome to Luma AI! 🤖✨ I'm here to help you navigate the world of dating, relationships, and personal growth. I'm here to listen and provide thoughtful guidance. What's on your mind today?",
          sender: 'model',
        timestamp: new Date().toISOString(),
      };
      setMessages([welcomeMessage]);
    } catch (error) {
      console.error('Error clearing chat:', error);
    }
  };

  // Hide tab bar when screen is focused, show when unfocused
  useFocusEffect(
    React.useCallback(() => {
      setTabHidden(true);
      return () => setTabHidden(false);
    }, [setTabHidden])
  );

  // Load conversation history on component mount
  useEffect(() => {
    // For development: clear old welcome message and load fresh
    // Remove this in production
    AsyncStorage.removeItem('lumaAI_messages').then(() => {
      loadConversationHistory();
    });
  }, []);

  // Save conversation history whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      saveConversationHistory(messages);
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date().toISOString(),
    };

    // Add user message immediately
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputText('');
    setIsLoading(true);
    setIsTyping(true);
    
    // Scroll to bottom after user message
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      // Use the exact sendConversation function from your working code
      const aiReply = await sendConversation(updatedMessages);
      
      // Add AI response
      const aiResponse = {
        id: `ai-${Date.now()}`,
        text: aiReply,
        sender: 'model',
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, aiResponse]);
      
      // Scroll to bottom after AI response
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
      
    } catch (error) {
      console.error('Error calling AI API:', error);
      
      // Add error message
      const errorResponse = {
        id: `error-${Date.now()}`,
        text: "I'm sorry, I'm having trouble connecting right now. Please check your internet connection and try again.",
        sender: 'model',
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, errorResponse]);
      
      // Show alert for user feedback
      Alert.alert(
        'Connection Error',
        'Failed to connect to Luma AI. Please check your internet connection.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const renderMessage = ({ item }) => (
    <View style={[
      styles.messageContainer,
      item.sender === 'model' ? styles.aiMessage : styles.userMessage
    ]}>
      <View style={[
        styles.messageBubble,
        item.sender === 'model' ? styles.aiBubble : styles.userBubble,
        { backgroundColor: item.sender === 'model' ? theme.colors.surface : theme.colors.primary }
      ]}>
        <Text style={[
          styles.messageText,
          { color: item.sender === 'model' ? theme.colors.text : '#FFFFFF' }
        ]}>
          {item.text}
        </Text>
      </View>
    </View>
  );

  const renderTypingIndicator = () => (
    <View style={[styles.messageContainer, styles.aiMessage]}>
      <View style={[
        styles.messageBubble,
        styles.aiBubble,
        { backgroundColor: theme.colors.surface }
      ]}>
        <View style={styles.typingDotsContainer}>
          <TypingIndicator />
        </View>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <AntDesign name="robot" size={24} color={theme.colors.primary} />
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Luma AI</Text>
        </View>
        <TouchableOpacity 
          style={styles.clearButton}
          onPress={clearChat}
        >
          <Ionicons name="trash-outline" size={24} color="#EF4444" />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListFooterComponent={() => isTyping ? renderTypingIndicator() : null}
      />

      {/* Input */}
      <View style={[styles.inputContainer, { backgroundColor: theme.colors.surface }]}>
        <TextInput
          style={[styles.textInput, { color: theme.colors.text }]}
          placeholder="Ask Luma AI anything..."
          placeholderTextColor={theme.colors.placeholder}
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
          editable={!isLoading}
        />
        <TouchableOpacity 
          style={[
            styles.sendButton, 
            { 
              backgroundColor: isLoading ? theme.colors.placeholder : theme.colors.primary,
              opacity: isLoading ? 0.6 : 1
            }
          ]}
          onPress={sendMessage}
          disabled={!inputText.trim() || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Ionicons 
              name="send" 
              size={20} 
              color={inputText.trim() ? '#FFFFFF' : theme.colors.placeholder} 
            />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  headerSpacer: {
    width: 40,
  },
  clearButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 20,
  },
  messageContainer: {
    marginBottom: 16,
  },
  aiMessage: {
    alignItems: 'flex-start',
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  aiBubble: {
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  textInput: {
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
  sendButton: {
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

export default LumaAIScreen;
