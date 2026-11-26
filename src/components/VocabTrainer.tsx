import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  RotateCw,
  Shuffle,
  Volume2,
  XCircle,
} from 'lucide-react';
import { VOCABULARY_ITEMS } from '../data/vocabulary';
import { VocabCategory, VocabItem, VocabMasteryStatus } from '../types';
import { isSpeechSupported, SpeechAccent, speakEnglish } from '../utils/speech';

interface VocabTrainerProps {
  mastery: Record<string, VocabMasteryStatus>;
  onUpdateMastery: (wordId: string, status: VocabMasteryStatus) => void;
}

type VocabSubMode = 'flashcards' | 'list' | 'quiz';

interface QuizQuestion {
  item: VocabItem;
  maskedSentence: string;
  options: string[];
}

function buildFillBlankQuiz(items: VocabItem[]): QuizQuestion[] {
  const shuffled = [...items].sort(() => Math.random() - 0.5).slice(0, 10);
  return shuffled.map((item) => {
    const cleanWord = item.word.replace(/\s*\(.*?\)/g, '').trim();
    const regex = new RegExp(`\\b${cleanWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\w*`, 'i');
    const maskedSentence = regex.test(item.exampleEn)
      ? item.exampleEn.replace(regex, '________')
      : `${item.exampleEn} (Nghĩa: ${item.meaningVi})`;

    const distractors = items
      .filter((other) => other.id !== item.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((other) => other.word);

    const options = [item.word, ...distractors].sort(() => Math.random() - 0.5);
    return { item, maskedSentence, options };
  });
}

const STATUS_BADGE: Record<VocabMasteryStatus, { label: string; className: string }> = {
  new: { label: 'Mới (New)', className: 'bg-slate-100 text-slate-700 border-slate-200' },
  learning: { label: 'Đang học (Learning)', className: 'bg-[#FEF3C7] text-[#B45309] border-amber-200' },
  mastered: { label: 'Đã thuộc (Mastered)', className: 'bg-[#DCFCE7] text-[#15803D] border-emerald-200' },
};

export const VocabTrainer: React.FC<VocabTrainerProps> = ({ mastery, onUpdateMastery }) => {
  const [subMode, setSubMode] = useState<VocabSubMode>('flashcards');
  const [categoryFilter, setCategoryFilter] = useState<'all' | VocabCategory>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | VocabMasteryStatus>('all');
  const [accent, setAccent] = useState<SpeechAccent>('en-GB');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Quiz state
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>(() =>
    buildFillBlankQuiz(VOCABULARY_ITEMS)
  );
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});

  const filteredItems = useMemo(() => {
    return VOCABULARY_ITEMS.filter((item) => {
      const catOk = categoryFilter === 'all' || item.category === categoryFilter;
      const itemStatus: VocabMasteryStatus = mastery[item.id] ?? 'new';
      const statusOk = statusFilter === 'all' || itemStatus === statusFilter;
      return catOk && statusOk;
    });
  }, [categoryFilter, statusFilter, mastery]);

  const counts = useMemo(() => {
    let masteredCount = 0;
    let learningCount = 0;
    for (const item of VOCABULARY_ITEMS) {
      const st = mastery[item.id] ?? 'new';
      if (st === 'mastered') masteredCount += 1;
      else if (st === 'learning') learningCount += 1;
    }
    return {
      total: VOCABULARY_ITEMS.length,
      mastered: masteredCount,
      learning: learningCount,
      newCount: VOCABULARY_ITEMS.length - masteredCount - learningCount,
    };
  }, [mastery]);

  const safeIdx = filteredItems.length > 0 ? currentIdx % filteredItems.length : 0;
  const activeCard = filteredItems[safeIdx];
  const speechAvailable = isSpeechSupported();

  const handleNext = () => {
    if (filteredItems.length === 0) return;
    setIsFlipped(false);
    setCurrentIdx((prev) => (prev + 1) % filteredItems.length);
  };

  const handlePrev = () => {
    if (filteredItems.length === 0) return;
    setIsFlipped(false);
    setCurrentIdx((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
  };

  const handleRandom = () => {
    if (filteredItems.length <= 1) return;
    setIsFlipped(false);
    let next = Math.floor(Math.random() * filteredItems.length);
    if (next === safeIdx) next = (safeIdx + 1) % filteredItems.length;
    setCurrentIdx(next);
  };

  const handleResetQuiz = () => {
    setQuizQuestions(buildFillBlankQuiz(VOCABULARY_ITEMS));
    setQuizAnswers({});
  };

  const quizScore = quizQuestions.reduce(
    (acc, q) => (quizAnswers[q.item.id] === q.item.word ? acc + 1 : acc),
    0
  );

  return (
    <div className="space-y-6">
      {/* Leitner Summary & Mode Controls */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-[#1B365D]">
              24 Từ vựng Trọng tâm Chuẩn Oxford IPA
            </h3>
            <p className="text-sm text-[#475569]">
              Học theo hộp Leitner (Mới → Đang học → Đã thuộc) với phát âm Anh-Anh (BrE) & Anh-Mỹ (NAmE).
            </p>
          </div>

          <div className="flex items-center gap-2 bg-[#F5F7FA] p-1 rounded-xl border border-[#E2E8F0]">
            {(['en-GB', 'en-US'] as SpeechAccent[]).map((acc) => (
              <button
                key={acc}
                type="button"
                onClick={() => setAccent(acc)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  accent === acc
                    ? 'bg-[#1B365D] text-white shadow-xs'
                    : 'text-[#475569] hover:text-[#1B365D]'
                }`}
              >
                {acc === 'en-GB' ? 'UK (BrE)' : 'US (NAmE)'}
              </button>
            ))}
          </div>
        </div>

        {/* Leitner Counters */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-[#F5F7FA] border border-[#E2E8F0] px-4 py-3">
            <div className="text-xs text-[#475569] font-medium">Mới (Box 1)</div>
            <div className="text-xl font-bold text-[#1B365D] mt-0.5">{counts.newCount}</div>
          </div>
          <div className="rounded-xl bg-[#FEF3C7]/60 border border-amber-200 px-4 py-3">
            <div className="text-xs text-[#B45309] font-medium">Đang học (Box 2)</div>
            <div className="text-xl font-bold text-[#B45309] mt-0.5">{counts.learning}</div>
          </div>
          <div className="rounded-xl bg-[#DCFCE7]/70 border border-emerald-200 px-4 py-3">
            <div className="text-xs text-[#15803D] font-medium">Đã thuộc (Box 3)</div>
            <div className="text-xl font-bold text-[#15803D] mt-0.5">
              {counts.mastered}/{counts.total}
            </div>
          </div>
        </div>

        {/* Mode Tabs & Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="inline-flex rounded-xl bg-[#F5F7FA] p-1 border border-[#E2E8F0]">
            {[
              { id: 'flashcards', label: 'Flashcards' },
              { id: 'list', label: 'Bảng từ vựng (24)' },
              { id: 'quiz', label: 'Quiz điền từ' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSubMode(tab.id as VocabSubMode)}
                className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition cursor-pointer ${
                  subMode === tab.id
                    ? 'bg-white text-[#1B365D] shadow-xs'
                    : 'text-[#475569] hover:text-[#1B365D]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {subMode !== 'quiz' && (
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value as 'all' | VocabCategory);
                  setCurrentIdx(0);
                  setIsFlipped(false);
                }}
                className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] bg-white text-xs sm:text-sm text-[#1F2933]"
                aria-label="Lọc nhóm từ vựng"
              >
                <option value="all">Tất cả chủ đề (24)</option>
                <option value="problem">Vấn đề lớp học (12)</option>
                <option value="pedagogy">Hành động & Mục tiêu (12)</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as 'all' | VocabMasteryStatus);
                  setCurrentIdx(0);
                  setIsFlipped(false);
                }}
                className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] bg-white text-xs sm:text-sm text-[#1F2933]"
                aria-label="Lọc trạng thái Leitner"
              >
                <option value="all">Mọi trạng thái</option>
                <option value="new">Mới (New)</option>
                <option value="learning">Đang học</option>
                <option value="mastered">Đã thuộc</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Mode 1: Flashcards */}
      {subMode === 'flashcards' && (
        <div className="space-y-4">
          {!activeCard ? (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-10 text-center text-[#475569]">
              Không có từ vựng nào khớp với bộ lọc hiện tại. Hãy đổi bộ lọc sang "Mọi trạng thái".
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between text-xs text-[#475569] px-1">
                <span>
                  Thẻ {safeIdx + 1} / {filteredItems.length} •{' '}
                  {activeCard.category === 'problem' ? 'Bảng 2.1: Hành vi & Vấn đề' : 'Bảng 2.2: Hành động & Mục tiêu'}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full border font-semibold ${
                    STATUS_BADGE[mastery[activeCard.id] ?? 'new'].className
                  }`}
                >
                  {STATUS_BADGE[mastery[activeCard.id] ?? 'new'].label}
                </span>
              </div>

              {/* Flip Card */}
              <div
                onClick={() => setIsFlipped((prev) => !prev)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    setIsFlipped((prev) => !prev);
                  }
                }}
                className="perspective-1000 cursor-pointer select-none"
              >
                <div
                  className={`relative w-full min-h-[290px] transition-transform duration-500 preserve-3d ${
                    isFlipped ? 'rotate-y-180' : ''
                  }`}
                >
                  {/* Front */}
                  <div className="absolute inset-0 backface-hidden bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6 sm:p-8 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-md bg-[#DBEAFE] text-[#1D4ED8] text-xs font-bold uppercase">
                        {activeCard.pos}
                      </span>
                      <span className="text-xs text-[#475569] flex items-center gap-1">
                        <RotateCw className="w-3.5 h-3.5" /> Nhấn để lật thẻ
                      </span>
                    </div>

                    <div className="text-center space-y-3 my-4">
                      <h4 className="text-3xl sm:text-4xl font-extrabold text-[#1B365D] tracking-tight">
                        {activeCard.word}
                      </h4>
                      <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-[#475569]">
                        <span className="ipa-text px-2.5 py-1 rounded-lg bg-[#F5F7FA] border border-[#E2E8F0]">
                          <strong className="text-[#1B365D]">BrE</strong> {activeCard.ipaBrE}
                        </span>
                        <span className="ipa-text px-2.5 py-1 rounded-lg bg-[#F5F7FA] border border-[#E2E8F0]">
                          <strong className="text-[#2E6B9E]">NAmE</strong> {activeCard.ipaNAmE}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        disabled={!speechAvailable}
                        onClick={(e) => {
                          e.stopPropagation();
                          speakEnglish(activeCard.word.replace(/\(.*?\)/g, '').trim(), 'en-GB');
                        }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#F5F7FA] hover:bg-[#DBEAFE] text-xs font-semibold text-[#1B365D] border border-[#E2E8F0] transition cursor-pointer disabled:opacity-40"
                      >
                        <Volume2 className="w-4 h-4 text-[#2E6B9E]" /> Nghe UK
                      </button>
                      <button
                        type="button"
                        disabled={!speechAvailable}
                        onClick={(e) => {
                          e.stopPropagation();
                          speakEnglish(activeCard.word.replace(/\(.*?\)/g, '').trim(), 'en-US');
                        }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#F5F7FA] hover:bg-[#DBEAFE] text-xs font-semibold text-[#1B365D] border border-[#E2E8F0] transition cursor-pointer disabled:opacity-40"
                      >
                        <Volume2 className="w-4 h-4 text-[#2E6B9E]" /> Nghe US
                      </button>
                    </div>
                  </div>

                  {/* Back */}
                  <div className="absolute inset-0 backface-hidden rotate-y-180 bg-white rounded-2xl border-2 border-[#2E6B9E]/40 shadow-sm p-6 sm:p-8 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-[#1B365D]">
                        {activeCard.word} <span className="text-[#475569] font-normal">({activeCard.pos})</span>
                      </span>
                      <button
                        type="button"
                        disabled={!speechAvailable}
                        onClick={(e) => {
                          e.stopPropagation();
                          speakEnglish(activeCard.exampleEn, accent);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#DBEAFE] text-[#1D4ED8] text-xs font-semibold cursor-pointer"
                      >
                        <Volume2 className="w-3.5 h-3.5" /> Đọc ví dụ
                      </button>
                    </div>

                    <div className="space-y-4 my-3">
                      <div>
                        <div className="text-xs uppercase tracking-wider text-[#475569] font-semibold">
                          Nghĩa tiếng Việt
                        </div>
                        <div className="text-xl sm:text-2xl font-bold text-[#15803D] mt-1">
                          {activeCard.meaningVi}
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-[#F5F7FA] border border-[#E2E8F0] space-y-1.5">
                        <div className="text-sm sm:text-base font-medium text-[#1F2933]">
                          “{activeCard.exampleEn}”
                        </div>
                        <div className="text-xs sm:text-sm text-[#475569]">{activeCard.exampleVi}</div>
                      </div>
                    </div>

                    <div className="text-center text-xs text-[#475569]">
                      Chọn mức độ ghi nhớ bên dưới để cập nhật tiến độ Leitner
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation & Leitner Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white rounded-2xl border border-[#E2E8F0] p-4">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-[#E2E8F0] hover:bg-slate-50 text-sm font-medium cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" /> Trước
                  </button>
                  <button
                    type="button"
                    onClick={handleRandom}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-[#E2E8F0] hover:bg-slate-50 text-sm font-medium cursor-pointer"
                    title="Chọn ngẫu nhiên"
                  >
                    <Shuffle className="w-4 h-4 text-[#2E6B9E]" /> Ngẫu nhiên
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-[#E2E8F0] hover:bg-slate-50 text-sm font-medium cursor-pointer"
                  >
                    Tiếp <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {(
                    [
                      { key: 'new', label: 'Chưa nhớ', style: 'border-slate-300 text-slate-700 hover:bg-slate-100' },
                      { key: 'learning', label: 'Đang học', style: 'border-amber-300 text-[#B45309] bg-[#FEF3C7]/40 hover:bg-[#FEF3C7]' },
                      { key: 'mastered', label: 'Đã thuộc', style: 'border-emerald-300 text-[#15803D] bg-[#DCFCE7]/50 hover:bg-[#DCFCE7]' },
                    ] as const
                  ).map((btn) => {
                    const isSelected = (mastery[activeCard.id] ?? 'new') === btn.key;
                    return (
                      <button
                        key={btn.key}
                        type="button"
                        onClick={() => {
                          onUpdateMastery(activeCard.id, btn.key);
                          handleNext();
                        }}
                        className={`px-3 py-2 rounded-lg border text-xs sm:text-sm font-semibold transition cursor-pointer ${
                          btn.style
                        } ${isSelected ? 'ring-2 ring-[#1B365D]/30' : ''}`}
                      >
                        {btn.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Mode 2: Full Table */}
      {subMode === 'list' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map((item) => {
            const st = mastery[item.id] ?? 'new';
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-[#E2E8F0] p-5 space-y-3 shadow-xs flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-lg font-bold text-[#1B365D]">{item.word}</span>
                        <span className="px-2 py-0.5 rounded bg-[#DBEAFE] text-[#1D4ED8] text-[11px] font-bold">
                          {item.pos}
                        </span>
                      </div>
                      <div className="ipa-text text-xs text-[#475569] mt-1 flex flex-wrap gap-x-3 gap-y-1">
                        <span>BrE {item.ipaBrE}</span>
                        <span>NAmE {item.ipaNAmE}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={!speechAvailable}
                      onClick={() => speakEnglish(item.word.replace(/\(.*?\)/g, '').trim(), accent)}
                      className="p-2 rounded-lg bg-[#F5F7FA] hover:bg-[#DBEAFE] text-[#2E6B9E] border border-[#E2E8F0] transition cursor-pointer shrink-0"
                      title={`Nghe phát âm (${accent})`}
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-sm font-semibold text-[#15803D]">{item.meaningVi}</p>

                  <div className="p-3 rounded-xl bg-[#F5F7FA] border border-[#E2E8F0] text-xs space-y-1">
                    <p className="text-[#1F2933] font-medium">{item.exampleEn}</p>
                    <p className="text-[#475569]">{item.exampleVi}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0]">
                  <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${STATUS_BADGE[st].className}`}>
                    {STATUS_BADGE[st].label}
                  </span>
                  <div className="flex items-center gap-1">
                    {(['new', 'learning', 'mastered'] as VocabMasteryStatus[]).map((target) => (
                      <button
                        key={target}
                        type="button"
                        onClick={() => onUpdateMastery(item.id, target)}
                        className={`px-2 py-1 rounded text-[11px] font-semibold cursor-pointer transition ${
                          st === target
                            ? 'bg-[#1B365D] text-white'
                            : 'bg-slate-100 text-[#475569] hover:bg-slate-200'
                        }`}
                      >
                        {target === 'new' ? 'Mới' : target === 'learning' ? 'Học' : 'Thuộc'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Mode 3: Fill-in-the-blank Quiz */}
      {subMode === 'quiz' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <HelpCircle className="w-5 h-5 text-[#2E6B9E]" />
              <div>
                <h4 className="font-bold text-[#1B365D] text-sm sm:text-base">
                  Quiz điền từ vào ngữ cảnh lớp học (10 câu)
                </h4>
                <p className="text-xs text-[#475569]">
                  Đúng {quizScore} / {quizQuestions.length} câu
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleResetQuiz}
              className="px-3.5 py-2 rounded-lg bg-[#1B365D] text-white text-xs font-semibold hover:bg-[#152a49] transition cursor-pointer"
            >
              Tạo bộ câu hỏi mới
            </button>
          </div>

          <div className="space-y-4">
            {quizQuestions.map((q, idx) => {
              const selected = quizAnswers[q.item.id];
              const isAnswered = Boolean(selected);
              const isCorrect = selected === q.item.word;

              return (
                <div
                  key={q.item.id}
                  className="bg-white rounded-2xl border border-[#E2E8F0] p-5 space-y-3 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm sm:text-base font-semibold text-[#1F2933]">
                      <span className="text-[#2E6B9E] mr-1.5">Câu {idx + 1}.</span>
                      {q.maskedSentence}
                    </p>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-[#475569] shrink-0">
                      {q.item.pos}
                    </span>
                  </div>

                  <p className="text-xs text-[#475569] italic">Gợi ý nghĩa: {q.item.meaningVi}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {q.options.map((opt) => {
                      let btnStyle = 'border-[#E2E8F0] bg-white hover:bg-slate-50 text-[#1F2933]';
                      if (isAnswered) {
                        if (opt === q.item.word) {
                          btnStyle = 'border-emerald-400 bg-[#DCFCE7] text-[#15803D] font-semibold';
                        } else if (opt === selected) {
                          btnStyle = 'border-red-300 bg-[#FEE2E2] text-[#B91C1C]';
                        } else {
                          btnStyle = 'border-[#E2E8F0] bg-slate-50 text-slate-400';
                        }
                      }

                      return (
                        <button
                          key={opt}
                          type="button"
                          disabled={isAnswered}
                          onClick={() => {
                            setQuizAnswers((prev) => ({ ...prev, [q.item.id]: opt }));
                            if (opt === q.item.word && (mastery[q.item.id] ?? 'new') === 'new') {
                              onUpdateMastery(q.item.id, 'learning');
                            }
                          }}
                          className={`px-3.5 py-2.5 rounded-xl border text-left text-sm transition cursor-pointer disabled:cursor-default ${btnStyle}`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {isAnswered && (
                    <div
                      className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                        isCorrect
                          ? 'bg-[#DCFCE7]/70 text-[#15803D]'
                          : 'bg-[#FEE2E2]/70 text-[#B91C1C]'
                      }`}
                    >
                      {isCorrect ? (
                        <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <strong>{q.item.word}</strong>{' '}
                        <span className="ipa-text">({q.item.ipaBrE})</span>: {q.item.exampleEn} —{' '}
                        {q.item.exampleVi}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
