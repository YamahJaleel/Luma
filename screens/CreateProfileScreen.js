import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Alert, ScrollView, Image, Modal, FlatList } from 'react-native';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTabContext } from '../components/TabContext';

const CreateProfileScreen = ({ route, navigation }) => {
  const theme = useTheme();
  const { setTabHidden } = useTabContext();
  const scrollYRef = React.useRef(0);

  const [name, setName] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('Toronto, ON');
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationInput, setLocationInput] = useState('Toronto, ON');

  // Location data (same as SearchScreen)
  const CAN_LOCATIONS = [
    'Toronto, ON','Mississauga, ON','Vancouver, BC','Montreal, QC','Calgary, AB','Edmonton, AB','Ottawa, ON','Winnipeg, MB','Quebec City, QC','Hamilton, ON','Kitchener, ON',
    'London, ON','Victoria, BC','Halifax, NS','Oshawa, ON','Windsor, ON','Saskatoon, SK','Regina, SK','Sherbrooke, QC','Barrie, ON','Kelowna, BC',
    'Abbotsford, BC','Kingston, ON','Trois-Rivières, QC','Guelph, ON','Cambridge, ON','Whitehorse, YT','Saint John, NB','Thunder Bay, ON','Peterborough, ON','Red Deer, AB',
    'Brampton, ON','Markham, ON','Vaughan, ON','Richmond, ON','Oakville, ON','Burlington, ON','Richmond Hill, ON','Ajax, ON','Whitby, ON','Pickering, ON',
    'Surrey, BC','Burnaby, BC','Richmond, BC','Coquitlam, BC','Langley, BC','Delta, BC','North Vancouver, BC','West Vancouver, BC','New Westminster, BC','Port Coquitlam, BC'
  ];
  
  const ALL_LOCATIONS = [
    'New York, NY','Los Angeles, CA','Chicago, IL','Houston, TX','Phoenix, AZ','Philadelphia, PA','San Antonio, TX','San Diego, CA','Dallas, TX','San Jose, CA',
    'Austin, TX','Jacksonville, FL','Fort Worth, TX','Columbus, OH','Charlotte, NC','San Francisco, CA','Indianapolis, IN','Seattle, WA','Denver, CO','Washington, DC',
    'Boston, MA','El Paso, TX','Nashville, TN','Detroit, MI','Oklahoma City, OK','Portland, OR','Las Vegas, NV','Memphis, TN','Louisville, KY','Baltimore, MD',
    ...CAN_LOCATIONS
  ];

  const filteredLocations = React.useMemo(() => {
    const q = locationInput.trim().toLowerCase();
    if (!q) return CAN_LOCATIONS.slice(0, 20);
    return ALL_LOCATIONS.filter(loc => loc.toLowerCase().includes(q)).slice(0, 20);
  }, [locationInput, CAN_LOCATIONS, ALL_LOCATIONS]);

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
    
    // Auto-generate username from name
    const generateUsername = (fullName) => {
      const nameParts = fullName.trim().toLowerCase().split(' ');
      if (nameParts.length >= 2) {
        return `${nameParts[0]}${nameParts[1].charAt(0)}`;
      } else {
        return nameParts[0];
      }
    };
    
    const newProfile = {
      id: Date.now(),
      name: name.trim(),
      username: generateUsername(name.trim()),
      avatar: selectedImage ? selectedImage.uri : 'https://via.placeholder.com/150',
      size: 'small',
      isOnline: false,
      lastSeen: 'just now',
      mutualFriends: 0,
      riskLevel: 'green',
      flags: [],
      reports: 0,
      bio: bio.trim(),
      location: location,
    };
    // Navigate back to Search with a serializable param
    navigation.navigate('Search', { newProfile });
    // Clear form after creating
    setName('');
    setBio('');
    setLocation('Toronto, ON');
    setLocationInput('Toronto, ON');
    setSelectedImage(null);
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

      <ScrollView 
        contentContainerStyle={styles.content} 
        keyboardShouldPersistTaps="handled"
        onScroll={(e) => {
          const y = e.nativeEvent.contentOffset.y;
          const prevY = scrollYRef.current || 0;
          const dy = y - prevY;
          if (dy > 5 && y > 20) {
            setTabHidden(true);
          } else if (dy < -15 || y <= 20) {
            setTabHidden(false);
          }
          scrollYRef.current = y;
        }}
        scrollEventThrottle={16}
      >
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Photo</Text>
          
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

          <Text style={[styles.label, { color: theme.colors.text }]}>Location</Text>
          <TouchableOpacity
            style={styles.locationRow}
            onPress={() => { setLocationInput(location); setShowLocationModal(true); }}
            activeOpacity={0.8}
          >
            <Ionicons name="location" size={12} color="#3E5F44" />
            <Text style={[styles.locationText, { color: "#3E5F44" }]}>{location}</Text>
          </TouchableOpacity>

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

      {/* Location Modal */}
      <Modal visible={showLocationModal} transparent animationType="fade" onRequestClose={() => setShowLocationModal(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowLocationModal(false)}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Change Location</Text>
              <TouchableOpacity onPress={() => setShowLocationModal(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            
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
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.suggestionRow} onPress={() => setLocationInput(item)}>
                  <Ionicons name="location-outline" size={16} color={theme.colors.primary} />
                  <Text style={[styles.suggestionText, { color: theme.colors.text }]}>{item}</Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item, index) => `location-${index}`}
              style={styles.suggestionsList}
            />
            
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => { setLocation(locationInput); setShowLocationModal(false); }}
            >
              <Text style={styles.saveButtonText}>Save Location</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 56 },
  iconButton: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 19, fontWeight: 'bold' },
  createButton: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  createText: { color: '#FFFFFF', fontWeight: 'bold' },
  content: { padding: 16 },
  card: { borderRadius: 16, padding: 16, elevation: 2 },
  label: { fontSize: 15, fontWeight: '600', marginTop: 16, marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15 },
  textarea: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, minHeight: 100, fontSize: 15 },
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
    fontSize: 17,
    fontWeight: '600',
  },
  imageContainer: {
    alignItems: 'center',
  },
  previewImage: { 
    width: '100%', 
    aspectRatio: 1, 
    borderRadius: 12, 
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
    fontSize: 15,
    fontWeight: '600',
  },
  // Location styles
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    backgroundColor: '#F9FAFB',
    gap: 8,
  },
  locationText: {
    fontSize: 15,
    fontWeight: '500',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    borderRadius: 16,
    padding: 20,
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
  },
  locationInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    marginBottom: 16,
  },
  suggestionsList: {
    maxHeight: 200,
    marginBottom: 16,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 12,
  },
  suggestionText: {
    fontSize: 15,
  },
  saveButton: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CreateProfileScreen; 