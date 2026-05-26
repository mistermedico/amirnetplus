import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, TextInput, Alert, Switch, Modal,
} from 'react-native';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { useApp } from '../../store/AppContext';
import { COLORS } from '../../utils/colors';

export default function SettingsScreen({ navigation }: any) {
  const { state, dispatch, logout, changePassword } = useApp();
  const { progress } = state;
  const user = state.auth.currentUser;

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [dailyGoal, setDailyGoal] = useState(progress.dailyGoal);
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [saved, setSaved] = useState(false);

  function saveSettings() {
    dispatch({ type: 'UPDATE_SETTINGS', payload: { dailyGoal } });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleChangePwd() {
    if (!oldPwd || !newPwd || newPwd.length < 6) {
      Alert.alert('שגיאה', 'יש למלא שדות תקינים'); return;
    }
    // Verify old password
    const { hashPassword } = require('../../utils/hashUtils');
    if (hashPassword(oldPwd) !== user?.passwordHash) {
      Alert.alert('שגיאה', 'הסיסמה הנוכחית שגויה'); return;
    }
    if (user) changePassword(user.id, newPwd);
    setShowPwdModal(false); setOldPwd(''); setNewPwd('');
    Alert.alert('הצלחה', 'הסיסמה שונתה בהצלחה');
  }

  async function exportData() {
    const lines = [
      'AmirNet Plus - דוח התקדמות',
      `תאריך: ${new Date().toLocaleDateString('he-IL')}`,
      `משתמש: ${user?.displayName} (@${user?.username})`,
      '',
      '=== סטטיסטיקות כלליות ===',
      `סה"כ שאלות: ${progress.totalAnswered}`,
      `תשובות נכונות: ${progress.totalCorrect}`,
      `אחוז הצלחה: ${progress.totalAnswered > 0 ? Math.round((progress.totalCorrect / progress.totalAnswered) * 100) : 0}%`,
      `ימי רצף: ${progress.streakDays}`,
      '',
      '=== היסטוריית בחינות (10 אחרונות) ===',
      ...progress.quizHistory.slice(0, 10).map(h =>
        `${new Date(h.date).toLocaleDateString('he-IL')}: ${h.score}/${h.total} (${Math.round((h.score / h.total) * 100)}%)`
      ),
    ];
    const text = lines.join('\n');
    try {
      const path = FileSystem.cacheDirectory + 'amirnet_report.txt';
      await FileSystem.writeAsStringAsync(path, text);
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(path, { dialogTitle: 'ייצוא נתונים' });
      } else {
        Alert.alert('דוח', text);
      }
    } catch {
      Alert.alert('שגיאה', 'לא ניתן לייצא');
    }
  }

  function handleLogout() {
    Alert.alert('התנתקות', 'להתנתק מהמשתמש?', [
      { text: 'ביטול', style: 'cancel' },
      { text: 'התנתק', style: 'destructive', onPress: logout },
    ]);
  }

  function handleReset() {
    Alert.alert('איפוס התקדמות', 'פעולה זו תמחק את כל ההתקדמות. אי אפשר לבטל!', [
      { text: 'ביטול', style: 'cancel' },
      { text: 'אפס הכל', style: 'destructive', onPress: () => dispatch({ type: 'RESET_PROGRESS' }) },
    ]);
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>הגדרות</Text>

        {/* Profile */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👤 פרופיל</Text>
          <View style={styles.profileCard}>
            <View style={styles.avatar}><Text style={styles.avatarTxt}>{user?.displayName?.[0]?.toUpperCase()}</Text></View>
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              <Text style={styles.profileName}>{user?.displayName}</Text>
              <Text style={styles.profileUser}>@{user?.username}</Text>
              <View style={[styles.roleBadge, user?.role === 'admin' ? styles.roleBadgeAdmin : styles.roleBadgeStudent]}>
                <Text style={[styles.roleText, user?.role === 'admin' ? { color: '#D97706' } : { color: COLORS.primary }]}>
                  {user?.role === 'admin' ? '👑 מנהל' : '🎓 תלמיד'}
                </Text>
              </View>
            </View>
          </View>
          <TouchableOpacity style={styles.linkBtn} onPress={() => setShowPwdModal(true)}>
            <Text style={styles.linkBtnTxt}>🔑 שינוי סיסמה</Text>
          </TouchableOpacity>
        </View>

        {/* Study settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📚 הגדרות לימוד</Text>
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <Text style={styles.settingVal}>{dailyGoal}</Text>
              <Text style={styles.settingLabel}>יעד יומי (שאלות)</Text>
            </View>
            <View style={styles.stepperRow}>
              <TouchableOpacity style={styles.stepBtn} onPress={() => setDailyGoal(v => Math.max(5, v - 5))}>
                <Text style={styles.stepBtnTxt}>−</Text>
              </TouchableOpacity>
              <View style={styles.stepBarBg}>
                <View style={[styles.stepBarFill, { width: `${(dailyGoal / 100) * 100}%` }]} />
              </View>
              <TouchableOpacity style={styles.stepBtn} onPress={() => setDailyGoal(v => Math.min(100, v + 5))}>
                <Text style={styles.stepBtnTxt}>+</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.saveBtn} onPress={saveSettings} activeOpacity={0.85}>
              <Text style={styles.saveBtnTxt}>{saved ? '✓ נשמר' : 'שמור הגדרות'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 סטטיסטיקות</Text>
          <View style={styles.card}>
            {[
              ['שאלות נענו', String(progress.totalAnswered)],
              ['תשובות נכונות', String(progress.totalCorrect)],
              ['אחוז הצלחה', progress.totalAnswered > 0 ? `${Math.round((progress.totalCorrect / progress.totalAnswered) * 100)}%` : '-'],
              ['ימי רצף', String(progress.streakDays)],
              ['שאלות שמורות', String(progress.bookmarkedQuestionIDs.length)],
              ['בחינות שהושלמו', String(progress.quizHistory.length)],
            ].map(([label, value]) => (
              <View key={label} style={styles.statRow}>
                <Text style={styles.statVal}>{value}</Text>
                <Text style={styles.statLabel}>{label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Data */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💾 ניהול נתונים</Text>
          <TouchableOpacity style={styles.actionBtn} onPress={exportData} activeOpacity={0.75}>
            <Text style={styles.actionBtnTxt}>📤 ייצוא נתונים</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.dangerBtn]} onPress={handleReset} activeOpacity={0.75}>
            <Text style={[styles.actionBtnTxt, { color: COLORS.danger }]}>🔄 איפוס כל ההתקדמות</Text>
          </TouchableOpacity>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ℹ️ אודות</Text>
          <View style={styles.card}>
            {[['גרסה', '2.0.0'], ['פלטפורמה', 'Expo / React Native'], ['מטרה', 'הכנה לבחינת אמירנט']].map(([l, v]) => (
              <View key={l} style={styles.statRow}><Text style={styles.statVal}>{v}</Text><Text style={styles.statLabel}>{l}</Text></View>
            ))}
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
          <Text style={styles.logoutBtnTxt}>🚪 התנתקות</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Change password modal */}
      <Modal visible={showPwdModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowPwdModal(false)}><Text style={styles.cancel}>ביטול</Text></TouchableOpacity>
            <Text style={styles.modalTitle}>שינוי סיסמה</Text>
            <TouchableOpacity onPress={handleChangePwd}><Text style={styles.save}>שמור</Text></TouchableOpacity>
          </View>
          <View style={{ padding: 16, gap: 12 }}>
            <View>
              <Text style={styles.label}>סיסמה נוכחית</Text>
              <TextInput style={styles.input} value={oldPwd} onChangeText={setOldPwd} secureTextEntry placeholder="••••••" placeholderTextColor={COLORS.textTertiary} textAlign="right" />
            </View>
            <View>
              <Text style={styles.label}>סיסמה חדשה (מינימום 6)</Text>
              <TextInput style={styles.input} value={newPwd} onChangeText={setNewPwd} secureTextEntry placeholder="••••••" placeholderTextColor={COLORS.textTertiary} textAlign="right" />
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: 16 },
  title: { fontSize: 26, fontWeight: '800', color: COLORS.text, textAlign: 'right', marginBottom: 20 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, textAlign: 'right', marginBottom: 10 },
  card: {
    backgroundColor: COLORS.surface, borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
    gap: 10,
  },
  profileCard: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3 },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  avatarTxt: { color: '#fff', fontSize: 20, fontWeight: '700' },
  profileName: { fontSize: 17, fontWeight: '700', color: COLORS.text, textAlign: 'right' },
  profileUser: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'right' },
  roleBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, marginTop: 4, alignSelf: 'flex-end' },
  roleBadgeAdmin: { backgroundColor: '#FEF3C7', borderColor: '#D97706' },
  roleBadgeStudent: { backgroundColor: COLORS.primaryLight, borderColor: COLORS.primary },
  roleText: { fontSize: 12, fontWeight: '600' },
  linkBtn: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 12, alignItems: 'flex-end', borderWidth: 1, borderColor: COLORS.border },
  linkBtnTxt: { color: COLORS.primary, fontSize: 14, fontWeight: '600' },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  settingLabel: { fontSize: 15, color: COLORS.text, fontWeight: '600', textAlign: 'right' },
  settingVal: { fontSize: 24, fontWeight: '800', color: COLORS.primary },
  stepperRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.border, justifyContent: 'center', alignItems: 'center' },
  stepBtnTxt: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  stepBarBg: { flex: 1, height: 8, backgroundColor: COLORS.border, borderRadius: 4 },
  stepBarFill: { height: 8, backgroundColor: COLORS.primary, borderRadius: 4 },
  saveBtn: { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  saveBtnTxt: { color: '#fff', fontSize: 15, fontWeight: '700' },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statLabel: { fontSize: 14, color: COLORS.text, textAlign: 'right' },
  statVal: { fontSize: 15, fontWeight: '700', color: COLORS.primary },
  actionBtn: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 15, alignItems: 'flex-end', marginBottom: 8, borderWidth: 1, borderColor: COLORS.border },
  dangerBtn: { borderColor: COLORS.dangerLight },
  actionBtnTxt: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  logoutBtn: { backgroundColor: COLORS.dangerLight, borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 10 },
  logoutBtnTxt: { color: COLORS.danger, fontSize: 16, fontWeight: '700' },
  modal: { flex: 1, backgroundColor: COLORS.background },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  modalTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  cancel: { color: COLORS.danger, fontSize: 15 },
  save: { color: COLORS.primary, fontSize: 15, fontWeight: '700' },
  label: { fontSize: 14, fontWeight: '700', color: COLORS.text, textAlign: 'right', marginBottom: 6 },
  input: { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12, padding: 12, fontSize: 14, color: COLORS.text, backgroundColor: COLORS.surface },
});
