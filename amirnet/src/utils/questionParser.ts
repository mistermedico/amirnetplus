import { Question, TopicID, Difficulty } from '../types';
import { generateId } from './hashUtils';

const VALID_TOPICS: TopicID[] = ['networking', 'security', 'operatingSystems', 'cloud', 'itManagement', 'protocols'];
const VALID_DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];

function sanitize(s: string): string {
  return s.trim().replace(/^["']|["']$/g, '');
}

export interface ParseResult {
  questions: Partial<Question>[];
  errors: string[];
}

export function parseCSV(text: string): ParseResult {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const errors: string[] = [];
  const questions: Partial<Question>[] = [];

  if (lines.length < 2) {
    return { questions: [], errors: ['הקובץ ריק או חסר כותרת'] };
  }

  // header: question,option_a,option_b,option_c,option_d,correct_index,explanation,topic,difficulty
  for (let i = 1; i < lines.length; i++) {
    try {
      const parts = splitCSVLine(lines[i]);
      if (parts.length < 7) {
        errors.push(`שורה ${i + 1}: מספר עמודות לא מספיק`);
        continue;
      }
      const [qText, optA, optB, optC, optD, correctRaw, expl, topicRaw, diffRaw] = parts.map(sanitize);
      const correctIndex = parseInt(correctRaw, 10);

      if (!qText) { errors.push(`שורה ${i + 1}: שאלה ריקה`); continue; }
      if (!optA || !optB || !optC || !optD) { errors.push(`שורה ${i + 1}: אפשרויות חסרות`); continue; }
      if (isNaN(correctIndex) || correctIndex < 0 || correctIndex > 3) {
        errors.push(`שורה ${i + 1}: מדד תשובה נכונה לא תקין (0–3)`);
        continue;
      }

      const topic = (topicRaw as TopicID);
      if (topicRaw && !VALID_TOPICS.includes(topic)) {
        errors.push(`שורה ${i + 1}: נושא לא מוכר "${topicRaw}"`);
        continue;
      }

      const difficulty = (diffRaw as Difficulty);
      if (diffRaw && !VALID_DIFFICULTIES.includes(difficulty)) {
        errors.push(`שורה ${i + 1}: רמת קושי לא מוכרת "${diffRaw}"`);
        continue;
      }

      questions.push({
        id: generateId(),
        questionText: qText,
        options: [optA, optB, optC, optD],
        correctIndex,
        explanation: expl || '',
        topic: topicRaw ? topic : 'networking',
        difficulty: diffRaw ? difficulty : 'medium',
        isCustom: true,
        examIDs: [],
        tags: [],
        createdAt: new Date().toISOString(),
      });
    } catch (e) {
      errors.push(`שורה ${i + 1}: שגיאה בניתוח`);
    }
  }

  return { questions, errors };
}

export function parseJSON(text: string): ParseResult {
  const errors: string[] = [];
  try {
    const data = JSON.parse(text);
    const arr = Array.isArray(data) ? data : data.questions;
    if (!Array.isArray(arr)) return { questions: [], errors: ['פורמט JSON לא תקין'] };

    const questions: Partial<Question>[] = arr.map((item: any, i: number) => {
      if (!item.questionText && !item.question_text) {
        errors.push(`פריט ${i + 1}: חסר שדה questionText`);
        return null;
      }
      const options = item.options || [item.option_a, item.option_b, item.option_c, item.option_d];
      if (!Array.isArray(options) || options.length < 4) {
        errors.push(`פריט ${i + 1}: חסרות 4 אפשרויות`);
        return null;
      }
      return {
        id: generateId(),
        questionText: item.questionText || item.question_text,
        options: options.slice(0, 4).map(String),
        correctIndex: Number(item.correctIndex ?? item.correct_index ?? 0),
        explanation: item.explanation || '',
        topic: (VALID_TOPICS.includes(item.topic) ? item.topic : 'networking') as TopicID,
        difficulty: (VALID_DIFFICULTIES.includes(item.difficulty) ? item.difficulty : 'medium') as Difficulty,
        isCustom: true,
        examIDs: [],
        tags: item.tags || [],
        createdAt: new Date().toISOString(),
      };
    }).filter(Boolean);

    return { questions, errors };
  } catch {
    return { questions: [], errors: ['JSON לא תקין'] };
  }
}

export function generateCSVTemplate(): string {
  const header = 'question,option_a,option_b,option_c,option_d,correct_index,explanation,topic,difficulty';
  const example = 'כמה שכבות יש במודל OSI?,5,6,7,8,2,מודל OSI מורכב מ-7 שכבות,networking,easy';
  return [header, example].join('\n');
}

function splitCSVLine(line: string): string[] {
  const result: string[] = [];
  let cur = '';
  let inQuote = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') { inQuote = !inQuote; }
    else if (ch === ',' && !inQuote) { result.push(cur); cur = ''; }
    else { cur += ch; }
  }
  result.push(cur);
  return result;
}
