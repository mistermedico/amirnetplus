import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useApp } from '../../store/AppContext';
import { COLORS } from '../../utils/colors';
import { BUILT_IN_QUESTIONS } from '../../data/questions';

const SECTIONS = [
  {
    title: 'ניהול תוכן',
    items: [
      { icon: '❓', label: 'ניהול שאלות',       sub: (c: any) => `${BUILT_IN_QUESTIONS.length + c.customQuestions.length} שאלות סה"כ`, screen: 'QuestionManager',   color: COLORS.primary },
      { icon: '📥', label: 'ייבוא שאלות',       sub: () => 'CSV / JSON',                                                                  screen: 'ImportQuestions',  color: COLORS.success },
      { icon: '📤', label: 'ייצוא שאלות',       sub: (c: any) => `${c.customQuestions.length} מותאמות לייצוא`,                           screen: 'ExportQuestions',  color: COLORS.info },
      { icon: '📚', label: 'ניהול פרקים',        sub: (c: any) => `${c.chapters.length} פרקים`,                                           screen: 'ChapterManager',     color: COLORS.orange },
      { icon: '📋', label: 'ניהול בחינות',      sub: (c: any) => `${c.examTemplates.length} תבניות`,                                     screen: 'ExamManager',        color: COLORS.secondary },
      { icon: '🏷️', label: 'ניהול תגיות',       sub: () => 'ארגון ועיון תגיות שאלות',                                                    screen: 'TagManager',          color: COLORS.primary },
      { icon: '⚡', label: 'בנאי בחינה מהיר',   sub: () => 'בניית בחינה 3 שלבים',                                                       screen: 'QuickExamBuilder',   color: COLORS.success },
      { icon: '📅', label: 'תוכניות לימוד',      sub: (c: any) => `${c.progress?.studyPlans?.length ?? 0} תוכניות`,                     screen: 'StudyPlanManager',   color: COLORS.info },
    ],
  },
  {
    title: 'משתמשים ותקשורת',
    items: [
      { icon: '👥', label: 'ניהול משתמשים',     sub: (c: any) => `${c.auth.users.length} משתמשים`,                                       screen: 'UserManager',      color: COLORS.info },
      { icon: '📢', label: 'הכרזות',            sub: (c: any) => `${c.announcements.length} פעילות`,                                     screen: 'Announcements',    color: COLORS.warning },
    ],
  },
  {
    title: 'ניתוח ומערכת',
    items: [
      { icon: '📊', label: 'סטטיסטיקות מתקדמות', sub: () => 'ניתוח ביצועים ונתונים',                                                    screen: 'SystemStats',           color: COLORS.purple },
      { icon: '🎯', label: 'ביצועי שאלות',        sub: () => 'דיוק וקושי לפי שאלה',                                                     screen: 'QuestionPerformance',   color: COLORS.danger },
      { icon: '📆', label: 'לוח פעילות',          sub: () => 'לוח פעילות חודשי',                                                         screen: 'ActivityCalendar',      color: COLORS.info },
      { icon: '⚙️', label: 'הגדרות מערכת',        sub: () => 'ברירות מחדל לבחינה',                                                        screen: 'SystemSettings',        color: COLORS.secondary },
      { icon: '💾', label: 'גיבוי ושחזור',        sub: () => 'ייצוא / ייבוא נתונים',                                                      screen: 'BackupRestore',         color: COLORS.success },
    ],
  },
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
          {[
            { val: BUILT_IN_QUESTIONS.length + state.customQuestions.length, lbl: 'שאלות' },
            { val: state.chapters.length, lbl: 'פרקים' },
            { val: state.examTemplates.length, lbl: 'בחינות' },
            { val: state.auth.users.length, lbl: 'משתמשים' },
            { val: state.announcements.length, lbl: 'הכרזות' },
          ].map(s => (
            <View key={s.lbl} style={styles.statBox}>
              <Text style={styles.statVal}>{s.val}</Text>
              <Text style={styles.statLbl}>{s.lbl}</Text>
            </View>
          ))}
        </View>

        {SECTIONS.map(section => (
          <View key={section.title}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionAccent} />
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
            {section.items.map(item => (
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
          </View>
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
  statVal: { fontSize: 20, fontWeight: '800', color: COLORS.primary },
  statLbl: { fontSize: 10, color: COLORS.textSecondary, marginTop: 2, textAlign: 'center' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 8, marginBottom: 10, marginTop: 8 },
  sectionAccent: { width: 3, height: 16, borderRadius: 2, backgroundColor: COLORS.primary },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  menuItem: {
    backgroundColor: COLORS.surface, borderRadius: 16, padding: 16, marginBottom: 8,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2,
  },
  menuIconWrap: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  menuIcon: { fontSize: 26 },
  menuContent: { flex: 1, alignItems: 'flex-end' },
  menuLabel: { fontSize: 16, fontWeight: '700', color: COLORS.text, textAlign: 'right' },
  menuSub: { fontSize: 12, color: COLORS.textSecondary, textAlign: 'right', marginTop: 2 },
  menuChevron: { fontSize: 22, color: COLORS.textTertiary },
  noAccess: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  noAccessIcon: { fontSize: 60 },
  noAccessTitle: { fontSize: 22, fontWeight: '800', color: COLORS.text },
  noAccessSub: { fontSize: 15, color: COLORS.textSecondary },
});
