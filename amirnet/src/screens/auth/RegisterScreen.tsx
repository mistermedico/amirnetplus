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
      Alert.alert('שגיאה', 'יש למלא את כל השדות'); return;
    }
    if (password !== confirmPass) {
      Alert.alert('שגיאה', 'הסיסמאות אינן תואמות'); return;
    }
    if (password.length < 6) {
      Alert.alert('שגיאה', 'הסיסמה חייבת להיות לפחות 6 תווים'); return;
    }
    const ok = createUser(username.trim(), password, 'student', displayName.trim());
    if (!ok) { Alert.alert('שגיאה', 'שם המשתמש כבר קיים'); return; }
    Alert.alert('הצלחה', 'החשבון נוצר! כנס/י לחשבון', [
      { text: 'כניסה', onPress: () => navigation.navigate('Login') },
    ]);
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* Hero */}
          <View style={styles.hero}>
            <View style={styles.blob} />
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Text style={styles.backTxt}>‹ חזרה</Text>
            </TouchableOpacity>
            <View style={styles.heroIcon}><Text style={styles.heroIconTxt}>🎓</Text></View>
            <Text style={styles.heroTitle}>יצירת חשבון</Text>
            <Text style={styles.heroSub}>הצטרף ל-AmirNet Plus</Text>
          </View>

          {/* Form card */}
          <View style={styles.formCard}>
            {[
              { label: 'שם מלא', value: displayName, setter: setDisplayName, placeholder: 'הזן שם מלא', autoCapitalize: 'words' as const, icon: '👤' },
              { label: 'שם משתמש', value: username, setter: setUsername, placeholder: 'לדוגמה: user123', autoCapitalize: 'none' as const, icon: '🏷️' },
            ].map(f => (
              <View key={f.label} style={styles.fieldWrap}>
                <Text style={styles.label}>{f.label}</Text>
                <View style={styles.inputRow}>
                  <TextInput
                    style={[styles.input, { flex: 1, borderTopRightRadius: 0, borderBottomRightRadius: 0 }]}
                    value={f.value}
                    onChangeText={f.setter}
                    placeholder={f.placeholder}
                    placeholderTextColor={COLORS.textTertiary}
                    autoCapitalize={f.autoCapitalize}
                    textAlign="right"
                  />
                  <Text style={styles.inputIcon}>{f.icon}</Text>
                </View>
              </View>
            ))}

            <View style={styles.fieldWrap}>
              <Text style={styles.label}>סיסמה (מינימום 6 תווים)</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="הזן סיסמה"
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
                <Text style={styles.passError}>הסיסמאות אינן תואמות</Text>
              )}
            </View>

            <TouchableOpacity onPress={() => setShowPass(v => !v)} style={styles.showPassRow}>
              <Text style={styles.showPassTxt}>{showPass ? '🙈 הסתר סיסמה' : '👁️ הצג סיסמה'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.registerBtn} onPress={handleRegister} activeOpacity={0.85}>
              <Text style={styles.registerBtnTxt}>צור חשבון →</Text>
            </TouchableOpacity>
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
    backgroundColor: COLORS.secondary, paddingTop: 40, paddingBottom: 52,
    paddingHorizontal: 32, alignItems: 'center', overflow: 'hidden',
    borderBottomLeftRadius: 32, borderBottomRightRadius: 32,
  },
  blob: { position: 'absolute', top: -30, left: -40, width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(255,255,255,0.08)' },
  backBtn: { alignSelf: 'flex-start', marginBottom: 16 },
  backTxt: { color: 'rgba(255,255,255,0.85)', fontSize: 15, fontWeight: '600' },
  heroIcon: { width: 72, height: 72, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.18)', justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  heroIconTxt: { fontSize: 38 },
  heroTitle: { fontSize: 26, fontWeight: '800', color: '#fff', marginBottom: 6 },
  heroSub: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  formCard: {
    backgroundColor: COLORS.surface, margin: 20, borderRadius: 22, padding: 22, gap: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.1, shadowRadius: 16, elevation: 6,
    marginTop: -20,
  },
  fieldWrap: { gap: 7 },
  label: { fontSize: 14, fontWeight: '700', color: COLORS.text, textAlign: 'right' },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  inputIcon: { fontSize: 18, paddingHorizontal: 10, backgroundColor: COLORS.background, borderWidth: 1.5, borderColor: COLORS.border, borderTopRightRadius: 12, borderBottomRightRadius: 12, height: 48, textAlignVertical: 'center', lineHeight: 48 },
  input: {
    borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12,
    paddingHorizontal: 14, height: 48, fontSize: 15, color: COLORS.text, backgroundColor: COLORS.background,
  },
  passError: { color: COLORS.danger, fontSize: 12, textAlign: 'right' },
  showPassRow: { alignItems: 'flex-end' },
  showPassTxt: { color: COLORS.textSecondary, fontSize: 13 },
  registerBtn: {
    backgroundColor: COLORS.secondary, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 4,
    shadowColor: COLORS.secondary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  registerBtnTxt: { color: '#fff', fontSize: 17, fontWeight: '800' },
});
