import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  KeyboardAvoidingView, Platform, Alert, ScrollView,
  Image, Modal, FlatList, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from 'react-native-paper';
import { useTabContext } from '../components/TabContext';
import { profileService, storageService, commentService } from '../services/firebaseService';
import { auth } from '../config/firebase';
import { useFocusEffect } from '@react-navigation/native';

const CreateProfileScreen = ({ navigation }) => {
  const theme = useTheme();
  const { setTabHidden } = useTabContext();
  const scrollYRef = useRef(0);
  const MIN_ANIM_MS = 4000; // match publish button animation duration

  const [name, setName] = useState('');
  const [experience, setExperience] = useState('');
  const [location, setLocation] = useState('Toronto, ON');
  const [locationInput, setLocationInput] = useState('Toronto, ON');
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const CAN_LOCATIONS = [
    'Toronto, ON','Mississauga, ON','Vancouver, BC','Montreal, QC','Calgary, AB','Edmonton, AB',
    'Ottawa, ON','Winnipeg, MB','Hamilton, ON','Kitchener, ON','London, ON','Victoria, BC'
  ];
  const ALL_LOCATIONS = [...CAN_LOCATIONS];
  const filteredLocations = useMemo(() => {
    const q = locationInput.trim().toLowerCase();
    if (!q) return CAN_LOCATIONS.slice(0, 10);
    return ALL_LOCATIONS.filter(loc =>
      loc.toLowerCase().includes(q)
    ).slice(0, 10);
  }, [locationInput]);

  // Hide tab bar when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      setTabHidden(true);
      return () => setTabHidden(false);
    }, [setTabHidden])
  );

  const requestPermissions = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to your photos.');
        return false;
      }
      return true;
    } catch (err) {
      console.warn('Permission error', err);
      return false;
    }
  };

  const pickImage = async () => {
    const ok = await requestPermissions();
    if (!ok) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true, aspect: [4, 3], quality: 0.8
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setSelectedImage(result.assets[0]);
    }
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Missing Info', 'Please enter your name.');
      return;
    }
    if (!location || !location.trim()) {
      Alert.alert('Missing Info', 'Please choose a location.');
      return;
    }
    if (submitting) return;
    setSubmitting(true);
    const startedAt = Date.now();
    let shouldNavigate = false;
    try {
      const userId = auth.currentUser?.uid || null;
      let avatarUrl = '';
      if (selectedImage?.uri) {
        const path = `profiles/${userId}/${Date.now()}.jpg`;
        avatarUrl = await storageService.uploadImage(selectedImage.uri, path);
      }
      const payload = {
        name: name.trim(),
        avatar: avatarUrl || selectedImage?.uri || '',
        experience: experience.trim(),
        location,
        userId,
        createdBy: auth.currentUser?.displayName ||
                   auth.currentUser?.email?.split('@')[0] ||
                   'Anonymous',
      };
      const profileId = await profileService.createProfile(payload);
      if (experience.trim()) {
        try {
          await commentService.createComment({
            profileId,
            text: experience.trim(),
            authorName: auth.currentUser?.displayName ||
                        auth.currentUser?.email?.split('@')[0] ||
                        'Anonymous',
            userId,
            isOriginalPoster: true,
            parentCommentId: null,
          });
        } catch (cErr) {
          console.warn('Could not create owner-note comment', cErr);
        }
      }
      // reset and navigate
      setName('');
      setExperience('');
      setLocation('Toronto, ON');
      setLocationInput('Toronto, ON');
      setSelectedImage(null);
      shouldNavigate = true;
    } catch (err) {
      console.error('Create profile error', err);
      Alert.alert('Error', 'Could not create profile.');
    } finally {
      const elapsed = Date.now() - startedAt;
      const remaining = Math.max(0, MIN_ANIM_MS - elapsed);
      if (remaining > 0) {
        await new Promise(resolve => setTimeout(resolve, remaining));
      }
      if (shouldNavigate) {
        navigation.navigate('Search');
      }
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBack}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Share Your Story</Text>
        <TouchableOpacity
          onPress={handleCreate}
          disabled={submitting}
          style={[styles.headerAction, submitting && { opacity: 0.85 }]}
        >
          {submitting ? (
            <LottieView
              source={require('../assets/animations/Sandy Loading.json')}
              autoPlay
              loop
              style={styles.headerLottie}
            />
          ) : (
            <Text style={styles.headerActionText}>Create</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        onScroll={(e) => {
          const y = e.nativeEvent.contentOffset.y;
          if (y - scrollYRef.current > 20) {
            setTabHidden(true);
          } else if (scrollYRef.current - y > 20) {
            setTabHidden(false);
          }
          scrollYRef.current = y;
        }}
        scrollEventThrottle={16}
      >
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <TouchableOpacity
            style={styles.imageContainer}
            onPress={pickImage}
            activeOpacity={0.8}
          >
            {selectedImage ? (
              <Image source={{ uri: selectedImage.uri }} style={styles.image} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="camera" size={28} color={theme.colors.primary} />
                <Text style={styles.imagePlaceholderText}>Tap to add photo</Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Full Name"
              placeholderTextColor="#888"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Location</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => {
                setLocationInput(location);
                setShowLocationModal(true);
              }}
            >
              <Text style={styles.locationText}>{location}</Text>
              <Ionicons name="chevron-down" size={18} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Your Experience</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              value={experience}
              onChangeText={setExperience}
              placeholder="Share your journey…"
              placeholderTextColor="#888"
              multiline
            />
          </View>
        </View>
      </ScrollView>

      {/* Location Picker Modal */}
      <Modal
        visible={showLocationModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLocationModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalBackdrop} 
          activeOpacity={1} 
          onPress={() => setShowLocationModal(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Change Location</Text>
              <TouchableOpacity onPress={() => setShowLocationModal(false)}>
                <Ionicons name="close" size={22} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <TextInput
                style={[styles.locationInput, { color: theme.colors.text }]}
                placeholder="City, State"
                placeholderTextColor={theme.colors.placeholder}
                value={locationInput}
                onChangeText={setLocationInput}
                autoFocus
              />
              <FlatList
                data={filteredLocations}
                keyExtractor={(item) => item}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.suggestionRow} 
                    onPress={() => {
                      setLocationInput(item);
                      setLocation(item);
                      setShowLocationModal(false);
                    }}
                  >
                    <Ionicons name="location-outline" size={16} color={theme.colors.primary} />
                    <Text style={[styles.suggestionText, { color: theme.colors.text }]} numberOfLines={1}>{item}</Text>
                  </TouchableOpacity>
                )}
                contentContainerStyle={styles.suggestionsList}
              />
              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: theme.colors.primary }]}
                onPress={() => { setLocation(locationInput); setShowLocationModal(false); }}
              >
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  headerLottie: { width: 36, height: 36 },

  scrollContent: { padding: 16, paddingBottom: 40 },
  card: {
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },

  imageContainer: {
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
  },
  image: {
    width: '100%',   // full width of container (or adjust as you like)
    aspectRatio: 4 / 3,
    borderRadius: 12,
    backgroundColor: '#ddd',
  },
  imagePlaceholder: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  imagePlaceholderText: {
    marginTop: 8, color: '#666', fontSize: 14,
  },

  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#111',
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textarea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  locationText: {
    flex: 1, color: '#111', fontSize: 15,
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 120,
  },
  modalContent: {
    width: '80%',
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: 'bold',
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  locationInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 15,
    color: '#374151',
    marginBottom: 15,
  },
  saveBtn: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
  },
  suggestionsList: { paddingBottom: 8 },
  suggestionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 8 },
  suggestionText: { fontSize: 14, flex: 1 },
});

export default CreateProfileScreen;
