import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Alert, Switch,
} from 'react-native';
import { useApp } from '../../store/AppContext';
import { COLORS } from '../../utils/colors';

export default function SystemSettingsScreen({ navigation }: any) {
  const { state, dispatch } = useApp();
  const s = state.systemSettings;
  const [qCount, setQCount] = useState(s.defaultQuestionCount);
  const [passingScore, setPassingScore] = useState(s.defaultPassingScore);
  const [mode, setMode] = useState<'exam' | 'study'>(s.defaultMode);
  const [difficulty, setDifficulty] = useState(s.defaultDifficulty);
  const [saved, setSaved] = useState(false);

  function save() {
    dispatch({
      type: 'UPDATE_SYSTEM_SETTINGS',
      payload: { defaultQuestionCount: qCount, defaultPassingScore: passingScore, defaultMode: mode, defaultDifficulty: difficulty },
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function resetDefaults() {
    Alert.alert('איפוס הגדרות', 'לאפס את כל ההגדרות לברירת המחדל?', [
      { text: 'ביטול', style: 'cancel' },
      {
        text: 'אפס',
        style: 'destructive',
        onPress: () => {
          setQCount(20); setPassingScore(70); setMode('exam'); setDifficulty('all');
          dispatch({ type: 'UPDATE_SYSTEM_SETTINGS', payload: { defaultQuestionCount: 20, defaultPassingScore: 70, defaultMode: 'exam', defaultDifficulty: 'all' } });
        },
      },
    ]);
  }

  const Stepper = ({ value, min, max, step, onChange }: { value: number; min: number; max: number; step: number; onChange: (v: number) => void }) => (
    <View style={styles.stepper}>
      <TouchableOpacity style={styles.stepBtn} onPress={() => onChange(Math.max(min, value - step))} disabled={value <= min}>
        <Text style={[styles.stepBtnTxt, value <= min && { opacity: 0.3 }]}>−</Text>
      </TouchableOpacity>
      <Text style={styles.stepValue}>{value}</Text>
      <TouchableOpacity style={styles.stepBtn} onPress={() => onChange(Math.min(max, value + step))} disabled={value >= max}>
        <Text style={[styles.stepBtnTxt, value >= max && { opacity: 0.3 }]}>+</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>‹ חזרה</Text></TouchableOpacity>
        <Text style={styles.title}>הגדרות מערכת</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.infoBox}>
          <Text style={styles.infoTxt}>⚙️ הגדרות אלו משמשות כברירת מחדל לכל המשתמשים</Text>
        </View>

        {saved && (
          <View style={styles.savedBox}>
            <Text style={styles.savedTxt}>✅ הגדרות נשמרו בהצלחה!</Text>
          </View>
        )}

        {/* Default Question Count */}
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <Stepper value={qCount} min={5} max={50} step={5} onChange={setQCount} />
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>מספר שאלות ברירת מחדל</Text>
              <Text style={styles.settingSub}>מספר שאלות ב"בחינה מהירה" ובסקרין הגדרות הבחינה</Text>
            </View>
          </View>
        </View>

        {/* Default Passing Score */}
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <Stepper value={passingScore} min={50} max={95} step={5} onChange={setPassingScore} />
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>ציון עובר ברירת מחדל</Text>
              <Text style={styles.settingSub}>אחוז מינימלי לעבור בחינה (ברירת מחדל לתבניות חדשות)</Text>
            </View>
          </View>
          <View style={styles.passingBar}>
            <View style={[styles.passingFill, {
              width: `${passingScore}%`,
              backgroundColor: passingScore >= 70 ? COLORS.success : COLORS.warning,
            }]} />
            <Text style={styles.passingLabel}>{passingScore}%</Text>
          </View>
        </View>

        {/* Default Mode */}
        <View style={styles.card}>
          <Text style={styles.settingTitle}>מצב ברירת מחדל</Text>
          <Text style={styles.settingSub}>המצב שנבחר אוטומטית בסקרין הגדרות הבחינה</Text>
          <View style={styles.modeRow}>
            {([['exam', '📋 מצב בחינה'], ['study', '💡 מצב לימוד']] as ['exam' | 'study', string][]).map(([val, label]) => (
              <TouchableOpacity
                key={val}
                style={[styles.modeBtn, mode === val && styles.modeBtnActive]}
                onPress={() => setMode(val)}
              >
                <Text style={[styles.modeBtnTxt, mode === val && styles.modeBtnTxtActive]}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Default Difficulty */}
        <View style={styles.card}>
          <Text style={styles.settingTitle}>קושי ברירת מחדל</Text>
          <Text style={styles.settingSub}>רמת הקושי שנבחרת אוטומטית</Text>
          <View style={styles.diffRow}>
            {([
              ['all', '🎲 מעורב', COLORS.primary],
              ['easy', '🟢 קל', COLORS.success],
              ['medium', '🟡 בינוני', COLORS.warning],
              ['hard', '🔴 קשה', COLORS.danger],
            ] as [string, string, string][]).map(([val, label, color]) => (
              <TouchableOpacity
                key={val}
                style={[styles.diffBtn, difficulty === val && { borderColor: color, backgroundColor: color + '15' }]}
                onPress={() => setDifficulty(val)}
              >
                <Text style={[styles.diffBtnTxt, difficulty === val && { color, fontWeight: '800' }]}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Save */}
        <TouchableOpacity style={styles.saveBtn} onPress={save} activeOpacity={0.85}>
          <Text style={styles.saveBtnTxt}>💾 שמור הגדרות</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.resetBtn} onPress={resetDefaults} activeOpacity={0.75}>
          <Text style={styles.resetBtnTxt}>🔄 איפוס לברירת המחדל</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  back: { color: COLORS.primary, fontSize: 15, fontWeight: '600' },
  title: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  scroll: { padding: 16 },
  infoBox: { backgroundColor: COLORS.primaryLight, borderRadius: 12, padding: 12, marginBottom: 12 },
  infoTxt: { color: COLORS.primary, fontSize: 13, fontWeight: '600', textAlign: 'right' },
  savedBox: { backgroundColor: COLORS.successLight, borderRadius: 12, padding: 12, marginBottom: 10, alignItems: 'center' },
  savedTxt: { color: COLORS.success, fontWeight: '700', fontSize: 14 },
  card: {
    backgroundColor: COLORS.surface, borderRadius: 16, padding: 16, marginBottom: 12, gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  settingInfo: { flex: 1, alignItems: 'flex-end', gap: 3 },
  settingTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, textAlign: 'right' },
  settingSub: { fontSize: 12, color: COLORS.textSecondary, textAlign: 'right', lineHeight: 17 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 0 },
  stepBtn: {
    width: 40, height: 40, borderRadius: 10, backgroundColor: COLORS.border,
    justifyContent: 'center', alignItems: 'center',
  },
  stepBtnTxt: { fontSize: 22, fontWeight: '600', color: COLORS.text },
  stepValue: { fontSize: 22, fontWeight: '800', color: COLORS.primary, minWidth: 52, textAlign: 'center' },
  passingBar: { height: 28, backgroundColor: COLORS.border, borderRadius: 8, overflow: 'hidden', justifyContent: 'center' },
  passingFill: { position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 8 },
  passingLabel: { fontSize: 13, fontWeight: '700', color: '#fff', textAlign: 'right', paddingRight: 10 },
  modeRow: { flexDirection: 'row', gap: 8 },
  modeBtn: { flex: 1, padding: 12, borderRadius: 12, backgroundColor: COLORS.background, borderWidth: 1.5, borderColor: COLORS.border, alignItems: 'center' },
  modeBtnActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
  modeBtnTxt: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary },
  modeBtnTxtActive: { color: COLORS.primary, fontWeight: '700' },
  diffRow: { flexDirection: 'row', gap: 8 },
  diffBtn: { flex: 1, padding: 10, borderRadius: 12, backgroundColor: COLORS.background, borderWidth: 1.5, borderColor: COLORS.border, alignItems: 'center' },
  diffBtnTxt: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary, textAlign: 'center' },
  saveBtn: { backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginBottom: 10 },
  saveBtnTxt: { color: '#fff', fontSize: 16, fontWeight: '700' },
  resetBtn: { backgroundColor: COLORS.surface, borderRadius: 14, paddingVertical: 14, alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.border },
  resetBtnTxt: { color: COLORS.textSecondary, fontSize: 15, fontWeight: '600' },
});
