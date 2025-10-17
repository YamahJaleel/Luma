import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFirebase } from '../contexts/FirebaseContext';

const EMAIL_REGEX = /\S+@\S+\.\S+/;

const SignInToDeleteScreen = ({ navigation, route }) => {
  const { reauthenticateWithPassword, deleteAccountAndData } = useFirebase();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onReauthAndDelete = async () => {
    setError('');
    if (!EMAIL_REGEX.test(email.trim())) {
      setError('Enter a valid email address');
      return;
    }
    if (!password || password.length < 6) {
      setError('Enter your password');
      return;
    }

    setLoading(true);
    try {
      await reauthenticateWithPassword(email.trim(), password);
      const summary = await deleteAccountAndData();
      const lines = [
        `Profiles deleted: ${summary.profilesDeleted}`,
        `Posts deleted: ${summary.postsDeleted}`,
        `Comments deleted: ${summary.commentsDeleted}`,
        `Messages deleted: ${summary.messagesDeleted}`,
        `Notifications deleted: ${summary.notificationsDeleted}`,
        `Push tokens deleted: ${summary.tokensDeleted}`,
        `Likes removed: ${summary.likesRemoved}`,
        `Auxiliary docs deleted: ${summary.auxiliaryDocsDeleted}`,
        `Auth user deleted: ${summary.deletedAuthUser ? 'Yes' : 'No'}`,
      ];
      Alert.alert('Account Deletion Summary', lines.join('\n'));
      navigation.reset({ index: 0, routes: [{ name: 'SignIn' }] });
    } catch (e) {
      setError(e?.message || 'Re-authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <LinearGradient colors={['#FAF6F0', '#F5F1EB']} style={styles.gradient}>
        <View style={styles.header}> 
          <Text style={styles.title}>Confirm your identity</Text>
          <Text style={styles.subtitle}>Sign in again to permanently delete your account.</Text>
        </View>

        <View style={styles.form}> 
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="you@example.com"
            placeholderTextColor="#A0AEC0"
          />
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Enter your password"
            placeholderTextColor="#A0AEC0"
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity disabled={loading} style={[styles.button, loading && styles.buttonDisabled]} onPress={onReauthAndDelete}>
            <LinearGradient colors={['#3E5F44', '#4A7C59']} style={styles.buttonInner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Text style={styles.buttonText}>{loading ? 'Deleting…' : 'Confirm and Delete'}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.link}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1, paddingHorizontal: 20, paddingTop: 60 },
  header: { marginBottom: 24 },
  title: { fontSize: 24, fontWeight: '700', color: '#3E5F44', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#4B5563' },
  form: { marginTop: 8 },
  label: { fontSize: 14, color: '#374151', marginBottom: 8, marginTop: 12 },
  input: { backgroundColor: 'white', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: '#1F2937' },
  button: { marginTop: 20, borderRadius: 28, overflow: 'hidden' },
  buttonDisabled: { opacity: 0.7 },
  buttonInner: { paddingVertical: 16, alignItems: 'center', borderRadius: 28 },
  buttonText: { color: 'white', fontSize: 16, fontWeight: '700' },
  link: { marginTop: 16, textAlign: 'center', color: '#3E5F44', fontWeight: '600' },
  error: { color: '#DC2626', marginTop: 8 },
});

export default SignInToDeleteScreen;


