import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView,
} from 'react-native';
import { useApp } from '../../store/AppContext';
import { COLORS, DIFFICULTY_COLORS, TOPIC_COLORS } from '../../utils/colors';
import { BUILT_IN_QUESTIONS } from '../../data/questions';

const SORT_OPTS = [
  { id: 'hardest',      label: '🔴 הקשה' },
  { id: 'easiest',      label: '🟢 הקל' },
  { id: 'most_answered', label: '📊 הנפוץ' },
];

const TOPIC_ICONS: Record<string, string> = {
  networking: '🌐', security: '🔒', operatingSystems: '💻',
  cloud: '☁️', itManagement: '📋', protocols: '🔄',
};

export default function QuestionPerformanceScreen({ navigation }: any) {
  const { state } = useApp();
  const [sort, setSort] = useState('hardest');

  const allQ = useMemo(() => [...BUILT_IN_QUESTIONS, ...state.customQuestions], [state.customQuestions]);

  const rows = useMemo(() => {
    const perf = state.progress.questionPerformance;
    return allQ
      .map(q => {
        const p = perf[q.id];
        const accuracy = p && p.timesAnswered > 0 ? p.timesCorrect / p.timesAnswered : null;
        return { q, p, accuracy };
      })
      .filter(x => x.p && x.p.timesAnswered > 0)
      .sort((a, b) => {
        if (sort === 'hardest')       return (a.accuracy ?? 0) - (b.accuracy ?? 0);
        if (sort === 'easiest')       return (b.accuracy ?? 1) - (a.accuracy ?? 1);
        return (b.p?.timesAnswered ?? 0) - (a.p?.timesAnswered ?? 0);
      });
  }, [allQ, state.progress.questionPerformance, sort]);

  const avgAccuracy = rows.length > 0
    ? Math.round((rows.reduce((s, x) => s + (x.accuracy ?? 0), 0) / rows.length) * 100)
    : 0;

  const hardCount = rows.filter(x => (x.accuracy ?? 1) < 0.5).length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>‹ חזרה</Text></TouchableOpacity>
        <Text style={styles.title}>ביצועי שאלות</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Stats strip */}
      <View style={styles.statsStrip}>
        <View style={styles.statCell}>
          <Text style={styles.statVal}>{rows.length}</Text>
          <Text style={styles.statLbl}>שאלות שנענו</Text>
        </View>
        <View style={styles.statDiv} />
        <View style={styles.statCell}>
          <Text style={[styles.statVal, { color: avgAccuracy >= 70 ? COLORS.success : COLORS.warning }]}>{avgAccuracy}%</Text>
          <Text style={styles.statLbl}>דיוק ממוצע</Text>
        </View>
        <View style={styles.statDiv} />
        <View style={styles.statCell}>
          <Text style={[styles.statVal, { color: COLORS.danger }]}>{hardCount}</Text>
          <Text style={styles.statLbl}>שאלות קשות</Text>
        </View>
      </View>

      {/* Sort tabs */}
      <View style={styles.sortRow}>
        {SORT_OPTS.map(s => (
          <TouchableOpacity
            key={s.id}
            style={[styles.sortTab, sort === s.id && styles.sortTabActive]}
            onPress={() => setSort(s.id)}
          >
            <Text style={[styles.sortTxt, sort === s.id && styles.sortTxtActive]}>{s.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {rows.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📊</Text>
          <Text style={styles.emptyTitle}>אין נתוני ביצועים</Text>
          <Text style={styles.emptySub}>ענה על שאלות כדי לראות ניתוח</Text>
        </View>
      ) : (
        <FlatList
          data={rows}
          keyExtractor={x => x.q.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item: x, index }) => {
            const pct = Math.round((x.accuracy ?? 0) * 100);
            const barColor = pct >= 70 ? COLORS.success : pct >= 40 ? COLORS.warning : COLORS.danger;
            const topicColor = TOPIC_COLORS[x.q.topic] || COLORS.primary;
            return (
              <View style={[styles.qRow, { borderLeftColor: topicColor }]}>
                <View style={styles.qLeft}>
                  <View style={[styles.rankBadge]}>
                    <Text style={styles.rankNum}>{index + 1}</Text>
                  </View>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.qMeta}>
                    <Text style={styles.qTopic}>{TOPIC_ICONS[x.q.topic]}</Text>
                    <Text style={[styles.qDiff, { color: DIFFICULTY_COLORS[x.q.difficulty] }]}>
                      {x.q.difficulty === 'easy' ? 'קל' : x.q.difficulty === 'medium' ? 'בינוני' : 'קשה'}
                    </Text>
                    <Text style={styles.qAnswered}>{x.p?.timesAnswered}× נענה</Text>
                  </View>
                  <Text style={styles.qText} numberOfLines={2}>{x.q.questionText}</Text>
                  <View style={styles.barBg}>
                    <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: barColor }]} />
                  </View>
                </View>
                <View style={[styles.pctBadge, { backgroundColor: barColor + '20' }]}>
                  <Text style={[styles.pctTxt, { color: barColor }]}>{pct}%</Text>
                </View>
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  back: { color: COLORS.primary, fontSize: 15, fontWeight: '600' },
  title: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  statsStrip: {
    flexDirection: 'row', backgroundColor: COLORS.surface, marginHorizontal: 16, borderRadius: 16,
    padding: 14, marginBottom: 12, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },
  statCell: { flex: 1, alignItems: 'center', gap: 3 },
  statDiv: { width: 1, height: 36, backgroundColor: COLORS.border },
  statVal: { fontSize: 22, fontWeight: '800', color: COLORS.primary },
  statLbl: { fontSize: 11, color: COLORS.textSecondary, textAlign: 'center' },
  sortRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 8 },
  sortTab: { flex: 1, paddingVertical: 9, borderRadius: 12, backgroundColor: COLORS.surface, alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.border },
  sortTabActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  sortTxt: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary },
  sortTxtActive: { color: '#fff' },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 10 },
  emptyIcon: { fontSize: 52 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: COLORS.textSecondary },
  emptySub: { fontSize: 13, color: COLORS.textTertiary },
  qRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 12, marginBottom: 8,
    borderLeftWidth: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
  },
  qLeft: { alignItems: 'center', gap: 4 },
  rankBadge: { width: 26, height: 26, borderRadius: 8, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' },
  rankNum: { fontSize: 11, fontWeight: '700', color: COLORS.textSecondary },
  qMeta: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginBottom: 4 },
  qTopic: { fontSize: 13 },
  qDiff: { fontSize: 11, fontWeight: '700' },
  qAnswered: { fontSize: 11, color: COLORS.textSecondary },
  qText: { fontSize: 13, color: COLORS.text, textAlign: 'right', lineHeight: 18, marginBottom: 6 },
  barBg: { height: 5, backgroundColor: COLORS.border, borderRadius: 3 },
  barFill: { height: 5, borderRadius: 3 },
  pctBadge: { borderRadius: 12, paddingHorizontal: 8, paddingVertical: 5, minWidth: 46, alignItems: 'center' },
  pctTxt: { fontSize: 14, fontWeight: '800' },
});
