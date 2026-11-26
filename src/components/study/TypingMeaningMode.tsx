import React, { useMemo, useState } from 'react';
import { CheckCircle2, Eye, RotateCw, Volume2, XCircle } from 'lucide-react';
import { VOCABULARY_ITEMS } from '../../data/vocabulary';
import { isSpeechSupported, SpeechAccent, speakEnglish } from '../../utils/speech';
import {
  checkVietnameseMeaningMatch,
  cleanVocabWord,
  normalizeEn,
} from '../../utils/studyHelpers';

interface TypingMeaningModeProps {
  accent: SpeechAccent;
  onlyMistakes?: boolean;
  mistakes: Record<string, number>;
  onRecordMistake: (wordId: string) => void;
}

type TypeDirection = 'en-to-vi' | 'vi-to-en';

export const TypingMeaningMode: React.FC<TypingMeaningModeProps> = ({
  accent,
  onlyMistakes = false,
  mistakes,
  onRecordMistake,
}) => {
  const [direction, setDirection] = useState<TypeDirection>('en-to-vi');
  const [filterMistakesOnly, setFilterMistakesOnly] = useState(onlyMistakes);
  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState('');
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [hintLevel, setHintLevel] = useState(0);
  const [stats, setStats] = useState({ correct: 0, total: 0 });

  const pool = useMemo(() => {
    if (!filterMistakesOnly) return VOCABULARY_ITEMS;
    const list = VOCABULARY_ITEMS.filter((v) => (mistakes[v.id] ?? 0) > 0);
    return list.length > 0 ? list : VOCABULARY_ITEMS;
  }, [filterMistakesOnly, mistakes]);

  const activeItem = pool[idx % pool.length];

  const handleCheckOrNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeItem) return;

    if (checked) {
      setIdx((prev) => prev + 1);
      setInput('');
      setChecked(false);
      setIsCorrect(false);
      setHintLevel(0);
      return;
    }

    if (!input.trim()) return;

    let ok = false;
    if (direction === 'en-to-vi') {
      ok = checkVietnameseMeaningMatch(input, activeItem.meaningVi);
    } else {
      const clean = normalizeEn(cleanVocabWord(activeItem.word));
      const full = normalizeEn(activeItem.word);
      const user = normalizeEn(input);
      ok = user === clean || user === full;
    }

    setChecked(true);
    setIsCorrect(ok);
    setStats((prev) => ({
      correct: prev.correct + (ok ? 1 : 0),
      total: prev.total + 1,
    }));

    if (!ok) {
      onRecordMistake(activeItem.id);
    }
  };

  const englishClean = cleanVocabWord(activeItem.word);
  const hintPreview =
    hintLevel > 0
      ? direction === 'vi-to-en'
        ? `${englishClean.slice(0, hintLevel)}${'•'.repeat(Math.max(0, englishClean.length - hintLevel))}`
        : `${activeItem.meaningVi.slice(0, hintLevel * 3)}...`
      : '';

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-xl bg-[#F5F7FA] p-1 border border-[#E2E8F0]">
          <button
            type="button"
            onClick={() => {
              setDirection('en-to-vi');
              setChecked(false);
              setInput('');
              setHintLevel(0);
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold cursor-pointer ${
              direction === 'en-to-vi' ? 'bg-white text-[#1B365D] shadow-xs' : 'text-[#475569]'
            }`}
          >
            Anh → Việt (Không cần dấu)
          </button>
          <button
            type="button"
            onClick={() => {
              setDirection('vi-to-en');
              setChecked(false);
              setInput('');
              setHintLevel(0);
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold cursor-pointer ${
              direction === 'vi-to-en' ? 'bg-white text-[#1B365D] shadow-xs' : 'text-[#475569]'
            }`}
          >
            Việt → Anh (Gõ từ chuẩn)
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setFilterMistakesOnly((prev) => !prev);
              setIdx(0);
              setChecked(false);
              setInput('');
            }}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer ${
              filterMistakesOnly
                ? 'bg-[#FEE2E2] border-red-200 text-[#B91C1C]'
                : 'bg-[#F5F7FA] border-[#E2E8F0] text-[#475569]'
            }`}
          >
            {filterMistakesOnly ? 'Đang lọc từ hay sai' : 'Luyện từ hay sai'}
          </button>
          <span className="text-xs font-semibold text-[#1B365D]">
            Đúng: {stats.correct}/{stats.total}
          </span>
        </div>
      </div>

      <form
        onSubmit={handleCheckOrNext}
        className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs space-y-5"
      >
        <div className="flex items-center justify-between text-xs text-[#475569]">
          <span>
            Từ {(idx % pool.length) + 1} / {pool.length} • Loại từ: <strong>{activeItem.pos}</strong>
          </span>
          {direction === 'en-to-vi' && (
            <span>Chấp nhận 1 trong các nghĩa, không cần gõ dấu</span>
          )}
        </div>

        <div className="p-6 rounded-2xl bg-[#F5F7FA] border border-[#E2E8F0] text-center space-y-2">
          {direction === 'en-to-vi' ? (
            <>
              <div className="flex items-center justify-center gap-3">
                <h4 className="text-3xl font-extrabold text-[#1B365D]">{activeItem.word}</h4>
                {isSpeechSupported() && (
                  <button
                    type="button"
                    onClick={() => speakEnglish(englishClean, accent)}
                    className="p-2 rounded-lg bg-white border border-[#E2E8F0] text-[#2E6B9E] hover:bg-[#DBEAFE] cursor-pointer"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="ipa-text text-xs text-[#475569]">
                BrE {activeItem.ipaBrE} · NAmE {activeItem.ipaNAmE}
              </div>
            </>
          ) : (
            <>
              <div className="text-xs uppercase font-semibold text-[#475569]">Nghĩa tiếng Việt</div>
              <h4 className="text-2xl font-bold text-[#15803D]">{activeItem.meaningVi}</h4>
            </>
          )}

          {hintPreview && (
            <div className="text-xs font-mono font-bold text-[#2E6B9E] pt-1">Gợi ý: {hintPreview}</div>
          )}
        </div>

        <div className="space-y-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              direction === 'en-to-vi'
                ? 'Nhập 1 nghĩa tiếng Việt (ví dụ: mat tap trung)...'
                : 'Nhập từ/cụm từ tiếng Anh chính xác...'
            }
            className="w-full px-4 py-3 text-base rounded-xl border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#2E6B9E]"
          />

          <div className="flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setHintLevel((prev) => prev + 1)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-xs font-semibold text-[#475569] hover:bg-slate-50 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" /> Gợi ý
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setIdx((prev) => prev + 1);
                  setInput('');
                  setChecked(false);
                  setHintLevel(0);
                }}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs font-semibold text-[#475569] cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5" /> Bỏ qua
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#1B365D] hover:bg-[#152a49] text-white text-xs sm:text-sm font-semibold cursor-pointer"
              >
                {checked ? 'Từ tiếp theo (Enter)' : 'Kiểm tra (Enter)'}
              </button>
            </div>
          </div>
        </div>

        {checked && (
          <div
            className={`p-4 rounded-xl text-xs sm:text-sm flex items-start gap-2.5 ${
              isCorrect ? 'bg-[#DCFCE7]/70 text-[#15803D]' : 'bg-[#FEE2E2]/70 text-[#B91C1C]'
            }`}
          >
            {isCorrect ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <div>
                <strong>{activeItem.word}</strong>{' '}
                <span className="ipa-text">({activeItem.ipaBrE})</span>: {activeItem.meaningVi}
              </div>
              <div className="text-xs text-[#1F2933]">
                {activeItem.exampleEn} — {activeItem.exampleVi}
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
