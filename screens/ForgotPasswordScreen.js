import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFirebase } from '../contexts/FirebaseContext';

const EMAIL_REGEX = /\S+@\S+\.\S+/;

const ForgotPasswordScreen = ({ navigation }) => {
  const { resetPassword } = useFirebase();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [cooldownUntil, setCooldownUntil] = useState(0);

  const onSubmit = async () => {
    setError('');
    setSuccess('');

    if (!EMAIL_REGEX.test(email.trim())) {
      setError('Enter a valid email address');
      return;
    }

    // Cooldown: prevent rapid resends (45s default)
    const now = Date.now();
    if (cooldownUntil && now < cooldownUntil) {
      const remaining = Math.ceil((cooldownUntil - now) / 1000);
      setError(`Please wait ${remaining}s before requesting another link.`);
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email.trim());
      setSuccess('If an account exists for this email, a reset link was sent.');
      Alert.alert('Check your email', 'If an account exists, a password reset email has been sent.');
      // Start cooldown (45s)
      setCooldownUntil(Date.now() + 45_000);
    } catch (e) {
      // Show generic message to avoid user enumeration
      console.warn('Forgot password error:', e);
      setSuccess('If an account exists for this email, a reset link was sent. Please make sure to check your spam folder as well there is a chance that the reset link was sent there.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <LinearGradient colors={['#FAF6F0', '#F5F1EB']} style={styles.gradient}>
        <View style={styles.header}> 
          <Text style={styles.title}>Reset your password</Text>
          <Text style={styles.subtitle}>Enter your email to receive a reset link.</Text>
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
          {error ? <Text style={styles.error}>{error}</Text> : null}
          {success ? <Text style={styles.success}>{success}</Text> : null}

          <TouchableOpacity disabled={loading || (cooldownUntil && Date.now() < cooldownUntil)} style={[styles.button, (loading || (cooldownUntil && Date.now() < cooldownUntil)) && styles.buttonDisabled]} onPress={onSubmit}>
            <LinearGradient colors={['#3E5F44', '#4A7C59']} style={styles.buttonInner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Text style={styles.buttonText}>{loading ? 'Sending…' : (cooldownUntil && Date.now() < cooldownUntil ? 'Please wait…' : 'Send reset link')}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.link}>Back to Sign In</Text>
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
  label: { fontSize: 14, color: '#374151', marginBottom: 8 },
  input: { backgroundColor: 'white', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: '#1F2937' },
  button: { marginTop: 20, borderRadius: 28, overflow: 'hidden' },
  buttonDisabled: { opacity: 0.7 },
  buttonInner: { paddingVertical: 16, alignItems: 'center', borderRadius: 28 },
  buttonText: { color: 'white', fontSize: 16, fontWeight: '700' },
  link: { marginTop: 16, textAlign: 'center', color: '#3E5F44', fontWeight: '600' },
  error: { color: '#DC2626', marginTop: 8 },
  success: { color: '#065F46', marginTop: 8 },
});

export default ForgotPasswordScreen;


