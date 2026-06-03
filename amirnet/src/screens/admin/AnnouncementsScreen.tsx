import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView,
  TextInput, Modal, ScrollView, Alert,
} from 'react-native';
import { useApp } from '../../store/AppContext';
import { COLORS } from '../../utils/colors';
import { Announcement } from '../../types';
import { generateId } from '../../utils/hashUtils';

const TYPE_OPTIONS: { type: Announcement['type']; label: string; icon: string; color: string; bg: string }[] = [
  { type: 'info',    label: 'מידע',   icon: 'ℹ️', color: COLORS.info,    bg: COLORS.infoLight },
  { type: 'success', label: 'הצלחה',  icon: '✅', color: COLORS.success, bg: COLORS.successLight },
  { type: 'warning', label: 'אזהרה',  icon: '⚠️', color: COLORS.warning, bg: COLORS.warningLight },
];

export default function AnnouncementsScreen({ navigation }: any) {
  const { state, dispatch } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [type, setType] = useState<Announcement['type']>('info');

  function openForm() { setTitle(''); setBody(''); setType('info'); setShowForm(true); }

  function saveAnn() {
    if (!title.trim()) { Alert.alert('שגיאה', 'נדרשת כותרת'); return; }
    const ann: Announcement = {
      id: generateId(), title: title.trim(), body: body.trim(), type,
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_ANNOUNCEMENT', payload: ann });
    setShowForm(false);
  }

  function deleteAnn(id: string) {
    Alert.alert('מחיקת הכרזה', 'למחוק הכרזה זו?', [
      { text: 'ביטול', style: 'cancel' },
      { text: 'מחק', style: 'destructive', onPress: () => dispatch({ type: 'DELETE_ANNOUNCEMENT', payload: id }) },
    ]);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>‹ חזרה</Text></TouchableOpacity>
        <Text style={styles.title}>הכרזות 📢</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openForm}>
          <Text style={styles.addBtnTxt}>+ הוסף</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoTxt}>הכרזות מוצגות למשתמשים במסך הבית</Text>
      </View>

      <FlatList
        data={state.announcements}
        keyExtractor={a => a.id}
        contentContainerStyle={{ padding: 12 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📢</Text>
            <Text style={styles.emptyTxt}>אין הכרזות פעילות</Text>
            <Text style={styles.emptySub}>הכרזות שתיצור יופיעו לכל המשתמשים</Text>
          </View>
        }
        renderItem={({ item: ann }) => {
          const t = TYPE_OPTIONS.find(o => o.type === ann.type) ?? TYPE_OPTIONS[0];
          return (
            <View style={[styles.annCard, { borderLeftColor: t.color, borderLeftWidth: 4 }]}>
              <View style={styles.annTop}>
                <TouchableOpacity onPress={() => deleteAnn(ann.id)} style={styles.delBtn}>
                  <Text>🗑</Text>
                </TouchableOpacity>
                <View style={{ flex: 1, alignItems: 'flex-end', gap: 4 }}>
                  <View style={[styles.typeBadge, { backgroundColor: t.bg }]}>
                    <Text style={[styles.typeText, { color: t.color }]}>{t.icon} {t.label}</Text>
                  </View>
                  <Text style={styles.annTitle}>{ann.title}</Text>
                  {ann.body ? <Text style={styles.annBody}>{ann.body}</Text> : null}
                </View>
              </View>
              <Text style={styles.annDate}>{new Date(ann.createdAt).toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</Text>
            </View>
          );
        }}
      />

      <Modal visible={showForm} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowForm(false)}><Text style={styles.cancel}>ביטול</Text></TouchableOpacity>
            <Text style={styles.modalTitle}>הכרזה חדשה</Text>
            <TouchableOpacity onPress={saveAnn}><Text style={styles.save}>שמור</Text></TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
            <Text style={styles.label}>כותרת *</Text>
            <TextInput
              style={styles.input}
              value={title} onChangeText={setTitle}
              placeholder="כותרת ההכרזה"
              placeholderTextColor={COLORS.textTertiary}
              textAlign="right"
            />
            <Text style={styles.label}>תוכן (אופציונלי)</Text>
            <TextInput
              style={[styles.input, { height: 90, textAlignVertical: 'top' }]}
              value={body} onChangeText={setBody}
              multiline
              placeholder="פרטים נוספים..."
              placeholderTextColor={COLORS.textTertiary}
              textAlign="right"
            />
            <Text style={styles.label}>סוג הכרזה</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
              {TYPE_OPTIONS.map(o => (
                <TouchableOpacity
                  key={o.type}
                  style={[styles.typeOpt, {
                    borderColor: type === o.type ? o.color : COLORS.border,
                    backgroundColor: type === o.type ? o.bg : COLORS.surface,
                    flex: 1,
                  }]}
                  onPress={() => setType(o.type)}
                >
                  <Text style={{ fontSize: 18 }}>{o.icon}</Text>
                  <Text style={[styles.typeOptTxt, { color: type === o.type ? o.color : COLORS.textSecondary }]}>{o.label}</Text>
                </TouchableOpacity>
              ))}
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
  back: { color: COLORS.primary, fontSize: 15 },
  title: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  addBtn: { backgroundColor: COLORS.primary, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
  addBtnTxt: { color: '#fff', fontWeight: '700', fontSize: 14 },
  infoBox: { backgroundColor: COLORS.primaryLight, marginHorizontal: 12, borderRadius: 10, padding: 10, marginBottom: 4 },
  infoTxt: { color: COLORS.primary, fontSize: 13, fontWeight: '600', textAlign: 'right' },
  empty: { alignItems: 'center', paddingVertical: 50, gap: 10 },
  emptyIcon: { fontSize: 44 },
  emptyTxt: { fontSize: 16, color: COLORS.textSecondary, fontWeight: '600' },
  emptySub: { fontSize: 13, color: COLORS.textTertiary, textAlign: 'center' },
  annCard: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },
  annTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 6 },
  delBtn: { backgroundColor: COLORS.dangerLight, borderRadius: 8, padding: 6, alignSelf: 'flex-start' },
  typeBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-end' },
  typeText: { fontSize: 12, fontWeight: '700' },
  annTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, textAlign: 'right' },
  annBody: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'right', lineHeight: 18 },
  annDate: { fontSize: 11, color: COLORS.textTertiary, textAlign: 'right' },
  modal: { flex: 1, backgroundColor: COLORS.background },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  modalTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  cancel: { color: COLORS.danger, fontSize: 15 },
  save: { color: COLORS.primary, fontSize: 15, fontWeight: '700' },
  label: { fontSize: 14, fontWeight: '700', color: COLORS.text, textAlign: 'right', marginBottom: 6, marginTop: 12 },
  input: { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12, padding: 12, fontSize: 14, color: COLORS.text, backgroundColor: COLORS.surface },
  typeOpt: { padding: 12, borderRadius: 12, borderWidth: 1.5, alignItems: 'center', gap: 4 },
  typeOptTxt: { fontSize: 13, fontWeight: '600' },
});
