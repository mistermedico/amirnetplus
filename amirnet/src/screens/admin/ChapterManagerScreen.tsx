import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView,
  TextInput, Modal, ScrollView, Alert,
} from 'react-native';
import { useApp } from '../../store/AppContext';
import { COLORS } from '../../utils/colors';
import { Chapter, TopicID, Question } from '../../types';
import { generateId } from '../../utils/hashUtils';
import { BUILT_IN_QUESTIONS } from '../../data/questions';
import { DifficultyBadge } from '../../components/common';

const TOPICS: { id: TopicID; name: string; icon: string }[] = [
  { id: 'networking', name: 'רשתות', icon: '🌐' },
  { id: 'security', name: 'אבטחה', icon: '🔒' },
  { id: 'operatingSystems', name: 'מערכות הפעלה', icon: '💻' },
  { id: 'cloud', name: 'ענן', icon: '☁️' },
  { id: 'itManagement', name: 'ניהול IT', icon: '📋' },
  { id: 'protocols', name: 'פרוטוקולים', icon: '🔄' },
];

export default function ChapterManagerScreen({ navigation }: any) {
  const { state, dispatch } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editChapter, setEditChapter] = useState<Chapter | null>(null);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [topicID, setTopicID] = useState<TopicID>('networking');
  const [showAssign, setShowAssign] = useState<Chapter | null>(null);

  function openAdd() {
    setEditChapter(null);
    setTitle(''); setDesc(''); setTopicID('networking');
    setShowForm(true);
  }

  function openEdit(c: Chapter) {
    setEditChapter(c);
    setTitle(c.title); setDesc(c.description); setTopicID(c.topicID);
    setShowForm(true);
  }

  function saveChapter() {
    if (!title.trim()) { Alert.alert('שגיאה', 'שם הפרק נדרש'); return; }
    if (editChapter) {
      dispatch({ type: 'UPDATE_CHAPTER', payload: { ...editChapter, title: title.trim(), description: desc.trim(), topicID } });
    } else {
      const ch: Chapter = {
        id: generateId(), title: title.trim(), description: desc.trim(),
        topicID, questionIDs: [], order: state.chapters.length, createdAt: new Date().toISOString(),
      };
      dispatch({ type: 'ADD_CHAPTER', payload: ch });
    }
    setShowForm(false);
  }

  function deleteChapter(id: string) {
    Alert.alert('מחיקת פרק', 'למחוק את הפרק?', [
      { text: 'ביטול', style: 'cancel' },
      { text: 'מחק', style: 'destructive', onPress: () => dispatch({ type: 'DELETE_CHAPTER', payload: id }) },
    ]);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>‹ חזרה</Text></TouchableOpacity>
        <Text style={styles.title}>ניהול פרקים</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openAdd}><Text style={styles.addBtnTxt}>+ פרק</Text></TouchableOpacity>
      </View>

      <FlatList
        data={state.chapters}
        keyExtractor={c => c.id}
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item: ch }) => {
          const topicInfo = TOPICS.find(t => t.id === ch.topicID);
          return (
            <View style={styles.chCard}>
              <View style={styles.chTop}>
                <View style={styles.chActions}>
                  <TouchableOpacity onPress={() => deleteChapter(ch.id)} style={styles.delBtn}><Text>🗑</Text></TouchableOpacity>
                  <TouchableOpacity onPress={() => openEdit(ch)} style={styles.editBtn}><Text>✏️</Text></TouchableOpacity>
                </View>
                <View style={styles.chMain}>
                  <Text style={styles.chTitle}>{ch.title}</Text>
                  {ch.description ? <Text style={styles.chDesc}>{ch.description}</Text> : null}
                  <View style={styles.chMeta}>
                    <Text style={styles.chTopic}>{topicInfo?.icon} {topicInfo?.name}</Text>
                    <Text style={styles.chCount}>{ch.questionIDs.length} שאלות</Text>
                  </View>
                </View>
              </View>
              <View style={styles.chActions2}>
                <TouchableOpacity
                  style={styles.practiceBtn}
                  onPress={() => navigation.navigate('QuizSetup', { chapterID: ch.id })}
                >
                  <Text style={styles.practiceBtnTxt}>▶ תרגל פרק</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.assignBtn} onPress={() => setShowAssign(ch)}>
                  <Text style={styles.assignBtnTxt}>+ שיוך שאלות</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}><Text style={styles.emptyIcon}>📚</Text><Text style={styles.emptyTxt}>אין פרקים עדיין</Text></View>
        }
      />

      {/* Chapter form */}
      <Modal visible={showForm} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowForm(false)}><Text style={styles.modalCancel}>ביטול</Text></TouchableOpacity>
            <Text style={styles.modalTitle}>{editChapter ? 'עריכת פרק' : 'פרק חדש'}</Text>
            <TouchableOpacity onPress={saveChapter}><Text style={styles.modalSave}>שמור</Text></TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
            <Text style={styles.fieldLabel}>שם הפרק *</Text>
            <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="לדוגמה: פרק 1 - מודל OSI" placeholderTextColor={COLORS.textTertiary} textAlign="right" />
            <Text style={styles.fieldLabel}>תיאור (אופציונלי)</Text>
            <TextInput style={[styles.input, { height: 70, textAlignVertical: 'top' }]} value={desc} onChangeText={setDesc} multiline placeholder="תיאור קצר של הפרק..." placeholderTextColor={COLORS.textTertiary} textAlign="right" />
            <Text style={styles.fieldLabel}>נושא</Text>
            {TOPICS.map(t => (
              <TouchableOpacity key={t.id} style={[styles.topicOption, topicID === t.id && styles.topicOptionActive]} onPress={() => setTopicID(t.id)}>
                <Text style={styles.topicOptionIcon}>{t.icon}</Text>
                <Text style={[styles.topicOptionTxt, topicID === t.id && { color: COLORS.primary, fontWeight: '700' }]}>{t.name}</Text>
                {topicID === t.id && <Text style={{ color: COLORS.primary }}>✓</Text>}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Assign questions modal */}
      {showAssign && (
        <AssignQuestionsModal
          chapter={showAssign}
          allQuestions={[...BUILT_IN_QUESTIONS, ...state.customQuestions].filter(q => q.topic === showAssign.topicID)}
          onClose={() => setShowAssign(null)}
          dispatch={dispatch}
        />
      )}
    </SafeAreaView>
  );
}

