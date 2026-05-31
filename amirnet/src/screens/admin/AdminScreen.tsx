import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useApp } from '../../store/AppContext';
import { COLORS } from '../../utils/colors';
import { BUILT_IN_QUESTIONS } from '../../data/questions';

const ADMIN_ITEMS = [
  { icon: '❓', label: 'ניהול שאלות',       sub: (c: any) => `${BUILT_IN_QUESTIONS.length} מובנות · ${c.customQuestions.length} מותאמות`, screen: 'QuestionManager', color: COLORS.primary },
  { icon: '📥', label: 'ייבוא שאלות',       sub: () => 'CSV / JSON',                                                                         screen: 'ImportQuestions',  color: COLORS.success },
  { icon: '📤', label: 'ייצוא שאלות',       sub: (c: any) => `${c.customQuestions.length} מותאמות לייצוא`,                                     screen: 'ExportQuestions',  color: COLORS.info },
  { icon: '📚', label: 'ניהול פרקים',       sub: (c: any) => `${c.chapters.length} פרקים`,                                                    screen: 'ChapterManager',   color: COLORS.orange },
  { icon: '📋', label: 'ניהול בחינות',      sub: (c: any) => `${c.examTemplates.length} תבניות`,                                              screen: 'ExamManager',      color: COLORS.secondary },
  { icon: '👥', label: 'ניהול משתמשים',     sub: (c: any) => `${c.auth.users.length} משתמשים`,                                                screen: 'UserManager',      color: COLORS.info },
  { icon: '📢', label: 'הכרזות',            sub: (c: any) => `${c.announcements.length} פעילות`,                                              screen: 'Announcements',    color: COLORS.warning },
  { icon: '📊', label: 'סטטיסטיקות מתקדמות', sub: () => 'ניתוח ביצועים ונתונים',                                                              screen: 'SystemStats',      color: COLORS.purple },
  { icon: '💾', label: 'גיבוי ושחזור',      sub: () => 'ייצוא / ייבוא נתונים',                                                                screen: 'BackupRestore',    color: COLORS.success },
];

export default function AdminScreen({ navigation }: any) {
  const { state } = useApp();
  const isAdmin = state.auth.currentUser?.role === 'admin';

  if (!isAdmin) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.noAccess}>
          <Text style={styles.noAccessIcon}>🔒</Text>
          <Text style={styles.noAccessTitle}>אין גישה</Text>
          <Text style={styles.noAccessSub}>רק מנהלים יכולים לגשת לדף זה</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>ניהול 👑</Text>
          <View style={styles.adminBadge}>
            <Text style={styles.adminBadgeTxt}>מנהל</Text>
          </View>
        </View>
        <Text style={styles.sub}>ניהול מערכת AmirNet Plus</Text>

        {/* Stats summary */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>{BUILT_IN_QUESTIONS.length + state.customQuestions.length}</Text>
            <Text style={styles.statLbl}>שאלות</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>{state.chapters.length}</Text>
            <Text style={styles.statLbl}>פרקים</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>{state.examTemplates.length}</Text>
            <Text style={styles.statLbl}>בחינות</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>{state.auth.users.length}</Text>
            <Text style={styles.statLbl}>משתמשים</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>{state.announcements.length}</Text>
            <Text style={styles.statLbl}>הכרזות</Text>
          </View>
        </View>

        {ADMIN_ITEMS.map(item => (
          <TouchableOpacity
            key={item.screen}
            style={styles.menuItem}
            onPress={() => navigation.navigate(item.screen)}
            activeOpacity={0.75}
          >
            <Text style={styles.menuChevron}>›</Text>
            <View style={styles.menuContent}>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={styles.menuSub}>{item.sub(state)}</Text>
            </View>
            <View style={[styles.menuIconWrap, { backgroundColor: item.color + '20' }]}>
              <Text style={styles.menuIcon}>{item.icon}</Text>
            </View>
          </TouchableOpacity>
        ))}

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 10, marginBottom: 4 },
  title: { fontSize: 26, fontWeight: '800', color: COLORS.text },
  adminBadge: { backgroundColor: '#FEF3C7', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  adminBadgeTxt: { fontSize: 12, color: '#D97706', fontWeight: '700' },
  sub: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'right', marginBottom: 16 },
  statsRow: {
    flexDirection: 'row', gap: 8, marginBottom: 20,
    backgroundColor: COLORS.surface, borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },
  statBox: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 22, fontWeight: '800', color: COLORS.primary },
  statLbl: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  menuItem: {
    backgroundColor: COLORS.surface, borderRadius: 16, padding: 16, marginBottom: 10,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },
  menuIconWrap: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  menuIcon: { fontSize: 26 },
  menuContent: { flex: 1, alignItems: 'flex-end' },
  menuLabel: { fontSize: 16, fontWeight: '700', color: COLORS.text, textAlign: 'right' },
  menuSub: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'right', marginTop: 2 },
  menuChevron: { fontSize: 22, color: COLORS.textTertiary },
  noAccess: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  noAccessIcon: { fontSize: 60 },
  noAccessTitle: { fontSize: 22, fontWeight: '800', color: COLORS.text },
  noAccessSub: { fontSize: 15, color: COLORS.textSecondary },
});
