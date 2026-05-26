import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  SafeAreaView, KeyboardAvoidingView, Platform, Alert, ScrollView,
} from 'react-native';
import { useApp } from '../../store/AppContext';
import { COLORS } from '../../utils/colors';

export default function RegisterScreen({ navigation }: any) {
  const { createUser } = useApp();
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState(false);

  function handleRegister() {
    if (!displayName.trim() || !username.trim() || !password.trim()) {
      Alert.alert('שגיאה', 'יש למלא את כל השדות');
      return;
    }
    if (password !== confirmPass) {
      Alert.alert('שגיאה', 'הסיסמאות אינן תואמות');
      return;
    }
    if (password.length < 6) {
      Alert.alert('שגיאה', 'הסיסמה חייבת להיות לפחות 6 תווים');
      return;
    }
    const ok = createUser(username.trim(), password, 'student', displayName.trim());
    if (!ok) {
      Alert.alert('שגיאה', 'שם המשתמש כבר קיים');
      return;
    }
    Alert.alert('הצלחה', 'החשבון נוצר! כנס/י לחשבון', [
      { text: 'כניסה', onPress: () => navigation.navigate('Login') },
    ]);
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
            <Text style={styles.backText}>← חזרה</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>יצירת חשבון</Text>
            <Text style={styles.subtitle}>הצטרף לAmirNet Plus</Text>
          </View>

          <View style={styles.form}>
            {[
              { label: 'שם מלא', value: displayName, setter: setDisplayName, placeholder: 'השם שלך', autoCapitalize: 'words' as const },
              { label: 'שם משתמש', value: username, setter: setUsername, placeholder: 'לדוגמה: user123', autoCapitalize: 'none' as const },
            ].map(f => (
              <View key={f.label} style={styles.fieldWrap}>
                <Text style={styles.label}>{f.label}</Text>
                <TextInput
                  style={styles.input}
                  value={f.value}
                  onChangeText={f.setter}
                  placeholder={f.placeholder}
                  placeholderTextColor={COLORS.textTertiary}
                  autoCapitalize={f.autoCapitalize}
                  textAlign="right"
                />
              </View>
            ))}

            <View style={styles.fieldWrap}>
              <Text style={styles.label}>סיסמה (מינימום 6 תווים)</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="הכנס סיסמה"
                placeholderTextColor={COLORS.textTertiary}
                secureTextEntry={!showPass}
                textAlign="right"
              />
            </View>

            <View style={styles.fieldWrap}>
              <Text style={styles.label}>אימות סיסמה</Text>
              <TextInput
                style={[styles.input, confirmPass && password !== confirmPass && { borderColor: COLORS.danger }]}
                value={confirmPass}
                onChangeText={setConfirmPass}
                placeholder="חזור על הסיסמה"
                placeholderTextColor={COLORS.textTertiary}
                secureTextEntry={!showPass}
                textAlign="right"
              />
              {confirmPass.length > 0 && password !== confirmPass && (
                <Text style={{ color: COLORS.danger, fontSize: 12, textAlign: 'right' }}>הסיסמאות אינן תואמות</Text>
              )}
            </View>

            <TouchableOpacity onPress={() => setShowPass(v => !v)} style={styles.showPassRow}>
              <Text style={styles.showPassText}>{showPass ? '🙈 הסתר סיסמה' : '👁️ הצג סיסמה'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.registerBtn} onPress={handleRegister} activeOpacity={0.85}>
              <Text style={styles.registerBtnText}>צור חשבון</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flexGrow: 1, padding: 24 },
  back: { marginBottom: 8 },
  backText: { color: COLORS.primary, fontSize: 15 },
  header: { alignItems: 'center', marginBottom: 28 },
  title: { fontSize: 26, fontWeight: '800', color: COLORS.text, marginBottom: 4 },
  subtitle: { fontSize: 15, color: COLORS.textSecondary },
  form: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 24,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  fieldWrap: { gap: 5 },
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
  },
  showPassRow: { alignItems: 'flex-end' },
  showPassText: { color: COLORS.textSecondary, fontSize: 13 },
  registerBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 4,
  },
  registerBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
