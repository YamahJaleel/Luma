import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useTheme, Card } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

const CreatePostScreen = ({ route, navigation }) => {
  const theme = useTheme();
  const { communityId = 'dating-advice' } = route.params || {};

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handlePublish = () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Missing info', 'Please add a title and content.');
      return;
    }

    const newPost = {
      id: Date.now(),
      community: communityId,
      title: title.trim(),
      content: content.trim(),
      tags: [],
      timestamp: 'just now',
      upvotes: 0,
      comments: 0,
      likes: 0,
      trending: 0,
      author: 'You',
    };

    navigation.navigate('Home', { newPost });
  };

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: theme.colors.background }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <TouchableOpacity style={[styles.iconButton, { backgroundColor: theme.colors.surface }]} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={22} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Create Post</Text>
        <TouchableOpacity style={[styles.publishButton, { backgroundColor: theme.colors.primary }]} onPress={handlePublish}>
          <Text style={styles.publishText}>Publish</Text>
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
  publishButton: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  publishText: { color: '#FFFFFF', fontWeight: 'bold' },
  content: { padding: 16 },
  card: { borderRadius: 16, padding: 16, elevation: 2 },
  section: { marginBottom: 16 },
  label: { fontSize: 15, fontWeight: '600', marginBottom: 8 },
  input: { borderRadius: 10, backgroundColor: 'transparent', paddingHorizontal: 12, paddingVertical: 12, borderWidth: 1, borderColor: '#E5E7EB', fontSize: 15 },
  textarea: { borderRadius: 10, backgroundColor: 'transparent', paddingHorizontal: 12, paddingVertical: 12, borderWidth: 1, borderColor: '#E5E7EB', minHeight: 140, fontSize: 15 },
});

export default CreatePostScreen; 