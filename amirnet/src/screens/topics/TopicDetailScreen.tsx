import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  SafeAreaView, TextInput,
} from 'react-native';
import { useApp } from '../../store/AppContext';
import { COLORS, TOPIC_COLORS } from '../../utils/colors';
import { DifficultyBadge, Card } from '../../components/common';
import { BUILT_IN_QUESTIONS } from '../../data/questions';
import { Question, Difficulty } from '../../types';

const TOPIC_INFO: Record<string, { name: string; icon: string }> = {
  networking: { name: 'רשתות תקשורת', icon: '🌐' },
  security: { name: 'אבטחת מידע', icon: '🔒' },
  operatingSystems: { name: 'מערכות הפעלה', icon: '💻' },
  cloud: { name: 'ענן ווירטואליזציה', icon: '☁️' },
  itManagement: { name: 'ניהול IT', icon: '📋' },
  protocols: { name: 'פרוטוקולים', icon: '🔄' },
};

export default function TopicDetailScreen({ navigation, route }: any) {
  const { topicID } = route.params;
  const { state, dispatch } = useApp();

  const [search, setSearch] = useState('');
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

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: color + '15' }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Text style={styles.backText}>‹ חזרה</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerIcon}>{topicInfo?.icon}</Text>
          <Text style={styles.headerTitle}>{topicInfo?.name}</Text>
          <Text style={styles.headerSub}>{allQ.length} שאלות · {pct > 0 ? `${pct}% הצלחה` : 'טרם נתרגל'}</Text>
        </View>
        <TouchableOpacity
          style={[styles.practiceBtn, { backgroundColor: color }]}
          onPress={() => navigation.navigate('QuizSetup', { topicID })}
        >
          <Text style={styles.practiceBtnText}>תרגל נושא</Text>
        </TouchableOpacity>
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
        <View style={styles.diffRow}>
          {(['all', 'easy', 'medium', 'hard'] as const).map(d => (
            <TouchableOpacity
              key={d}
              style={[styles.diffChip, diffFilter === d && styles.diffChipActive]}
              onPress={() => setDiffFilter(d)}
            >
              <Text style={[styles.diffChipText, diffFilter === d && styles.diffChipTextActive]}>
                {d === 'all' ? 'הכל' : d === 'easy' ? 'קל' : d === 'medium' ? 'בינוני' : 'קשה'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={q => q.id}
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item: q }) => {
          const expanded = expandedID === q.id;
          const bookmarked = state.progress.bookmarkedQuestionIDs.includes(q.id);
          const perf = state.progress.questionPerformance[q.id];
          return (
            <TouchableOpacity
              style={styles.qCard}
              onPress={() => setExpandedID(expanded ? null : q.id)}
              activeOpacity={0.75}
            >
              <View style={styles.qCardTop}>
                <View style={styles.qCardLeft}>
                  <DifficultyBadge difficulty={q.difficulty} />
                  {q.isCustom && (
                    <View style={styles.customBadge}><Text style={styles.customBadgeTxt}>מותאם</Text></View>
                  )}
                </View>
                <View style={styles.qCardRight}>
                  <TouchableOpacity onPress={() => dispatch({ type: 'TOGGLE_BOOKMARK', payload: q.id })}>
                    <Text style={{ fontSize: 18 }}>{bookmarked ? '🔖' : '📎'}</Text>
                  </TouchableOpacity>
                  <Text style={styles.qText} numberOfLines={expanded ? undefined : 2}>{q.questionText}</Text>
                </View>
              </View>

              {perf && perf.timesAnswered > 0 && (
                <Text style={styles.perfText}>
                  ✅ {perf.timesCorrect}/{perf.timesAnswered} פעמים נכון
                </Text>
              )}

              {expanded && (
                <View style={styles.qExpanded}>
                  {q.options.map((opt, idx) => (
                    <View
                      key={idx}
                      style={[styles.optRow, idx === q.correctIndex && styles.optRowCorrect]}
                    >
                      <Text style={[styles.optText, idx === q.correctIndex && styles.optTextCorrect]}>
                        {String.fromCharCode(65 + idx)}. {opt}
                      </Text>
                      {idx === q.correctIndex && <Text>✓</Text>}
                    </View>
                  ))}
                  <View style={styles.explBox}>
                    <Text style={styles.explText}>💡 {q.explanation}</Text>
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
  header: { padding: 16, gap: 10 },
  back: { alignSelf: 'flex-start' },
  backText: { color: COLORS.primary, fontSize: 15 },
  headerContent: { alignItems: 'center', gap: 4 },
  headerIcon: { fontSize: 40 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: COLORS.text },
  headerSub: { fontSize: 13, color: COLORS.textSecondary },
  practiceBtn: { borderRadius: 12, paddingVertical: 10, paddingHorizontal: 20, alignItems: 'center' },
  practiceBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  controls: { padding: 12, gap: 8 },
  searchInput: {
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 10,
    fontSize: 15, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border,
  },
  diffRow: { flexDirection: 'row', gap: 6 },
  diffChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  diffChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  diffChipText: { fontSize: 13, color: COLORS.text, fontWeight: '600' },
  diffChipTextActive: { color: '#fff' },
  qCard: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, marginBottom: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
  },
  qCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  qCardLeft: { gap: 4, alignItems: 'flex-end' },
  qCardRight: { flexDirection: 'row', gap: 8, flex: 1, alignItems: 'flex-start', justifyContent: 'flex-end' },
  qText: { flex: 1, fontSize: 14, color: COLORS.text, textAlign: 'right', lineHeight: 20 },
  customBadge: { backgroundColor: COLORS.purpleLight, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  customBadgeTxt: { fontSize: 10, color: COLORS.secondary, fontWeight: '600' },
  perfText: { fontSize: 11, color: COLORS.textSecondary, textAlign: 'right', marginTop: 4 },
  qExpanded: { marginTop: 12, gap: 6 },
  optRow: { padding: 8, borderRadius: 8, backgroundColor: COLORS.background, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  optRowCorrect: { backgroundColor: COLORS.successLight },
  optText: { fontSize: 13, color: COLORS.text, textAlign: 'right', flex: 1 },
  optTextCorrect: { color: COLORS.success, fontWeight: '700' },
  explBox: { backgroundColor: '#FFF7ED', borderRadius: 10, padding: 10 },
  explText: { fontSize: 13, color: COLORS.text, textAlign: 'right', lineHeight: 20 },
  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyIcon: { fontSize: 40, marginBottom: 10 },
  emptyText: { fontSize: 16, color: COLORS.textSecondary },
});
