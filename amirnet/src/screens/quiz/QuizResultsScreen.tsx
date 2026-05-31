import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView,
} from 'react-native';
import { COLORS } from '../../utils/colors';
import { Question } from '../../types';

interface Props {
  navigation: any;
  route: { params: { questions: Question[]; answers: Record<number, number>; score: number; duration: number; mode: string } };
}

function fmt(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function QuizResultsScreen({ navigation, route }: Props) {
  const { questions, answers, score, duration, mode } = route.params;
  const [expanded, setExpanded] = useState<number | null>(null);

  const pct = questions.length > 0 ? (score / questions.length) * 100 : 0;
  const wrong = questions.length - score;
  const grade = pct >= 90 ? 'מצוין! 🌟' : pct >= 75 ? 'טוב מאוד 👍' : pct >= 60 ? 'טוב ✓' : pct >= 50 ? 'עובר' : 'נסה שוב 🔄';
  const headerBg = pct >= 75 ? COLORS.success : pct >= 50 ? COLORS.warning : COLORS.danger;
  const passed = pct >= 70;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Score Hero */}
        <View style={[styles.scoreHero, { backgroundColor: headerBg }]}>
          <View style={styles.scoreRingOuter}>
            <View style={styles.scoreRingInner}>
              <Text style={[styles.scorePct, { color: headerBg }]}>{Math.round(pct)}%</Text>
            </View>
          </View>
          <Text style={styles.scoreGrade}>{grade}</Text>
          <Text style={styles.scoreDetail}>{score} מתוך {questions.length} תשובות נכונות</Text>
        </View>

        {/* Stats strip */}
        <View style={styles.statsStrip}>
          <View style={styles.statCell}>
            <Text style={[styles.statVal, { color: COLORS.success }]}>{score}</Text>
            <Text style={styles.statLbl}>נכון ✅</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCell}>
            <Text style={[styles.statVal, { color: COLORS.danger }]}>{wrong}</Text>
            <Text style={styles.statLbl}>שגוי ❌</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCell}>
            <Text style={[styles.statVal, { color: COLORS.primary }]}>{fmt(duration)}</Text>
            <Text style={styles.statLbl}>זמן ⏱</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCell}>
            <Text style={[styles.statVal, { color: passed ? COLORS.success : COLORS.danger }]}>
              {passed ? 'עבר' : 'נכשל'}
            </Text>
            <Text style={styles.statLbl}>סטטוס</Text>
          </View>
        </View>

        {/* Action buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => navigation.navigate('QuizSetup')}
            activeOpacity={0.85}
          >
            <Text style={styles.retryBtnText}>🔄 בחינה חדשה</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.homeBtn}
            onPress={() => navigation.navigate('Home')}
            activeOpacity={0.85}
          >
            <Text style={styles.homeBtnText}>🏠 בית</Text>
          </TouchableOpacity>
        </View>

        {/* Answers review */}
        <Text style={styles.reviewTitle}>סקירת תשובות</Text>

        {questions.map((q, i) => {
          const sel = answers[i];
          const correct = sel === q.correctIndex;
          const isExpanded = expanded === i;
          return (
            <TouchableOpacity
              key={q.id}
              style={[styles.answerRow, { borderLeftColor: correct ? COLORS.success : COLORS.danger }]}
              onPress={() => setExpanded(isExpanded ? null : i)}
              activeOpacity={0.75}
            >
              <View style={styles.answerHeader}>
                <Text style={styles.answerChevron}>{isExpanded ? '▾' : '▸'}</Text>
                <View style={[styles.answerNumBadge, { backgroundColor: correct ? COLORS.successLight : COLORS.dangerLight }]}>
                  <Text style={[styles.answerNumTxt, { color: correct ? COLORS.success : COLORS.danger }]}>
                    {correct ? '✓' : '✗'}
                  </Text>
                </View>
                <Text style={styles.answerQ} numberOfLines={isExpanded ? undefined : 2}>{q.questionText}</Text>
              </View>
              {isExpanded && (
                <View style={styles.answerDetails}>
                  {sel !== undefined && sel !== q.correctIndex && (
                    <View style={styles.wrongRow}>
                      <Text style={styles.wrongAns}>❌ תשובתך: {q.options[sel]}</Text>
                    </View>
                  )}
                  <View style={styles.correctRow}>
                    <Text style={styles.correctAns}>✅ נכון: {q.options[q.correctIndex]}</Text>
                  </View>
                  {q.explanation ? (
                    <View style={styles.explanBox}>
                      <Text style={styles.explanText}>💡 {q.explanation}</Text>
                    </View>
                  ) : null}
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { paddingBottom: 20 },
  scoreHero: {
    alignItems: 'center', paddingTop: 32, paddingBottom: 28, gap: 10,
    borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
  },
  scoreRingOuter: {
    width: 130, height: 130, borderRadius: 65,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center', alignItems: 'center',
  },
  scoreRingInner: {
    width: 106, height: 106, borderRadius: 53,
    backgroundColor: '#fff',
    justifyContent: 'center', alignItems: 'center',
  },
  scorePct: { fontSize: 30, fontWeight: '800' },
  scoreGrade: { fontSize: 24, fontWeight: '800', color: '#fff' },
  scoreDetail: { fontSize: 14, color: 'rgba(255,255,255,0.85)' },
  statsStrip: {
    flexDirection: 'row', backgroundColor: COLORS.surface,
    marginHorizontal: 16, borderRadius: 16, padding: 14,
    marginTop: 16, marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6, elevation: 3,
  },
  statCell: { flex: 1, alignItems: 'center', gap: 3 },
  statDivider: { width: 1, backgroundColor: COLORS.border },
  statVal: { fontSize: 18, fontWeight: '800' },
  statLbl: { fontSize: 10, color: COLORS.textSecondary },
  actions: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginBottom: 20 },
  retryBtn: {
    flex: 1, backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 14, alignItems: 'center',
  },
  retryBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  homeBtn: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: 14, paddingVertical: 14, alignItems: 'center',
    borderWidth: 1.5, borderColor: COLORS.border,
  },
  homeBtnText: { color: COLORS.text, fontSize: 15, fontWeight: '600' },
  reviewTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, textAlign: 'right', paddingHorizontal: 16, marginBottom: 10 },
  answerRow: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, marginBottom: 8,
    marginHorizontal: 16, borderLeftWidth: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
  },
  answerHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  answerChevron: { fontSize: 14, color: COLORS.textSecondary, paddingTop: 3 },
  answerNumBadge: { width: 26, height: 26, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  answerNumTxt: { fontSize: 13, fontWeight: '800' },
  answerQ: { flex: 1, fontSize: 14, color: COLORS.text, textAlign: 'right', lineHeight: 20 },
  answerDetails: { marginTop: 10, gap: 8 },
  wrongRow: { backgroundColor: COLORS.dangerLight, borderRadius: 8, padding: 8 },
  wrongAns: { fontSize: 13, color: COLORS.danger, textAlign: 'right', fontWeight: '600' },
  correctRow: { backgroundColor: COLORS.successLight, borderRadius: 8, padding: 8 },
  correctAns: { fontSize: 13, color: COLORS.success, fontWeight: '700', textAlign: 'right' },
  explanBox: { backgroundColor: '#FFFBEB', borderRadius: 10, padding: 10 },
  explanText: { fontSize: 13, color: COLORS.text, textAlign: 'right', lineHeight: 20 },
});
