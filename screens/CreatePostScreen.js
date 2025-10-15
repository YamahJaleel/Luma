import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  Alert, KeyboardAvoidingView, Platform, ScrollView,
  ActivityIndicator, SafeAreaView, StatusBar
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { postService } from '../services/postService';
import { auth } from '../config/firebase';
import { useSettings } from '../components/SettingsContext';
import notificationTriggerService from '../services/notificationTriggerService';
import LottieView from 'lottie-react-native';

const CATEGORIES = [
  { id: 'dating', label: 'Dating' },
  { id: 'red flags', label: 'Red Flags' },
  { id: 'green flags', label: 'Green Flags' },
  { id: 'safety', label: 'Safety' },
  { id: 'vent', label: 'Vent' },
];

const CATEGORY_META = {
  'dating': { icon: 'heart', color: '#EC4899' },
  'red flags': { icon: 'warning', color: '#EF4444' },
  'green flags': { icon: 'checkmark-circle', color: '#10B981' },
  'safety': { icon: 'shield-checkmark', color: '#3B82F6' },
  'vent': { icon: 'chatbubble', color: '#8B5CF6' },
};

const CreatePostScreen = ({ route, navigation }) => {
  const theme = useTheme();
  const { darkModeEnabled } = useSettings();
  const { communityId = 'dating' } = route.params || {};
  const [isLoading, setIsLoading] = useState(false);
  const MIN_ANIM_MS = 4000; // ensure loader stays visible for 4s

  const categoryData = CATEGORIES.find(c => c.id === communityId) || CATEGORIES[0];
  const categoryMeta = CATEGORY_META[communityId] || CATEGORY_META['dating'];

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(communityId || 'dating');

  const MAX_TITLE_LEN = 300;
  const MAX_CONTENT_LEN = 6000;

  const handlePublish = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Missing info', 'Please add a title and content.');
      return;
    }

    setIsLoading(true);
    const startedAt = Date.now();
    let shouldNavigate = false;
    let navigateParams = null;
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Error', 'You must be signed in to create a post.');
        return;
      }

      const derivedAuthorName =
        user.displayName?.trim() || user.email?.split('@')[0] || 'User';

      const postData = {
        title: title.trim(),
        text: content.trim(),
        category: selectedCategory,
        authorId: user.uid,
        authorName: derivedAuthorName,
        type: 'general',
      };

      const newPost = await postService.createPost(postData, user.uid);
      if (!newPost?.id) throw new Error('Failed to create post');

      await notificationTriggerService.triggerNewPostNotification({
        id: newPost,
        title: title.trim(),
        text: content.trim()
      }, selectedCategory);

      setTitle('');
      setContent('');
      shouldNavigate = true;
      navigateParams = { newPost, screen: 'Home', params: { refresh: true } };
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Error', 'Failed to create post. Please try again.');
    } finally {
      const elapsed = Date.now() - startedAt;
      if (elapsed < MIN_ANIM_MS) {
        await new Promise(resolve => setTimeout(resolve, MIN_ANIM_MS - elapsed));
      }
      if (shouldNavigate) {
        navigation.navigate('Home', navigateParams);
      }
      setIsLoading(false);
    }
  };


  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor="#3E5F44" />

        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBack}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Post</Text>
          <TouchableOpacity
            onPress={handlePublish}
            disabled={isLoading}
            style={[styles.headerAction, isLoading && { opacity: 0.85 }]}
          >
            {isLoading ? (
              <LottieView
                source={require('../assets/animations/Sandy Loading.json')}
                autoPlay
                loop
                style={styles.headerLottie}
              />
            ) : (
              <Text style={styles.headerActionText}>Publish</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Scrollable Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >

          {/* Community Selector */}
          <View style={[styles.communitySection, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.communityHeader}>
              <Ionicons name="people" size={16} color={theme.colors.primary} />
              <Text style={[styles.communityLabel, { color: '#333' }]}>Community</Text>
            </View>
            <View style={styles.communityGrid}>
              {CATEGORIES.map((category) => {
                const meta = CATEGORY_META[category.id];
                const isSelected = selectedCategory === category.id;
                return (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.communityChip,
                      { backgroundColor: isSelected ? `${meta.color}15` : '#fff' },
                      { borderColor: isSelected ? meta.color : '#ddd' }
                    ]}
                    onPress={() => setSelectedCategory(category.id)}
                    disabled={isLoading}
                  >
                    <Ionicons 
                      name={meta.icon} 
                      size={16} 
                      color={isSelected ? meta.color : '#666'} 
                    />
                    <Text style={[
                      styles.communityChipText,
                      { color: isSelected ? meta.color : '#333' }
                    ]}>
                      {category.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Title Input */}
          <View style={[styles.inputSection, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.inputHeader}>
              <Ionicons name="text" size={16} color={theme.colors.primary} />
              <Text style={[styles.inputLabel, { color: '#333' }]}>Title</Text>
              <Text style={[styles.charCount, { color: '#888' }]}>
                {title.length}/{MAX_TITLE_LEN}
              </Text>
            </View>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="What's on your mind?"
              placeholderTextColor="#888"
              style={[styles.titleInput, { color: '#111', borderColor: '#ddd' }]}
              maxLength={MAX_TITLE_LEN}
              editable={!isLoading}
            />
          </View>

          {/* Content Input */}
          <View style={[styles.inputSection, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.inputHeader}>
              <Ionicons name="document-text" size={16} color={theme.colors.primary} />
              <Text style={[styles.inputLabel, { color: '#333' }]}>Content</Text>
              <Text style={[styles.charCount, { color: '#888' }]}>
                {content.length}/{MAX_CONTENT_LEN}
              </Text>
            </View>
            <TextInput
              value={content}
              onChangeText={setContent}
              placeholder="Share your story, ask for advice, or start a conversation..."
              placeholderTextColor="#888"
              style={[styles.contentInput, { color: '#111', borderColor: '#ddd' }]}
              multiline
              numberOfLines={8}
              textAlignVertical="top"
              maxLength={MAX_CONTENT_LEN}
              editable={!isLoading}
            />
          </View>

          {/* Tips Section */}
          <View style={[styles.tipsSection, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.tipsHeader}>
              <Ionicons name="bulb" size={16} color="#10B981" />
              <Text style={[styles.tipsTitle, { color: '#333' }]}>Tips for great posts</Text>
            </View>
            <View style={styles.tipsList}>
              <Text style={[styles.tip, { color: '#888' }]}>• Be clear and specific in your title</Text>
              <Text style={[styles.tip, { color: '#888' }]}>• Share your personal experience</Text>
              <Text style={[styles.tip, { color: '#888' }]}>• Ask questions to encourage discussion</Text>
              <Text style={[styles.tip, { color: '#888' }]}>• Be respectful and supportive</Text>
            </View>
          </View>

        </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, marginTop: 0 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 12,
    justifyContent: 'space-between',
    elevation: 4,
  },
  headerBack: { padding: 8 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  headerAction: {
    paddingHorizontal: 14, paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
  },
  headerActionText: { color: '#fff', fontSize: 16, fontWeight: '600' },

  scrollView: { flex: 1 },
  content: { padding: 12, paddingBottom: 40 },

  communitySection: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  communityHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  communityLabel: { fontSize: 16, fontWeight: '600', marginLeft: 8 },
  communityGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  communityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 8,
  },
  communityChipText: { fontSize: 14, fontWeight: '600', marginLeft: 6 },

  inputSection: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  inputLabel: { fontSize: 16, fontWeight: '600', marginLeft: 8, flex: 1 },
  charCount: { fontSize: 12, fontWeight: '500' },
  titleInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#111',
    backgroundColor: '#fff',
    minHeight: 50,
  },
  contentInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#111',
    backgroundColor: '#fff',
    minHeight: 200,
    textAlignVertical: 'top',
  },
  tipsSection: {
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  tipsHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  tipsTitle: { fontSize: 16, fontWeight: '600', marginLeft: 8 },
  tipsList: { paddingLeft: 4 },
  tip: { fontSize: 14, lineHeight: 20, marginBottom: 6 },
  headerLottie: { width: 36, height: 36 },
});

export default CreatePostScreen;
