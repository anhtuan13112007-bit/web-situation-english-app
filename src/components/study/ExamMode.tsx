import React, { useState } from 'react';
import {
  CheckCircle2,
  Mic,
  RotateCcw,
  Square,
  Trophy,
  Volume2,
  XCircle,
} from 'lucide-react';
import { VOCABULARY_ITEMS } from '../../data/vocabulary';
import { ExamRecord } from '../../types';
import {
  isSpeechRecognitionSupported,
  isSpeechSupported,
  SpeechAccent,
  speakEnglish,
  startSpeechRecognition,
} from '../../utils/speech';
import {
  checkVietnameseMeaningMatch,
  cleanVocabWord,
  diffWords,
  maskTargetWordInSentence,
  normalizeEn,
} from '../../utils/studyHelpers';

interface ExamModeProps {
  accent: SpeechAccent;
  examHistory: ExamRecord[];
  onSaveExam: (record: ExamRecord) => void;
  onRecordMistake: (wordId: string) => void;
  onPracticeMistakes: () => void;
}

type SkillType = 'reading' | 'writing' | 'listening' | 'speaking';

interface ExamQuestion {
  id: string;
  skill: SkillType;
  vocabId: string;
  prompt: string;
  subHint: string;
  audioText?: string;
  options?: string[];
  correctAnswer: string;
  explanationVi: string;
}

