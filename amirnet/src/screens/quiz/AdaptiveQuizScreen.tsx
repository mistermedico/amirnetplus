import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, Alert,
} from 'react-native';
import { useApp } from '../../store/AppContext';
import { COLORS } from '../../utils/colors';
import { DifficultyBadge, ScoreRing, ProgressBar } from '../../components/common';
import { Question, TopicID, QuizHistoryEntry } from '../../types';
import {
  AdaptiveState, initialAdaptiveState, selectNextQuestion,
  updateAbilityScore, abilityLabel, abilityPercent,
} from '../../utils/adaptive';
import { generateId } from '../../utils/hashUtils';
import { BUILT_IN_QUESTIONS } from '../../data/questions';

const MAX_Q = 20;

const TOPIC_INFO: Record<string, { name: string; icon: string }> = {
  networking: { name: 'רשתות', icon: '🌐' },
  security: { name: 'אבטחה', icon: '🔒' },
  operatingSystems: { name: 'מערכות הפעלה', icon: '💻' },
  cloud: { name: 'ענן', icon: '☁️' },
  itManagement: { name: 'ניהול IT', icon: '📋' },
  protocols: { name: 'פרוטוקולים', icon: '🔄' },
};

interface SetupProps { navigation: any; route?: any }
interface QuizProps { navigation: any; route: { params: { topicID?: TopicID; includeCustom: boolean } } }

// ─── Setup Screen ─────────────────────────────────────────────────────────────

