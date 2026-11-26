import {
  AiSettings,
  ExamRecord,
  StudyStreak,
  SubmissionRecord,
  VocabMasteryStatus,
} from '../types';
import { DEFAULT_AI_SETTINGS } from '../services/aiGrader';

const KEYS = {
  VOCAB_MASTERY: 'wse_vocab_mastery_v1',
  GRAMMAR_SCORES: 'wse_grammar_scores_v1',
  SUBMISSIONS: 'wse_submissions_v1',
  AI_SETTINGS: 'wse_ai_settings_v1',
  STREAK: 'wse_study_streak_v1',
  MISTAKES: 'wse_mistakes_v1',
  EXAM_HISTORY: 'wse_exam_history_v1',
} as const;

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore storage quota errors
  }
}

export function loadVocabMastery(): Record<string, VocabMasteryStatus> {
  return readJson<Record<string, VocabMasteryStatus>>(KEYS.VOCAB_MASTERY, {});
}

export function saveVocabMastery(data: Record<string, VocabMasteryStatus>): void {
  writeJson(KEYS.VOCAB_MASTERY, data);
}

export function loadGrammarScores(): Record<string, number> {
  return readJson<Record<string, number>>(KEYS.GRAMMAR_SCORES, {});
}

export function saveGrammarScores(data: Record<string, number>): void {
  writeJson(KEYS.GRAMMAR_SCORES, data);
}

export function loadSubmissions(): SubmissionRecord[] {
  return readJson<SubmissionRecord[]>(KEYS.SUBMISSIONS, []);
}

export function saveSubmissions(records: SubmissionRecord[]): void {
  writeJson(KEYS.SUBMISSIONS, records);
}

export function loadAiSettings(): AiSettings {
  const saved = readJson<Partial<AiSettings>>(KEYS.AI_SETTINGS, {});
  return { ...DEFAULT_AI_SETTINGS, ...saved };
}

export function saveAiSettings(settings: AiSettings): void {
  writeJson(KEYS.AI_SETTINGS, settings);
}

export function loadMistakes(): Record<string, number> {
  return readJson<Record<string, number>>(KEYS.MISTAKES, {});
}

export function saveMistakes(data: Record<string, number>): void {
  writeJson(KEYS.MISTAKES, data);
}

export function loadExamHistory(): ExamRecord[] {
  return readJson<ExamRecord[]>(KEYS.EXAM_HISTORY, []);
}

export function saveExamHistory(records: ExamRecord[]): void {
  writeJson(KEYS.EXAM_HISTORY, records);
}

function getLocalDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function loadStudyStreak(): StudyStreak {
  return readJson<StudyStreak>(KEYS.STREAK, { count: 0, lastActiveDate: '' });
}

export function recordDailyActivity(): StudyStreak {
  const today = getLocalDateKey();
  const current = loadStudyStreak();

  if (current.lastActiveDate === today) {
    return current;
  }

  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = getLocalDateKey(yesterdayDate);

  const nextCount = current.lastActiveDate === yesterday ? current.count + 1 : 1;
  const updated: StudyStreak = { count: nextCount, lastActiveDate: today };
  writeJson(KEYS.STREAK, updated);
  return updated;
}
