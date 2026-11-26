import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  BookMarked,
  BookOpen,
  ClipboardCheck,
  Gamepad2,
  GraduationCap,
  Headphones,
  Keyboard,
  Layers,
  Link2,
  ListChecks,
  Mic,
  PenLine,
} from 'lucide-react';
import { GRAMMAR_LESSONS } from '../data/grammar';
import { SENTENCE_PATTERNS } from '../data/patterns';
import { VOCABULARY_ITEMS } from '../data/vocabulary';
import { ExamRecord, StudyModeId, TabId, VocabMasteryStatus } from '../types';
import { SpeechAccent } from '../utils/speech';
import { ExamMode } from './study/ExamMode';
import { FlashcardMode } from './study/FlashcardMode';
import { ListeningMode } from './study/ListeningMode';
import { MatchingGameMode } from './study/MatchingGameMode';
import { MinigamesMode } from './study/MinigamesMode';
import { NotebookMode } from './study/NotebookMode';
import { QuizMode } from './study/QuizMode';
import { SentenceWritingMode } from './study/SentenceWritingMode';
import { SpeakingMode } from './study/SpeakingMode';
import { TypingMeaningMode } from './study/TypingMeaningMode';

interface StudyHubProps {
  mastery: Record<string, VocabMasteryStatus>;
  mistakes: Record<string, number>;
  examHistory: ExamRecord[];
  onUpdateMastery: (wordId: string, status: VocabMasteryStatus) => void;
  onRecordMistake: (wordId: string) => void;
  onSaveExam: (record: ExamRecord) => void;
  onNavigateTab: (tab: TabId) => void;
}

interface BentoCardDef {
  id: string;
  targetMode?: StudyModeId;
  targetTab?: TabId;
  category: string;
  categoryColor: string;
  title: string;
  bullets: string[];
  icon: React.ComponentType<{ className?: string }>;
  highlightWrite?: boolean;
}

