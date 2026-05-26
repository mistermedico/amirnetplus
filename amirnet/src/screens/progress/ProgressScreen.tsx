import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity,
} from 'react-native';
import { useApp } from '../../store/AppContext';
import { COLORS, TOPIC_COLORS } from '../../utils/colors';
import { Card, ScoreRing, StatCard, ProgressBar, SectionHeader } from '../../components/common';
import { BUILT_IN_QUESTIONS } from '../../data/questions';

const TOPICS = [
  { id: 'networking', name: 'רשתות תקשורת', icon: '🌐' },
  { id: 'security', name: 'אבטחת מידע', icon: '🔒' },
  { id: 'operatingSystems', name: 'מערכות הפעלה', icon: '💻' },
  { id: 'cloud', name: 'ענן ווירטואליזציה', icon: '☁️' },
  { id: 'itManagement', name: 'ניהול IT', icon: '📋' },
  { id: 'protocols', name: 'פרוטוקולים', icon: '🔄' },
];

const ACHIEVEMENTS = [
  { id: 'first_10', icon: '⭐', label: 'מתחיל', desc: '10 שאלות' },
  { id: 'fifty_questions', icon: '🔥', label: 'חצי מאה', desc: '50 שאלות' },
  { id: 'century', icon: '🏆', label: 'מאה!', desc: '100 שאלות' },
  { id: 'five_hundred', icon: '💎', label: 'חמש מאות', desc: '500 שאלות' },
  { id: 'high_scorer', icon: '🥇', label: 'ציון גבוה', desc: '80%+ ב-20 שאלות' },
  { id: 'streak_3', icon: '🎯', label: '3 ימי רצף', desc: '3 ימים ברצף' },
  { id: 'streak_7', icon: '🌟', label: 'שבוע שלם', desc: '7 ימים ברצף' },
];

