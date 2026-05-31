import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useApp } from '../../store/AppContext';
import { COLORS, TOPIC_COLORS } from '../../utils/colors';
import { ProgressBar } from '../../components/common';
import { BUILT_IN_QUESTIONS } from '../../data/questions';

const TOPICS = [
  { id: 'networking',       name: 'רשתות תקשורת',       icon: '🌐', desc: 'OSI, TCP/IP, Subnetting, Routing' },
  { id: 'security',         name: 'אבטחת מידע',          icon: '🔒', desc: 'Firewall, VPN, הצפנה, איומי סייבר' },
  { id: 'operatingSystems', name: 'מערכות הפעלה',        icon: '💻', desc: 'Windows Server, Linux, Active Directory' },
  { id: 'cloud',            name: 'ענן ווירטואליזציה',   icon: '☁️', desc: 'AWS, Azure, Docker, Kubernetes' },
  { id: 'itManagement',     name: 'ניהול IT',             icon: '📋', desc: 'ITIL, SLA, Change Management' },
  { id: 'protocols',        name: 'פרוטוקולים',           icon: '🔄', desc: 'DNS, DHCP, HTTP, SSH, SMTP' },
];

export default function TopicsScreen({ navigation }: any) {
  const { state } = useApp();
  const { progress } = state;

  const totalAnswered = Object.values(progress.topicProgress).reduce((s, tp) => s + tp.answeredCount, 0);
  const totalQ = BUILT_IN_QUESTIONS.length;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Text style={styles.title}>נושאים</Text>
        <Text style={styles.sub}>בחר נושא לתרגול ממוקד</Text>

        {/* Overall progress pill */}
        <View style={styles.overallPill}>
          <ProgressBar value={totalAnswered} total={totalQ} color={COLORS.primary} height={6} style={{ flex: 1 }} />
          <Text style={styles.overallTxt}>{totalAnswered}/{totalQ} שאלות</Text>
        </View>

        {TOPICS.map(t => {
          const tp = progress.topicProgress[t.id];
          const total = BUILT_IN_QUESTIONS.filter(q => q.topic === t.id).length;
          const answered = tp?.answeredCount ?? 0;
          const pct = tp && answered > 0 ? (tp.correctCount / answered) * 100 : 0;
          const color = TOPIC_COLORS[t.id] || COLORS.primary;
          const isStarted = answered > 0;

          return (
            <TouchableOpacity
              key={t.id}
              style={[styles.card, { borderLeftColor: color }]}
              onPress={() => navigation.navigate('TopicDetail', { topicID: t.id })}
              activeOpacity={0.75}
            >
              <View style={styles.cardTop}>
                {/* Left: stats */}
                <View style={styles.cardLeft}>
                  {isStarted ? (
                    <View style={[styles.pctBadge, { backgroundColor: pct >= 70 ? COLORS.successLight : COLORS.warningLight }]}>
                      <Text style={[styles.pctBadgeText, { color: pct >= 70 ? COLORS.success : COLORS.warning }]}>
                        {Math.round(pct)}%
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.newBadge}>
                      <Text style={styles.newBadgeTxt}>חדש</Text>
                    </View>
                  )}
                  <Text style={styles.cardAnswered}>{answered}/{total}</Text>
                </View>

                {/* Right: icon + info */}
                <View style={styles.cardRight}>
                  <View style={[styles.iconWrap, { backgroundColor: color + '18' }]}>
                    <Text style={styles.iconText}>{t.icon}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardName}>{t.name}</Text>
                    <Text style={styles.cardDesc}>{t.desc}</Text>
                  </View>
                </View>
              </View>

              {/* Progress bar */}
              <ProgressBar
                value={isStarted ? answered : 0}
                total={total}
                color={color}
                height={5}
                style={{ marginTop: 12 }}
              />
            </TouchableOpacity>
          );
        })}

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: 16 },
  title: { fontSize: 26, fontWeight: '800', color: COLORS.text, textAlign: 'right', marginBottom: 4 },
  sub: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'right', marginBottom: 14 },
  overallPill: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 12, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
  },
  overallTxt: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '600', minWidth: 80, textAlign: 'right' },
  card: {
    backgroundColor: COLORS.surface, borderRadius: 18, padding: 16, marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6, elevation: 3,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardRight: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  cardLeft: { alignItems: 'flex-end', gap: 6, minWidth: 50 },
  iconWrap: { width: 50, height: 50, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  iconText: { fontSize: 26 },
  cardName: { fontSize: 16, fontWeight: '700', color: COLORS.text, textAlign: 'right' },
  cardDesc: { fontSize: 11, color: COLORS.textSecondary, textAlign: 'right', marginTop: 3, lineHeight: 16 },
  cardAnswered: { fontSize: 11, color: COLORS.textSecondary },
  pctBadge: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  pctBadgeText: { fontSize: 13, fontWeight: '800' },
  newBadge: { backgroundColor: COLORS.primaryLight, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  newBadgeTxt: { fontSize: 11, color: COLORS.primary, fontWeight: '700' },
});
