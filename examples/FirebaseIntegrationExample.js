import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useFirebase } from '../contexts/FirebaseContext';
import { profileService, postService, commentService } from '../services/firebaseService';

// Example component showing how to integrate Firebase with existing screens
const FirebaseIntegrationExample = () => {
  const theme = useTheme();
  const { user, profiles, posts, createProfile, createPost, createComment } = useFirebase();
  const [loading, setLoading] = useState(false);

  // Example: Create a new profile
  const handleCreateProfile = async () => {
    if (!user) {
      Alert.alert('Error', 'Please sign in to create a profile');
      return;
    }

    setLoading(true);
    try {
      const profileData = {
        name: 'John Doe',
        bio: 'This is a test profile created with Firebase',
        location: 'Toronto, ON',
        userId: 'test-user-id'
      };

      const profileId = await createProfile(profileData);
      Alert.alert('Success', `Profile created with ID: ${profileId}`);
    } catch (error) {
      Alert.alert('Error', `Failed to create profile: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Example: Create a new post
  const handleCreatePost = async () => {
    if (!user) {
      Alert.alert('Error', 'Please sign in to create a post');
      return;
    }

    setLoading(true);
    try {
      const postData = {
        title: 'Test Post from Firebase',
        text: 'This is a test post created using Firebase integration',
        category: 'dating-advice',
        type: 'question',
        score: 0,
        comments: 0,
        likes: 0,
        views: 0
      };

      const postId = await createPost(postData);
      Alert.alert('Success', `Post created with ID: ${postId}`);
    } catch (error) {
      Alert.alert('Error', `Failed to create post: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Example: Create a comment
  const handleCreateComment = async (profileId) => {
    if (!user) {
      Alert.alert('Error', 'Please sign in to create a comment');
      return;
    }

    setLoading(true);
    try {
      const commentData = {
        profileId: profileId,
        text: 'This is a test comment created with Firebase',
        author: user.displayName || 'Anonymous',
        avatarColor: '#7C9AFF',
        timestamp: new Date().toISOString(),
        replies: []
      };

      const commentId = await createComment(commentData);
      Alert.alert('Success', `Comment created with ID: ${commentId}`);
    } catch (error) {
      Alert.alert('Error', `Failed to create comment: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Example: Load profiles directly from Firebase
  const loadProfilesFromFirebase = async () => {
    setLoading(true);
    try {
      const firebaseProfiles = await profileService.getProfiles();
      console.log('Firebase profiles:', firebaseProfiles);
      Alert.alert('Success', `Loaded ${firebaseProfiles.length} profiles from Firebase`);
    } catch (error) {
      Alert.alert('Error', `Failed to load profiles: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Example: Load posts directly from Firebase
  const loadPostsFromFirebase = async () => {
    setLoading(true);
    try {
      const firebasePosts = await postService.getPosts();
      console.log('Firebase posts:', firebasePosts);
      Alert.alert('Success', `Loaded ${firebasePosts.length} posts from Firebase`);
    } catch (error) {
      Alert.alert('Error', `Failed to load posts: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const renderProfileItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.item, { backgroundColor: theme.colors.surface }]}
      onPress={() => handleCreateComment(item.id)}
    >
      <Text style={[styles.itemText, { color: theme.colors.text }]}>
        {item.name} - {item.username}
      </Text>
      <Text style={[styles.itemSubtext, { color: theme.colors.text }]}>
        Reports: {item.reports || 0}
      </Text>
    </TouchableOpacity>
  );

  const renderPostItem = ({ item }) => (
    <View style={[styles.item, { backgroundColor: theme.colors.surface }]}>
      <Text style={[styles.itemText, { color: theme.colors.text }]}>
        {item.title}
      </Text>
      <Text style={[styles.itemSubtext, { color: theme.colors.text }]}>
        Category: {item.category} | Likes: {item.likes}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>
        Firebase Integration Example
      </Text>
      
      {user ? (
        <Text style={[styles.subtitle, { color: theme.colors.text }]}>
          Signed in as: {user.displayName || user.email}
        </Text>
      ) : (
        <Text style={[styles.subtitle, { color: theme.colors.text }]}>
          Please sign in to use Firebase features
        </Text>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
          onPress={handleCreateProfile}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Create Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
          onPress={handleCreatePost}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Create Post</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
          onPress={loadProfilesFromFirebase}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Load Profiles</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
          onPress={loadPostsFromFirebase}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Load Posts</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Profiles ({profiles.length})
      </Text>
      <FlatList
        data={profiles}
        renderItem={renderProfileItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
        showsVerticalScrollIndicator={false}
      />

      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Posts ({posts.length})
      </Text>
      <FlatList
        data={posts}
        renderItem={renderPostItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  button: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    minWidth: '48%',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  list: {
    flex: 1,
  },
  item: {
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
  },
  itemText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  itemSubtext: {
    fontSize: 14,
    opacity: 0.7,
  },
});

export default FirebaseIntegrationExample;