function AssignQuestionsModal({ chapter, allQuestions, onClose, dispatch }: {
  chapter: Chapter; allQuestions: Question[]; onClose: () => void; dispatch: any;
}) {
  const [search, setSearch] = useState('');
  const filtered = allQuestions.filter(q => !search || q.questionText.includes(search));

  function toggle(qID: string) {
    if (chapter.questionIDs.includes(qID)) {
      dispatch({ type: 'REMOVE_QUESTION_CHAPTER', payload: { questionID: qID, chapterID: chapter.id } });
    } else {
      dispatch({ type: 'ASSIGN_QUESTION_CHAPTER', payload: { questionID: qID, chapterID: chapter.id } });
    }
  }

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modal}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}><Text style={styles.modalCancel}>סגור</Text></TouchableOpacity>
          <Text style={styles.modalTitle}>שיוך שאלות לפרק "{chapter.title}"</Text>
          <Text style={styles.assignCount}>{chapter.questionIDs.length} נבחרו</Text>
        </View>
        <View style={{ padding: 12 }}>
          <TextInput style={styles.input} value={search} onChangeText={setSearch} placeholder="חפש שאלה..." placeholderTextColor={COLORS.textTertiary} textAlign="right" />
        </View>
        <FlatList
          data={filtered}
          keyExtractor={q => q.id}
          contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 20 }}
          renderItem={({ item: q }) => {
            const assigned = chapter.questionIDs.includes(q.id);
            return (
              <TouchableOpacity style={[styles.assignRow, assigned && styles.assignRowActive]} onPress={() => toggle(q.id)} activeOpacity={0.7}>
                <View style={[styles.checkbox, assigned && styles.checkboxActive]}>
                  {assigned && <Text style={styles.checkboxTick}>✓</Text>}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.assignQ} numberOfLines={2}>{q.questionText}</Text>
                  <DifficultyBadge difficulty={q.difficulty} />
                </View>
              </TouchableOpacity>
            );
          }}
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  back: { color: COLORS.primary, fontSize: 15 },
  title: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  addBtn: { backgroundColor: COLORS.primary, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
  addBtnTxt: { color: '#fff', fontWeight: '700', fontSize: 14 },
  chCard: {
    backgroundColor: COLORS.surface, borderRadius: 16, padding: 14, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },
  chTop: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  chMain: { flex: 1, gap: 4, alignItems: 'flex-end' },
  chTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, textAlign: 'right' },
  chDesc: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'right' },
  chMeta: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  chTopic: { fontSize: 12, color: COLORS.textSecondary },
  chCount: { fontSize: 12, fontWeight: '600', color: COLORS.primary, backgroundColor: COLORS.primaryLight, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  chActions: { gap: 6 },
  chActions2: { flexDirection: 'row', gap: 8 },
  editBtn: { backgroundColor: COLORS.primaryLight, borderRadius: 8, padding: 6 },
  delBtn: { backgroundColor: COLORS.dangerLight, borderRadius: 8, padding: 6 },
  practiceBtn: { flex: 1, backgroundColor: COLORS.primary, borderRadius: 10, paddingVertical: 8, alignItems: 'center' },
  practiceBtnTxt: { color: '#fff', fontWeight: '700', fontSize: 13 },
  assignBtn: { flex: 1, backgroundColor: COLORS.successLight, borderRadius: 10, paddingVertical: 8, alignItems: 'center' },
  assignBtnTxt: { color: COLORS.success, fontWeight: '700', fontSize: 13 },
  empty: { alignItems: 'center', paddingVertical: 50, gap: 12 },
  emptyIcon: { fontSize: 44 },
  emptyTxt: { fontSize: 15, color: COLORS.textSecondary },
  modal: { flex: 1, backgroundColor: COLORS.background },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  modalTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, flex: 1, textAlign: 'center' },
  modalCancel: { color: COLORS.danger, fontSize: 15 },
  modalSave: { color: COLORS.primary, fontSize: 15, fontWeight: '700' },
  fieldLabel: { fontSize: 14, fontWeight: '700', color: COLORS.text, textAlign: 'right', marginBottom: 6, marginTop: 6 },
  input: { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12, padding: 12, fontSize: 14, color: COLORS.text, backgroundColor: COLORS.surface, marginBottom: 8 },
  topicOption: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 12, backgroundColor: COLORS.background, marginBottom: 6, borderWidth: 1.5, borderColor: COLORS.border },
  topicOptionActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
  topicOptionIcon: { fontSize: 22 },
  topicOptionTxt: { flex: 1, fontSize: 15, color: COLORS.text, textAlign: 'right' },
  assignRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 12, backgroundColor: COLORS.surface, marginBottom: 6, borderWidth: 1.5, borderColor: COLORS.border },
  assignRowActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: COLORS.border, justifyContent: 'center', alignItems: 'center' },
  checkboxActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  checkboxTick: { color: '#fff', fontWeight: '800', fontSize: 14 },
  assignQ: { fontSize: 13, color: COLORS.text, textAlign: 'right', marginBottom: 4, lineHeight: 18 },
  assignCount: { fontSize: 13, color: COLORS.primary, fontWeight: '700' },
});
