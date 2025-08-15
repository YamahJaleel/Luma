import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, Modal, TextInput } from 'react-native';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

const mockConversations = [
  { id: 'c1', name: 'Tyler Bradshaw', lastMessage: 'See you at 6?', time: '2m', unread: 2, avatarColor: '#3E5F44' },
  { id: 'c2', name: 'Sarah Chen', lastMessage: 'Thanks for the advice!', time: '15m', unread: 0, avatarColor: '#8B5CF6' },
  { id: 'c3', name: 'Mike Johnson', lastMessage: 'Sent you the link', time: '1h', unread: 1, avatarColor: '#10B981' },
  { id: 'c4', name: 'Emma Wilson', lastMessage: 'Let\'s catch up soon', time: '3h', unread: 0, avatarColor: '#F59E0B' },
];

// Mock user database for search
const mockUsers = [
  { id: 'u1', name: 'Tyler Bradshaw', username: '@tylerb', avatarColor: '#3E5F44' },
  { id: 'u2', name: 'Sarah Chen', username: '@sarahchen', avatarColor: '#8B5CF6' },
  { id: 'u3', name: 'Mike Johnson', username: '@mikej', avatarColor: '#10B981' },
  { id: 'u4', name: 'Emma Wilson', username: '@emmaw', avatarColor: '#F59E0B' },
  { id: 'u5', name: 'David Kim', username: '@davidk', avatarColor: '#EF4444' },
  { id: 'u6', name: 'Lisa Park', username: '@lisap', avatarColor: '#8B5CF6' },
  { id: 'u7', name: 'Alex Rodriguez', username: '@alexr', avatarColor: '#3B82F6' },
  { id: 'u8', name: 'Rachel Green', username: '@rachelg', avatarColor: '#10B981' },
];

const MessagesScreen = ({ navigation, route }) => {
  const theme = useTheme();
  const [conversations, setConversations] = useState(mockConversations);
  const [newChatRecipient, setNewChatRecipient] = useState(null);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Handle new chat creation from comment long-press
  useFocusEffect(
    React.useCallback(() => {
      const params = route?.params || {};
      if (params.startNewChat && params.recipient) {
        setNewChatRecipient({
          name: params.recipient,
          id: params.recipientId,
          avatarColor: '#3E5F44', // Default color
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
        user.name.toLowerCase().includes(query.toLowerCase()) ||
        user.username.toLowerCase().includes(query.toLowerCase())
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
      avatarColor: user.avatarColor,
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
        avatarColor: newChatRecipient.avatarColor,
      };
      
      setConversations(prev => [newConversation, ...prev]);
      setNewChatRecipient(null);
      
      // Navigate to the new conversation
      navigation.navigate('MessageThread', { conversation: newConversation });
    } else {
      // Show the search modal
      setShowSearchModal(true);
    }
  };

  const renderUserItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.userRow, { backgroundColor: theme.colors.surface }]} 
      onPress={() => handleUserSelect(item)}
    >
      <View style={[styles.userAvatar, { backgroundColor: item.avatarColor }]}>
        <Text style={styles.userAvatarInitial}>{item.name.charAt(0)}</Text>
      </View>
      <View style={styles.userInfo}>
        <Text style={[styles.userName, { color: theme.colors.text }]}>{item.name}</Text>
        <Text style={[styles.userUsername, { color: theme.colors.placeholder }]}>{item.username}</Text>
      </View>
      <Ionicons name="chatbubble-outline" size={20} color={theme.colors.primary} />
    </TouchableOpacity>
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity style={[styles.row, { backgroundColor: theme.colors.surface }]} onPress={() => navigation.navigate('MessageThread', { conversation: item })}>
      <View style={[styles.avatar, { backgroundColor: item.avatarColor }]}>
        <Text style={styles.avatarInitial}>{item.name.charAt(0)}</Text>
      </View>
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
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
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
              keyExtractor={(item) => item.id}
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
    fontSize: 14, 
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
    fontSize: 12,
    fontWeight: '600',
  },
  list: { paddingHorizontal: 16, paddingBottom: 16 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarInitial: { color: 'white', fontWeight: '700' },
  rowText: { flex: 1 },
  name: { fontSize: 16, fontWeight: '700' },
  preview: { fontSize: 13, color: '#6B7280' },
  meta: { alignItems: 'flex-end' },
  time: { fontSize: 12, color: '#9CA3AF', marginBottom: 4 },
  badge: { minWidth: 20, height: 20, borderRadius: 10, backgroundColor: '#EF4444', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  badgeText: { color: 'white', fontSize: 12, fontWeight: '700' },
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
    backgroundColor: 'rgba(0,0,0,0.5)',
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
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
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
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  userAvatarInitial: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
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
    fontSize: 16,
    textAlign: 'center',
  },
});

export default MessagesScreen; 