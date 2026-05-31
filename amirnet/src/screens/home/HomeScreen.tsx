import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useApp } from '../../store/AppContext';
import { COLORS, TOPIC_COLORS } from '../../utils/colors';
import { Card, StatCard, ProgressBar, SectionHeader, EmptyState } from '../../components/common';
import { BUILT_IN_QUESTIONS } from '../../data/questions';
import { Announcement } from '../../types';

const ANN_STYLE: Record<Announcement['type'], { bg: string; border: string; color: string; icon: string }> = {
  info:    { bg: COLORS.infoLight,    border: COLORS.info,    color: COLORS.info,    icon: 'ℹ️' },
  success: { bg: COLORS.successLight, border: COLORS.success, color: COLORS.success, icon: '✅' },
  warning: { bg: COLORS.warningLight, border: COLORS.warning, color: COLORS.warning, icon: '⚠️' },
};

const TOPIC_INFO: Record<string, { name: string; icon: string }> = {
  networking:       { name: 'רשתות תקשורת', icon: '🌐' },
  security:         { name: 'אבטחת מידע',   icon: '🔒' },
  operatingSystems: { name: 'מערכות הפעלה', icon: '💻' },
  cloud:            { name: 'ענן ווירטואליזציה', icon: '☁️' },
  itManagement:     { name: 'ניהול IT',      icon: '📋' },
  protocols:        { name: 'פרוטוקולים',    icon: '🔄' },
};

const ACHIEVEMENTS = [
  { id: 'first_10', icon: '⭐', label: 'מתחיל' },
  { id: 'fifty_questions', icon: '🔥', label: 'חצי מאה' },
  { id: 'century', icon: '🏆', label: 'מאה שאלות' },
  { id: 'high_scorer', icon: '💎', label: 'ציון גבוה' },
  { id: 'streak_3', icon: '🎯', label: '3 ימי רצף' },
  { id: 'streak_7', icon: '🌟', label: 'שבוע שלם' },
];

