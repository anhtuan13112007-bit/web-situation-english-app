import React, { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Keyboard,
  RotateCw,
  Shuffle,
  Volume2,
  XCircle,
} from 'lucide-react';
import { SENTENCE_PATTERNS } from '../../data/patterns';
import { VOCABULARY_ITEMS } from '../../data/vocabulary';
import { VocabMasteryStatus } from '../../types';
import { isSpeechSupported, SpeechAccent, speakEnglish } from '../../utils/speech';
import {
  checkVietnameseMeaningMatch,
  cleanVocabWord,
  diffWords,
  isTypingTarget,
  normalizeEn,
  resolveDefaultPatternSentence,
} from '../../utils/studyHelpers';

interface FlashcardModeProps {
  accent: SpeechAccent;
  mastery: Record<string, VocabMasteryStatus>;
  onUpdateMastery: (wordId: string, status: VocabMasteryStatus) => void;
  onRecordMistake: (wordId: string) => void;
}

type DeckType = 'vocab' | 'patterns';
type Direction = 'en-vi' | 'vi-en';

interface CardItem {
  id: string;
  isVocab: boolean;
  frontEn: string;
  frontSub: string;
  ipaBrE?: string;
  ipaNAmE?: string;
  meaningVi: string;
  exampleEn: string;
  exampleVi: string;
  vocabId?: string;
}

