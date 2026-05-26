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
  networking: { name: 'רשתות', icon: '🌐' },
  security: { name: 'אבטחה', icon: '🔒' },
  operatingSystems: { name: 'מערכות הפעלה', icon: '💻' },
  cloud: { name: 'ענן', icon: '☁️' },
  itManagement: { name: 'ניהול IT', icon: '📋' },
  protocols: { name: 'פרוטוקולים', icon: '🔄' },
};

interface Props {
  navigation: any;
  route: { params: { questions: Question[]; mode: QuizMode; chapterTitle?: string } };
}

export default function QuizScreen({ navigation, route }: Props) {
  const { questions, mode, chapterTitle } = route.params;
  const { dispatch, state } = useApp();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [startTime] = useState(Date.now());
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const question = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;
  const progress = (currentIndex + 1) / questions.length;

  function handleSelect(idx: number) {
    if (selected !== null) return;
    setSelected(idx);
    const newAnswers = { ...answers, [currentIndex]: idx };
    setAnswers(newAnswers);
    if (mode === 'study') setShowExplanation(true);
  }

  function handleNext() {
    if (isLast) {
      finishQuiz();
    } else {
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]).start();
      setCurrentIndex(i => i + 1);
      setSelected(null);
      setShowExplanation(false);
    }
  }

  function finishQuiz() {
    const score = questions.filter((q, i) => answers[i] === q.correctIndex).length;
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
      correct: answers[i] === q.correctIndex,
    }));

    const questionAnswers = questions.map((q, i) => ({
      id: q.id,
      correct: answers[i] === q.correctIndex,
    }));

    dispatch({ type: 'RECORD_QUIZ', payload: { entry, topicAnswers, questionAnswers } });
    navigation.replace('QuizResults', { questions, answers, score, duration, mode });
  }

  function handleExit() {
    Alert.alert('יציאה מהבחינה', 'הנתונים לא יישמרו. לצאת?', [
      { text: 'ביטול', style: 'cancel' },
      { text: 'יציאה', style: 'destructive', onPress: () => navigation.goBack() },
    ]);
  }

  const optionBg = (idx: number) => {
    if (selected === null) return COLORS.surface;
    if (idx === question.correctIndex) return COLORS.successLight;
    if (idx === selected) return COLORS.dangerLight;
    return COLORS.surface;
  };

  const optionBorder = (idx: number) => {
    if (selected === null) return COLORS.border;
    if (idx === question.correctIndex) return COLORS.success;
    if (idx === selected) return COLORS.danger;
    return COLORS.border;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={handleExit} style={styles.exitBtn}>
          <Text style={styles.exitText}>✕ יציאה</Text>
        </TouchableOpacity>
        <Text style={styles.counter}>{currentIndex + 1} / {questions.length}</Text>
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
              <Text style={styles.topicTag}>
                {TOPIC_INFO[question.topic]?.icon} {TOPIC_INFO[question.topic]?.name}
              </Text>
            </View>
            <Text style={styles.questionText}>{question.questionText}</Text>
          </View>

          {/* Options */}
          <View style={styles.optionsWrap}>
            {question.options.map((opt, idx) => (
              <TouchableOpacity
                key={idx}
                style={[styles.option, { backgroundColor: optionBg(idx), borderColor: optionBorder(idx) }]}
                onPress={() => handleSelect(idx)}
                disabled={selected !== null}
                activeOpacity={0.7}
              >
                <View style={[styles.optionCircle, selected !== null && idx === question.correctIndex && styles.optionCircleCorrect, selected !== null && idx === selected && idx !== question.correctIndex && styles.optionCircleWrong]}>
                  <Text style={styles.optionLetter}>{String.fromCharCode(65 + idx)}</Text>
                </View>
                <Text style={styles.optionText}>{opt}</Text>
                {selected !== null && idx === question.correctIndex && (
                  <Text style={styles.resultIcon}>✅</Text>
                )}
                {selected !== null && idx === selected && idx !== question.correctIndex && (
                  <Text style={styles.resultIcon}>❌</Text>
                )}
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
            <Text style={styles.bookmarkText}>
              {state.progress.bookmarkedQuestionIDs.includes(question.id) ? '🔖 שמור' : '📎 שמור שאלה'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      {/* Bottom button */}
      {selected !== null && (
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.nextBtn} onPress={handleNext} activeOpacity={0.85}>
            <Text style={styles.nextBtnText}>{isLast ? '📊 ראה תוצאות' : 'הבא ›'}</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10 },
  exitBtn: { padding: 6 },
  exitText: { color: COLORS.danger, fontSize: 14, fontWeight: '600' },
  counter: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  modeBadge: { backgroundColor: COLORS.primaryLight, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  modeText: { fontSize: 12, color: COLORS.primary, fontWeight: '600' },
  progressBg: { height: 5, backgroundColor: COLORS.border, marginHorizontal: 0 },
  progressFill: { height: 5, backgroundColor: COLORS.primary },
  scroll: { padding: 16, paddingBottom: 100 },
  questionCard: {
    backgroundColor: COLORS.surface, borderRadius: 18, padding: 20, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 4,
  },
  questionMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  topicTag: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '500' },
  questionText: { fontSize: 17, fontWeight: '700', color: COLORS.text, textAlign: 'right', lineHeight: 26 },
  optionsWrap: { gap: 10, marginBottom: 16 },
  option: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 14,
    borderWidth: 1.5,
  },
  optionCircle: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: COLORS.border, justifyContent: 'center', alignItems: 'center',
  },
  optionCircleCorrect: { backgroundColor: COLORS.success },
  optionCircleWrong: { backgroundColor: COLORS.danger },
  optionLetter: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  optionText: { flex: 1, fontSize: 15, color: COLORS.text, textAlign: 'right', lineHeight: 22 },
  resultIcon: { fontSize: 20 },
  explanation: {
    backgroundColor: '#FFF7ED', borderRadius: 14, padding: 16, marginBottom: 14,
    borderLeftWidth: 4, borderLeftColor: COLORS.warning,
  },
  explanationTitle: { fontSize: 14, fontWeight: '700', color: COLORS.warning, marginBottom: 6, textAlign: 'right' },
  explanationText: { fontSize: 14, color: COLORS.text, lineHeight: 22, textAlign: 'right' },
  bookmarkBtn: { alignItems: 'flex-end', paddingVertical: 8 },
  bookmarkText: { fontSize: 14, color: COLORS.textSecondary },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: COLORS.surface, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 10,
  },
  nextBtn: { backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 15, alignItems: 'center' },
  nextBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
