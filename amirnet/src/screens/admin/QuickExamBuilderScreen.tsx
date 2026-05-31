import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Alert,
} from 'react-native';
import { useApp } from '../../store/AppContext';
import { COLORS, TOPIC_COLORS } from '../../utils/colors';
import { BUILT_IN_QUESTIONS, getRandomQuestions } from '../../data/questions';
import { Difficulty, TopicID } from '../../types';

const TOPICS = [
  { id: 'all',             name: 'כל הנושאים', icon: '📚' },
  { id: 'networking',      name: 'רשתות',       icon: '🌐' },
  { id: 'security',        name: 'אבטחה',       icon: '🔒' },
  { id: 'operatingSystems',name: 'מערכות הפעלה',icon: '💻' },
  { id: 'cloud',           name: 'ענן',          icon: '☁️' },
  { id: 'itManagement',    name: 'ניהול IT',     icon: '📋' },
  { id: 'protocols',       name: 'פרוטוקולים',  icon: '🔄' },
];

const DIFFICULTIES = [
  { id: 'all',    label: 'מעורב',  icon: '🎲', color: COLORS.primary },
  { id: 'easy',   label: 'קל',     icon: '🟢', color: COLORS.success },
  { id: 'medium', label: 'בינוני', icon: '🟡', color: COLORS.warning },
  { id: 'hard',   label: 'קשה',    icon: '🔴', color: COLORS.danger },
];

const COUNTS = [5, 10, 20, 30, 50];

