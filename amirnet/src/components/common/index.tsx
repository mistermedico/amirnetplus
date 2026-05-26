import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { COLORS, DIFFICULTY_COLORS, DIFFICULTY_BG, TOPIC_COLORS } from '../../utils/colors';
import { Difficulty, TopicID } from '../../types';

// ─── Card ─────────────────────────────────────────────────────────────────────

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

// ─── Badge ────────────────────────────────────────────────────────────────────

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  const label = { easy: 'קל', medium: 'בינוני', hard: 'קשה' }[difficulty];
  return (
    <View style={[styles.badge, { backgroundColor: DIFFICULTY_BG[difficulty] }]}>
      <Text style={[styles.badgeText, { color: DIFFICULTY_COLORS[difficulty] }]}>{label}</Text>
    </View>
  );
}

export function TopicBadge({ topicID, label }: { topicID: TopicID; label: string }) {
  const color = TOPIC_COLORS[topicID] || COLORS.primary;
  return (
    <View style={[styles.badge, { backgroundColor: color + '20' }]}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────

export function ProgressBar({
  value, total, color, height = 8, style,
}: { value: number; total: number; color?: string; height?: number; style?: ViewStyle }) {
  const pct = total > 0 ? Math.min(value / total, 1) : 0;
  const barColor = color || COLORS.primary;
  return (
    <View style={[{ height, backgroundColor: COLORS.border, borderRadius: height / 2 }, style]}>
      <View style={{ width: `${pct * 100}%`, height, backgroundColor: barColor, borderRadius: height / 2 }} />
    </View>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

export function StatCard({
  value, label, color, style,
}: { value: string; label: string; color?: string; style?: ViewStyle }) {
  return (
    <View style={[styles.statCard, style]}>
      <Text style={[styles.statValue, { color: color || COLORS.primary }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────

export function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      {action && onAction && (
        <TouchableOpacity onPress={onAction}>
          <Text style={{ color: COLORS.primary, fontSize: 14 }}>{action}</Text>
        </TouchableOpacity>
      )}
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

export function EmptyState({ icon, title, subtitle }: { icon: string; title: string; subtitle?: string }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyIcon}>{icon}</Text>
      <Text style={styles.emptyTitle}>{title}</Text>
      {subtitle && <Text style={styles.emptySubtitle}>{subtitle}</Text>}
    </View>
  );
}

// ─── Button ───────────────────────────────────────────────────────────────────

export function PrimaryButton({
  title, onPress, color, disabled, style,
}: { title: string; onPress: () => void; color?: string; disabled?: boolean; style?: ViewStyle }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[styles.primaryBtn, { backgroundColor: disabled ? COLORS.border : (color || COLORS.primary) }, style]}
    >
      <Text style={[styles.primaryBtnText, { color: disabled ? COLORS.textSecondary : '#fff' }]}>{title}</Text>
    </TouchableOpacity>
  );
}

export function SecondaryButton({
  title, onPress, style,
}: { title: string; onPress: () => void; style?: ViewStyle }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.secondaryBtn, style]}>
      <Text style={styles.secondaryBtnText}>{title}</Text>
    </TouchableOpacity>
  );
}

// ─── Score Ring ───────────────────────────────────────────────────────────────

export function ScoreRing({ pct, size = 120, color }: { pct: number; size?: number; color?: string }) {
  const ringColor = color || (pct >= 80 ? COLORS.success : pct >= 60 ? COLORS.warning : COLORS.danger);
  return (
    <View style={[styles.ring, { width: size, height: size, borderRadius: size / 2, borderColor: ringColor }]}>
      <Text style={[styles.ringValue, { color: ringColor, fontSize: size * 0.26 }]}>{Math.round(pct)}%</Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'right',
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.textTertiary,
    textAlign: 'center',
  },
  primaryBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: COLORS.border,
  },
  secondaryBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  ring: {
    borderWidth: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  ringValue: {
    fontWeight: '800',
  },
});
