import React, { useMemo, useState } from 'react';
import { Check, Copy, Lightbulb, PenLine, RotateCcw, Search, Sparkles, Volume2 } from 'lucide-react';
import { SENTENCE_PATTERNS } from '../data/patterns';
import { PatternCategory, SentencePattern } from '../types';
import { isSpeechSupported, speakEnglish } from '../utils/speech';
import { diffWords, resolveDefaultPatternSentence, tokenizeEnWords } from '../utils/studyHelpers';
import { WordDiffView } from './study/WordDiffView';

const CATEGORY_META: Record<
  PatternCategory,
  { label: string; badgeClass: string; borderClass: string; slotClass: string }
> = {
  action: {
    label: 'Action (What would you do?)',
    badgeClass: 'bg-[#DBEAFE] text-[#1D4ED8] border-blue-200',
    borderClass: 'border-l-4 border-l-[#1D4ED8]',
    slotClass: 'bg-[#DBEAFE] text-[#1D4ED8] border-blue-300',
  },
  saying: {
    label: 'Saying (Direct Speech)',
    badgeClass: 'bg-[#FEF3C7] text-[#B45309] border-amber-200',
    borderClass: 'border-l-4 border-l-[#B45309]',
    slotClass: 'bg-[#FEF3C7] text-[#B45309] border-amber-300',
  },
  goal: {
    label: 'Goal (Why would you do it?)',
    badgeClass: 'bg-[#DCFCE7] text-[#15803D] border-emerald-200',
    borderClass: 'border-l-4 border-l-[#15803D]',
    slotClass: 'bg-[#DCFCE7] text-[#15803D] border-emerald-300',
  },
};

function resolveTemplate(pattern: SentencePattern, values: Record<string, string>): string {
  return pattern.template.replace(/\[([^\]]+)\]/g, (_, key: string) => {
    const val = values[key]?.trim();
    if (val) return val;
    const defaultOpt = pattern.slots?.find((s) => s.key === key)?.options[0];
    return defaultOpt || `[${key}]`;
  });
}

