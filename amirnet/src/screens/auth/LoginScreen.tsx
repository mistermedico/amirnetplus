import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  SafeAreaView, KeyboardAvoidingView, Platform, Alert, ScrollView,
} from 'react-native';
import { useApp } from '../../store/AppContext';
import { COLORS } from '../../utils/colors';

export default function LoginScreen({ navigation }: any) {
  const { login } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleLogin() {
    if (!username.trim() || !password.trim()) {
      Alert.alert('שגיאה', 'יש למלא שם משתמש וסיסמה');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const ok = login(username.trim(), password);
      setLoading(false);
      if (!ok) Alert.alert('שגיאה', 'שם משתמש או סיסמה שגויים');
    }, 400);
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.logo}>🌐</Text>
            <Text style={styles.title}>AmirNet Plus</Text>
            <Text style={styles.subtitle}>התחבר לחשבונך</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.fieldWrap}>
              <Text style={styles.label}>שם משתמש</Text>
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                placeholder="הכנס שם משתמש"
                placeholderTextColor={COLORS.textTertiary}
                autoCapitalize="none"
                textAlign="right"
                returnKeyType="next"
              />
            </View>

            <View style={styles.fieldWrap}>
              <Text style={styles.label}>סיסמה</Text>
              <View style={styles.passWrap}>
                <TouchableOpacity onPress={() => setShowPass(v => !v)} style={styles.eyeBtn}>
                  <Text style={styles.eyeIcon}>{showPass ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
                <TextInput
                  style={[styles.input, { flex: 1, marginBottom: 0, borderTopRightRadius: 12, borderBottomRightRadius: 12, borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="הכנס סיסמה"
                  placeholderTextColor={COLORS.textTertiary}
                  secureTextEntry={!showPass}
                  textAlign="right"
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.loginBtn, loading && { opacity: 0.7 }]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              <Text style={styles.loginBtnText}>{loading ? 'מתחבר...' : 'כניסה'}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.registerLink}>
              <Text style={styles.registerText}>
                אין לך חשבון? <Text style={{ color: COLORS.primary, fontWeight: '700' }}>הירשם כאן</Text>
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.hint}>
            <Text style={styles.hintTitle}>🔑 פרטי ברירת מחדל:</Text>
            <Text style={styles.hintText}>שם משתמש: admin</Text>
            <Text style={styles.hintText}>סיסמה: admin123</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 40 },
  logo: { fontSize: 60, marginBottom: 12 },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.text, marginBottom: 4 },
  subtitle: { fontSize: 16, color: COLORS.textSecondary },
  form: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 24,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    marginBottom: 20,
  },
  fieldWrap: { gap: 6 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.text, textAlign: 'right' },
  input: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.text,
    backgroundColor: COLORS.background,
    marginBottom: 0,
  },
  passWrap: { flexDirection: 'row', alignItems: 'center' },
  eyeBtn: {
    backgroundColor: COLORS.background,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  eyeIcon: { fontSize: 16 },
  loginBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 4,
  },
  loginBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  registerLink: { alignItems: 'center', paddingVertical: 4 },
  registerText: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center' },
  hint: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 12,
    padding: 14,
    alignItems: 'flex-end',
    gap: 4,
  },
  hintTitle: { fontSize: 13, fontWeight: '700', color: COLORS.primary, marginBottom: 2 },
  hintText: { fontSize: 13, color: COLORS.primary, fontFamily: 'monospace' },
});
