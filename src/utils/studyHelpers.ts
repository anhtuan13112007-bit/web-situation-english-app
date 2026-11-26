import { SENTENCE_PATTERNS } from '../data/patterns';
import { SITUATION_ITEMS } from '../data/situations';
import { VOCABULARY_ITEMS } from '../data/vocabulary';
import {
  PracticeSentenceItem,
  SentencePattern,
  WordDiffResult,
  WordDiffToken,
} from '../types';

export function isTypingTarget(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toLowerCase();
  return (
    tag === 'input' ||
    tag === 'textarea' ||
    tag === 'select' ||
    target.isContentEditable
  );
}

export function cleanVocabWord(word: string): string {
  return word.replace(/\s*\(.*?\)/g, '').trim();
}

export function normalizeVi(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase()
    .replace(/\(.*?\)/g, ' ')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function extractVietnameseMeanings(meaningVi: string): string[] {
  const withoutParens = meaningVi.replace(/\(.*?\)/g, ' ');
  return withoutParens
    .split(/[,;/]+/)
    .map((part) => normalizeVi(part))
    .filter((part) => part.length > 0);
}

export function checkVietnameseMeaningMatch(input: string, meaningVi: string): boolean {
  const normInput = normalizeVi(input);
  if (!normInput || normInput.length < 2) return false;

  const candidates = extractVietnameseMeanings(meaningVi);
  const fullNorm = normalizeVi(meaningVi);
  if (normInput === fullNorm) return true;

  return candidates.some((candidate) => {
    if (candidate === normInput) return true;
    // Allow matching core phrase when user adds/drops filler like "su ", "bi ", "tinh "
    if (normInput.length >= 4 && candidate.includes(normInput)) {
      const candidateWords = candidate.split(' ');
      const inputWords = normInput.split(' ');
      return inputWords.length >= Math.max(1, candidateWords.length - 1);
    }
    return false;
  });
}

export function normalizeEn(text: string): string {
  return text
    .replace(/[’‘]/g, "'")
    .replace(/[“”"]/g, '')
    .replace(/[—–]/g, ' ')
    .toLowerCase()
    .replace(/[^a-z0-9'\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function tokenizeEnWords(text: string): string[] {
  const norm = normalizeEn(text);
  return norm ? norm.split(' ').filter(Boolean) : [];
}

/**
 * Computes word-level LCS diff between user input and expected English sentence.
 */
export function diffWords(userInput: string, target: string): WordDiffResult {
  const actualWords = tokenizeEnWords(userInput);
  const expectedWords = tokenizeEnWords(target);

  if (expectedWords.length === 0) {
    return { tokens: [], accuracy: actualWords.length === 0 ? 100 : 0, isExact: actualWords.length === 0 };
  }

  if (actualWords.length === 0) {
    return {
      tokens: expectedWords.map((expected) => ({ expected, status: 'missing' })),
      accuracy: 0,
      isExact: false,
    };
  }

  const m = expectedWords.length;
  const n = actualWords.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array<number>(n + 1).fill(0));

  for (let i = 1; i <= m; i += 1) {
    for (let j = 1; j <= n; j += 1) {
      if (expectedWords[i - 1] === actualWords[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  const aligned: WordDiffToken[] = [];
  let i = m;
  let j = n;
  let matchedCount = 0;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && expectedWords[i - 1] === actualWords[j - 1]) {
      aligned.push({
        expected: expectedWords[i - 1],
        actual: actualWords[j - 1],
        status: 'correct',
      });
      matchedCount += 1;
      i -= 1;
      j -= 1;
    } else if (i > 0 && j > 0 && dp[i - 1][j] === dp[i][j - 1]) {
      // Substituted word
      aligned.push({
        expected: expectedWords[i - 1],
        actual: actualWords[j - 1],
        status: 'wrong',
      });
      i -= 1;
      j -= 1;
    } else if (i > 0 && (j === 0 || dp[i - 1][j] > dp[i][j - 1])) {
      aligned.push({
        expected: expectedWords[i - 1],
        status: 'missing',
      });
      i -= 1;
    } else {
      aligned.push({
        actual: actualWords[j - 1],
        status: 'wrong',
      });
      j -= 1;
    }
  }

  aligned.reverse();
  const extraPenalty = Math.max(0, actualWords.length - expectedWords.length);
  const accuracy = Math.max(
    0,
    Math.min(100, Math.round((matchedCount / (expectedWords.length + extraPenalty)) * 100))
  );
  const isExact =
    matchedCount === expectedWords.length && actualWords.length === expectedWords.length;

  return { tokens: aligned, accuracy, isExact };
}

export function resolveDefaultPatternSentence(pattern: SentencePattern): string {
  return pattern.template
    .replace(/\[([^\]]+)\]/g, (_, key: string) => {
      const slot = pattern.slots?.find((s) => s.key === key);
      return slot?.options[0] ?? key;
    })
    .replace(/^"|"$/g, '')
    .trim();
}

export function getAllPracticeSentences(): PracticeSentenceItem[] {
  const vocabSentences: PracticeSentenceItem[] = VOCABULARY_ITEMS.map((item) => ({
    id: `v-${item.id}`,
    source: 'vocab',
    labelVi: `Từ vựng: ${item.word} (${item.meaningVi})`,
    en: item.exampleEn,
    vi: item.exampleVi,
    focusWord: cleanVocabWord(item.word),
    vocabId: item.id,
  }));

  const patternSentences: PracticeSentenceItem[] = SENTENCE_PATTERNS.map((pat) => ({
    id: `p-${pat.id}`,
    source: 'pattern',
    labelVi: `Mẫu câu ${pat.category.toUpperCase()}: ${pat.groupVi}`,
    en: resolveDefaultPatternSentence(pat),
    vi: pat.labelVi,
    focusWord: pat.category.toUpperCase(),
  }));

  const situationSayingSentences: PracticeSentenceItem[] = [];
  for (const sit of SITUATION_ITEMS) {
    sit.frames.forEach((frame, idx) => {
      situationSayingSentences.push({
        id: `s-${sit.id}-${idx}`,
        source: 'situation',
        labelVi: `${sit.code} (${sit.topic}) — Saying`,
        en: frame.saying.replace(/^"|"$/g, '').trim(),
        vi: frame.labelVi || sit.titleVi,
      });
    });
  }

  return [...vocabSentences, ...patternSentences, ...situationSayingSentences];
}

export function maskTargetWordInSentence(sentence: string, word: string): {
  masked: string;
  targetToken: string;
} {
  const clean = cleanVocabWord(word);
  const escaped = clean.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`\\b(${escaped}\\w*)\\b`, 'i');
  const match = sentence.match(regex);
  if (match) {
    return {
      masked: sentence.replace(regex, '________'),
      targetToken: match[1],
    };
  }
  return {
    masked: `${sentence} (Từ cần điền: ________)`,
    targetToken: clean,
  };
}
