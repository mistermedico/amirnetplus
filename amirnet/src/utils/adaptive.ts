import { Question, Difficulty, QuestionPerformance } from '../types';

export interface AdaptiveState {
  abilityScore: number;     // -3 to +3
  answeredIDs: Set<string>;
  history: { question: Question; selected: number; correct: boolean }[];
}

export function initialAdaptiveState(): AdaptiveState {
  return { abilityScore: 0, answeredIDs: new Set(), history: [] };
}

export function targetDifficulty(abilityScore: number): Difficulty {
  if (abilityScore < -0.5) return 'easy';
  if (abilityScore > 0.5) return 'hard';
  return 'medium';
}

export function updateAbilityScore(
  current: number,
  difficulty: Difficulty,
  isCorrect: boolean
): number {
  const delta: Record<Difficulty, { correct: number; wrong: number }> = {
    easy:   { correct: 0.3,  wrong: -0.8 },
    medium: { correct: 0.6,  wrong: -0.6 },
    hard:   { correct: 1.0,  wrong: -0.3 },
  };
  const change = isCorrect ? delta[difficulty].correct : delta[difficulty].wrong;
  return Math.max(-3, Math.min(3, current + change));
}

export function selectNextQuestion(
  pool: Question[],
  state: AdaptiveState,
  performance: Record<string, QuestionPerformance>
): Question | null {
  const available = pool.filter(q => !state.answeredIDs.has(q.id));
  if (available.length === 0) return null;

  const target = targetDifficulty(state.abilityScore);

  // Prioritize unseen or low-accuracy questions at target difficulty
  const preferred = available
    .filter(q => q.difficulty === target)
    .sort((a, b) => {
      const perfA = performance[a.id]?.accuracy ?? 0.5;
      const perfB = performance[b.id]?.accuracy ?? 0.5;
      return perfA - perfB; // show hardest (lowest accuracy) first
    });

  if (preferred.length > 0) return preferred[0];

  // Fallback: any remaining question
  return available[Math.floor(Math.random() * available.length)];
}

export function abilityLabel(score: number): string {
  if (score < -1.5) return 'מתחיל';
  if (score < -0.5) return 'בסיסי';
  if (score < 0.5)  return 'בינוני';
  if (score < 1.5)  return 'מתקדם';
  return 'מומחה';
}

export function abilityPercent(score: number): number {
  return Math.round(((score + 3) / 6) * 100);
}
