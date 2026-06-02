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
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* Branded hero */}
          <View style={styles.hero}>
            <View style={styles.blobTL} />
            <View style={styles.blobBR} />
            <View style={styles.logoWrap}>
              <Text style={styles.logoIcon}>🌐</Text>
            </View>
            <Text style={styles.heroTitle}>amirnet</Text>
            <Text style={styles.heroSub}>ברוך הבא! התחבר לחשבונך</Text>
          </View>

          {/* Form card */}
          <View style={styles.formCard}>
            <View style={styles.fieldWrap}>
              <Text style={styles.label}>שם משתמש</Text>
              <View style={styles.inputWrap}>
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
                <Text style={styles.inputIcon}>👤</Text>
              </View>
            </View>

            <View style={styles.fieldWrap}>
              <Text style={styles.label}>סיסמה</Text>
              <View style={styles.inputWrap}>
                <TouchableOpacity onPress={() => setShowPass(v => !v)} style={styles.eyeBtn}>
                  <Text style={styles.eyeIcon}>{showPass ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
                <TextInput
                  style={[styles.input, { flex: 1, borderTopRightRadius: 0, borderBottomRightRadius: 0 }]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="הכנס סיסמה"
                  placeholderTextColor={COLORS.textTertiary}
                  secureTextEntry={!showPass}
                  textAlign="right"
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
                <Text style={styles.inputIcon}>🔑</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.loginBtn, loading && { opacity: 0.7 }]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              <Text style={styles.loginBtnText}>{loading ? 'מתחבר...' : 'כניסה →'}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.registerLink}>
              <Text style={styles.registerText}>
                אין לך חשבון? <Text style={{ color: COLORS.primary, fontWeight: '700' }}>הירשם כאן</Text>
              </Text>
            </TouchableOpacity>
          </View>

          {/* Credentials hint */}
          <View style={styles.hint}>
            <Text style={styles.hintTitle}>🔑 כניסה ראשונה</Text>
            <View style={styles.hintRow}>
              <Text style={styles.hintCode}>admin123</Text>
              <Text style={styles.hintSep}>/</Text>
              <Text style={styles.hintCode}>admin</Text>
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flexGrow: 1 },
  hero: {
    backgroundColor: COLORS.primary, paddingTop: 48, paddingBottom: 52,
    paddingHorizontal: 32, alignItems: 'center', overflow: 'hidden',
    borderBottomLeftRadius: 32, borderBottomRightRadius: 32,
  },
  blobTL: { position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(255,255,255,0.08)' },
  blobBR: { position: 'absolute', bottom: -30, left: -50, width: 130, height: 130, borderRadius: 65, backgroundColor: 'rgba(255,255,255,0.06)' },
  logoWrap: {
    width: 80, height: 80, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  logoIcon: { fontSize: 42 },
  heroTitle: { fontSize: 28, fontWeight: '800', color: '#fff', marginBottom: 6, letterSpacing: -0.3 },
  heroSub: { fontSize: 15, color: 'rgba(255,255,255,0.8)' },
  formCard: {
    backgroundColor: COLORS.surface, margin: 20, borderRadius: 22, padding: 22, gap: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.1, shadowRadius: 16, elevation: 6,
    marginTop: -20,
  },
  fieldWrap: { gap: 7 },
  label: { fontSize: 14, fontWeight: '700', color: COLORS.text, textAlign: 'right' },
  inputWrap: { flexDirection: 'row', alignItems: 'center' },
  inputIcon: { fontSize: 18, paddingHorizontal: 10, backgroundColor: COLORS.background, borderWidth: 1.5, borderColor: COLORS.border, borderTopRightRadius: 12, borderBottomRightRadius: 12, height: 48, textAlignVertical: 'center', lineHeight: 48 },
  input: {
    flex: 1, borderWidth: 1.5, borderColor: COLORS.border,
    borderTopLeftRadius: 12, borderBottomLeftRadius: 12, borderTopRightRadius: 12, borderBottomRightRadius: 12,
    paddingHorizontal: 14, height: 48, fontSize: 15, color: COLORS.text, backgroundColor: COLORS.background,
  },
  eyeBtn: {
    backgroundColor: COLORS.background, borderWidth: 1.5, borderColor: COLORS.border,
    borderTopLeftRadius: 12, borderBottomLeftRadius: 12,
    width: 44, height: 48, justifyContent: 'center', alignItems: 'center',
  },
  eyeIcon: { fontSize: 18 },
  loginBtn: {
    backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 4,
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  loginBtnText: { color: '#fff', fontSize: 17, fontWeight: '800' },
  registerLink: { alignItems: 'center', paddingVertical: 6 },
  registerText: { fontSize: 14, color: COLORS.textSecondary },
  hint: {
    backgroundColor: COLORS.primaryLight, borderRadius: 14, marginHorizontal: 20, padding: 14,
    alignItems: 'center', gap: 6, marginBottom: 20,
  },
  hintTitle: { fontSize: 13, fontWeight: '700', color: COLORS.primary },
  hintRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  hintSep: { color: COLORS.textSecondary, fontSize: 14 },
  hintCode: { fontSize: 14, color: COLORS.primary, fontFamily: 'monospace', fontWeight: '700', backgroundColor: '#fff', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
});
