import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Switch,
} from 'react-native';
import { useApp } from '../../store/AppContext';
import { COLORS, TOPIC_COLORS } from '../../utils/colors';
import { getRandomQuestions } from '../../data/questions';
import { TopicID, Difficulty, QuizMode } from '../../types';

const TOPICS: { id: 'all' | TopicID; name: string; icon: string }[] = [
  { id: 'all',              name: 'כל הנושאים',       icon: '🌍' },
  { id: 'networking',       name: 'רשתות תקשורת',       icon: '🌐' },
  { id: 'security',         name: 'אבטחת מידע',          icon: '🔒' },
  { id: 'operatingSystems', name: 'מערכות הפעלה',        icon: '💻' },
  { id: 'cloud',            name: 'ענן ווירטואליזציה',   icon: '☁️' },
  { id: 'itManagement',     name: 'ניהול IT',             icon: '📋' },
  { id: 'protocols',        name: 'פרוטוקולים',           icon: '🔄' },
];

const COUNT_OPTIONS = [5, 10, 20, 30, 50];

const DIFF_OPTS: { id: Difficulty | undefined; label: string; color: string; icon: string }[] = [
  { id: undefined, label: 'הכל',    color: COLORS.primary, icon: '🎲' },
  { id: 'easy',    label: 'קל',     color: COLORS.success, icon: '🟢' },
  { id: 'medium',  label: 'בינוני', color: COLORS.warning, icon: '🟡' },
  { id: 'hard',    label: 'קשה',    color: COLORS.danger,  icon: '🔴' },
];

