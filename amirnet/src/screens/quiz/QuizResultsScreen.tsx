import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView,
} from 'react-native';
import { COLORS } from '../../utils/colors';
import { Card, ScoreRing, StatCard } from '../../components/common';
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
  const ringColor = pct >= 80 ? COLORS.success : pct >= 60 ? COLORS.warning : COLORS.danger;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Score */}
        <Card style={styles.scoreCard}>
          <ScoreRing pct={pct} size={140} color={ringColor} />
          <Text style={styles.grade}>{grade}</Text>
          <Text style={styles.scoreDetail}>{score} מתוך {questions.length} תשובות נכונות</Text>
        </Card>

        {/* Stats */}
        <View style={styles.statsRow}>
          <StatCard value={String(score)} label="נכון ✅" color={COLORS.success} />
          <StatCard value={String(wrong)} label="שגוי ❌" color={COLORS.danger} />
          <StatCard value={fmt(duration)} label="זמן ⏱" color={COLORS.primary} />
        </View>

        {/* Answers review */}
        <View style={styles.reviewHeader}>
          <Text style={styles.reviewTitle}>סקירת תשובות</Text>
        </View>

        {questions.map((q, i) => {
          const sel = answers[i];
          const correct = sel === q.correctIndex;
          const isExpanded = expanded === i;
          return (
            <TouchableOpacity
              key={q.id}
              style={[styles.answerRow, !correct && styles.answerRowWrong]}
              onPress={() => setExpanded(isExpanded ? null : i)}
              activeOpacity={0.75}
            >
              <View style={styles.answerHeader}>
                <Text style={styles.answerChevron}>{isExpanded ? '▾' : '▸'}</Text>
                <Text style={[styles.answerIcon]}>{correct ? '✅' : '❌'}</Text>
                <Text style={styles.answerNum}>#{i + 1}</Text>
                <Text style={styles.answerQ} numberOfLines={isExpanded ? undefined : 2}>{q.questionText}</Text>
              </View>
              {isExpanded && (
                <View style={styles.answerDetails}>
                  {sel !== undefined && sel !== q.correctIndex && (
                    <Text style={styles.wrongAns}>תשובתך: {q.options[sel]}</Text>
                  )}
                  <Text style={styles.correctAns}>✅ נכון: {q.options[q.correctIndex]}</Text>
                  <View style={styles.explanBox}>
                    <Text style={styles.explanText}>💡 {q.explanation}</Text>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          );
        })}

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

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: 16 },
  scoreCard: { alignItems: 'center', gap: 10, paddingVertical: 28 },
  grade: { fontSize: 26, fontWeight: '800', color: COLORS.text },
  scoreDetail: { fontSize: 15, color: COLORS.textSecondary },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  reviewHeader: { marginBottom: 10 },
  reviewTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, textAlign: 'right' },
  answerRow: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, marginBottom: 8,
    borderLeftWidth: 3, borderLeftColor: COLORS.success,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
  },
  answerRowWrong: { borderLeftColor: COLORS.danger, backgroundColor: '#FFF8F8' },
  answerHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  answerChevron: { fontSize: 14, color: COLORS.textSecondary, paddingTop: 2 },
  answerIcon: { fontSize: 16 },
  answerNum: { fontSize: 12, fontWeight: '700', color: COLORS.textSecondary, paddingTop: 2 },
  answerQ: { flex: 1, fontSize: 14, color: COLORS.text, textAlign: 'right', lineHeight: 20 },
  answerDetails: { marginTop: 10, gap: 6 },
  wrongAns: { fontSize: 13, color: COLORS.danger, textAlign: 'right' },
  correctAns: { fontSize: 13, color: COLORS.success, fontWeight: '700', textAlign: 'right' },
  explanBox: { backgroundColor: '#FFF7ED', borderRadius: 10, padding: 10 },
  explanText: { fontSize: 13, color: COLORS.text, textAlign: 'right', lineHeight: 20 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  retryBtn: {
    flex: 1, backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 15, alignItems: 'center',
  },
  retryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  homeBtn: {
    flex: 1, backgroundColor: COLORS.border, borderRadius: 14, paddingVertical: 15, alignItems: 'center',
  },
  homeBtnText: { color: COLORS.text, fontSize: 16, fontWeight: '600' },
});
