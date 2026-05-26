import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView,
  TextInput, Modal, ScrollView, Alert,
} from 'react-native';
import { useApp } from '../../store/AppContext';
import { COLORS } from '../../utils/colors';
import { DifficultyBadge } from '../../components/common';
import { Question, TopicID, Difficulty } from '../../types';
import { generateId } from '../../utils/hashUtils';
import { BUILT_IN_QUESTIONS } from '../../data/questions';

const TOPICS: { id: TopicID; name: string }[] = [
  { id: 'networking', name: 'רשתות תקשורת' },
  { id: 'security', name: 'אבטחת מידע' },
  { id: 'operatingSystems', name: 'מערכות הפעלה' },
  { id: 'cloud', name: 'ענן ווירטואליזציה' },
  { id: 'itManagement', name: 'ניהול IT' },
  { id: 'protocols', name: 'פרוטוקולים' },
];

interface QFormState {
  questionText: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanation: string;
  topic: TopicID;
  difficulty: Difficulty;
}

const emptyForm = (): QFormState => ({
  questionText: '', options: ['', '', '', ''],
  correctIndex: 0, explanation: '',
  topic: 'networking', difficulty: 'medium',
});

export default function QuestionManagerScreen({ navigation }: any) {
  const { state, dispatch } = useApp();
  const [tab, setTab] = useState<'builtin' | 'custom'>('custom');
  const [search, setSearch] = useState('');
  const [topicFilter, setTopicFilter] = useState<TopicID | 'all'>('all');
  const [showForm, setShowForm] = useState(false);
  const [editQ, setEditQ] = useState<Question | null>(null);
  const [form, setForm] = useState<QFormState>(emptyForm());

  const pool = tab === 'custom' ? state.customQuestions : BUILT_IN_QUESTIONS;
  const filtered = pool.filter(q => {
    const matchTopic = topicFilter === 'all' || q.topic === topicFilter;
    const matchSearch = !search || q.questionText.includes(search);
    return matchTopic && matchSearch;
  });

  function openAdd() {
    setEditQ(null);
    setForm(emptyForm());
    setShowForm(true);
  }

  function openEdit(q: Question) {
    setEditQ(q);
    setForm({
      questionText: q.questionText,
      options: q.options as [string, string, string, string],
      correctIndex: q.correctIndex,
      explanation: q.explanation,
      topic: q.topic,
      difficulty: q.difficulty,
    });
    setShowForm(true);
  }

  function saveForm() {
    if (!form.questionText.trim() || form.options.some(o => !o.trim()) || !form.explanation.trim()) {
      Alert.alert('שגיאה', 'יש למלא את כל השדות');
      return;
    }
    if (editQ) {
      dispatch({ type: 'UPDATE_CUSTOM_QUESTION', payload: { ...editQ, ...form } });
    } else {
      const newQ: Question = {
        id: generateId(),
        ...form,
        examIDs: [],
        tags: [],
        isCustom: true,
        createdAt: new Date().toISOString(),
      };
      dispatch({ type: 'ADD_CUSTOM_QUESTION', payload: newQ });
    }
    setShowForm(false);
  }

  function deleteQ(q: Question) {
    Alert.alert('מחיקת שאלה', 'למחוק את השאלה?', [
      { text: 'ביטול', style: 'cancel' },
      { text: 'מחק', style: 'destructive', onPress: () => dispatch({ type: 'DELETE_CUSTOM_QUESTION', payload: q.id }) },
    ]);
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>‹ חזרה</Text>
        </TouchableOpacity>
        <Text style={styles.title}>ניהול שאלות</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
          <Text style={styles.addBtnTxt}>+ הוסף</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, tab === 'custom' && styles.tabActive]} onPress={() => setTab('custom')}>
          <Text style={[styles.tabText, tab === 'custom' && styles.tabTextActive]}>שאלות שלי ({state.customQuestions.length})</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'builtin' && styles.tabActive]} onPress={() => setTab('builtin')}>
          <Text style={[styles.tabText, tab === 'builtin' && styles.tabTextActive]}>מובנות ({BUILT_IN_QUESTIONS.length})</Text>
        </TouchableOpacity>
      </View>

      {/* Search + filter */}
      <View style={styles.controls}>
        <TextInput style={styles.search} value={search} onChangeText={setSearch} placeholder="חפש שאלה..." placeholderTextColor={COLORS.textTertiary} textAlign="right" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          {(['all', ...TOPICS.map(t => t.id)] as const).map(tid => (
            <TouchableOpacity key={tid} style={[styles.filterChip, topicFilter === tid && styles.filterChipActive]} onPress={() => setTopicFilter(tid as any)}>
              <Text style={[styles.filterChipTxt, topicFilter === tid && styles.filterChipTxtActive]}>
                {tid === 'all' ? 'הכל' : TOPICS.find(t => t.id === tid)?.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={q => q.id}
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item: q }) => (
          <View style={styles.qCard}>
            <View style={styles.qTop}>
              <View style={styles.qActions}>
                {q.isCustom && (
                  <>
                    <TouchableOpacity onPress={() => deleteQ(q)} style={styles.delBtn}>
                      <Text style={styles.delBtnTxt}>🗑</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => openEdit(q)} style={styles.editBtn}>
                      <Text style={styles.editBtnTxt}>✏️</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
              <View style={styles.qMain}>
                <Text style={styles.qText} numberOfLines={2}>{q.questionText}</Text>
                <View style={styles.qMeta}>
                  <DifficultyBadge difficulty={q.difficulty} />
                  <Text style={styles.qTopic}>{TOPICS.find(t => t.id === q.topic)?.name}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => dispatch({ type: 'TOGGLE_BOOKMARK', payload: q.id })}>
                <Text style={{ fontSize: 18 }}>
                  {state.progress.bookmarkedQuestionIDs.includes(q.id) ? '🔖' : '📎'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>{tab === 'custom' ? '✏️' : '🔍'}</Text>
            <Text style={styles.emptyTxt}>
              {tab === 'custom' ? 'אין שאלות מותאמות אישית. לחץ "+ הוסף"' : 'לא נמצאו שאלות'}
            </Text>
          </View>
        }
      />

      {/* Form Modal */}
      <Modal visible={showForm} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowForm(false)}>
              <Text style={styles.modalCancel}>ביטול</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{editQ ? 'עריכת שאלה' : 'שאלה חדשה'}</Text>
            <TouchableOpacity onPress={saveForm}>
              <Text style={styles.modalSave}>שמור</Text>
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.modalScroll} keyboardShouldPersistTaps="handled">
            <Text style={styles.fieldLabel}>טקסט השאלה *</Text>
            <TextInput
              style={[styles.textArea, { height: 90 }]}
              value={form.questionText}
              onChangeText={t => setForm(f => ({ ...f, questionText: t }))}
              multiline
              textAlign="right"
              placeholder="הכנס את השאלה..."
              placeholderTextColor={COLORS.textTertiary}
            />

            <Text style={styles.fieldLabel}>אפשרויות תשובה (סמן את הנכונה)</Text>
            {form.options.map((opt, idx) => (
              <View key={idx} style={styles.optionRow}>
                <TouchableOpacity onPress={() => setForm(f => ({ ...f, correctIndex: idx }))} style={styles.radioBtn}>
                  <View style={[styles.radioCircle, form.correctIndex === idx && styles.radioCircleActive]}>
                    {form.correctIndex === idx && <View style={styles.radioDot} />}
                  </View>
                </TouchableOpacity>
                <TextInput
                  style={[styles.optInput, form.correctIndex === idx && styles.optInputCorrect]}
                  value={opt}
                  onChangeText={t => setForm(f => {
                    const options = [...f.options] as [string, string, string, string];
                    options[idx] = t;
                    return { ...f, options };
                  })}
                  placeholder={`אפשרות ${String.fromCharCode(65 + idx)}`}
                  placeholderTextColor={COLORS.textTertiary}
                  textAlign="right"
                />
                <Text style={styles.optLetter}>{String.fromCharCode(65 + idx)}</Text>
              </View>
            ))}

            <Text style={styles.fieldLabel}>נושא</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {TOPICS.map(t => (
                  <TouchableOpacity key={t.id} style={[styles.filterChip, form.topic === t.id && styles.filterChipActive]} onPress={() => setForm(f => ({ ...f, topic: t.id }))}>
                    <Text style={[styles.filterChipTxt, form.topic === t.id && styles.filterChipTxtActive]}>{t.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <Text style={styles.fieldLabel}>רמת קושי</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
              {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => (
                <TouchableOpacity key={d} style={[styles.filterChip, form.difficulty === d && styles.filterChipActive]} onPress={() => setForm(f => ({ ...f, difficulty: d }))}>
                  <Text style={[styles.filterChipTxt, form.difficulty === d && styles.filterChipTxtActive]}>
                    {d === 'easy' ? 'קל' : d === 'medium' ? 'בינוני' : 'קשה'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>הסבר לתשובה *</Text>
            <TextInput
              style={[styles.textArea, { height: 90 }]}
              value={form.explanation}
              onChangeText={t => setForm(f => ({ ...f, explanation: t }))}
              multiline
              textAlign="right"
              placeholder="הסבר מדוע התשובה נכונה..."
              placeholderTextColor={COLORS.textTertiary}
            />
            <View style={{ height: 30 }} />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  back: { color: COLORS.primary, fontSize: 15 },
  title: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  addBtn: { backgroundColor: COLORS.primary, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
  addBtnTxt: { color: '#fff', fontWeight: '700', fontSize: 14 },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: COLORS.primary },
  tabText: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '600' },
  tabTextActive: { color: COLORS.primary },
  controls: { padding: 12, gap: 8 },
  search: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 10, fontSize: 14, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border },
  filterRow: { flexGrow: 0 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, marginRight: 6 },
  filterChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterChipTxt: { fontSize: 13, color: COLORS.text, fontWeight: '600' },
  filterChipTxtActive: { color: '#fff' },
  qCard: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, marginBottom: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
  },
  qTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  qMain: { flex: 1, gap: 6, alignItems: 'flex-end' },
  qText: { fontSize: 14, color: COLORS.text, textAlign: 'right', lineHeight: 20 },
  qMeta: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  qTopic: { fontSize: 11, color: COLORS.textSecondary },
  qActions: { gap: 6 },
  editBtn: { backgroundColor: COLORS.primaryLight, borderRadius: 8, padding: 6 },
  editBtnTxt: { fontSize: 14 },
  delBtn: { backgroundColor: COLORS.dangerLight, borderRadius: 8, padding: 6 },
  delBtnTxt: { fontSize: 14 },
  empty: { alignItems: 'center', paddingVertical: 50, gap: 12 },
  emptyIcon: { fontSize: 44 },
  emptyTxt: { fontSize: 15, color: COLORS.textSecondary, textAlign: 'center' },
  modal: { flex: 1, backgroundColor: COLORS.background },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  modalTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text },
  modalCancel: { color: COLORS.danger, fontSize: 15 },
  modalSave: { color: COLORS.primary, fontSize: 15, fontWeight: '700' },
  modalScroll: { padding: 16 },
  fieldLabel: { fontSize: 14, fontWeight: '700', color: COLORS.text, textAlign: 'right', marginBottom: 6, marginTop: 4 },
  textArea: {
    borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12,
    padding: 12, fontSize: 14, color: COLORS.text, backgroundColor: COLORS.surface,
    textAlignVertical: 'top', marginBottom: 14,
  },
  optionRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  radioBtn: { padding: 4 },
  radioCircle: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: COLORS.border, justifyContent: 'center', alignItems: 'center' },
  radioCircleActive: { borderColor: COLORS.success },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.success },
  optInput: {
    flex: 1, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 10,
    padding: 10, fontSize: 14, color: COLORS.text, backgroundColor: COLORS.surface,
  },
  optInputCorrect: { borderColor: COLORS.success, backgroundColor: COLORS.successLight },
  optLetter: { fontSize: 14, fontWeight: '700', color: COLORS.textSecondary, width: 20, textAlign: 'center' },
});
