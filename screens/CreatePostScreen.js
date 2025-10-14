import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, SafeAreaView, StatusBar } from 'react-native';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { postService } from '../services/postService';
import { auth } from '../config/firebase';
import { useSettings } from '../components/SettingsContext';
import notificationTriggerService from '../services/notificationTriggerService';

// Category definitions (matching HomeScreen)
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

  // Get category info
  const categoryData = CATEGORIES.find(c => c.id === communityId) || CATEGORIES[0];
  const categoryMeta = CATEGORY_META[communityId] || CATEGORY_META['dating'];

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const MAX_TITLE_LEN = 300;
  const MAX_CONTENT_LEN = 6000;

  const handlePublish = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Missing info', 'Please add a title and content.');
      return;
    }

    if (title.length > MAX_TITLE_LEN) {
      Alert.alert('Title too long', `Titles are limited to ${MAX_TITLE_LEN} characters.`);
      return;
    }

    if (content.length > MAX_CONTENT_LEN) {
      Alert.alert('Content too long', `Posts are limited to ${MAX_CONTENT_LEN} characters.`);
      return;
    }

    setIsLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Error', 'You must be signed in to create a post.');
        return;
      }

      // Derive a friendly author name
      const derivedAuthorName =
        user.displayName && user.displayName.trim()
          ? user.displayName.trim()
          : (user.email ? user.email.split('@')[0] : 'User');

      const postData = {
        title: title.trim(),
        text: content.trim(),
        category: communityId,
        authorId: user.uid,
        authorName: derivedAuthorName,
        type: 'general'
      };

      console.log('📝 Attempting to create post with data:', postData);
      const newPost = await postService.createPost(postData, user.uid);
      
      if (!newPost || !newPost.id) {
        throw new Error('Failed to create post - no post ID returned');
      }
      
      console.log('✅ Post created successfully:', newPost);
      
      // Trigger notification for new post
      try {
        await notificationTriggerService.triggerNewPostNotification({
          id: newPost,
          title: title.trim(),
          text: content.trim()
        }, communityId);
      } catch (error) {
        console.log('Error triggering post notification:', error);
      }
      
      // Clear the form
      setTitle('');
      setContent('');
      
      // Navigate back to home with the new post
      navigation.navigate('Home', { 
        newPost,
        screen: 'Home',
        params: { refresh: true }
      });
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Error', 'Failed to create post. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const colors = {
    background: darkModeEnabled ? '#1F2937' : '#FFFFFF',
    surface: darkModeEnabled ? '#374151' : '#F9FAFB',
    text: darkModeEnabled ? '#FFFFFF' : '#1F2937',
    placeholder: darkModeEnabled ? '#9CA3AF' : '#6B7280',
    primary: '#3E5F44',
    border: darkModeEnabled ? '#4B5563' : '#E5E7EB',
    accent: '#10B981',
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={darkModeEnabled ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      <KeyboardAvoidingView style={styles.keyboardView} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        
        {/* Modern Header */}
        <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
          <TouchableOpacity 
            style={[styles.backButton, { backgroundColor: colors.surface }]} 
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={20} color={colors.text} />
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Create Post</Text>
            <View style={styles.categoryIndicator}>
              <Ionicons name={categoryMeta.icon} size={14} color={categoryMeta.color} />
              <Text style={[styles.categoryText, { color: colors.placeholder }]}>
                {categoryData.label}
              </Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={[
              styles.publishButton, 
              { 
                backgroundColor: colors.primary,
                shadowColor: colors.primary
              },
              isLoading && styles.publishButtonDisabled
            ]} 
            onPress={handlePublish}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.publishText}>Publish</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Content Area */}
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          
          {/* Title Section */}
          <View style={[styles.inputSection, { backgroundColor: colors.surface }]}>
            <View style={styles.inputHeader}>
              <Ionicons name="text" size={16} color={colors.primary} />
              <Text style={[styles.inputLabel, { color: colors.text }]}>Title</Text>
              <Text style={[styles.charCount, { color: colors.placeholder }]}>
                {title.length}/{MAX_TITLE_LEN}
              </Text>
            </View>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="What's on your mind?"
              placeholderTextColor={colors.placeholder}
              style={[styles.titleInput, { 
                color: colors.text, 
                borderColor: colors.border,
                backgroundColor: colors.background 
              }]}
              maxLength={MAX_TITLE_LEN}
              editable={!isLoading}
            />
          </View>

          {/* Content Section */}
          <View style={[styles.inputSection, { backgroundColor: colors.surface }]}>
            <View style={styles.inputHeader}>
              <Ionicons name="document-text" size={16} color={colors.primary} />
              <Text style={[styles.inputLabel, { color: colors.text }]}>Content</Text>
              <Text style={[styles.charCount, { color: colors.placeholder }]}>
                {content.length}/{MAX_CONTENT_LEN}
              </Text>
            </View>
            <TextInput
              value={content}
              onChangeText={setContent}
              placeholder="Share your story, ask for advice, or start a conversation..."
              placeholderTextColor={colors.placeholder}
              style={[styles.contentInput, { 
                color: colors.text, 
                borderColor: colors.border,
                backgroundColor: colors.background 
              }]}
              multiline
              numberOfLines={8}
              textAlignVertical="top"
              maxLength={MAX_CONTENT_LEN}
              editable={!isLoading}
            />
          </View>

          {/* Tips Section */}
          <View style={[styles.tipsSection, { backgroundColor: colors.surface }]}>
            <View style={styles.tipsHeader}>
              <Ionicons name="bulb" size={16} color={colors.accent} />
              <Text style={[styles.tipsTitle, { color: colors.text }]}>Tips for great posts</Text>
            </View>
            <View style={styles.tipsList}>
              <Text style={[styles.tip, { color: colors.placeholder }]}>• Be clear and specific in your title</Text>
              <Text style={[styles.tip, { color: colors.placeholder }]}>• Share your personal experience</Text>
              <Text style={[styles.tip, { color: colors.placeholder }]}>• Ask questions to encourage discussion</Text>
              <Text style={[styles.tip, { color: colors.placeholder }]}>• Be respectful and supportive</Text>
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '400',
  },
  categoryIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  publishButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  publishButtonDisabled: {
    opacity: 0.6,
  },
  publishText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  inputSection: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  charCount: {
    fontSize: 12,
    fontWeight: '500',
  },
  titleInput: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1.5,
    fontSize: 16,
    fontWeight: '500',
    minHeight: 50,
  },
  contentInput: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1.5,
    fontSize: 15,
    lineHeight: 22,
    minHeight: 200,
  },
  tipsSection: {
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  tipsList: {
    paddingLeft: 4,
  },
  tip: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 6,
  },
});

export default CreatePostScreen;