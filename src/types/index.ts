export type TabId = 'hub' | 'patterns' | 'grammar' | 'situations' | 'practice';

export type StudyModeId =
  | 'overview'
  | 'flashcard'
  | 'quiz'
  | 'listening'
  | 'typing-meaning'
  | 'sentence-writing'
  | 'matching'
  | 'minigames'
  | 'speaking'
  | 'exam'
  | 'notebook';

export type VocabCategory = 'problem' | 'pedagogy';
export type VocabMasteryStatus = 'new' | 'learning' | 'mastered';

export interface VocabItem {
  id: string;
  word: string;
  pos: string;
  ipaBrE: string;
  ipaNAmE: string;
  meaningVi: string;
  exampleEn: string;
  exampleVi: string;
  category: VocabCategory;
}

export type PatternCategory = 'action' | 'saying' | 'goal';

export interface PatternSlot {
  key: string;
  labelVi: string;
  options: string[];
}

export interface SentencePattern {
  id: string;
  category: PatternCategory;
  groupVi: string;
  labelVi: string;
  template: string;
  slots?: PatternSlot[];
  usageNoteVi: string;
}

export interface GrammarQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanationVi: string;
}

export interface GrammarWritePrompt {
  id: string;
  instructionVi: string;
  hintEn: string;
  answerEn: string;
  explanationVi: string;
}

export interface GrammarLesson {
  id: string;
  number: number;
  titleVi: string;
  titleEn: string;
  formula: string;
  roleVi: string;
  examples: { en: string; vi: string }[];
  pitfallVi: string;
  quiz: GrammarQuizQuestion[];
  writingDrills: GrammarWritePrompt[];
}

export type SituationTopic =
  | 'Disruption'
  | 'Homework'
  | 'Tardiness'
  | 'Cheating'
  | 'Grade Dispute'
  | 'Disengagement'
  | 'Group Conflict';

export type SituationSource = 'Slide Bài giảng' | 'Bài tập về nhà' | 'Ví dụ mở rộng' | 'Thực hành bổ sung';

export interface SolutionFrame {
  labelVi?: string;
  action: string;
  saying: string;
  goal: string;
  structureNoteVi?: string;
}

export interface SituationItem {
  id: string;
  code: string;
  titleVi: string;
  sourceLabel: SituationSource;
  topic: SituationTopic;
  problemCount: 1 | 2;
  problemNoteVi: string;
  promptEn: string;
  promptVi: string;
  frames: SolutionFrame[];
  suggestedVocabIds: string[];
  suggestedPatternIds: string[];
}

export type AiMode = 'byok' | 'proxy';
export type AiProvider = 'gemini' | 'groq';

export interface AiSettings {
  mode: AiMode;
  provider: AiProvider;
  geminiApiKey: string;
  geminiModel: string;
  groqApiKey: string;
  groqModel: string;
}

export interface PracticeFrame {
  action: string;
  saying: string;
  goal: string;
}

export interface GrammarFix {
  original: string;
  corrected: string;
  reasonVi: string;
}

export interface GradingResult {
  overallScore: number;
  scores: {
    action: number;
    saying: number;
    goal: number;
    language: number;
  };
  strengths: string[];
  improvements: string[];
  grammarFixes: GrammarFix[];
  improvedSample: {
    action: string;
    saying: string;
    goal: string;
  };
  summaryVi: string;
  usedFallbackModel?: string;
}

export interface SubmissionRecord {
  id: string;
  createdAt: string;
  situationId: string;
  situationTitle: string;
  promptEn: string;
  frames: PracticeFrame[];
  provider: AiProvider;
  modelUsed: string;
  result: GradingResult;
}

export interface StudyStreak {
  count: number;
  lastActiveDate: string;
}

export interface WordDiffToken {
  expected?: string;
  actual?: string;
  status: 'correct' | 'wrong' | 'missing';
}

export interface WordDiffResult {
  tokens: WordDiffToken[];
  accuracy: number;
  isExact: boolean;
}

export interface ExamRecord {
  id: string;
  createdAt: string;
  totalScore10: number;
  skillScores: {
    reading: number;
    writing: number;
    listening: number;
    speaking: number;
  };
  wrongWordIds: string[];
}

export interface PracticeSentenceItem {
  id: string;
  source: 'vocab' | 'pattern' | 'situation';
  labelVi: string;
  en: string;
  vi: string;
  focusWord?: string;
  vocabId?: string;
}