function fmtDuration(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function ProgressScreen({ navigation }: any) {
  const { state, overallPercentage } = useApp();
  const { progress } = state;

  // last 7 days activity
  const last7 = (() => {
    const days: { label: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const key = d.toDateString();
      const act = progress.dailyActivity.find(a => a.date === key);
      days.push({ label: ['א','ב','ג','ד','ה','ו','ש'][d.getDay()], count: act?.questionsAnswered ?? 0 });
    }
    return days;
  })();
  const maxDay = Math.max(...last7.map(d => d.count), 1);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>התקדמות</Text>

        {/* Overall */}
        <Card style={styles.overallCard}>
          <View style={styles.overallRow}>
            <View style={styles.overallStats}>
              <View style={styles.statPair}>
                <Text style={[styles.statVal, { color: COLORS.success }]}>{progress.totalCorrect}</Text>
                <Text style={styles.statLbl}>נכון</Text>
              </View>
              <View style={styles.statPair}>
                <Text style={[styles.statVal, { color: COLORS.danger }]}>{progress.totalAnswered - progress.totalCorrect}</Text>
                <Text style={styles.statLbl}>שגוי</Text>
              </View>
              <View style={styles.statPair}>
                <Text style={[styles.statVal, { color: COLORS.orange }]}>{progress.streakDays}</Text>
                <Text style={styles.statLbl}>ימי רצף</Text>
              </View>
            </View>
            <ScoreRing pct={overallPercentage} size={100} />
          </View>
          <Text style={styles.overallSub}>{progress.totalAnswered} שאלות נענו סך הכל</Text>
        </Card>

        {/* 7-day bar chart */}
        <SectionHeader title="פעילות 7 ימים אחרונים" />
        <Card style={styles.chartCard}>
          <View style={styles.chartBars}>
            {last7.map((d, i) => (
              <View key={i} style={styles.chartCol}>
                <Text style={styles.chartCount}>{d.count || ''}</Text>
                <View style={styles.chartBarWrap}>
                  <View style={[styles.chartBar, { height: Math.max((d.count / maxDay) * 80, d.count > 0 ? 4 : 0), backgroundColor: d.count > 0 ? COLORS.primary : COLORS.border }]} />
                </View>
                <Text style={styles.chartDay}>{d.label}</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Topics */}
        <SectionHeader title="פירוט לפי נושא" />
        {TOPICS.map(t => {
          const tp = progress.topicProgress[t.id];
          const total = BUILT_IN_QUESTIONS.filter(q => q.topic === t.id).length;
          const answered = tp?.answeredCount ?? 0;
          const pct = tp && answered > 0 ? (tp.correctCount / answered) * 100 : 0;
          const color = TOPIC_COLORS[t.id];
          return (
            <View key={t.id} style={styles.topicRow}>
              <View style={styles.topicLeft}>
                {answered > 0 ? (
                  <Text style={[styles.topicPct, { color: pct >= 70 ? COLORS.success : COLORS.warning }]}>
                    {Math.round(pct)}%
                  </Text>
                ) : (
                  <Text style={styles.topicPctEmpty}>-</Text>
                )}
                <Text style={styles.topicAnswered}>{answered}/{total}</Text>
              </View>
              <View style={styles.topicRight}>
                <Text style={styles.topicIcon}>{t.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.topicName}>{t.name}</Text>
                  <ProgressBar value={pct} total={100} color={color} height={5} style={{ marginTop: 4 }} />
                </View>
              </View>
            </View>
          );
        })}

        {/* History */}
        <SectionHeader title="היסטוריית בחינות" action="הכל" onAction={() => {}} />
        {progress.quizHistory.slice(0, 10).map(h => {
          const pct = Math.round((h.score / h.total) * 100);
          return (
            <View key={h.id} style={styles.histRow}>
              <View style={styles.histLeft}>
                <Text style={[styles.histPct, { color: pct >= 70 ? COLORS.success : COLORS.danger }]}>{pct}%</Text>
                <Text style={styles.histTime}>{fmtDuration(h.durationSeconds)}</Text>
              </View>
              <View style={styles.histRight}>
                <Text style={styles.histDate}>{new Date(h.date).toLocaleDateString('he-IL')}</Text>
                <Text style={styles.histScore}>{h.score}/{h.total} {h.isAdaptive ? '🧠' : ''}</Text>
              </View>
            </View>
          );
        })}
        {progress.quizHistory.length === 0 && (
          <View style={styles.emptyHist}>
            <Text style={styles.emptyHistText}>עדיין אין היסטוריה. צא לבחינה! 📝</Text>
          </View>
        )}

        {/* Achievements */}
        <SectionHeader title="הישגים" />
        <View style={styles.achieveGrid}>
          {ACHIEVEMENTS.map(a => {
            const unlocked = progress.unlockedAchievements.includes(a.id);
            return (
              <View key={a.id} style={[styles.achieveCell, !unlocked && styles.achieveCellLocked]}>
                <Text style={[styles.achieveIcon, !unlocked && { opacity: 0.25 }]}>{a.icon}</Text>
                <Text style={[styles.achieveLabel, !unlocked && { color: COLORS.textTertiary }]}>{a.label}</Text>
                <Text style={styles.achieveDesc}>{a.desc}</Text>
              </View>
            );
          })}
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: 16 },
  title: { fontSize: 26, fontWeight: '800', color: COLORS.text, textAlign: 'right', marginBottom: 16 },
  overallCard: { marginBottom: 16 },
  overallRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  overallStats: { gap: 16 },
  statPair: { alignItems: 'center' },
  statVal: { fontSize: 22, fontWeight: '800' },
  statLbl: { fontSize: 12, color: COLORS.textSecondary },
  overallSub: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center' },
  chartCard: { marginBottom: 16 },
  chartBars: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 110 },
  chartCol: { flex: 1, alignItems: 'center', gap: 2 },
  chartCount: { fontSize: 10, color: COLORS.textSecondary, height: 14 },
  chartBarWrap: { height: 80, justifyContent: 'flex-end' },
  chartBar: { width: 20, borderRadius: 4 },
  chartDay: { fontSize: 11, color: COLORS.textSecondary, marginTop: 4 },
  topicRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 12, marginBottom: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
  },
  topicRight: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  topicLeft: { alignItems: 'flex-end', minWidth: 40, gap: 2 },
  topicIcon: { fontSize: 22 },
  topicName: { fontSize: 14, fontWeight: '600', color: COLORS.text, textAlign: 'right' },
  topicPct: { fontSize: 14, fontWeight: '700' },
  topicPctEmpty: { fontSize: 14, color: COLORS.textTertiary },
  topicAnswered: { fontSize: 11, color: COLORS.textSecondary },
  histRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 12, marginBottom: 6,
  },
  histRight: { alignItems: 'flex-end', gap: 2 },
  histLeft: { alignItems: 'flex-start', gap: 2 },
  histDate: { fontSize: 13, fontWeight: '600', color: COLORS.text },
  histScore: { fontSize: 13, color: COLORS.textSecondary },
  histPct: { fontSize: 16, fontWeight: '800' },
  histTime: { fontSize: 12, color: COLORS.textSecondary },
  emptyHist: { alignItems: 'center', paddingVertical: 20 },
  emptyHistText: { color: COLORS.textSecondary, fontSize: 14 },
  achieveGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  achieveCell: {
    width: '30%', backgroundColor: COLORS.surface, borderRadius: 14, padding: 12,
    alignItems: 'center', gap: 4, flex: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
  },
  achieveCellLocked: { backgroundColor: COLORS.background },
  achieveIcon: { fontSize: 26 },
  achieveLabel: { fontSize: 12, fontWeight: '700', color: COLORS.text, textAlign: 'center' },
  achieveDesc: { fontSize: 10, color: COLORS.textSecondary, textAlign: 'center' },
});