export default function QuizSetupScreen({ navigation, route }: any) {
  const { state } = useApp();
  const quick       = route?.params?.quick;
  const presetTopic = route?.params?.topicID as TopicID | undefined;
  const presetChapter = route?.params?.chapterID as string | undefined;

  const [count, setCount]         = useState(quick ? 10 : 20);
  const [topicID, setTopicID]     = useState<TopicID | 'all'>(presetTopic ?? 'all');
  const [difficulty, setDifficulty] = useState<Difficulty | undefined>(undefined);
  const [mode, setMode]           = useState<QuizMode>('exam');
  const [includeCustom, setIncludeCustom] = useState(true);

  const chapterInfo = presetChapter ? state.chapters.find(c => c.id === presetChapter) : undefined;

  function buildAndStart() {
    const questions = getRandomQuestions(
      count,
      topicID === 'all' ? undefined : topicID,
      difficulty,
      includeCustom ? state.customQuestions : [],
      chapterInfo?.questionIDs,
    );
    if (questions.length === 0) {
      alert('לא נמצאו שאלות עבור הסינון שנבחר');
      return;
    }
    navigation.navigate('Quiz', { questions, mode, chapterTitle: chapterInfo?.title });
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroIconWrap}><Text style={styles.heroIcon}>📝</Text></View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.heroTitle}>הגדרות בחינה</Text>
            <Text style={styles.heroSub}>{chapterInfo ? `פרק: ${chapterInfo.title}` : 'הגדר ממוקד והתחל'}</Text>
          </View>
        </View>

        {/* Question count */}
        <Text style={styles.sectionLabel}>מספר שאלות</Text>
        <View style={styles.countRow}>
          {COUNT_OPTIONS.map(c => (
            <TouchableOpacity
              key={c}
              style={[styles.countChip, count === c && styles.countChipActive]}
              onPress={() => setCount(c)}
            >
              <Text style={[styles.countChipTxt, count === c && styles.countChipTxtActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Topic grid */}
        {!chapterInfo && (
          <>
            <Text style={styles.sectionLabel}>נושא</Text>
            <View style={styles.topicGrid}>
              {TOPICS.map(t => {
                const color = t.id === 'all' ? COLORS.primary : TOPIC_COLORS[t.id] || COLORS.primary;
                const sel = topicID === t.id;
                return (
                  <TouchableOpacity
                    key={t.id}
                    style={[styles.topicCard, sel && { borderColor: color, backgroundColor: color + '12' }]}
                    onPress={() => setTopicID(t.id as any)}
                    activeOpacity={0.75}
                  >
                    {sel && <View style={[styles.topicCheck, { backgroundColor: color }]}><Text style={styles.topicCheckTxt}>✓</Text></View>}
                    <Text style={styles.topicIcon}>{t.icon}</Text>
                    <Text style={[styles.topicName, sel && { color }]} numberOfLines={2}>{t.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}

        {/* Difficulty */}
        <Text style={styles.sectionLabel}>רמת קושי</Text>
        <View style={styles.diffRow}>
          {DIFF_OPTS.map(d => {
            const sel = difficulty === d.id;
            return (
              <TouchableOpacity
                key={String(d.id)}
                style={[styles.diffCard, sel && { borderColor: d.color, backgroundColor: d.color + '15' }]}
                onPress={() => setDifficulty(d.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.diffIcon}>{d.icon}</Text>
                <Text style={[styles.diffLabel, sel && { color: d.color, fontWeight: '800' }]}>{d.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Mode */}
        <Text style={styles.sectionLabel}>מצב בחינה</Text>
        <View style={styles.modeRow}>
          {[
            { v: 'exam'  as QuizMode, icon: '📋', label: 'מצב בחינה',  sub: 'תוצאות בסוף' },
            { v: 'study' as QuizMode, icon: '💡', label: 'מצב לימוד',  sub: 'תשובה אחרי כל שאלה' },
          ].map(m => (
            <TouchableOpacity
              key={m.v}
              style={[styles.modeCard, mode === m.v && styles.modeCardActive]}
              onPress={() => setMode(m.v)}
              activeOpacity={0.75}
            >
              <Text style={styles.modeCardIcon}>{m.icon}</Text>
              <Text style={[styles.modeLabel, mode === m.v && { color: COLORS.primary }]}>{m.label}</Text>
              <Text style={styles.modeSub}>{m.sub}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Custom questions toggle */}
        <View style={styles.toggleCard}>
          <Switch
            value={includeCustom}
            onValueChange={setIncludeCustom}
            trackColor={{ false: COLORS.border, true: COLORS.primary }}
            thumbColor="#fff"
          />
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <Text style={styles.toggleLabel}>כלול שאלות מותאמות</Text>
            <Text style={styles.toggleSub}>{state.customQuestions.length} שאלות זמינות</Text>
          </View>
        </View>

        {/* Start button */}
        <TouchableOpacity style={styles.startBtn} onPress={buildAndStart} activeOpacity={0.85}>
          <Text style={styles.startBtnTxt}>התחל בחינה ▶</Text>
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: 16 },
  hero: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: COLORS.surface, borderRadius: 18, padding: 16, marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6, elevation: 3,
    justifyContent: 'flex-end',
  },
  heroIconWrap: { width: 56, height: 56, borderRadius: 16, backgroundColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center' },
  heroIcon: { fontSize: 30 },
  heroTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text },
  heroSub: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  sectionLabel: { fontSize: 15, fontWeight: '700', color: COLORS.text, textAlign: 'right', marginBottom: 10 },
  countRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  countChip: {
    flex: 1, paddingVertical: 12, borderRadius: 14,
    backgroundColor: COLORS.surface, borderWidth: 1.5, borderColor: COLORS.border, alignItems: 'center',
  },
  countChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  countChipTxt: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  countChipTxtActive: { color: '#fff' },
  topicGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  topicCard: {
    width: '47%', backgroundColor: COLORS.surface, borderRadius: 16, padding: 14,
    alignItems: 'center', gap: 6, borderWidth: 2, borderColor: COLORS.border, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  topicCheck: { position: 'absolute', top: 8, left: 8, width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  topicCheckTxt: { color: '#fff', fontSize: 11, fontWeight: '800' },
  topicIcon: { fontSize: 28 },
  topicName: { fontSize: 12, fontWeight: '700', color: COLORS.text, textAlign: 'center' },
  diffRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  diffCard: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: 14, paddingVertical: 12,
    alignItems: 'center', gap: 4, borderWidth: 1.5, borderColor: COLORS.border,
  },
  diffIcon: { fontSize: 20 },
  diffLabel: { fontSize: 12, fontWeight: '700', color: COLORS.text },
  modeRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  modeCard: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: 16, padding: 16,
    alignItems: 'center', gap: 5, borderWidth: 1.5, borderColor: COLORS.border,
  },
  modeCardActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
  modeCardIcon: { fontSize: 28 },
  modeLabel: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  modeSub: { fontSize: 11, color: COLORS.textSecondary, textAlign: 'center' },
  toggleCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.surface, borderRadius: 16, padding: 14, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  toggleLabel: { fontSize: 15, fontWeight: '600', color: COLORS.text, textAlign: 'right' },
  toggleSub: { fontSize: 12, color: COLORS.textSecondary, textAlign: 'right' },
  startBtn: {
    backgroundColor: COLORS.primary, borderRadius: 16, paddingVertical: 17, alignItems: 'center',
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  startBtnTxt: { color: '#fff', fontSize: 17, fontWeight: '800' },
});
