import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { useApp } from '../../store/AppContext';
import { COLORS } from '../../utils/colors';
import { BUILT_IN_QUESTIONS } from '../../data/questions';

const TOPIC_INFO: Record<string, { name: string; icon: string }> = {
  networking:       { name: 'רשתות', icon: '🌐' },
  security:         { name: 'אבטחה', icon: '🔒' },
  operatingSystems: { name: 'מערכות הפעלה', icon: '💻' },
  cloud:            { name: 'ענן', icon: '☁️' },
  itManagement:     { name: 'ניהול IT', icon: '📋' },
  protocols:        { name: 'פרוטוקולים', icon: '🔄' },
};

export default function SystemStatsScreen({ navigation }: any) {
  const { state } = useApp();
  const { progress } = state;
  const allQ = useMemo(() => [...BUILT_IN_QUESTIONS, ...state.customQuestions], [state.customQuestions]);

  const hardestQuestions = useMemo(() => {
    return Object.entries(progress.questionPerformance)
      .filter(([, p]) => p.timesAnswered >= 2)
      .map(([id, p]) => ({
        id,
        accuracy: p.timesCorrect / p.timesAnswered,
        timesAnswered: p.timesAnswered,
        question: allQ.find(q => q.id === id),
      }))
      .filter(item => item.question != null)
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 5);
  }, [progress.questionPerformance, allQ]);

  const topicStats = useMemo(() =>
    Object.entries(TOPIC_INFO).map(([tid, info]) => {
      const tp = progress.topicProgress[tid];
      const total = allQ.filter(q => q.topic === tid).length;
      const answered = tp?.answeredCount ?? 0;
      const correct = tp?.correctCount ?? 0;
      const accuracy = answered > 0 ? correct / answered : 0;
      return { tid, info, total, answered, accuracy };
    }), [progress.topicProgress, allQ]);

  const totalQuizzes = progress.quizHistory.length;
  const avgScore = totalQuizzes > 0
    ? (progress.quizHistory.reduce((s, h) => s + (h.score / h.total), 0) / totalQuizzes) * 100
    : 0;
  const uniqueAnswered = Object.keys(progress.questionPerformance).length;
  const customCount = state.customQuestions.length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>‹ חזרה</Text></TouchableOpacity>
        <Text style={styles.title}>סטטיסטיקות מתקדמות</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Summary */}
        <View style={styles.summaryGrid}>
          {[
            { label: 'שאלות בבנק', value: allQ.length, color: COLORS.primary, icon: '❓' },
            { label: 'שאלות מותאמות', value: customCount, color: COLORS.secondary, icon: '✏️' },
            { label: 'בחינות הושלמו', value: totalQuizzes, color: COLORS.success, icon: '📋' },
            { label: 'שאלות שנוסו', value: uniqueAnswered, color: COLORS.orange, icon: '🎯' },
            { label: 'ממוצע כללי', value: `${Math.round(avgScore)}%`, color: avgScore >= 70 ? COLORS.success : COLORS.warning, icon: '📊' },
            { label: 'ימי רצף', value: progress.streakDays, color: COLORS.info, icon: '🔥' },
          ].map(s => (
            <View key={s.label} style={styles.summaryCard}>
              <Text style={styles.summaryIcon}>{s.icon}</Text>
              <Text style={[styles.summaryVal, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.summaryLbl}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Topic performance */}
        <Text style={styles.sectionTitle}>📊 ביצועים לפי נושא</Text>
        <View style={styles.card}>
          {topicStats.map(({ tid, info, total, answered, accuracy }, i) => (
            <View key={tid} style={[styles.topicRow, i < topicStats.length - 1 && styles.topicRowBorder]}>
              <View style={styles.topicMeta}>
                <Text style={[styles.topicAcc, {
                  color: answered === 0 ? COLORS.textTertiary : accuracy >= 0.7 ? COLORS.success : accuracy >= 0.5 ? COLORS.warning : COLORS.danger,
                }]}>
                  {answered > 0 ? `${Math.round(accuracy * 100)}%` : '-'}
                </Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.topicName}>{info.icon} {info.name}</Text>
                  <Text style={styles.topicSub}>{answered}/{total} שאלות</Text>
                </View>
              </View>
              <View style={styles.barBg}>
                <View style={[styles.barFill, {
                  width: answered > 0 ? `${accuracy * 100}%` : '0%',
                  backgroundColor: accuracy >= 0.7 ? COLORS.success : accuracy >= 0.5 ? COLORS.warning : COLORS.danger,
                }]} />
              </View>
            </View>
          ))}
        </View>

        {/* Question bank breakdown */}
        <Text style={styles.sectionTitle}>📚 התפלגות שאלות לפי נושא</Text>
        <View style={styles.card}>
          {Object.entries(TOPIC_INFO).map(([tid, info], i, arr) => {
            const count = allQ.filter(q => q.topic === tid).length;
            const pct = allQ.length > 0 ? count / allQ.length : 0;
            return (
              <View key={tid} style={[styles.topicRow, i < arr.length - 1 && styles.topicRowBorder]}>
                <View style={styles.topicMeta}>
                  <Text style={[styles.topicAcc, { color: COLORS.primary }]}>{count}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.topicName}>{info.icon} {info.name}</Text>
                    <Text style={styles.topicSub}>{Math.round(pct * 100)}% מהבנק</Text>
                  </View>
                </View>
                <View style={styles.barBg}>
                  <View style={[styles.barFill, { width: `${pct * 100}%`, backgroundColor: COLORS.primary }]} />
                </View>
              </View>
            );
          })}
        </View>

        {/* Hardest questions */}
        <Text style={styles.sectionTitle}>🔴 שאלות הכי קשות (לפי ביצועים)</Text>
        {hardestQuestions.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTxt}>עדיין אין מספיק נתונים</Text>
            <Text style={styles.emptySub}>ענה על שאלות כדי לראות ניתוח ביצועים</Text>
          </View>
        ) : (
          <View style={styles.card}>
            {hardestQuestions.map((item, i) => (
              <View key={item.id} style={[styles.hardRow, i < hardestQuestions.length - 1 && styles.hardRowBorder]}>
                <View style={styles.hardLeft}>
                  <Text style={styles.hardRank}>#{i + 1}</Text>
                  <Text style={[styles.hardAcc, { color: item.accuracy < 0.5 ? COLORS.danger : COLORS.warning }]}>
                    {Math.round(item.accuracy * 100)}%
                  </Text>
                  <Text style={styles.hardAttempts}>{item.timesAnswered}×</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.hardQ} numberOfLines={2}>{item.question!.questionText}</Text>
                  <Text style={styles.hardTopic}>
                    {TOPIC_INFO[item.question!.topic]?.icon} {TOPIC_INFO[item.question!.topic]?.name}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Recent quizzes */}
        <Text style={styles.sectionTitle}>🕐 5 בחינות אחרונות</Text>
        {progress.quizHistory.length === 0 ? (
          <View style={styles.emptyCard}><Text style={styles.emptyTxt}>לא הושלמו בחינות עדיין</Text></View>
        ) : (
          <View style={styles.card}>
            {progress.quizHistory.slice(0, 5).map((h, i) => {
              const pct = Math.round((h.score / h.total) * 100);
              const mins = Math.round(h.durationSeconds / 60);
              return (
                <View key={h.id} style={[styles.histRow, i < 4 && styles.histRowBorder]}>
                  <Text style={styles.histDate}>{new Date(h.date).toLocaleDateString('he-IL')}</Text>
                  <View style={styles.histMid}>
                    <Text style={styles.histDetail}>{h.score}/{h.total} · {mins} דק'</Text>
                    {h.isAdaptive && <Text style={styles.adaptBadge}>אדפטיבי</Text>}
                  </View>
                  <Text style={[styles.histPct, { color: pct >= 70 ? COLORS.success : pct >= 50 ? COLORS.warning : COLORS.danger }]}>
                    {pct}%
                  </Text>
                </View>
              );
            })}
          </View>
        )}

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
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  summaryCard: {
    width: '30%', flexGrow: 1,
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, alignItems: 'center', gap: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 5, elevation: 3,
  },
  summaryIcon: { fontSize: 22 },
  summaryVal: { fontSize: 20, fontWeight: '800' },
  summaryLbl: { fontSize: 11, color: COLORS.textSecondary, textAlign: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, textAlign: 'right', marginBottom: 10, marginTop: 4 },
  card: {
    backgroundColor: COLORS.surface, borderRadius: 16, padding: 14, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },
  topicRow: { paddingVertical: 10 },
  topicRowBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  topicMeta: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  topicAcc: { fontSize: 15, fontWeight: '800', minWidth: 40, textAlign: 'right' },
  topicName: { fontSize: 14, fontWeight: '600', color: COLORS.text, textAlign: 'right' },
  topicSub: { fontSize: 12, color: COLORS.textSecondary, textAlign: 'right' },
  barBg: { height: 7, backgroundColor: COLORS.border, borderRadius: 4, overflow: 'hidden' },
  barFill: { height: 7, borderRadius: 4 },
  hardRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  hardRowBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  hardLeft: { alignItems: 'center', gap: 2, minWidth: 44 },
  hardRank: { fontSize: 11, color: COLORS.textTertiary, fontWeight: '600' },
  hardAcc: { fontSize: 18, fontWeight: '800' },
  hardAttempts: { fontSize: 11, color: COLORS.textTertiary },
  hardQ: { fontSize: 13, color: COLORS.text, textAlign: 'right', lineHeight: 18 },
  hardTopic: { fontSize: 11, color: COLORS.textSecondary, textAlign: 'right', marginTop: 2 },
  histRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 8 },
  histRowBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  histDate: { fontSize: 12, color: COLORS.textSecondary, minWidth: 70 },
  histMid: { flex: 1, alignItems: 'flex-end', gap: 2 },
  histDetail: { fontSize: 13, color: COLORS.text, textAlign: 'right' },
  histPct: { fontSize: 16, fontWeight: '800', minWidth: 44, textAlign: 'right' },
  adaptBadge: { fontSize: 10, color: COLORS.secondary, backgroundColor: COLORS.purpleLight, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, fontWeight: '700' },
  emptyCard: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 16, gap: 6 },
  emptyTxt: { fontSize: 15, color: COLORS.textSecondary, fontWeight: '600' },
  emptySub: { fontSize: 13, color: COLORS.textTertiary, textAlign: 'center' },
});
