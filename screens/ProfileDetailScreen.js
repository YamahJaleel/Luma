import React, { useState, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, TextInput, KeyboardAvoidingView, Platform, FlatList, Modal, Dimensions } from 'react-native';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LottieView from 'lottie-react-native';
import Animated, { useSharedValue, withSpring, withTiming, Easing, runOnJS } from 'react-native-reanimated';
import axios from 'axios';

const ProfileDetailScreen = ({ route, navigation }) => {
  const theme = useTheme();
  const { profile, fromScreen } = route.params;

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

  const [aiOverview, setAiOverview] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);

  // Simple AI overview text synthesized from profile signals
  const overviewText = (() => {
    const risk = getRiskLevelText(profile.riskLevel);
    const positives = profile.flags.filter((f) => ['trustworthy','responsive','genuine','verified','helpful','community_leader','trusted','friendly','active','new_user'].includes(f));
    const cautions = profile.flags.filter((f) => ['inconsistent','ghosting','unreliable','catfish','fake_profile','harassment','aggressive','inappropriate'].includes(f));
    const posPart = positives.length ? `Positive signals: ${positives.map((f) => f.replace('_',' ')).join(', ')}.` : '';
    const cauPart = cautions.length ? ` Cautionary signals: ${cautions.map((f) => f.replace('_',' ')).join(', ')}.` : '';
    return `Overview: ${risk} overall. ${posPart}${cauPart}`.trim();
  })();

  // removed expandedAiText in favor of rendering bullet lines directly

  // Threaded comments (profile discussion)
  const makeMockComments = () => {
    const items = [];
    
    // Only add mock community comments for established profiles (not new ones)
    // New profiles use Date.now() for ID, which will be much larger than mock profile IDs (1-30)
    if (profile?.id && profile.id > 10000) { 
      // For new profiles, show owner note with bio or default message
      if (profile?.bio && profile.bio.trim()) {
        const ownerNote = profile.bio.trim();
        items.push({
          id: 'owner-note',
          author: 'luma user',
          avatarColor: '#7C9AFF',
          text: ownerNote,
          timestamp: 'now',
          replies: [],
        });
      } else {
        // For new profiles without bio, add a default owner note
        items.push({
          id: 'owner-note',
          author: 'luma user',
          avatarColor: '#7C9AFF',
          text: 'This is a new profile. Share your experiences and help keep the community safe.',
          timestamp: 'now',
          replies: [],
        });
      }
      return items; // Return early for new profiles
    }
    
    // For established profiles, add a profile-specific owner note with pseudonym
    if (!profile?.bio || !profile.bio.trim()) {
      const generateOwnerNote = (profileId) => {
        const ownerNotes = {
          1: { // Tyler Bradshaw
            author: 'Vyntra7',
            text: 'I created this profile to warn others about Tyler. He seemed charming at first but quickly became pushy and aggressive. Please be careful if you match with him.',
            timestamp: '2h ago'
          },
        2: { // Jake Thompson
          author: 'Kynora118',
          text: 'I\'m sharing my experience with Jake here. He ghosted me after weeks of great conversation. I want to help others avoid the same disappointment.',
          timestamp: '1d ago'
        },
          3: { // Mike Johnson
            author: 'Arctynx54',
            text: 'I created this profile to share positive experiences with Mike. He\'s been respectful, reliable, and genuine. A rare find in the dating world!',
            timestamp: '3h ago'
          },
        4: { // Ryan Miller
          author: 'Solvian3',
          text: 'I\'m warning others about Ryan. His photos are heavily edited and he looks completely different in person. Don\'t waste your time like I did.',
          timestamp: '4h ago'
        },
          5: { // Brian Ochieng
            author: 'Dravex92',
            text: 'I created this profile to highlight Brian\'s helpfulness. He\'s given me great dating advice and is genuinely supportive. A trustworthy person!',
            timestamp: '6h ago'
          },
        6: { // Chris Anderson
          author: 'Lyrixon41',
          text: 'I created this profile to highlight Chris\'s community leadership. He\'s organized amazing volunteer events and always puts others first.',
          timestamp: '1d ago'
        },
        7: { // Raj Patel
          author: 'Umbren204',
          text: 'I created this profile to share my experience with Raj. He\'s unreliable and has cancelled on me multiple times.',
          timestamp: '2d ago'
        },
        8: { // Brandon Green
          author: 'Umbren204',
          text: 'I created this profile to warn others about Brandon. He\'s been reported for harassment and fake profile claims.',
          timestamp: '3d ago'
        },
        9: { // James Brown
          author: 'Umbren204',
          text: 'I created this profile to highlight James\'s music talents. He\'s a great DJ and music producer.',
          timestamp: '1d ago'
        },
        10: { // Kevin Davis
          author: 'Umbren204',
          text: 'I created this profile to share my experience with Kevin. He\'s inconsistent with following through on plans.',
          timestamp: '2d ago'
        }
        };
        
        return ownerNotes[profileId] || {
          author: 'Umbren204',
          text: 'I created this profile to share my experience. Please add your own experiences to help keep our community safe.',
          timestamp: '2h ago'
        };
      };
      
      const ownerNote = generateOwnerNote(profile?.id);
      items.push({
        id: 'owner-note',
        author: ownerNote.author,
        avatarColor: '#7C9AFF',
        text: ownerNote.text,
        timestamp: ownerNote.timestamp,
        replies: [],
      });
    }
    // Generate unique comments based on profile
    const generateProfileComments = (profileId) => {
      const commentSets = {
        1: [ // Tyler Bradshaw
          {
            id: 1,
            author: 'Zephra65',
            avatarColor: '#EF4444',
            text: '🚩🚩🚩 Met Tyler last week and he was extremely pushy about meeting at his place. When I said no, he got really aggressive and started calling me names. Stay away!',
            timestamp: '2h ago',
            replies: [
              {
                id: 11,
                author: 'Caelix5',
                avatarColor: '#8B5CF6',
                text: 'Oh my god, that\'s terrifying! Thank you for sharing this. Did you report him?',
                timestamp: '1h ago',
                replies: [],
              },
              {
                id: 12,
                author: 'Zephra65',
                avatarColor: '#EF4444',
                text: 'Yes, I reported him immediately. The way he switched from charming to aggressive was so scary.',
                timestamp: '45m ago',
                replies: [],
              },
            ],
          },
          {
            id: 2,
            author: 'Mystra84',
            avatarColor: '#10B981',
            text: 'I actually had a different experience with Tyler. We met for coffee and he was really nice and respectful. But reading these comments is making me question everything...',
            timestamp: '3h ago',
            replies: [
              {
                id: 21,
                author: 'Ecliptor9',
                avatarColor: '#F59E0B',
                text: 'That\'s exactly how these guys work! They\'re nice at first to gain your trust. Please be careful.',
                timestamp: '2h ago',
                replies: [],
              },
            ],
          },
          {
            id: 3,
            author: 'Novelle62',
            avatarColor: '#3B82F6',
            text: 'Tyler tried to pressure me into sending nudes on the first day of talking. When I refused, he said I was "prudish" and unmatched me. Bullet dodged!',
            timestamp: '4h ago',
            replies: [],
          },
        ],
        2: [ // Jake Thompson
          {
            id: 1,
            author: 'Lumara203',
            avatarColor: '#EC4899',
            text: 'Jake seemed nice at first but he\'s a total ghost. We had great conversations for a week, then he just disappeared mid-conversation. No explanation, nothing.',
            timestamp: '1d ago',
            replies: [
              {
                id: 11,
                author: 'Voxen18',
                avatarColor: '#8B5CF6',
                text: 'Same thing happened to me! We were supposed to meet for coffee and he just stopped responding the day before.',
                timestamp: '20h ago',
                replies: [],
              },
            ],
          },
          {
            id: 2,
            author: 'Auren97',
            avatarColor: '#F97316',
            text: 'Jake is inconsistent with communication. Sometimes he\'s super responsive, other times he takes days to reply. It\'s confusing and frustrating.',
            timestamp: '2d ago',
            replies: [],
          },
        ],
        3: [ // Mike Johnson
          {
            id: 1,
            author: 'Krysen44',
            avatarColor: '#059669',
            text: 'Mike is genuinely a great guy! We\'ve been talking for a few weeks and he\'s been respectful, funny, and reliable. He always shows up when he says he will.',
            timestamp: '3h ago',
            replies: [
              {
                id: 11,
                author: 'Thalara2',
                avatarColor: '#DC2626',
                text: 'That\'s so refreshing to hear! It\'s nice to see positive experiences shared here too.',
                timestamp: '2h ago',
                replies: [],
              },
            ],
          },
          {
            id: 2,
            author: 'Jyntra122',
            avatarColor: '#EF4444',
            text: 'Mike has been really good at communicating his intentions clearly. No games, no mixed signals. He\'s been a breath of fresh air.',
            timestamp: '1d ago',
            replies: [],
          },
        ],
        4: [ // Ryan Miller
          {
            id: 1,
            author: 'Virex56',
            avatarColor: '#8B5CF6',
            text: '⚠️ Ryan is NOT who he claims to be. His photos are heavily filtered/edited and he looks completely different in person. Total catfish situation.',
            timestamp: '4h ago',
            replies: [
              {
                id: 11,
                author: 'Astryn300',
                avatarColor: '#3B82F6',
                text: 'I had the same experience! The photos were from years ago and heavily edited. Very misleading.',
                timestamp: '3h ago',
                replies: [],
              },
            ],
          },
          {
            id: 2,
            author: 'Tenebra4',
            avatarColor: '#F59E0B',
            text: 'Ryan was very aggressive and inappropriate in his messages. He kept sending unsolicited photos and got angry when I didn\'t respond the way he wanted.',
            timestamp: '1d ago',
            replies: [],
          },
        ],
        5: [ // Brian Ochieng
          {
            id: 1,
            author: 'Mystra84',
            avatarColor: '#10B981',
            text: 'Brian is super helpful and genuine! He gave me great advice about dating safety and was really supportive when I shared some concerns.',
            timestamp: '6h ago',
            replies: [
              {
                id: 11,
                author: 'Nexra27',
                avatarColor: '#EC4899',
                text: 'I\'ve had similar experiences with Brian. He\'s really knowledgeable and caring.',
                timestamp: '5h ago',
                replies: [],
              },
            ],
          },
          {
            id: 2,
            author: 'Aetheron81',
            avatarColor: '#8B5CF6',
            text: 'Brian is verified and has been consistently helpful in the community. He\'s someone you can trust for good advice.',
            timestamp: '2d ago',
            replies: [],
          },
        ],
        6: [ // Chris Anderson
          {
            id: 1,
            author: 'Lynix11',
            avatarColor: '#F97316',
            text: 'Chris organized an amazing food drive last month. He\'s incredibly dedicated to helping the community and always follows through on his commitments.',
            timestamp: '1d ago',
            replies: [
              {
                id: 11,
                author: 'Valtor105',
                avatarColor: '#059669',
                text: 'I\'ve worked with Chris on several events. He\'s reliable, organized, and truly cares about making a difference.',
                timestamp: '20h ago',
                replies: [],
              },
            ],
          },
          {
            id: 2,
            author: 'Serenix6',
            avatarColor: '#DC2626',
            text: 'Chris has been a community leader for years. He\'s trustworthy, helpful, and always puts others first. Highly recommended!',
            timestamp: '3d ago',
            replies: [],
          },
        ],
        7: [ // Raj Patel
          {
            id: 1,
            author: 'Onyrix73',
            avatarColor: '#10B981',
            text: 'Raj is unreliable. He\'s cancelled on me three times at the last minute with weak excuses. I\'ve given up trying to make plans with him.',
            timestamp: '2h ago',
            replies: [
              {
                id: 11,
                author: 'Ecliptor9',
                avatarColor: '#F59E0B',
                text: 'Same here! He seems nice in messages but never follows through with plans.',
                timestamp: '1h ago',
                replies: [],
              },
            ],
          },
          {
            id: 2,
            author: 'Arclen209',
            avatarColor: '#8B5CF6',
            text: 'Raj has been reported for being unreliable by multiple people. He seems to have commitment issues with actually meeting up.',
            timestamp: '1d ago',
            replies: [],
          },
        ],
        8: [ // Brandon Green
          {
            id: 1,
            author: 'Noctra35',
            avatarColor: '#059669',
            text: 'Brandon is super friendly and always responds quickly. We\'ve had great conversations!',
            timestamp: '3h ago',
            replies: [],
          },
          {
            id: 2,
            author: 'Velix88',
            avatarColor: '#EC4899',
            text: 'Brandon is very active in the community and always helpful. Highly recommend!',
            timestamp: '5h ago',
            replies: [],
          },
        ],
        9: [ // James Brown
          {
            id: 1,
            author: 'Zyntra7',
            avatarColor: '#EF4444',
            text: '⚠️ James was very aggressive in his messages and made inappropriate comments. Stay away!',
            timestamp: '4h ago',
            replies: [
              {
                id: 11,
                author: 'Ecliptor9',
                avatarColor: '#F59E0B',
                text: 'Thank you for reporting this. Did you report him to the platform?',
                timestamp: '3h ago',
                replies: [],
              },
            ],
          },
          {
            id: 2,
            author: 'Morvyn42',
            avatarColor: '#DC2626',
            text: 'James has been reported multiple times for harassment. He\'s not safe to interact with.',
            timestamp: '1d ago',
            replies: [],
          },
        ],
        10: [ // Kevin Davis
          {
            id: 1,
            author: 'Cryden134',
            avatarColor: '#8B5CF6',
            text: 'Kevin promised to cook dinner for our group but cancelled last minute saying he was sick. Then I saw him posting about being at a restaurant.',
            timestamp: '6h ago',
            replies: [],
          },
          {
            id: 2,
            author: 'Aetheron81',
            avatarColor: '#10B981',
            text: 'Kevin\'s food photos look amazing but he\'s really inconsistent with following through on plans. We\'ve had several dinner plans fall through.',
            timestamp: '1d ago',
            replies: [],
          },
        ],
      };
      
      return commentSets[profileId] || [];
    };
    
    const profileComments = generateProfileComments(profile?.id);
    items.push(...profileComments);
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
  const originalPosterName = useMemo(() => {
    try {
      // For new profiles, the current user is always the OP
      if (profile?.id && profile.id > 10000) {
        return 'luma user';
      }
      // For established profiles, find the owner note
      const owner = comments?.find?.((n) => n?.id === 'owner-note');
      return owner?.author || null;
    } catch {
      return null;
    }
  }, [comments, profile]);
  const [replyText, setReplyText] = useState('');
  const [replyTarget, setReplyTarget] = useState(null); // null for profile-level comment
  const [expandedThreads, setExpandedThreads] = useState(new Set()); // top-level ids expanded
  const [upvotedComments, setUpvotedComments] = useState(new Set()); // Track upvoted comments
  const [downvotedComments, setDownvotedComments] = useState(new Set()); // Track downvoted comments
  const [voteCounts, setVoteCounts] = useState({}); // Track vote counts for each comment
  const [selectedComment, setSelectedComment] = useState(null); // for long-press selection
  const [dropdownVisible, setDropdownVisible] = useState(null); // Track which comment's dropdown is visible
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false); // three-dots in header
  const isUserCreatedProfile = !!(profile?.id && profile.id > 10000);
  
  // Message modal state
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [messageRecipient, setMessageRecipient] = useState(null);
  
  // Flag state
  const getSimulatedVoteCounts = (profileId) => {
    const voteCounts = {
      1: { green: 12, red: 8 },    // Tyler Bradshaw - mixed reviews
      2: { green: 25, red: 3 },    // Jake Thompson - mostly positive
      3: { green: 2, red: 18 },    // Mike Johnson - mostly negative
      4: { green: 28, red: 1 },    // Ryan Miller - very positive
      5: { green: 15, red: 6 },    // Brian Ochieng - mixed
      6: { green: 32, red: 2 },    // Chris Anderson - very positive
      7: { green: 8, red: 12 },    // Raj Patel - mixed negative
      8: { green: 1, red: 22 },    // Brandon Green - very negative
      9: { green: 19, red: 4 },    // James Brown - positive
      10: { green: 11, red: 9 },   // Kevin Davis - mixed
    };
    return voteCounts[profileId] || { green: 5, red: 5 };
  };

  const simulatedCounts = getSimulatedVoteCounts(profile?.id);
  const [greenFlagCount, setGreenFlagCount] = useState(simulatedCounts.green);
  const [redFlagCount, setRedFlagCount] = useState(simulatedCounts.red);
  const [thumbAnimations, setThumbAnimations] = useState({}); // Track thumb animations for each comment
  const [userGreenFlag, setUserGreenFlag] = useState(false);
  const [userRedFlag, setUserRedFlag] = useState(false);
  
  // Lottie animation refs
  const thumbUpAnimationRef = useRef(null);
  const thumbDownAnimationRef = useRef(null);
  
  // Animation values
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const aiBoxWidth = useSharedValue(200);
  const aiBoxHeight = useSharedValue(80);
  const aiBoxX = useSharedValue(0);
  const aiBoxY = useSharedValue(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const smallAICardRef = useRef(null);
  const [inlineAICardLayout, setInlineAICardLayout] = useState(null);
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

  // Build AI prompt and fetch overview from first 6 top-level comments
  const requestAiOverview = async () => {
    try {
      setAiError(null);
      setAiLoading(true);

      // Gather first up to 6 top-level comments (exclude owner-note)
      const topLevel = (comments || []).filter((c) => c.id !== 'owner-note').slice(0, 6);
      // Require at least 6 posts to generate an overview
      if (topLevel.length < 6) {
        setAiOverview('');
        setAiError('Looks a little quiet right now, come back after more activity');
        setAiLoading(false);
        return;
      }

      const summaries = topLevel.map((c, idx) => `${idx + 1}. ${shortenText(c.text, 200)}`);
      const prompt = `You are Luma AI. Read the comments and extract ONLY the 4-7 most important, distinct bullet points.\n- Output format: one line per bullet, no numbering, no emojis, no bold, no preface or conclusion.\n- Each bullet must be short (max 120 chars), clear, neutral, and safety-focused.\n- Capture themes, risks, and any positives.\n\nComments:\n${summaries.join('\n')}\n\nBullets:`;

      const contents = [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ];

      const res = await axios.post(BACKEND_URL, { contents });
      const reply = cleanResponse(res?.data?.reply || '');
      setAiOverview(reply);
    } catch (e) {
      console.error('AI overview error:', e?.response?.data || e?.message);
      setAiError('Failed to load AI overview');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSend = () => {
    const text = replyText.trim();
    if (!text) return;
    const newItem = {
      id: Date.now(),
      author: 'luma user',
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

  const handleAIBoxPress = () => {
    if (!aiOverview && !aiLoading) {
      requestAiOverview();
    }
    if (!isExpanded) {
      // Measure inline card to animate from its exact position
      smallAICardRef.current?.measure?.((x, y, width, height, pageX, pageY) => {
        setInlineAICardLayout({ x: pageX, y: pageY, width, height });

        // Set starting values to match the inline card for a seamless start
        aiBoxWidth.value = width || 200;
        aiBoxHeight.value = height || 80;
        aiBoxX.value = pageX || 0;
        aiBoxY.value = pageY || 0;

        // Show overlay at the measured position first
        runOnJS(setIsExpanded)(true);

        // Then animate smoothly to the centered square
        const profilePictureSize = screenWidth - 40;
        const targetX = (screenWidth - profilePictureSize) / 2;
        const targetY = screenHeight * 0.6 - profilePictureSize / 2;

        aiBoxWidth.value = withTiming(profilePictureSize, { duration: 260, easing: Easing.inOut(Easing.cubic) });
        aiBoxHeight.value = withTiming(profilePictureSize, { duration: 260, easing: Easing.inOut(Easing.cubic) });
        aiBoxX.value = withTiming(targetX, { duration: 260, easing: Easing.inOut(Easing.cubic) });
        aiBoxY.value = withTiming(targetY, { duration: 260, easing: Easing.inOut(Easing.cubic) });
      });
    } else {
      // Animate back smoothly to the inline card's position
      const toX = inlineAICardLayout ? inlineAICardLayout.x : 0;
      const toY = inlineAICardLayout ? inlineAICardLayout.y : 0;
      const toW = inlineAICardLayout ? inlineAICardLayout.width : 200;
      const toH = inlineAICardLayout ? inlineAICardLayout.height : 80;

      aiBoxWidth.value = withTiming(toW, { duration: 260, easing: Easing.inOut(Easing.cubic) });
      aiBoxHeight.value = withTiming(toH, { duration: 260, easing: Easing.inOut(Easing.cubic) });
      aiBoxX.value = withTiming(toX, { duration: 260, easing: Easing.inOut(Easing.cubic) });
      aiBoxY.value = withTiming(toY, { duration: 260, easing: Easing.inOut(Easing.cubic) }, (finished) => {
        if (finished) {
          runOnJS(setIsExpanded)(false);
        }
      });
    }
  };

  const handleGreenFlag = () => {
    if (userGreenFlag) {
      // Remove green flag
      setUserGreenFlag(false);
      setGreenFlagCount(prev => Math.max(0, prev - 1));
    } else {
      // Add green flag
      setUserGreenFlag(true);
      setGreenFlagCount(prev => prev + 1);
      // Play thumb up animation
      thumbUpAnimationRef.current?.play();
      // Remove red flag if it was set
      if (userRedFlag) {
        setUserRedFlag(false);
        setRedFlagCount(prev => Math.max(0, prev - 1));
      }
    }
  };

  const handleRedFlag = () => {
    if (userRedFlag) {
      // Remove red flag
      setUserRedFlag(false);
      setRedFlagCount(prev => Math.max(0, prev - 1));
    } else {
      // Add red flag
      setUserRedFlag(true);
      setRedFlagCount(prev => prev + 1);
      // Play thumb down animation
      thumbDownAnimationRef.current?.play();
      // Remove green flag if it was set
      if (userGreenFlag) {
        setUserGreenFlag(false);
        setGreenFlagCount(prev => Math.max(0, prev - 1));
      }
    }
  };

  const toggleDropdown = (commentId) => {
    setDropdownVisible(dropdownVisible === commentId ? null : commentId);
  };

  const closeDropdown = () => {
    setDropdownVisible(null);
  };

  const handleDeleteProfile = async () => {
    try {
      // Remove from AsyncStorage list of user profiles
      const stored = await AsyncStorage.getItem('userProfiles');
      const list = stored ? JSON.parse(stored) : [];
      const next = Array.isArray(list) ? list.filter((p) => p.id !== profile.id) : [];
      await AsyncStorage.setItem('userProfiles', JSON.stringify(next));

      // Return to the screen you came from
      const returnScreen = fromScreen || 'Search';
      navigation.navigate(returnScreen, { deletedProfileId: profile.id });
    } catch (e) {
      console.warn('Failed to delete profile', e);
    } finally {
      setHeaderMenuOpen(false);
    }
  };

  // Delete a comment (and its subtree) by id from the nested comments structure
  const removeCommentById = (nodes, targetId) => {
    return nodes
      .filter((n) => n.id !== targetId)
      .map((n) => ({
        ...n,
        replies: n.replies && n.replies.length ? removeCommentById(n.replies, targetId) : n.replies,
      }));
  };

  const handleDeleteComment = (commentId) => {
    setComments((prev) => removeCommentById(prev, commentId));
    if (dropdownVisible === commentId) closeDropdown();
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
                {c.id === 'owner-note' && (
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
                    size={16} 
                    color={isDownvoted ? '#EF4444' : theme.colors.placeholder} 
                  />
                )}
                <Text style={[styles.voteCount, { color: isUpvoted ? '#EF4444' : isDownvoted ? '#EF4444' : theme.colors.placeholder }]}>
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
        {isUserCreatedProfile ? (
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
                  <TouchableOpacity 
                    style={[styles.dropdownItem, { backgroundColor: theme.colors.surface }]}
                    onPress={handleDeleteProfile}
                  >
                    <Ionicons name="trash-outline" size={16} color="#EF4444" />
                    <Text style={[styles.dropdownText, { color: theme.colors.text }]}>Delete Profile</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        scrollEnabled={!isExpanded}
        {...(Platform.OS === 'ios' ? { bounces: !isExpanded } : {})}
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
              source={getAvatarSource((profile.id || 1) - 1, profile.avatar)}
              style={[
                styles.profileImage,
                { backgroundColor: theme.dark ? 'rgba(0, 0, 0, 0.2)' : 'white' }
              ]}
              resizeMode="cover"
            />
          </View>
        </View>
        
        {/* What People Are Saying and Flag Buttons */}
        <View style={styles.feedbackContainer}>
          {!isExpanded && (
            <TouchableOpacity onPress={handleAIBoxPress} style={{ flex: 1 }}>
              <View 
                style={[
                  styles.whatPeopleSayingBox, 
                  { 
                    backgroundColor: theme.colors.surface,
                    width: '100%'
                  }
                ]}
                ref={smallAICardRef}
                onLayout={() => {
                  try {
                    smallAICardRef.current?.measure?.((x, y, width, height, pageX, pageY) => {
                      setInlineAICardLayout({ x: pageX, y: pageY, width, height });
                    });
                  } catch {}
                }}
              >
                <Text style={[styles.whatPeopleSayingTitle, { color: theme.colors.text }]}>Luma AI</Text>
                {aiLoading ? (
                  <LottieView
                    source={require('../assets/animations/Loading Dots Blue.json')}
                    autoPlay
                    loop
                    style={{ width: 60, height: 24, alignSelf: 'flex-start' }}
                  />
                ) : aiError ? (
                  <Text style={[styles.whatPeopleSayingText, { color: theme.colors.text }]}>{aiError}</Text>
                ) : !!aiOverview ? (
                  <View>
                    {aiOverview.split(/\r?\n/).filter(Boolean).slice(0, 4).map((line, idx) => (
                      <View key={idx} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4 }}>
                        <Text style={[styles.whatPeopleSayingText, { color: theme.colors.text }]}>• </Text>
                        <Text style={[styles.whatPeopleSayingText, { color: theme.colors.text, flex: 1 }]} numberOfLines={1}>
                          {line.trim()}
                        </Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={[styles.whatPeopleSayingText, { color: theme.colors.text }]}>Illuminate</Text>
                )}
              </View>
            </TouchableOpacity>
          )}
          
            <View style={styles.flagButtonsContainerRight}>
                <View style={styles.flagButtonWrapper}>
                  <TouchableOpacity 
                    style={[
                      styles.flagButton, 
                      styles.greenFlagButton
                    ]} 
                    onPress={handleGreenFlag}
                  >
                    <LottieView
                      ref={thumbUpAnimationRef}
                      source={require('../assets/animations/Thumb.json')}
                      autoPlay={false}
                      loop={false}
                      style={styles.lottieAnimation}
                    />
                  </TouchableOpacity>
                  <Text style={[
                    styles.flagCountText,
                    { color: theme.colors.primary }
                  ]}>
                    {greenFlagCount}
                  </Text>
                </View>
                
                <View style={[styles.flagButtonWrapper, { marginLeft: -15 }]}>
                  <TouchableOpacity 
                    style={[
                      styles.flagButton, 
                      styles.redFlagButton
                    ]} 
                    onPress={handleRedFlag}
                  >
                    <LottieView
                      ref={thumbDownAnimationRef}
                      source={require('../assets/animations/Thumb.json')}
                      autoPlay={false}
                      loop={false}
                      style={[styles.lottieAnimation, { transform: [{ scaleX: -1 }, { scaleY: -1 }] }]}
                    />
                  </TouchableOpacity>
                  <Text style={[
                    styles.flagCountText,
                    { color: theme.colors.primary }
                  ]}>
                    {redFlagCount}
                  </Text>
                </View>
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

      {/* Fullscreen overlay for expanded AI Overview */}
      {isExpanded && (
        <Animated.View
          pointerEvents="auto"
          style={[
            styles.expandedAIOverlay,
            {
              width: aiBoxWidth,
              height: aiBoxHeight,
              transform: [
                { translateX: aiBoxX },
                { translateY: aiBoxY }
              ]
            }
          ]}
        >
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={handleAIBoxPress}>
            <View style={[styles.expandedAIContent, { backgroundColor: theme.colors.surface }] }>
               <Text style={[styles.whatPeopleSayingTitle, { color: theme.colors.text }]}>Luma AI</Text>
              {aiLoading ? (
                <LottieView
                  source={require('../assets/animations/Loading Dots Blue.json')}
                  autoPlay
                  loop
                  style={{ width: 100, height: 40, alignSelf: 'flex-start' }}
                />
              ) : aiError ? (
                <Text style={[styles.whatPeopleSayingText, { color: theme.colors.text }]}>{aiError}</Text>
              ) : !!aiOverview ? (
                <View>
                  {aiOverview.split(/\r?\n/).filter(Boolean).map((line, idx) => (
                    <View key={idx} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 }}>
                      <Text style={[styles.whatPeopleSayingText, { color: theme.colors.text }]}>• </Text>
                      <Text style={[styles.whatPeopleSayingText, { color: theme.colors.text, flex: 1 }]}>
                        {line.trim()}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
          </TouchableOpacity>
        </Animated.View>
      )}

      <View style={[styles.inputBar, { backgroundColor: theme.colors.surface }]}> 
        {replyTarget && (
          <View style={styles.replyingTo}>
            <Text style={[styles.replyingText, { color: theme.colors.text }]}>Replying to {replyTarget.author}</Text>
            <TouchableOpacity onPress={() => setReplyTarget(null)}>
              <Ionicons name="close" size={16} color={theme.colors.placeholder} />
            </TouchableOpacity>
          </View>
        )}
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
  replyingTo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
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
    width: 140,
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
});

export default ProfileDetailScreen; 
