import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Card, Chip, Avatar, Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

const HomeScreen = () => {
  const [refreshing, setRefreshing] = useState(false);

  // Mock data for community posts
  const communityPosts = [
    {
      id: 1,
      type: 'experience',
      title: 'Red Flag Alert',
      content: 'Met someone on Hinge who seemed perfect at first, but then started showing controlling behavior. Be careful with anyone who tries to isolate you from friends.',
      tags: ['red-flag', 'controlling', 'hinge'],
      timestamp: '2 hours ago',
      upvotes: 45,
      comments: 12,
    },
    {
      id: 2,
      type: 'question',
      title: 'Advice Needed',
      content: 'Is it normal for someone to ask for your location constantly? This guy I\'m talking to wants to know where I am all the time.',
      tags: ['advice', 'location', 'boundaries'],
      timestamp: '4 hours ago',
      upvotes: 23,
      comments: 8,
    },
    {
      id: 3,
      type: 'positive',
      title: 'Success Story',
      content: 'Found my person through this community! We\'ve been together for 6 months now. Thank you all for the support and advice.',
      tags: ['success', 'relationship', 'positive'],
      timestamp: '1 day ago',
      upvotes: 67,
      comments: 15,
    },
    {
      id: 4,
      type: 'warning',
      title: 'Name Alert: John D.',
      content: 'Be careful with John D. from downtown area. Multiple reports of ghosting and inconsistent behavior.',
      tags: ['warning', 'ghosting', 'inconsistent'],
      timestamp: '2 days ago',
      upvotes: 89,
      comments: 23,
    },
  ];

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  const getPostIcon = (type) => {
    switch (type) {
      case 'red-flag':
      case 'warning':
        return 'warning';
      case 'question':
        return 'help-circle';
      case 'positive':
        return 'heart';
      case 'experience':
        return 'document-text';
      default:
        return 'chatbubble';
    }
  };

  const getPostColor = (type) => {
    switch (type) {
      case 'red-flag':
      case 'warning':
        return '#FC8181';
      case 'question':
        return '#F6AD55';
      case 'positive':
        return '#68D391';
      case 'experience':
        return '#D9A299';
      default:
        return '#A0AEC0';
    }
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Community Feed</Text>
        <Text style={styles.headerSubtitle}>Stay informed, stay safe</Text>
      </View>

      {/* Community Posts */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Posts</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {communityPosts.map((post) => (
          <Card key={post.id} style={styles.postCard}>
            <Card.Content>
              <View style={styles.postHeader}>
                <View style={styles.postTypeContainer}>
                  <Ionicons
                    name={getPostIcon(post.type)}
                    size={20}
                    color={getPostColor(post.type)}
                  />
                  <Text style={[styles.postType, { color: getPostColor(post.type) }]}>
                    {post.type.charAt(0).toUpperCase() + post.type.slice(1)}
                  </Text>
                </View>
                <Text style={styles.timestamp}>{post.timestamp}</Text>
              </View>

              <Text style={styles.postTitle}>{post.title}</Text>
              <Text style={styles.postContent}>{post.content}</Text>

              <View style={styles.tagsContainer}>
                {post.tags.map((tag, index) => (
                  <Chip key={index} style={styles.tag} textStyle={styles.tagText}>
                    {tag}
                  </Chip>
                ))}
              </View>

              <View style={styles.postActions}>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="arrow-up" size={20} color="#D9A299" />
                  <Text style={styles.actionText}>{post.upvotes}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="chatbubble-outline" size={20} color="#A0AEC0" />
                  <Text style={styles.actionText}>{post.comments}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="share-outline" size={20} color="#A0AEC0" />
                </TouchableOpacity>
              </View>
            </Card.Content>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDF8F3',
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#718096',
    marginTop: 4,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  seeAllText: {
    fontSize: 14,
    color: '#D9A299',
    fontWeight: '500',
  },
  postCard: {
    marginHorizontal: 20,
    marginBottom: 15,
    backgroundColor: 'white',
    elevation: 2,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  postTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postType: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#A0AEC0',
  },
  postTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 8,
  },
  postContent: {
    fontSize: 14,
    color: '#718096',
    lineHeight: 20,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  tag: {
    marginRight: 8,
    marginBottom: 4,
    backgroundColor: '#F7FAFC',
  },
  tagText: {
    fontSize: 12,
    color: '#718096',
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  actionText: {
    fontSize: 14,
    color: '#A0AEC0',
    marginLeft: 4,
  },
});

export default HomeScreen; 