export const FlashcardMode: React.FC<FlashcardModeProps> = ({
  accent,
  mastery,
  onUpdateMastery,
  onRecordMistake,
}) => {
  const [deck, setDeck] = useState<DeckType>('vocab');
  const [direction, setDirection] = useState<Direction>('en-vi');
  const [statusFilter, setStatusFilter] = useState<'all' | VocabMasteryStatus>('all');
  const [writeBeforeFlip, setWriteBeforeFlip] = useState(true);
  const [idx, setIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const [typedInput, setTypedInput] = useState('');
  const [checkFeedback, setCheckFeedback] = useState<{
    checked: boolean;
    ok: boolean;
    message: string;
  } | null>(null);

  const cards = useMemo<CardItem[]>(() => {
    if (deck === 'vocab') {
      return VOCABULARY_ITEMS.filter((v) => {
        const st = mastery[v.id] ?? 'new';
        return statusFilter === 'all' || st === statusFilter;
      }).map((v) => ({
        id: v.id,
        isVocab: true,
        frontEn: v.word,
        frontSub: v.pos,
        ipaBrE: v.ipaBrE,
        ipaNAmE: v.ipaNAmE,
        meaningVi: v.meaningVi,
        exampleEn: v.exampleEn,
        exampleVi: v.exampleVi,
        vocabId: v.id,
      }));
    }

    return SENTENCE_PATTERNS.map((p) => ({
      id: p.id,
      isVocab: false,
      frontEn: resolveDefaultPatternSentence(p),
      frontSub: `${p.category.toUpperCase()} • ${p.groupVi}`,
      meaningVi: p.labelVi,
      exampleEn: p.template,
      exampleVi: p.usageNoteVi,
    }));
  }, [deck, mastery, statusFilter]);

  const safeIdx = cards.length > 0 ? idx % cards.length : 0;
  const activeCard = cards[safeIdx];

  const resetCardInteraction = () => {
    setIsFlipped(false);
    setTypedInput('');
    setCheckFeedback(null);
  };

  const handleNext = () => {
    if (cards.length === 0) return;
    resetCardInteraction();
    setIdx((prev) => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    if (cards.length === 0) return;
    resetCardInteraction();
    setIdx((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const handleRandom = () => {
    if (cards.length <= 1) return;
    resetCardInteraction();
    let next = Math.floor(Math.random() * cards.length);
    if (next === safeIdx) next = (safeIdx + 1) % cards.length;
    setIdx(next);
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;
      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  const handleCheckWrite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCard || !typedInput.trim()) return;

    let ok = false;
    if (direction === 'en-vi') {
      ok = checkVietnameseMeaningMatch(typedInput, activeCard.meaningVi);
    } else if (activeCard.isVocab) {
      const target = normalizeEn(cleanVocabWord(activeCard.frontEn));
      const fullTarget = normalizeEn(activeCard.frontEn);
      const user = normalizeEn(typedInput);
      ok = user === target || user === fullTarget;
    } else {
      const res = diffWords(typedInput, activeCard.frontEn);
      ok = res.accuracy >= 85;
    }

    if (!ok && activeCard.vocabId) {
      onRecordMistake(activeCard.vocabId);
    }

    setCheckFeedback({
      checked: true,
      ok,
      message: ok
        ? 'Chính xác! Bạn đã nhớ rất chắc.'
        : `Chưa khớp — Đáp án: ${direction === 'en-vi' ? activeCard.meaningVi : activeCard.frontEn}`,
    });
    setIsFlipped(true);
  };

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex rounded-xl bg-[#F5F7FA] p-1 border border-[#E2E8F0]">
            <button
              type="button"
              onClick={() => {
                setDeck('vocab');
                setIdx(0);
                resetCardInteraction();
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold cursor-pointer ${
                deck === 'vocab' ? 'bg-white text-[#1B365D] shadow-xs' : 'text-[#475569]'
              }`}
            >
              Từ vựng Oxford (24)
            </button>
            <button
              type="button"
              onClick={() => {
                setDeck('patterns');
                setIdx(0);
                resetCardInteraction();
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold cursor-pointer ${
                deck === 'patterns' ? 'bg-white text-[#1B365D] shadow-xs' : 'text-[#475569]'
              }`}
            >
              Mẫu câu Ảnh 4 (21)
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setDirection((prev) => (prev === 'en-vi' ? 'vi-en' : 'en-vi'));
                resetCardInteraction();
              }}
              className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] bg-[#F5F7FA] text-xs font-semibold text-[#1B365D] cursor-pointer"
            >
              Chiều: {direction === 'en-vi' ? 'EN ⇄ VN (Nhìn Anh gõ Việt)' : 'VN ⇄ EN (Nhìn Việt gõ Anh)'}
            </button>

            <button
              type="button"
              onClick={() => setWriteBeforeFlip((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer ${
                writeBeforeFlip
                  ? 'bg-[#DBEAFE] border-blue-200 text-[#1D4ED8]'
                  : 'bg-white border-[#E2E8F0] text-[#475569]'
              }`}
            >
              <Keyboard className="w-3.5 h-3.5" />
              Gõ trước khi lật: {writeBeforeFlip ? 'Bật' : 'Tắt'}
            </button>

            {deck === 'vocab' && (
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as 'all' | VocabMasteryStatus);
                  setIdx(0);
                  resetCardInteraction();
                }}
                className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] bg-white text-xs text-[#1F2933]"
                aria-label="Lọc hộp Leitner"
              >
                <option value="all">Tất cả hộp</option>
                <option value="new">Box 1: Mới</option>
                <option value="learning">Box 2: Đang học</option>
                <option value="mastered">Box 3: Đã thuộc</option>
              </select>
            )}
          </div>
        </div>
      </div>

      {!activeCard ? (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-10 text-center text-sm text-[#475569]">
          Không có thẻ nào trong hộp Leitner đã chọn.
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between text-xs text-[#475569] px-1">
            <span>
              Thẻ {safeIdx + 1} / {cards.length} • Phím tắt: <kbd className="px-1.5 py-0.5 bg-white border rounded">Space</kbd> lật thẻ,{' '}
              <kbd className="px-1.5 py-0.5 bg-white border rounded">←</kbd>/<kbd className="px-1.5 py-0.5 bg-white border rounded">→</kbd> chuyển thẻ
            </span>
            {activeCard.vocabId && (
              <span className="font-semibold text-[#1B365D]">
                Hộp: {(mastery[activeCard.vocabId] ?? 'new').toUpperCase()}
              </span>
            )}
          </div>

          {/* Active Recall Typing Box (Priority: Writing!) */}
          {writeBeforeFlip && (
            <form
              onSubmit={handleCheckWrite}
              className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-xs space-y-2.5"
            >
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  value={typedInput}
                  onChange={(e) => setTypedInput(e.target.value)}
                  placeholder={
                    direction === 'en-vi'
                      ? 'Gõ nhanh nghĩa tiếng Việt (không cần dấu) rồi nhấn Enter...'
                      : 'Gõ từ hoặc mẫu câu tiếng Anh tương ứng rồi nhấn Enter...'
                  }
                  className="flex-1 min-w-[220px] px-3.5 py-2 text-sm rounded-xl border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#2E6B9E]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#1B365D] hover:bg-[#152a49] text-white text-xs sm:text-sm font-semibold cursor-pointer"
                >
                  Kiểm tra & Lật
                </button>
              </div>
              {checkFeedback && (
                <div
                  className={`text-xs flex items-center gap-1.5 font-medium ${
                    checkFeedback.ok ? 'text-[#15803D]' : 'text-[#B91C1C]'
                  }`}
                >
                  {checkFeedback.ok ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{checkFeedback.message}</span>
                </div>
              )}
            </form>
          )}

          {/* Flip Card */}
          <div
            onClick={() => setIsFlipped((prev) => !prev)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setIsFlipped((prev) => !prev);
              }
            }}
            className="perspective-1000 cursor-pointer select-none"
          >
            <div
              className={`relative w-full min-h-[270px] transition-transform duration-500 preserve-3d ${
                isFlipped ? 'rotate-y-180' : ''
              }`}
            >
              {/* Front */}
              <div className="absolute inset-0 backface-hidden bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6 sm:p-8 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-md bg-[#DBEAFE] text-[#1D4ED8] text-xs font-bold">
                    {activeCard.frontSub}
                  </span>
                  <span className="text-xs text-[#475569] flex items-center gap-1">
                    <RotateCw className="w-3.5 h-3.5" /> Nhấn hoặc Space để lật
                  </span>
                </div>

                <div className="text-center space-y-3 my-4">
                  {direction === 'en-vi' ? (
                    <>
                      <h4 className="text-2xl sm:text-3xl font-extrabold text-[#1B365D] leading-snug">
                        {activeCard.frontEn}
                      </h4>
                      {activeCard.ipaBrE && (
                        <div className="flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm text-[#475569]">
                          <span className="ipa-text px-2.5 py-1 rounded-lg bg-[#F5F7FA] border border-[#E2E8F0]">
                            <strong>BrE</strong> {activeCard.ipaBrE}
                          </span>
                          <span className="ipa-text px-2.5 py-1 rounded-lg bg-[#F5F7FA] border border-[#E2E8F0]">
                            <strong>NAmE</strong> {activeCard.ipaNAmE}
                          </span>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="text-xs uppercase font-semibold text-[#475569]">
                        Nhớ lại tiếng Anh cho nghĩa:
                      </div>
                      <h4 className="text-xl sm:text-2xl font-bold text-[#15803D] leading-snug">
                        {activeCard.meaningVi}
                      </h4>
                    </>
                  )}
                </div>

                <div className="flex items-center justify-center gap-2">
                  {direction === 'en-vi' && isSpeechSupported() && (
                    <>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          speakEnglish(cleanVocabWord(activeCard.frontEn), 'en-GB');
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F5F7FA] hover:bg-[#DBEAFE] text-xs font-semibold text-[#1B365D] border border-[#E2E8F0] cursor-pointer"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-[#2E6B9E]" /> Anh-Anh (UK)
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          speakEnglish(cleanVocabWord(activeCard.frontEn), 'en-US');
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F5F7FA] hover:bg-[#DBEAFE] text-xs font-semibold text-[#1B365D] border border-[#E2E8F0] cursor-pointer"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-[#2E6B9E]" /> Anh-Mỹ (US)
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Back */}
              <div className="absolute inset-0 backface-hidden rotate-y-180 bg-white rounded-2xl border-2 border-[#2E6B9E]/40 shadow-sm p-6 sm:p-8 flex flex-col justify-between">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold text-[#1B365D]">
                    {activeCard.frontEn}
                  </span>
                  {isSpeechSupported() && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        speakEnglish(activeCard.exampleEn, accent);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#DBEAFE] text-[#1D4ED8] text-xs font-semibold cursor-pointer shrink-0"
                    >
                      <Volume2 className="w-3.5 h-3.5" /> Nghe ví dụ
                    </button>
                  )}
                </div>

                <div className="space-y-3 my-3">
                  <div>
                    <div className="text-xs uppercase font-semibold text-[#475569]">
                      Nghĩa tiếng Việt
                    </div>
                    <div className="text-xl font-bold text-[#15803D] mt-0.5">
                      {activeCard.meaningVi}
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#F5F7FA] border border-[#E2E8F0] space-y-1">
                    <div className="text-sm font-medium text-[#1F2933]">{activeCard.exampleEn}</div>
                    <div className="text-xs text-[#475569]">{activeCard.exampleVi}</div>
                  </div>
                </div>

                <div className="text-center text-xs text-[#475569]">
                  {activeCard.vocabId
                    ? 'Đánh dấu Quên / Đang học / Thuộc ở thanh dưới để lưu hộp Leitner'
                    : 'Nhấn Tiếp để luyện mẫu câu tiếp theo'}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation + Leitner */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white rounded-2xl border border-[#E2E8F0] p-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrev}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-[#E2E8F0] hover:bg-slate-50 text-xs sm:text-sm font-medium cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> Trước
              </button>
              <button
                type="button"
                onClick={handleRandom}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-[#E2E8F0] hover:bg-slate-50 text-xs sm:text-sm font-medium cursor-pointer"
              >
                <Shuffle className="w-4 h-4 text-[#2E6B9E]" /> Ngẫu nhiên
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-[#E2E8F0] hover:bg-slate-50 text-xs sm:text-sm font-medium cursor-pointer"
              >
                Tiếp <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {activeCard.vocabId && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onUpdateMastery(activeCard.vocabId!, 'new');
                    onRecordMistake(activeCard.vocabId!);
                    handleNext();
                  }}
                  className="px-3 py-2 rounded-lg border border-red-200 bg-[#FEE2E2]/60 hover:bg-[#FEE2E2] text-[#B91C1C] text-xs font-semibold cursor-pointer"
                >
                  Quên (Box 1)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onUpdateMastery(activeCard.vocabId!, 'learning');
                    handleNext();
                  }}
                  className="px-3 py-2 rounded-lg border border-amber-200 bg-[#FEF3C7]/60 hover:bg-[#FEF3C7] text-[#B45309] text-xs font-semibold cursor-pointer"
                >
                  Đang học (Box 2)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onUpdateMastery(activeCard.vocabId!, 'mastered');
                    handleNext();
                  }}
                  className="px-3 py-2 rounded-lg border border-emerald-200 bg-[#DCFCE7]/70 hover:bg-[#DCFCE7] text-[#15803D] text-xs font-semibold cursor-pointer"
                >
                  Thuộc (Box 3)
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