const BENTO_CARDS: BentoCardDef[] = [
  {
    id: 'flashcard',
    targetMode: 'flashcard',
    category: 'GHI NHỚ',
    categoryColor: 'text-[#2E6B9E]',
    title: 'Flashcard',
    bullets: [
      'Lật thẻ 2 chiều EN ⇄ VN + Gõ nhanh trước khi lật',
      'Hộp Leitner: Thuộc / Đang học / Quên',
      'Phát âm Anh-Anh (BrE) & Anh-Mỹ (NAmE)',
    ],
    icon: BookOpen,
  },
  {
    id: 'quiz',
    targetMode: 'quiz',
    category: 'LUYỆN TẬP',
    categoryColor: 'text-[#15803D]',
    title: 'Trắc nghiệm',
    bullets: [
      'Từ → Nghĩa · Ngữ cảnh · Nghĩa → Từ · Mẫu câu',
      '30 giây mỗi câu, có nút Câu tiếp',
      'Phím 1–4 để chọn nhanh đáp án',
    ],
    icon: ListChecks,
  },
  {
    id: 'listening',
    targetMode: 'listening',
    category: 'NGHE · VIẾT',
    categoryColor: 'text-[#1D4ED8]',
    title: 'Listening',
    bullets: [
      'Nghe và gõ từ, có gợi ý từng chữ',
      'Nghe câu, điền từ còn thiếu',
      'Chép chính tả cả câu & Shadowing',
    ],
    icon: Headphones,
    highlightWrite: true,
  },
  {
    id: 'typing-meaning',
    targetMode: 'typing-meaning',
    category: 'VIẾT (ƯU TIÊN)',
    categoryColor: 'text-[#B45309]',
    title: 'Gõ nghĩa & Gõ từ',
    bullets: [
      'Anh → Việt & Việt → Anh chủ động',
      'Không cần gõ dấu tiếng Việt',
      'Chấp nhận 1 trong các nghĩa chuẩn',
    ],
    icon: Keyboard,
    highlightWrite: true,
  },
  {
    id: 'sentence-writing',
    targetMode: 'sentence-writing',
    category: 'VIẾT (ƯU TIÊN)',
    categoryColor: 'text-[#B45309]',
    title: 'Viết câu',
    bullets: [
      'Việt → Anh cho 58 câu ví dụ & mẫu câu',
      'Hiện dần từng từ gợi ý khi cần',
      'Chấm chi tiết theo từng từ (Word Diff)',
    ],
    icon: PenLine,
    highlightWrite: true,
  },
  {
    id: 'matching',
    targetMode: 'matching',
    category: 'TRÒ CHƠI',
    categoryColor: 'text-[#B45309]',
    title: 'Nối từ',
    bullets: [
      '6 cặp mỗi vòng (Từ vựng hoặc Mẫu câu)',
      '5 tim, 90 giây mỗi vòng',
      'Nghe phát âm ngay khi chọn thẻ Anh',
    ],
    icon: Link2,
  },
  {
    id: 'minigames',
    targetMode: 'minigames',
    category: 'TRÒ CHƠI · VIẾT',
    categoryColor: 'text-[#B45309]',
    title: 'Minigame',
    bullets: [
      'Đoán chữ · Sắp xếp chữ · Lật thẻ',
      'Mưa từ (gõ nhanh) · Xếp & gõ câu',
      'Đúng hay Sai 60 giây',
    ],
    icon: Gamepad2,
    highlightWrite: true,
  },
  {
    id: 'grammar',
    targetTab: 'grammar',
    category: 'CẤU TRÚC · VIẾT',
    categoryColor: 'text-[#15803D]',
    title: 'Ngữ pháp',
    bullets: [
      `${GRAMMAR_LESSONS.length} cấu trúc trọng tâm trong tài liệu`,
      'Lý thuyết + ví dụ có dịch & phát âm',
      '30 câu trắc nghiệm + 18 bài viết lại câu',
    ],
    icon: GraduationCap,
    highlightWrite: true,
  },
  {
    id: 'patterns',
    targetTab: 'patterns',
    category: 'MẪU CÂU · VIẾT',
    categoryColor: 'text-[#1D4ED8]',
    title: 'Mẫu câu Form Ảnh 4',
    bullets: [
      `${SENTENCE_PATTERNS.length} mẫu câu Action – Saying – Goal`,
      'Ghép từ vào ô trống [slot] trực tiếp',
      'Luyện viết lại toàn bộ mẫu câu chuẩn',
    ],
    icon: Layers,
    highlightWrite: true,
  },
  {
    id: 'speaking',
    targetMode: 'speaking',
    category: 'NÓI · SHADOWING',
    categoryColor: 'text-[#1D4ED8]',
    title: 'Speaking Lab',
    bullets: [
      'Đọc từ vựng, mẫu câu & lời thoại Saying',
      'Nghe mẫu tốc độ 0.75x hoặc chuẩn',
      'Nhận diện giọng nói Micro & chấm từng từ',
    ],
    icon: Mic,
  },
  {
    id: 'exam',
    targetMode: 'exam',
    category: 'TỔNG HỢP',
    categoryColor: 'text-[#15803D]',
    title: 'Bài kiểm tra',
    bullets: [
      'Reading · Writing · Listening · Speaking',
      'Chấm điểm thang 10 theo 4 kỹ năng',
      'Xem lại câu sai & ôn từ liên quan',
    ],
    icon: ClipboardCheck,
    highlightWrite: true,
  },
  {
    id: 'notebook',
    targetMode: 'notebook',
    category: 'TRA CỨU',
    categoryColor: 'text-[#2E6B9E]',
    title: 'Sổ từ vựng',
    bullets: [
      `${VOCABULARY_ITEMS.length} từ Oxford IPA + ${SENTENCE_PATTERNS.length} mẫu câu`,
      'Tìm kiếm, lọc từ hay sai',
      'Chuyển nhanh vào bài luyện viết từ sai',
    ],
    icon: BookMarked,
  },
];

