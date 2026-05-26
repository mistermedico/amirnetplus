import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView,
  TextInput, Modal, ScrollView, Alert,
} from 'react-native';
import { useApp } from '../../store/AppContext';
import { COLORS } from '../../utils/colors';
import { ExamTemplate } from '../../types';
import { generateId } from '../../utils/hashUtils';

export default function ExamManagerScreen({ navigation }: any) {
  const { state, dispatch } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editExam, setEditExam] = useState<ExamTemplate | null>(null);

  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [qCount, setQCount] = useState('30');
  const [duration, setDuration] = useState('60');
  const [passingScore, setPassingScore] = useState('70');
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);

  function openAdd() {
    setEditExam(null);
    setTitle(''); setDesc(''); setQCount('30'); setDuration('60'); setPassingScore('70'); setSelectedChapters([]);
    setShowForm(true);
  }

  function openEdit(e: ExamTemplate) {
    setEditExam(e);
    setTitle(e.title); setDesc(e.description);
    setQCount(String(e.questionCount)); setDuration(String(e.durationMinutes));
    setPassingScore(String(e.passingScore)); setSelectedChapters(e.chapterIDs);
    setShowForm(true);
  }

  function saveExam() {
    if (!title.trim()) { Alert.alert('שגיאה', 'שם הבחינה נדרש'); return; }
    if (editExam) {
      dispatch({ type: 'UPDATE_EXAM', payload: {
        ...editExam, title: title.trim(), description: desc.trim(),
        questionCount: parseInt(qCount) || 30, durationMinutes: parseInt(duration) || 60,
        passingScore: parseInt(passingScore) || 70, chapterIDs: selectedChapters,
      }});
    } else {
      const exam: ExamTemplate = {
        id: generateId(), title: title.trim(), description: desc.trim(),
        chapterIDs: selectedChapters, additionalQuestionIDs: [],
        questionCount: parseInt(qCount) || 30, durationMinutes: parseInt(duration) || 60,
        passingScore: parseInt(passingScore) || 70, isActive: true,
        allowAllTopics: selectedChapters.length === 0, topicIDs: [],
        createdAt: new Date().toISOString(),
      };
      dispatch({ type: 'ADD_EXAM', payload: exam });
    }
    setShowForm(false);
  }

  function deleteExam(id: string) {
    Alert.alert('מחיקת בחינה', 'למחוק תבנית זו?', [
      { text: 'ביטול', style: 'cancel' },
      { text: 'מחק', style: 'destructive', onPress: () => dispatch({ type: 'DELETE_EXAM', payload: id }) },
    ]);
  }

  function startExam(exam: ExamTemplate) {
    navigation.navigate('QuizSetup', {
      examTemplateID: exam.id,
      chapterIDs: exam.chapterIDs,
      questionCount: exam.questionCount,
    });
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>‹ חזרה</Text></TouchableOpacity>
        <Text style={styles.title}>תבניות בחינה</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openAdd}><Text style={styles.addBtnTxt}>+ בחינה</Text></TouchableOpacity>
      </View>

      <FlatList
        data={state.examTemplates}
        keyExtractor={e => e.id}
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item: exam }) => {
          const chapterCount = exam.chapterIDs.length;
          return (
            <View style={styles.examCard}>
              <View style={styles.examTop}>
                <View style={styles.examActions}>
                  <TouchableOpacity onPress={() => deleteExam(exam.id)} style={styles.delBtn}><Text>🗑</Text></TouchableOpacity>
                  <TouchableOpacity onPress={() => openEdit(exam)} style={styles.editBtn}><Text>✏️</Text></TouchableOpacity>
                </View>
                <View style={styles.examMain}>
                  <Text style={styles.examTitle}>{exam.title}</Text>
                  {exam.description ? <Text style={styles.examDesc}>{exam.description}</Text> : null}
                  <View style={styles.examMeta}>
                    <View style={[styles.metaChip, { backgroundColor: COLORS.primaryLight }]}>
                      <Text style={[styles.metaChipTxt, { color: COLORS.primary }]}>{exam.questionCount} שאלות</Text>
                    </View>
                    <View style={[styles.metaChip, { backgroundColor: '#FEF3C7' }]}>
                      <Text style={[styles.metaChipTxt, { color: '#D97706' }]}>⏱ {exam.durationMinutes} דק'</Text>
                    </View>
                    <View style={[styles.metaChip, { backgroundColor: COLORS.successLight }]}>
                      <Text style={[styles.metaChipTxt, { color: COLORS.success }]}>עובר: {exam.passingScore}%</Text>
                    </View>
                  </View>
                  {chapterCount > 0 && (
                    <Text style={styles.chaptersInfo}>{chapterCount} פרקים משויכים</Text>
                  )}
                </View>
              </View>
              <TouchableOpacity style={styles.startBtn} onPress={() => startExam(exam)} activeOpacity={0.85}>
                <Text style={styles.startBtnTxt}>▶ התחל בחינה</Text>
              </TouchableOpacity>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTxt}>אין תבניות בחינה</Text>
            <Text style={styles.emptySubTxt}>צור תבנית להגדיר פרמטרים קבועים לבחינה</Text>
          </View>
        }
      />

      <Modal visible={showForm} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowForm(false)}><Text style={styles.cancel}>ביטול</Text></TouchableOpacity>
            <Text style={styles.modalTitle}>{editExam ? 'עריכת בחינה' : 'בחינה חדשה'}</Text>
            <TouchableOpacity onPress={saveExam}><Text style={styles.save}>שמור</Text></TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
            <Text style={styles.label}>שם הבחינה *</Text>
            <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder='לדוגמה: בחינת רשתות תקשורת' placeholderTextColor={COLORS.textTertiary} textAlign="right" />

            <Text style={styles.label}>תיאור</Text>
            <TextInput style={[styles.input, { height: 70, textAlignVertical: 'top' }]} value={desc} onChangeText={setDesc} multiline placeholder="תיאור הבחינה..." placeholderTextColor={COLORS.textTertiary} textAlign="right" />

            <View style={styles.numRow}>
              <View style={styles.numField}>
                <Text style={styles.label}>מספר שאלות</Text>
                <TextInput style={styles.numInput} value={qCount} onChangeText={setQCount} keyboardType="numeric" textAlign="center" />
              </View>
              <View style={styles.numField}>
                <Text style={styles.label}>משך (דקות)</Text>
                <TextInput style={styles.numInput} value={duration} onChangeText={setDuration} keyboardType="numeric" textAlign="center" />
              </View>
              <View style={styles.numField}>
                <Text style={styles.label}>ציון עובר %</Text>
                <TextInput style={styles.numInput} value={passingScore} onChangeText={setPassingScore} keyboardType="numeric" textAlign="center" />
              </View>
            </View>

            <Text style={styles.label}>שייך פרקים ({selectedChapters.length} נבחרו)</Text>
            {state.chapters.length === 0 ? (
              <Text style={styles.noChapters}>אין פרקים עדיין – צור פרקים תחילה</Text>
            ) : state.chapters.map(ch => {
              const sel = selectedChapters.includes(ch.id);
              return (
                <TouchableOpacity
                  key={ch.id}
                  style={[styles.chapterOpt, sel && styles.chapterOptActive]}
                  onPress={() => setSelectedChapters(prev => sel ? prev.filter(id => id !== ch.id) : [...prev, ch.id])}
                >
                  <View style={[styles.checkbox, sel && styles.checkboxActive]}>
                    {sel && <Text style={styles.checkTick}>✓</Text>}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.chName, sel && { color: COLORS.primary }]}>{ch.title}</Text>
                    <Text style={styles.chCount}>{ch.questionIDs.length} שאלות</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
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
  examCard: {
    backgroundColor: COLORS.surface, borderRadius: 16, padding: 14, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },
  examTop: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  examMain: { flex: 1, gap: 6, alignItems: 'flex-end' },
  examTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, textAlign: 'right' },
  examDesc: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'right' },
  examMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  metaChip: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  metaChipTxt: { fontSize: 12, fontWeight: '600' },
  chaptersInfo: { fontSize: 12, color: COLORS.secondary, fontWeight: '600' },
  examActions: { gap: 6 },
  editBtn: { backgroundColor: COLORS.primaryLight, borderRadius: 8, padding: 6 },
  delBtn: { backgroundColor: COLORS.dangerLight, borderRadius: 8, padding: 6 },
  startBtn: { backgroundColor: COLORS.primary, borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  startBtnTxt: { color: '#fff', fontWeight: '700', fontSize: 14 },
  empty: { alignItems: 'center', paddingVertical: 50, gap: 10 },
  emptyIcon: { fontSize: 44 },
  emptyTxt: { fontSize: 16, color: COLORS.textSecondary, fontWeight: '600' },
  emptySubTxt: { fontSize: 13, color: COLORS.textTertiary, textAlign: 'center' },
  modal: { flex: 1, backgroundColor: COLORS.background },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  modalTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  cancel: { color: COLORS.danger, fontSize: 15 },
  save: { color: COLORS.primary, fontSize: 15, fontWeight: '700' },
  label: { fontSize: 14, fontWeight: '700', color: COLORS.text, textAlign: 'right', marginBottom: 6, marginTop: 8 },
  input: { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12, padding: 12, fontSize: 14, color: COLORS.text, backgroundColor: COLORS.surface, marginBottom: 4 },
  numRow: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  numField: { flex: 1, gap: 4 },
  numInput: { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 10, padding: 10, fontSize: 16, fontWeight: '700', color: COLORS.text, backgroundColor: COLORS.surface },
  noChapters: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', paddingVertical: 16, fontStyle: 'italic' },
  chapterOpt: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 12, backgroundColor: COLORS.background, marginBottom: 6, borderWidth: 1.5, borderColor: COLORS.border },
  chapterOptActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: COLORS.border, justifyContent: 'center', alignItems: 'center' },
  checkboxActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  checkTick: { color: '#fff', fontWeight: '800', fontSize: 13 },
  chName: { fontSize: 14, fontWeight: '600', color: COLORS.text, textAlign: 'right' },
  chCount: { fontSize: 12, color: COLORS.textSecondary, textAlign: 'right' },
});
