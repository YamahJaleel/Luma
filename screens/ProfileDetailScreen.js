import React, { useState, useMemo, useRef, useEffect } from 'react';
import { realtimeService, profileService, storageService, commentService, reportService, blockService } from '../services/firebaseService';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, TextInput, KeyboardAvoidingView, Platform, FlatList, Modal, Dimensions, Alert } from 'react-native';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LottieView from 'lottie-react-native';
import Animated, { useSharedValue, withSpring, withTiming, Easing, runOnJS } from 'react-native-reanimated';
import axios from 'axios';

const ProfileDetailScreen = ({ route, navigation }) => {
  const theme = useTheme();
  const { profile, fromScreen } = route.params;
  const [liveProfile, setLiveProfile] = useState(profile);
  const [isDeleting, setIsDeleting] = useState(false);

  // Keep detail in sync with Firestore
  useEffect(() => {
    if (!profile?.id) return;
    const unsubscribe = realtimeService.listenToProfile(profile.id, (doc) => {
      if (doc) {
        setLiveProfile((prev) => ({ ...prev, ...doc }));
      } else {
        // Profile was deleted, don't update state - just keep current data
        console.log('Profile deleted from Firebase, keeping current state');
      }
    });
    return () => unsubscribe && unsubscribe();
  }, [profile?.id]);

  // Load Firebase comments
  useEffect(() => {
    if (!profile?.id || isDeleting) return;
    
    // Set loading state when starting to load comments
    setIsLoadingComments(true);
    
    const unsubscribe = realtimeService.listenToProfileComments(profile.id, (firebaseComments) => {
      // Don't update comments if we're in the process of deleting
      if (isDeleting) return;
      
      // Sort comments: original poster first, then by creation time
      const sortedComments = firebaseComments.sort((a, b) => {
        if (a.isOriginalPoster && !b.isOriginalPoster) return -1;
        if (!a.isOriginalPoster && b.isOriginalPoster) return 1;
        return new Date(a.createdAt?.toDate?.() || 0) - new Date(b.createdAt?.toDate?.() || 0);
      });
      
      // Convert Firebase comments to the expected format
      const formattedComments = sortedComments.map(comment => ({
        id: comment.id,
        author: comment.authorName || comment.userName || comment.userId,
        text: comment.text,
        timestamp: comment.createdAt?.toDate?.()?.toLocaleDateString() || 'now',
        isOriginalPoster: comment.isOriginalPoster || false,
        replies: comment.replies || []
      }));
      
      setFirebaseComments(formattedComments);
      setIsLoadingComments(false); // Comments loaded
    });
    return () => unsubscribe && unsubscribe();
  }, [profile?.id, isDeleting]);

  // Local avatar support (mirrors SearchScreen): static requires so Metro can bundle images
  const LOCAL_AVATARS = [
    require('../assets/profiles/pexels-albert-bilousov-210750737-12471262.jpg'),
    require('../assets/profiles/pexels-cottonbro-4100484.jpg'),
    require('../assets/profiles/pexels-cottonbro-4812648.jpg'),
    require('../assets/profiles/pexels-cottonbro-7654096.jpg'),
    require('../assets/profiles/pexels-cottonbro-8209192.jpg'),
    require('../assets/profiles/pexels-david-garrison-1128051-2128807.jpg'),
    require('../assets/profiles/pexels-ekaterinabelinskaya-4923041.jpg'),
    require('../assets/profiles/pexels-jeffreyreed-769772.jpg'),
    require('../assets/profiles/pexels-ketut-subiyanto-4584262.jpg'),
    require('../assets/profiles/pexels-mart-production-7290614.jpg'),
    require('../assets/profiles/pexels-olly-3779489.jpg'),
    require('../assets/profiles/pexels-salvador-olague-682304070-17910228.jpg'),
    require('../assets/profiles/pexels-shvets-production-6975110.jpg'),
    require('../assets/profiles/pexels-silverkblack-30535621.jpg'),
    require('../assets/profiles/pexels-waldirevora-15037720.jpg'),
    require('../assets/profiles/pexels-yankrukov-7315748.jpg'),
    require('../assets/profiles/pexels-yaroslav-shuraev-6283228.jpg'),
  ];

  const getAvatarSource = (index, remoteUri) => {
    if (index >= 0 && index < LOCAL_AVATARS.length) return LOCAL_AVATARS[index];
    return { uri: remoteUri };
  };

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

  // AI Overview via backend (summarize first 6 top-level comments)
  const BACKEND_URL = 'https://proxyyyyyyy2.onrender.com/chat';

  const cleanResponse = (text) => {
    return (text || '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/#{1,6}\s/g, '')
      .replace(/`/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .trim();
  };

  const shortenText = (t, maxLen = 200) => {
    const s = (t || '').replace(/\s+/g, ' ').trim();
    if (!s) return '';
    return s.length <= maxLen ? s : s.slice(0, maxLen - 1) + '…';
  };


  // Simple AI overview text synthesized from profile signals
  const overviewText = (() => {
    const risk = getRiskLevelText(profile.riskLevel || 'green'); // Default to green if not specified
    const flags = Array.isArray(profile.flags) ? profile.flags : [];
    const positives = flags.filter((f) => ['trustworthy','responsive','genuine','verified','helpful','community_leader','trusted','friendly','active','new_user'].includes(f));
    const cautions = flags.filter((f) => ['inconsistent','ghosting','unreliable','catfish','fake_profile','harassment','aggressive','inappropriate'].includes(f));
    const posPart = positives.length ? `Positive signals: ${positives.map((f) => f.replace('_',' ')).join(', ')}.` : '';
    const cauPart = cautions.length ? ` Cautionary signals: ${cautions.map((f) => f.replace('_',' ')).join(', ')}.` : '';
    return `Overview: ${risk} overall. ${posPart}${cauPart}`.trim();
  })();

  // removed expandedAiText in favor of rendering bullet lines directly



  const [firebaseComments, setFirebaseComments] = useState([]);
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const originalPosterName = useMemo(() => {
    try {
      // All profiles are created by someone else, so we use the profile name
      return profile?.name || 'Unknown';
    } catch {
      return 'Unknown';
    }
  }, [profile]);
  const [replyText, setReplyText] = useState('');
  const [replyTarget, setReplyTarget] = useState(null); // null for profile-level comment
  const [upvotedComments, setUpvotedComments] = useState(new Set()); // Track upvoted comments
  const [downvotedComments, setDownvotedComments] = useState(new Set()); // Track downvoted comments
  const [voteCounts, setVoteCounts] = useState({}); // Track vote counts for each comment
  const [selectedComment, setSelectedComment] = useState(null); // for long-press selection
  const [dropdownVisible, setDropdownVisible] = useState(null); // Track which comment's dropdown is visible
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false); // three-dots in header
  const isUserCreatedProfile = auth.currentUser?.uid === liveProfile?.userId;
  
  // Message modal state
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [messageRecipient, setMessageRecipient] = useState(null);
  


  // Animation values
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const flatComments = useMemo(() => {
    // Only use Firebase comments - no mock data
      return firebaseComments.map(comment => ({ node: comment, depth: 0 }));
  }, [firebaseComments]);


  const handleSend = async () => {
    const text = replyText.trim();
    if (!text || !profile?.id) return;
    
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Error', 'You must be signed in to comment.');
        return;
      }

      const commentData = {
        profileId: profile.id,
        text: text,
        authorName: user.displayName || user.email?.split('@')[0] || 'Anonymous',
        userId: user.uid,
        isOriginalPoster: false,
        parentCommentId: replyTarget?.id || null,
      };

      await commentService.createComment(commentData);
      
    setReplyText('');
    setReplyTarget(null);
    } catch (error) {
      console.error('Error creating comment:', error);
      Alert.alert('Error', 'Failed to create comment. Please try again.');
    }
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
        // Trigger thumb animation
        setThumbAnimations(prev => ({
          ...prev,
          [commentId]: Date.now()
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
    setMessageRecipient({
      author: comment.author,
      id: comment.id
    });
    setShowMessageModal(true);
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !messageRecipient) return;
    
    try {
      const existingMessages = await AsyncStorage.getItem('messages');
      const messages = existingMessages ? JSON.parse(existingMessages) : [];
      
      const newMessage = {
        id: Date.now().toString(),
        recipient: messageRecipient.author,
        recipientId: messageRecipient.id,
        text: messageText.trim(),
        timestamp: new Date().toISOString(),
        sender: 'luma user',
        senderId: 'current_user',
      };
      
      messages.push(newMessage);
      await AsyncStorage.setItem('messages', JSON.stringify(messages));
      
      setShowMessageModal(false);
      setMessageText('');
      setMessageRecipient(null);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleCancelSelection = () => {
    setSelectedComment(null);
  };

  // Handle report profile
  const handleReportProfile = () => {
    Alert.alert(
      'Report Profile',
      'Are you sure you want to report this profile?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Report', 
          style: 'destructive',
          onPress: async () => {
            try {
              await reportService.submitReport({
                itemType: 'profile',
                itemId: profile?.id,
                itemOwnerId: profile?.userId,
                reporterId: auth.currentUser.uid,
                reason: 'inappropriate_content',
                description: `Reported profile: ${profile?.name}`
              });
              // Check for auto-hide
              await reportService.checkAndAutoHide('profile', profile?.id);
              Alert.alert('Report Submitted', 'Thank you for your report. We will review it.');
            } catch (error) {
              console.error('Error reporting profile:', error);
              Alert.alert('Error', 'Failed to submit report. Please try again.');
            }
          }
        }
      ]
    );
  };

  const toggleDropdown = (commentId) => {
    setDropdownVisible(dropdownVisible === commentId ? null : commentId);
  };

  const closeDropdown = () => {
    setDropdownVisible(null);
  };

  const handleDeleteProfile = async () => {
    try {
      // Show confirmation dialog
      Alert.alert(
        'Delete Profile',
        'Are you sure you want to permanently delete this profile? This action cannot be undone.',
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
                // Set deletion flag to prevent state updates
                setIsDeleting(true);
                
                // Immediately navigate away to prevent any state updates
                const returnScreen = fromScreen || 'Search';
                
                // Delete profile image from Firebase Storage if it exists
                if (profile?.avatar && profile.avatar.startsWith('https://firebasestorage.googleapis.com/')) {
                  try {
                    // Extract the path from the Firebase Storage URL
                    const url = new URL(profile.avatar);
                    const pathMatch = url.pathname.match(/\/o\/(.+)\?/);
                    if (pathMatch) {
                      const imagePath = decodeURIComponent(pathMatch[1]);
                      await storageService.deleteImage(imagePath);
                      console.log('✅ Profile image deleted from storage');
                    }
                  } catch (imageError) {
                    console.warn('⚠️ Failed to delete profile image:', imageError);
                    // Continue with profile deletion even if image deletion fails
                  }
                }

                // Hard delete profile from Firebase Firestore
                await profileService.deleteProfile(profile.id);
                console.log('✅ Profile deleted from Firebase');

                // Remove from AsyncStorage list of user profiles
                const stored = await AsyncStorage.getItem('userProfiles');
                const list = stored ? JSON.parse(stored) : [];
                const next = Array.isArray(list) ? list.filter((p) => p.id !== profile.id) : [];
                await AsyncStorage.setItem('userProfiles', JSON.stringify(next));

                // Navigate back immediately
                navigation.navigate(returnScreen, { deletedProfileId: profile.id });
              } catch (deleteError) {
                console.error('❌ Failed to delete profile:', deleteError);
                Alert.alert('Error', 'Failed to delete profile. Please try again.');
                setIsDeleting(false); // Reset flag on error
              }
            },
          },
        ]
      );
    } catch (e) {
      console.warn('Failed to show delete confirmation', e);
    } finally {
      setHeaderMenuOpen(false);
    }
  };


  const handleDeleteComment = async (commentId) => {
    try {
      await commentService.deleteComment(commentId);
    if (dropdownVisible === commentId) closeDropdown();
    } catch (error) {
      console.error('Error deleting comment:', error);
      Alert.alert('Error', 'Failed to delete comment. Please try again.');
    }
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
    
    // Check if current user is the profile owner
    const isCurrentUserProfileOwner = auth.currentUser?.uid === liveProfile?.userId;
    
    // Check if this is an OP comment (owner note or marked as original poster)
    const isOPComment = isOwnerNote || c.isOriginalPoster;
    
    // Hide three dots menu for OP comments if current user is the profile owner
    const shouldHideThreeDots = isOPComment && isCurrentUserProfileOwner;

    return (
      <View
        style={[
          styles.commentRow,
          styles.ownerNoteTab,
          { 
            marginLeft: depth * 16,
            backgroundColor: theme.dark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.7)',
            borderColor: theme.dark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.3)',
          },
        ]}
      >
        <View style={styles.commentBody}>
          <View style={styles.commentHeader}>
            <View style={styles.authorRow}>
              <View style={styles.commentAvatar}>
                <Text style={styles.avatarText}>
                  {(c.author || 'U').replace(/^u\//i, '').charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={[styles.commentAuthor, { color: theme.colors.text }]} numberOfLines={1}>
                  {c.author}
                </Text>
                {(c.id === 'owner-note' || c.isOriginalPoster) && (
                  <View style={styles.opBadge}>
                    <Text style={styles.opBadgeText}>OP</Text>
                  </View>
                )}
              </View>
            </View>
            <Text style={[styles.commentTime, { color: theme.dark ? theme.colors.text : '#9CA3AF' }]}>{c.timestamp}</Text>
          </View>
          <Text style={[styles.commentText, { color: theme.colors.text }]}>{c.text}</Text>
          
          <View style={styles.linkRow}>
            <View style={styles.leftActions}>
              <TouchableOpacity style={styles.replyLink} onPress={() => setReplyTarget({ id: c.id, author: c.author })}>
                <Text style={[styles.replyText, { color: theme.colors.primary }]}>Reply</Text>
              </TouchableOpacity>
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
                {isUpvoted ? (
                  <LottieView
                    source={require('../assets/animations/Thumb.json')}
                    style={{ width: 20, height: 20 }}
                    autoPlay={false}
                    loop={false}
                    ref={(ref) => {
                      if (ref && thumbAnimations[c.id]) {
                        ref.play();
                      }
                    }}
                  />
                ) : (
                  <Ionicons 
                    name="heart-outline" 
                    size={18} 
                    color={isDownvoted ? '#EF4444' : theme.colors.primary} 
                  />
                )}
                <Text style={[styles.voteCount, { color: isUpvoted ? '#EF4444' : isDownvoted ? '#EF4444' : theme.colors.primary }]}>
                  {voteCounts[c.id] || 0}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        {/* 3-dots menu button with dropdown - hide for OP comments when user is profile owner */}
        {!shouldHideThreeDots && (
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
                {c.author === 'luma user' ? (
                  <TouchableOpacity 
                    style={[styles.dropdownItem, { backgroundColor: theme.colors.surface }]}
                    onPress={() => handleDeleteComment(c.id)}
                  >
                    <Ionicons name="trash-outline" size={16} color="#EF4444" />
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
        )}
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
        <Text style={[styles.headerTitle, { color: theme.colors.text }]} numberOfLines={1}>{liveProfile?.name}</Text>
        <View style={styles.menuContainer}>
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => setHeaderMenuOpen((v) => !v)}
          >
            <Ionicons name="ellipsis-vertical" size={16} color={theme.colors.placeholder} />
          </TouchableOpacity>
          {headerMenuOpen && (
            <>
              {/* Touchable overlay to close dropdown when tapping outside */}
              <TouchableOpacity 
                style={styles.dropdownOverlay}
                onPress={() => setHeaderMenuOpen(false)}
                activeOpacity={1}
              />
              <View style={[styles.dropdown, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}> 
                {isUserCreatedProfile ? (
                  <TouchableOpacity 
                    style={[styles.dropdownItem, { backgroundColor: theme.colors.surface }]}
                    onPress={handleDeleteProfile}
                  >
                    <Ionicons name="trash-outline" size={16} color="#EF4444" />
                    <Text style={[styles.dropdownText, { color: theme.colors.text }]}>Delete Profile</Text>
                  </TouchableOpacity>
                ) : (
                  <>
                    <TouchableOpacity 
                      style={[styles.dropdownItem, { backgroundColor: theme.colors.surface }]}
                      onPress={handleReportProfile}
                    >
                      <Ionicons name="flag-outline" size={16} color={theme.colors.primary} />
                      <Text style={[styles.dropdownText, { color: theme.colors.text }]}>Report Profile</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </>
          )}
        </View>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        // Web-specific scrolling fix
        {...(Platform.OS === 'web' && {
          style: [styles.content, { height: '100vh', overflow: 'auto' }],
        })}
      >
        {/* Profile Image and Basic Info */}
        <View style={styles.profileSection}>
          <View style={[
            styles.imageContainer,
            { backgroundColor: theme.dark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.75)' }
          ]}>
            <Image 
              source={getAvatarSource((liveProfile?.id || 1) - 1, liveProfile?.avatar)}
              style={[
                styles.profileImage,
                { backgroundColor: theme.dark ? 'rgba(0, 0, 0, 0.2)' : 'white' }
              ]}
              resizeMode="cover"
            />
          </View>
        </View>
        


        {/* Discussion */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}> 
          <View style={styles.commentsHeader}>
          </View>
          {isLoadingComments ? (
            <View style={styles.loadingContainer}>
              <LottieView
                source={require('../assets/animations/Loading Dots Blue.json')}
                autoPlay
                loop
                style={{ width: 60, height: 24 }}
              />
              <Text style={[styles.loadingText, { color: theme.colors.text }]}>Loading comments...</Text>
            </View>
          ) : (
          <FlatList
            data={flatComments}
            renderItem={renderComment}
            keyExtractor={(item) => `${item.node.id}`}
            scrollEnabled={false}
          />
          )}
        </View>
      </ScrollView>

      {/* Replying to indicator above the input bar */}
      {replyTarget && (
        <View style={styles.replyingToContainer}>
          <View style={styles.replyingTo}>
            <Text style={[styles.replyingText, { color: theme.colors.text }]}>Replying to {replyTarget.author}</Text>
            <TouchableOpacity onPress={() => setReplyTarget(null)}>
              <Ionicons name="close" size={16} color={theme.colors.placeholder} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={[styles.inputBar, { backgroundColor: theme.colors.surface }]}> 
        <TextInput
          style={[styles.input, { color: theme.colors.text }]}
          placeholder={replyTarget ? 'Write a reply...' : 'Share your experience'}
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
        transparent
        animationType="slide"
        onRequestClose={() => setShowMessageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.messageModal, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                Send Message to {messageRecipient?.author?.replace(/^u\//i, '') || 'User'}
              </Text>
              <TouchableOpacity onPress={() => setShowMessageModal(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.messageInputContainer}>
              <TextInput
                style={[styles.messageInput, { color: theme.colors.text }]}
                placeholder="Type your message..."
                placeholderTextColor={theme.colors.placeholder}
                value={messageText}
                onChangeText={setMessageText}
                multiline
                maxLength={500}
                autoFocus
              />
              <TouchableOpacity 
                style={[styles.modalButton, styles.sendButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleSendMessage}
                disabled={!messageText.trim()}
              >
                <Ionicons 
                  name="send" 
                  size={20} 
                  color={messageText.trim() ? '#FFFFFF' : theme.colors.placeholder} 
                />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={[styles.modalButton, styles.cancelButton, { borderColor: theme.colors.outline }]}
              onPress={() => setShowMessageModal(false)}
            >
              <Text style={[styles.cancelButtonText, { color: theme.colors.text }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    paddingHorizontal: 0,
    paddingBottom: 10,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
    imageContainer: { position: 'relative', marginBottom: 6.5, width: 320, height: 320, alignSelf: 'center', borderTopLeftRadius: 16, borderTopRightRadius: 16, borderBottomLeftRadius: 12, borderBottomRightRadius: 12, overflow: 'hidden', padding: 8 },
  profileImage: { width: '100%', height: '100%', borderTopLeftRadius: 16, borderTopRightRadius: 16, borderBottomLeftRadius: 12, borderBottomRightRadius: 12 },
  
  profileName: { fontSize: 22, fontWeight: 'bold', marginBottom: 4 },


  section: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
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
    borderRadius: 12,
    borderWidth: 1,
  },
  commentBody: { flex: 1 },
  commentHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  commentAuthor: { fontSize: 15, fontWeight: 'bold' },
  opBadge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  opBadgeText: { fontSize: 10, fontWeight: '800', color: '#065F46' },
  commentTime: { fontSize: 13 },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  commentAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  avatarText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#3E5F44',
  },
  commentText: { fontSize: 14, lineHeight: 22, marginTop: 4 },
  replyLink: { fontSize: 13, fontWeight: '600' },
  linkRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginTop: 6 },
  leftActions: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  votingButtons: { flexDirection: 'row', alignItems: 'center', gap: 12 },

  commentSeparator: { height: 10 },
  inputBar: { 
    flexDirection: 'row', 
    alignItems: 'flex-end', 
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  replyingToContainer: { backgroundColor: '#F3F4F6', paddingHorizontal: 20, paddingVertical: 8 },
  replyingTo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
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
  trustIndicatorsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 },
  trustIndicatorItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F7FAFC', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginRight: 8, marginBottom: 8 },
  trustIndicatorText: { fontSize: 13, fontWeight: '600', marginLeft: 4, textTransform: 'capitalize' },
  upvoteButton: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  downvoteButton: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  voteButton: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  voteCount: { fontSize: 12, fontWeight: '600' },
  ownerNoteTab: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
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
    width: 150,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
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
    paddingRight: 4,
  },
  dropdownOverlay: {
    position: 'absolute',
    top: -1000,
    left: -1000,
    right: -1000,
    bottom: -1000,
    zIndex: 999,
  },
  // Message modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageModal: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  messageInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    fontSize: 16,
    maxHeight: 100,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  flagButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
    marginTop: 20,
    paddingHorizontal: 20,
  },
  feedbackContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: -15,
    marginBottom: 20,
    paddingHorizontal: 20,
    gap: 6,
    minHeight: 100,
  },
  whatPeopleSayingBox: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  whatPeopleSayingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  whatPeopleSayingText: {
    fontSize: 14,
    lineHeight: 20,
  },
  expandedAIOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 9999,
  },
  expandedAIContent: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  flagButtonsContainerRight: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: -5,
    marginLeft: 'auto',
  },
  flagButtonWrapper: {
    alignItems: 'center',
    gap: 2,
  },
  flagButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    width: 70,
    height: 70,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  greenFlagButton: {
    borderColor: 'transparent',
    backgroundColor: 'transparent',
  },
  redFlagButton: {
    borderColor: 'transparent',
    backgroundColor: 'transparent',
  },
  flagButtonActive: {
    // This will be overridden by specific button styles
  },
  activeVoteButton: {
    backgroundColor: 'rgba(62, 95, 68, 0.1)',
    borderColor: '#3E5F44',
    borderWidth: 2,
  },
  flagButtonText: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  flagCountText: {
    fontSize: 16,
    fontWeight: '700',
  },
  lottieAnimation: {
    width: 70,
    height: 70,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ProfileDetailScreen; 
