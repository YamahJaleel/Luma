import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { auth } from '../config/firebase';

const MIN_PW = 8;

function getParamFromUrl(url, key) {
  try {
    const u = new URL(url);
    return u.searchParams.get(key);
  } catch (e) {
    return null;
  }
}

const ResetPasswordScreen = ({ route, navigation }) => {
  const [oobCode, setOobCode] = useState(route?.params?.oobCode || null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [verified, setVerified] = useState(false);

  // Accept deep link URL passed by linking (React Navigation passes it on initialState or route)
  useEffect(() => {
    if (!oobCode && route?.params?.url) {
      const code = getParamFromUrl(route.params.url, 'oobCode');
      if (code) setOobCode(code);
    }
  }, [route, oobCode]);

  useEffect(() => {
    let mounted = true;
    const verify = async () => {
      if (!oobCode) { setLoading(false); setError('Invalid or missing code'); return; }
      try {
        const mail = await verifyPasswordResetCode(auth, oobCode);
        if (!mounted) return;
        setEmail(mail || '');
        setVerified(true);
      } catch (e) {
        setError('This reset link is invalid or has expired.');
      } finally {
        setLoading(false);
      }
    };
    verify();
    return () => { mounted = false; };
  }, [oobCode]);

  const canSubmit = useMemo(() => password.length >= MIN_PW && password === confirm && verified && !loading, [password, confirm, verified, loading]);

  const onSubmit = async () => {
    setError('');
    if (!canSubmit) return;
    try {
      await confirmPasswordReset(auth, oobCode, password);
      Alert.alert('Password updated', 'Your password has been reset. You can sign in now.');
      navigation.navigate('SignIn');
    } catch (e) {
      const code = e?.code;
      if (code === 'auth/weak-password') setError('Choose a stronger password.');
      else if (code === 'auth/expired-action-code' || code === 'auth/invalid-action-code') setError('This link is invalid or expired.');
      else setError('Unable to reset password. Please try again.');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <LinearGradient colors={['#FAF6F0', '#F5F1EB']} style={styles.gradient}>
        <Text style={styles.title}>Set a new password</Text>
        {!!email && <Text style={styles.subtitle}>Account: {email}</Text>}
        {!!error && <Text style={styles.error}>{error}</Text>}

        <Text style={styles.label}>New password</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="Enter new password"
          placeholderTextColor="#A0AEC0"
          style={styles.input}
        />
        <Text style={styles.hint}>At least {MIN_PW} characters.</Text>

        <Text style={styles.label}>Confirm password</Text>
        <TextInput
          value={confirm}
          onChangeText={setConfirm}
          secureTextEntry
          placeholder="Re-enter new password"
          placeholderTextColor="#A0AEC0"
          style={styles.input}
        />

        <TouchableOpacity disabled={!canSubmit} style={[styles.button, !canSubmit && styles.buttonDisabled]} onPress={onSubmit}>
          <LinearGradient colors={['#3E5F44', '#4A7C59']} style={styles.buttonInner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Text style={styles.buttonText}>Update password</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
          <Text style={styles.link}>Back to Sign In</Text>
        </TouchableOpacity>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  gradient: { flex: 1, paddingHorizontal: 20, paddingTop: 60 },
  title: { fontSize: 24, fontWeight: '700', color: '#3E5F44' },
  subtitle: { marginTop: 8, color: '#4B5563' },
  label: { marginTop: 20, fontSize: 14, color: '#374151' },
  input: { marginTop: 8, backgroundColor: 'white', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: '#1F2937' },
  hint: { color: '#6B7280', marginTop: 6 },
  button: { marginTop: 24, borderRadius: 28, overflow: 'hidden' },
  buttonDisabled: { opacity: 0.7 },
  buttonInner: { paddingVertical: 16, alignItems: 'center', borderRadius: 28 },
  buttonText: { color: 'white', fontSize: 16, fontWeight: '700' },
  link: { marginTop: 16, textAlign: 'center', color: '#3E5F44', fontWeight: '600' },
  error: { color: '#DC2626', marginTop: 12 },
});

export default ResetPasswordScreen;


