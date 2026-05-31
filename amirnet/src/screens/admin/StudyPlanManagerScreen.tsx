import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView,
  Alert, TextInput, Modal,
} from 'react-native';
import { useApp } from '../../store/AppContext';
import { COLORS, TOPIC_COLORS } from '../../utils/colors';
import { generateId } from '../../utils/hashUtils';
import { StudyPlan, TopicID } from '../../types';

const TOPICS: { id: TopicID; name: string; icon: string }[] = [
  { id: 'networking',       name: 'רשתות',       icon: '🌐' },
  { id: 'security',         name: 'אבטחה',        icon: '🔒' },
  { id: 'operatingSystems', name: 'מ. הפעלה',     icon: '💻' },
  { id: 'cloud',            name: 'ענן',           icon: '☁️' },
  { id: 'itManagement',     name: 'ניהול IT',      icon: '📋' },
  { id: 'protocols',        name: 'פרוטוקולים',   icon: '🔄' },
];

function daysUntil(dateStr: string): number | null {
  if (!dateStr) return null;
  const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
  return diff;
}

export default function StudyPlanManagerScreen({ navigation }: any) {
  const { state, dispatch } = useApp();
  const plans = state.progress.studyPlans;

  const [showModal, setShowModal] = useState(false);
  const [editPlan, setEditPlan] = useState<StudyPlan | null>(null);
  const [title, setTitle] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<TopicID[]>([]);
  const [dailyGoal, setDailyGoal] = useState(20);

  function openCreate() {
    setEditPlan(null); setTitle(''); setTargetDate(''); setSelectedTopics([]); setDailyGoal(20);
    setShowModal(true);
  }

  function openEdit(plan: StudyPlan) {
    setEditPlan(plan); setTitle(plan.title); setTargetDate(plan.targetDate);
    setSelectedTopics([...plan.topicIDs]); setDailyGoal(plan.dailyGoal);
    setShowModal(true);
  }

  function save() {
    if (!title.trim()) { Alert.alert('שגיאה', 'יש להזין כותרת'); return; }
    if (editPlan) {
      dispatch({ type: 'UPDATE_STUDY_PLAN', payload: { ...editPlan, title: title.trim(), targetDate, topicIDs: selectedTopics, dailyGoal } });
    } else {
      const plan: StudyPlan = {
        id: generateId(), title: title.trim(), targetDate, topicIDs: selectedTopics,
        dailyGoal, createdAt: new Date().toISOString(), isActive: true,
      };
      dispatch({ type: 'ADD_STUDY_PLAN', payload: plan });
    }
    setShowModal(false);
  }

  function toggleActive(plan: StudyPlan) {
    dispatch({ type: 'UPDATE_STUDY_PLAN', payload: { ...plan, isActive: !plan.isActive } });
  }

  function deletePlan(id: string) {
    Alert.alert('מחיקה', 'למחוק תוכנית לימוד זו?', [
      { text: 'ביטול', style: 'cancel' },
      { text: 'מחק', style: 'destructive', onPress: () => dispatch({ type: 'DELETE_STUDY_PLAN', payload: id }) },
    ]);
  }

  function toggleTopic(tid: TopicID) {
    setSelectedTopics(prev => prev.includes(tid) ? prev.filter(t => t !== tid) : [...prev, tid]);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>‹ חזרה</Text></TouchableOpacity>
        <Text style={styles.title}>תוכניות לימוד</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openCreate}>
          <Text style={styles.addBtnTxt}>+ חדש</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {plans.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📅</Text>
            <Text style={styles.emptyTitle}>אין תוכניות לימוד</Text>
            <Text style={styles.emptySub}>לחץ על "+ חדש" כדי ליצור תוכנית</Text>
          </View>
        ) : (
          plans.map(plan => {
            const days = daysUntil(plan.targetDate);
            return (
              <View key={plan.id} style={[styles.planCard, !plan.isActive && styles.planCardInactive]}>
                <View style={styles.planTop}>
                  <View style={styles.planActions}>
                    <TouchableOpacity onPress={() => deletePlan(plan.id)}>
                      <Text style={styles.actionIcon}>🗑️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => openEdit(plan)}>
                      <Text style={styles.actionIcon}>✏️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.statusBadge, plan.isActive ? styles.statusActive : styles.statusInactive]}
                      onPress={() => toggleActive(plan)}
                    >
                      <Text style={[styles.statusTxt, { color: plan.isActive ? COLORS.success : COLORS.textSecondary }]}>
                        {plan.isActive ? '● פעיל' : '○ מושהה'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.planTitle}>{plan.title}</Text>
                    {days !== null && (
                      <Text style={[styles.planDays, { color: days <= 3 ? COLORS.danger : days <= 7 ? COLORS.warning : COLORS.textSecondary }]}>
                        {days > 0 ? `${days} ימים נותרו` : days === 0 ? 'היום!' : 'עבר התאריך'}
                      </Text>
                    )}
                  </View>
                </View>

                {plan.topicIDs.length > 0 ? (
                  <View style={styles.topicChips}>
                    {plan.topicIDs.map(tid => {
                      const t = TOPICS.find(x => x.id === tid);
                      if (!t) return null;
                      return (
                        <View key={tid} style={[styles.topicChip, { borderColor: TOPIC_COLORS[tid] }]}>
                          <Text style={styles.topicChipTxt}>{t.icon} {t.name}</Text>
                        </View>
                      );
                    })}
                  </View>
                ) : (
                  <Text style={styles.allTopics}>📚 כל הנושאים</Text>
                )}

                <View style={styles.planStats}>
                  <Text style={styles.planStat}>🎯 {plan.dailyGoal} שאלות/יום</Text>
                  {plan.targetDate && (
                    <Text style={styles.planStat}>📅 {new Date(plan.targetDate).toLocaleDateString('he-IL')}</Text>
                  )}
                </View>
              </View>
            );
          })
        )}
        <View style={{ height: 40 }} />
      </ScrollView>

      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={save}><Text style={styles.modalSave}>שמור</Text></TouchableOpacity>
            <Text style={styles.modalTitle}>{editPlan ? 'עריכת תוכנית' : 'תוכנית חדשה'}</Text>
            <TouchableOpacity onPress={() => setShowModal(false)}><Text style={styles.modalCancel}>ביטול</Text></TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
            <View>
              <Text style={styles.fieldLabel}>שם התוכנית</Text>
              <TextInput style={styles.fieldInput} value={title} onChangeText={setTitle}
                placeholder="לדוגמה: הכנה לבחינה - מרץ" placeholderTextColor={COLORS.textTertiary} textAlign="right" />
            </View>

            <View>
              <Text style={styles.fieldLabel}>תאריך יעד (YYYY-MM-DD)</Text>
              <TextInput style={styles.fieldInput} value={targetDate} onChangeText={setTargetDate}
                placeholder="2025-06-01" placeholderTextColor={COLORS.textTertiary} textAlign="right" />
            </View>

            <View>
              <Text style={styles.fieldLabel}>יעד יומי: {dailyGoal} שאלות</Text>
              <View style={styles.goalRow}>
                <TouchableOpacity style={styles.goalBtn} onPress={() => setDailyGoal(v => Math.max(5, v - 5))}>
                  <Text style={styles.goalBtnTxt}>−</Text>
                </TouchableOpacity>
                <View style={{ flex: 1, height: 8, backgroundColor: COLORS.border, borderRadius: 4 }}>
                  <View style={{ width: `${dailyGoal}%`, height: 8, backgroundColor: COLORS.primary, borderRadius: 4 }} />
                </View>
                <TouchableOpacity style={styles.goalBtn} onPress={() => setDailyGoal(v => Math.min(100, v + 5))}>
                  <Text style={styles.goalBtnTxt}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View>
              <Text style={styles.fieldLabel}>נושאים (ריק = כל הנושאים)</Text>
              <View style={styles.topicsGrid}>
                {TOPICS.map(t => {
                  const sel = selectedTopics.includes(t.id);
                  const color = TOPIC_COLORS[t.id];
                  return (
                    <TouchableOpacity
                      key={t.id}
                      style={[styles.topicToggle, sel && { borderColor: color, backgroundColor: color + '15' }]}
                      onPress={() => toggleTopic(t.id)}
                    >
                      <Text style={styles.topicToggleIcon}>{t.icon}</Text>
                      <Text style={[styles.topicToggleName, sel && { color }]}>{t.name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  back: { color: COLORS.primary, fontSize: 15, fontWeight: '600' },
  title: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  addBtn: { backgroundColor: COLORS.primary, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 7 },
  addBtnTxt: { color: '#fff', fontSize: 14, fontWeight: '700' },
  scroll: { padding: 16 },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 10 },
  emptyIcon: { fontSize: 52 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: COLORS.textSecondary },
  emptySub: { fontSize: 13, color: COLORS.textTertiary },
  planCard: {
    backgroundColor: COLORS.surface, borderRadius: 18, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6, elevation: 3,
    gap: 10,
  },
  planCardInactive: { opacity: 0.6 },
  planTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  planTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  planDays: { fontSize: 12, fontWeight: '600', marginTop: 3 },
  planActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  actionIcon: { fontSize: 20 },
  statusBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  statusActive: { backgroundColor: COLORS.successLight },
  statusInactive: { backgroundColor: COLORS.border },
  statusTxt: { fontSize: 12, fontWeight: '700' },
  topicChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'flex-end' },
  topicChip: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, backgroundColor: COLORS.background },
  topicChipTxt: { fontSize: 11, color: COLORS.text, fontWeight: '600' },
  allTopics: { fontSize: 12, color: COLORS.textTertiary, textAlign: 'right' },
  planStats: { flexDirection: 'row', justifyContent: 'flex-end', gap: 16 },
  planStat: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '600' },
  modal: { flex: 1, backgroundColor: COLORS.background },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  modalTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  modalSave: { color: COLORS.primary, fontSize: 15, fontWeight: '700' },
  modalCancel: { color: COLORS.danger, fontSize: 15 },
  fieldLabel: { fontSize: 14, fontWeight: '600', color: COLORS.text, textAlign: 'right', marginBottom: 7 },
  fieldInput: { backgroundColor: COLORS.surface, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12, padding: 13, fontSize: 14, color: COLORS.text },
  goalRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4 },
  goalBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.border, justifyContent: 'center', alignItems: 'center' },
  goalBtnTxt: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  topicsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  topicToggle: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.surface, flexDirection: 'row', alignItems: 'center', gap: 5 },
  topicToggleIcon: { fontSize: 16 },
  topicToggleName: { fontSize: 12, fontWeight: '600', color: COLORS.text },
});
