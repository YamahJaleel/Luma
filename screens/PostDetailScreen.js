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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';

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

const PostDetailScreen = ({ route, navigation }) => {
  const theme = useTheme();
  const { post, comments: passedComments } = route.params || {};
  const typeMeta = getTypeMeta(post?.type);

  const [comments, setComments] = useState(Array.isArray(passedComments) ? passedComments : makeMockComments());
  const [replyText, setReplyText] = useState('');
  const [replyTarget, setReplyTarget] = useState(null); // null for post, {id, author} for comment
  const [selectedComment, setSelectedComment] = useState(null); // for long-press selection

  const flatComments = useMemo(() => flattenComments(comments), [comments]);

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
      setComments((prev) => addReplyById(prev, replyTarget.id, newItem));
    } else {
      setComments((prev) => [...prev, newItem]);
    }
    setReplyText('');
    setReplyTarget(null);
  };

  const handleLongPress = (comment) => {
    setSelectedComment(comment);
  };

  const handleDirectMessage = (comment) => {
    setSelectedComment(null);
    // Navigate to Messages screen and start a new conversation
    navigation.navigate('Messages', { 
      startNewChat: true, 
      recipient: comment.author,
      recipientId: comment.id 
    });
  };

  const handleCancelSelection = () => {
    setSelectedComment(null);
  };

  const renderComment = ({ item }) => {
    const c = item.node;
    const depth = item.depth;
    const isSelected = selectedComment && selectedComment.id === c.id;
    
    return (
      <View
        style={[
          styles.commentRow, 
          { 
            backgroundColor: theme.colors.surface, 
            marginLeft: depth * 16,
          }
        ]}
      > 
        <View style={[styles.avatarCircle, { backgroundColor: c.avatarColor }]}>
          <Text style={styles.avatarInitial}>{c.author.charAt(0)}</Text>
        </View>
        <View style={styles.commentBody}>
          <View style={styles.commentHeader}>
            <Text style={[styles.commentAuthor, { color: theme.colors.text }]} numberOfLines={1}>
              {c.author}
            </Text>
            <Text style={[styles.commentTime, { color: theme.dark ? theme.colors.text : '#9CA3AF' }]}>{c.timestamp}</Text>
          </View>
          <Text style={[styles.commentText, { color: theme.colors.text }]}>{c.text}</Text>
          
          {isSelected ? (
            <View style={styles.actionRow}>
              <TouchableOpacity 
                style={[styles.dmButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => handleDirectMessage(c)}
              >
                <Ionicons name="chatbubble" size={14} color="#FFFFFF" />
                <Text style={styles.dmButtonText}>Message</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.cancelButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.primary }]}
                onPress={handleCancelSelection}
              >
                <Text style={[styles.cancelButtonText, { color: theme.colors.primary }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.replyLink} onPress={() => setReplyTarget({ id: c.id, author: c.author })}>
              <Text style={[styles.replyText, { color: theme.colors.primary }]}>Reply</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {/* 3-dots menu button */}
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => handleLongPress(c)}
        >
          <Ionicons name="ellipsis-vertical" size={16} color={theme.colors.placeholder} />
        </TouchableOpacity>
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
            <View style={[styles.typeIcon, { backgroundColor: `${typeMeta.color}15` }]}>
              <Ionicons name={typeMeta.icon} size={16} color={typeMeta.color} />
            </View>
            <Text style={[styles.typeLabel, { color: typeMeta.color }]}>{typeMeta.label}</Text>
            <Text style={styles.dot}>·</Text>
            <Text style={[styles.community, { color: theme.dark ? theme.colors.text : '#6B7280' }]}>{post?.community}</Text>
            <View style={{ flex: 1 }} />
            <Text style={[styles.timestamp, { color: theme.dark ? theme.colors.text : '#9CA3AF' }]}>{post?.timestamp}</Text>
          </View>

          <View style={styles.authorRow}>
            <View style={[styles.authorAvatar, { backgroundColor: '#3E5F44' }]}>
              <Text style={styles.authorInitial}>{(post?.author || 'Anonymous').charAt(0)}</Text>
            </View>
            <Text style={[styles.authorName, { color: theme.colors.text }]}>{post?.author || 'Anonymous'}</Text>
          </View>

          <Text style={[styles.title, { color: theme.colors.text }]}>{post?.title}</Text>
          <Text style={[styles.contentText, { color: theme.colors.text }]}>{post?.content}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.commentsHeader}>
          <Text style={[styles.commentsTitle, { color: theme.colors.text }]}>Comments</Text>
        </View>

        <FlatList
          data={flatComments}
          renderItem={renderComment}
          keyExtractor={(item) => `${item.node.id}`}
          ItemSeparatorComponent={() => <View style={styles.commentSeparator} />}
          scrollEnabled={false}
        />
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
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 56 },
  iconButton: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700' },
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
  typeLabel: { fontSize: 12, fontWeight: '700' },
  dot: { marginHorizontal: 6, color: '#CBD5E1' },
  community: { fontSize: 12, fontWeight: '500' },
  timestamp: { fontSize: 12, fontWeight: '500' },
  title: { fontSize: 20, fontWeight: '800', marginBottom: 10 },
  contentText: { fontSize: 15, lineHeight: 22 },
  authorRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  authorAvatar: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  authorInitial: { color: 'white', fontSize: 10, fontWeight: '700' },
  authorName: { fontSize: 12, fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#E5E7EB', opacity: 0.5, marginVertical: 12 },
  commentsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  commentsTitle: { fontSize: 16, fontWeight: '700' },
  commentsCount: { fontSize: 12, fontWeight: '600' },
  commentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  avatarCircle: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarInitial: { color: 'white', fontWeight: '700', fontSize: 12 },
  commentBody: { flex: 1, marginRight: 8 },
  commentHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  commentAuthor: { fontSize: 14, fontWeight: '700' },
  commentTime: { fontSize: 12 },
  commentText: { fontSize: 14, lineHeight: 20, marginTop: 4 },
  replyLink: { marginTop: 6 },
  replyText: { fontSize: 12, fontWeight: '700' },
  actionRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8, 
    marginTop: 8 
  },
  dmButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4, 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 16 
  },
  dmButtonText: { 
    color: '#FFFFFF', 
    fontSize: 12, 
    fontWeight: '600' 
  },
  cancelButton: { 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 16, 
    borderWidth: 1 
  },
  cancelButtonText: { 
    fontSize: 12, 
    fontWeight: '600' 
  },
  commentSeparator: { height: 10 },
  replyBarWrap: { paddingHorizontal: 12, paddingTop: 8, paddingBottom: 12, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  replyingTo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  replyingText: { fontSize: 12, fontWeight: '600' },
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
});

export default PostDetailScreen; 