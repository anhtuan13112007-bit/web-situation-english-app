import React, { useMemo, useState } from 'react';
import { Lightbulb, RotateCcw, Shuffle, Volume2 } from 'lucide-react';
import { isSpeechSupported, SpeechAccent, speakEnglish } from '../../utils/speech';
import { diffWords, getAllPracticeSentences, tokenizeEnWords } from '../../utils/studyHelpers';
import { WordDiffView } from './WordDiffView';

interface SentenceWritingModeProps {
  accent: SpeechAccent;
  onRecordMistake: (wordId: string) => void;
}

type SourceFilter = 'all' | 'vocab' | 'pattern' | 'situation';

export const SentenceWritingMode: React.FC<SentenceWritingModeProps> = ({
  accent,
  onRecordMistake,
}) => {
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');
  const [idx, setIdx] = useState(0);
  const [revealedWords, setRevealedWords] = useState(0);
  const [input, setInput] = useState('');
  const [checked, setChecked] = useState(false);

  const allSentences = useMemo(() => getAllPracticeSentences(), []);
  const deck = useMemo(
    () =>
      sourceFilter === 'all'
        ? allSentences
        : allSentences.filter((s) => s.source === sourceFilter),
    [allSentences, sourceFilter]
  );

  const activeItem = deck[idx % deck.length];
  const targetTokens = useMemo(
    () => (activeItem ? tokenizeEnWords(activeItem.en) : []),
    [activeItem]
  );

  const diff = useMemo(
    () => (checked && activeItem ? diffWords(input, activeItem.en) : null),
    [checked, activeItem, input]
  );

  const resetCurrent = () => {
    setInput('');
    setChecked(false);
    setRevealedWords(0);
  };

  const handleNext = () => {
    resetCurrent();
    setIdx((prev) => prev + 1);
  };

  const handleRandom = () => {
    if (deck.length <= 1) return;
    resetCurrent();
    setIdx(Math.floor(Math.random() * deck.length));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeItem || !input.trim()) return;
    if (checked) {
      handleNext();
      return;
    }
    setChecked(true);
    const result = diffWords(input, activeItem.en);
    if (result.accuracy < 80 && activeItem.vocabId) {
      onRecordMistake(activeItem.vocabId);
    }
  };

  const progressiveHint =
    revealedWords > 0
      ? targetTokens
          .map((w, i) => (i < revealedWords ? w : '___'))
          .join(' ')
      : '';

  return (
    <div className="space-y-5">
      {/* Deck Filter */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {(
            [
              { id: 'all', label: `Tất cả (${allSentences.length})` },
              { id: 'vocab', label: 'Ví dụ từ vựng (24)' },
              { id: 'pattern', label: 'Mẫu câu Form Ảnh 4 (21)' },
              { id: 'situation', label: 'Lời thoại Saying (13)' },
            ] as const
          ).map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => {
                setSourceFilter(f.id);
                setIdx(0);
                resetCurrent();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold border cursor-pointer ${
                sourceFilter === f.id
                  ? 'bg-[#1B365D] text-white border-[#1B365D]'
                  : 'bg-[#F5F7FA] text-[#475569] border-[#E2E8F0]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={handleRandom}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-xs font-semibold text-[#1B365D] hover:bg-slate-50 cursor-pointer"
        >
          <Shuffle className="w-3.5 h-3.5 text-[#2E6B9E]" /> Đổi câu ngẫu nhiên
        </button>
      </div>

      {activeItem && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs space-y-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#DBEAFE] text-[#1D4ED8] text-xs font-bold">
              {activeItem.labelVi}
            </span>
            <span className="text-xs text-[#475569]">
              Câu {(idx % deck.length) + 1} / {deck.length}
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-[#F5F7FA] border border-[#E2E8F0] space-y-2">
            <div className="text-xs uppercase font-bold text-[#475569]">
              Dịch Việt → Viết lại câu tiếng Anh chuẩn
            </div>
            <p className="text-base sm:text-lg font-bold text-[#1B365D] leading-relaxed">
              {activeItem.vi}
            </p>
            {activeItem.focusWord && (
              <div className="text-xs text-[#2E6B9E] font-semibold">
                Trọng tâm cần dùng: <code className="px-1.5 py-0.5 bg-white rounded border">{activeItem.focusWord}</code>
              </div>
            )}
          </div>

          {progressiveHint && (
            <div className="p-3.5 rounded-xl bg-[#FEF3C7]/60 border border-amber-200 text-xs sm:text-sm text-[#B45309] font-medium">
              <strong>Gợi ý ({revealedWords}/{targetTokens.length} từ): </strong>
              {progressiveHint}
            </div>
          )}

          <textarea
            rows={3}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Viết toàn bộ câu tiếng Anh vào đây (chấm từng từ)..."
            className="w-full p-3.5 text-sm sm:text-base rounded-xl border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#2E6B9E]"
          />

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setRevealedWords((prev) => Math.min(targetTokens.length, prev + 1))
                }
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-300 bg-[#FEF3C7]/50 text-[#B45309] text-xs font-semibold cursor-pointer"
              >
                <Lightbulb className="w-3.5 h-3.5" /> Hiện thêm 1 từ gợi ý
              </button>

              {isSpeechSupported() && (
                <button
                  type="button"
                  onClick={() => speakEnglish(activeItem.en, accent)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-xs font-semibold text-[#1B365D] hover:bg-slate-50 cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5 text-[#2E6B9E]" /> Nghe đáp án mẫu
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={resetCurrent}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs font-semibold text-[#475569] cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Viết lại
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#1B365D] hover:bg-[#152a49] text-white text-xs sm:text-sm font-semibold cursor-pointer"
              >
                {checked ? 'Câu tiếp theo' : 'Chấm từng từ'}
              </button>
            </div>
          </div>

          {diff && <WordDiffView diff={diff} expectedSentence={activeItem.en} />}
        </form>
      )}
    </div>
  );
};
