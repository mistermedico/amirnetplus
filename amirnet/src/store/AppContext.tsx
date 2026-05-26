import React, { createContext, useContext, useEffect, useReducer, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AppUser, UserRole, UserProgress, Question, Chapter, ExamTemplate,
  TopicID, Difficulty, QuizHistoryEntry, StudyPlan, QuestionPerformance,
} from '../types';
import { hashPassword, generateId } from '../utils/hashUtils';
import { BUILT_IN_QUESTIONS } from '../data/questions';

// ─── Auth State ───────────────────────────────────────────────────────────────

interface AuthState {
  users: AppUser[];
  currentUser: AppUser | null;
  isAuthenticated: boolean;
  hasSeenLanding: boolean;
}

// ─── App State ────────────────────────────────────────────────────────────────

interface AppState {
  auth: AuthState;
  progress: UserProgress;
  customQuestions: Question[];
  chapters: Chapter[];
  examTemplates: ExamTemplate[];
  isLoaded: boolean;
}

const defaultProgress: UserProgress = {
  totalAnswered: 0,
  totalCorrect: 0,
  topicProgress: {},
  streakDays: 0,
  dailyActivity: [],
  unlockedAchievements: [],
  bookmarkedQuestionIDs: [],
  studyPlans: [],
  quizHistory: [],
  notes: {},
  weakTopics: [],
  dailyGoal: 20,
  notificationsEnabled: true,
  questionPerformance: {},
};

const initialState: AppState = {
  auth: {
    users: [],
    currentUser: null,
    isAuthenticated: false,
    hasSeenLanding: false,
  },
  progress: defaultProgress,
  customQuestions: [],
  chapters: [],
  examTemplates: [],
  isLoaded: false,
};

// ─── Actions ──────────────────────────────────────────────────────────────────

type Action =
  | { type: 'LOAD'; payload: Partial<AppState> }
  | { type: 'LOGIN'; payload: AppUser }
  | { type: 'LOGOUT' }
  | { type: 'SEEN_LANDING' }
  | { type: 'ADD_USER'; payload: AppUser }
  | { type: 'DELETE_USER'; payload: string }
  | { type: 'UPDATE_USER_ROLE'; payload: { id: string; role: UserRole } }
  | { type: 'CHANGE_PASSWORD'; payload: { id: string; hash: string } }
  | { type: 'RECORD_QUIZ'; payload: { entry: QuizHistoryEntry; topicAnswers: { topicID: string; correct: boolean }[]; questionAnswers: { id: string; correct: boolean }[] } }
  | { type: 'TOGGLE_BOOKMARK'; payload: string }
  | { type: 'SET_NOTE'; payload: { id: string; text: string } }
  | { type: 'ADD_CUSTOM_QUESTION'; payload: Question }
  | { type: 'UPDATE_CUSTOM_QUESTION'; payload: Question }
  | { type: 'DELETE_CUSTOM_QUESTION'; payload: string }
  | { type: 'IMPORT_QUESTIONS'; payload: Question[] }
  | { type: 'ADD_CHAPTER'; payload: Chapter }
  | { type: 'UPDATE_CHAPTER'; payload: Chapter }
  | { type: 'DELETE_CHAPTER'; payload: string }
  | { type: 'ADD_EXAM'; payload: ExamTemplate }
  | { type: 'UPDATE_EXAM'; payload: ExamTemplate }
  | { type: 'DELETE_EXAM'; payload: string }
  | { type: 'ADD_STUDY_PLAN'; payload: StudyPlan }
  | { type: 'UPDATE_STUDY_PLAN'; payload: StudyPlan }
  | { type: 'DELETE_STUDY_PLAN'; payload: string }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<UserProgress> }
  | { type: 'RESET_PROGRESS' }
  | { type: 'ASSIGN_QUESTION_CHAPTER'; payload: { questionID: string; chapterID: string } }
  | { type: 'REMOVE_QUESTION_CHAPTER'; payload: { questionID: string; chapterID: string } };

