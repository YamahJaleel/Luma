import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Alert, ScrollView, Image } from 'react-native';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

const CreateProfileScreen = ({ route, navigation }) => {
  const theme = useTheme();
  const { onSubmit } = route.params || {};

  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bio, setBio] = useState('');

  const handleCreate = () => {
    if (!name.trim()) {
      Alert.alert('Missing Info', 'Please enter a name.');
      return;
    }
    const newProfile = {
      id: Date.now(),
      name: name.trim(),
      avatar: avatarUrl.trim() || 'https://via.placeholder.com/150',
      size: 'small',
      isOnline: false,
      lastSeen: 'just now',
      mutualFriends: 0,
      riskLevel: 'green',
      flags: [],
      reports: 0,
      bio: bio.trim(),
    };
    if (typeof onSubmit === 'function') onSubmit(newProfile);
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: theme.colors.background }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <TouchableOpacity style={[styles.iconButton, { backgroundColor: theme.colors.surface }]} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={22} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Add Profile</Text>
        <TouchableOpacity style={[styles.createButton, { backgroundColor: theme.colors.primary }]} onPress={handleCreate}>
          <Text style={styles.createText}>Create</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Photo URL</Text>
          <TextInput
            value={avatarUrl}
            onChangeText={setAvatarUrl}
            placeholder="Paste image URL (temporary)"
            placeholderTextColor={theme.colors.placeholder}
            style={[styles.input, { color: theme.colors.text }]}
            autoCapitalize="none"
          />
          {!!avatarUrl && (
            <Image source={{ uri: avatarUrl }} style={styles.previewImage} />
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
            placeholder="Write something about this profile..."
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
  label: { fontSize: 14, fontWeight: '600', marginTop: 8, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  textarea: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, minHeight: 100 },
  previewImage: { width: '100%', height: 180, borderRadius: 12, marginBottom: 8, backgroundColor: '#F0F0F0' },
});

export default CreateProfileScreen; 