import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  TextInput, ScrollView, FlatList,
} from 'react-native';
import { useApp } from '../../store/AppContext';
import { COLORS, TOPIC_COLORS } from '../../utils/colors';
import { BUILT_IN_QUESTIONS } from '../../data/questions';
import { DifficultyBadge } from '../../components/common';

export default function TagManagerScreen({ navigation }: any) {
  const { state } = useApp();
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const allQ = useMemo(() => [...BUILT_IN_QUESTIONS, ...state.customQuestions], [state.customQuestions]);

  const tagMap = useMemo(() => {
    const map: Record<string, string[]> = {};
    allQ.forEach(q => {
      (q.tags || []).forEach(tag => {
        if (!map[tag]) map[tag] = [];
        map[tag].push(q.id);
      });
    });
    return map;
  }, [allQ]);

  const filteredTags = useMemo(() => {
    return Object.entries(tagMap)
      .filter(([tag]) => !search || tag.includes(search))
      .sort((a, b) => b[1].length - a[1].length);
  }, [tagMap, search]);

  const selectedQuestions = useMemo(() => {
    if (!selectedTag) return [];
    return allQ.filter(q => (q.tags || []).includes(selectedTag));
  }, [selectedTag, allQ]);

  const totalTagged = useMemo(() => allQ.filter(q => q.tags?.length > 0).length, [allQ]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => { if (selectedTag) setSelectedTag(null); else navigation.goBack(); }}>
          <Text style={styles.back}>‹ {selectedTag ? 'תגיות' : 'חזרה'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{selectedTag ? `#${selectedTag}` : 'ניהול תגיות'}</Text>
        <View style={{ width: 60 }} />
      </View>

      {!selectedTag ? (
        <>
          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>{Object.keys(tagMap).length}</Text>
              <Text style={styles.statLbl}>תגיות ייחודיות</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statVal}>{totalTagged}</Text>
              <Text style={styles.statLbl}>שאלות עם תגיות</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statVal}>{allQ.length - totalTagged}</Text>
              <Text style={styles.statLbl}>ללא תגיות</Text>
            </View>
          </View>

          {/* Search */}
          <View style={styles.searchWrap}>
            <TextInput
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
              placeholder="חפש תגית..."
              placeholderTextColor={COLORS.textTertiary}
              textAlign="right"
            />
          </View>

          {/* Tags */}
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            {filteredTags.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyIcon}>🏷️</Text>
                <Text style={styles.emptyTxt}>{search ? 'לא נמצאו תגיות' : 'אין תגיות בשאלות'}</Text>
                <Text style={styles.emptySub}>הוסף תגיות לשאלות דרך ניהול שאלות</Text>
              </View>
            ) : (
              <View style={styles.tagsWrap}>
                {filteredTags.map(([tag, ids]) => (
                  <TouchableOpacity
                    key={tag}
                    style={styles.tagChip}
                    onPress={() => setSelectedTag(tag)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.tagCount}>{ids.length}</Text>
                    <Text style={styles.tagName}>#{tag}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            <View style={{ height: 30 }} />
          </ScrollView>
        </>
      ) : (
        <FlatList
          data={selectedQuestions}
          keyExtractor={q => q.id}
          contentContainerStyle={styles.scroll}
          ListHeaderComponent={
            <Text style={styles.tagHeader}>
              {selectedQuestions.length} שאלות עם תגית #{selectedTag}
            </Text>
          }
          renderItem={({ item: q }) => (
            <View style={styles.qCard}>
              <View style={styles.qTop}>
                <DifficultyBadge difficulty={q.difficulty} />
                <View style={[styles.topicDot, { backgroundColor: TOPIC_COLORS[q.topic] + '30' }]}>
                  <Text style={[styles.topicDotTxt, { color: TOPIC_COLORS[q.topic] }]}>
                    {{ networking: '🌐', security: '🔒', operatingSystems: '💻', cloud: '☁️', itManagement: '📋', protocols: '🔄' }[q.topic] ?? '❓'}
                  </Text>
                </View>
              </View>
              <Text style={styles.qText}>{q.questionText}</Text>
              <View style={styles.qTags}>
                {q.tags.map(t => (
                  <View key={t} style={[styles.miniTag, t === selectedTag && styles.miniTagActive]}>
                    <Text style={[styles.miniTagTxt, t === selectedTag && { color: COLORS.primary }]}>#{t}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingBottom: 12 },
  back: { color: COLORS.primary, fontSize: 15, fontWeight: '600' },
  title: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  statsRow: {
    flexDirection: 'row', backgroundColor: COLORS.surface, marginHorizontal: 16, borderRadius: 16,
    padding: 14, marginBottom: 12, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },
  statBox: { flex: 1, alignItems: 'center', gap: 4 },
  statDivider: { width: 1, height: 36, backgroundColor: COLORS.border },
  statVal: { fontSize: 20, fontWeight: '800', color: COLORS.primary },
  statLbl: { fontSize: 11, color: COLORS.textSecondary, textAlign: 'center' },
  searchWrap: { paddingHorizontal: 16, marginBottom: 8 },
  searchInput: {
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 12,
    fontSize: 14, color: COLORS.text, borderWidth: 1.5, borderColor: COLORS.border,
  },
  scroll: { padding: 16 },
  tagsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tagChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: COLORS.surface, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 9,
    borderWidth: 1.5, borderColor: COLORS.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
  },
  tagName: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  tagCount: {
    fontSize: 12, fontWeight: '700', color: '#fff',
    backgroundColor: COLORS.primary, borderRadius: 10,
    paddingHorizontal: 6, paddingVertical: 1, minWidth: 22, textAlign: 'center',
  },
  tagHeader: { fontSize: 15, fontWeight: '700', color: COLORS.text, textAlign: 'right', marginBottom: 12 },
  qCard: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3, gap: 8,
  },
  qTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  topicDot: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  topicDotTxt: { fontSize: 14 },
  qText: { fontSize: 14, color: COLORS.text, textAlign: 'right', lineHeight: 20 },
  qTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'flex-end' },
  miniTag: { backgroundColor: COLORS.border, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  miniTagActive: { backgroundColor: COLORS.primaryLight, borderWidth: 1, borderColor: COLORS.primary },
  miniTagTxt: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '600' },
  empty: { alignItems: 'center', paddingVertical: 50, gap: 10 },
  emptyIcon: { fontSize: 44 },
  emptyTxt: { fontSize: 16, color: COLORS.textSecondary, fontWeight: '600' },
  emptySub: { fontSize: 13, color: COLORS.textTertiary, textAlign: 'center' },
});
