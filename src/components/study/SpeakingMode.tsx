import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Mic, Square, Volume2 } from 'lucide-react';
import { SENTENCE_PATTERNS } from '../../data/patterns';
import { SITUATION_ITEMS } from '../../data/situations';
import { VOCABULARY_ITEMS } from '../../data/vocabulary';
import {
  isSpeechRecognitionSupported,
  isSpeechSupported,
  SpeechAccent,
  speakEnglish,
  startSpeechRecognition,
} from '../../utils/speech';
import { cleanVocabWord, diffWords, resolveDefaultPatternSentence } from '../../utils/studyHelpers';
import { WordDiffView } from './WordDiffView';

interface SpeakingModeProps {
  accent: SpeechAccent;
}

type SpeakDeck = 'vocab' | 'patterns' | 'saying';

interface SpeakPrompt {
  id: string;
  tag: string;
  en: string;
  ipa?: string;
  vi: string;
}

export const SpeakingMode: React.FC<SpeakingModeProps> = ({ accent }) => {
  const [deck, setDeck] = useState<SpeakDeck>('saying');
  const [idx, setIdx] = useState(0);
  const [rate, setRate] = useState(0.94);

  const [recording, setRecording] = useState(false);
  const [session, setSession] = useState<{ stop: () => void } | null>(null);
  const [transcript, setTranscript] = useState('');
  const [fallbackTyped, setFallbackTyped] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const items = useMemo<SpeakPrompt[]>(() => {
    if (deck === 'vocab') {
      return VOCABULARY_ITEMS.map((v) => ({
        id: v.id,
        tag: `${v.pos}`,
        en: `${cleanVocabWord(v.word)}. ${v.exampleEn}`,
        ipa: `${v.ipaBrE} / ${v.ipaNAmE}`,
        vi: `${v.meaningVi} — ${v.exampleVi}`,
      }));
    }
    if (deck === 'patterns') {
      return SENTENCE_PATTERNS.map((p) => ({
        id: p.id,
        tag: `${p.category.toUpperCase()} • ${p.groupVi}`,
        en: resolveDefaultPatternSentence(p),
        vi: p.labelVi,
      }));
    }
    const list: SpeakPrompt[] = [];
    SITUATION_ITEMS.forEach((s) =>
      s.frames.forEach((f, fIdx) =>
        list.push({
          id: `${s.id}-${fIdx}`,
          tag: `${s.code} • ${s.topic}`,
          en: f.saying.replace(/^"|"$/g, '').trim(),
          vi: f.labelVi || s.titleVi,
        })
      )
    );
    return list;
  }, [deck]);

  const active = items[idx % items.length];
  const spokenOrTyped = transcript.trim() || fallbackTyped.trim();
  const diff = useMemo(
    () => (spokenOrTyped ? diffWords(spokenOrTyped, active.en) : null),
    [spokenOrTyped, active.en]
  );

  const micSupported = isSpeechRecognitionSupported();

  const toggleMic = () => {
    if (recording && session) {
      session.stop();
      setRecording(false);
      return;
    }
    setErrorMsg(null);
    setTranscript('');
    setRecording(true);
    const s = startSpeechRecognition({
      lang: accent,
      onInterim: (txt) => setTranscript(txt),
      onFinal: (txt) => setTranscript(txt),
      onError: (msg) => {
        setErrorMsg(msg);
        setRecording(false);
      },
      onEnd: () => setRecording(false),
    });
    if (!s) setRecording(false);
    else setSession(s);
  };

  const resetAndMove = (delta: number) => {
    setTranscript('');
    setFallbackTyped('');
    setErrorMsg(null);
    setIdx((prev) => (prev + delta + items.length) % items.length);
  };

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {(
            [
              { id: 'saying', label: 'Lời thoại Saying (13)' },
              { id: 'patterns', label: 'Mẫu câu Form Ảnh 4 (21)' },
              { id: 'vocab', label: 'Từ vựng + Ví dụ (24)' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setDeck(tab.id);
                setIdx(0);
                setTranscript('');
                setFallbackTyped('');
                setErrorMsg(null);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold border cursor-pointer ${
                deck === tab.id
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
            { label: '0.75x Shadowing', val: 0.75 },
            { label: '0.94x Chuẩn', val: 0.94 },
          ].map((r) => (
            <button
              key={r.val}
              type="button"
              onClick={() => setRate(r.val)}
              className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer ${
                rate === r.val ? 'bg-white text-[#1B365D] shadow-xs' : 'text-[#475569]'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between text-xs text-[#475569]">
          <span className="px-2.5 py-0.5 rounded-full bg-[#FEF3C7] text-[#B45309] font-bold">
            {active.tag}
          </span>
          <span>
            Mục {(idx % items.length) + 1} / {items.length}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-[#F5F7FA] border border-[#E2E8F0] space-y-2">
          <p className="text-lg sm:text-xl font-bold text-[#1B365D] leading-relaxed">{active.en}</p>
          {active.ipa && <p className="ipa-text text-xs text-[#2E6B9E]">{active.ipa}</p>}
          <p className="text-xs sm:text-sm text-[#475569]">{active.vi}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {isSpeechSupported() && (
            <button
              type="button"
              onClick={() => speakEnglish(active.en, accent, rate)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#2E6B9E] hover:bg-[#1B365D] text-white text-xs sm:text-sm font-semibold cursor-pointer"
            >
              <Volume2 className="w-4 h-4" /> Nghe mẫu ({accent})
            </button>
          )}

          <button
            type="button"
            onClick={toggleMic}
            disabled={!micSupported}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold cursor-pointer disabled:opacity-50 ${
              recording
                ? 'bg-[#B91C1C] text-white animate-pulse'
                : 'bg-[#1B365D] hover:bg-[#152a49] text-white'
            }`}
          >
            {recording ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            {recording ? 'Đang nghe... Nhấn để dừng' : 'Bấm Micro để đọc & chấm'}
          </button>
        </div>

        {!micSupported && (
          <p className="text-xs text-[#B45309] bg-[#FEF3C7]/60 p-3 rounded-xl border border-amber-200">
            Trình duyệt này chưa hỗ trợ Web Speech Recognition. Bạn hãy dùng Chrome/Edge để chấm giọng nói, hoặc tự chép lại câu ở ô bên dưới.
          </p>
        )}

        {errorMsg && (
          <p className="text-xs text-[#B91C1C] bg-[#FEE2E2] p-3 rounded-xl border border-red-200">
            {errorMsg}
          </p>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#475569]">
            Nội dung nhận diện từ Micro (hoặc tự gõ để luyện thay thế):
          </label>
          <textarea
            rows={2}
            value={transcript || fallbackTyped}
            onChange={(e) => {
              setTranscript('');
              setFallbackTyped(e.target.value);
            }}
            placeholder="Kết quả giọng nói sẽ hiện ở đây..."
            className="w-full p-3 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#2E6B9E]"
          />
        </div>

        {diff && <WordDiffView diff={diff} expectedSentence={active.en} />}

        <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0]">
          <button
            type="button"
            onClick={() => resetAndMove(-1)}
            className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl border border-[#E2E8F0] text-xs sm:text-sm font-semibold text-[#1B365D] cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" /> Trước
          </button>
          <button
            type="button"
            onClick={() => resetAndMove(1)}
            className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl border border-[#E2E8F0] text-xs sm:text-sm font-semibold text-[#1B365D] cursor-pointer"
          >
            Tiếp <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
