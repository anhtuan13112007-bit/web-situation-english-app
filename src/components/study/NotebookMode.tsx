import React, { useMemo, useState } from 'react';
import { AlertCircle, Keyboard, Search, Volume2 } from 'lucide-react';
import { SENTENCE_PATTERNS } from '../../data/patterns';
import { VOCABULARY_ITEMS } from '../../data/vocabulary';
import { VocabMasteryStatus } from '../../types';
import { isSpeechSupported, SpeechAccent, speakEnglish } from '../../utils/speech';
import { cleanVocabWord, resolveDefaultPatternSentence } from '../../utils/studyHelpers';

interface NotebookModeProps {
  accent: SpeechAccent;
  mastery: Record<string, VocabMasteryStatus>;
  mistakes: Record<string, number>;
  onUpdateMastery: (wordId: string, status: VocabMasteryStatus) => void;
  onPracticeMistakes: () => void;
}

export const NotebookMode: React.FC<NotebookModeProps> = ({
  accent,
  mastery,
  mistakes,
  onUpdateMastery,
  onPracticeMistakes,
}) => {
  const [tab, setTab] = useState<'vocab' | 'patterns'>('vocab');
  const [search, setSearch] = useState('');
  const [onlyMistakes, setOnlyMistakes] = useState(false);
  const [boxFilter, setBoxFilter] = useState<'all' | VocabMasteryStatus>('all');

  const filteredVocab = useMemo(() => {
    const q = search.trim().toLowerCase();
    return VOCABULARY_ITEMS.filter((v) => {
      const st = mastery[v.id] ?? 'new';
      const boxOk = boxFilter === 'all' || st === boxFilter;
      const mistakeOk = !onlyMistakes || (mistakes[v.id] ?? 0) > 0;
      const textOk =
        !q ||
        v.word.toLowerCase().includes(q) ||
        v.meaningVi.toLowerCase().includes(q) ||
        v.exampleEn.toLowerCase().includes(q);
      return boxOk && mistakeOk && textOk;
    });
  }, [search, boxFilter, onlyMistakes, mastery, mistakes]);

  const filteredPatterns = useMemo(() => {
    const q = search.trim().toLowerCase();
    return SENTENCE_PATTERNS.filter((p) => {
      if (!q) return true;
      return (
        p.template.toLowerCase().includes(q) ||
        p.labelVi.toLowerCase().includes(q) ||
        p.groupVi.toLowerCase().includes(q)
      );
    });
  }, [search]);

  const totalMistakeWords = VOCABULARY_ITEMS.filter((v) => (mistakes[v.id] ?? 0) > 0).length;

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex rounded-xl bg-[#F5F7FA] p-1 border border-[#E2E8F0]">
            <button
              type="button"
              onClick={() => setTab('vocab')}
              className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold cursor-pointer ${
                tab === 'vocab' ? 'bg-white text-[#1B365D] shadow-xs' : 'text-[#475569]'
              }`}
            >
              Sổ Từ vựng ({VOCABULARY_ITEMS.length})
            </button>
            <button
              type="button"
              onClick={() => setTab('patterns')}
              className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold cursor-pointer ${
                tab === 'patterns' ? 'bg-white text-[#1B365D] shadow-xs' : 'text-[#475569]'
              }`}
            >
              Sổ Mẫu câu ({SENTENCE_PATTERNS.length})
            </button>
          </div>

          {totalMistakeWords > 0 && (
            <button
              type="button"
              onClick={onPracticeMistakes}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1B365D] text-white text-xs font-semibold cursor-pointer"
            >
              <Keyboard className="w-3.5 h-3.5" />
              Luyện viết {totalMistakeWords} từ hay sai →
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-[#475569] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm từ vựng, IPA, nghĩa hoặc mẫu câu..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#2E6B9E]"
            />
          </div>

          {tab === 'vocab' && (
            <>
              <button
                type="button"
                onClick={() => setOnlyMistakes((prev) => !prev)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold cursor-pointer ${
                  onlyMistakes
                    ? 'bg-[#FEE2E2] border-red-300 text-[#B91C1C]'
                    : 'bg-[#F5F7FA] border-[#E2E8F0] text-[#475569]'
                }`}
              >
                <AlertCircle className="w-3.5 h-3.5" />
                Chỉ hiện từ hay sai ({totalMistakeWords})
              </button>

              <select
                value={boxFilter}
                onChange={(e) => setBoxFilter(e.target.value as 'all' | VocabMasteryStatus)}
                className="px-3 py-2 rounded-xl border border-[#E2E8F0] bg-white text-xs font-semibold text-[#1B365D]"
              >
                <option value="all">Tất cả hộp ôn tập</option>
                <option value="new">Box 1: Mới</option>
                <option value="learning">Box 2: Đang học</option>
                <option value="mastered">Box 3: Đã thuộc</option>
              </select>
            </>
          )}
        </div>
      </div>

      {tab === 'vocab' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredVocab.map((v) => {
            const st = mastery[v.id] ?? 'new';
            const errCount = mistakes[v.id] ?? 0;
            return (
              <div
                key={v.id}
                className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-lg font-bold text-[#1B365D]">{v.word}</span>
                        <span className="px-2 py-0.5 rounded bg-[#DBEAFE] text-[#1D4ED8] text-[11px] font-bold">
                          {v.pos}
                        </span>
                        {errCount > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-[#FEE2E2] text-[#B91C1C] text-[11px] font-bold">
                            Sai {errCount} lần
                          </span>
                        )}
                      </div>
                      <div className="ipa-text text-xs text-[#475569] mt-1">
                        BrE {v.ipaBrE} · NAmE {v.ipaNAmE}
                      </div>
                    </div>

                    {isSpeechSupported() && (
                      <button
                        type="button"
                        onClick={() => speakEnglish(cleanVocabWord(v.word), accent)}
                        className="p-2 rounded-lg bg-[#F5F7FA] hover:bg-[#DBEAFE] text-[#2E6B9E] border border-[#E2E8F0] cursor-pointer shrink-0"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <p className="text-sm font-semibold text-[#15803D]">{v.meaningVi}</p>
                  <div className="p-3 rounded-xl bg-[#F5F7FA] border border-[#E2E8F0] text-xs space-y-1">
                    <p className="text-[#1F2933] font-medium">{v.exampleEn}</p>
                    <p className="text-[#475569]">{v.exampleVi}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0]">
                  <span className="text-[11px] font-semibold text-[#475569]">Hộp ôn tập:</span>
                  <div className="flex gap-1">
                    {(['new', 'learning', 'mastered'] as VocabMasteryStatus[]).map((target) => (
                      <button
                        key={target}
                        type="button"
                        onClick={() => onUpdateMastery(v.id, target)}
                        className={`px-2 py-1 rounded text-[11px] font-semibold cursor-pointer ${
                          st === target
                            ? 'bg-[#1B365D] text-white'
                            : 'bg-slate-100 text-[#475569] hover:bg-slate-200'
                        }`}
                      >
                        {target === 'new' ? 'Box 1' : target === 'learning' ? 'Box 2' : 'Box 3'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPatterns.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs flex flex-wrap items-start justify-between gap-3"
            >
              <div className="space-y-1 flex-1 min-w-[240px]">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-[#DBEAFE] text-[#1D4ED8] text-[11px] font-bold uppercase">
                    {p.category}
                  </span>
                  <span className="text-xs font-semibold text-[#2E6B9E]">{p.groupVi}</span>
                </div>
                <p className="text-sm sm:text-base font-semibold text-[#1B365D]">{p.template}</p>
                <p className="text-xs text-[#475569]">{p.labelVi}</p>
              </div>
              {isSpeechSupported() && (
                <button
                  type="button"
                  onClick={() => speakEnglish(resolveDefaultPatternSentence(p), accent)}
                  className="p-2 rounded-lg bg-[#F5F7FA] hover:bg-[#DBEAFE] text-[#2E6B9E] border border-[#E2E8F0] cursor-pointer"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
