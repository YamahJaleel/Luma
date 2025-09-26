import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, Modal, TextInput } from 'react-native';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock user database for search
const mockUsers = [
  { id: 'u1', name: 'Tyler Bradshaw', username: '@tylerb' },
  { id: 'u2', name: 'Sarah Chen', username: '@sarahchen' },
  { id: 'u3', name: 'Mike Johnson', username: '@mikej' },
  { id: 'u4', name: 'Emma Wilson', username: '@emmaw' },
  { id: 'u5', name: 'David Kim', username: '@davidk' },
  { id: 'u6', name: 'Lisa Park', username: '@lisap' },
  { id: 'u7', name: 'Alex Rodriguez', username: '@alexr' },
  { id: 'u8', name: 'Rachel Green', username: '@rachelg' },
];

const MessagesScreen = ({ navigation, route }) => {
  const theme = useTheme();
  const [conversations, setConversations] = useState([]); // Start with empty array instead of mock data
  const [newChatRecipient, setNewChatRecipient] = useState(null);
  const [showSearchModal, setShowSearchModal] = useState(false);
  
  // Load messages from AsyncStorage and create conversations
  const loadMessages = async () => {
    try {
      const messagesData = await AsyncStorage.getItem('messages');
      if (messagesData) {
        const messages = JSON.parse(messagesData);
        
        // Group messages by recipient
        const conversationMap = {};
        messages.forEach(message => {
          const recipientKey = message.recipientId || message.recipient;
          if (!conversationMap[recipientKey]) {
            conversationMap[recipientKey] = {
              id: recipientKey,
              name: message.recipient?.replace(/^u\//i, '') || 'Unknown User',
              lastMessage: message.text,
              time: 'now',
              unread: 0,
            };
          }
        });
        
        // Convert to array and set as conversations (replace instead of merge)
        const messageConversations = Object.values(conversationMap);
        setConversations(messageConversations);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Load messages when screen focuses
  useFocusEffect(
    React.useCallback(() => {
      loadMessages();
    }, [])
  );

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
    // Simulate search delay
    setTimeout(() => {
      const filtered = mockUsers.filter(user => 
        user.name.toLowerCase().startsWith(query.toLowerCase()) ||
        user.username.toLowerCase().startsWith(query.toLowerCase())
      );
      setSearchResults(filtered);
      setIsSearching(false);
    }, 300);
  };

  const handleUserSelect = (user) => {
    setShowSearchModal(false);
    setSearchQuery('');
    setSearchResults([]);
    
    // Create a new conversation
    const newConversation = {
      id: `new-${Date.now()}`,
      name: user.name,
      lastMessage: 'Start a conversation...',
      time: 'now',
      unread: 0,
    };
    
    setConversations(prev => [newConversation, ...prev]);
    
    // Navigate to the new conversation
    navigation.navigate('MessageThread', { conversation: newConversation });
  };

  const handleStartNewChat = () => {
    if (newChatRecipient) {
      // Create a new conversation
      const newConversation = {
        id: `new-${Date.now()}`,
        name: newChatRecipient.name,
        lastMessage: 'Start a conversation...',
        time: 'now',
        unread: 0,
      };
      
      setConversations(prev => [newConversation, ...prev]);
      
      // Navigate to the new conversation
      navigation.navigate('MessageThread', { conversation: newConversation });
      
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
    <TouchableOpacity style={[styles.row, { backgroundColor: theme.colors.surface }]} onPress={() => navigation.navigate('MessageThread', { conversation: item })}>
      <View style={styles.rowText}>
        <Text style={[styles.name, { color: theme.colors.text }]} numberOfLines={1}>{item.name}</Text>
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
          <TouchableOpacity 
            style={styles.robotButton}
            onPress={() => navigation.navigate('LumaAI')}
          >
            <AntDesign name="robot" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
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

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={handleStartNewChat}
      >
        <Ionicons name="add" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      {/* User Search Modal */}
      <Modal 
        visible={showSearchModal} 
        transparent 
        animationType="slide"
        onRequestClose={() => setShowSearchModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.searchModal, { backgroundColor: theme.colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>New Message</Text>
              <TouchableOpacity onPress={() => setShowSearchModal(false)}>
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
  robotButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(62, 95, 68, 0.1)',
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
  name: { fontSize: 17, fontWeight: 'bold' },
  preview: { fontSize: 14, color: '#6B7280' },
  meta: { alignItems: 'flex-end' },
  time: { fontSize: 13, color: '#9CA3AF', marginBottom: 4 },
  badge: { minWidth: 20, height: 20, borderRadius: 10, backgroundColor: '#EF4444', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  badgeText: { color: 'white', fontSize: 13, fontWeight: 'bold' },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
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