import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  SafeAreaView, TextInput,
} from 'react-native';
import { useApp } from '../../store/AppContext';
import { COLORS, TOPIC_COLORS, DIFFICULTY_COLORS, DIFFICULTY_BG } from '../../utils/colors';
import { BUILT_IN_QUESTIONS } from '../../data/questions';
import { Question, Difficulty } from '../../types';

const TOPIC_INFO: Record<string, { name: string; icon: string }> = {
  networking:       { name: 'רשתות תקשורת',       icon: '🌐' },
  security:         { name: 'אבטחת מידע',          icon: '🔒' },
  operatingSystems: { name: 'מערכות הפעלה',        icon: '💻' },
  cloud:            { name: 'ענן ווירטואליזציה',   icon: '☁️' },
  itManagement:     { name: 'ניהול IT',             icon: '📋' },
  protocols:        { name: 'פרוטוקולים',           icon: '🔄' },
};

const DIFF_LABELS: Record<string, string> = { easy: 'קל', medium: 'בינוני', hard: 'קשה' };

export default function TopicDetailScreen({ navigation, route }: any) {
  const { topicID } = route.params;
  const { state, dispatch } = useApp();

  const [search, setSearch]       = useState('');
  const [diffFilter, setDiffFilter] = useState<Difficulty | 'all'>('all');
  const [expandedID, setExpandedID] = useState<string | null>(null);

  const topicInfo = TOPIC_INFO[topicID];
  const color = TOPIC_COLORS[topicID] || COLORS.primary;

  const allQ: Question[] = [
    ...BUILT_IN_QUESTIONS.filter(q => q.topic === topicID),
    ...state.customQuestions.filter(q => q.topic === topicID),
  ];

  const filtered = allQ.filter(q => {
    const matchDiff = diffFilter === 'all' || q.difficulty === diffFilter;
    const matchSearch = !search || q.questionText.includes(search);
    return matchDiff && matchSearch;
  });

  const tp = state.progress.topicProgress[topicID];
  const pct = tp && tp.answeredCount > 0 ? Math.round((tp.correctCount / tp.answeredCount) * 100) : 0;
  const easyCnt   = allQ.filter(q => q.difficulty === 'easy').length;
  const medCnt    = allQ.filter(q => q.difficulty === 'medium').length;
  const hardCnt   = allQ.filter(q => q.difficulty === 'hard').length;

  return (
    <SafeAreaView style={styles.container}>
      {/* Colored header */}
      <View style={[styles.header, { backgroundColor: color }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backTxt}>‹ חזרה</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.practiceBtn}
            onPress={() => navigation.navigate('QuizSetup', { topicID })}
          >
            <Text style={styles.practiceTxt}>▶ תרגל</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.headerInfo}>
          <Text style={styles.headerIcon}>{topicInfo?.icon}</Text>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.headerTitle}>{topicInfo?.name}</Text>
            <Text style={styles.headerSub}>{allQ.length} שאלות · {pct > 0 ? `${pct}% הצלחה` : 'טרם נתרגל'}</Text>
          </View>
        </View>

        {/* Difficulty pills */}
        <View style={styles.diffPills}>
          <View style={styles.diffPill}><Text style={styles.diffPillTxt}>🔴 {hardCnt} קשה</Text></View>
          <View style={styles.diffPill}><Text style={styles.diffPillTxt}>🟡 {medCnt} בינוני</Text></View>
          <View style={styles.diffPill}><Text style={styles.diffPillTxt}>🟢 {easyCnt} קל</Text></View>
        </View>
      </View>

      {/* Search + filter */}
      <View style={styles.controls}>
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="חפש שאלה..."
          placeholderTextColor={COLORS.textTertiary}
          textAlign="right"
        />
        <View style={styles.filterRow}>
          {(['all', 'easy', 'medium', 'hard'] as const).map(d => (
            <TouchableOpacity
              key={d}
              style={[styles.filterChip, diffFilter === d && { backgroundColor: color, borderColor: color }]}
              onPress={() => setDiffFilter(d)}
            >
              <Text style={[styles.filterChipTxt, diffFilter === d && { color: '#fff' }]}>
                {d === 'all' ? 'הכל' : DIFF_LABELS[d]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={q => q.id}
        contentContainerStyle={styles.list}
        renderItem={({ item: q }) => {
          const expanded = expandedID === q.id;
          const bookmarked = state.progress.bookmarkedQuestionIDs.includes(q.id);
          const perf = state.progress.questionPerformance[q.id];
          const diffColor = DIFFICULTY_COLORS[q.difficulty];
          const diffBg = DIFFICULTY_BG[q.difficulty];

          return (
            <TouchableOpacity
              style={[styles.qCard, { borderLeftColor: color }]}
              onPress={() => setExpandedID(expanded ? null : q.id)}
              activeOpacity={0.75}
            >
              <View style={styles.qTop}>
                <View style={styles.qLeft}>
                  <View style={[styles.diffBadge, { backgroundColor: diffBg }]}>
                    <Text style={[styles.diffBadgeTxt, { color: diffColor }]}>{DIFF_LABELS[q.difficulty]}</Text>
                  </View>
                  {q.isCustom && (
                    <View style={styles.customBadge}><Text style={styles.customBadgeTxt}>✏️ מותאם</Text></View>
                  )}
                </View>
                <View style={styles.qRight}>
                  <TouchableOpacity onPress={() => dispatch({ type: 'TOGGLE_BOOKMARK', payload: q.id })}>
                    <Text style={{ fontSize: 20 }}>{bookmarked ? '🔖' : '📎'}</Text>
                  </TouchableOpacity>
                  <Text style={styles.qText} numberOfLines={expanded ? undefined : 2}>{q.questionText}</Text>
                </View>
              </View>

              {perf && perf.timesAnswered > 0 && (
                <View style={styles.perfRow}>
                  <View style={[styles.perfBarBg]}>
                    <View style={[styles.perfBarFill, {
                      width: `${Math.round((perf.timesCorrect / perf.timesAnswered) * 100)}%`,
                      backgroundColor: (perf.timesCorrect / perf.timesAnswered) >= 0.7 ? COLORS.success : COLORS.warning,
                    }]} />
                  </View>
                  <Text style={styles.perfTxt}>{perf.timesCorrect}/{perf.timesAnswered} נכון</Text>
                </View>
              )}

              {expanded && (
                <View style={styles.qExpanded}>
                  {q.options.map((opt, idx) => (
                    <View key={idx} style={[styles.optRow, idx === q.correctIndex && styles.optRowCorrect]}>
                      <Text style={[styles.optLetter, idx === q.correctIndex && { color: COLORS.success }]}>
                        {String.fromCharCode(65 + idx)}
                      </Text>
                      <Text style={[styles.optText, idx === q.correctIndex && styles.optTextCorrect]} numberOfLines={3}>
                        {opt}
                      </Text>
                      {idx === q.correctIndex && <Text style={styles.checkMark}>✓</Text>}
                    </View>
                  ))}
                  <View style={styles.explBox}>
                    <Text style={styles.explTitle}>💡 הסבר</Text>
                    <Text style={styles.explText}>{q.explanation}</Text>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyText}>לא נמצאו שאלות</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: 16, paddingBottom: 20, gap: 12 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  backBtn: { paddingVertical: 4 },
  backTxt: { color: 'rgba(255,255,255,0.9)', fontSize: 15, fontWeight: '600' },
  practiceBtn: { backgroundColor: 'rgba(255,255,255,0.22)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8 },
  practiceTxt: { color: '#fff', fontSize: 14, fontWeight: '700' },
  headerInfo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 12 },
  headerIcon: { fontSize: 44 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  diffPills: { flexDirection: 'row', gap: 8, justifyContent: 'flex-end' },
  diffPill: { backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  diffPillTxt: { fontSize: 12, color: '#fff', fontWeight: '600' },
  controls: { padding: 12, gap: 8, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  searchInput: {
    backgroundColor: COLORS.background, borderRadius: 12, padding: 11,
    fontSize: 14, color: COLORS.text, borderWidth: 1.5, borderColor: COLORS.border,
  },
  filterRow: { flexDirection: 'row', gap: 6 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: COLORS.background, borderWidth: 1.5, borderColor: COLORS.border },
  filterChipTxt: { fontSize: 13, color: COLORS.text, fontWeight: '600' },
  list: { padding: 12 },
  qCard: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, marginBottom: 8,
    borderLeftWidth: 3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
  },
  qTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  qLeft: { gap: 5, alignItems: 'flex-start' },
  qRight: { flexDirection: 'row', gap: 8, flex: 1, alignItems: 'flex-start', justifyContent: 'flex-end' },
  qText: { flex: 1, fontSize: 14, color: COLORS.text, textAlign: 'right', lineHeight: 21 },
  diffBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  diffBadgeTxt: { fontSize: 11, fontWeight: '700' },
  customBadge: { backgroundColor: COLORS.purpleLight, borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2 },
  customBadgeTxt: { fontSize: 10, color: COLORS.secondary, fontWeight: '600' },
  perfRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  perfBarBg: { flex: 1, height: 4, backgroundColor: COLORS.border, borderRadius: 2 },
  perfBarFill: { height: 4, borderRadius: 2 },
  perfTxt: { fontSize: 11, color: COLORS.textSecondary, minWidth: 55, textAlign: 'right' },
  qExpanded: { marginTop: 12, gap: 6 },
  optRow: { flexDirection: 'row', gap: 8, padding: 10, borderRadius: 10, backgroundColor: COLORS.background, alignItems: 'flex-start' },
  optRowCorrect: { backgroundColor: COLORS.successLight },
  optLetter: { fontSize: 13, fontWeight: '800', color: COLORS.textSecondary, minWidth: 18 },
  optText: { flex: 1, fontSize: 13, color: COLORS.text, textAlign: 'right', lineHeight: 19 },
  optTextCorrect: { color: COLORS.success, fontWeight: '600' },
  checkMark: { fontSize: 16, color: COLORS.success },
  explBox: { backgroundColor: '#FFFBEB', borderRadius: 10, padding: 12, gap: 5 },
  explTitle: { fontSize: 13, fontWeight: '700', color: COLORS.warning, textAlign: 'right' },
  explText: { fontSize: 13, color: COLORS.text, textAlign: 'right', lineHeight: 20 },
  empty: { alignItems: 'center', paddingVertical: 40, gap: 10 },
  emptyIcon: { fontSize: 42 },
  emptyText: { fontSize: 15, color: COLORS.textSecondary },
});
