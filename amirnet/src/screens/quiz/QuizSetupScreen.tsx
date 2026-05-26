import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Switch,
} from 'react-native';
import { useApp } from '../../store/AppContext';
import { COLORS, TOPIC_COLORS } from '../../utils/colors';
import { Card, SectionHeader, PrimaryButton } from '../../components/common';
import { getRandomQuestions } from '../../data/questions';
import { TopicID, Difficulty, QuizMode } from '../../types';

const TOPIC_INFO: Record<string, { name: string; icon: string }> = {
  networking:       { name: 'רשתות תקשורת', icon: '🌐' },
  security:         { name: 'אבטחת מידע',   icon: '🔒' },
  operatingSystems: { name: 'מערכות הפעלה', icon: '💻' },
  cloud:            { name: 'ענן ווירטואליזציה', icon: '☁️' },
  itManagement:     { name: 'ניהול IT',      icon: '📋' },
  protocols:        { name: 'פרוטוקולים',    icon: '🔄' },
};

const COUNT_OPTIONS = [5, 10, 20, 30, 50];

export default function QuizSetupScreen({ navigation, route }: any) {
  const { state } = useApp();
  const quick = route?.params?.quick;
  const presetTopic = route?.params?.topicID as TopicID | undefined;
  const presetChapter = route?.params?.chapterID as string | undefined;

  const [count, setCount] = useState(quick ? 10 : 20);
  const [topicID, setTopicID] = useState<TopicID | undefined>(presetTopic);
  const [difficulty, setDifficulty] = useState<Difficulty | undefined>(undefined);
  const [mode, setMode] = useState<QuizMode>('exam');
  const [includeCustom, setIncludeCustom] = useState(true);

  const customQs = state.customQuestions;

  const chapterInfo = presetChapter
    ? state.chapters.find(c => c.id === presetChapter)
    : undefined;

  function buildAndStart() {
    const questions = getRandomQuestions(
      count,
      topicID,
      difficulty,
      includeCustom ? customQs : [],
      chapterInfo?.questionIDs,
    );
    if (questions.length === 0) {
      alert('לא נמצאו שאלות עבור הסינון שנבחר');
      return;
    }
    navigation.navigate('Quiz', { questions, mode, chapterTitle: chapterInfo?.title });
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Card style={styles.heroCard}>
          <Text style={styles.heroIcon}>📝</Text>
          <Text style={styles.heroTitle}>הגדרות בחינה</Text>
          <Text style={styles.heroSub}>
            {chapterInfo ? `פרק: ${chapterInfo.title}` : 'הגדר את הבחינה שלך והתחל'}
          </Text>
        </Card>

        {/* Count */}
        <SectionHeader title="מספר שאלות" />
        <View style={styles.chipRow}>
          {COUNT_OPTIONS.map(c => (
            <TouchableOpacity
              key={c}
              style={[styles.chip, count === c && styles.chipActive]}
              onPress={() => setCount(c)}
            >
              <Text style={[styles.chipText, count === c && styles.chipTextActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Topic */}
        {!chapterInfo && (
          <>
            <SectionHeader title="נושא" />
            <TouchableOpacity
              style={[styles.topicOption, !topicID && styles.topicOptionActive]}
              onPress={() => setTopicID(undefined)}
            >
              <View style={styles.topicOptionLeft}>
                {!topicID && <Text style={styles.check}>✓</Text>}
              </View>
              <View>
                <Text style={styles.topicOptionName}>כל הנושאים</Text>
                <Text style={styles.topicOptionSub}>שאלות מכל הנושאים</Text>
              </View>
              <Text style={styles.topicOptionIcon}>🌍</Text>
            </TouchableOpacity>
            {Object.entries(TOPIC_INFO).map(([tid, info]) => (
              <TouchableOpacity
                key={tid}
                style={[styles.topicOption, topicID === tid && styles.topicOptionActive]}
                onPress={() => setTopicID(tid as TopicID)}
              >
                <View style={styles.topicOptionLeft}>
                  {topicID === tid && <Text style={styles.check}>✓</Text>}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.topicOptionName}>{info.name}</Text>
                </View>
                <Text style={styles.topicOptionIcon}>{info.icon}</Text>
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* Difficulty */}
        <SectionHeader title="רמת קושי" />
        <View style={styles.chipRow}>
          {([undefined, 'easy', 'medium', 'hard'] as const).map(d => (
            <TouchableOpacity
              key={String(d)}
              style={[styles.chip, difficulty === d && styles.chipActive]}
              onPress={() => setDifficulty(d)}
            >
              <Text style={[styles.chipText, difficulty === d && styles.chipTextActive]}>
                {d == null ? 'הכל' : d === 'easy' ? 'קל' : d === 'medium' ? 'בינוני' : 'קשה'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Mode */}
        <SectionHeader title="מצב בחינה" />
        <View style={styles.modeRow}>
          {([
            { v: 'exam', icon: '📋', label: 'מצב בחינה', sub: 'תוצאות בסוף' },
            { v: 'study', icon: '💡', label: 'מצב לימוד', sub: 'תשובה אחרי כל שאלה' },
          ] as const).map(m => (
            <TouchableOpacity
              key={m.v}
              style={[styles.modeCard, mode === m.v && styles.modeCardActive]}
              onPress={() => setMode(m.v)}
            >
              <Text style={styles.modeIcon}>{m.icon}</Text>
              <Text style={[styles.modeLabel, mode === m.v && { color: COLORS.primary }]}>{m.label}</Text>
              <Text style={styles.modeSub}>{m.sub}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Include custom */}
        <Card style={styles.toggleCard}>
          <View style={styles.toggleRow}>
            <Switch
              value={includeCustom}
              onValueChange={setIncludeCustom}
              trackColor={{ true: COLORS.primary }}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleLabel}>כלול שאלות מותאמות אישית</Text>
              <Text style={styles.toggleSub}>{state.customQuestions.length} שאלות זמינות</Text>
            </View>
          </View>
        </Card>

        <PrimaryButton title="התחל בחינה ▶" onPress={buildAndStart} style={{ marginTop: 8 }} />
        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: 16 },
  heroCard: { alignItems: 'center', marginBottom: 20, gap: 6 },
  heroIcon: { fontSize: 40 },
  heroTitle: { fontSize: 22, fontWeight: '800', color: COLORS.text },
  heroSub: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18 },
  chip: {
    paddingHorizontal: 18, paddingVertical: 10,
    borderRadius: 24, backgroundColor: COLORS.surface,
    borderWidth: 1.5, borderColor: COLORS.border,
  },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  chipTextActive: { color: '#fff' },
  topicOption: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: COLORS.surface, borderRadius: 14,
    padding: 14, marginBottom: 8,
    borderWidth: 1.5, borderColor: COLORS.border,
  },
  topicOptionActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
  topicOptionLeft: { width: 20 },
  check: { color: COLORS.primary, fontWeight: '800', fontSize: 16 },
  topicOptionName: { fontSize: 15, fontWeight: '600', color: COLORS.text, textAlign: 'right' },
  topicOptionSub: { fontSize: 12, color: COLORS.textSecondary },
  topicOptionIcon: { fontSize: 24 },
  modeRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  modeCard: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: 14,
    padding: 16, alignItems: 'center', gap: 6,
    borderWidth: 1.5, borderColor: COLORS.border,
  },
  modeCardActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
  modeIcon: { fontSize: 28 },
  modeLabel: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  modeSub: { fontSize: 11, color: COLORS.textSecondary, textAlign: 'center' },
  toggleCard: { marginBottom: 14 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  toggleLabel: { fontSize: 15, fontWeight: '600', color: COLORS.text, textAlign: 'right' },
  toggleSub: { fontSize: 12, color: COLORS.textSecondary, textAlign: 'right' },
});