const INTERNAL_MODE_OPTIONS: { id: StudyModeId; label: string }[] = [
  { id: 'flashcard', label: 'Flashcard (EN ⇄ VN)' },
  { id: 'quiz', label: 'Trắc nghiệm 30s' },
  { id: 'listening', label: 'Listening (Nghe & Viết)' },
  { id: 'typing-meaning', label: 'Gõ nghĩa & Gõ từ' },
  { id: 'sentence-writing', label: 'Viết câu Việt → Anh' },
  { id: 'matching', label: 'Nối từ 6 cặp' },
  { id: 'minigames', label: '6 Minigames' },
  { id: 'speaking', label: 'Speaking & Shadowing' },
  { id: 'exam', label: 'Bài kiểm tra 4 kỹ năng' },
  { id: 'notebook', label: 'Sổ từ vựng & Mẫu câu' },
];

export const StudyHub: React.FC<StudyHubProps> = ({
  mastery,
  mistakes,
  examHistory,
  onUpdateMastery,
  onRecordMistake,
  onSaveExam,
  onNavigateTab,
}) => {
  const [mode, setMode] = useState<StudyModeId>('overview');
  const [accent, setAccent] = useState<SpeechAccent>('en-GB');
  const [typingMistakesOnly, setTypingMistakesOnly] = useState(false);

  const stats = useMemo(() => {
    const mastered = VOCABULARY_ITEMS.filter((v) => mastery[v.id] === 'mastered').length;
    const mistakeWords = VOCABULARY_ITEMS.filter((v) => (mistakes[v.id] ?? 0) > 0).length;
    return { mastered, mistakeWords };
  }, [mastery, mistakes]);

  const handleOpenCard = (card: BentoCardDef) => {
    if (card.targetTab) {
      onNavigateTab(card.targetTab);
      return;
    }
    if (card.targetMode) {
      setTypingMistakesOnly(false);
      setMode(card.targetMode);
    }
  };

  if (mode !== 'overview') {
    return (
      <div className="space-y-5">
        {/* Sticky Mode Switcher Bar */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setMode('overview')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F5F7FA] hover:bg-[#DBEAFE] border border-[#E2E8F0] text-xs sm:text-sm font-semibold text-[#1B365D] cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> 12 Chế độ học
            </button>

            <select
              value={mode}
              onChange={(e) => {
                setTypingMistakesOnly(false);
                setMode(e.target.value as StudyModeId);
              }}
              className="px-3 py-1.5 rounded-xl border border-[#E2E8F0] bg-white text-xs sm:text-sm font-bold text-[#1B365D]"
              aria-label="Chuyển chế độ học"
            >
              {INTERNAL_MODE_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="inline-flex rounded-xl bg-[#F5F7FA] p-1 border border-[#E2E8F0]">
            {(['en-GB', 'en-US'] as SpeechAccent[]).map((acc) => (
              <button
                key={acc}
                type="button"
                onClick={() => setAccent(acc)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                  accent === acc ? 'bg-[#1B365D] text-white' : 'text-[#475569]'
                }`}
              >
                {acc === 'en-GB' ? 'UK (BrE)' : 'US (NAmE)'}
              </button>
            ))}
          </div>
        </div>

        {mode === 'flashcard' && (
          <FlashcardMode
            accent={accent}
            mastery={mastery}
            onUpdateMastery={onUpdateMastery}
            onRecordMistake={onRecordMistake}
          />
        )}
        {mode === 'quiz' && <QuizMode accent={accent} onRecordMistake={onRecordMistake} />}
        {mode === 'listening' && (
          <ListeningMode accent={accent} onRecordMistake={onRecordMistake} />
        )}
        {mode === 'typing-meaning' && (
          <TypingMeaningMode
            accent={accent}
            onlyMistakes={typingMistakesOnly}
            mistakes={mistakes}
            onRecordMistake={onRecordMistake}
          />
        )}
        {mode === 'sentence-writing' && (
          <SentenceWritingMode accent={accent} onRecordMistake={onRecordMistake} />
        )}
        {mode === 'matching' && (
          <MatchingGameMode accent={accent} onRecordMistake={onRecordMistake} />
        )}
        {mode === 'minigames' && (
          <MinigamesMode accent={accent} onRecordMistake={onRecordMistake} />
        )}
        {mode === 'speaking' && <SpeakingMode accent={accent} />}
        {mode === 'exam' && (
          <ExamMode
            accent={accent}
            examHistory={examHistory}
            onSaveExam={onSaveExam}
            onRecordMistake={onRecordMistake}
            onPracticeMistakes={() => {
              setTypingMistakesOnly(true);
              setMode('typing-meaning');
            }}
          />
        )}
        {mode === 'notebook' && (
          <NotebookMode
            accent={accent}
            mastery={mastery}
            mistakes={mistakes}
            onUpdateMastery={onUpdateMastery}
            onPracticeMistakes={() => {
              setTypingMistakesOnly(true);
              setMode('typing-meaning');
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Bento Header Banner */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 sm:p-7 shadow-xs text-center space-y-3">
        <div className="text-xs font-bold uppercase tracking-[0.18em] text-[#2E6B9E]">
          CHẾ ĐỘ HỌC 4 KỸ NĂNG · ƯU TIÊN VIẾT
        </div>
        <h3 className="text-2xl sm:text-3xl font-extrabold text-[#1B365D] tracking-tight">
          12 cách luyện <span className="text-[#B45309]">cùng bộ từ, mẫu câu &amp; ngữ pháp</span>
        </h3>
        <p className="text-xs sm:text-sm text-[#475569] max-w-2xl mx-auto">
          Phím tắt: <kbd className="px-1.5 py-0.5 bg-[#F5F7FA] border rounded">Space</kbd> lật thẻ,{' '}
          <kbd className="px-1.5 py-0.5 bg-[#F5F7FA] border rounded">1–4</kbd> chọn đáp án,{' '}
          <kbd className="px-1.5 py-0.5 bg-[#F5F7FA] border rounded">Enter</kbd> kiểm tra hoặc sang câu tiếp.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          <span className="px-3 py-1 rounded-full bg-[#DCFCE7] text-[#15803D] text-xs font-semibold">
            Đã thuộc: {stats.mastered}/{VOCABULARY_ITEMS.length} từ
          </span>
          <span className="px-3 py-1 rounded-full bg-[#DBEAFE] text-[#1D4ED8] text-xs font-semibold">
            {SENTENCE_PATTERNS.length} mẫu câu · {GRAMMAR_LESSONS.length} điểm ngữ pháp
          </span>
          {stats.mistakeWords > 0 && (
            <button
              type="button"
              onClick={() => {
                setTypingMistakesOnly(true);
                setMode('typing-meaning');
              }}
              className="px-3 py-1 rounded-full bg-[#FEE2E2] hover:bg-red-200 text-[#B91C1C] text-xs font-semibold cursor-pointer"
            >
              Ôn viết {stats.mistakeWords} từ hay sai →
            </button>
          )}
        </div>
      </div>

      {/* 12-Card Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {BENTO_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => handleOpenCard(card)}
              className={`group text-left bg-white rounded-2xl border p-5 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                card.highlightWrite
                  ? 'border-[#E2E8F0] hover:border-[#2E6B9E]'
                  : 'border-[#E2E8F0] hover:border-[#1B365D]/40'
              }`}
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-[11px] font-extrabold uppercase tracking-wider ${card.categoryColor}`}>
                    {card.category}
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-[#F5F7FA] group-hover:bg-[#DBEAFE] flex items-center justify-center text-[#1B365D] transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <h4 className="text-lg font-extrabold text-[#1B365D] group-hover:text-[#2E6B9E] transition-colors">
                  {card.title}
                </h4>

                <ul className="space-y-1.5 text-xs text-[#475569]">
                  {card.bullets.map((b, i) => (
                    <li key={i} className="flex items-start gap-1.5 leading-snug">
                      <span className="text-[#2E6B9E] font-bold">→</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