export const PatternBank: React.FC = () => {
  const [subMode, setSubMode] = useState<'browse' | 'write'>('browse');
  const [filter, setFilter] = useState<'all' | PatternCategory>('all');
  const [search, setSearch] = useState('');
  const [practiceId, setPracticeId] = useState<string | null>(null);
  const [slotValues, setSlotValues] = useState<Record<string, Record<string, string>>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Writing Drill state
  const [writeIdx, setWriteIdx] = useState(0);
  const [writeInput, setWriteInput] = useState('');
  const [writeChecked, setWriteChecked] = useState(false);
  const [revealedWords, setRevealedWords] = useState(0);

  const filteredPatterns = useMemo(() => {
    const q = search.trim().toLowerCase();
    return SENTENCE_PATTERNS.filter((p) => {
      const catOk = filter === 'all' || p.category === filter;
      const textOk =
        !q ||
        p.template.toLowerCase().includes(q) ||
        p.labelVi.toLowerCase().includes(q) ||
        p.groupVi.toLowerCase().includes(q);
      return catOk && textOk;
    });
  }, [filter, search]);

  const activeWritePattern =
    filteredPatterns.length > 0
      ? filteredPatterns[writeIdx % filteredPatterns.length]
      : SENTENCE_PATTERNS[0];
  const targetWriteSentence = resolveDefaultPatternSentence(activeWritePattern);
  const targetWriteTokens = useMemo(
    () => tokenizeEnWords(targetWriteSentence),
    [targetWriteSentence]
  );
  const writeDiff = useMemo(
    () => (writeChecked ? diffWords(writeInput, targetWriteSentence) : null),
    [writeChecked, writeInput, targetWriteSentence]
  );

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId((prev) => (prev === id ? null : prev)), 1500);
    } catch {
      // ignore clipboard errors
    }
  };

  const renderHighlightedTemplate = (pattern: SentencePattern, values: Record<string, string>) => {
    const meta = CATEGORY_META[pattern.category];
    const parts = pattern.template.split(/(\[[^\]]+\])/g);
    return parts.map((part, i) => {
      if (part.startsWith('[') && part.endsWith(']')) {
        const key = part.slice(1, -1);
        const filled = values[key]?.trim();
        return (
          <span
            key={i}
            className={`inline-block px-2 py-0.5 mx-0.5 rounded-md border text-sm font-semibold ${meta.slotClass}`}
          >
            {filled || part}
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header & Mode / Filter Bar */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-[#1B365D]">
              Kho Mẫu câu Chuẩn Form Ảnh 4 ({SENTENCE_PATTERNS.length} mẫu)
            </h3>
            <p className="text-sm text-[#475569]">
              Tra cứu, ghép chỗ trống hoặc chuyển sang chế độ <strong>Luyện Viết Mẫu Câu</strong> để nhớ chắc từng cấu trúc.
            </p>
          </div>

          <div className="inline-flex rounded-xl bg-[#F5F7FA] p-1 border border-[#E2E8F0]">
            <button
              type="button"
              onClick={() => setSubMode('browse')}
              className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold cursor-pointer ${
                subMode === 'browse' ? 'bg-white text-[#1B365D] shadow-xs' : 'text-[#475569]'
              }`}
            >
              Tra cứu &amp; Ghép ô trống
            </button>
            <button
              type="button"
              onClick={() => setSubMode('write')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold cursor-pointer ${
                subMode === 'write' ? 'bg-[#1B365D] text-white shadow-xs' : 'text-[#475569]'
              }`}
            >
              <PenLine className="w-3.5 h-3.5" /> Luyện Viết Mẫu Câu
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {(
              [
                { id: 'all', label: `Tất cả (${SENTENCE_PATTERNS.length})` },
                { id: 'action', label: 'Action' },
                { id: 'saying', label: 'Saying (Direct Speech)' },
                { id: 'goal', label: 'Goal' },
              ] as const
            ).map((btn) => (
              <button
                key={btn.id}
                type="button"
                onClick={() => {
                  setFilter(btn.id);
                  setWriteIdx(0);
                  setWriteInput('');
                  setWriteChecked(false);
                  setRevealedWords(0);
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold border transition cursor-pointer ${
                  filter === btn.id
                    ? 'bg-[#1B365D] text-white border-[#1B365D]'
                    : 'bg-[#F5F7FA] text-[#475569] border-[#E2E8F0] hover:bg-slate-100'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-[#475569] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm mẫu câu..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#2E6B9E]"
            />
          </div>
        </div>
      </div>

      {/* Mode: Writing Drill */}
      {subMode === 'write' ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!writeInput.trim()) return;
            if (writeChecked) {
              setWriteIdx((prev) => prev + 1);
              setWriteInput('');
              setWriteChecked(false);
              setRevealedWords(0);
            } else {
              setWriteChecked(true);
            }
          }}
          className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs space-y-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-0.5 rounded-full border text-xs font-bold ${
                  CATEGORY_META[activeWritePattern.category].badgeClass
                }`}
              >
                {activeWritePattern.category.toUpperCase()}
              </span>
              <span className="text-xs font-semibold text-[#2E6B9E]">
                {activeWritePattern.groupVi}
              </span>
            </div>
            <span className="text-xs text-[#475569]">
              Mẫu {(writeIdx % Math.max(1, filteredPatterns.length)) + 1} /{' '}
              {Math.max(1, filteredPatterns.length)}
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-[#F5F7FA] border border-[#E2E8F0] space-y-1.5">
            <div className="text-xs uppercase font-bold text-[#475569]">
              Viết mẫu câu tiếng Anh diễn đạt ý sau:
            </div>
            <p className="text-lg font-bold text-[#1B365D]">{activeWritePattern.labelVi}</p>
            <p className="text-xs text-[#475569]">{activeWritePattern.usageNoteVi}</p>
          </div>

          {revealedWords > 0 && (
            <div className="p-3.5 rounded-xl bg-[#FEF3C7]/60 border border-amber-200 text-xs sm:text-sm text-[#B45309] font-medium">
              <strong>Gợi ý ({revealedWords}/{targetWriteTokens.length} từ): </strong>
              {targetWriteTokens.map((w, i) => (i < revealedWords ? w : '___')).join(' ')}
            </div>
          )}

          <textarea
            rows={3}
            value={writeInput}
            onChange={(e) => {
              setWriteInput(e.target.value);
              setWriteChecked(false);
            }}
            placeholder="Gõ lại mẫu câu tiếng Anh đầy đủ (chấm chính xác từng từ)..."
            className="w-full p-3.5 text-sm sm:text-base rounded-xl border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#2E6B9E]"
          />

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  setRevealedWords((prev) => Math.min(targetWriteTokens.length, prev + 2))
                }
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-amber-300 bg-[#FEF3C7]/50 text-[#B45309] text-xs font-semibold cursor-pointer"
              >
                <Lightbulb className="w-3.5 h-3.5" /> Hiện thêm 2 từ gợi ý
              </button>

              {isSpeechSupported() && (
                <button
                  type="button"
                  onClick={() => speakEnglish(targetWriteSentence, 'en-GB')}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-xs font-semibold text-[#1B365D] cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5 text-[#2E6B9E]" /> Nghe mẫu
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setWriteInput('');
                  setWriteChecked(false);
                  setRevealedWords(0);
                }}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs font-semibold text-[#475569] cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Xóa
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#1B365D] hover:bg-[#152a49] text-white text-xs sm:text-sm font-semibold cursor-pointer"
              >
                {writeChecked ? 'Mẫu tiếp theo' : 'Chấm từng từ'}
              </button>
            </div>
          </div>

          {writeDiff && <WordDiffView diff={writeDiff} expectedSentence={targetWriteSentence} />}
        </form>
      ) : (
        /* Patterns List */
        <div className="space-y-4">
          {filteredPatterns.map((pattern) => {
            const meta = CATEGORY_META[pattern.category];
            const currentValues = slotValues[pattern.id] ?? {};
            const resolvedSentence = resolveTemplate(pattern, currentValues);
            const isPracticing = practiceId === pattern.id;

            return (
              <div
                key={pattern.id}
                className={`bg-white rounded-2xl border border-[#E2E8F0] ${meta.borderClass} p-5 sm:p-6 shadow-xs space-y-3`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full border text-xs font-bold ${meta.badgeClass}`}>
                      {pattern.category.toUpperCase()}
                    </span>
                    <span className="text-xs font-semibold text-[#2E6B9E]">{pattern.groupVi}</span>
                    <span className="text-xs text-[#475569]">• {pattern.labelVi}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isSpeechSupported() && (
                      <button
                        type="button"
                        onClick={() => speakEnglish(resolvedSentence, 'en-GB')}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] hover:bg-slate-50 text-xs font-medium text-[#1B365D] cursor-pointer"
                        title="Nghe câu hoàn chỉnh"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-[#2E6B9E]" /> Nghe
                      </button>
                    )}

                    {pattern.slots && pattern.slots.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setPracticeId((prev) => (prev === pattern.id ? null : pattern.id))}
                        className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition cursor-pointer ${
                          isPracticing
                            ? 'bg-[#2E6B9E] text-white border-[#2E6B9E]'
                            : 'border-[#E2E8F0] text-[#2E6B9E] hover:bg-[#DBEAFE]/40'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        {isPracticing ? 'Đóng ghép từ' : 'Ghép chỗ trống'}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleCopy(pattern.id, resolvedSentence)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#F5F7FA] hover:bg-[#DBEAFE] border border-[#E2E8F0] text-xs font-semibold text-[#1B365D] transition cursor-pointer"
                    >
                      {copiedId === pattern.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#15803D]" /> Đã chép
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Sao chép
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="text-base sm:text-lg font-medium text-[#1F2933] leading-relaxed">
                  {renderHighlightedTemplate(pattern, currentValues)}
                </div>

                <p className="text-xs text-[#475569]">{pattern.usageNoteVi}</p>

                {/* Interactive Slot Practice Drawer */}
                {isPracticing && pattern.slots && (
                  <div className="mt-3 p-4 rounded-xl bg-[#F5F7FA] border border-[#E2E8F0] space-y-3">
                    <div className="text-xs font-bold text-[#1B365D] uppercase tracking-wider">
                      Thực hành điền chỗ trống (chọn gợi ý hoặc tự gõ)
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {pattern.slots.map((slot) => {
                        const val = currentValues[slot.key] ?? '';
                        return (
                          <div key={slot.key} className="space-y-1.5">
                            <label className="text-xs font-semibold text-[#475569]">
                              [{slot.key}] — {slot.labelVi}
                            </label>
                            <input
                              type="text"
                              value={val}
                              onChange={(e) =>
                                setSlotValues((prev) => ({
                                  ...prev,
                                  [pattern.id]: {
                                    ...(prev[pattern.id] ?? {}),
                                    [slot.key]: e.target.value,
                                  },
                                }))
                              }
                              placeholder={slot.options[0]}
                              className="w-full px-3 py-1.5 text-sm rounded-lg border border-[#E2E8F0] bg-white focus:outline-none focus:ring-2 focus:ring-[#2E6B9E]"
                            />
                            <div className="flex flex-wrap gap-1.5">
                              {slot.options.map((opt) => (
                                <button
                                  key={opt}
                                  type="button"
                                  onClick={() =>
                                    setSlotValues((prev) => ({
                                      ...prev,
                                      [pattern.id]: {
                                        ...(prev[pattern.id] ?? {}),
                                        [slot.key]: opt,
                                      },
                                    }))
                                  }
                                  className={`px-2 py-0.5 rounded text-[11px] border cursor-pointer transition ${
                                    val === opt
                                      ? 'bg-[#1B365D] text-white border-[#1B365D]'
                                      : 'bg-white text-[#475569] border-[#E2E8F0] hover:bg-slate-100'
                                  }`}
                                >
                                  {opt}
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="p-3 rounded-lg bg-white border border-[#E2E8F0] text-sm">
                      <span className="text-xs font-semibold text-[#2E6B9E] block mb-1">
                        Câu hoàn chỉnh của bạn:
                      </span>
                      <span className="font-medium text-[#1F2933]">{resolvedSentence}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
