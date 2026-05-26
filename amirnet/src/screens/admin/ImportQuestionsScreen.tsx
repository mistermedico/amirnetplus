import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, Alert, TextInput,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useApp } from '../../store/AppContext';
import { COLORS } from '../../utils/colors';
import { parseCSV, parseJSON, generateCSVTemplate } from '../../utils/questionParser';
import { Question } from '../../types';
import { Card, PrimaryButton } from '../../components/common';

type ImportMode = 'csv' | 'json' | 'manual';

export default function ImportQuestionsScreen({ navigation }: any) {
  const { dispatch } = useApp();
  const [mode, setMode] = useState<ImportMode>('csv');
  const [jsonText, setJsonText] = useState('');
  const [preview, setPreview] = useState<Partial<Question>[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [imported, setImported] = useState(false);

  async function pickFile() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/plain', 'text/csv', 'application/json', '*/*'],
        copyToCacheDirectory: true,
      });
      if (result.canceled || !result.assets?.[0]) return;

      const uri = result.assets[0].uri;
      const text = await FileSystem.readAsStringAsync(uri);
      parseText(text);
    } catch (e) {
      Alert.alert('שגיאה', 'לא ניתן לקרוא את הקובץ');
    }
  }

  function parseText(text: string) {
    const result = mode === 'json' ? parseJSON(text) : parseCSV(text);
    setPreview(result.questions);
    setErrors(result.errors);
    setImported(false);
  }

  function handleJSONPaste() {
    if (!jsonText.trim()) { Alert.alert('שגיאה', 'הכנס JSON'); return; }
    parseText(jsonText);
  }

  function confirmImport() {
    if (preview.length === 0) { Alert.alert('שגיאה', 'אין שאלות לייבא'); return; }
    dispatch({ type: 'IMPORT_QUESTIONS', payload: preview as Question[] });
    setImported(true);
    Alert.alert('הצלחה', `יובאו ${preview.length} שאלות!`);
  }

  async function downloadTemplate() {
    try {
      const content = generateCSVTemplate();
      const path = FileSystem.cacheDirectory + 'amirnet_template.csv';
      await FileSystem.writeAsStringAsync(path, content);
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(path, { mimeType: 'text/csv', dialogTitle: 'שמור תבנית CSV' });
      } else {
        Alert.alert('תבנית CSV', content);
      }
    } catch {
      Alert.alert('שגיאה', 'לא ניתן להוריד תבנית');
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>‹ חזרה</Text>
        </TouchableOpacity>
        <Text style={styles.title}>ייבוא שאלות</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Mode tabs */}
        <View style={styles.tabs}>
          {(['csv', 'json'] as ImportMode[]).map(m => (
            <TouchableOpacity key={m} style={[styles.tab, mode === m && styles.tabActive]} onPress={() => { setMode(m); setPreview([]); setErrors([]); }}>
              <Text style={[styles.tabTxt, mode === m && styles.tabTxtActive]}>
                {m === 'csv' ? '📄 CSV' : '📦 JSON'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Format hint */}
        <Card style={styles.hintCard}>
          <Text style={styles.hintTitle}>📋 פורמט {mode.toUpperCase()}</Text>
          {mode === 'csv' ? (
            <>
              <Text style={styles.hintText}>
                {'question,option_a,option_b,option_c,option_d,correct_index,explanation,topic,difficulty'}
              </Text>
              <Text style={styles.hintSub}>correct_index: 0–3 | topic: networking/security/operatingSystems/cloud/itManagement/protocols | difficulty: easy/medium/hard</Text>
              <TouchableOpacity style={styles.templateBtn} onPress={downloadTemplate}>
                <Text style={styles.templateBtnTxt}>⬇️ הורד תבנית CSV</Text>
              </TouchableOpacity>
            </>
          ) : (
            <Text style={styles.hintText}>
              {'[{"questionText":"...","options":["a","b","c","d"],"correctIndex":0,"explanation":"...","topic":"networking","difficulty":"easy"}]'}
            </Text>
          )}
        </Card>

        {/* File picker */}
        <TouchableOpacity style={styles.pickBtn} onPress={pickFile} activeOpacity={0.75}>
          <Text style={styles.pickIcon}>📁</Text>
          <Text style={styles.pickTxt}>בחר קובץ {mode.toUpperCase()}</Text>
        </TouchableOpacity>

        {/* JSON paste */}
        {mode === 'json' && (
          <View style={styles.pasteWrap}>
            <Text style={styles.fieldLabel}>או הדבק JSON ישירות:</Text>
            <TextInput
              style={styles.textArea}
              value={jsonText}
              onChangeText={setJsonText}
              multiline
              placeholder='[{"questionText":"..."}]'
              placeholderTextColor={COLORS.textTertiary}
              textAlign="right"
            />
            <TouchableOpacity style={styles.parseBtn} onPress={handleJSONPaste} activeOpacity={0.75}>
              <Text style={styles.parseBtnTxt}>נתח JSON</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Errors */}
        {errors.length > 0 && (
          <Card style={styles.errCard}>
            <Text style={styles.errTitle}>⚠️ {errors.length} שגיאות ניתוח</Text>
            {errors.slice(0, 5).map((e, i) => (
              <Text key={i} style={styles.errText}>• {e}</Text>
            ))}
            {errors.length > 5 && <Text style={styles.errText}>ועוד {errors.length - 5}...</Text>}
          </Card>
        )}

        {/* Preview */}
        {preview.length > 0 && (
          <>
            <View style={styles.previewHeader}>
              <Text style={styles.previewCount}>נמצאו {preview.length} שאלות לייבוא</Text>
            </View>
            {preview.slice(0, 5).map((q, i) => (
              <View key={i} style={styles.previewCard}>
                <Text style={styles.previewNum}>#{i + 1}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.previewQ} numberOfLines={2}>{q.questionText}</Text>
                  <Text style={styles.previewMeta}>{q.topic} · {q.difficulty}</Text>
                </View>
              </View>
            ))}
            {preview.length > 5 && (
              <Text style={styles.moreText}>ועוד {preview.length - 5} שאלות נוספות...</Text>
            )}

            {!imported ? (
              <PrimaryButton title={`ייבא ${preview.length} שאלות ✅`} onPress={confirmImport} style={{ marginTop: 12 }} />
            ) : (
              <View style={styles.successBox}>
                <Text style={styles.successText}>✅ {preview.length} שאלות יובאו בהצלחה!</Text>
              </View>
            )}
          </>
        )}
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
  tabs: { flexDirection: 'row', backgroundColor: COLORS.surface, borderRadius: 12, padding: 4, marginBottom: 16 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  tabActive: { backgroundColor: COLORS.primary },
  tabTxt: { fontSize: 14, fontWeight: '700', color: COLORS.textSecondary },
  tabTxtActive: { color: '#fff' },
  hintCard: { marginBottom: 14 },
  hintTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text, textAlign: 'right', marginBottom: 6 },
  hintText: { fontSize: 11, color: COLORS.textSecondary, fontFamily: 'monospace', lineHeight: 18 },
  hintSub: { fontSize: 11, color: COLORS.textTertiary, marginTop: 4, textAlign: 'right' },
  templateBtn: { marginTop: 8, backgroundColor: COLORS.successLight, borderRadius: 8, padding: 8, alignItems: 'center' },
  templateBtnTxt: { color: COLORS.success, fontWeight: '700', fontSize: 13 },
  pickBtn: {
    backgroundColor: COLORS.surface, borderRadius: 16, padding: 24,
    alignItems: 'center', gap: 8, borderWidth: 2, borderColor: COLORS.border,
    borderStyle: 'dashed', marginBottom: 14,
  },
  pickIcon: { fontSize: 36 },
  pickTxt: { fontSize: 16, fontWeight: '700', color: COLORS.primary },
  pasteWrap: { marginBottom: 14, gap: 8 },
  fieldLabel: { fontSize: 14, fontWeight: '700', color: COLORS.text, textAlign: 'right' },
  textArea: {
    borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12,
    padding: 12, fontSize: 13, color: COLORS.text, backgroundColor: COLORS.surface,
    height: 120, textAlignVertical: 'top',
  },
  parseBtn: { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  parseBtnTxt: { color: '#fff', fontWeight: '700', fontSize: 15 },
  errCard: { backgroundColor: COLORS.dangerLight, marginBottom: 14 },
  errTitle: { fontSize: 14, fontWeight: '700', color: COLORS.danger, textAlign: 'right', marginBottom: 6 },
  errText: { fontSize: 12, color: COLORS.danger, textAlign: 'right' },
  previewHeader: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 8 },
  previewCount: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  previewCard: {
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 12, marginBottom: 6,
    flexDirection: 'row', gap: 10, alignItems: 'center',
  },
  previewNum: { fontSize: 12, fontWeight: '700', color: COLORS.textSecondary, minWidth: 24 },
  previewQ: { fontSize: 13, color: COLORS.text, textAlign: 'right', lineHeight: 18 },
  previewMeta: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2, textAlign: 'right' },
  moreText: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', padding: 8 },
  successBox: { backgroundColor: COLORS.successLight, borderRadius: 14, padding: 16, alignItems: 'center' },
  successText: { fontSize: 16, fontWeight: '700', color: COLORS.success },
});
