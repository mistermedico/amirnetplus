import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert, ScrollView,
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useApp } from '../../store/AppContext';
import { COLORS } from '../../utils/colors';
import { BUILT_IN_QUESTIONS } from '../../data/questions';
import { Question } from '../../types';

type ExportScope = 'custom' | 'all';
type ExportFormat = 'json' | 'csv';

function toCSVLine(q: Question): string {
  const escape = (s: string) => `"${String(s ?? '').replace(/"/g, '""')}"`;
  return [
    escape(q.questionText),
    escape(q.options[0] ?? ''),
    escape(q.options[1] ?? ''),
    escape(q.options[2] ?? ''),
    escape(q.options[3] ?? ''),
    q.correctIndex,
    escape(q.explanation),
    q.topic,
    q.difficulty,
  ].join(',');
}

const CSV_HEADER = 'question,option_a,option_b,option_c,option_d,correct_index,explanation,topic,difficulty';

export default function ExportQuestionsScreen({ navigation }: any) {
  const { state } = useApp();
  const [scope, setScope] = useState<ExportScope>('custom');
  const [format, setFormat] = useState<ExportFormat>('json');
  const [exported, setExported] = useState(false);

  const allQ = [...BUILT_IN_QUESTIONS, ...state.customQuestions];
  const targetQ = scope === 'custom' ? state.customQuestions : allQ;

  async function doExport() {
    if (targetQ.length === 0) {
      Alert.alert('שגיאה', scope === 'custom' ? 'אין שאלות מותאמות לייצוא' : 'אין שאלות לייצוא');
      return;
    }

    try {
      let content: string;
      let mimeType: string;
      let ext: string;

      if (format === 'json') {
        content = JSON.stringify(targetQ.map(q => ({
          questionText: q.questionText,
          options: q.options,
          correctIndex: q.correctIndex,
          explanation: q.explanation,
          topic: q.topic,
          difficulty: q.difficulty,
          tags: q.tags,
        })), null, 2);
        mimeType = 'application/json';
        ext = 'json';
      } else {
        const rows = targetQ.map(toCSVLine);
        content = [CSV_HEADER, ...rows].join('\n');
        mimeType = 'text/csv';
        ext = 'csv';
      }

      const scopeLabel = scope === 'custom' ? 'custom' : 'all';
      const filename = `amirnet_questions_${scopeLabel}_${new Date().toISOString().slice(0, 10)}.${ext}`;
      const path = (FileSystem.cacheDirectory ?? '') + filename;
      await FileSystem.writeAsStringAsync(path, content, { encoding: FileSystem.EncodingType.UTF8 });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(path, { mimeType, dialogTitle: `ייצוא ${targetQ.length} שאלות` });
        setExported(true);
      } else {
        Alert.alert('ייצוא', `הקובץ נוצר: ${filename}\nאך שיתוף אינו זמין במכשיר זה.`);
      }
    } catch {
      Alert.alert('שגיאה', 'לא ניתן לייצא שאלות');
    }
  }

  const TOPIC_COUNTS = Object.entries(
    targetQ.reduce<Record<string, number>>((acc, q) => {
      acc[q.topic] = (acc[q.topic] ?? 0) + 1;
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]);

  const TOPIC_NAMES: Record<string, string> = {
    networking: '🌐 רשתות', security: '🔒 אבטחה',
    operatingSystems: '💻 מערכות הפעלה', cloud: '☁️ ענן',
    itManagement: '📋 ניהול IT', protocols: '🔄 פרוטוקולים',
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>‹ חזרה</Text></TouchableOpacity>
        <Text style={styles.title}>ייצוא שאלות</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Scope selection */}
        <Text style={styles.label}>מה לייצא</Text>
        <View style={styles.toggleRow}>
          {([['custom', `מותאמות (${state.customQuestions.length})`], ['all', `כולן (${allQ.length})`]] as [ExportScope, string][]).map(([val, lbl]) => (
            <TouchableOpacity
              key={val}
              style={[styles.toggleBtn, scope === val && styles.toggleBtnActive]}
              onPress={() => { setScope(val); setExported(false); }}
            >
              <Text style={[styles.toggleTxt, scope === val && styles.toggleTxtActive]}>{lbl}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Format selection */}
        <Text style={styles.label}>פורמט</Text>
        <View style={styles.toggleRow}>
          {([['json', '📦 JSON'], ['csv', '📄 CSV']] as [ExportFormat, string][]).map(([val, lbl]) => (
            <TouchableOpacity
              key={val}
              style={[styles.toggleBtn, format === val && styles.toggleBtnActive]}
              onPress={() => { setFormat(val); setExported(false); }}
            >
              <Text style={[styles.toggleTxt, format === val && styles.toggleTxtActive]}>{lbl}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Preview stats */}
        <View style={styles.previewCard}>
          <Text style={styles.previewTitle}>
            {targetQ.length > 0 ? `${targetQ.length} שאלות לייצוא` : 'אין שאלות לייצוא'}
          </Text>
          {TOPIC_COUNTS.map(([tid, count]) => (
            <View key={tid} style={styles.topicRow}>
              <Text style={styles.topicCount}>{count}</Text>
              <View style={styles.topicBarBg}>
                <View style={[styles.topicBarFill, { width: `${(count / (targetQ.length || 1)) * 100}%` }]} />
              </View>
              <Text style={styles.topicName}>{TOPIC_NAMES[tid] ?? tid}</Text>
            </View>
          ))}
          {targetQ.length === 0 && (
            <Text style={styles.emptyNote}>
              {scope === 'custom' ? 'הוסף שאלות מותאמות דרך ניהול שאלות' : 'אין שאלות בבנק'}
            </Text>
          )}
        </View>

        {exported && (
          <View style={styles.successBox}>
            <Text style={styles.successTxt}>✅ {targetQ.length} שאלות יוצאו בהצלחה!</Text>
          </View>
        )}

        {/* Export button */}
        <TouchableOpacity
          style={[styles.exportBtn, targetQ.length === 0 && styles.exportBtnDisabled]}
          onPress={doExport}
          disabled={targetQ.length === 0}
          activeOpacity={0.85}
        >
          <Text style={styles.exportBtnTxt}>
            📤 יצא {targetQ.length} שאלות כ-{format.toUpperCase()}
          </Text>
        </TouchableOpacity>

        {/* Format notes */}
        <View style={styles.noteCard}>
          <Text style={styles.noteTitle}>💡 הסבר על הפורמטים</Text>
          <Text style={styles.noteText}>
            {'JSON: מומלץ לייבוא חזרה לאפליקציה. שומר את כל שדות השאלה.\n\nCSV: מתאים לעריכה ב-Excel. ניתן לייבא חזרה אחרי עריכה.'}
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  back: { color: COLORS.primary, fontSize: 15 },
  title: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  scroll: { padding: 16 },
  label: { fontSize: 15, fontWeight: '700', color: COLORS.text, textAlign: 'right', marginBottom: 8, marginTop: 4 },
  toggleRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  toggleBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 12,
    backgroundColor: COLORS.surface, borderWidth: 1.5, borderColor: COLORS.border, alignItems: 'center',
  },
  toggleBtnActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
  toggleTxt: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary },
  toggleTxtActive: { color: COLORS.primary, fontWeight: '700' },
  previewCard: {
    backgroundColor: COLORS.surface, borderRadius: 16, padding: 16, marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
    gap: 10,
  },
  previewTitle: { fontSize: 16, fontWeight: '800', color: COLORS.text, textAlign: 'right' },
  topicRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  topicCount: { fontSize: 14, fontWeight: '700', color: COLORS.primary, minWidth: 28, textAlign: 'right' },
  topicBarBg: { flex: 1, height: 8, backgroundColor: COLORS.border, borderRadius: 4, overflow: 'hidden' },
  topicBarFill: { height: 8, backgroundColor: COLORS.primary, borderRadius: 4 },
  topicName: { fontSize: 13, color: COLORS.text, textAlign: 'right', minWidth: 110 },
  emptyNote: { fontSize: 13, color: COLORS.textTertiary, textAlign: 'right', fontStyle: 'italic' },
  successBox: { backgroundColor: COLORS.successLight, borderRadius: 12, padding: 14, alignItems: 'center', marginBottom: 12 },
  successTxt: { color: COLORS.success, fontWeight: '700', fontSize: 15 },
  exportBtn: { backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginBottom: 14 },
  exportBtnDisabled: { backgroundColor: COLORS.border },
  exportBtnTxt: { color: '#fff', fontSize: 16, fontWeight: '700' },
  noteCard: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, gap: 6 },
  noteTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text, textAlign: 'right' },
  noteText: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'right', lineHeight: 20 },
});