export function AdaptiveSetupScreen({ navigation }: SetupProps) {
  const [topicID, setTopicID] = useState<TopicID | undefined>(undefined);
  const [includeCustom, setIncludeCustom] = useState(true);
  const { state } = useApp();

  const topicCount = state.customQuestions.length;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.heroWrap}>
          <Text style={styles.heroIcon}>🧠</Text>
          <Text style={styles.heroTitle}>מבחן אדפטיבי</Text>
          <Text style={styles.heroSub}>
            המבחן מתאים את רמת הקושי בזמן אמת לפי ביצועיך.
            ענה על שאלות והמערכת תבחר את הבאה בהתאם לרמתך.
          </Text>
        </View>

        <Text style={styles.sectionLabel}>בחר נושא (אופציונלי)</Text>
        {[
          { id: undefined, name: 'כל הנושאים', icon: '🌍' },
          ...Object.entries(TOPIC_INFO).map(([id, info]) => ({ id: id as TopicID, ...info })),
        ].map(t => (
          <TouchableOpacity
            key={String(t.id)}
            style={[styles.topicBtn, topicID === t.id && styles.topicBtnActive]}
            onPress={() => setTopicID(t.id)}
          >
            <Text style={styles.topicBtnIcon}>{t.icon}</Text>
            <Text style={[styles.topicBtnText, topicID === t.id && { color: COLORS.primary }]}>{t.name}</Text>
            {topicID === t.id && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>
        ))}

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>📊 {MAX_Q} שאלות · רמת קושי דינמית · מסתיים אוטומטית</Text>
        </View>

        <TouchableOpacity
          style={styles.startBtn}
          onPress={() => navigation.navigate('AdaptiveQuiz', { topicID, includeCustom })}
          activeOpacity={0.85}
        >
          <Text style={styles.startBtnText}>התחל מבחן אדפטיבי 🚀</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Quiz Screen ──────────────────────────────────────────────────────────────

export default function AdaptiveQuizScreen({ navigation, route }: QuizProps) {
  const { topicID, includeCustom } = route.params;
  const { state, dispatch } = useApp();
  const [startTime] = useState(Date.now());

  const pool: Question[] = [
    ...BUILT_IN_QUESTIONS.filter(q => !topicID || q.topic === topicID),
    ...(includeCustom ? state.customQuestions.filter(q => !topicID || q.topic === topicID) : []),
  ];

  const [adaptState, setAdaptState] = useState<AdaptiveState>(initialAdaptiveState());
  const [currentQ, setCurrentQ] = useState<Question | null>(() =>
    selectNextQuestion(pool, initialAdaptiveState(), {})
  );
  const [selected, setSelected] = useState<number | null>(null);
  const [showExpl, setShowExpl] = useState(false);
  const [finished, setFinished] = useState(false);
  const [finalScore, setFinalScore] = useState({ correct: 0, total: 0 });

  function handleSelect(idx: number) {
    if (selected !== null || !currentQ) return;
    setSelected(idx);
    setShowExpl(true);

    const isCorrect = idx === currentQ.correctIndex;
    const newScore = updateAbilityScore(adaptState.abilityScore, currentQ.difficulty, isCorrect);
    const newAnsweredIDs = new Set([...adaptState.answeredIDs, currentQ.id]);
    const newHistory = [
      ...adaptState.history,
      { question: currentQ, selected: idx, correct: isCorrect },
    ];
    const newState: AdaptiveState = { abilityScore: newScore, answeredIDs: newAnsweredIDs, history: newHistory };
    setAdaptState(newState);

    if (newHistory.length >= MAX_Q) {
      setTimeout(() => finishQuiz(newHistory), 1200);
    }
  }

  function handleNext() {
    if (adaptState.history.length >= MAX_Q) { finishQuiz(adaptState.history); return; }
    const next = selectNextQuestion(pool, adaptState, state.progress.questionPerformance);
    if (!next) { finishQuiz(adaptState.history); return; }
    setCurrentQ(next);
    setSelected(null);
    setShowExpl(false);
  }

  function finishQuiz(history: typeof adaptState.history) {
    const correct = history.filter(h => h.correct).length;
    const total = history.length;
    setFinalScore({ correct, total });
    setFinished(true);

    const duration = (Date.now() - startTime) / 1000;
    const entry: QuizHistoryEntry = {
      id: generateId(),
      date: new Date().toISOString(),
      score: correct,
      total,
      topicID,
      durationSeconds: duration,
      isAdaptive: true,
    };
    const topicAnswers = history.map(h => ({ topicID: h.question.topic, correct: h.correct }));
    const questionAnswers = history.map(h => ({ id: h.question.id, correct: h.correct }));
    dispatch({ type: 'RECORD_QUIZ', payload: { entry, topicAnswers, questionAnswers } });
  }

  if (finished) {
    return <AdaptiveResults
      history={adaptState.history}
      abilityScore={adaptState.abilityScore}
      score={finalScore.correct}
      total={finalScore.total}
      navigation={navigation}
    />;
  }

  if (!currentQ) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 18, color: COLORS.textSecondary }}>אין שאלות זמינות לנושא זה</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.startBtn}>
            <Text style={styles.startBtnText}>חזור</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const qNum = adaptState.history.length + 1;
  const abilityPct = abilityPercent(adaptState.abilityScore);

  return (
    <SafeAreaView style={styles.container}>
      {/* Top */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => {
          Alert.alert('יציאה', 'לצאת מהמבחן? ההתקדמות תאבד.', [
            { text: 'ביטול', style: 'cancel' },
            { text: 'יציאה', onPress: () => navigation.goBack() },
          ]);
        }}>
          <Text style={styles.exitText}>✕</Text>
        </TouchableOpacity>
        <View style={styles.topCenter}>
          <Text style={styles.topCounter}>{qNum} / {MAX_Q}</Text>
          <Text style={styles.topAbility}>רמה: {abilityLabel(adaptState.abilityScore)}</Text>
        </View>
        <View style={styles.abilityBar}>
          <ProgressBar value={abilityPct} total={100} color={COLORS.secondary} height={6} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.questionCard}>
          <View style={styles.qMeta}>
            <DifficultyBadge difficulty={currentQ.difficulty} />
            <Text style={styles.qTopic}>{TOPIC_INFO[currentQ.topic]?.icon} {TOPIC_INFO[currentQ.topic]?.name}</Text>
          </View>
          <Text style={styles.qText}>{currentQ.questionText}</Text>
        </View>

        <View style={styles.optionsWrap}>
          {currentQ.options.map((opt, idx) => {
            const bg = selected === null ? COLORS.surface
              : idx === currentQ.correctIndex ? COLORS.successLight
              : idx === selected ? COLORS.dangerLight : COLORS.surface;
            const border = selected === null ? COLORS.border
              : idx === currentQ.correctIndex ? COLORS.success
              : idx === selected ? COLORS.danger : COLORS.border;
            return (
              <TouchableOpacity
                key={idx}
                style={[styles.option, { backgroundColor: bg, borderColor: border }]}
                onPress={() => handleSelect(idx)}
                disabled={selected !== null}
                activeOpacity={0.7}
              >
                <View style={[styles.optCircle, idx === currentQ.correctIndex && selected !== null && styles.optCircleOk, idx === selected && idx !== currentQ.correctIndex && styles.optCircleBad]}>
                  <Text style={styles.optLetter}>{String.fromCharCode(65 + idx)}</Text>
                </View>
                <Text style={styles.optText}>{opt}</Text>
                {selected !== null && idx === currentQ.correctIndex && <Text>✅</Text>}
                {selected !== null && idx === selected && idx !== currentQ.correctIndex && <Text>❌</Text>}
              </TouchableOpacity>
            );
          })}
        </View>

        {showExpl && (
          <View style={styles.expl}>
            <Text style={styles.explTitle}>💡 הסבר</Text>
            <Text style={styles.explText}>{currentQ.explanation}</Text>
          </View>
        )}

        {selected !== null && qNum < MAX_Q && (
          <TouchableOpacity style={styles.nextBtn} onPress={handleNext} activeOpacity={0.85}>
            <Text style={styles.nextBtnText}>השאלה הבאה ›</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Results ──────────────────────────────────────────────────────────────────

function AdaptiveResults({ history, abilityScore, score, total, navigation }: any) {
  const pct = total > 0 ? (score / total) * 100 : 0;
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.resultsHero}>
          <ScoreRing pct={pct} size={140} />
          <Text style={styles.resultsTitle}>המבחן הסתיים!</Text>
          <Text style={styles.resultsScore}>{score} / {total} נכון</Text>
          <View style={styles.abilityWrap}>
            <Text style={styles.abilityTitle}>רמת היכולת שלך:</Text>
            <Text style={styles.abilityValue}>{abilityLabel(abilityScore)}</Text>
            <ProgressBar value={abilityPercent(abilityScore)} total={100} color={COLORS.secondary} height={10} />
          </View>
        </View>

        <Text style={styles.sectionLabel}>פירוט שאלות</Text>
        {history.map((h: any, i: number) => (
          <View key={i} style={[styles.histRow, !h.correct && styles.histRowWrong]}>
            <Text style={styles.histNum}>#{i + 1}</Text>
            <DifficultyBadge difficulty={h.question.difficulty} />
            <Text style={styles.histQ} numberOfLines={2}>{h.question.questionText}</Text>
            <Text>{h.correct ? '✅' : '❌'}</Text>
          </View>
        ))}

        <View style={styles.resultsActions}>
          <TouchableOpacity style={styles.startBtn} onPress={() => navigation.navigate('AdaptiveSetup')} activeOpacity={0.85}>
            <Text style={styles.startBtnText}>מבחן נוסף 🔄</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.startBtn, { backgroundColor: COLORS.border }]} onPress={() => navigation.navigate('Home')} activeOpacity={0.85}>
            <Text style={[styles.startBtnText, { color: COLORS.text }]}>בית 🏠</Text>
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
  heroWrap: { alignItems: 'center', marginBottom: 28, gap: 8 },
  heroIcon: { fontSize: 60 },
  heroTitle: { fontSize: 26, fontWeight: '800', color: COLORS.text },
  heroSub: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22 },
  sectionLabel: { fontSize: 16, fontWeight: '700', color: COLORS.text, textAlign: 'right', marginBottom: 12, marginTop: 8 },
  topicBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, marginBottom: 8,
    borderWidth: 1.5, borderColor: COLORS.border,
  },
  topicBtnActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
  topicBtnIcon: { fontSize: 22 },
  topicBtnText: { flex: 1, fontSize: 15, fontWeight: '600', color: COLORS.text, textAlign: 'right' },
  checkmark: { color: COLORS.primary, fontWeight: '700', fontSize: 16 },
  infoBox: { backgroundColor: COLORS.primaryLight, borderRadius: 12, padding: 12, marginVertical: 16 },
  infoText: { color: COLORS.primary, textAlign: 'center', fontSize: 14, fontWeight: '600' },
  startBtn: { backgroundColor: COLORS.secondary, borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginBottom: 10 },
  startBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  topBar: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  exitText: { color: COLORS.danger, fontSize: 18, fontWeight: '700' },
  topCenter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  topCounter: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  topAbility: { fontSize: 13, color: COLORS.secondary, fontWeight: '600' },
  abilityBar: { paddingHorizontal: 0 },
  questionCard: {
    backgroundColor: COLORS.surface, borderRadius: 18, padding: 20, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 4,
  },
  qMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  qTopic: { fontSize: 13, color: COLORS.textSecondary },
  qText: { fontSize: 17, fontWeight: '700', color: COLORS.text, textAlign: 'right', lineHeight: 26 },
  optionsWrap: { gap: 10, marginBottom: 16 },
  option: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, borderWidth: 1.5,
  },
  optCircle: { width: 34, height: 34, borderRadius: 17, backgroundColor: COLORS.border, justifyContent: 'center', alignItems: 'center' },
  optCircleOk: { backgroundColor: COLORS.success },
  optCircleBad: { backgroundColor: COLORS.danger },
  optLetter: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  optText: { flex: 1, fontSize: 15, color: COLORS.text, textAlign: 'right', lineHeight: 22 },
  expl: { backgroundColor: '#FFF7ED', borderRadius: 14, padding: 16, marginBottom: 14, borderLeftWidth: 4, borderLeftColor: COLORS.warning },
  explTitle: { fontSize: 14, fontWeight: '700', color: COLORS.warning, marginBottom: 6, textAlign: 'right' },
  explText: { fontSize: 14, color: COLORS.text, lineHeight: 22, textAlign: 'right' },
  nextBtn: { backgroundColor: COLORS.secondary, borderRadius: 14, paddingVertical: 15, alignItems: 'center' },
  nextBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  resultsHero: { alignItems: 'center', gap: 10, marginBottom: 28 },
  resultsTitle: { fontSize: 26, fontWeight: '800', color: COLORS.text },
  resultsScore: { fontSize: 16, color: COLORS.textSecondary },
  abilityWrap: { width: '100%', gap: 6, marginTop: 8 },
  abilityTitle: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center' },
  abilityValue: { fontSize: 22, fontWeight: '800', color: COLORS.secondary, textAlign: 'center' },
  histRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 12, marginBottom: 6,
    borderLeftWidth: 3, borderLeftColor: COLORS.success,
  },
  histRowWrong: { borderLeftColor: COLORS.danger, backgroundColor: '#FFF8F8' },
  histNum: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '600', minWidth: 24 },
  histQ: { flex: 1, fontSize: 13, color: COLORS.text, textAlign: 'right' },
  resultsActions: { gap: 10, marginTop: 16 },
});