export default function HomeScreen({ navigation }: any) {
  const { state, overallPercentage, todayAnswered } = useApp();
  const { progress } = state;
  const user = state.auth.currentUser;

  const goalDone = todayAnswered >= progress.dailyGoal;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>שלום, {user?.displayName || 'לומד'} 👋</Text>
            <Text style={styles.subGreeting}>הכנה לבחינת אמירנט</Text>
          </View>
          <View style={styles.avatarWrap}>
            <Text style={styles.avatarText}>{user?.displayName?.[0]?.toUpperCase() || 'U'}</Text>
          </View>
        </View>

        {/* Announcements */}
        {state.announcements.length > 0 && (
          <View style={styles.announcementsWrap}>
            {state.announcements.map(ann => {
              const s = ANN_STYLE[ann.type];
              return (
                <View key={ann.id} style={[styles.annBanner, { backgroundColor: s.bg, borderLeftColor: s.border }]}>
                  <Text style={styles.annIcon}>{s.icon}</Text>
                  <View style={{ flex: 1, alignItems: 'flex-end' }}>
                    <Text style={[styles.annTitle, { color: s.color }]}>{ann.title}</Text>
                    {ann.body ? <Text style={styles.annBody}>{ann.body}</Text> : null}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Daily Goal */}
        <Card style={[styles.goalCard, goalDone && styles.goalCardDone]}>
          <View style={styles.goalRow}>
            <Text style={styles.goalCount}>{todayAnswered}/{progress.dailyGoal}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.goalTitle}>{goalDone ? '🎯 יעד יומי הושג!' : 'יעד יומי'}</Text>
              <Text style={styles.goalSub}>שאלות היום</Text>
            </View>
          </View>
          <ProgressBar
            value={todayAnswered}
            total={progress.dailyGoal}
            color={goalDone ? COLORS.success : COLORS.primary}
            height={10}
          />
        </Card>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <StatCard value={String(progress.totalAnswered)} label="שאלות" color={COLORS.primary} />
          <StatCard
            value={progress.totalAnswered > 0 ? `${Math.round(overallPercentage)}%` : '-'}
            label="הצלחה"
            color={overallPercentage >= 70 ? COLORS.success : COLORS.warning}
          />
          <StatCard value={String(progress.streakDays)} label="ימי רצף" color={COLORS.orange} />
          <StatCard value={String(progress.bookmarkedQuestionIDs.length)} label="שמורות" color={COLORS.secondary} />
        </View>

        {/* Weak topics */}
        {progress.weakTopics.length > 0 && (
          <Card style={styles.weakCard}>
            <Text style={styles.weakTitle}>⚠️ נושאים לחיזוק</Text>
            {progress.weakTopics.slice(0, 3).map(tid => {
              const tp = progress.topicProgress[tid];
              const info = TOPIC_INFO[tid];
              if (!tp || !info) return null;
              const pct = Math.round((tp.correctCount / tp.answeredCount) * 100);
              return (
                <View key={tid} style={styles.weakRow}>
                  <Text style={styles.weakPct}>{pct}%</Text>
                  <ProgressBar value={pct} total={100} color={COLORS.warning} style={{ flex: 1 }} />
                  <TouchableOpacity
                    style={styles.weakPracticeBtn}
                    onPress={() => navigation.navigate('QuizSetup', { topicID: tid })}
                  >
                    <Text style={styles.weakPracticeTxt}>תרגל</Text>
                  </TouchableOpacity>
                  <Text style={styles.weakName}>{info.icon} {info.name}</Text>
                </View>
              );
            })}
          </Card>
        )}

        {/* Quick Actions */}
        <SectionHeader title="פעולות מהירות" />
        <View style={styles.quickGrid}>
          {[
            { icon: '▶️', label: 'בחינה מהירה', sub: '10 שאלות', color: COLORS.primary, onPress: () => navigation.navigate('QuizSetup', { quick: true }) },
            { icon: '🧠', label: 'אדפטיבי', sub: 'מותאם לרמתך', color: COLORS.secondary, onPress: () => navigation.navigate('AdaptiveSetup') },
            { icon: '🔖', label: 'שמורות', sub: `${progress.bookmarkedQuestionIDs.length}`, color: COLORS.orange, onPress: () => navigation.navigate('Bookmarks') },
            { icon: '📈', label: 'התקדמות', sub: 'גרפים ונתונים', color: COLORS.success, onPress: () => navigation.navigate('Progress') },
          ].map(a => (
            <TouchableOpacity key={a.label} style={[styles.quickCard, { borderTopColor: a.color }]} onPress={a.onPress} activeOpacity={0.75}>
              <Text style={styles.quickIcon}>{a.icon}</Text>
              <Text style={styles.quickLabel}>{a.label}</Text>
              <Text style={styles.quickSub}>{a.sub}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Topics overview */}
        <SectionHeader title="סקירת נושאים" action="הכל" onAction={() => navigation.navigate('Topics')} />
        {Object.entries(TOPIC_INFO).map(([tid, info]) => {
          const tp = progress.topicProgress[tid];
          const total = BUILT_IN_QUESTIONS.filter(q => q.topic === tid).length;
          const pct = tp && tp.answeredCount > 0 ? (tp.correctCount / tp.answeredCount) * 100 : 0;
          return (
            <TouchableOpacity
              key={tid}
              style={styles.topicRow}
              onPress={() => navigation.navigate('Topics', { screen: 'TopicDetail', params: { topicID: tid } })}
              activeOpacity={0.75}
            >
              <View style={styles.topicRight}>
                <View style={[styles.topicIconWrap, { backgroundColor: TOPIC_COLORS[tid] + '20' }]}>
                  <Text style={styles.topicIconTxt}>{info.icon}</Text>
                </View>
                <View>
                  <Text style={styles.topicName}>{info.name}</Text>
                  <Text style={styles.topicCount}>{tp?.answeredCount ?? 0}/{total} שאלות</Text>
                </View>
              </View>
              <View style={styles.topicLeft}>
                {pct > 0 && (
                  <Text style={[styles.topicPct, { color: pct >= 70 ? COLORS.success : COLORS.warning }]}>
                    {Math.round(pct)}%
                  </Text>
                )}
                <Text style={styles.chevron}>›</Text>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Achievements */}
        <SectionHeader title="הישגים" />
        <View style={styles.achieveRow}>
          {ACHIEVEMENTS.map(a => {
            const unlocked = progress.unlockedAchievements.includes(a.id);
            return (
              <View key={a.id} style={[styles.achieveCell, !unlocked && styles.achieveLocked]}>
                <Text style={[styles.achieveIcon, !unlocked && { opacity: 0.3 }]}>{a.icon}</Text>
                <Text style={[styles.achieveLabel, !unlocked && { color: COLORS.textTertiary }]}>{a.label}</Text>
              </View>
            );
          })}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  greeting: { fontSize: 22, fontWeight: '800', color: COLORS.text, textAlign: 'right' },
  subGreeting: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'right' },
  avatarWrap: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  announcementsWrap: { gap: 8, marginBottom: 14 },
  annBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    borderRadius: 12, padding: 12, borderLeftWidth: 4,
  },
  annIcon: { fontSize: 18, marginTop: 1 },
  annTitle: { fontSize: 14, fontWeight: '700', textAlign: 'right' },
  annBody: { fontSize: 12, color: COLORS.textSecondary, textAlign: 'right', marginTop: 2, lineHeight: 17 },
  goalCard: { marginBottom: 14, gap: 10 },
  goalCardDone: { borderColor: COLORS.success, borderWidth: 1.5 },
  goalRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  goalCount: { fontSize: 26, fontWeight: '800', color: COLORS.primary },
  goalTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, textAlign: 'right' },
  goalSub: { fontSize: 12, color: COLORS.textSecondary, textAlign: 'right' },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  weakCard: { backgroundColor: COLORS.warningLight, marginBottom: 14 },
  weakTitle: { fontSize: 15, fontWeight: '700', color: COLORS.warning, textAlign: 'right', marginBottom: 10 },
  weakRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  weakName: { fontSize: 12, color: COLORS.text, textAlign: 'right', minWidth: 100 },
  weakPct: { fontSize: 12, fontWeight: '700', color: COLORS.warning, minWidth: 32, textAlign: 'right' },
  weakPracticeBtn: { backgroundColor: COLORS.warning, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  weakPracticeTxt: { color: '#fff', fontSize: 11, fontWeight: '700' },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 18 },
  quickCard: {
    width: '47%', backgroundColor: COLORS.surface, borderRadius: 16, padding: 14,
    borderTopWidth: 3, alignItems: 'flex-end',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  quickIcon: { fontSize: 28, marginBottom: 6 },
  quickLabel: { fontSize: 14, fontWeight: '700', color: COLORS.text, textAlign: 'right' },
  quickSub: { fontSize: 12, color: COLORS.textSecondary, textAlign: 'right' },
  topicRow: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 14,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
  },
  topicRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  topicIconWrap: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  topicIconTxt: { fontSize: 20 },
  topicName: { fontSize: 14, fontWeight: '600', color: COLORS.text, textAlign: 'right' },
  topicCount: { fontSize: 12, color: COLORS.textSecondary },
  topicLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  topicPct: { fontSize: 13, fontWeight: '700' },
  chevron: { fontSize: 20, color: COLORS.textTertiary },
  achieveRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  achieveCell: {
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 10,
    alignItems: 'center', minWidth: 70, flex: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
  },
  achieveLocked: { backgroundColor: COLORS.background },
  achieveIcon: { fontSize: 22, marginBottom: 4 },
  achieveLabel: { fontSize: 11, color: COLORS.text, textAlign: 'center', fontWeight: '600' },
});
