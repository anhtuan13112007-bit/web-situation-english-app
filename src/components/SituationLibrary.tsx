import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  BookMarked,
  ChevronDown,
  ChevronUp,
  Search,
  Volume2,
} from 'lucide-react';
import { FRAMEWORK_REFERENCE, SITUATION_ITEMS } from '../data/situations';
import { SituationTopic } from '../types';
import { isSpeechSupported, speakEnglish } from '../utils/speech';

interface SituationLibraryProps {
  onPracticeSituation: (situationId: string) => void;
}

const TOPICS: SituationTopic[] = [
  'Disruption',
  'Homework',
  'Tardiness',
  'Cheating',
  'Grade Dispute',
  'Disengagement',
  'Group Conflict',
];

export const SituationLibrary: React.FC<SituationLibraryProps> = ({ onPracticeSituation }) => {
  const [showFramework, setShowFramework] = useState(true);
  const [search, setSearch] = useState('');
  const [topicFilter, setTopicFilter] = useState<'all' | SituationTopic>('all');
  const [problemFilter, setProblemFilter] = useState<'all' | '1' | '2'>('all');
  const [openTranslations, setOpenTranslations] = useState<Record<string, boolean>>({});
  const [openSolutions, setOpenSolutions] = useState<Record<string, boolean>>({
    'slide-sit-1': true,
  });

  const filteredSituations = useMemo(() => {
    const q = search.trim().toLowerCase();
    return SITUATION_ITEMS.filter((sit) => {
      const topicOk = topicFilter === 'all' || sit.topic === topicFilter;
      const problemOk = problemFilter === 'all' || String(sit.problemCount) === problemFilter;
      const textOk =
        !q ||
        sit.titleVi.toLowerCase().includes(q) ||
        sit.promptEn.toLowerCase().includes(q) ||
        sit.promptVi.toLowerCase().includes(q) ||
        sit.topic.toLowerCase().includes(q);
      return topicOk && problemOk && textOk;
    });
  }, [search, topicFilter, problemFilter]);

  const toggleTranslation = (id: string) =>
    setOpenTranslations((prev) => ({ ...prev, [id]: !prev[id] }));

  const toggleSolution = (id: string) =>
    setOpenSolutions((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="space-y-6">
      {/* Collapsible Ảnh 4 Standard Framework Card */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => setShowFramework((prev) => !prev)}
          className="w-full px-6 py-4 flex items-center justify-between text-left bg-[#1B365D] text-white cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <BookMarked className="w-5 h-5 text-sky-300" />
            <div>
              <h3 className="font-bold text-sm sm:text-base">
                Khung chuẩn Ảnh 4 & Quy tắc xác định 1 vs 2 Vấn đề
              </h3>
              <p className="text-xs text-slate-300">
                Action (What would you do?) – Saying (Direct Speech) – Goal (Why would you do it?)
              </p>
            </div>
          </div>
          {showFramework ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>

        {showFramework && (
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {FRAMEWORK_REFERENCE.rules.map((rule) => (
                <div
                  key={rule.title}
                  className="p-4 rounded-xl bg-[#F5F7FA] border border-[#E2E8F0] space-y-1.5"
                >
                  <span className="inline-block px-2 py-0.5 rounded bg-[#DBEAFE] text-[#1D4ED8] text-[11px] font-bold">
                    {rule.badge}
                  </span>
                  <div className="font-bold text-sm text-[#1B365D]">{rule.title}</div>
                  <p className="text-xs text-[#475569] leading-relaxed">{rule.description}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {FRAMEWORK_REFERENCE.table.map((row) => {
                const colorCls =
                  row.part === 'Action'
                    ? 'border-blue-200 bg-[#DBEAFE]/35 text-[#1D4ED8]'
                    : row.part === 'Saying'
                    ? 'border-amber-200 bg-[#FEF3C7]/45 text-[#B45309]'
                    : 'border-emerald-200 bg-[#DCFCE7]/45 text-[#15803D]';
                return (
                  <div key={row.part} className={`p-4 rounded-xl border space-y-1.5 ${colorCls}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm">{row.part}</span>
                      <span className="text-[11px] font-semibold underline">{row.remember}</span>
                    </div>
                    <div className="text-xs font-bold text-[#1B365D]">{row.question}</div>
                    <p className="text-xs text-[#1F2933] leading-relaxed">{row.guideVi}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-[#1B365D]">
              Kho 10 Tình huống Chuẩn & Đáp án Mẫu
            </h3>
            <p className="text-xs sm:text-sm text-[#475569]">
              Bao gồm 2 tình huống Slide chính, 3 ví dụ mở rộng và 5 tình huống thực hành bổ sung.
            </p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-[#475569] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm tình huống..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#2E6B9E]"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={topicFilter}
            onChange={(e) => setTopicFilter(e.target.value as 'all' | SituationTopic)}
            className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-xs sm:text-sm bg-white"
            aria-label="Lọc chủ đề"
          >
            <option value="all">Tất cả chủ đề ({SITUATION_ITEMS.length})</option>
            {TOPICS.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </select>

          <div className="inline-flex rounded-lg bg-[#F5F7FA] p-1 border border-[#E2E8F0]">
            {(
              [
                { id: 'all', label: 'Mọi số vấn đề' },
                { id: '1', label: '1 Problem' },
                { id: '2', label: '2 Problems' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setProblemFilter(opt.id)}
                className={`px-3 py-1 rounded-md text-xs font-semibold cursor-pointer transition ${
                  problemFilter === opt.id
                    ? 'bg-white text-[#1B365D] shadow-xs'
                    : 'text-[#475569] hover:text-[#1B365D]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Situation Cards */}
      <div className="space-y-4">
        {filteredSituations.map((sit) => {
          const isTransOpen = Boolean(openTranslations[sit.id]);
          const isSolOpen = Boolean(openSolutions[sit.id]);

          return (
            <div
              key={sit.id}
              className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs space-y-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-[#1B365D] text-white text-xs font-bold">
                      {sit.code}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#DBEAFE] text-[#1D4ED8] text-xs font-semibold">
                      {sit.topic}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                        sit.problemCount === 2
                          ? 'bg-[#FEF3C7] text-[#B45309] border-amber-200'
                          : 'bg-[#DCFCE7] text-[#15803D] border-emerald-200'
                      }`}
                    >
                      {sit.problemCount === 2 ? '2 Problems (2 Khung)' : '1 Problem (1 Khung)'}
                    </span>
                    <span className="text-xs text-[#475569]">{sit.sourceLabel}</span>
                  </div>
                  <h4 className="text-base sm:text-lg font-bold text-[#1B365D]">{sit.titleVi}</h4>
                </div>

                <button
                  type="button"
                  onClick={() => onPracticeSituation(sit.id)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2E6B9E] hover:bg-[#1B365D] text-white text-xs sm:text-sm font-semibold transition cursor-pointer shrink-0"
                >
                  Luyện viết với AI <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Prompt EN */}
              <div className="p-4 rounded-xl bg-[#F5F7FA] border border-[#E2E8F0] space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm sm:text-base text-[#1F2933] leading-relaxed font-medium">
                    {sit.promptEn}
                  </p>
                  {isSpeechSupported() && (
                    <button
                      type="button"
                      onClick={() => speakEnglish(sit.promptEn, 'en-GB')}
                      className="p-1.5 rounded-lg bg-white border border-[#E2E8F0] text-[#2E6B9E] hover:bg-[#DBEAFE] shrink-0 cursor-pointer"
                      title="Nghe đề bài"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <p className="text-xs text-[#475569]">
                  <strong className="text-[#1B365D]">Phân tích cấu trúc: </strong>
                  {sit.problemNoteVi}
                </p>
              </div>

              {/* Action Bar */}
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => toggleTranslation(sit.id)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#E2E8F0] hover:bg-slate-50 text-xs font-semibold text-[#475569] cursor-pointer"
                >
                  {isTransOpen ? 'Ẩn dịch tiếng Việt' : 'Xem dịch tiếng Việt'}
                  {isTransOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                <button
                  type="button"
                  onClick={() => toggleSolution(sit.id)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#2E6B9E]/40 bg-[#DBEAFE]/30 hover:bg-[#DBEAFE]/60 text-xs font-semibold text-[#1B365D] cursor-pointer"
                >
                  {isSolOpen ? 'Ẩn đáp án mẫu Action – Saying – Goal' : 'Xem đáp án mẫu Action – Saying – Goal'}
                  {isSolOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>

              {isTransOpen && (
                <div className="p-4 rounded-xl bg-slate-50 border border-[#E2E8F0] text-sm text-[#475569] leading-relaxed">
                  <strong className="text-[#1B365D]">Dịch nghĩa: </strong>
                  {sit.promptVi}
                </div>
              )}

              {isSolOpen && (
                <div className="space-y-4 pt-2">
                  {sit.frames.map((frame, fIdx) => (
                    <div
                      key={fIdx}
                      className="rounded-xl border border-[#E2E8F0] p-4 sm:p-5 bg-slate-50/60 space-y-3"
                    >
                      {frame.labelVi && (
                        <div className="text-xs sm:text-sm font-bold text-[#1B365D]">
                          {frame.labelVi}
                        </div>
                      )}

                      <div className="grid grid-cols-1 gap-3">
                        <div className="p-3.5 rounded-xl bg-[#DBEAFE]/45 border border-blue-200">
                          <div className="text-xs font-extrabold uppercase text-[#1D4ED8] mb-1">
                            Action (What would you do?)
                          </div>
                          <p className="text-sm text-[#1F2933] leading-relaxed">{frame.action}</p>
                        </div>

                        <div className="p-3.5 rounded-xl bg-[#FEF3C7]/55 border border-amber-200">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-extrabold uppercase text-[#B45309]">
                              Saying (Direct Speech)
                            </span>
                            {isSpeechSupported() && (
                              <button
                                type="button"
                                onClick={() => speakEnglish(frame.saying, 'en-GB')}
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#B45309] hover:underline cursor-pointer"
                              >
                                <Volume2 className="w-3.5 h-3.5" /> Nghe lời thoại
                              </button>
                            )}
                          </div>
                          <p className="text-sm text-[#1F2933] leading-relaxed italic font-medium">
                            {frame.saying}
                          </p>
                        </div>

                        <div className="p-3.5 rounded-xl bg-[#DCFCE7]/55 border border-emerald-200">
                          <div className="text-xs font-extrabold uppercase text-[#15803D] mb-1">
                            Goal (Why would you do it?)
                          </div>
                          <p className="text-sm text-[#1F2933] leading-relaxed">{frame.goal}</p>
                        </div>
                      </div>

                      {frame.structureNoteVi && (
                        <p className="text-xs text-[#475569] italic">
                          Nhận xét cấu trúc: {frame.structureNoteVi}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
