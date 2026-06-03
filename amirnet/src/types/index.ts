export type Difficulty = 'easy' | 'medium' | 'hard';

export type TopicID =
  | 'networking'
  | 'security'
  | 'operatingSystems'
  | 'cloud'
  | 'itManagement'
  | 'protocols';

export interface Topic {
  id: TopicID;
  displayName: string;
  icon: string;
  color: string;
  description: string;
}

export interface Question {
  id: string;
  questionText: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  topic: TopicID;
  difficulty: Difficulty;
  chapterID?: string;
  examIDs: string[];
  tags: string[];
  isCustom: boolean;
  createdAt: string;
}

export interface Chapter {
  id: string;
  title: string;
  description: string;
  topicID: TopicID;
  questionIDs: string[];
  order: number;
  createdAt: string;
}

export interface ExamTemplate {
  id: string;
  title: string;
  description: string;
  chapterIDs: string[];
  additionalQuestionIDs: string[];
  questionCount: number;
  durationMinutes: number;
  passingScore: number;
  isActive: boolean;
  topicIDs: TopicID[];
  createdAt: string;
}

export type UserRole = 'admin' | 'student';

export interface AppUser {
  id: string;
  username: string;
  passwordHash: string;
  role: UserRole;
  displayName: string;
  createdAt: string;
}

export interface TopicProgress {
  answeredCount: number;
  correctCount: number;
}

export interface DailyActivity {
  date: string;
  questionsAnswered: number;
  correctAnswers: number;
}

export interface QuizHistoryEntry {
  id: string;
  date: string;
  score: number;
  total: number;
  topicID?: TopicID;
  durationSeconds: number;
  isAdaptive?: boolean;
}

export interface QuestionPerformance {
  timesAnswered: number;
  timesCorrect: number;
  lastAnswered?: string;
}

export interface StudyPlan {
  id: string;
  title: string;
  targetDate: string;
  topicIDs: TopicID[];
  dailyGoal: number;
  createdAt: string;
  isActive: boolean;
}

export interface UserProgress {
  totalAnswered: number;
  totalCorrect: number;
  topicProgress: Record<string, TopicProgress>;
  streakDays: number;
  lastStudyDate?: string;
  dailyActivity: DailyActivity[];
  unlockedAchievements: string[];
  bookmarkedQuestionIDs: string[];
  studyPlans: StudyPlan[];
  quizHistory: QuizHistoryEntry[];
  notes: Record<string, string>;
  weakTopics: string[];
  dailyGoal: number;
  notificationsEnabled: boolean;
  questionPerformance: Record<string, QuestionPerformance>;
}

export interface QuizAnswer {
  questionIndex: number;
  selectedIndex: number;
  isCorrect: boolean;
}

export type QuizMode = 'exam' | 'study' | 'adaptive';

export interface QuizConfig {
  questionCount: number;
  topicID?: TopicID;
  mode: QuizMode;
  difficulty?: Difficulty;
  chapterID?: string;
  examTemplateID?: string;
  useBookmarked?: boolean;
  includeCustom?: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  type: 'info' | 'warning' | 'success';
  createdAt: string;
}

export interface SystemSettings {
  defaultQuestionCount: number;
  defaultPassingScore: number;
  defaultMode: 'exam' | 'study';
  defaultDifficulty: Difficulty | 'all';
}
