import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TypingIndicator from '../components/TypingIndicator';
import { useFirebase } from '../contexts/FirebaseContext';
import { messageService, realtimeService, typingService, reportService, blockService } from '../services/firebaseService';
import { auth } from '../config/firebase';
import { Alert } from 'react-native';
import encryptionService from '../services/encryptionService';
import { useFocusEffect } from '@react-navigation/native';

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
  const { user } = useFirebase();
  const { conversation, onMarkViewed } = route.params || {};
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const listRef = useRef(null);
  const inputRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [autoReplyTimeout, setAutoReplyTimeout] = useState(null);
  const [threadKey, setThreadKey] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const lastTypingUpdateRef = useRef(0);

  // Mark conversation as viewed when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      if (conversation?.id && onMarkViewed) {
        onMarkViewed(conversation.id);
      }
    }, [conversation?.id, onMarkViewed])
  );

  // Get the other participant's ID (not the current user)
  const getOtherUserId = () => {
    if (!conversation?.participants || !auth.currentUser) return null;
    return conversation.participants.find(id => id !== auth.currentUser.uid);
  };

  const otherUserId = getOtherUserId();

  // Handle report user
  const handleReportUser = () => {
    setShowMenu(false);
    Alert.alert(
      'Report User',
      'Are you sure you want to report this user?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Report', 
          style: 'destructive',
          onPress: async () => {
            try {
              await reportService.submitReport({
                itemType: 'profile',
                itemId: otherUserId,
                itemOwnerId: otherUserId,
                reporterId: auth.currentUser.uid,
                reason: 'inappropriate_content',
                description: `Reported user from messages: ${conversation?.name}`
              });
              // Check for auto-hide
              await reportService.checkAndAutoHide('profile', otherUserId);
              Alert.alert('Report Submitted', 'Thank you for your report. We will review it.');
            } catch (error) {
              console.error('Error reporting user:', error);
              Alert.alert('Error', 'Failed to submit report. Please try again.');
            }
          }
        }
      ]
    );
  };

  // Handle block user
  const handleBlockUser = () => {
    setShowMenu(false);
    Alert.alert(
      'Block User',
      'Are you sure you want to block this user? You won\'t see their messages anymore.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Block', 
          style: 'destructive',
          onPress: async () => {
            try {
              await blockService.blockUser(auth.currentUser.uid, otherUserId);
              Alert.alert('User Blocked', 'This user has been blocked.', [
                { text: 'OK', onPress: () => navigation.goBack() }
              ]);
            } catch (error) {
              console.error('Error blocking user:', error);
              Alert.alert('Error', 'Failed to block user. Please try again.');
            }
          }
        }
      ]
    );
  };


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
  // Subscribe to Firestore thread messages
  useEffect(() => {
    if (!user?.uid || !conversation?.id) {
      setMessages([]);
      return;
    }
    
    // Initialize encryption for the conversation
    (async () => {
      try {
        await encryptionService.initializeUser(user.uid, user.uid); // Use simple init
        await encryptionService.initializeSimple(user.uid);
        console.log('✅ Encryption initialized for user:', user.uid);
      } catch (err) {
        console.warn('⚠️ Encryption initialization failed:', err);
      }
    })();
    
    const participantsSorted = [user.uid, conversation.id].sort();
    const tk = `${participantsSorted[0]}_${participantsSorted[1]}`;
    setThreadKey(tk);
    const unsubscribe = realtimeService.listenToThreadMessages(tk, user.uid, async (docs) => {
      const formatted = await Promise.all(docs.map(async (m) => {
        let time = '';
        try {
          if (m.createdAt?.toDate) {
            const date = m.createdAt.toDate();
            time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
          }
        } catch {}
        
        let text = m.text || '';
        // Decrypt all encrypted messages (both yours and others)
        if (m.isEncrypted) {
          try {
            // For your own messages, use the recipient ID to get the conversation key
            // For others' messages, use the sender ID
            const keyForDecryption = m.senderId === user.uid ? conversation.id : m.senderId;
            const decrypted = await encryptionService.decryptMessage(text, keyForDecryption);
            text = decrypted;
            console.log('✅ Message decrypted:', decrypted);
          } catch (err) {
            console.warn('❌ Failed to decrypt message:', err);
            text = '[Encrypted message - decryption failed]';
          }
        }
        // For your own messages: if it's encrypted but you sent it, 
        // it will show the encrypted text until we find the local version
        // The issue is that your messages get replaced by encrypted ones
        
        return {
          id: m.id,
          from: m.senderId === user.uid ? 'me' : 'them',
          text,
          time
        };
      }));
      
      setMessages((prev) => {
        // On initial load (prev is empty), include all messages from Firestore
        if (prev.length === 0) {
          return formatted;
        }
        
        // Filter out local messages that have been synced to Firestore (by checking text match)
        // Keep only truly new local messages (just sent, not yet in Firestore)
        const firestoreTexts = new Set(formatted.map(m => m.text));
        const newLocalMessages = prev.filter(m => {
          if (m.from === 'me') {
            // Only keep if this text isn't in Firestore yet
            return !firestoreTexts.has(m.text);
          }
          return false; // Remove old local messages from others
        });
        
        // Combine new local messages with Firestore messages
        const firestoreIds = new Set(formatted.map(m => m.id));
        const combined = [
          ...newLocalMessages.filter(m => !firestoreIds.has(m.id)), // Local messages not in Firestore
          ...formatted // All Firestore messages
        ];
        
        // Remove duplicates by text and timestamp
        const seen = new Map();
        return combined.filter(m => {
          const key = `${m.text}_${m.time}`;
          if (seen.has(key)) return false;
          seen.set(key, true);
          return true;
        });
      });
      
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
    });

    // mark all as read when opening
    messageService.markThreadRead(tk, user.uid);

    return () => {
      unsubscribe && unsubscribe();
      if (typingTimeout) clearTimeout(typingTimeout);
      if (autoReplyTimeout) clearTimeout(autoReplyTimeout);
    };
  }, [user?.uid, conversation?.id]);

  // Listen to typing indicator from other user
  useEffect(() => {
    if (!threadKey || !user?.uid) return;
    const unsubTyping = realtimeService.listenToTyping(threadKey, (data) => {
      const otherTyping = Object.keys(data || {}).some(uid => uid !== user.uid && data[uid] === true);
      setIsTyping(otherTyping);
    });
    return () => unsubTyping && unsubTyping();
  }, [threadKey, user?.uid]);

  const send = async () => {
    const text = draft.trim();
    if (!text) return;
    
    // Clear the input FIRST, before anything else
    setDraft('');
    
    // Also clear the ref to ensure the input clears
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.setNativeProps({ text: '' });
      }
    }, 0);
    
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
    const newMessage = { id: `${Date.now()}`, from: 'me', text, time };
    
    // Add to local state immediately for UI responsiveness
    setMessages((prev) => [...prev, newMessage]);
    
    // Persist to Firestore
    try {
      if (!user?.uid || !conversation?.id) return;
      const participantsSorted = [user.uid, conversation.id].sort();
      const tk = `${participantsSorted[0]}_${participantsSorted[1]}`;
      await messageService.createMessage({
        text,
        senderId: user.uid,
        sender: user.displayName || 'Anonymous',
        recipientId: conversation.id,
        recipient: conversation.name,
        participants: [user.uid, conversation.id],
        threadKey: tk
      });
      // mark read immediately for sent messages (clear own unread if any lingering)
      await messageService.markThreadRead(tk, user.uid);
    } catch (error) {
      console.error('Error sending message:', error);
    }
    
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 0);
    
    // Optional: remove auto-reply simulation when using Firestore
  };

  // Publish typing status when user types (throttled to reduce Firebase writes)
  const onChangeDraft = (text) => {
    setDraft(text);
    if (!threadKey || !user?.uid) return;
    
    const now = Date.now();
    // Only update Firebase at most once per 2 seconds while typing
    if (now - lastTypingUpdateRef.current > 2000) {
      typingService.setTyping(threadKey, user.uid, true);
      lastTypingUpdateRef.current = now;
    }
    
    if (typingTimeout) clearTimeout(typingTimeout);
    const t = setTimeout(() => {
      typingService.setTyping(threadKey, user.uid, false);
    }, 1200);
    setTypingTimeout(t);
  };

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: theme.colors.background }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <TouchableOpacity style={[styles.iconButton, { backgroundColor: theme.colors.surface }]} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text, flex: 1 }]} numberOfLines={1}>{conversation?.name || 'Chat'}</Text>
          <TouchableOpacity 
            style={styles.postThreeDotsButton}
            onPress={() => setShowMenu(!showMenu)}
          >
            <Ionicons name="ellipsis-vertical" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
        
        {showMenu && (
          <>
            <TouchableOpacity 
              style={styles.fullScreenOverlay}
              onPress={() => setShowMenu(false)}
              activeOpacity={1}
            />
            <View style={[styles.menuContainer, { backgroundColor: theme.colors.surface, borderColor: '#E5E7EB' }]}>
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={handleReportUser}
              >
                <Ionicons name="flag-outline" size={16} color={theme.colors.primary} />
                <Text style={[styles.menuItemText, { color: theme.colors.text, marginLeft: 8 }]}>Report</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={handleBlockUser}
              >
                <Ionicons name="person-remove-outline" size={16} color="#EF4444" />
                <Text style={[styles.menuItemText, { color: '#EF4444', marginLeft: 8 }]}>Block</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
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
          onChangeText={onChangeDraft}
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
  headerContainer: { position: 'relative', zIndex: 10 },
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
  postThreeDotsButton: {
    padding: 4,
    borderRadius: 4,
  },
  fullScreenOverlay: {
    position: 'absolute',
    top: -1000,
    left: -1000,
    right: -1000,
    bottom: -1000,
    zIndex: 1000,
    backgroundColor: 'transparent',
  },
  menuContainer: {
    position: 'absolute',
    top: 60,
    right: 16,
    borderRadius: 8,
    borderWidth: 1,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 1001,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default MessageThreadScreen; 