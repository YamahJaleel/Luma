import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Alert, ScrollView, Image } from 'react-native';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

const CreateProfileScreen = ({ route, navigation }) => {
  const theme = useTheme();

  const [name, setName] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [bio, setBio] = useState('');

  const requestPermissions = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to your photo library to select a profile picture.');
        return false;
      }
      return true;
    } catch (error) {
      console.log('Permission request error:', error);
      Alert.alert('Permission Error', 'Failed to request photo library permissions.');
      return false;
    }
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0]);
      }
    } catch (error) {
      console.log('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow camera access to take a profile picture.');
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0]);
      }
    } catch (error) {
      console.log('Camera error:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      'Profile Picture',
      'Choose how to add a profile picture',
      [
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Choose from Library', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleCreate = () => {
    if (!name.trim()) {
      Alert.alert('Missing Info', 'Please enter a name.');
      return;
    }
    const newProfile = {
      id: Date.now(),
      name: name.trim(),
      avatar: selectedImage ? selectedImage.uri : 'https://via.placeholder.com/150',
      size: 'small',
      isOnline: false,
      lastSeen: 'just now',
      mutualFriends: 0,
      riskLevel: 'green',
      flags: [],
      reports: 0,
      bio: bio.trim(),
    };
    // Navigate back to Search with a serializable param
    navigation.navigate('Search', { newProfile });
  };

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: theme.colors.background }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <TouchableOpacity style={[styles.iconButton, { backgroundColor: theme.colors.surface }]} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={22} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Share an experience</Text>
        <TouchableOpacity style={[styles.createButton, { backgroundColor: theme.colors.primary }]} onPress={handleCreate}>
          <Text style={styles.createText}>Create</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Profile Picture</Text>
          
          {selectedImage ? (
            <View style={styles.imageContainer}>
              <Image source={{ uri: selectedImage.uri }} style={styles.previewImage} />
              <TouchableOpacity style={styles.changePhotoButton} onPress={showImageOptions}>
                <Ionicons name="camera" size={16} color="#FFFFFF" />
                <Text style={styles.changePhotoText}>Change Photo</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.addPhotoButton} onPress={showImageOptions}>
              <Ionicons name="camera" size={32} color={theme.colors.primary} />
              <Text style={[styles.addPhotoText, { color: theme.colors.primary }]}>Add Photo</Text>
            </TouchableOpacity>
          )}

          <Text style={[styles.label, { color: theme.colors.text }]}>Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Full name"
            placeholderTextColor={theme.colors.placeholder}
            style={[styles.input, { color: theme.colors.text }]}
          />

          <Text style={[styles.label, { color: theme.colors.text }]}>About</Text>
          <TextInput
            value={bio}
            onChangeText={setBio}
            placeholder="Write about your experience"
            placeholderTextColor={theme.colors.placeholder}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            style={[styles.textarea, { color: theme.colors.text }]}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 56 },
  iconButton: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  createButton: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  createText: { color: '#FFFFFF', fontWeight: '700' },
  content: { padding: 16 },
  card: { borderRadius: 16, padding: 16, elevation: 2 },
  label: { fontSize: 14, fontWeight: '600', marginTop: 16, marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  textarea: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, minHeight: 100 },
  addPhotoButton: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
  },
  addPhotoText: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  imageContainer: {
    alignItems: 'center',
  },
  previewImage: { 
    width: 120, 
    height: 120, 
    borderRadius: 60, 
    marginBottom: 12, 
    backgroundColor: '#F0F0F0' 
  },
  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#3E5F44',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  changePhotoText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default CreateProfileScreen; 