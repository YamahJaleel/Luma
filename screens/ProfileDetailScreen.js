import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, TextInput, KeyboardAvoidingView, Platform, FlatList } from 'react-native';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

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
    const ownerNote = (profile?.bio && profile.bio.trim()) ? profile.bio.trim() : 'I created this profile because I had a really concerning experience with Tyler. He seemed charming at first but quickly became controlling and manipulative. He would text me constantly and get angry if I didn\'t respond immediately. When I tried to set boundaries, he became verbally abusive. I\'m sharing this to help protect other women.';
    items.push({
      id: 'owner-note',
      author: 'Sarah M.',
      avatarColor: '#7C9AFF',
      text: ownerNote,
      timestamp: 'now',
      replies: [],
    });
    items.push(
      {
        id: 1,
        author: 'Emma W.',
        avatarColor: '#EF4444',
        text: '🚩🚩🚩 Met him last week and he was extremely pushy about meeting at his place. When I said no, he got really aggressive and started calling me names. Stay away!',
        timestamp: '2h ago',
        replies: [
          {
            id: 11,
            author: 'Jessica L.',
            avatarColor: '#8B5CF6',
            text: 'Oh my god, that\'s terrifying! Thank you for sharing this. Did you report him?',
            timestamp: '1h ago',
            replies: [],
          },
          {
            id: 12,
            author: 'Emma W.',
            avatarColor: '#EF4444',
            text: 'Yes, I reported him immediately. The way he switched from charming to aggressive was so scary.',
            timestamp: '45m ago',
            replies: [],
          },
        ],
      },
      {
        id: 2,
        author: 'Maya K.',
        avatarColor: '#10B981',
        text: 'I actually had a different experience. We met for coffee and he was really nice and respectful. But reading these comments is making me question everything...',
        timestamp: '3h ago',
        replies: [
          {
            id: 21,
            author: 'Sophie T.',
            avatarColor: '#F59E0B',
            text: 'That\'s exactly how these guys work! They\'re nice at first to gain your trust. Please be careful.',
            timestamp: '2h ago',
            replies: [],
          },
          {
            id: 22,
            author: 'Maya K.',
            avatarColor: '#10B981',
            text: 'You\'re absolutely right. I\'m glad I found this community before things went further.',
            timestamp: '1h ago',
            replies: [],
          },
        ],
      },
      {
        id: 3,
        author: 'Rachel B.',
        avatarColor: '#3B82F6',
        text: 'He tried to pressure me into sending nudes on the first day of talking. When I refused, he said I was "prudish" and unmatched me. Bullet dodged!',
        timestamp: '4h ago',
        replies: [
          {
            id: 31,
            author: 'Amanda P.',
            avatarColor: '#EC4899',
            text: 'Classic love bombing then manipulation tactic. Good for you for standing your ground!',
            timestamp: '3h ago',
            replies: [],
          },
        ],
      },
      {
        id: 4,
        author: 'Lisa M.',
        avatarColor: '#8B5CF6',
        text: '⚠️ He has multiple dating app profiles with slightly different names. I matched with "Tyler B" on Hinge and "Tyler Bradshaw" on Bumble. Same photos, different bios.',
        timestamp: '5h ago',
        replies: [
          {
            id: 41,
            author: 'Natalie R.',
            avatarColor: '#F97316',
            text: 'That\'s a huge red flag! Catfishing and multiple profiles are never good signs.',
            timestamp: '4h ago',
            replies: [],
          },
          {
            id: 42,
            author: 'Lisa M.',
            avatarColor: '#8B5CF6',
            text: 'Exactly! I confronted him about it and he blocked me immediately. Sketchy behavior.',
            timestamp: '3h ago',
            replies: [],
          },
        ],
      },
      {
        id: 5,
        author: 'Chloe S.',
        avatarColor: '#059669',
        text: 'He asked me to meet at a bar downtown, but when I got there, he was nowhere to be found. Texted him and he said he "forgot" and was actually at home. Wanted me to come over instead. Nope!',
        timestamp: '6h ago',
        replies: [
          {
            id: 51,
            author: 'Taylor H.',
            avatarColor: '#DC2626',
            text: 'That\'s so manipulative! He probably planned that from the start to get you alone at his place.',
            timestamp: '5h ago',
            replies: [],
          },
        ],
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
  const [upvotedComments, setUpvotedComments] = useState(new Set()); // Track upvoted comments
  const [downvotedComments, setDownvotedComments] = useState(new Set()); // Track downvoted comments
  const [voteCounts, setVoteCounts] = useState({}); // Track vote counts for each comment
  const [selectedComment, setSelectedComment] = useState(null); // for long-press selection
  const [dropdownVisible, setDropdownVisible] = useState(null); // Track which comment's dropdown is visible
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

  const handleLongPress = (comment) => {
    setSelectedComment(comment);
  };

  const handleDirectMessage = (comment) => {
    setSelectedComment(null);
    setDropdownVisible(null);
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
    const isOwnerNote = c.id === 'owner-note';
    const isUpvoted = upvotedComments.has(c.id);
    const isDownvoted = downvotedComments.has(c.id);
    const showDropdown = dropdownVisible === c.id;

    return (
      <View
        style={[
          styles.commentRow,
          { backgroundColor: theme.colors.surface, marginLeft: depth * 16 },
          isOwnerNote && styles.ownerNoteTab,
        ]}
      >
        <View style={styles.commentBody}>
          <View style={styles.commentHeader}>
            <Text style={[styles.commentAuthor, { color: theme.colors.text }]} numberOfLines={1}>
              {c.author}
            </Text>
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
                  name="leaf-outline" 
                  size={16} 
                  color={isUpvoted ? '#3E5F44' : isDownvoted ? '#EF4444' : theme.colors.placeholder} 
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
          
          {/* Dropdown menu */}
          {showDropdown && (
            <>
              {/* Touchable overlay to close dropdown when tapping outside */}
              <TouchableOpacity 
                style={styles.dropdownOverlay}
                onPress={closeDropdown}
                activeOpacity={1}
              />
              <View style={[styles.dropdown, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>
                <TouchableOpacity 
                  style={[styles.dropdownItem, { backgroundColor: theme.colors.surface }]}
                  onPress={() => handleDirectMessage(c)}
                >
                  <Ionicons name="chatbubble-outline" size={16} color={theme.colors.primary} />
                  <Text style={[styles.dropdownText, { color: theme.colors.text }]}>Message</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
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

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        // Web-specific scrolling fix
        {...(Platform.OS === 'web' && {
          style: [styles.content, { height: '100vh', overflow: 'auto' }],
        })}
      >
        {/* Profile Image and Basic Info */}
        <View style={[styles.profileSection, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.imageContainer}>
            <Image source={{ uri: profile.avatar }} style={styles.profileImage} />
          </View>

        </View>

        {/* AI Overview with All Community Signals */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>What's being said</Text>
          <Text style={[styles.aiText, theme.dark && { color: theme.colors.text }]}>{overviewText}</Text>
          
          {/* All Community Signals */}
          <View style={styles.trustIndicatorsContainer}>
            {profile.flags.map((flag, index) => (
              <View key={index} style={styles.trustIndicatorItem}>
                <Ionicons name={getFlagIcon(flag)} size={18} color={getFlagColor(flag)} />
                <Text style={[styles.trustIndicatorText, { color: getFlagColor(flag) }, theme.dark && { color: theme.colors.text }]}>
                  {flag.replace('_', ' ')}
                </Text>
              </View>
            ))}
          </View>
        </View>

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
            placeholder={replyTarget ? 'Write a reply...' : 'Share your experience'}
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
  headerTitle: { fontSize: 19, fontWeight: 'bold' },
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
    imageContainer: { position: 'relative', marginBottom: 6.5, width: '100%', borderTopLeftRadius: 12, borderTopRightRadius: 12, borderBottomLeftRadius: 8, borderBottomRightRadius: 8, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4 },
  profileImage: { width: '100%', aspectRatio: 1, borderTopLeftRadius: 12, borderTopRightRadius: 12, borderBottomLeftRadius: 8, borderBottomRightRadius: 8, backgroundColor: '#F0F0F0' },
  
  profileName: { fontSize: 22, fontWeight: 'bold', marginBottom: 4 },


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
  sectionTitle: { fontSize: 19, fontWeight: 'bold', marginBottom: 16 },
  aiText: { fontSize: 14, lineHeight: 22, color: '#4B5563' },
  flagsContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  flagItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F7FAFC', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginRight: 8, marginBottom: 8 },
  flagText: { fontSize: 13, fontWeight: '600', marginLeft: 4, textTransform: 'capitalize' },
  commentsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  commentsCount: { fontSize: 13, fontWeight: '600' },
  commentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    marginBottom: 8,
  },
  commentBody: { flex: 1 },
  commentHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  commentAuthor: { fontSize: 15, fontWeight: 'bold' },
  commentTime: { fontSize: 13 },
  commentText: { fontSize: 14, lineHeight: 22, marginTop: 4 },
  replyLink: { fontSize: 13, fontWeight: '600' },
  linkRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginTop: 6 },
  leftActions: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  votingButtons: { flexDirection: 'row', alignItems: 'center', gap: 12 },

  commentSeparator: { height: 10 },
  replyBarWrap: { paddingHorizontal: 12, paddingTop: 8, paddingBottom: 12, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  replyingTo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  replyingText: { fontSize: 13, fontWeight: '600' },
  replyRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  replyInput: { flex: 1, minHeight: 40, maxHeight: 120, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, fontSize: 15 },
  sendBtn: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  trustIndicatorsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 },
  trustIndicatorItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F7FAFC', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginRight: 8, marginBottom: 8 },
  trustIndicatorText: { fontSize: 13, fontWeight: '600', marginLeft: 4, textTransform: 'capitalize' },
  upvoteButton: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  downvoteButton: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  voteButton: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  voteCount: { fontSize: 12, fontWeight: '600' },
  ownerNoteTab: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F8FAFC',
    marginBottom: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3E5F44',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
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
    fontSize: 13, 
    fontWeight: '600' 
  },
  cancelButton: { 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 16, 
    borderWidth: 1 
  },
  cancelButtonText: { 
    fontSize: 13, 
    fontWeight: '600' 
  },
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
});

export default ProfileDetailScreen; 