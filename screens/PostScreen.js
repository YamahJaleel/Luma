import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  TextInput,
  Button,
  Chip,
  Card,
  SegmentedButtons,
  Switch,
  Divider,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

const PostScreen = () => {
  const [postType, setPostType] = useState('experience');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableTags = [
    'red-flag',
    'ghosting',
    'controlling',
    'lying',
    'inconsistent',
    'safety',
    'advice',
    'success',
    'positive',
    'tinder',
    'bumble',
    'hinge',
    'match',
  ];

  const postTypes = [
    { value: 'experience', label: 'Experience' },
    { value: 'question', label: 'Question' },
    { value: 'warning', label: 'Warning' },
    { value: 'positive', label: 'Positive' },
  ];

  const handleTagToggle = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      if (selectedTags.length < 5) {
        setSelectedTags([...selectedTags, tag]);
      } else {
        Alert.alert('Limit Reached', 'You can only select up to 5 tags');
      }
    }
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title for your post');
      return;
    }

    if (!content.trim()) {
      Alert.alert('Error', 'Please enter content for your post');
      return;
    }

    if (selectedTags.length === 0) {
      Alert.alert('Error', 'Please select at least one tag');
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert(
        'Success!',
        'Your post has been submitted anonymously. Thank you for helping keep our community safe.',
        [
          {
            text: 'OK',
            onPress: () => {
              setTitle('');
              setContent('');
              setSelectedTags([]);
            },
          },
        ]
      );
    }, 2000);
  };

  const getPostTypeIcon = (type) => {
    switch (type) {
      case 'experience':
        return 'file-document-outline';
      case 'question':
        return 'help-circle-outline';
      case 'warning':
        return 'alert-circle-outline';
      case 'positive':
        return 'heart-outline';
      default:
        return 'chat-outline';
    }
  };

  const getPostTypeColor = (type) => {
    switch (type) {
      case 'red-flag':
        return '#FC8181';
      case 'warning':
        return '#F6AD55';
      case 'positive':
        return '#68D391';
      case 'experience':
        return '#3E5F44'; // Deep forest green
      default:
        return '#A0AEC0';
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Share Your Experience</Text>
          <Text style={styles.headerSubtitle}>
            Help others by sharing your dating experiences anonymously
          </Text>
        </View>

        {/* Post Type Selection */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Post Type</Text>
            <SegmentedButtons
              value={postType}
              onValueChange={setPostType}
              buttons={postTypes.map(type => ({
                value: type.value,
                label: type.label,
                icon: getPostTypeIcon(type.value),
                checkedColor: 'white',
                uncheckedColor: getPostTypeColor(type.value),
                buttonColor: getPostTypeColor(type.value),
              }))}
              style={styles.segmentedButtons}
            />
          </Card.Content>
        </Card>

        {/* Anonymous Toggle */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.anonymousContainer}>
              <View style={styles.anonymousTextContainer}>
                <Ionicons name="eye-off" size={20} color="#3E5F44" /> {/* Deep forest green */}
                <Text style={styles.anonymousTitle}>Anonymous Post</Text>
              </View>
              <Switch
                value={isAnonymous}
                onValueChange={setIsAnonymous}
                color="#E6D7C3"
              />
            </View>
            <Text style={styles.anonymousSubtitle}>
              Your identity will be completely hidden. No personal information will be shared.
            </Text>
          </Card.Content>
        </Card>

        {/* Title Input */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Title</Text>
            <TextInput
              mode="outlined"
              placeholder="Enter a descriptive title..."
              value={title}
              onChangeText={setTitle}
              style={styles.textInput}
              maxLength={100}
            />
            <Text style={styles.characterCount}>
              {title.length}/100 characters
            </Text>
          </Card.Content>
        </Card>

        {/* Content Input */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Your Story</Text>
            <TextInput
              mode="outlined"
              placeholder="Share your experience, ask for advice, or report concerning behavior..."
              value={content}
              onChangeText={setContent}
              style={styles.textArea}
              multiline
              numberOfLines={6}
              maxLength={1000}
            />
            <Text style={styles.characterCount}>
              {content.length}/1000 characters
            </Text>
          </Card.Content>
        </Card>

        {/* Tags Selection */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Tags (Select up to 5)</Text>
            <Text style={styles.sectionSubtitle}>
              Help others find your post and categorize your experience
            </Text>
            <View style={styles.tagsContainer}>
              {availableTags.map((tag) => (
                <Chip
                  key={tag}
                  selected={selectedTags.includes(tag)}
                  onPress={() => handleTagToggle(tag)}
                  style={[
                    styles.tag,
                    selectedTags.includes(tag) && styles.selectedTag,
                  ]}
                  textStyle={[
                    styles.tagText,
                    selectedTags.includes(tag) && styles.selectedTagText,
                  ]}
                >
                  {tag}
                </Chip>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* Guidelines */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Community Guidelines</Text>
            <View style={styles.guidelineItem}>
              <Ionicons name="checkmark-circle" size={16} color="#68D391" />
              <Text style={styles.guidelineText}>
                Be honest and factual in your posts
              </Text>
            </View>
            <View style={styles.guidelineItem}>
              <Ionicons name="checkmark-circle" size={16} color="#68D391" />
              <Text style={styles.guidelineText}>
                Focus on behavior, not personal attacks
              </Text>
            </View>
            <View style={styles.guidelineItem}>
              <Ionicons name="checkmark-circle" size={16} color="#68D391" />
              <Text style={styles.guidelineText}>
                Respect privacy and avoid sharing personal details
              </Text>
            </View>
            <View style={styles.guidelineItem}>
              <Ionicons name="checkmark-circle" size={16} color="#68D391" />
              <Text style={styles.guidelineText}>
                Help create a supportive and safe community
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Submit Button */}
        <View style={styles.submitContainer}>
          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={isSubmitting}
            style={styles.submitButton}
            buttonColor="#3E5F44" // Deep forest green
            textColor="#FFFFFF"
          >
            {isSubmitting ? 'Posting...' : 'Share Anonymously'}
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDF8F3',
  },
  scrollView: {
    flex: 1,
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
  card: {
    marginHorizontal: 20,
    marginBottom: 15,
    backgroundColor: 'white',
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 10,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 15,
  },
  segmentedButtons: {
    marginTop: 10,
  },
  anonymousContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  anonymousTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  anonymousTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginLeft: 8,
  },
  anonymousSubtitle: {
    fontSize: 14,
    color: '#718096',
    lineHeight: 20,
  },
  textInput: {
    backgroundColor: 'transparent',
  },
  textArea: {
    backgroundColor: 'transparent',
    minHeight: 120,
  },
  characterCount: {
    fontSize: 12,
    color: '#A0AEC0',
    textAlign: 'right',
    marginTop: 5,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  tag: {
    marginRight: 8,
    marginBottom: 4,
    backgroundColor: '#F7FAFC',
  },
  selectedTag: {
    backgroundColor: '#3E5F44', // Deep forest green
  },
  tagText: {
    fontSize: 12,
    color: '#718096',
  },
  selectedTagText: {
    color: '#FFFFFF',
  },
  guidelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  guidelineText: {
    fontSize: 14,
    color: '#718096',
    marginLeft: 8,
    flex: 1,
  },
  submitContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  submitButton: {
    paddingVertical: 8,
    borderRadius: 8,
  },
  primaryButton: {
    backgroundColor: '#3E5F44', // Deep forest green
    marginBottom: 12,
    borderRadius: 8,
  },
  verificationText: {
    color: '#68D391',
    fontSize: 14,
    marginLeft: 8,
  },
  visibilityText: {
    color: '#3E5F44', // Deep forest green
    fontSize: 14,
    marginLeft: 8,
  },
});

export default PostScreen; 