import React, { useState, useMemo, useEffect } from 'react';
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
import { commentService, postService, messageService } from '../services/firebaseService';
import { auth } from '../config/firebase';
import { db } from '../config/firebase';
import { collection, query as fsQuery, where, orderBy, onSnapshot, getDocs, writeBatch, doc } from 'firebase/firestore';

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

const formatTimestamp = (timestamp) => {
  if (!timestamp) return 'just now';
  
  const now = new Date();
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

// Build a threaded comment tree from flat comments using parentCommentId
const buildThreadedComments = (flat) => {
  const byId = new Map();
  const roots = [];

  flat.forEach((c) => {
    byId.set(c.id, { ...c, replies: [] });
  });

  flat.forEach((c) => {
    const node = byId.get(c.id);
    const parentId = c.parentCommentId || null;
    if (parentId && byId.has(parentId)) {
      byId.get(parentId).replies.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
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

// Persist post-specific comments
const COMMENTS_KEY_PREFIX = 'postComments:';
const loadSavedComments = async (postId) => {
  try {
    const raw = await AsyncStorage.getItem(`${COMMENTS_KEY_PREFIX}${postId}`);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};
const saveCommentsForPost = async (postId, list) => {
  try {
    await AsyncStorage.setItem(`${COMMENTS_KEY_PREFIX}${postId}`, JSON.stringify(list));
  } catch (e) {
    // ignore
  }
};

const PostDetailScreen = ({ route, navigation }) => {
  const theme = useTheme();
  const params = route.params || {};
  const post = params.post || {};
  const passedComments = params.comments;
  const typeMeta = getTypeMeta(post.type);

  const [comments, setComments] = useState([]);
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const displayAuthor = React.useMemo(() => {
    const raw = (post.authorName || post.author || '').trim();
    if (raw.length > 0) return raw.replace(/^u\//i, '');
    // Fallback from auth if needed
    const user = auth.currentUser;
    if (user?.displayName && user.displayName.trim()) return user.displayName.trim();
    if (user?.email) return user.email.split('@')[0];
    return 'User';
  }, [post.authorName, post.author]);
  const [replyText, setReplyText] = useState('');
  const [replyTarget, setReplyTarget] = useState(null); // null for post, {id, author} for comment
  const [upvotedComments, setUpvotedComments] = useState(new Set()); // Track upvoted comments
  const [downvotedComments, setDownvotedComments] = useState(new Set()); // Track downvoted comments
  const [voteCounts, setVoteCounts] = useState({}); // Track vote counts for each comment
  const [dropdownVisible, setDropdownVisible] = useState(null); // Track which comment's dropdown is visible
  const [showPostDropdown, setShowPostDropdown] = useState(false); // Track post dropdown visibility
  const [expandedThreads, setExpandedThreads] = useState(new Set()); // Track expanded threads
  const [liked, setLiked] = useState(!!post.liked);
  const [likeCount, setLikeCount] = useState(post.likes || 0);

  // Check if this is a user-created post (not in MOCK_POSTS)
  const MOCK_POSTS = [
    { id: 'p1' }, { id: 'p2' }, { id: 'p3' }, { id: 'p4' }, { id: 'p5' },
    { id: 'p6' }, { id: 'p7' }, { id: 'p8' }, { id: 'p9' }, { id: 'p10' },
    { id: 'p11' }, { id: 'p12' }, { id: 'p13' }, { id: 'p14' }, { id: 'p15' }
  ];
  const mockPostIds = new Set(MOCK_POSTS.map(p => p.id));
  const isUserPost = post?.id && !mockPostIds.has(post.id);
  const isOwnPost = !!(auth.currentUser && post?.authorId && auth.currentUser.uid === post.authorId);
  const canMessagePostAuthor = !isOwnPost && !!post?.authorId;

  // Load like status from AsyncStorage on mount
  React.useEffect(() => {
    const loadLikeStatus = async () => {
      if (!post.id) return;
      
      try {
        const likedPostsData = await AsyncStorage.getItem('likedPosts');
        const likedPosts = likedPostsData ? JSON.parse(likedPostsData) : [];
        const isLiked = likedPosts.some(likedPost => likedPost.id === post.id);
        setLiked(isLiked);
        
        // Update like count based on current status
        const baseLikes = post.likes || 0;
        setLikeCount(baseLikes + (isLiked ? 1 : 0));
      } catch (error) {
        console.error('Error loading like status:', error);
      }
    };
    
    loadLikeStatus();
  }, [post.id]);

  // Load comment votes from AsyncStorage on mount
  React.useEffect(() => {
    const loadCommentVotes = async () => {
      try {
        const commentVotesData = await AsyncStorage.getItem('commentVotes');
        if (commentVotesData) {
          const commentVotes = JSON.parse(commentVotesData);
          const upvoted = new Set(commentVotes.upvoted || []);
          const downvoted = new Set(commentVotes.downvoted || []);
          const voteCounts = commentVotes.voteCounts || {};
          
          setUpvotedComments(upvoted);
          setDownvotedComments(downvoted);
          setVoteCounts(voteCounts);
        }
      } catch (error) {
        console.error('Error loading comment votes:', error);
      }
    };
    
    loadCommentVotes();
  }, []);

  // Real-time comments listener from Firebase
  useEffect(() => {
    if (!post.id) return;

    setIsLoadingComments(true);
    setFirebaseLoaded(false); // Reset Firebase loaded flag for new post
    const q = fsQuery(
      collection(db, 'comments'),
      where('postId', '==', post.id),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        try {
          console.log('📡 Comments snapshot received:', snapshot.docs.length, 'comments');
          const firebaseComments = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
          console.log('📝 Firebase comments:', firebaseComments.map(c => ({ id: c.id, text: c.text?.substring(0, 20) + '...' })));
          
          // Normalize
          const normalized = firebaseComments.map((comment) => ({
            id: comment.id,
            author: comment.authorName || comment.author || 'Anonymous',
            avatarColor: '#3E5F44',
            text: comment.text || comment.content,
            timestamp: formatTimestamp(comment.createdAt),
            userId: comment.userId || comment.authorId,
            createdAt: comment.createdAt,
            parentCommentId: comment.parentCommentId || null,
          }));

          const threaded = buildThreadedComments(normalized);
          console.log('🧵 Threaded comments:', threaded.length, 'top-level comments');
          setComments(threaded);
          setFirebaseLoaded(true); // Mark Firebase as loaded
        } catch (e) {
          console.error('Error processing comments snapshot:', e);
        } finally {
          setIsLoadingComments(false);
        }
      },
      (error) => {
        console.error('Error listening to comments:', error);
        setIsLoadingComments(false);
      }
    );

    return () => unsubscribe();
  }, [post.id]);

  // Track if Firebase has been loaded at least once
  const [firebaseLoaded, setFirebaseLoaded] = useState(false);

  // Load saved comments for the post on mount (fallback)
  React.useEffect(() => {
    (async () => {
      // Only use saved comments if Firebase hasn't loaded yet
      if (comments.length === 0 && !isLoadingComments && !firebaseLoaded) {
        const saved = await loadSavedComments(post?.id);
        if (Array.isArray(saved) && saved.length > 0) {
          setComments(saved);
        }
      }
    })();
  }, [post?.id, comments.length, isLoadingComments, firebaseLoaded]);

  // Save comment votes to AsyncStorage
  const saveCommentVotes = async (upvoted, downvoted, voteCounts) => {
    try {
      const commentVotes = {
        upvoted: Array.from(upvoted),
        downvoted: Array.from(downvoted),
        voteCounts: voteCounts
      };
      await AsyncStorage.setItem('commentVotes', JSON.stringify(commentVotes));
    } catch (error) {
      console.error('Error saving comment votes:', error);
    }
  };

  // Handle like toggle and save to AsyncStorage
  const handleLikeToggle = async () => {
    const newLiked = !liked;
    const newLikeCount = Math.max(0, likeCount + (newLiked ? 1 : -1));
    
    // Update local state immediately
    setLiked(newLiked);
    setLikeCount(newLikeCount);
    
    // Save to AsyncStorage (matching HomeScreen format)
    try {
      const likedPostsData = await AsyncStorage.getItem('likedPosts');
      const likedPosts = likedPostsData ? JSON.parse(likedPostsData) : [];
      
      if (newLiked) {
        // Add to liked posts if not already there
        const exists = likedPosts.some(likedPost => likedPost.id === post.id);
        if (!exists) {
          const updatedPost = { ...post, liked: true, likes: newLikeCount };
          likedPosts.unshift(updatedPost); // Add to beginning
        }
      } else {
        // Remove from liked posts
        const filteredPosts = likedPosts.filter(likedPost => likedPost.id !== post.id);
        likedPosts.length = 0; // Clear array
        likedPosts.push(...filteredPosts); // Add back filtered posts
      }
      
      await AsyncStorage.setItem('likedPosts', JSON.stringify(likedPosts));
    } catch (error) {
      console.error('Error saving like status:', error);
    }
  };
  
  // Message modal state
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [messageRecipient, setMessageRecipient] = useState(null);

  // Delete a comment and all its descendants in Firestore
  const deleteCommentThread = async (rootCommentId) => {
    // Load all comments for this post to compute descendants
    const commentsQ = fsQuery(collection(db, 'comments'), where('postId', '==', post.id));
    const snap = await getDocs(commentsQ);
    const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    // Build adjacency by parentCommentId
    const childrenByParent = new Map();
    for (const c of all) {
      const parentId = c.parentCommentId || null;
      if (!childrenByParent.has(parentId)) childrenByParent.set(parentId, []);
      childrenByParent.get(parentId).push(c.id);
    }

    // Collect all descendant ids (including root)
    const toDelete = [];
    const stack = [rootCommentId];
    while (stack.length) {
      const cur = stack.pop();
      toDelete.push(cur);
      const kids = childrenByParent.get(cur) || [];
      for (const k of kids) stack.push(k);
    }

    // Batch delete
    const batch = writeBatch(db);
    for (const id of toDelete) {
      batch.delete(doc(db, 'comments', id));
    }
    await batch.commit();
  };

  const handleDeleteComment = (commentId, commentUserId) => {
    const user = auth.currentUser;
    const isPostOwner = !!(user && post?.authorId && user.uid === post.authorId);
    const isCommentOwner = !!(user && user.uid === (commentUserId || user?.uid));

    if (!isPostOwner && !isCommentOwner) {
      Alert.alert('Not allowed', 'You can only delete your own comments.');
      setDropdownVisible(null);
      return;
    }

    const title = isPostOwner && !isCommentOwner
      ? 'Delete thread?'
      : 'Delete comment?';
    const message = isPostOwner && !isCommentOwner
      ? 'This will delete this comment and all of its replies. This cannot be undone.'
      : 'This will delete your comment. This cannot be undone.';

    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel', onPress: () => setDropdownVisible(null) },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            console.log('🗑️ Attempting to delete comment:', commentId);
            console.log('👤 Current user:', auth.currentUser?.uid);
            console.log('📝 Comment user ID:', commentUserId);
            console.log('🏠 Is post owner:', isPostOwner);
            console.log('💬 Is comment owner:', isCommentOwner);
            
            if (isPostOwner && !isCommentOwner) {
              // Post author can remove the entire thread
              console.log('🧵 Deleting entire thread...');
              await deleteCommentThread(commentId);
              console.log('✅ Thread deleted successfully');
            } else {
              // Comment author removes only their comment
              console.log('💬 Deleting single comment...');
              await commentService.deleteComment(commentId);
              console.log('✅ Comment deleted successfully');
            }
            setDropdownVisible(null);
            // Real-time listener will update UI; also cleanup local cache list
            try {
              const raw = await AsyncStorage.getItem('userCommunityComments');
              const list = raw ? JSON.parse(raw) : [];
              const filtered = list.filter((c) => String(c.id) !== String(commentId));
              await AsyncStorage.setItem('userCommunityComments', JSON.stringify(filtered));
            } catch (_) {}
          } catch (e) {
            console.error('❌ Error deleting comment:', e);
            Alert.alert('Error', 'Failed to delete comment.');
          }
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

  const handleSend = async () => {
    const text = replyText.trim();
    if (!text) return;
    
    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Error', 'You must be signed in to comment.');
      return;
    }

    try {
      const commentData = {
        postId: post.id,
        text: text,
        authorId: user.uid,
        userId: user.uid,
        authorName: user.displayName || 'Anonymous',
        parentCommentId: replyTarget?.id || null, // null for top-level comment
      };

      console.log('📝 Creating comment:', commentData);
      const commentId = await commentService.createComment(commentData);
      console.log('✅ Comment created with ID:', commentId);

      // Add the new comment to the local state
      const newItem = {
        id: commentId,
        author: user.displayName || 'Anonymous',
        avatarColor: '#7C9AFF',
        text,
        timestamp: 'now',
        replies: [],
        userId: user.uid,
      };

      // Save user's comment to AsyncStorage for My Comments screen (community posts only)
      const persistUserComment = async () => {
        try {
          const raw = await AsyncStorage.getItem('userCommunityComments');
          const list = raw ? JSON.parse(raw) : [];
          const entry = {
            id: newItem.id,
            text: newItem.text,
            timestamp: newItem.timestamp,
            post: {
              id: post?.id,
              title: post?.title,
              text: post?.text,
              community: post?.community,
              comments: post?.comments,
            },
            passedComments: comments,
          };
          list.unshift(entry);
          await AsyncStorage.setItem('userCommunityComments', JSON.stringify(list));
        } catch (e) {
          // ignore
        }
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
        const nextComments = addReplyById(comments, replyTarget.id, newItem);
        setComments(nextComments);
        await saveCommentsForPost(post?.id, nextComments);
        await persistUserComment();
      } else {
        const nextComments = [...comments, newItem];
        setComments(nextComments);
        await saveCommentsForPost(post?.id, nextComments);
        await persistUserComment();
      }
      setReplyText('');
      setReplyTarget(null);
    } catch (error) {
      console.error('Error creating comment:', error);
      Alert.alert('Error', 'Failed to post comment. Please try again.');
    }
  };

  const handleUpvote = async (commentId) => {
    setUpvotedComments((prev) => {
      const next = new Set(prev);
      let newDownvoted = downvotedComments;
      let newVoteCounts = { ...voteCounts };
      
      if (next.has(commentId)) {
        // Remove upvote
        next.delete(commentId);
        newVoteCounts[commentId] = (newVoteCounts[commentId] || 0) - 1;
      } else {
        // Add upvote
        next.add(commentId);
        newVoteCounts[commentId] = (newVoteCounts[commentId] || 0) + 1;
        
        // Remove from downvotes if it was downvoted
        if (downvotedComments.has(commentId)) {
          newDownvoted = new Set(downvotedComments);
          newDownvoted.delete(commentId);
          newVoteCounts[commentId] = (newVoteCounts[commentId] || 0) + 1;
        }
      }
      
      // Update states
      setDownvotedComments(newDownvoted);
      setVoteCounts(newVoteCounts);
      
      // Save to AsyncStorage
      saveCommentVotes(next, newDownvoted, newVoteCounts);
      
      return next;
    });
  };

  const handleDownvote = async (commentId) => {
    setDownvotedComments((prev) => {
      const next = new Set(prev);
      let newUpvoted = upvotedComments;
      let newVoteCounts = { ...voteCounts };
      
      if (next.has(commentId)) {
        // Remove downvote
        next.delete(commentId);
        newVoteCounts[commentId] = (newVoteCounts[commentId] || 0) + 1;
      } else {
        // Add downvote
        next.add(commentId);
        newVoteCounts[commentId] = (newVoteCounts[commentId] || 0) - 1;
        
        // Remove from upvotes if it was upvoted
        if (upvotedComments.has(commentId)) {
          newUpvoted = new Set(upvotedComments);
          newUpvoted.delete(commentId);
          newVoteCounts[commentId] = (newVoteCounts[commentId] || 0) - 1;
        }
      }
      
      // Update states
      setUpvotedComments(newUpvoted);
      setVoteCounts(newVoteCounts);
      
      // Save to AsyncStorage
      saveCommentVotes(newUpvoted, next, newVoteCounts);
      
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
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Error', 'You must be signed in to send messages.');
        return;
      }

      const recipientId = messageRecipient.userId || messageRecipient.id;
      const recipientName = messageRecipient.author || 'User';
      if (!recipientId) {
        Alert.alert('Error', 'Cannot determine recipient.');
        return;
      }

      const participantsSorted = [user.uid, recipientId].sort();
      const threadKey = `${participantsSorted[0]}_${participantsSorted[1]}`;

      await messageService.createMessage({
        text: messageText.trim(),
        senderId: user.uid,
        sender: user.displayName || 'Anonymous',
        recipientId,
        recipient: recipientName,
        participants: [user.uid, recipientId],
        threadKey
      });

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

  const handleDeletePost = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Error', 'You must be signed in to delete posts.');
      return;
    }

    // Check if user is the author of the post
    if (post.authorId !== user.uid) {
      Alert.alert('Error', 'You can only delete your own posts.');
      return;
    }

    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Hard delete post and all related comments in a batch
              console.log('🗑️ Hard deleting post and all comments:', post.id);

              const batch = writeBatch(db);

              // Queue delete for all comments with this postId
              const commentsQ = fsQuery(collection(db, 'comments'), where('postId', '==', post.id));
              const commentsSnap = await getDocs(commentsQ);
              commentsSnap.forEach((d) => batch.delete(d.ref));

              // Queue delete for the post itself
              batch.delete(doc(db, 'posts', post.id));

              await batch.commit();
              console.log('✅ Post and all comments permanently deleted');

              // Remove from liked posts if it was liked
              const likedPostsData = await AsyncStorage.getItem('likedPosts');
              if (likedPostsData) {
                const likedPosts = JSON.parse(likedPostsData);
                const filteredPosts = likedPosts.filter(likedPost => likedPost.id !== post.id);
                await AsyncStorage.setItem('likedPosts', JSON.stringify(filteredPosts));
              }
              
              // Remove from created posts
              const createdPostsData = await AsyncStorage.getItem('createdPosts');
              if (createdPostsData) {
                const createdPosts = JSON.parse(createdPostsData);
                const filteredCreatedPosts = createdPosts.filter(createdPost => createdPost.id !== post.id);
                await AsyncStorage.setItem('createdPosts', JSON.stringify(filteredCreatedPosts));
              }
              
              // Navigate back to the appropriate screen based on where user came from
              const navigationState = navigation.getState();
              const previousRoute = navigationState.routes[navigationState.index - 1];
              
              if (previousRoute?.name === 'CreatedPosts') {
                navigation.navigate('CreatedPosts', { deletedPostId: post.id });
              } else {
                navigation.navigate('Home', { deletedPostId: post.id });
              }
              
              Alert.alert('Post Deleted', 'Your post has been deleted successfully.');
            } catch (error) {
              console.error('Error deleting post:', error);
              Alert.alert('Error', 'Failed to delete post. Please try again.');
            }
          },
        },
      ]
    );
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
      const isOwn = !!(auth.currentUser && (c.userId || c.authorId) && (c.userId || c.authorId) === auth.currentUser.uid);
      const canDelete = isOwn; // Only the comment author can delete their own comment

    return (
      <View
        style={[
          styles.commentRow,
          { 
            backgroundColor: theme.dark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.7)', 
            marginLeft: depth * 16 
          },
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
                  size={18} 
                  color={isUpvoted ? '#EF4444' : (isDownvoted ? '#EF4444' : theme.colors.primary)} 
                />
                <Text style={[styles.voteCount, { color: isUpvoted ? '#3E5F44' : (isDownvoted ? '#EF4444' : theme.colors.primary) }]}> 
                  {voteCounts[c.id] || 0}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        {/* 3-dots menu button with dropdown */}
        <View style={styles.menuContainer}>
          <TouchableOpacity 
            style={styles.postThreeDotsButton}
            onPress={() => toggleDropdown(c.id)}
          >
            <Ionicons name="ellipsis-vertical" size={20} color={theme.dark ? '#9CA3AF' : '#6B7280'} />
          </TouchableOpacity>
          {showDropdown && (
            <>
              <TouchableOpacity 
                style={styles.fullScreenOverlay}
                onPress={closeDropdown}
                activeOpacity={1}
              />
              <View style={[styles.postDropdownMenu, { backgroundColor: theme.colors.surface, borderColor: theme.dark ? '#374151' : '#E5E7EB', width: 120, top: -5, right: -5 }]}>
                {canDelete ? (
                  <TouchableOpacity 
                    style={styles.postDropdownItem}
                    onPress={() => {
                      closeDropdown();
                      handleDeleteComment(c.id, c.userId);
                    }}
                  >
                    <Ionicons name="trash-outline" size={16} color="#EF4444" />
                    <Text style={[styles.postDropdownText, { color: '#EF4444', marginLeft: 8 }]}>Delete</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity 
                    style={styles.postDropdownItem}
                    onPress={() => {
                      closeDropdown();
                      handleDirectMessage(c);
                    }}
                  >
                    <Ionicons name="chatbubble-outline" size={16} color={theme.colors.primary} />
                    <Text style={[styles.postDropdownText, { color: theme.colors.text, marginLeft: 8 }]}>Message</Text>
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
            <TouchableOpacity 
              style={styles.postThreeDotsButton}
              onPress={() => setShowPostDropdown(!showPostDropdown)}
            >
              <Ionicons name="ellipsis-vertical" size={20} color={theme.dark ? '#9CA3AF' : '#6B7280'} />
            </TouchableOpacity>
          </View>
          
          {showPostDropdown && (
            <>
              <TouchableOpacity 
                style={styles.dropdownOverlay}
                onPress={() => setShowPostDropdown(false)}
                activeOpacity={1}
              />
              <View style={[styles.postDropdownMenu, { backgroundColor: theme.colors.surface, borderColor: theme.dark ? '#374151' : '#E5E7EB' }]}>
              {isOwnPost ? (
                <TouchableOpacity 
                  style={styles.postDropdownItem}
                  onPress={() => {
                    setShowPostDropdown(false);
                    handleDeletePost();
                  }}
                >
                  <Ionicons name="trash-outline" size={16} color="#EF4444" />
                  <Text style={[styles.postDropdownText, { color: '#EF4444', marginLeft: 8 }]}>Delete Post</Text>
                </TouchableOpacity>
              ) : canMessagePostAuthor ? (
                <TouchableOpacity 
                  style={styles.postDropdownItem}
                  onPress={() => {
                    setShowPostDropdown(false);
                    setMessageRecipient({ id: post.authorId, author: post.authorName || displayAuthor, userId: post.authorId });
                    setShowMessageModal(true);
                  }}
                >
                  <Ionicons name="chatbubble-outline" size={16} color={theme.colors.primary} />
                  <Text style={[styles.postDropdownText, { color: theme.colors.text, marginLeft: 8 }]}>Message</Text>
                </TouchableOpacity>
              ) : null}
              </View>
            </>
          )}

          <Text style={[styles.title, { color: theme.colors.text }]}>{post.title}</Text>
          <Text style={[styles.contentText, { color: theme.colors.text }]}>{post.text}</Text>
          <View style={styles.detailActions}>
            <TouchableOpacity style={styles.postActionBtn} onPress={handleLikeToggle}>
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
          {isLoadingComments ? (
            <View style={styles.loadingContainer}>
              <Text style={[styles.loadingText, { color: theme.colors.text }]}>Loading comments...</Text>
            </View>
          ) : (
            <FlatList
              data={flatComments}
              renderItem={renderComment}
              keyExtractor={(item, index) => `${item.node?.id || index}`}
              scrollEnabled={false}
              ListEmptyComponent={
                <View style={styles.emptyCommentsContainer}>
                  <Text style={[styles.emptyCommentsText, { color: theme.colors.text }]}>
                    No comments yet. Be the first to comment!
                  </Text>
                </View>
              }
            />
          )}
        </View>
      </ScrollView>

      {replyTarget && (
        <View style={[styles.replyingTo, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.replyingText, { color: theme.colors.text }]}>Replying to {replyTarget.author}</Text>
          <TouchableOpacity onPress={() => setReplyTarget(null)}>
            <Ionicons name="close" size={16} color={theme.colors.placeholder} />
          </TouchableOpacity>
        </View>
      )}
      <View style={[styles.inputBar, { backgroundColor: theme.colors.surface }]}> 
        <TextInput
          style={[styles.input, { color: theme.colors.text }]}
          placeholder={replyTarget ? 'Write a reply...' : 'Write a comment...'}
          placeholderTextColor={theme.colors.placeholder}
          value={replyText}
          onChangeText={setReplyText}
          multiline
          maxLength={500}
        />
        <TouchableOpacity style={[styles.sendBtn, { backgroundColor: theme.colors.primary }]} onPress={handleSend}>
          <Ionicons name="send" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      <View style={{ height: 12, backgroundColor: theme.colors.surface }} />
      
      {/* Message Modal */}
      <Modal
        visible={showMessageModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMessageModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMessageModal(false)}
        >
          <TouchableOpacity 
            style={[styles.messageModal, { backgroundColor: theme.colors.surface }]}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.messageModalHeader}>
              <View style={styles.messageModalTitleContainer}>
                <Ionicons name="chatbubble-outline" size={20} color={theme.colors.primary} />
                <Text style={[styles.messageModalTitle, { color: theme.colors.text }]}>
                  Send Message
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.messageModalCloseBtn}
                onPress={() => setShowMessageModal(false)}
              >
                <Ionicons name="close" size={20} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.messageRecipientInfo}>
              <View style={[styles.messageRecipientAvatar, { backgroundColor: '#ECFDF5' }]}>
                <Text style={[styles.messageRecipientInitials, { color: '#3E5F44' }]}>
                  {(messageRecipient?.author?.replace(/^u\//i, '') || 'U').charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text style={[styles.messageRecipientName, { color: theme.colors.text }]}>
                {messageRecipient?.author?.replace(/^u\//i, '') || 'User'}
              </Text>
            </View>
            
            <View style={styles.messageInputContainer}>
              <TextInput
                style={[styles.messageInput, { 
                  color: theme.colors.text,
                  borderColor: theme.dark ? '#374151' : '#E5E7EB',
                  backgroundColor: theme.dark ? '#1F2937' : '#F9FAFB'
                }]}
                placeholder="Type your message..."
                placeholderTextColor={theme.colors.placeholder}
                value={messageText}
                onChangeText={setMessageText}
                multiline
                maxLength={500}
                textAlignVertical="top"
              />
              <TouchableOpacity
                style={[
                  styles.messageSendBtn, 
                  { 
                    backgroundColor: messageText.trim() ? theme.colors.primary : (theme.dark ? '#374151' : '#E5E7EB'),
                    opacity: messageText.trim() ? 1 : 0.6
                  }
                ]}
                onPress={handleSendMessage}
                disabled={!messageText.trim()}
              >
                <Ionicons 
                  name="send" 
                  size={18} 
                  color={messageText.trim() ? '#FFFFFF' : (theme.dark ? '#9CA3AF' : '#6B7280')} 
                />
              </TouchableOpacity>
            </View>
            
            <View style={styles.messageCharCount}>
              <Text style={[styles.messageCharCountText, { color: theme.colors.placeholder }]}>
                {messageText.length}/500
              </Text>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
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
  detailActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 12, marginBottom: 8, paddingRight: 20 },
  postActionBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 2 },
  actionText: { fontSize: 13, color: '#6B7280', marginLeft: 6, fontWeight: '600' },
  contentText: { fontSize: 14, lineHeight: 22 },
  authorRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, justifyContent: 'space-between' },
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
  authorName: { fontSize: 13, fontWeight: '600', flex: 1 },
  postThreeDotsButton: {
    padding: 4,
    borderRadius: 4,
  },
  postDropdownMenu: {
    position: 'absolute',
    top: 30,
    right: 0,
    borderRadius: 8,
    borderWidth: 1,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 1000,
  },
  postDropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  postDropdownText: {
    fontSize: 14,
    fontWeight: '500',
  },
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
  voteButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 2 },
  voteCount: {
    fontSize: 12,
    fontWeight: '600',
  },
  replyText: { fontSize: 13, fontWeight: '600' },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  emptyCommentsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyCommentsText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  inputBar: { 
    flexDirection: 'row', 
    alignItems: 'flex-end', 
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  replyingTo: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  replyingText: { fontSize: 13, fontWeight: '600' },
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
  menuContainer: {
    position: 'relative',
  },
  dropdownOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    zIndex: 999,
    backgroundColor: 'transparent',
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
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 150,
  },
  messageModal: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  messageModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  messageModalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  messageModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 8,
  },
  messageModalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  messageRecipientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.08)',
  },
  messageRecipientAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  messageRecipientInitials: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  messageRecipientName: {
    fontSize: 16,
    fontWeight: '600',
  },
  messageInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  messageInput: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginRight: 12,
    fontSize: 16,
    maxHeight: 120,
    minHeight: 50,
  },
  messageSendBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  messageCharCount: {
    alignItems: 'flex-end',
  },
  messageCharCountText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default PostDetailScreen; 