export default function QuickExamBuilderScreen({ navigation }: any) {
  const { state } = useApp();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [topicID, setTopicID] = useState('all');
  const [difficulty, setDifficulty] = useState('all');
  const [count, setCount] = useState(20);

  const allQ = useMemo(() => [...BUILT_IN_QUESTIONS, ...state.customQuestions], [state.customQuestions]);

  const availableCount = useMemo(() => {
    let pool = topicID === 'all' ? allQ : allQ.filter(q => q.topic === topicID);
    if (difficulty !== 'all') pool = pool.filter(q => q.difficulty === difficulty);
    return pool.length;
  }, [topicID, difficulty, allQ]);

  const previewQuestions = useMemo(() => {
    return getRandomQuestions(
      Math.min(count, 3),
      topicID === 'all' ? undefined : topicID as TopicID,
      difficulty === 'all' ? undefined : difficulty,
      state.customQuestions,
    );
  }, [topicID, difficulty, state.customQuestions]);

  function launch() {
    const questions = getRandomQuestions(
      count,
      topicID === 'all' ? undefined : topicID as TopicID,
      difficulty === 'all' ? undefined : difficulty,
      state.customQuestions,
    );
    if (questions.length === 0) {
      Alert.alert('שגיאה', 'לא נמצאו שאלות עבור הבחירה שלך');
      return;
    }
    navigation.navigate('Quiz', { questions, mode: 'exam' });
  }

  const topicInfo = TOPICS.find(t => t.id === topicID)!;
  const diffInfo = DIFFICULTIES.find(d => d.id === difficulty)!;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => step > 1 ? setStep(s => (s - 1) as any) : navigation.goBack()}>
          <Text style={styles.back}>‹ {step > 1 ? 'חזרה' : 'יציאה'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>בנאי בחינה מהיר ⚡</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Step indicator */}
      <View style={styles.stepRow}>
        {[1, 2, 3].map(s => (
          <React.Fragment key={s}>
            <View style={[styles.stepCircle, step >= s && styles.stepCircleActive, step > s && styles.stepCircleDone]}>
              <Text style={[styles.stepNum, step >= s && styles.stepNumActive]}>
                {step > s ? '✓' : s}
              </Text>
            </View>
            {s < 3 && <View style={[styles.stepLine, step > s && styles.stepLineDone]} />}
          </React.Fragment>
        ))}
      </View>
      <View style={styles.stepLabels}>
        <Text style={styles.stepLabel}>קושי & כמות</Text>
        <Text style={styles.stepLabel}>סקירה</Text>
        <Text style={styles.stepLabel}>נושא</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Step 1: Topic */}
        {step === 1 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>בחר נושא</Text>
            <View style={styles.topicGrid}>
              {TOPICS.map(t => {
                const qCount = t.id === 'all' ? allQ.length : allQ.filter(q => q.topic === t.id).length;
                const isSelected = topicID === t.id;
                const color = t.id === 'all' ? COLORS.primary : TOPIC_COLORS[t.id] || COLORS.primary;
                return (
                  <TouchableOpacity
                    key={t.id}
                    style={[styles.topicCard, isSelected && { borderColor: color, backgroundColor: color + '12' }]}
                    onPress={() => setTopicID(t.id)}
                    activeOpacity={0.7}
                  >
                    {isSelected && <View style={[styles.topicCheck, { backgroundColor: color }]}><Text style={styles.checkTxt}>✓</Text></View>}
                    <Text style={styles.topicCardIcon}>{t.icon}</Text>
                    <Text style={[styles.topicCardName, isSelected && { color }]}>{t.name}</Text>
                    <Text style={styles.topicCardCount}>{qCount} שאלות</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <TouchableOpacity style={styles.nextBtn} onPress={() => setStep(2)} activeOpacity={0.85}>
              <Text style={styles.nextBtnTxt}>הבא: קושי וכמות ›</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Step 2: Difficulty + Count */}
        {step === 2 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>רמת קושי</Text>
            <View style={styles.diffRow}>
              {DIFFICULTIES.map(d => (
                <TouchableOpacity
                  key={d.id}
                  style={[styles.diffCard, difficulty === d.id && { borderColor: d.color, backgroundColor: d.color + '15' }]}
                  onPress={() => setDifficulty(d.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.diffIcon}>{d.icon}</Text>
                  <Text style={[styles.diffLabel, difficulty === d.id && { color: d.color, fontWeight: '800' }]}>{d.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.stepTitle, { marginTop: 20 }]}>מספר שאלות</Text>
            <View style={styles.countRow}>
              {COUNTS.map(c => (
                <TouchableOpacity
                  key={c}
                  style={[styles.countBtn, count === c && styles.countBtnActive]}
                  onPress={() => setCount(c)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.countBtnTxt, count === c && styles.countBtnTxtActive]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.availBox}>
              <Text style={styles.availTxt}>
                {availableCount >= count
                  ? `✅ יש ${availableCount} שאלות זמינות`
                  : `⚠️ רק ${availableCount} שאלות זמינות (מבוקש ${count})`}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.nextBtn, availableCount === 0 && styles.nextBtnDisabled]}
              onPress={() => availableCount > 0 ? setStep(3) : null}
              activeOpacity={0.85}
            >
              <Text style={styles.nextBtnTxt}>הבא: סקירה ›</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Step 3: Preview & Launch */}
        {step === 3 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>סיכום הבחינה</Text>

            <View style={styles.summaryCard}>
              {[
                { label: 'נושא', value: `${topicInfo.icon} ${topicInfo.name}` },
                { label: 'קושי', value: `${diffInfo.icon} ${diffInfo.label}` },
                { label: 'שאלות', value: `${Math.min(count, availableCount)} מתוך ${availableCount}` },
              ].map((item, i) => (
                <View key={item.label} style={[styles.summaryRow, i < 2 && styles.summaryBorder]}>
                  <Text style={styles.summaryVal}>{item.value}</Text>
                  <Text style={styles.summaryLbl}>{item.label}</Text>
                </View>
              ))}
            </View>

            <Text style={[styles.stepTitle, { marginBottom: 8 }]}>דוגמת שאלות</Text>
            {previewQuestions.map((q, i) => (
              <View key={q.id} style={styles.previewCard}>
                <Text style={styles.previewNum}>#{i + 1}</Text>
                <Text style={styles.previewQ} numberOfLines={2}>{q.questionText}</Text>
              </View>
            ))}

            <TouchableOpacity style={styles.launchBtn} onPress={launch} activeOpacity={0.85}>
              <Text style={styles.launchBtnTxt}>▶ התחל בחינה ({Math.min(count, availableCount)} שאלות)</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingBottom: 8 },
  back: { color: COLORS.primary, fontSize: 15, fontWeight: '600' },
  title: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  stepRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, marginBottom: 4 },
  stepCircle: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: COLORS.border, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center' },
  stepCircleActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
  stepCircleDone: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  stepNum: { fontSize: 14, fontWeight: '700', color: COLORS.textTertiary },
  stepNumActive: { color: COLORS.primary },
  stepLine: { flex: 1, height: 2, backgroundColor: COLORS.border, marginHorizontal: 4 },
  stepLineDone: { backgroundColor: COLORS.primary },
  stepLabels: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 16, marginBottom: 16 },
  stepLabel: { fontSize: 11, color: COLORS.textSecondary, textAlign: 'center', flex: 1 },
  scroll: { padding: 16 },
  stepContent: { gap: 12 },
  stepTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text, textAlign: 'right', marginBottom: 4 },
  topicGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  topicCard: {
    width: '47%', backgroundColor: COLORS.surface, borderRadius: 16, padding: 14,
    alignItems: 'center', gap: 6, borderWidth: 2, borderColor: COLORS.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  topicCheck: { position: 'absolute', top: 8, left: 8, width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  checkTxt: { color: '#fff', fontSize: 11, fontWeight: '800' },
  topicCardIcon: { fontSize: 30 },
  topicCardName: { fontSize: 13, fontWeight: '700', color: COLORS.text, textAlign: 'center' },
  topicCardCount: { fontSize: 11, color: COLORS.textSecondary },
  diffRow: { flexDirection: 'row', gap: 8 },
  diffCard: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: 14, padding: 12,
    alignItems: 'center', gap: 4, borderWidth: 2, borderColor: COLORS.border,
  },
  diffIcon: { fontSize: 22 },
  diffLabel: { fontSize: 13, fontWeight: '600', color: COLORS.text },
  countRow: { flexDirection: 'row', gap: 8 },
  countBtn: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: 12, paddingVertical: 12,
    alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.border,
  },
  countBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  countBtnTxt: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  countBtnTxtActive: { color: '#fff' },
  availBox: { backgroundColor: COLORS.primaryLight, borderRadius: 10, padding: 10, alignItems: 'center' },
  availTxt: { fontSize: 14, color: COLORS.primary, fontWeight: '600' },
  nextBtn: { backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 4 },
  nextBtnDisabled: { backgroundColor: COLORS.border },
  nextBtnTxt: { color: '#fff', fontSize: 16, fontWeight: '700' },
  summaryCard: {
    backgroundColor: COLORS.surface, borderRadius: 16, overflow: 'hidden', marginBottom: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14 },
  summaryBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  summaryLbl: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '600' },
  summaryVal: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  previewCard: {
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 12, marginBottom: 6,
    flexDirection: 'row', gap: 10, alignItems: 'flex-start',
  },
  previewNum: { fontSize: 12, fontWeight: '700', color: COLORS.textSecondary, minWidth: 22 },
  previewQ: { fontSize: 13, color: COLORS.text, textAlign: 'right', flex: 1, lineHeight: 18 },
  launchBtn: { backgroundColor: COLORS.success, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  launchBtnTxt: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
