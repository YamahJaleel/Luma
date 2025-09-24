import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Animated,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

const getTypeMeta = (type) => {
  const types = {
    'dating-advice': { label: 'Dating Advice', icon: 'heart', color: '#EF4444' },
    'safety-tips': { label: 'Safety Tips', icon: 'shield-checkmark', color: '#10B981' },
    'meetup-ideas': { label: 'Meetup Ideas', icon: 'location', color: '#3B82F6' },
    'red-flags': { label: 'Red Flags', icon: 'warning', color: '#F59E0B' },
    'success-stories': { label: 'Success Stories', icon: 'star', color: '#8B5CF6' },
  };
  return types[type] || { label: 'General', icon: 'chatbubble', color: '#6B7280' };
};

const makeMockComments = () => ([
  {
    id: 1,
    author: 'Alex R.',
    avatarColor: '#3E5F44',
    text: 'Totally agree. Setting boundaries early really helps.',
    timestamp: '12m ago',
    replies: [
      {
        id: 11,
        author: 'Sarah C.',
        avatarColor: '#8B5CF6',
        text: 'Yes! And communicate them clearly.',
        timestamp: '8m ago',
        replies: [],
      },
    ],
  },
  {
    id: 2,
    author: 'Mike J.',
    avatarColor: '#10B981',
    text: 'Experienced something similar. Staying firm is key.',
    timestamp: '1h ago',
    replies: [
      {
        id: 21,
        author: 'Emma W.',
        avatarColor: '#F59E0B',
        text: 'Agree. Also keep friends in the loop for safety.',
        timestamp: '44m ago',
        replies: [
          {
            id: 211,
            author: 'David K.',
            avatarColor: '#EF4444',
            text: 'This. A check-in plan helps.',
            timestamp: '30m ago',
            replies: [],
          },
        ],
      },
    ],
  },
]);

const flattenComments = (nodes, depth = 0) => {
  const out = [];
  nodes.forEach((n) => {
    out.push({ node: n, depth });
    if (n.replies && n.replies.length > 0) {
      out.push(...flattenComments(n.replies, depth + 1));
    }
  });
  return out;
};

const addReplyById = (nodes, targetId, newReply) => {
  return nodes.map((n) => {
    if (n.id === targetId) {
      return { ...n, replies: [...(n.replies || []), newReply] };
    }
    if (n.replies && n.replies.length > 0) {
      return { ...n, replies: addReplyById(n.replies, targetId, newReply) };
    }
    return n;
  });
};

// Remove a comment (at any depth) by id
const deleteCommentById = (nodes, targetId) => {
  const out = [];
  for (const n of nodes) {
    if (n.id === targetId) {
      continue; // skip/delete
    }
    let nextNode = n;
    if (n.replies && n.replies.length > 0) {
      nextNode = { ...n, replies: deleteCommentById(n.replies, targetId) };
    }
    out.push(nextNode);
  }
  return out;
};

