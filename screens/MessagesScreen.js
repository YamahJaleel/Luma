import React, { useMemo, useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, Modal, TextInput } from 'react-native';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFirebase } from '../contexts/FirebaseContext';
import { realtimeService } from '../services/firebaseService';
import { db } from '../config/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { matchesSearch } from '../utils/normalization';

// Note: Search only real users from Firestore (no mock users)

const MessagesScreen = ({ navigation, route }) => {
  const theme = useTheme();
  const { user } = useFirebase();
  const [conversations, setConversations] = useState([]); // Start with empty array instead of mock data
  const [newChatRecipient, setNewChatRecipient] = useState(null);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [viewedConversations, setViewedConversations] = useState(new Set());

  // Real-time conversations from Firestore
  useEffect(() => {
    if (!user?.uid) {
      setConversations([]);
      return;
    }
    const unsubscribe = realtimeService.listenToConversations(user.uid, setConversations);
    return unsubscribe;
  }, [user?.uid]);

  // Track previous messages to detect new ones
  const prevMessagesRef = useRef(new Map());

  // Clear viewed status when a new message arrives from someone else
  useEffect(() => {
    conversations.forEach(conversation => {
      const lastMessageNotFromYou = conversation.lastMessage && !conversation.lastMessage.startsWith('You:');
      const previousMessage = prevMessagesRef.current.get(conversation.id);
      
      // Check if message actually changed
      const messageChanged = previousMessage !== conversation.lastMessage;
      
      if (lastMessageNotFromYou && messageChanged && viewedConversations.has(conversation.id)) {
        // New message arrived from other person, clear viewed status
        setViewedConversations(prev => {
          const newSet = new Set(prev);
          newSet.delete(conversation.id);
          return newSet;
        });
      }
      
      // Update previous message
      prevMessagesRef.current.set(conversation.id, conversation.lastMessage);
    });
  }, [conversations, viewedConversations]);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTimer, setSearchTimer] = useState(null);

  // Keep new chat banner behavior when arriving from other screens

  // Handle new chat creation from comment long-press
  useFocusEffect(
    React.useCallback(() => {
      const params = route?.params || {};
      if (params.startNewChat && params.recipient) {
        setNewChatRecipient({
          name: params.recipient,
          id: params.recipientId,
        });
        
        // Clear the params to avoid re-triggering
        navigation.setParams({ startNewChat: undefined, recipient: undefined, recipientId: undefined });
      }
    }, [route?.params])
  );

  const handleSearchUsers = (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    if (searchTimer) clearTimeout(searchTimer);
    const timer = setTimeout(async () => {
      try {
        // Only search userProfiles (users), not profiles
        let merged = [];
        try {
          const upSnap = await getDocs(collection(db, 'userProfiles'));
          merged = upSnap.docs.map(d => {
            const data = d.data();
            return {
              id: d.id || data?.userId,
              name: data?.displayName || data?.name || data?.email || 'User',
              username: data?.displayName || data?.name || '',
              email: data?.email || ''
            };
          });
        } catch (e) {
          console.log('❌ Error fetching userProfiles:', e);
          merged = [];
        }

        // Deduplicate and exclude current user
        const seen = new Set();
        const qLower = query.toLowerCase();
        const filtered = merged
          .filter(u => {
            if (!u?.id) return false;
            if (user?.uid && u.id === user.uid) return false;
            const key = u.id;
            if (seen.has(key)) return false;
            
            // Search both name and displayName
            const match = matchesSearch(query, u.name) || matchesSearch(query, u.displayName);
            
            if (match) seen.add(key);
            return match;
          })
          .slice(0, 25);

        setSearchResults(filtered);
      } catch (e) {
        console.log('User search failed:', e);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    setSearchTimer(timer);
  };

  const handleUserSelect = (user) => {
    setShowSearchModal(false);
    setSearchQuery('');
    setSearchResults([]);
    
    // Navigate to the conversation (which will create the first message when user sends)
    const conversation = {
      id: user.id,
      name: user.name,
      lastMessage: 'Start a conversation...',
      time: new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      }),
      unread: 0,
    };
    
    // Don't add to conversations list - they will appear naturally when they send a message
    navigation.navigate('MessageThread', { 
      conversation,
      onMarkViewed: (conversationId) => {
        setViewedConversations(prev => new Set(prev).add(conversationId));
      }
    });
  };

  const handleStartNewChat = () => {
    if (newChatRecipient) {
      // Create a new conversation
      const newConversation = {
        id: newChatRecipient.id,
        name: newChatRecipient.name,
        lastMessage: 'Start a conversation...',
        time: 'now',
        unread: 0,
      };
      
      // Don't add to conversations list - they will appear naturally when they send a message
      
      // Navigate to the new conversation
      navigation.navigate('MessageThread', { 
        conversation: newConversation,
        onMarkViewed: (conversationId) => {
          setViewedConversations(prev => new Set(prev).add(conversationId));
        }
      });
      
      // Clear the recipient
      setNewChatRecipient(null);
    } else {
      setShowSearchModal(true);
    }
  };

  const renderUserItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.userRow, { backgroundColor: theme.colors.surface }]} 
      onPress={() => handleUserSelect(item)}
    >
      <View style={styles.userInfo}>
        <Text style={[styles.userName, { color: theme.colors.text }]}>{item.name}</Text>
        <Text style={[styles.userUsername, { color: theme.colors.placeholder }]}>{item.username}</Text>
      </View>
      <Ionicons name="chatbubble-outline" size={20} color={theme.colors.primary} />
    </TouchableOpacity>
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.row, { backgroundColor: theme.colors.surface }]} 
      onPress={() => {
        // Mark conversation as viewed
        setViewedConversations(prev => new Set(prev).add(item.id));
        navigation.navigate('MessageThread', { 
          conversation: item,
          onMarkViewed: (conversationId) => {
            setViewedConversations(prev => new Set(prev).add(conversationId));
          }
        });
      }}
    >
      <View style={styles.rowText}>
          <View style={styles.nameContainer}>
            <Text style={[styles.name, { color: theme.colors.text }]} numberOfLines={1}>{item.name}</Text>
            {/* Show red dot if last message is not from you and conversation hasn't been viewed yet */}
            {item.lastMessage && !item.lastMessage.startsWith('You:') && !viewedConversations.has(item.id) && (
              <View style={styles.redDot} />
            )}
          </View>
        <Text style={styles.preview} numberOfLines={1}>{item.lastMessage}</Text>
      </View>
      <View style={styles.meta}>
        <Text style={styles.time}>{item.time}</Text>
        {item.unread > 0 && (
          <View style={styles.badge}><Text style={styles.badgeText}>{item.unread}</Text></View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Messages</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity 
              style={[styles.addBtn, { backgroundColor: theme.colors.surface }]}
              onPress={handleStartNewChat}
            >
              <Ionicons name="add" size={22} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {newChatRecipient && (
        <View style={[styles.newChatBanner, { backgroundColor: theme.colors.primary }]}>
          <Text style={styles.newChatText}>New chat with {newChatRecipient.name}</Text>
          <TouchableOpacity style={styles.startChatButton} onPress={handleStartNewChat}>
            <Text style={styles.startChatButtonText}>Start Chat</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={conversations}
        renderItem={renderItem}
        keyExtractor={(item, index) => item.id || `conversation-${index}`}
        contentContainerStyle={styles.list}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={64} color={theme.colors.placeholder} />
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No Messages Yet</Text>
            <Text style={[styles.emptySubtitle, { color: theme.colors.placeholder }]}>
              Start a conversation by tapping the + button
            </Text>
          </View>
        )}
      />


      {/* User Search Modal */}
      <Modal 
        visible={showSearchModal} 
        transparent 
        animationType="slide"
        onRequestClose={() => {
          setShowSearchModal(false);
          setSearchQuery('');
          setSearchResults([]);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.searchModal, { backgroundColor: theme.colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>New Message</Text>
              <TouchableOpacity onPress={() => {
                setShowSearchModal(false);
                setSearchQuery('');
                setSearchResults([]);
              }}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.searchContainer}>
              <TextInput
                style={[styles.searchInput, { 
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.text,
                  borderColor: theme.colors.primary 
                }]}
                placeholder="Search for a user..."
                placeholderTextColor={theme.colors.placeholder}
                value={searchQuery}
                onChangeText={handleSearchUsers}
                autoFocus
              />
            </View>

            <FlatList
              data={searchResults}
              renderItem={renderUserItem}
              keyExtractor={(item, index) => item.id || `conversation-${index}`}
              contentContainerStyle={styles.searchResultsList}
              ListEmptyComponent={() => (
                <View style={styles.emptySearch}>
                  {isSearching ? (
                    <Text style={[styles.emptyText, { color: theme.colors.placeholder }]}>Searching...</Text>
                  ) : searchQuery.trim() !== '' ? (
                    <Text style={[styles.emptyText, { color: theme.colors.placeholder }]}>No user found</Text>
                  ) : (
                    <Text style={[styles.emptyText, { color: theme.colors.placeholder }]}>Start typing to search for users</Text>
                  )}
                </View>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, paddingTop: 60 },
  headerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { fontSize: 28, fontWeight: 'bold' },
  headerButtons: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  newChatBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  newChatText: { 
    color: '#FFFFFF', 
    fontSize: 15, 
    fontWeight: '600',
    flex: 1 
  },
  startChatButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  startChatButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  list: { paddingHorizontal: 16, paddingBottom: 16 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  rowText: { flex: 1 },
  nameContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { fontSize: 17, fontWeight: 'bold' },
  redDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  preview: { fontSize: 14, color: '#6B7280' },
  meta: { alignItems: 'flex-end' },
  time: { fontSize: 13, color: '#9CA3AF', marginBottom: 4 },
  badge: { minWidth: 20, height: 20, borderRadius: 10, backgroundColor: '#EF4444', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  badgeText: { color: 'white', fontSize: 13, fontWeight: 'bold' },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  searchModal: {
    flex: 1,
    marginTop: 100,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  searchContainer: {
    padding: 20,
    paddingBottom: 10,
  },
  searchLabel: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 8,
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
  },
  searchResultsList: {
    paddingHorizontal: 20,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 2,
  },
  userUsername: {
    fontSize: 14,
  },
  emptySearch: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});

export default MessagesScreen; 