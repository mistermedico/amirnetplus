import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, TextInput, Alert, Modal,
} from 'react-native';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { useApp } from '../../store/AppContext';
import { COLORS } from '../../utils/colors';
import { hashPassword } from '../../utils/hashUtils';

export default function SettingsScreen() {
  const { state, dispatch, logout, changePassword } = useApp();
  const { progress } = state;
  const user = state.auth.currentUser;

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
    if (!oldPwd || !newPwd || newPwd.length < 6) { Alert.alert('שגיאה', 'יש למלא שדות תקינים'); return; }
    if (!user || hashPassword(oldPwd) !== user.passwordHash) { Alert.alert('שגיאה', 'הסיסמה הנוכחית שגויה'); return; }
    changePassword(user.id, newPwd);
    setShowPwdModal(false); setOldPwd(''); setNewPwd('');
    Alert.alert('הצלחה', 'הסיסמה שונתה בהצלחה');
  }

  async function exportData() {
    const pct = progress.totalAnswered > 0 ? Math.round((progress.totalCorrect / progress.totalAnswered) * 100) : 0;
    const lines = [
      'amirnet - דוח התקדמות',
      `תאריך: ${new Date().toLocaleDateString('he-IL')}`,
      `משתמש: ${user?.displayName} (@${user?.username})`,
      '', '=== סטטיסטיקות ===',
      `שאלות: ${progress.totalAnswered}`, `נכון: ${progress.totalCorrect}`,
      `דיוק: ${pct}%`, `רצף: ${progress.streakDays} ימים`,
      '', '=== 10 בחינות אחרונות ===',
      ...progress.quizHistory.slice(0, 10).map(h =>
        `${new Date(h.date).toLocaleDateString('he-IL')}: ${h.score}/${h.total} (${Math.round((h.score/h.total)*100)}%)`
      ),
    ];
    try {
      const path = (FileSystem.cacheDirectory ?? '') + 'amirnet_report.txt';
      await FileSystem.writeAsStringAsync(path, lines.join('\n'));
      if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(path, { dialogTitle: 'ייצוא נתונים' });
      else Alert.alert('דוח', lines.join('\n'));
    } catch { Alert.alert('שגיאה', 'לא ניתן לייצא'); }
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

  const overallPct = progress.totalAnswered > 0
    ? Math.round((progress.totalCorrect / progress.totalAnswered) * 100) : 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>הגדרות</Text>

        {/* Profile hero */}
        <View style={styles.profileHero}>
          <View style={styles.profileBg} />
          <View style={styles.profileContent}>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.displayName}</Text>
              <Text style={styles.profileUser}>@{user?.username}</Text>
              <View style={[styles.roleBadge, user?.role === 'admin' ? styles.roleAdmin : styles.roleStudent]}>
                <Text style={styles.roleTxt}>{user?.role === 'admin' ? '👑 מנהל' : '🎓 תלמיד'}</Text>
              </View>
            </View>
            <View style={styles.avatar}>
              <Text style={styles.avatarTxt}>{user?.displayName?.[0]?.toUpperCase() ?? 'U'}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.changePwdBtn} onPress={() => setShowPwdModal(true)}>
            <Text style={styles.changePwdTxt}>🔑 שינוי סיסמה</Text>
          </TouchableOpacity>
        </View>

        {/* Quick stats */}
        <View style={styles.quickStats}>
          {[
            { val: progress.totalAnswered, lbl: 'שאלות',    color: COLORS.primary },
            { val: `${overallPct}%`,        lbl: 'הצלחה',    color: overallPct >= 70 ? COLORS.success : COLORS.warning },
            { val: progress.streakDays,     lbl: 'ימי רצף',  color: COLORS.orange },
            { val: progress.quizHistory.length, lbl: 'בחינות', color: COLORS.secondary },
          ].map((s, i) => (
            <View key={i} style={styles.quickStatCell}>
              <Text style={[styles.quickStatVal, { color: s.color }]}>{s.val}</Text>
              <Text style={styles.quickStatLbl}>{s.lbl}</Text>
            </View>
          ))}
        </View>

        {/* Daily goal */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionAccent} />
          <Text style={styles.sectionTitle}>📚 יעד יומי</Text>
        </View>
        <View style={styles.card}>
          <View style={styles.goalRow}>
            <TouchableOpacity style={styles.goalBtn} onPress={() => setDailyGoal(v => Math.max(5, v - 5))}>
              <Text style={styles.goalBtnTxt}>−</Text>
            </TouchableOpacity>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={styles.goalVal}>{dailyGoal}</Text>
              <Text style={styles.goalLbl}>שאלות ליום</Text>
            </View>
            <TouchableOpacity style={styles.goalBtn} onPress={() => setDailyGoal(v => Math.min(100, v + 5))}>
              <Text style={styles.goalBtnTxt}>+</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.goalBarBg}>
            <View style={[styles.goalBarFill, { width: `${dailyGoal}%` }]} />
          </View>
          <TouchableOpacity style={[styles.saveBtn, saved && styles.saveBtnDone]} onPress={saveSettings} activeOpacity={0.85}>
            <Text style={styles.saveBtnTxt}>{saved ? '✓ נשמר!' : 'שמור הגדרות'}</Text>
          </TouchableOpacity>
        </View>

        {/* Data actions */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionAccent} />
          <Text style={styles.sectionTitle}>💾 ניהול נתונים</Text>
        </View>
        <View style={styles.actionsCard}>
          <TouchableOpacity style={styles.actionRow} onPress={exportData} activeOpacity={0.75}>
            <Text style={styles.actionChevron}>›</Text>
            <View style={styles.actionInfo}>
              <Text style={styles.actionLabel}>ייצוא דוח</Text>
              <Text style={styles.actionSub}>שתף את נתוני ההתקדמות</Text>
            </View>
            <View style={[styles.actionIconWrap, { backgroundColor: COLORS.infoLight }]}>
              <Text style={styles.actionIcon}>📤</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.actionDivider} />

          <TouchableOpacity style={styles.actionRow} onPress={handleReset} activeOpacity={0.75}>
            <Text style={styles.actionChevron}>›</Text>
            <View style={styles.actionInfo}>
              <Text style={[styles.actionLabel, { color: COLORS.danger }]}>איפוס התקדמות</Text>
              <Text style={styles.actionSub}>מחיקת כל הנתונים</Text>
            </View>
            <View style={[styles.actionIconWrap, { backgroundColor: COLORS.dangerLight }]}>
              <Text style={styles.actionIcon}>🔄</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* About */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionAccent} />
          <Text style={styles.sectionTitle}>ℹ️ אודות</Text>
        </View>
        <View style={styles.aboutCard}>
          {[['גרסה', '2.0.0'], ['פלטפורמה', 'Expo / React Native'], ['מטרה', 'הכנה לבחינת אמירנט']].map(([l, v]) => (
            <View key={l} style={styles.aboutRow}>
              <Text style={styles.aboutVal}>{v}</Text>
              <Text style={styles.aboutLbl}>{l}</Text>
            </View>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
          <Text style={styles.logoutTxt}>🚪 התנתקות</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Password modal */}
      <Modal visible={showPwdModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={handleChangePwd}><Text style={styles.modalSave}>שמור</Text></TouchableOpacity>
            <Text style={styles.modalTitle}>שינוי סיסמה</Text>
            <TouchableOpacity onPress={() => setShowPwdModal(false)}><Text style={styles.modalCancel}>ביטול</Text></TouchableOpacity>
          </View>
          <View style={{ padding: 16, gap: 14 }}>
            <View>
              <Text style={styles.fieldLabel}>סיסמה נוכחית</Text>
              <TextInput style={styles.fieldInput} value={oldPwd} onChangeText={setOldPwd} secureTextEntry placeholder="••••••" placeholderTextColor={COLORS.textTertiary} textAlign="right" />
            </View>
            <View>
              <Text style={styles.fieldLabel}>סיסמה חדשה (מינימום 6)</Text>
              <TextInput style={styles.fieldInput} value={newPwd} onChangeText={setNewPwd} secureTextEntry placeholder="••••••" placeholderTextColor={COLORS.textTertiary} textAlign="right" />
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
  pageTitle: { fontSize: 26, fontWeight: '800', color: COLORS.text, textAlign: 'right', marginBottom: 16 },
  profileHero: {
    backgroundColor: COLORS.surface, borderRadius: 20, overflow: 'hidden', marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 4,
  },
  profileBg: { height: 8, backgroundColor: COLORS.primary },
  profileContent: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14, justifyContent: 'flex-end' },
  profileInfo: { alignItems: 'flex-end', gap: 3, flex: 1 },
  profileName: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  profileUser: { fontSize: 13, color: COLORS.textSecondary },
  roleBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginTop: 4 },
  roleAdmin: { backgroundColor: '#FEF3C7' },
  roleStudent: { backgroundColor: COLORS.primaryLight },
  roleTxt: { fontSize: 12, fontWeight: '700', color: COLORS.text },
  avatar: { width: 52, height: 52, borderRadius: 16, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  avatarTxt: { color: '#fff', fontSize: 22, fontWeight: '800' },
  changePwdBtn: { marginHorizontal: 16, marginBottom: 14, backgroundColor: COLORS.background, borderRadius: 12, padding: 12, alignItems: 'flex-end', borderWidth: 1, borderColor: COLORS.border },
  changePwdTxt: { color: COLORS.primary, fontSize: 14, fontWeight: '600' },
  quickStats: {
    flexDirection: 'row', backgroundColor: COLORS.surface, borderRadius: 16, padding: 14, marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },
  quickStatCell: { flex: 1, alignItems: 'center', gap: 3 },
  quickStatVal: { fontSize: 20, fontWeight: '800' },
  quickStatLbl: { fontSize: 11, color: COLORS.textSecondary, textAlign: 'center' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 8, marginBottom: 10 },
  sectionAccent: { width: 3, height: 16, borderRadius: 2, backgroundColor: COLORS.primary },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  card: {
    backgroundColor: COLORS.surface, borderRadius: 18, padding: 16, marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
    gap: 12,
  },
  goalRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  goalBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.border, justifyContent: 'center', alignItems: 'center' },
  goalBtnTxt: { fontSize: 22, fontWeight: '700', color: COLORS.text },
  goalVal: { fontSize: 32, fontWeight: '800', color: COLORS.primary },
  goalLbl: { fontSize: 12, color: COLORS.textSecondary, marginTop: -2 },
  goalBarBg: { height: 8, backgroundColor: COLORS.border, borderRadius: 4 },
  goalBarFill: { height: 8, backgroundColor: COLORS.primary, borderRadius: 4 },
  saveBtn: { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  saveBtnDone: { backgroundColor: COLORS.success },
  saveBtnTxt: { color: '#fff', fontSize: 15, fontWeight: '700' },
  actionsCard: {
    backgroundColor: COLORS.surface, borderRadius: 18, marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
    overflow: 'hidden',
  },
  actionRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  actionDivider: { height: 1, backgroundColor: COLORS.border, marginHorizontal: 16 },
  actionChevron: { fontSize: 22, color: COLORS.textTertiary },
  actionInfo: { flex: 1, alignItems: 'flex-end' },
  actionLabel: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  actionSub: { fontSize: 12, color: COLORS.textSecondary, marginTop: 1 },
  actionIconWrap: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  actionIcon: { fontSize: 22 },
  aboutCard: {
    backgroundColor: COLORS.surface, borderRadius: 18, padding: 16, marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
    gap: 10,
  },
  aboutRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  aboutLbl: { fontSize: 14, color: COLORS.textSecondary },
  aboutVal: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  logoutBtn: {
    backgroundColor: COLORS.dangerLight, borderRadius: 16, padding: 16, alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.danger + '40',
  },
  logoutTxt: { color: COLORS.danger, fontSize: 16, fontWeight: '700' },
  modal: { flex: 1, backgroundColor: COLORS.background },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  modalTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  modalSave: { color: COLORS.primary, fontSize: 15, fontWeight: '700' },
  modalCancel: { color: COLORS.danger, fontSize: 15 },
  fieldLabel: { fontSize: 14, fontWeight: '700', color: COLORS.text, textAlign: 'right', marginBottom: 6 },
  fieldInput: { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12, padding: 12, fontSize: 14, color: COLORS.text, backgroundColor: COLORS.surface },
});