const PostDetailScreen = ({ route, navigation }) => {
  const theme = useTheme();
  const { post, comments: passedComments } = route.params || {};
  const typeMeta = getTypeMeta(post?.type);

  const [comments, setComments] = useState(Array.isArray(passedComments) ? passedComments : makeMockComments());
  const displayAuthor = React.useMemo(() => {
    const raw = post?.author || 'Anonymous';
    return raw.replace(/^u\//i, '');
  }, [post?.author]);
  const [replyText, setReplyText] = useState('');
  const [replyTarget, setReplyTarget] = useState(null); // null for post, {id, author} for comment
  const [upvotedComments, setUpvotedComments] = useState(new Set()); // Track upvoted comments
  const [downvotedComments, setDownvotedComments] = useState(new Set()); // Track downvoted comments
  const [voteCounts, setVoteCounts] = useState({}); // Track vote counts for each comment
  const [dropdownVisible, setDropdownVisible] = useState(null); // Track which comment's dropdown is visible
  const [expandedThreads, setExpandedThreads] = useState(new Set()); // Track expanded threads
  const [liked, setLiked] = useState(!!post?.liked);
  const [likeCount, setLikeCount] = useState(post?.likes || 0);
  
  // Message modal state
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [messageRecipient, setMessageRecipient] = useState(null);

  const handleDeleteComment = (commentId) => {
    Alert.alert('Delete comment?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setComments((prev) => deleteCommentById(prev, commentId));
          setDropdownVisible(null);
        },
      },
    ]);
  };

  // Count total nested replies for a node
  const countReplies = (node) => {
    if (!node?.replies || node.replies.length === 0) return 0;
    return node.replies.reduce((acc, r) => acc + 1 + countReplies(r), 0);
  };

  // Visible comments depend on which top-level threads are expanded
  const flattenVisible = (nodes, depth = 0) => {
    const out = [];
    nodes.forEach((n) => {
      out.push({ node: n, depth });
      const shouldIncludeChildren = depth === 0 ? expandedThreads.has(n.id) : true;
      if (shouldIncludeChildren && n.replies && n.replies.length > 0) {
        out.push(...flattenVisible(n.replies, depth + 1));
      }
    });
    return out;
  };
  const flatComments = useMemo(() => flattenVisible(comments), [comments, expandedThreads]);

  const handleSend = () => {
    const text = replyText.trim();
    if (!text) return;
    const newItem = {
      id: Date.now(),
      author: 'You',
      avatarColor: '#7C9AFF',
      text,
      timestamp: 'now',
      replies: [],
    };
    if (replyTarget && replyTarget.id) {
      // Auto-expand the top-level thread that contains the target
      const findRootId = (nodes, targetId) => {
        for (const n of nodes) {
          if (n.id === targetId) return n.id;
          const stack = [...(n.replies || [])];
          while (stack.length) {
            const cur = stack.pop();
            if (cur.id === targetId) return n.id;
            if (cur.replies && cur.replies.length) stack.push(...cur.replies);
          }
        }
        return null;
      };
      const rootId = findRootId(comments, replyTarget.id) || replyTarget.id;
      setExpandedThreads((prev) => {
        const next = new Set(prev);
        next.add(rootId);
        return next;
      });
      setComments((prev) => addReplyById(prev, replyTarget.id, newItem));
    } else {
      setComments((prev) => [...prev, newItem]);
    }
    setReplyText('');
    setReplyTarget(null);
  };

  const handleUpvote = (commentId) => {
    setUpvotedComments((prev) => {
      const next = new Set(prev);
      if (next.has(commentId)) {
        next.delete(commentId);
        // Decrease vote count
        setVoteCounts((counts) => ({
          ...counts,
          [commentId]: (counts[commentId] || 0) - 1
        }));
      } else {
        next.add(commentId);
        // Increase vote count
        setVoteCounts((counts) => ({
          ...counts,
          [commentId]: (counts[commentId] || 0) + 1
        }));
        // Remove from downvotes if it was downvoted
        setDownvotedComments((downPrev) => {
          const downNext = new Set(downPrev);
          if (downNext.has(commentId)) {
            downNext.delete(commentId);
            // Adjust vote count for removing downvote
            setVoteCounts((counts) => ({
              ...counts,
              [commentId]: (counts[commentId] || 0) + 1
            }));
          }
          return downNext;
        });
      }
      return next;
    });
  };

  const handleDownvote = (commentId) => {
    setDownvotedComments((prev) => {
      const next = new Set(prev);
      if (next.has(commentId)) {
        next.delete(commentId);
        // Increase vote count (removing negative vote)
        setVoteCounts((counts) => ({
          ...counts,
          [commentId]: (counts[commentId] || 0) + 1
        }));
      } else {
        next.add(commentId);
        // Decrease vote count
        setVoteCounts((counts) => ({
          ...counts,
          [commentId]: (counts[commentId] || 0) - 1
        }));
        // Remove from upvotes if it was upvoted
        setUpvotedComments((upPrev) => {
          const upNext = new Set(upPrev);
          if (upNext.has(commentId)) {
            upNext.delete(commentId);
            // Adjust vote count for removing upvote
            setVoteCounts((counts) => ({
              ...counts,
              [commentId]: (counts[commentId] || 0) - 1
            }));
          }
          return upNext;
        });
      }
      return next;
    });
  };

  const handleDirectMessage = (comment) => {
    setDropdownVisible(null);
    setMessageRecipient(comment);
    setShowMessageModal(true);
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !messageRecipient) return;
    
    try {
      const newMessage = {
        id: Date.now().toString(),
        recipient: messageRecipient.author,
        recipientId: messageRecipient.id,
        text: messageText.trim(),
        timestamp: new Date().toISOString(),
        sender: 'You',
        senderId: 'current_user',
      };
      
      // Get existing messages
      const existingMessages = await AsyncStorage.getItem('messages');
      const messages = existingMessages ? JSON.parse(existingMessages) : [];
      
      // Add new message
      messages.push(newMessage);
      
      // Save back to AsyncStorage
      await AsyncStorage.setItem('messages', JSON.stringify(messages));
      
      // Close modal and reset
      setShowMessageModal(false);
      setMessageText('');
      setMessageRecipient(null);
      
      Alert.alert('Message Sent', 'Your message has been sent successfully!');
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    }
  };

  const toggleDropdown = (commentId) => {
    setDropdownVisible(dropdownVisible === commentId ? null : commentId);
  };

  const closeDropdown = () => {
    setDropdownVisible(null);
  };

  // Close dropdown when scrolling or when reply target changes
  React.useEffect(() => {
    closeDropdown();
  }, [replyTarget]);

  const renderComment = ({ item }) => {
    const c = item.node;
    const depth = item.depth;
    const isUpvoted = upvotedComments.has(c.id);
    const isDownvoted = downvotedComments.has(c.id);
    const showDropdown = dropdownVisible === c.id;
    const isOwn = (c.author || '').replace(/^u\//i, '').toLowerCase() === 'you';

    return (
      <View
        style={[
          styles.commentRow,
          { backgroundColor: theme.colors.surface, marginLeft: depth * 16 },
        ]}
      >
        <View style={styles.commentBody}>
          <View style={styles.commentHeader}>
            <View style={styles.commentHeaderLeft}>
              <View style={styles.commentAvatar}>
                <Text style={styles.commentAvatarText}>{(c.author || 'U').replace(/^u\//i, '').charAt(0).toUpperCase()}</Text>
              </View>
              <Text style={[styles.commentAuthor, { color: theme.colors.text }]} numberOfLines={1}>
                {(c.author || 'User').replace(/^u\//i, '')}
              </Text>
            </View>
            <Text style={[styles.commentTime, { color: theme.dark ? theme.colors.text : '#9CA3AF' }]}>{c.timestamp}</Text>
          </View>
          <Text style={[styles.commentText, { color: theme.colors.text }]}>{c.text}</Text>
          
          <View style={styles.linkRow}>
            <View style={styles.leftActions}>
              <TouchableOpacity style={styles.replyLink} onPress={() => setReplyTarget({ id: c.id, author: c.author })}>
                <Text style={[styles.replyText, { color: theme.colors.primary }]}>Reply</Text>
              </TouchableOpacity>
              {depth === 0 && countReplies(c) > 0 && (
                <TouchableOpacity
                  style={styles.replyLink}
                  onPress={() =>
                    setExpandedThreads((prev) => {
                      const next = new Set(prev);
                      if (next.has(c.id)) next.delete(c.id); else next.add(c.id);
                      return next;
                    })
                  }
                >
                  <Text style={[styles.replyText, { color: theme.colors.primary }]}>
                    {expandedThreads.has(c.id) ? 'Hide replies' : `Show replies (${countReplies(c)})`}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.votingButtons}>
              <TouchableOpacity 
                style={styles.voteButton} 
                onPress={() => {
                  if (isUpvoted) {
                    handleUpvote(c.id); // Remove upvote
                  } else if (isDownvoted) {
                    handleDownvote(c.id); // Remove downvote
                  } else {
                    handleUpvote(c.id); // Add upvote
                  }
                }}
                onLongPress={() => {
                  if (!isUpvoted && !isDownvoted) {
                    handleDownvote(c.id); // Add downvote on long press
                  }
                }}
              >
              <Ionicons 
                  name={isUpvoted ? 'heart' : 'heart-outline'} 
                  size={16} 
                  color={isUpvoted ? '#EF4444' : isDownvoted ? '#EF4444' : theme.colors.placeholder} 
                />
                <Text style={[styles.voteCount, { color: isUpvoted ? '#3E5F44' : isDownvoted ? '#EF4444' : theme.colors.placeholder }]}>
                  {voteCounts[c.id] || 0}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        {/* 3-dots menu button with dropdown */}
        <View style={styles.menuContainer}>
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => toggleDropdown(c.id)}
          >
            <Ionicons name="ellipsis-vertical" size={16} color={theme.colors.placeholder} />
          </TouchableOpacity>
          {showDropdown && (
            <>
              <TouchableOpacity 
                style={styles.dropdownOverlay}
                onPress={closeDropdown}
                activeOpacity={1}
              />
              <View style={[styles.dropdown, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>
                {isOwn ? (
                  <TouchableOpacity 
                    style={[styles.dropdownItem, { backgroundColor: theme.colors.surface }]}
                    onPress={() => handleDeleteComment(c.id)}
                  >
                    <Ionicons name="trash" size={16} color="#EF4444" />
                    <Text style={[styles.dropdownText, { color: theme.colors.text }]}>Delete</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity 
                    style={[styles.dropdownItem, { backgroundColor: theme.colors.surface }]}
                    onPress={() => handleDirectMessage(c)}
                  >
                    <Ionicons name="chatbubble-outline" size={16} color={theme.colors.primary} />
                    <Text style={[styles.dropdownText, { color: theme.colors.text }]}>Message</Text>
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: theme.colors.background }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <TouchableOpacity style={[styles.iconButton, { backgroundColor: theme.colors.surface }]} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Post</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.postRow, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.typeRow}>
            <Text style={[styles.timestamp, { color: theme.dark ? theme.colors.text : '#9CA3AF' }]}>{post?.timestamp}</Text>
          </View>

          <View style={styles.authorRow}>
            <View style={styles.authorAvatar}>
              <Text style={styles.authorAvatarText}>{(displayAuthor || 'A').charAt(0).toUpperCase()}</Text>
            </View>
            <Text style={[styles.authorName, { color: theme.colors.text }]}>{displayAuthor}</Text>
          </View>

          <Text style={[styles.title, { color: theme.colors.text }]}>{post?.title}</Text>
          <Text style={[styles.contentText, { color: theme.colors.text }]}>{post?.content ?? post?.text}</Text>
          <View style={styles.detailActions}>
            <TouchableOpacity style={styles.postActionBtn} onPress={() => { const next = !liked; setLiked(next); setLikeCount((c) => Math.max(0, c + (next ? 1 : -1))); }}>
              <Ionicons name={liked ? 'heart' : 'heart-outline'} size={18} color={liked ? '#EF4444' : (theme.dark ? '#9CA3AF' : '#6B7280')} />
              <Text style={[styles.actionText, theme.dark && { color: theme.colors.text }]}>{likeCount}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Discussion */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}> 
          <View style={styles.commentsHeader}>
          </View>
          <FlatList
            data={flatComments}
            renderItem={renderComment}
            keyExtractor={(item) => `${item.node.id}`}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>

      <View style={[styles.replyBarWrap, { backgroundColor: theme.colors.surface, borderTopColor: '#E5E7EB' }]}> 
        {replyTarget && (
          <View style={styles.replyingTo}>
            <Text style={[styles.replyingText, { color: theme.colors.text }]}>Replying to {replyTarget.author}</Text>
            <TouchableOpacity onPress={() => setReplyTarget(null)}>
              <Ionicons name="close" size={16} color={theme.colors.placeholder} />
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.replyRow}>
          <TextInput
            style={[styles.replyInput, { color: theme.colors.text }]}
            placeholder={replyTarget ? 'Write a reply...' : 'Write a comment...'}
            placeholderTextColor={theme.colors.placeholder}
            value={replyText}
            onChangeText={setReplyText}
            multiline
          />
          <TouchableOpacity style={[styles.sendBtn, { backgroundColor: theme.colors.primary }]} onPress={handleSend}>
            <Ionicons name="send" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={{ height: 12, backgroundColor: theme.colors.surface }} />
      
      {/* Message Modal */}
      <Modal
        visible={showMessageModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowMessageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.messageModal, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.messageModalHeader}>
              <Text style={[styles.messageModalTitle, { color: theme.colors.text }]}>
                Send Message to {messageRecipient?.author?.replace(/^u\//i, '') || 'User'}
              </Text>
              <TouchableOpacity onPress={() => setShowMessageModal(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={[styles.messageInput, { color: theme.colors.text, borderColor: theme.colors.outline }]}
              placeholder="Type your message..."
              placeholderTextColor={theme.colors.placeholder}
              value={messageText}
              onChangeText={setMessageText}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            
            <View style={styles.messageModalActions}>
              <TouchableOpacity
                style={[styles.messageCancelBtn, { borderColor: theme.colors.outline }]}
                onPress={() => setShowMessageModal(false)}
              >
                <Text style={[styles.messageCancelText, { color: theme.colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.messageSendBtn, { backgroundColor: theme.colors.primary }]}
                onPress={handleSendMessage}
                disabled={!messageText.trim()}
              >
                <Text style={styles.messageSendText}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 56 },
  iconButton: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 19, fontWeight: 'bold' },
  content: { padding: 16, paddingBottom: 100 },
  postRow: {
    padding: 12,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    marginBottom: 8,
  },
  typeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  typeIcon: { width: 24, height: 24, borderRadius: 6, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  typeLabel: { fontSize: 13, fontWeight: '600' },
  dot: { marginHorizontal: 6, color: '#CBD5E1' },
  community: { fontSize: 13, fontWeight: '600' },
  timestamp: { fontSize: 13, fontWeight: '600' },
  title: { fontSize: 21, fontWeight: 'bold', marginBottom: 10 },
  detailActions: { flexDirection: 'row', alignItems: 'center', marginTop: 12, marginBottom: 8 },
  postActionBtn: { flexDirection: 'row', alignItems: 'center', marginRight: 14, paddingVertical: 2 },
  actionText: { fontSize: 13, color: '#6B7280', marginLeft: 6, fontWeight: '600' },
  contentText: { fontSize: 14, lineHeight: 22 },
  authorRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  authorAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  authorAvatarText: { fontSize: 12, fontWeight: '700', color: '#3E5F44' },
  authorName: { fontSize: 13, fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#E5E7EB', opacity: 0.5, marginVertical: 12 },
  commentsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  commentsTitle: { fontSize: 17, fontWeight: 'bold' },
  commentsCount: { fontSize: 13, fontWeight: '600' },
  commentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    marginBottom: 8,
  },
  commentBody: { flex: 1 },
  commentHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  commentHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  commentAuthor: { fontSize: 15, fontWeight: 'bold' },
  commentTime: { fontSize: 13 },
  commentAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentAvatarText: { fontSize: 11, fontWeight: '700', color: '#3E5F44' },
  commentText: { fontSize: 14, lineHeight: 22, marginTop: 4 },
  replyLink: { fontSize: 13, fontWeight: '600' },
  linkRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginTop: 6 },
  leftActions: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  votingButtons: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  voteCount: {
    fontSize: 12,
    fontWeight: '600',
  },
  replyText: { fontSize: 13, fontWeight: '600' },
  replyBarWrap: { paddingHorizontal: 12, paddingTop: 8, paddingBottom: 12, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  replyingTo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  replyingText: { fontSize: 13, fontWeight: '600' },
  replyRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  replyInput: { flex: 1, minHeight: 40, maxHeight: 120, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10 },
  sendBtn: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  menuButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  menuContainer: {
    position: 'relative',
    marginLeft: 8,
  },
  dropdown: {
    position: 'absolute',
    top: 40,
    right: 0,
    width: 140,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
    backgroundColor: '#FFFFFF',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  dropdownText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 12,
  },
  dropdownOverlay: {
    position: 'absolute',
    top: -1000,
    left: -1000,
    right: -1000,
    bottom: -1000,
    zIndex: 999,
  },
  section: {
    marginHorizontal: 0,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  
  // Message Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  messageModal: {
    width: '100%',
    borderRadius: 16,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  messageModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  messageModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 10,
  },
  messageInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    marginBottom: 20,
  },
  messageModalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  messageCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  messageCancelText: {
    fontSize: 16,
    fontWeight: '600',
  },
  messageSendBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  messageSendText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PostDetailScreen; 