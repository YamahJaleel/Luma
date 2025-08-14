import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';

const { width } = Dimensions.get('window');

const ProfileDetailScreen = ({ route, navigation }) => {
  const theme = useTheme();
  const { profile } = route.params;

  const getRiskLevelColor = (level) => {
    switch (level) {
      case 'green':
        return '#4CAF50';
      case 'yellow':
        return '#FF9800';
      case 'red':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const getRiskLevelText = (level) => {
    switch (level) {
      case 'green':
        return 'Green Flag';
      case 'yellow':
        return 'Yellow Flag';
      case 'red':
        return 'Red Flag';
      default:
        return 'Unknown';
    }
  };

  const getFlagIcon = (flag) => {
    switch (flag) {
      case 'trustworthy':
        return 'shield-checkmark';
      case 'responsive':
        return 'chatbubble-ellipses';
      case 'genuine':
        return 'heart';
      case 'verified':
        return 'checkmark-circle';
      case 'helpful':
        return 'hand-left';
      case 'community_leader':
        return 'star';
      case 'trusted':
        return 'shield';
      case 'friendly':
        return 'happy';
      case 'active':
        return 'flash';
      case 'new_user':
        return 'person-add';
      case 'inconsistent':
        return 'alert-circle';
      case 'ghosting':
        return 'close-circle';
      case 'unreliable':
        return 'warning';
      case 'catfish':
        return 'fish';
      case 'fake_profile':
        return 'person-remove';
      case 'harassment':
        return 'warning';
      case 'aggressive':
        return 'thunder';
      case 'inappropriate':
        return 'close';
      default:
        return 'flag';
    }
  };

  const getFlagColor = (flag) => {
    if (
      [
        'trustworthy',
        'responsive',
        'genuine',
        'verified',
        'helpful',
        'community_leader',
        'trusted',
        'friendly',
        'active',
        'new_user',
      ].includes(flag)
    ) {
      return '#4CAF50';
    } else if (['inconsistent', 'ghosting', 'unreliable'].includes(flag)) {
      return '#FF9800';
    } else {
      return '#F44336';
    }
  };

  // Simple AI overview text synthesized from profile signals
  const overviewText = (() => {
    const risk = getRiskLevelText(profile.riskLevel);
    const positives = profile.flags.filter((f) => ['trustworthy','responsive','genuine','verified','helpful','community_leader','trusted','friendly','active','new_user'].includes(f));
    const cautions = profile.flags.filter((f) => ['inconsistent','ghosting','unreliable','catfish','fake_profile','harassment','aggressive','inappropriate'].includes(f));
    const posPart = positives.length ? `Positive signals: ${positives.map((f) => f.replace('_',' ')).join(', ')}.` : '';
    const cauPart = cautions.length ? ` Cautionary signals: ${cautions.map((f) => f.replace('_',' ')).join(', ')}.` : '';
    return `Overview: ${risk} overall. ${posPart}${cauPart}`.trim();
  })();

  // Threaded comments (profile discussion)
  const makeMockComments = () => {
    const items = [];
    const ownerNote = (profile?.bio && profile.bio.trim()) ? profile.bio.trim() : 'No overview provided by the creator yet.';
    items.push({
      id: 'owner-note',
      author: 'Profile Owner',
      avatarColor: '#7C9AFF',
      text: ownerNote,
      timestamp: 'now',
      replies: [],
    });
    items.push(
      {
        id: 1,
        author: 'Alex R.',
        avatarColor: '#3E5F44',
        text: 'Great communicator and respectful.',
        timestamp: '12m ago',
        replies: [
          { id: 11, author: 'Sam T.', avatarColor: '#8B5CF6', text: 'Agree!', timestamp: '8m ago', replies: [] },
        ],
      },
      {
        id: 2,
        author: 'Mike J.',
        avatarColor: '#10B981',
        text: 'Had a positive experience, punctual and clear.',
        timestamp: '1h ago',
        replies: [],
      }
    );
    return items;
  };

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
        const replies = Array.isArray(n.replies) ? n.replies : [];
        return { ...n, replies: [...replies, newReply] };
      }
      if (n.replies && n.replies.length) {
        return { ...n, replies: addReplyById(n.replies, targetId, newReply) };
      }
      return n;
    });
  };

  const [comments, setComments] = useState(makeMockComments());
  const [replyText, setReplyText] = useState('');
  const [replyTarget, setReplyTarget] = useState(null); // null for profile-level comment
  const [expandedThreads, setExpandedThreads] = useState(new Set()); // top-level ids expanded
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

  const renderComment = ({ item }) => {
    const c = item.node;
    const depth = item.depth;
    const isOwnerNote = c.id === 'owner-note';
    return (
      <View
        style={[
          styles.commentRow,
          { backgroundColor: theme.colors.surface, marginLeft: depth * 16 },
          isOwnerNote && { borderWidth: 1, borderColor: theme.colors.primary, backgroundColor: `${theme.colors.primary}15` },
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
          <View style={styles.linkRow}>
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
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: theme.colors.background }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]} numberOfLines={1}>{profile?.name}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Image and Basic Info */}
        <View style={[styles.profileSection, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.imageContainer}>
            <Image source={{ uri: profile.avatar }} style={styles.profileImage} />

          </View>

        </View>

        {/* AI Overview */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>What’s being said</Text>
          <Text style={[styles.aiText, theme.dark && { color: theme.colors.text }]}>{overviewText}</Text>
        </View>

        {/* Flags */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.flagsContainer}>
            {profile.flags.map((flag, index) => (
              <View key={index} style={styles.flagItem}>
                <Ionicons name={getFlagIcon(flag)} size={16} color={getFlagColor(flag)} />
                <Text style={[styles.flagText, { color: getFlagColor(flag) }, theme.dark && { color: theme.colors.text }]}>
                  {flag.replace('_', ' ')}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Discussion */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}> 
          <View style={styles.commentsHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Discussion</Text>
          </View>
          <FlatList
            data={flatComments}
            renderItem={renderComment}
            keyExtractor={(item) => `${item.node.id}`}
            ItemSeparatorComponent={() => <View style={styles.commentSeparator} />}
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
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  placeholder: { width: 40 },
  content: { flex: 1 },
  profileSection: {
    alignItems: 'center',
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 10,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
    imageContainer: { position: 'relative', marginBottom: 16, width: '100%', borderTopLeftRadius: 12, borderTopRightRadius: 12, borderBottomLeftRadius: 8, borderBottomRightRadius: 8, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4 },
  profileImage: { width: '100%', aspectRatio: 1, borderTopLeftRadius: 12, borderTopRightRadius: 12, borderBottomLeftRadius: 8, borderBottomRightRadius: 8, backgroundColor: '#F0F0F0' },
  
  profileName: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },


  section: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  aiText: { fontSize: 14, lineHeight: 20, color: '#4B5563' },
  flagsContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  flagItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F7FAFC', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginRight: 8, marginBottom: 8 },
  flagText: { fontSize: 12, fontWeight: '500', marginLeft: 4, textTransform: 'capitalize' },
  commentsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
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
  commentBody: { flex: 1 },
  commentHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  commentAuthor: { fontSize: 14, fontWeight: '700' },
  commentTime: { fontSize: 12 },
  commentText: { fontSize: 14, lineHeight: 20, marginTop: 4 },
  replyLink: { fontSize: 12, fontWeight: '700' },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 6 },

  commentSeparator: { height: 10 },
  replyBarWrap: { paddingHorizontal: 12, paddingTop: 8, paddingBottom: 12, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  replyingTo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  replyingText: { fontSize: 12, fontWeight: '600' },
  replyRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  replyInput: { flex: 1, minHeight: 40, maxHeight: 120, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10 },
  sendBtn: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
});

export default ProfileDetailScreen; 