interface GradedQuestion {
  q: ExamQuestion;
  userAnswer: string;
  isCorrect: boolean;
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function generateExam(): ExamQuestion[] {
  const pool = shuffle(VOCABULARY_ITEMS);
  const readingItems = pool.slice(0, 3);
  const writingItems = pool.slice(3, 6);
  const listeningItems = pool.slice(6, 9);
  const speakingItems = pool.slice(9, 12);

  const questions: ExamQuestion[] = [];

  readingItems.forEach((v) => {
    const { masked } = maskTargetWordInSentence(v.exampleEn, v.word);
    const distractors = shuffle(VOCABULARY_ITEMS.filter((x) => x.id !== v.id))
      .slice(0, 3)
      .map((x) => x.word);
    const opts = shuffle([v.word, ...distractors]);
    questions.push({
      id: `r-${v.id}`,
      skill: 'reading',
      vocabId: v.id,
      prompt: `Chọn từ phù hợp điền vào chỗ trống:\n"${masked}"`,
      subHint: `Dịch: ${v.exampleVi}`,
      options: opts,
      correctAnswer: v.word,
      explanationVi: `${v.word} (${v.meaningVi}) — ${v.exampleEn}`,
    });
  });

  writingItems.forEach((v, idx) => {
    if (idx === 0) {
      questions.push({
        id: `w-${v.id}`,
        skill: 'writing',
        vocabId: v.id,
        prompt: `Gõ nghĩa tiếng Việt của từ "${v.word}" (không cần dấu):`,
        subHint: `Loại từ: ${v.pos}`,
        correctAnswer: v.meaningVi,
        explanationVi: `${v.word} = ${v.meaningVi}`,
      });
    } else {
      questions.push({
        id: `w-${v.id}`,
        skill: 'writing',
        vocabId: v.id,
        prompt: `Viết câu tiếng Anh theo nghĩa: "${v.exampleVi}"`,
        subHint: `Gợi ý dùng từ: ${cleanVocabWord(v.word)}`,
        correctAnswer: v.exampleEn,
        explanationVi: `Đáp án chuẩn: ${v.exampleEn}`,
      });
    }
  });

  listeningItems.forEach((v) => {
    questions.push({
      id: `l-${v.id}`,
      skill: 'listening',
      vocabId: v.id,
      prompt: 'Nghe phát âm và gõ chính xác từ tiếng Anh:',
      subHint: `Nghĩa gợi ý: ${v.meaningVi}`,
      audioText: cleanVocabWord(v.word),
      correctAnswer: cleanVocabWord(v.word),
      explanationVi: `${v.word} (${v.ipaBrE}) — ${v.meaningVi}`,
    });
  });

  speakingItems.forEach((v) => {
    questions.push({
      id: `s-${v.id}`,
      skill: 'speaking',
      vocabId: v.id,
      prompt: `Đọc to câu sau bằng tiếng Anh:\n"${v.exampleEn}"`,
      subHint: `Từ khóa: ${v.word} (${v.ipaBrE})`,
      audioText: v.exampleEn,
      correctAnswer: v.exampleEn,
      explanationVi: `Câu mẫu: ${v.exampleEn}`,
    });
  });

  return questions;
}

const SKILL_LABEL: Record<SkillType, string> = {
  reading: 'Reading (Đọc hiểu)',
  writing: 'Writing (Viết)',
  listening: 'Listening (Nghe)',
  speaking: 'Speaking (Nói)',
};

export const ExamMode: React.FC<ExamModeProps> = ({
  accent,
  examHistory,
  onSaveExam,
  onRecordMistake,
  onPracticeMistakes,
}) => {
  const [questions, setQuestions] = useState<ExamQuestion[]>(() => generateExam());
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState<GradedQuestion[] | null>(null);
  const [recordingId, setRecordingId] = useState<string | null>(null);
  const [micSession, setMicSession] = useState<{ stop: () => void } | null>(null);

  const handleRestart = () => {
    setQuestions(generateExam());
    setAnswers({});
    setSubmitted(null);
  };

  const toggleMicForQuestion = (qId: string) => {
    if (recordingId === qId && micSession) {
      micSession.stop();
      setRecordingId(null);
      return;
    }
    setRecordingId(qId);
    const s = startSpeechRecognition({
      lang: accent,
      onInterim: (txt) => setAnswers((prev) => ({ ...prev, [qId]: txt })),
      onFinal: (txt) => setAnswers((prev) => ({ ...prev, [qId]: txt })),
      onError: () => setRecordingId(null),
      onEnd: () => setRecordingId(null),
    });
    if (!s) setRecordingId(null);
    else setMicSession(s);
  };

  const handleSubmitExam = () => {
    const graded: GradedQuestion[] = questions.map((q, idx) => {
      const userAns = (answers[q.id] ?? '').trim();
      let ok = false;

      if (q.skill === 'reading') {
        ok = userAns === q.correctAnswer;
      } else if (q.skill === 'writing') {
        if (q.id.startsWith('w-') && idx === 3) {
          ok = checkVietnameseMeaningMatch(userAns, q.correctAnswer);
        } else {
          ok = diffWords(userAns, q.correctAnswer).accuracy >= 75;
        }
      } else if (q.skill === 'listening') {
        ok = normalizeEn(userAns) === normalizeEn(q.correctAnswer);
      } else {
        ok = diffWords(userAns, q.correctAnswer).accuracy >= 65;
      }

      if (!ok) onRecordMistake(q.vocabId);
      return { q, userAnswer: userAns, isCorrect: ok };
    });

    const countBySkill = (skill: SkillType) => {
      const sub = graded.filter((g) => g.q.skill === skill);
      const okCount = sub.filter((g) => g.isCorrect).length;
      return Math.round((okCount / Math.max(1, sub.length)) * 10 * 10) / 10;
    };

    const totalCorrect = graded.filter((g) => g.isCorrect).length;
    const totalScore10 = Math.round((totalCorrect / graded.length) * 10 * 10) / 10;

    onSaveExam({
      id: `${Date.now()}`,
      createdAt: new Date().toISOString(),
      totalScore10,
      skillScores: {
        reading: countBySkill('reading'),
        writing: countBySkill('writing'),
        listening: countBySkill('listening'),
        speaking: countBySkill('speaking'),
      },
      wrongWordIds: graded.filter((g) => !g.isCorrect).map((g) => g.q.vocabId),
    });

    setSubmitted(graded);
  };

  const totalScore10 = submitted
    ? Math.round((submitted.filter((g) => g.isCorrect).length / submitted.length) * 10 * 10) / 10
    : 0;

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-[#1B365D]">
            Bài kiểm tra Tổng hợp 4 Kỹ năng (12 câu · Thang điểm 10)
          </h3>
          <p className="text-xs sm:text-sm text-[#475569]">
            3 câu Reading · 3 câu Writing · 3 câu Listening · 3 câu Speaking (đọc mic hoặc gõ thay thế).
          </p>
        </div>

        <button
          type="button"
          onClick={handleRestart}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#E2E8F0] text-xs font-semibold text-[#1B365D] hover:bg-slate-50 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Tạo đề mới
        </button>
      </div>

      {submitted ? (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-[#1B365D] text-white flex flex-col items-center justify-center">
                  <span className="text-2xl font-extrabold">{totalScore10}</span>
                  <span className="text-[10px] text-slate-300">/ 10</span>
                </div>
                <div>
                  <h4 className="font-bold text-lg text-[#1B365D] flex items-center gap-1.5">
                    <Trophy className="w-5 h-5 text-amber-500" /> Kết quả Kiểm tra 4 Kỹ năng
                  </h4>
                  <p className="text-xs text-[#475569]">
                    Đúng {submitted.filter((g) => g.isCorrect).length} / {submitted.length} câu
                  </p>
                </div>
              </div>

              {submitted.some((g) => !g.isCorrect) && (
                <button
                  type="button"
                  onClick={onPracticeMistakes}
                  className="px-4 py-2 rounded-xl bg-[#2E6B9E] text-white text-xs sm:text-sm font-semibold cursor-pointer"
                >
                  Ôn viết các từ vừa sai →
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(['reading', 'writing', 'listening', 'speaking'] as SkillType[]).map((sk) => {
                const sub = submitted.filter((g) => g.q.skill === sk);
                const ok = sub.filter((g) => g.isCorrect).length;
                return (
                  <div key={sk} className="p-3 rounded-xl bg-[#F5F7FA] border border-[#E2E8F0]">
                    <div className="text-[11px] font-semibold text-[#475569]">{SKILL_LABEL[sk]}</div>
                    <div className="text-lg font-extrabold text-[#1B365D]">
                      {ok}/{sub.length}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            {submitted.map((g, idx) => (
              <div
                key={g.q.id}
                className={`p-4 rounded-2xl border space-y-1.5 ${
                  g.isCorrect
                    ? 'bg-[#DCFCE7]/40 border-emerald-200'
                    : 'bg-[#FEE2E2]/40 border-red-200'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-[#1B365D]">
                    Câu {idx + 1} · {SKILL_LABEL[g.q.skill]}
                  </span>
                  {g.isCorrect ? (
                    <span className="text-[#15803D] inline-flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Đúng
                    </span>
                  ) : (
                    <span className="text-[#B91C1C] inline-flex items-center gap-1">
                      <XCircle className="w-4 h-4" /> Cần ôn lại
                    </span>
                  )}
                </div>
                <p className="text-sm font-medium text-[#1F2933]">{g.q.prompt}</p>
                <p className="text-xs text-[#475569]">
                  <strong>Bạn trả lời:</strong> {g.userAnswer || '(Bỏ trống)'}
                </p>
                <p className="text-xs text-[#1B365D] font-semibold">{g.q.explanationVi}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q, idx) => (
            <div
              key={q.id}
              className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#DBEAFE] text-[#1D4ED8] text-xs font-bold">
                  Câu {idx + 1} · {SKILL_LABEL[q.skill]}
                </span>
                {q.audioText && isSpeechSupported() && (
                  <button
                    type="button"
                    onClick={() => speakEnglish(q.audioText!, accent)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#F5F7FA] border border-[#E2E8F0] text-xs font-semibold text-[#2E6B9E] cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5" /> Nghe
                  </button>
                )}
              </div>

              <p className="text-sm sm:text-base font-semibold text-[#1B365D] whitespace-pre-line">
                {q.prompt}
              </p>
              <p className="text-xs text-[#475569]">{q.subHint}</p>

              {q.options ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {q.options.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: opt }))}
                      className={`px-3.5 py-2.5 rounded-xl border text-left text-sm cursor-pointer transition ${
                        answers[q.id] === opt
                          ? 'bg-[#1B365D] text-white border-[#1B365D]'
                          : 'bg-white border-[#E2E8F0] hover:bg-slate-50 text-[#1F2933]'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {q.skill === 'speaking' && (
                    <button
                      type="button"
                      disabled={!isSpeechRecognitionSupported()}
                      onClick={() => toggleMicForQuestion(q.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-50 ${
                        recordingId === q.id
                          ? 'bg-[#B91C1C] text-white'
                          : 'bg-[#1B365D] text-white'
                      }`}
                    >
                      {recordingId === q.id ? (
                        <Square className="w-3.5 h-3.5" />
                      ) : (
                        <Mic className="w-3.5 h-3.5" />
                      )}
                      {recordingId === q.id ? 'Dừng ghi âm' : 'Nói bằng Micro'}
                    </button>
                  )}

                  <input
                    type="text"
                    value={answers[q.id] ?? ''}
                    onChange={(e) =>
                      setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                    }
                    placeholder={
                      q.skill === 'speaking'
                        ? 'Kết quả micro (hoặc gõ câu nếu thiết bị không có micro)...'
                        : 'Nhập câu trả lời của bạn...'
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#2E6B9E]"
                  />
                </div>
              )}
            </div>
          ))}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSubmitExam}
              className="px-6 py-3 rounded-xl bg-[#1B365D] hover:bg-[#152a49] text-white text-sm font-bold shadow-sm cursor-pointer"
            >
              Nộp bài & Chấm điểm thang 10
            </button>
          </div>
        </div>
      )}

      {examHistory.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#475569]">
            Lịch sử điểm kiểm tra gần đây
          </h4>
          <div className="flex flex-wrap gap-2">
            {examHistory.slice(0, 6).map((ex) => (
              <span
                key={ex.id}
                className="px-3 py-1.5 rounded-xl bg-[#F5F7FA] border border-[#E2E8F0] text-xs font-semibold text-[#1B365D]"
              >
                {ex.totalScore10}/10 · {new Date(ex.createdAt).toLocaleDateString('vi-VN')}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
