import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useApp } from '../../store/AppContext';
import { COLORS } from '../../utils/colors';

const DAYS_HE = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];
const MONTHS_HE = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'];

function intensityColor(count: number): string {
  if (count === 0) return COLORS.border;
  if (count < 5)  return '#93C5FD';
  if (count < 15) return '#3B82F6';
  return COLORS.primary;
}

export default function ActivityCalendarScreen({ navigation }: any) {
  const { state } = useApp();
  const today = new Date();
  const [year, setYear]   = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const activityMap = useMemo(() => {
    const map: Record<string, { q: number; c: number }> = {};
    state.progress.dailyActivity.forEach(a => {
      map[a.date] = { q: a.questionsAnswered, c: a.correctAnswers };
    });
    return map;
  }, [state.progress.dailyActivity]);

  const calGrid = useMemo(() => {
    const firstDow = new Date(year, month, 1).getDay();
    const days = new Date(year, month + 1, 0).getDate();
    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDow; i++) cells.push(null);
    for (let d = 1; d <= days; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [year, month]);

  const monthStats = useMemo(() => {
    let total = 0, daysActive = 0, best = 0;
    for (let d = 1; d <= new Date(year, month + 1, 0).getDate(); d++) {
      const key = new Date(year, month, d).toDateString();
      const a = activityMap[key];
      if (a) { total += a.q; if (a.q > 0) daysActive++; if (a.q > best) best = a.q; }
    }
    return { total, daysActive, best };
  }, [activityMap, year, month]);

  function prevMonth() { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); }
  function nextMonth() { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); }

  const recentActivity = useMemo(() =>
    state.progress.dailyActivity.slice().reverse().slice(0, 14),
    [state.progress.dailyActivity]
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>‹ חזרה</Text></TouchableOpacity>
        <Text style={styles.title}>לוח פעילות</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Month stats */}
        <View style={styles.statsRow}>
          {[
            { val: monthStats.total,      lbl: 'שאלות החודש', color: COLORS.primary },
            { val: monthStats.daysActive, lbl: 'ימי פעילות',  color: COLORS.success },
            { val: monthStats.best,       lbl: 'שיא יומי',    color: COLORS.orange },
          ].map((s, i) => (
            <React.Fragment key={i}>
              {i > 0 && <View style={styles.statDiv} />}
              <View style={styles.statCell}>
                <Text style={[styles.statVal, { color: s.color }]}>{s.val}</Text>
                <Text style={styles.statLbl}>{s.lbl}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>

        {/* Month navigation */}
        <View style={styles.monthNav}>
          <TouchableOpacity onPress={nextMonth} style={styles.navBtn}><Text style={styles.navTxt}>›</Text></TouchableOpacity>
          <Text style={styles.monthTitle}>{MONTHS_HE[month]} {year}</Text>
          <TouchableOpacity onPress={prevMonth} style={styles.navBtn}><Text style={styles.navTxt}>‹</Text></TouchableOpacity>
        </View>

        {/* Day headers */}
        <View style={styles.dowRow}>
          {DAYS_HE.map(d => <Text key={d} style={styles.dowLbl}>{d}</Text>)}
        </View>

        {/* Calendar grid */}
        <View style={styles.grid}>
          {calGrid.map((day, i) => {
            if (day === null) return <View key={`e${i}`} style={styles.cell} />;
            const key = new Date(year, month, day).toDateString();
            const a = activityMap[key];
            const count = a?.q ?? 0;
            const isToday = key === today.toDateString();
            const bg = intensityColor(count);
            return (
              <View key={i} style={styles.cell}>
                <View style={[styles.cellInner, { backgroundColor: bg }, isToday && styles.cellToday]}>
                  <Text style={[styles.cellNum, count > 0 && { color: '#fff', fontWeight: '700' }]}>{day}</Text>
                </View>
                {count > 0 && <Text style={styles.cellCount}>{count}</Text>}
              </View>
            );
          })}
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <Text style={styles.legendLbl}>ללא</Text>
          {[COLORS.border, '#93C5FD', '#3B82F6', COLORS.primary].map(c => (
            <View key={c} style={[styles.legendDot, { backgroundColor: c }]} />
          ))}
          <Text style={styles.legendLbl}>הרבה</Text>
        </View>

        {/* Recent activity list */}
        <Text style={styles.sectionTitle}>פעילות אחרונה</Text>
        {recentActivity.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📅</Text>
            <Text style={styles.emptyTxt}>אין פעילות עדיין</Text>
          </View>
        ) : (
          recentActivity.map(a => {
            const pct = a.questionsAnswered > 0 ? Math.round((a.correctAnswers / a.questionsAnswered) * 100) : 0;
            const color = pct >= 70 ? COLORS.success : COLORS.warning;
            return (
              <View key={a.date} style={[styles.actRow, { borderLeftColor: color }]}>
                <View style={styles.actLeft}>
                  <Text style={[styles.actPct, { color }]}>{pct}%</Text>
                  <Text style={styles.actCount}>{a.questionsAnswered} שאלות</Text>
                </View>
                <Text style={styles.actDate}>
                  {new Date(a.date).toLocaleDateString('he-IL', { weekday: 'short', day: 'numeric', month: 'short' })}
                </Text>
              </View>
            );
          })
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  back: { color: COLORS.primary, fontSize: 15, fontWeight: '600' },
  title: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  scroll: { padding: 16 },
  statsRow: { flexDirection: 'row', backgroundColor: COLORS.surface, borderRadius: 16, padding: 14, marginBottom: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3 },
  statCell: { flex: 1, alignItems: 'center', gap: 3 },
  statDiv: { width: 1, height: 36, backgroundColor: COLORS.border },
  statVal: { fontSize: 22, fontWeight: '800' },
  statLbl: { fontSize: 11, color: COLORS.textSecondary, textAlign: 'center' },
  monthNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  navBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.border },
  navTxt: { fontSize: 22, color: COLORS.primary, fontWeight: '700' },
  monthTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  dowRow: { flexDirection: 'row', marginBottom: 6 },
  dowLbl: { flex: 1, textAlign: 'center', fontSize: 12, fontWeight: '600', color: COLORS.textSecondary },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
  cell: { width: `${100 / 7}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 2 },
  cellInner: { width: 30, height: 30, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  cellToday: { borderWidth: 2, borderColor: COLORS.primary },
  cellNum: { fontSize: 12, color: COLORS.textSecondary },
  cellCount: { fontSize: 8, color: COLORS.textTertiary, marginTop: 1 },
  legend: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 20 },
  legendDot: { width: 14, height: 14, borderRadius: 4 },
  legendLbl: { fontSize: 11, color: COLORS.textSecondary },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text, textAlign: 'right', marginBottom: 10 },
  actRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 12, marginBottom: 6,
    borderLeftWidth: 3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },
  actLeft: { gap: 2 },
  actDate: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  actPct: { fontSize: 17, fontWeight: '800' },
  actCount: { fontSize: 11, color: COLORS.textSecondary },
  empty: { alignItems: 'center', paddingVertical: 30, gap: 8 },
  emptyIcon: { fontSize: 40 },
  emptyTxt: { color: COLORS.textSecondary, fontSize: 14 },
});
