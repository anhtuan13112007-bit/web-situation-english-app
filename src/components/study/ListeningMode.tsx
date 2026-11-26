import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Eye,
  Mic,
  RotateCcw,
  Square,
  Volume2,
  XCircle,
} from 'lucide-react';
import { VOCABULARY_ITEMS } from '../../data/vocabulary';
import {
  isSpeechRecognitionSupported,
  isSpeechSupported,
  SpeechAccent,
  speakEnglish,
  startSpeechRecognition,
} from '../../utils/speech';
import {
  cleanVocabWord,
  diffWords,
  getAllPracticeSentences,
  maskTargetWordInSentence,
  normalizeEn,
} from '../../utils/studyHelpers';
import { WordDiffView } from './WordDiffView';

interface ListeningModeProps {
  accent: SpeechAccent;
  onRecordMistake: (wordId: string) => void;
}

type ListenSubMode = 'word-dictation' | 'sentence-gap' | 'full-dictation';

export const ListeningMode: React.FC<ListeningModeProps> = ({ accent, onRecordMistake }) => {
  const [subMode, setSubMode] = useState<ListenSubMode>('word-dictation');
  const [rate, setRate] = useState<number>(0.94);
  const [idx, setIdx] = useState(0);
  const [hintChars, setHintChars] = useState(0);
  const [input, setInput] = useState('');
  const [checked, setChecked] = useState(false);

  // Shadowing mic check
  const [listeningMic, setListeningMic] = useState(false);
  const [micText, setMicText] = useState('');
  const [micError, setMicError] = useState<string | null>(null);
  const [micSession, setMicSession] = useState<{ stop: () => void } | null>(null);

  const sentences = useMemo(() => getAllPracticeSentences(), []);
  const activeVocab = VOCABULARY_ITEMS[idx % VOCABULARY_ITEMS.length];
  const activeSentence = sentences[idx % sentences.length];

  const wordGap = useMemo(
    () => maskTargetWordInSentence(activeVocab.exampleEn, activeVocab.word),
    [activeVocab]
  );

  const targetAnswer =
    subMode === 'word-dictation'
      ? cleanVocabWord(activeVocab.word)
      : subMode === 'sentence-gap'
      ? wordGap.targetToken
      : activeSentence.en;

  const audioToPlay =
    subMode === 'word-dictation'
      ? cleanVocabWord(activeVocab.word)
      : subMode === 'sentence-gap'
      ? activeVocab.exampleEn
      : activeSentence.en;

  const fullDiff = useMemo(
    () => (checked && subMode === 'full-dictation' ? diffWords(input, targetAnswer) : null),
    [checked, subMode, input, targetAnswer]
  );

  const isExactWordMatch =
    checked &&
    subMode !== 'full-dictation' &&
    normalizeEn(input) === normalizeEn(targetAnswer);

  const resetItem = () => {
    setInput('');
    setChecked(false);
    setHintChars(0);
    setMicText('');
    setMicError(null);
  };

  const handleNext = () => {
    resetItem();
    setIdx((prev) => prev + 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    if (checked) {
      handleNext();
      return;
    }
    setChecked(true);
    if (subMode === 'full-dictation') {
      const d = diffWords(input, targetAnswer);
      if (d.accuracy < 80 && activeSentence.vocabId) {
        onRecordMistake(activeSentence.vocabId);
      }
    } else if (normalizeEn(input) !== normalizeEn(targetAnswer)) {
      onRecordMistake(activeVocab.id);
    }
  };

  const toggleShadowingMic = () => {
    if (listeningMic && micSession) {
      micSession.stop();
      setListeningMic(false);
      return;
    }
    setMicError(null);
    setMicText('');
    setListeningMic(true);
    const session = startSpeechRecognition({
      lang: accent,
      onInterim: (txt) => setMicText(txt),
      onFinal: (txt) => setMicText(txt),
      onError: (err) => {
        setMicError(err);
        setListeningMic(false);
      },
      onEnd: () => setListeningMic(false),
    });
    if (!session) setListeningMic(false);
    else setMicSession(session);
  };

  const letterHintPreview =
    hintChars > 0
      ? `${targetAnswer.slice(0, hintChars)}${'•'.repeat(Math.max(0, targetAnswer.length - hintChars))}`
      : '';

  return (
    <div className="space-y-5">
      {/* Submode & Speed */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {(
            [
              { id: 'word-dictation', label: '1. Nghe & Gõ từ' },
              { id: 'sentence-gap', label: '2. Nghe câu & Điền từ thiếu' },
              { id: 'full-dictation', label: '3. Chép chính tả cả câu & Shadowing' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setSubMode(tab.id);
                setIdx(0);
                resetItem();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold border cursor-pointer ${
                subMode === tab.id
                  ? 'bg-[#1B365D] text-white border-[#1B365D]'
                  : 'bg-[#F5F7FA] text-[#475569] border-[#E2E8F0]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="inline-flex rounded-lg bg-[#F5F7FA] p-1 border border-[#E2E8F0] text-xs">
          {[
            { label: '0.75x Chậm', val: 0.75 },
            { label: '0.94x Chuẩn', val: 0.94 },
          ].map((s) => (
            <button
              key={s.val}
              type="button"
              onClick={() => setRate(s.val)}
              className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer ${
                rate === s.val ? 'bg-white text-[#1B365D] shadow-xs' : 'text-[#475569]'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Card */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs space-y-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#2E6B9E]">
            {subMode === 'full-dictation'
              ? activeSentence.labelVi
              : `${activeVocab.pos} • Câu ${(idx % VOCABULARY_ITEMS.length) + 1}/${VOCABULARY_ITEMS.length}`}
          </span>

          <div className="flex items-center gap-2">
            {isSpeechSupported() && (
              <button
                type="button"
                onClick={() => speakEnglish(audioToPlay, accent, rate)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2E6B9E] hover:bg-[#1B365D] text-white text-xs sm:text-sm font-semibold cursor-pointer"
              >
                <Volume2 className="w-4 h-4" /> Phát âm thanh ({accent})
              </button>
            )}
          </div>
        </div>

        {subMode === 'sentence-gap' && (
          <div className="p-4 rounded-xl bg-[#F5F7FA] border border-[#E2E8F0] space-y-1">
            <p className="text-base font-semibold text-[#1B365D]">{wordGap.masked}</p>
            <p className="text-xs text-[#475569]">{activeVocab.exampleVi}</p>
          </div>
        )}

        {subMode === 'word-dictation' && (
          <div className="p-4 rounded-xl bg-[#F5F7FA] border border-[#E2E8F0] flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs sm:text-sm text-[#475569]">
              Gợi ý nghĩa: <strong className="text-[#1B365D]">{activeVocab.meaningVi}</strong>
            </span>
            {letterHintPreview && (
              <span className="font-mono text-sm font-bold text-[#2E6B9E] tracking-widest">
                {letterHintPreview}
              </span>
            )}
          </div>
        )}

        {subMode === 'full-dictation' && (
          <div className="p-4 rounded-xl bg-[#F5F7FA] border border-[#E2E8F0] space-y-1">
            <div className="text-xs font-semibold text-[#475569]">Nghĩa tham khảo:</div>
            <div className="text-sm text-[#1F2933]">{activeSentence.vi}</div>
          </div>
        )}

        <div className="space-y-2">
          {subMode === 'full-dictation' ? (
            <textarea
              rows={3}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nghe câu tiếng Anh và chép chính tả toàn bộ câu vào đây..."
              className="w-full p-3.5 text-sm sm:text-base rounded-xl border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#2E6B9E]"
            />
          ) : (
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nghe và gõ từ tiếng Anh chính xác rồi nhấn Enter..."
              className="w-full px-4 py-3 text-base rounded-xl border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#2E6B9E]"
            />
          )}

          <div className="flex flex-wrap items-center justify-between gap-2">
            {subMode !== 'full-dictation' ? (
              <button
                type="button"
                onClick={() => setHintChars((prev) => Math.min(targetAnswer.length, prev + 2))}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-xs font-semibold text-[#475569] hover:bg-slate-50 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" /> Hiện thêm gợi ý chữ cái
              </button>
            ) : (
              <button
                type="button"
                onClick={toggleShadowingMic}
                disabled={!isSpeechRecognitionSupported()}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer disabled:opacity-50 ${
                  listeningMic
                    ? 'bg-[#FEE2E2] border-red-300 text-[#B91C1C]'
                    : 'bg-[#F5F7FA] border-[#E2E8F0] text-[#1B365D]'
                }`}
              >
                {listeningMic ? <Square className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-[#2E6B9E]" />}
                {listeningMic ? 'Dừng Shadowing' : 'Shadowing (Đọc nhại theo)'}
              </button>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={resetItem}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs font-semibold text-[#475569] cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Xóa
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#1B365D] hover:bg-[#152a49] text-white text-xs sm:text-sm font-semibold cursor-pointer"
              >
                {checked ? 'Câu tiếp (Enter)' : 'Kiểm tra (Enter)'}
              </button>
            </div>
          </div>
        </div>

        {/* Shadowing Feedback */}
        {(micText || micError) && (
          <div className="p-3.5 rounded-xl bg-slate-50 border border-[#E2E8F0] space-y-1 text-xs">
            {micError ? (
              <p className="text-[#B91C1C]">{micError}</p>
            ) : (
              <>
                <div className="font-semibold text-[#1B365D]">Bạn vừa đọc: “{micText}”</div>
                <WordDiffView diff={diffWords(micText, audioToPlay)} />
              </>
            )}
          </div>
        )}

        {/* Word / Sentence Grading Feedback */}
        {checked && subMode !== 'full-dictation' && (
          <div
            className={`p-4 rounded-xl text-xs sm:text-sm flex items-start gap-2 ${
              isExactWordMatch
                ? 'bg-[#DCFCE7]/70 text-[#15803D]'
                : 'bg-[#FEE2E2]/70 text-[#B91C1C]'
            }`}
          >
            {isExactWordMatch ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
            )}
            <div>
              <strong>{activeVocab.word}</strong>{' '}
              <span className="ipa-text">({activeVocab.ipaBrE})</span> — {activeVocab.meaningVi}.
              <div className="text-xs mt-1 text-[#1F2933]">{activeVocab.exampleEn}</div>
            </div>
          </div>
        )}

        {fullDiff && <WordDiffView diff={fullDiff} expectedSentence={targetAnswer} />}
      </form>
    </div>
  );
};