function recalcWeakTopics(topicProgress: Record<string, { answeredCount: number; correctCount: number }>): string[] {
  return Object.entries(topicProgress)
    .filter(([, tp]) => tp.answeredCount >= 3 && (tp.correctCount / tp.answeredCount) < 0.7)
    .sort((a, b) => (a[1].correctCount / a[1].answeredCount) - (b[1].correctCount / b[1].answeredCount))
    .map(([id]) => id);
}

function checkAchievements(progress: UserProgress): string[] {
  const a = new Set(progress.unlockedAchievements);
  if (progress.totalAnswered >= 10) a.add('first_10');
  if (progress.totalAnswered >= 50) a.add('fifty_questions');
  if (progress.totalAnswered >= 100) a.add('century');
  if (progress.totalAnswered >= 500) a.add('five_hundred');
  const pct = progress.totalAnswered > 0 ? (progress.totalCorrect / progress.totalAnswered) * 100 : 0;
  if (pct >= 80 && progress.totalAnswered >= 20) a.add('high_scorer');
  if (progress.streakDays >= 3) a.add('streak_3');
  if (progress.streakDays >= 7) a.add('streak_7');
  return Array.from(a);
}

function updateStreak(progress: UserProgress): UserProgress {
  const today = new Date().toDateString();
  const last = progress.lastStudyDate;
  if (!last) return { ...progress, lastStudyDate: today, streakDays: 1 };
  if (last === today) return progress;
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  if (last === yesterday) {
    return { ...progress, lastStudyDate: today, streakDays: progress.streakDays + 1 };
  }
  return { ...progress, lastStudyDate: today, streakDays: 1 };
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOAD':
      return { ...state, ...action.payload, isLoaded: true };

    case 'LOGIN':
      return { ...state, auth: { ...state.auth, currentUser: action.payload, isAuthenticated: true } };

    case 'LOGOUT':
      return { ...state, auth: { ...state.auth, currentUser: null, isAuthenticated: false } };

    case 'SEEN_LANDING':
      return { ...state, auth: { ...state.auth, hasSeenLanding: true } };

    case 'ADD_USER': {
      const users = [...state.auth.users, action.payload];
      return { ...state, auth: { ...state.auth, users } };
    }
    case 'DELETE_USER': {
      const users = state.auth.users.filter(u => u.id !== action.payload);
      return { ...state, auth: { ...state.auth, users } };
    }
    case 'UPDATE_USER_ROLE': {
      const users = state.auth.users.map(u =>
        u.id === action.payload.id ? { ...u, role: action.payload.role } : u
      );
      return { ...state, auth: { ...state.auth, users } };
    }
    case 'CHANGE_PASSWORD': {
      const users = state.auth.users.map(u =>
        u.id === action.payload.id ? { ...u, passwordHash: action.payload.hash } : u
      );
      const currentUser = state.auth.currentUser?.id === action.payload.id
        ? { ...state.auth.currentUser, passwordHash: action.payload.hash }
        : state.auth.currentUser;
      return { ...state, auth: { ...state.auth, users, currentUser } };
    }

    case 'RECORD_QUIZ': {
      const { entry, topicAnswers, questionAnswers } = action.payload;
      let p = { ...state.progress };
      p.totalAnswered += entry.total;
      p.totalCorrect += entry.score;

      const topicProgress = { ...p.topicProgress };
      for (const { topicID, correct } of topicAnswers) {
        const prev = topicProgress[topicID] || { answeredCount: 0, correctCount: 0 };
        topicProgress[topicID] = {
          answeredCount: prev.answeredCount + 1,
          correctCount: prev.correctCount + (correct ? 1 : 0),
        };
      }
      p.topicProgress = topicProgress;

      const qPerf = { ...p.questionPerformance };
      for (const { id, correct } of questionAnswers) {
        const prev = qPerf[id] || { timesAnswered: 0, timesCorrect: 0 };
        qPerf[id] = {
          timesAnswered: prev.timesAnswered + 1,
          timesCorrect: prev.timesCorrect + (correct ? 1 : 0),
          lastAnswered: new Date().toISOString(),
        };
      }
      p.questionPerformance = qPerf;

      // Daily activity
      const todayStr = new Date().toDateString();
      const dailyActivity = [...p.dailyActivity];
      const todayIdx = dailyActivity.findIndex(d => d.date === todayStr);
      if (todayIdx >= 0) {
        dailyActivity[todayIdx] = {
          ...dailyActivity[todayIdx],
          questionsAnswered: dailyActivity[todayIdx].questionsAnswered + entry.total,
          correctAnswers: dailyActivity[todayIdx].correctAnswers + entry.score,
        };
      } else {
        dailyActivity.push({ date: todayStr, questionsAnswered: entry.total, correctAnswers: entry.score });
      }
      p.dailyActivity = dailyActivity.slice(-30);

      p = updateStreak(p);
      const quizHistory = [entry, ...p.quizHistory].slice(0, 200);
      p.quizHistory = quizHistory;
      p.weakTopics = recalcWeakTopics(p.topicProgress);
      p.unlockedAchievements = checkAchievements(p);

      return { ...state, progress: p };
    }

    case 'TOGGLE_BOOKMARK': {
      const ids = state.progress.bookmarkedQuestionIDs;
      const bookmarkedQuestionIDs = ids.includes(action.payload)
        ? ids.filter(id => id !== action.payload)
        : [...ids, action.payload];
      return { ...state, progress: { ...state.progress, bookmarkedQuestionIDs } };
    }

    case 'SET_NOTE': {
      const notes = { ...state.progress.notes };
      if (action.payload.text) notes[action.payload.id] = action.payload.text;
      else delete notes[action.payload.id];
      return { ...state, progress: { ...state.progress, notes } };
    }

    case 'ADD_CUSTOM_QUESTION':
      return { ...state, customQuestions: [action.payload, ...state.customQuestions] };

    case 'UPDATE_CUSTOM_QUESTION':
      return {
        ...state,
        customQuestions: state.customQuestions.map(q => q.id === action.payload.id ? action.payload : q),
      };

    case 'DELETE_CUSTOM_QUESTION': {
      const customQuestions = state.customQuestions.filter(q => q.id !== action.payload);
      const chapters = state.chapters.map(ch => ({
        ...ch, questionIDs: ch.questionIDs.filter(id => id !== action.payload),
      }));
      return { ...state, customQuestions, chapters };
    }

    case 'IMPORT_QUESTIONS':
      return { ...state, customQuestions: [...action.payload, ...state.customQuestions] };

    case 'ADD_CHAPTER':
      return { ...state, chapters: [...state.chapters, action.payload] };

    case 'UPDATE_CHAPTER':
      return { ...state, chapters: state.chapters.map(c => c.id === action.payload.id ? action.payload : c) };

    case 'DELETE_CHAPTER':
      return { ...state, chapters: state.chapters.filter(c => c.id !== action.payload) };

    case 'ADD_EXAM':
      return { ...state, examTemplates: [...state.examTemplates, action.payload] };

    case 'UPDATE_EXAM':
      return { ...state, examTemplates: state.examTemplates.map(e => e.id === action.payload.id ? action.payload : e) };

    case 'DELETE_EXAM':
      return { ...state, examTemplates: state.examTemplates.filter(e => e.id !== action.payload) };

    case 'ADD_STUDY_PLAN': {
      const studyPlans = [action.payload, ...state.progress.studyPlans];
      return { ...state, progress: { ...state.progress, studyPlans } };
    }
    case 'UPDATE_STUDY_PLAN': {
      const studyPlans = state.progress.studyPlans.map(p => p.id === action.payload.id ? action.payload : p);
      return { ...state, progress: { ...state.progress, studyPlans } };
    }
    case 'DELETE_STUDY_PLAN': {
      const studyPlans = state.progress.studyPlans.filter(p => p.id !== action.payload);
      return { ...state, progress: { ...state.progress, studyPlans } };
    }

    case 'UPDATE_SETTINGS':
      return { ...state, progress: { ...state.progress, ...action.payload } };

    case 'RESET_PROGRESS':
      return { ...state, progress: { ...defaultProgress, dailyGoal: state.progress.dailyGoal } };

    case 'ASSIGN_QUESTION_CHAPTER': {
      const chapters = state.chapters.map(ch => {
        if (ch.id !== action.payload.chapterID) return ch;
        if (ch.questionIDs.includes(action.payload.questionID)) return ch;
        return { ...ch, questionIDs: [...ch.questionIDs, action.payload.questionID] };
      });
      return { ...state, chapters };
    }

    case 'REMOVE_QUESTION_CHAPTER': {
      const chapters = state.chapters.map(ch => {
        if (ch.id !== action.payload.chapterID) return ch;
        return { ...ch, questionIDs: ch.questionIDs.filter(id => id !== action.payload.questionID) };
      });
      return { ...state, chapters };
    }

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'amirnet_state_v3';

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  // Helpers
  allQuestions: Question[];
  login: (username: string, password: string) => boolean;
  logout: () => void;
  createUser: (username: string, password: string, role: UserRole, displayName: string) => boolean;
  changePassword: (userID: string, newPassword: string) => void;
  isBookmarked: (id: string) => boolean;
  bookmarkedQuestions: Question[];
  overallPercentage: number;
  todayAnswered: number;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Load from storage
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const saved = JSON.parse(raw);
          dispatch({ type: 'LOAD', payload: { ...saved, isLoaded: true } });
        } else {
          // First launch: create default admin
          const admin: AppUser = {
            id: generateId(),
            username: 'admin',
            passwordHash: hashPassword('admin123'),
            role: 'admin',
            displayName: 'מנהל המערכת',
            createdAt: new Date().toISOString(),
          };
          dispatch({ type: 'LOAD', payload: { auth: { users: [admin], currentUser: null, isAuthenticated: false, hasSeenLanding: false }, isLoaded: true } });
        }
      } catch {
        dispatch({ type: 'LOAD', payload: { isLoaded: true } });
      }
    })();
  }, []);

  // Persist on state change (debounced)
  useEffect(() => {
    if (!state.isLoaded) return;
    const timer = setTimeout(() => {
      const toSave = {
        auth: state.auth,
        progress: state.progress,
        customQuestions: state.customQuestions,
        chapters: state.chapters,
        examTemplates: state.examTemplates,
      };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave)).catch(() => {});
    }, 500);
    return () => clearTimeout(timer);
  }, [state]);

  const allQuestions: Question[] = [...BUILT_IN_QUESTIONS, ...state.customQuestions];

  const login = useCallback((username: string, password: string): boolean => {
    const hash = hashPassword(password);
    const user = state.auth.users.find(
      u => u.username.toLowerCase() === username.toLowerCase() && u.passwordHash === hash
    );
    if (user) { dispatch({ type: 'LOGIN', payload: user }); return true; }
    return false;
  }, [state.auth.users]);

  const logout = useCallback(() => dispatch({ type: 'LOGOUT' }), []);

  const createUser = useCallback((username: string, password: string, role: UserRole, displayName: string): boolean => {
    if (state.auth.users.some(u => u.username.toLowerCase() === username.toLowerCase())) return false;
    const user: AppUser = {
      id: generateId(), username, passwordHash: hashPassword(password),
      role, displayName, createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_USER', payload: user });
    return true;
  }, [state.auth.users]);

  const changePassword = useCallback((userID: string, newPassword: string) => {
    dispatch({ type: 'CHANGE_PASSWORD', payload: { id: userID, hash: hashPassword(newPassword) } });
  }, []);

  const isBookmarked = useCallback((id: string) =>
    state.progress.bookmarkedQuestionIDs.includes(id), [state.progress.bookmarkedQuestionIDs]);

  const bookmarkedQuestions = allQuestions.filter(q =>
    state.progress.bookmarkedQuestionIDs.includes(q.id)
  );

  const overallPercentage = state.progress.totalAnswered > 0
    ? (state.progress.totalCorrect / state.progress.totalAnswered) * 100
    : 0;

  const todayAnswered = (() => {
    const today = new Date().toDateString();
    return state.progress.dailyActivity.find(d => d.date === today)?.questionsAnswered ?? 0;
  })();

  return (
    <AppContext.Provider value={{
      state, dispatch, allQuestions, login, logout, createUser, changePassword,
      isBookmarked, bookmarkedQuestions, overallPercentage, todayAnswered,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
