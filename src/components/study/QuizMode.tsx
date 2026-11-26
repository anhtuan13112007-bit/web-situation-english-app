import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Clock, RotateCcw, Volume2, XCircle } from 'lucide-react';
import { SENTENCE_PATTERNS } from '../../data/patterns';
import { VOCABULARY_ITEMS } from '../../data/vocabulary';
import { SpeechAccent, speakEnglish, isSpeechSupported } from '../../utils/speech';
import {
  isTypingTarget,
  maskTargetWordInSentence,
  resolveDefaultPatternSentence,
} from '../../utils/studyHelpers';

interface QuizModeProps {
  accent: SpeechAccent;
  onRecordMistake: (wordId: string) => void;
}

type QuizType = 'word-to-meaning' | 'context-fill' | 'meaning-to-word' | 'pattern-role';

interface QuizQuestion {
  id: string;
  vocabId?: string;
  prompt: string;
  subHint?: string;
  audioText?: string;
  options: string[];
  correctIdx: number;
  explanationVi: string;
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function buildQuestions(type: QuizType): QuizQuestion[] {
  if (type === 'pattern-role') {
    return shuffle(SENTENCE_PATTERNS)
      .slice(0, 10)
      .map((pat) => {
        const sentence = resolveDefaultPatternSentence(pat);
        const options = ['Action (Hành động)', 'Saying (Lời nói trực tiếp)', 'Goal (Mục đích)', 'Không thuộc form Ảnh 4'];
        const correctIdx = pat.category === 'action' ? 0 : pat.category === 'saying' ? 1 : 2;
        return {
          id: pat.id,
          prompt: `Mẫu câu sau thuộc phần nào trong Form Ảnh 4?\n"${sentence}"`,
          subHint: pat.labelVi,
          audioText: sentence,
          options,
          correctIdx,
          explanationVi: `${pat.groupVi}: ${pat.usageNoteVi}`,
        };
      });
  }

  return shuffle(VOCABULARY_ITEMS)
    .slice(0, 10)
    .map((item) => {
      const distractors = shuffle(VOCABULARY_ITEMS.filter((v) => v.id !== item.id)).slice(0, 3);

      if (type === 'word-to-meaning') {
        const opts = shuffle([item, ...distractors]).map((v) => v.meaningVi);
        return {
          id: item.id,
          vocabId: item.id,
          prompt: item.word,
          subHint: `${item.pos} • ${item.ipaBrE}`,
          audioText: item.word,
          options: opts,
          correctIdx: opts.indexOf(item.meaningVi),
          explanationVi: `${item.word}: ${item.meaningVi}. Ví dụ: ${item.exampleEn}`,
        };
      }

      if (type === 'meaning-to-word') {
        const opts = shuffle([item, ...distractors]).map((v) => v.word);
        return {
          id: item.id,
          vocabId: item.id,
          prompt: `Từ tiếng Anh nào có nghĩa là "${item.meaningVi}"?`,
          subHint: `Loại từ: ${item.pos}`,
          options: opts,
          correctIdx: opts.indexOf(item.word),
          explanationVi: `${item.word} (${item.ipaBrE}) = ${item.meaningVi}`,
        };
      }

      // context-fill
      const { masked } = maskTargetWordInSentence(item.exampleEn, item.word);
      const opts = shuffle([item, ...distractors]).map((v) => v.word);
      return {
        id: item.id,
        vocabId: item.id,
        prompt: masked,
        subHint: `Dịch: ${item.exampleVi}`,
        audioText: item.exampleEn,
        options: opts,
        correctIdx: opts.indexOf(item.word),
        explanationVi: `Đáp án "${item.word}" (${item.meaningVi}) — ${item.exampleEn}`,
      };
    });
}

export const QuizMode: React.FC<QuizModeProps> = ({ accent, onRecordMistake }) => {
  const [quizType, setQuizType] = useState<QuizType>('word-to-meaning');
  const [questions, setQuestions] = useState<QuizQuestion[]>(() =>
    buildQuestions('word-to-meaning')
  );
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(30);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const activeQ = questions[currentIdx];
  const isAnswered = selectedIdx !== null || timedOut;

  const startNewRound = (nextType: QuizType) => {
    setQuizType(nextType);
    setQuestions(buildQuestions(nextType));
    setCurrentIdx(0);
    setSelectedIdx(null);
    setTimedOut(false);
    setSecondsLeft(30);
    setScore(0);
    setFinished(false);
  };

  useEffect(() => {
    if (finished || isAnswered) return;
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setTimedOut(true);
          if (activeQ?.vocabId) onRecordMistake(activeQ.vocabId);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [finished, isAnswered, activeQ, onRecordMistake]);

  const handleChoose = (optIdx: number) => {
    if (isAnswered || !activeQ) return;
    setSelectedIdx(optIdx);
    if (optIdx === activeQ.correctIdx) {
      setScore((prev) => prev + 1);
    } else if (activeQ.vocabId) {
      onRecordMistake(activeQ.vocabId);
    }
  };

  const handleNext = () => {
    if (currentIdx + 1 >= questions.length) {
      setFinished(true);
      return;
    }
    setCurrentIdx((prev) => prev + 1);
    setSelectedIdx(null);
    setTimedOut(false);
    setSecondsLeft(30);
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target) || finished || !activeQ) return;
      if (!isAnswered && ['1', '2', '3', '4'].includes(e.key)) {
        const pick = Number(e.key) - 1;
        if (pick < activeQ.options.length) {
          e.preventDefault();
          handleChoose(pick);
        }
      } else if (isAnswered && e.key === 'Enter') {
        e.preventDefault();
        handleNext();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  const progressPct = useMemo(
    () => Math.round(((currentIdx + (isAnswered ? 1 : 0)) / questions.length) * 100),
    [currentIdx, isAnswered, questions.length]
  );

  return (
    <div className="space-y-5">
      {/* Mode selector */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {(
            [
              { id: 'word-to-meaning', label: 'Từ → Nghĩa' },
              { id: 'context-fill', label: 'Ngữ cảnh (Điền từ)' },
              { id: 'meaning-to-word', label: 'Nghĩa → Từ' },
              { id: 'pattern-role', label: 'Mẫu câu → Action/Saying/Goal' },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => startNewRound(t.id)}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold border cursor-pointer transition ${
                quizType === t.id
                  ? 'bg-[#1B365D] text-white border-[#1B365D]'
                  : 'bg-[#F5F7FA] text-[#475569] border-[#E2E8F0] hover:bg-slate-100'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => startNewRound(quizType)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-xs font-semibold text-[#1B365D] hover:bg-slate-50 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Đề mới
        </button>
      </div>

      {finished ? (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-8 text-center space-y-4 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-[#2E6B9E]">
            Hoàn thành vòng trắc nghiệm
          </div>
          <div className="text-4xl font-extrabold text-[#1B365D]">
            {score} / {questions.length}
          </div>
          <p className="text-sm text-[#475569]">
            {score >= 8
              ? 'Xuất sắc! Bạn nắm rất vững nghĩa và ngữ cảnh sử dụng.'
              : 'Hãy ôn lại các từ vừa sai ở Sổ từ vựng hoặc thử lại vòng mới.'}
          </p>
          <button
            type="button"
            onClick={() => startNewRound(quizType)}
            className="px-5 py-2.5 rounded-xl bg-[#1B365D] text-white text-sm font-semibold cursor-pointer"
          >
            Làm vòng tiếp theo
          </button>
        </div>
      ) : (
        activeQ && (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs font-semibold text-[#475569]">
                Câu {currentIdx + 1}/{questions.length} • Điểm: <strong className="text-[#1B365D]">{score}</strong> • Phím tắt <kbd className="px-1.5 py-0.5 bg-slate-100 border rounded">1–4</kbd>
              </div>
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                  secondsLeft <= 8
                    ? 'bg-[#FEE2E2] text-[#B91C1C] border-red-200'
                    : 'bg-[#F5F7FA] text-[#1B365D] border-[#E2E8F0]'
                }`}
              >
                <Clock className="w-3.5 h-3.5" /> {secondsLeft}s
              </div>
            </div>

            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#2E6B9E] transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                <h4 className="text-lg sm:text-xl font-bold text-[#1B365D] whitespace-pre-line">
                  {activeQ.prompt}
                </h4>
                {activeQ.audioText && isSpeechSupported() && (
                  <button
                    type="button"
                    onClick={() => speakEnglish(activeQ.audioText!, accent)}
                    className="p-2 rounded-lg bg-[#F5F7FA] border border-[#E2E8F0] text-[#2E6B9E] hover:bg-[#DBEAFE] cursor-pointer shrink-0"
                    title="Nghe phát âm"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              {activeQ.subHint && (
                <p className="text-xs sm:text-sm text-[#475569] ipa-text">{activeQ.subHint}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeQ.options.map((opt, idx) => {
                let cls = 'border-[#E2E8F0] bg-white hover:bg-slate-50 text-[#1F2933]';
                if (isAnswered) {
                  if (idx === activeQ.correctIdx) {
                    cls = 'border-emerald-400 bg-[#DCFCE7] text-[#15803D] font-semibold';
                  } else if (idx === selectedIdx) {
                    cls = 'border-red-300 bg-[#FEE2E2] text-[#B91C1C]';
                  } else {
                    cls = 'border-[#E2E8F0] bg-slate-50 text-slate-400';
                  }
                }
                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={isAnswered}
                    onClick={() => handleChoose(idx)}
                    className={`px-4 py-3 rounded-xl border text-left text-sm transition cursor-pointer disabled:cursor-default ${cls}`}
                  >
                    <span className="inline-block w-5 font-bold text-[#2E6B9E]">{idx + 1}.</span>
                    {opt}
                  </button>
                );
              })}
            </div>

            {isAnswered && (
              <div className="space-y-3 pt-1">
                <div
                  className={`p-3.5 rounded-xl text-xs sm:text-sm flex items-start gap-2 ${
                    selectedIdx === activeQ.correctIdx
                      ? 'bg-[#DCFCE7]/70 text-[#15803D]'
                      : 'bg-[#FEE2E2]/70 text-[#B91C1C]'
                  }`}
                >
                  {selectedIdx === activeQ.correctIdx ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  )}
                  <span>
                    {timedOut ? 'Hết 30 giây! ' : ''}
                    {activeQ.explanationVi}
                  </span>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-5 py-2 rounded-xl bg-[#1B365D] text-white text-sm font-semibold hover:bg-[#152a49] cursor-pointer"
                  >
                    {currentIdx + 1 >= questions.length ? 'Xem tổng kết' : 'Câu tiếp (Enter)'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
};
