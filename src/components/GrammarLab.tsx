import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  PenLine,
  RotateCcw,
  Volume2,
  XCircle,
} from 'lucide-react';
import { GRAMMAR_LESSONS } from '../data/grammar';
import { isSpeechSupported, speakEnglish } from '../utils/speech';
import { diffWords } from '../utils/studyHelpers';
import { WordDiffView } from './study/WordDiffView';

interface GrammarLabProps {
  grammarScores: Record<string, number>;
  onSaveQuizScore: (lessonId: string, score: number) => void;
}

export const GrammarLab: React.FC<GrammarLabProps> = ({ grammarScores, onSaveQuizScore }) => {
  const [activeLessonId, setActiveLessonId] = useState(GRAMMAR_LESSONS[0].id);
  const [practiceTab, setPracticeTab] = useState<'write' | 'quiz'>('write');
  const [answersByLesson, setAnswersByLesson] = useState<Record<string, Record<string, number>>>({});
  const [writeInputs, setWriteInputs] = useState<Record<string, string>>({});
  const [writeChecked, setWriteChecked] = useState<Record<string, boolean>>({});
  const [showWriteHints, setShowWriteHints] = useState<Record<string, boolean>>({});

  const lesson = GRAMMAR_LESSONS.find((l) => l.id === activeLessonId) ?? GRAMMAR_LESSONS[0];
  const lessonAnswers = answersByLesson[lesson.id] ?? {};
  const answeredCount = Object.keys(lessonAnswers).length;
  const correctCount = lesson.quiz.reduce(
    (sum, q) => (lessonAnswers[q.id] === q.correctIndex ? sum + 1 : sum),
    0
  );
  const savedBest = grammarScores[lesson.id];

  const handleSelectOption = (questionId: string, optionIdx: number) => {
    if (lessonAnswers[questionId] !== undefined) return;
    const nextLessonAnswers = { ...lessonAnswers, [questionId]: optionIdx };
    setAnswersByLesson((prev) => ({ ...prev, [lesson.id]: nextLessonAnswers }));

    if (Object.keys(nextLessonAnswers).length === lesson.quiz.length) {
      const finalScore = lesson.quiz.reduce(
        (sum, q) => (nextLessonAnswers[q.id] === q.correctIndex ? sum + 1 : sum),
        0
      );
      onSaveQuizScore(lesson.id, finalScore);
    }
  };

  const handleResetQuiz = () => {
    setAnswersByLesson((prev) => ({ ...prev, [lesson.id]: {} }));
  };

  return (
    <div className="space-y-6">
      {/* 6 Grammar Points Selector */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs space-y-3">
        <div>
          <h3 className="text-lg font-bold text-[#1B365D]">6 Điểm Ngữ pháp Cốt lõi</h3>
          <p className="text-sm text-[#475569]">
            Chọn từng chủ điểm để xem công thức, luyện <strong>Viết câu theo cấu trúc</strong> (ưu tiên) và làm trắc nghiệm 5 câu.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {GRAMMAR_LESSONS.map((item) => {
            const isSelected = item.id === lesson.id;
            const best = grammarScores[item.id];
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveLessonId(item.id)}
                className={`p-3.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between gap-2 ${
                  isSelected
                    ? 'bg-[#1B365D] text-white border-[#1B365D] shadow-sm'
                    : 'bg-[#F5F7FA] text-[#1F2933] border-[#E2E8F0] hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                      isSelected ? 'bg-[#2E6B9E] text-white' : 'bg-white text-[#1B365D] border border-[#E2E8F0]'
                    }`}
                  >
                    Điểm {item.number}
                  </span>
                  {best !== undefined && (
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        isSelected
                          ? 'bg-emerald-400/20 text-emerald-200'
                          : best >= 4
                          ? 'bg-[#DCFCE7] text-[#15803D]'
                          : 'bg-[#FEF3C7] text-[#B45309]'
                      }`}
                    >
                      Quiz: {best}/5
                    </span>
                  )}
                </div>
                <div className="font-semibold text-sm leading-snug">{item.titleVi}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Lesson Card */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs space-y-5">
        <div className="space-y-1">
          <div className="text-xs font-bold uppercase tracking-wider text-[#2E6B9E]">
            Ngữ pháp #{lesson.number} • {lesson.titleEn}
          </div>
          <h4 className="text-xl font-bold text-[#1B365D]">{lesson.titleVi}</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-[#DBEAFE]/40 border border-blue-200 space-y-1.5">
            <div className="text-xs font-bold uppercase text-[#1D4ED8]">Công thức / Cấu trúc</div>
            <div className="text-sm sm:text-base font-bold text-[#1B365D] font-mono">
              {lesson.formula}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#DCFCE7]/50 border border-emerald-200 space-y-1.5">
            <div className="text-xs font-bold uppercase text-[#15803D]">Vai trò trong bài</div>
            <p className="text-sm text-[#1F2933] leading-relaxed">{lesson.roleVi}</p>
          </div>
        </div>

        <div className="space-y-2.5">
          <div className="text-xs font-bold uppercase tracking-wider text-[#475569]">
            Ví dụ chuẩn từ giáo trình
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {lesson.examples.map((ex, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-[#F5F7FA] border border-[#E2E8F0] flex items-start justify-between gap-3"
              >
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-[#1B365D]">{ex.en}</p>
                  <p className="text-xs text-[#475569]">{ex.vi}</p>
                </div>
                {isSpeechSupported() && (
                  <button
                    type="button"
                    onClick={() => speakEnglish(ex.en, 'en-GB')}
                    className="p-1.5 rounded-lg bg-white border border-[#E2E8F0] text-[#2E6B9E] hover:bg-[#DBEAFE] shrink-0 cursor-pointer"
                    title="Nghe ví dụ"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#FEF3C7]/60 border border-amber-200 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-[#B45309] shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-[#1F2933]">
            <strong className="text-[#B45309]">Lưu ý tránh mất điểm: </strong>
            {lesson.pitfallVi}
          </div>
        </div>
      </div>

      {/* Practice Panel: Writing Drills (Priority) + 5-Question Micro-Quiz */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2E8F0] pb-4">
          <div className="inline-flex rounded-xl bg-[#F5F7FA] p-1 border border-[#E2E8F0]">
            <button
              type="button"
              onClick={() => setPracticeTab('write')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold cursor-pointer ${
                practiceTab === 'write'
                  ? 'bg-[#1B365D] text-white shadow-xs'
                  : 'text-[#475569]'
              }`}
            >
              <PenLine className="w-3.5 h-3.5" /> Luyện Viết Cấu Trúc ({lesson.writingDrills.length})
            </button>
            <button
              type="button"
              onClick={() => setPracticeTab('quiz')}
              className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold cursor-pointer ${
                practiceTab === 'quiz'
                  ? 'bg-white text-[#1B365D] shadow-xs'
                  : 'text-[#475569]'
              }`}
            >
              Trắc nghiệm ({lesson.quiz.length} câu)
            </button>
          </div>

          {practiceTab === 'quiz' && (
            <div className="flex items-center gap-3">
              <span className="text-xs text-[#475569]">
                {answeredCount}/{lesson.quiz.length} câu • Đúng{' '}
                <strong className="text-[#1B365D]">
                  {correctCount}/{lesson.quiz.length}
                </strong>
                {savedBest !== undefined && ` • Kỷ lục: ${savedBest}/5`}
              </span>
              <button
                type="button"
                onClick={handleResetQuiz}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E2E8F0] hover:bg-slate-50 text-xs font-semibold text-[#1B365D] cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Làm lại
              </button>
            </div>
          )}
        </div>

        {practiceTab === 'write' ? (
          <div className="space-y-5">
            {lesson.writingDrills.map((drill, dIdx) => {
              const val = writeInputs[drill.id] ?? '';
              const isChecked = Boolean(writeChecked[drill.id]);
              const showHint = Boolean(showWriteHints[drill.id]);
              const diff = isChecked ? diffWords(val, drill.answerEn) : null;

              return (
                <div
                  key={drill.id}
                  className="p-4 sm:p-5 rounded-2xl bg-[#F5F7FA] border border-[#E2E8F0] space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm sm:text-base font-bold text-[#1B365D]">
                      <span className="text-[#2E6B9E] mr-1.5">Bài viết {dIdx + 1}.</span>
                      {drill.instructionVi}
                    </p>
                    {isSpeechSupported() && (
                      <button
                        type="button"
                        onClick={() => speakEnglish(drill.answerEn, 'en-GB')}
                        className="p-1.5 rounded-lg bg-white border border-[#E2E8F0] text-[#2E6B9E] shrink-0 cursor-pointer"
                        title="Nghe đáp án mẫu"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {showHint && (
                    <div className="p-2.5 rounded-lg bg-[#FEF3C7]/70 border border-amber-200 text-xs text-[#B45309] font-medium">
                      Gợi ý khung từ: <strong>{drill.hintEn}</strong>
                    </div>
                  )}

                  <textarea
                    rows={2}
                    value={val}
                    onChange={(e) => {
                      const nextVal = e.target.value;
                      setWriteInputs((prev) => ({ ...prev, [drill.id]: nextVal }));
                      setWriteChecked((prev) => ({ ...prev, [drill.id]: false }));
                    }}
                    placeholder="Viết câu tiếng Anh áp dụng cấu trúc vừa học..."
                    className="w-full p-3 rounded-xl border border-[#E2E8F0] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#2E6B9E]"
                  />

                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setShowWriteHints((prev) => ({ ...prev, [drill.id]: !prev[drill.id] }))
                      }
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#E2E8F0] bg-white text-xs font-semibold text-[#475569] cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" /> {showHint ? 'Ẩn gợi ý' : 'Xem gợi ý'}
                    </button>

                    <button
                      type="button"
                      onClick={() => setWriteChecked((prev) => ({ ...prev, [drill.id]: true }))}
                      className="px-4 py-1.5 rounded-xl bg-[#1B365D] text-white text-xs font-semibold cursor-pointer"
                    >
                      Kiểm tra từng từ
                    </button>
                  </div>

                  {diff && (
                    <div className="space-y-2 pt-1">
                      <WordDiffView diff={diff} expectedSentence={drill.answerEn} />
                      <p className="text-xs text-[#15803D] font-medium">{drill.explanationVi}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-5">
            {lesson.quiz.map((q, qIdx) => {
              const chosen = lessonAnswers[q.id];
              const isAnswered = chosen !== undefined;
              const isCorrect = chosen === q.correctIndex;

              return (
                <div key={q.id} className="space-y-2.5 pb-4 border-b border-[#E2E8F0] last:border-b-0 last:pb-0">
                  <p className="text-sm sm:text-base font-semibold text-[#1F2933]">
                    <span className="text-[#2E6B9E] mr-1.5">Câu {qIdx + 1}.</span>
                    {q.question}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {q.options.map((opt, optIdx) => {
                      let cls = 'border-[#E2E8F0] bg-white hover:bg-slate-50 text-[#1F2933]';
                      if (isAnswered) {
                        if (optIdx === q.correctIndex) {
                          cls = 'border-emerald-400 bg-[#DCFCE7] text-[#15803D] font-semibold';
                        } else if (optIdx === chosen) {
                          cls = 'border-red-300 bg-[#FEE2E2] text-[#B91C1C]';
                        } else {
                          cls = 'border-[#E2E8F0] bg-slate-50 text-slate-400';
                        }
                      }

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          disabled={isAnswered}
                          onClick={() => handleSelectOption(q.id, optIdx)}
                          className={`px-3.5 py-2.5 rounded-xl border text-left text-sm transition cursor-pointer disabled:cursor-default ${cls}`}
                        >
                          <span className="font-bold mr-1.5">{String.fromCharCode(65 + optIdx)}.</span>
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {isAnswered && (
                    <div
                      className={`p-3 rounded-xl text-xs sm:text-sm flex items-start gap-2 ${
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
                      <span>{q.explanationVi}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
