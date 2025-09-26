import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Alert, ScrollView } from 'react-native';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

const defaultColor = '#7C9AFF';
const defaultIcon = 'people';

const CreateCommunityScreen = ({ navigation }) => {
  const theme = useTheme();
  const [name, setName] = useState('');
  const [color, setColor] = useState(defaultColor);

  const toId = (value) =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');

  const handleCreate = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      Alert.alert('Missing Info', 'Please enter a community name.');
      return;
    }
    const idBase = toId(trimmed) || `community-${Date.now()}`;
    const newCommunity = {
      id: idBase,
      name: trimmed,
      icon: defaultIcon,
      color: color || defaultColor,
      memberCount: Math.floor(Math.random() * 900) + 100,
    };
    navigation.navigate('Home', { newCommunity });
    // Clear form after creating
    setName('');
  };

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: theme.colors.background }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <TouchableOpacity style={[styles.iconButton, { backgroundColor: theme.colors.surface }]} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={22} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Create Community</Text>
        <TouchableOpacity style={[styles.createButton, { backgroundColor: theme.colors.primary }]} onPress={handleCreate}>
          <Text style={styles.createText}>Create</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Community Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g. Movie Night Crew"
            placeholderTextColor={theme.colors.placeholder}
            style={[styles.input, { color: theme.colors.text }]}
          />

          <Text style={[styles.note, { color: theme.dark ? theme.colors.text : '#6B7280' }]}>Icon selection removed. A default icon will be used.</Text>

          <Text style={[styles.label, { color: theme.colors.text, marginTop: 16 }]}>Color (hex)</Text>
          <TextInput
            value={color}
            onChangeText={setColor}
            placeholder="#7C9AFF"
            placeholderTextColor={theme.colors.placeholder}
            style={[styles.input, { color: theme.colors.text }]}
            autoCapitalize="none"
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
  headerTitle: { fontSize: 19, fontWeight: 'bold' },
  createButton: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  createText: { color: '#FFFFFF', fontWeight: 'bold' },
  content: { padding: 16 },
  card: { borderRadius: 16, padding: 16, elevation: 2 },
  label: { fontSize: 15, fontWeight: '600', marginBottom: 6, marginTop: 10 },
  input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15 },
  note: { marginTop: 4, fontSize: 13 },
});

export default CreateCommunityScreen; 