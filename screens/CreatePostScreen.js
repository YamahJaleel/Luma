import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { useTheme, Card } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { postService } from '../services/postService';
import { auth } from '../config/firebase';

const CreatePostScreen = ({ route, navigation }) => {
  const theme = useTheme();
  const { communityId = 'dating-advice' } = route.params || {};
  const [isLoading, setIsLoading] = useState(false);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handlePublish = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Missing info', 'Please add a title and content.');
      return;
    }

    setIsLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Error', 'You must be signed in to create a post.');
        return;
      }

      const postData = {
        title: title.trim(),
        text: content.trim(),
        category: communityId,
        authorId: user.uid,
        authorName: user.displayName || 'Anonymous',
        type: 'general'
      };

      console.log('📝 Attempting to create post with data:', postData);
      const newPost = await postService.createPost(postData, user.uid);
      
      if (!newPost || !newPost.id) {
        throw new Error('Failed to create post - no post ID returned');
      }
      
      console.log('✅ Post created successfully:', newPost);
      
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

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: theme.colors.background }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <TouchableOpacity style={[styles.iconButton, { backgroundColor: theme.colors.surface }]} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={22} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Create Post</Text>
        <TouchableOpacity 
          style={[
            styles.publishButton, 
            { backgroundColor: theme.colors.primary },
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

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Title</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Give your post a clear title"
              placeholderTextColor={theme.colors.placeholder}
              style={[styles.input, { color: theme.colors.text }]}
              editable={!isLoading}
            />
          </View>

          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Content</Text>
            <TextInput
              value={content}
              onChangeText={setContent}
              placeholder="Write your post..."
              placeholderTextColor={theme.colors.placeholder}
              style={[styles.textarea, { color: theme.colors.text }]}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              editable={!isLoading}
            />
          </View>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 56 },
  iconButton: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 19, fontWeight: 'bold' },
  publishButton: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, minWidth: 70, alignItems: 'center' },
  publishButtonDisabled: { opacity: 0.7 },
  publishText: { color: '#FFFFFF', fontWeight: 'bold' },
  content: { padding: 16 },
  card: { borderRadius: 16, padding: 16, elevation: 2 },
  section: { marginBottom: 16 },
  label: { fontSize: 15, fontWeight: '600', marginBottom: 8 },
  input: { borderRadius: 10, backgroundColor: 'transparent', paddingHorizontal: 12, paddingVertical: 12, borderWidth: 1, borderColor: '#E5E7EB', fontSize: 15 },
  textarea: { borderRadius: 10, backgroundColor: 'transparent', paddingHorizontal: 12, paddingVertical: 12, borderWidth: 1, borderColor: '#E5E7EB', minHeight: 140, fontSize: 15 },
});

export default CreatePostScreen;