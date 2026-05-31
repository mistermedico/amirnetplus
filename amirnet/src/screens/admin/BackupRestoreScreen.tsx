import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert, ScrollView, ActivityIndicator,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useApp } from '../../store/AppContext';
import { COLORS } from '../../utils/colors';

export default function BackupRestoreScreen({ navigation }: any) {
  const { state, dispatch } = useApp();
  const [loading, setLoading] = useState(false);
  const [lastAction, setLastAction] = useState('');

  async function exportBackup() {
    setLoading(true);
    try {
      const backup = {
        version: 1,
        exportedAt: new Date().toISOString(),
        auth: state.auth,
        progress: state.progress,
        customQuestions: state.customQuestions,
        chapters: state.chapters,
        examTemplates: state.examTemplates,
        announcements: state.announcements,
      };
      const json = JSON.stringify(backup, null, 2);
      const filename = `amirnet_backup_${new Date().toISOString().slice(0, 10)}.json`;
      const path = (FileSystem.cacheDirectory ?? '') + filename;
      await FileSystem.writeAsStringAsync(path, json, { encoding: FileSystem.EncodingType.UTF8 });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(path, { mimeType: 'application/json', dialogTitle: 'שמור גיבוי' });
        setLastAction('✅ גיבוי יוצא בהצלחה');
      } else {
        Alert.alert('גיבוי', 'הגיבוי נוצר אך שיתוף אינו זמין במכשיר זה');
      }
    } catch (e) {
      Alert.alert('שגיאה', 'לא ניתן ליצור גיבוי');
    } finally {
      setLoading(false);
    }
  }

  async function importBackup() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/json', 'text/plain', '*/*'],
        copyToCacheDirectory: true,
      });
      if (result.canceled || !result.assets?.[0]) return;

      setLoading(true);
      const uri = result.assets[0].uri;
      const raw = await FileSystem.readAsStringAsync(uri);
      const backup = JSON.parse(raw);

      if (!backup.version || !backup.auth || !backup.progress) {
        Alert.alert('שגיאה', 'קובץ גיבוי לא תקין');
        return;
      }

      Alert.alert(
        'שחזור גיבוי',
        `גיבוי מתאריך ${new Date(backup.exportedAt).toLocaleDateString('he-IL')}.\n\nפעולה זו תחליף את כל הנתונים הנוכחיים!`,
        [
          { text: 'ביטול', style: 'cancel' },
          {
            text: 'שחזר',
            style: 'destructive',
            onPress: () => {
              dispatch({
                type: 'LOAD',
                payload: {
                  auth: backup.auth,
                  progress: backup.progress,
                  customQuestions: backup.customQuestions ?? [],
                  chapters: backup.chapters ?? [],
                  examTemplates: backup.examTemplates ?? [],
                  announcements: backup.announcements ?? [],
                },
              });
              setLastAction('✅ גיבוי שוחזר בהצלחה');
              Alert.alert('הצלחה', 'הנתונים שוחזרו בהצלחה!');
            },
          },
        ]
      );
    } catch {
      Alert.alert('שגיאה', 'לא ניתן לקרוא את קובץ הגיבוי');
    } finally {
      setLoading(false);
    }
  }

  const stats = [
    { label: 'משתמשים', value: state.auth.users.length },
    { label: 'שאלות מותאמות', value: state.customQuestions.length },
    { label: 'פרקים', value: state.chapters.length },
    { label: 'תבניות בחינה', value: state.examTemplates.length },
    { label: 'הכרזות', value: state.announcements.length },
    { label: 'בחינות שהושלמו', value: state.progress.quizHistory.length },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>‹ חזרה</Text></TouchableOpacity>
        <Text style={styles.title}>גיבוי ושחזור</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Current data summary */}
        <Text style={styles.sectionTitle}>📦 נתונים נוכחיים</Text>
        <View style={styles.statsCard}>
          {stats.map((s, i) => (
            <View key={s.label} style={[styles.statRow, i < stats.length - 1 && styles.statBorder]}>
              <Text style={styles.statVal}>{s.value}</Text>
              <Text style={styles.statLbl}>{s.label}</Text>
            </View>
          ))}
        </View>

        {lastAction ? (
          <View style={styles.successBox}>
            <Text style={styles.successTxt}>{lastAction}</Text>
          </View>
        ) : null}

        {/* Export */}
        <Text style={styles.sectionTitle}>💾 ייצוא גיבוי</Text>
        <View style={styles.actionCard}>
          <Text style={styles.actionIcon}>📤</Text>
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <Text style={styles.actionTitle}>יצא גיבוי מלא</Text>
            <Text style={styles.actionSub}>
              מייצא את כל הנתונים (משתמשים, שאלות, פרקים, התקדמות) לקובץ JSON
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.btn, styles.primaryBtn, loading && styles.btnDisabled]}
          onPress={exportBackup}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnTxt}>📤 יצא גיבוי</Text>}
        </TouchableOpacity>

        {/* Import */}
        <Text style={[styles.sectionTitle, { marginTop: 8 }]}>🔄 שחזור מגיבוי</Text>
        <View style={styles.warningBox}>
          <Text style={styles.warningTxt}>⚠️ שחזור יחליף את כל הנתונים הנוכחיים. לא ניתן לבטל!</Text>
        </View>
        <View style={styles.actionCard}>
          <Text style={styles.actionIcon}>📥</Text>
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <Text style={styles.actionTitle}>שחזר מגיבוי</Text>
            <Text style={styles.actionSub}>
              בחר קובץ JSON שיוצא מהאפליקציה לשחזור מלא של כל הנתונים
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.btn, styles.dangerBtn, loading && styles.btnDisabled]}
          onPress={importBackup}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnTxt}>📥 שחזר מקובץ</Text>}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  back: { color: COLORS.primary, fontSize: 15 },
  title: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  scroll: { padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, textAlign: 'right', marginBottom: 10 },
  statsCard: {
    backgroundColor: COLORS.surface, borderRadius: 16, padding: 14, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  statBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  statLbl: { fontSize: 14, color: COLORS.text, textAlign: 'right' },
  statVal: { fontSize: 16, fontWeight: '700', color: COLORS.primary },
  successBox: { backgroundColor: COLORS.successLight, borderRadius: 12, padding: 12, marginBottom: 12, alignItems: 'center' },
  successTxt: { color: COLORS.success, fontWeight: '700', fontSize: 14 },
  actionCard: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, marginBottom: 10,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
  },
  actionIcon: { fontSize: 32 },
  actionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, textAlign: 'right' },
  actionSub: { fontSize: 12, color: COLORS.textSecondary, textAlign: 'right', marginTop: 2, lineHeight: 17 },
  warningBox: { backgroundColor: COLORS.warningLight, borderRadius: 12, padding: 12, marginBottom: 10 },
  warningTxt: { color: COLORS.warning, fontSize: 13, fontWeight: '600', textAlign: 'right' },
  btn: { borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginBottom: 6 },
  btnDisabled: { opacity: 0.6 },
  primaryBtn: { backgroundColor: COLORS.primary },
  dangerBtn: { backgroundColor: COLORS.danger },
  btnTxt: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
