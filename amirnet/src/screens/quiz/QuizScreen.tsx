import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, Alert, Animated,
} from 'react-native';
import { useApp } from '../../store/AppContext';
import { COLORS } from '../../utils/colors';
import { DifficultyBadge } from '../../components/common';
import { Question, QuizMode, QuizHistoryEntry, TopicID } from '../../types';
import { generateId } from '../../utils/hashUtils';

const TOPIC_INFO: Record<string, { name: string; icon: string }> = {
  networking:       { name: 'רשתות',          icon: '🌐' },
  security:         { name: 'אבטחה',           icon: '🔒' },
  operatingSystems: { name: 'מערכות הפעלה',    icon: '💻' },
  cloud:            { name: 'ענן',              icon: '☁️' },
  itManagement:     { name: 'ניהול IT',         icon: '📋' },
  protocols:        { name: 'פרוטוקולים',       icon: '🔄' },
};

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

interface Props {
  navigation: any;
  route: { params: { questions: Question[]; mode: QuizMode; chapterTitle?: string } };
}

export default function QuizScreen({ navigation, route }: Props) {
  const { questions, mode } = route.params;
  const { dispatch, state } = useApp();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [startTime] = useState(Date.now());
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const question = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;
  const progress = questions.length > 0 ? (currentIndex + 1) / questions.length : 0;

  if (!question) return null;

  function handleSelect(idx: number) {
    if (selected !== null) return;
    setSelected(idx);
    setAnswers(prev => ({ ...prev, [currentIndex]: idx }));
    if (mode === 'study') setShowExplanation(true);
  }

  function handleNext() {
    if (isLast) {
      finishQuiz();
    } else {
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 0, duration: 140, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 140, useNativeDriver: true }),
      ]).start();
      setCurrentIndex(i => i + 1);
      setSelected(null);
      setShowExplanation(false);
    }
  }

  function finishQuiz() {
    const finalAnswers = { ...answers };
    const score = questions.filter((q, i) => finalAnswers[i] === q.correctIndex).length;
    const duration = (Date.now() - startTime) / 1000;

    const entry: QuizHistoryEntry = {
      id: generateId(),
      date: new Date().toISOString(),
      score,
      total: questions.length,
      topicID: questions[0]?.topic as TopicID,
      durationSeconds: duration,
    };

    const topicAnswers = questions.map((q, i) => ({
      topicID: q.topic,
      correct: finalAnswers[i] === q.correctIndex,
    }));

    const questionAnswers = questions.map((q, i) => ({
      id: q.id,
      correct: finalAnswers[i] === q.correctIndex,
    }));

    dispatch({ type: 'RECORD_QUIZ', payload: { entry, topicAnswers, questionAnswers } });
    navigation.replace('QuizResults', { questions, answers: finalAnswers, score, duration, mode });
  }

  function handleExit() {
    Alert.alert('יציאה מהבחינה', 'הנתונים לא יישמרו. לצאת?', [
      { text: 'ביטול', style: 'cancel' },
      { text: 'יציאה', style: 'destructive', onPress: () => navigation.goBack() },
    ]);
  }

  const getOptionStyle = (idx: number) => {
    if (selected === null) return {};
    if (idx === question.correctIndex) return { backgroundColor: COLORS.successLight, borderColor: COLORS.success };
    if (idx === selected) return { backgroundColor: COLORS.dangerLight, borderColor: COLORS.danger };
    return { opacity: 0.5 };
  };

  const getCircleStyle = (idx: number) => {
    if (selected === null) return {};
    if (idx === question.correctIndex) return { backgroundColor: COLORS.success };
    if (idx === selected) return { backgroundColor: COLORS.danger };
    return {};
  };

  const isBookmarked = state.progress.bookmarkedQuestionIDs.includes(question.id);

  return (
    <SafeAreaView style={styles.container}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={handleExit} style={styles.exitBtn}>
          <Text style={styles.exitText}>✕</Text>
        </TouchableOpacity>
        <View style={styles.counterWrap}>
          <Text style={styles.counter}>{currentIndex + 1}</Text>
          <Text style={styles.counterTotal}> / {questions.length}</Text>
        </View>
        <View style={styles.modeBadge}>
          <Text style={styles.modeText}>{mode === 'study' ? '💡 לימוד' : '📋 בחינה'}</Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressBg}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Question card */}
          <View style={styles.questionCard}>
            <View style={styles.questionMeta}>
              <DifficultyBadge difficulty={question.difficulty} />
              <View style={styles.topicChip}>
                <Text style={styles.topicChipTxt}>
                  {TOPIC_INFO[question.topic]?.icon} {TOPIC_INFO[question.topic]?.name}
                </Text>
              </View>
            </View>
            <Text style={styles.questionText}>{question.questionText}</Text>
          </View>

          {/* Options */}
          <View style={styles.optionsWrap}>
            {question.options.map((opt, idx) => (
              <TouchableOpacity
                key={idx}
                style={[styles.option, getOptionStyle(idx)]}
                onPress={() => handleSelect(idx)}
                disabled={selected !== null}
                activeOpacity={0.72}
              >
                <View style={[styles.optionCircle, getCircleStyle(idx)]}>
                  <Text style={[styles.optionLetter, selected !== null && (idx === question.correctIndex || idx === selected) && { color: '#fff' }]}>
                    {OPTION_LABELS[idx]}
                  </Text>
                </View>
                <Text style={styles.optionText}>{opt}</Text>
                {selected !== null && idx === question.correctIndex && <Text style={styles.resultIcon}>✅</Text>}
                {selected !== null && idx === selected && idx !== question.correctIndex && <Text style={styles.resultIcon}>❌</Text>}
              </TouchableOpacity>
            ))}
          </View>

          {/* Explanation (study mode) */}
          {showExplanation && (
            <View style={styles.explanation}>
              <Text style={styles.explanationTitle}>💡 הסבר</Text>
              <Text style={styles.explanationText}>{question.explanation}</Text>
            </View>
          )}

          {/* Bookmark */}
          <TouchableOpacity
            style={styles.bookmarkBtn}
            onPress={() => dispatch({ type: 'TOGGLE_BOOKMARK', payload: question.id })}
          >
            <Text style={[styles.bookmarkText, isBookmarked && styles.bookmarkTextActive]}>
              {isBookmarked ? '🔖 שמור' : '📎 שמור שאלה'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      {/* Bottom button */}
      {selected !== null && (
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.nextBtn} onPress={handleNext} activeOpacity={0.85}>
            <Text style={styles.nextBtnText}>{isLast ? '📊 ראה תוצאות' : 'שאלה הבאה ›'}</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  exitBtn: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: COLORS.dangerLight, justifyContent: 'center', alignItems: 'center',
  },
  exitText: { color: COLORS.danger, fontSize: 16, fontWeight: '700' },
  counterWrap: { flexDirection: 'row', alignItems: 'baseline' },
  counter: { fontSize: 22, fontWeight: '800', color: COLORS.text },
  counterTotal: { fontSize: 15, color: COLORS.textSecondary, fontWeight: '600' },
  modeBadge: { backgroundColor: COLORS.primaryLight, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 },
  modeText: { fontSize: 12, color: COLORS.primary, fontWeight: '700' },
  progressBg: { height: 4, backgroundColor: COLORS.border },
  progressFill: { height: 4, backgroundColor: COLORS.primary },
  scroll: { padding: 16, paddingBottom: 110 },
  questionCard: {
    backgroundColor: COLORS.surface, borderRadius: 20, padding: 20, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.09, shadowRadius: 10, elevation: 5,
  },
  questionMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  topicChip: {
    backgroundColor: COLORS.background, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4,
  },
  topicChipTxt: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '600' },
  questionText: { fontSize: 17, fontWeight: '700', color: COLORS.text, textAlign: 'right', lineHeight: 27 },
  optionsWrap: { gap: 10, marginBottom: 16 },
  option: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.surface, borderRadius: 16, padding: 16,
    borderWidth: 1.5, borderColor: COLORS.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  optionCircle: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },
  optionLetter: { fontSize: 15, fontWeight: '800', color: COLORS.textSecondary },
  optionText: { flex: 1, fontSize: 15, color: COLORS.text, textAlign: 'right', lineHeight: 22 },
  resultIcon: { fontSize: 20 },
  explanation: {
    backgroundColor: '#FFFBEB', borderRadius: 16, padding: 16, marginBottom: 14,
    borderWidth: 1, borderColor: COLORS.warning + '40',
  },
  explanationTitle: { fontSize: 14, fontWeight: '800', color: COLORS.warning, marginBottom: 8, textAlign: 'right' },
  explanationText: { fontSize: 14, color: COLORS.text, lineHeight: 22, textAlign: 'right' },
  bookmarkBtn: { alignSelf: 'flex-end', paddingVertical: 8, paddingHorizontal: 12 },
  bookmarkText: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '600' },
  bookmarkTextActive: { color: COLORS.primary },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: COLORS.surface, padding: 16, paddingBottom: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 10,
  },
  nextBtn: { backgroundColor: COLORS.primary, borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  nextBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
