import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  History,
  Lightbulb,
  Loader2,
  Plus,
  RefreshCw,
  Send,
  Settings,
  Sparkles,
  Trash2,
  Volume2,
} from 'lucide-react';
import { SENTENCE_PATTERNS } from '../data/patterns';
import { SITUATION_ITEMS } from '../data/situations';
import { VOCABULARY_ITEMS } from '../data/vocabulary';
import { gradeSituationResponse } from '../services/aiGrader';
import {
  AiSettings,
  GradingResult,
  PracticeFrame,
  SubmissionRecord,
} from '../types';
import { isSpeechSupported, speakEnglish } from '../utils/speech';

interface PracticeWorkspaceProps {
  selectedSituationId: string;
  onSelectSituationId: (id: string) => void;
  aiSettings: AiSettings;
  onOpenSettings: () => void;
  submissions: SubmissionRecord[];
  onAddSubmission: (record: SubmissionRecord) => void;
  onDeleteSubmission: (id: string) => void;
}

const CUSTOM_ID = 'custom-situation';

const EMPTY_FRAME: PracticeFrame = { action: '', saying: '', goal: '' };

export const PracticeWorkspace: React.FC<PracticeWorkspaceProps> = ({
  selectedSituationId,
  onSelectSituationId,
  aiSettings,
  onOpenSettings,
  submissions,
  onAddSubmission,
  onDeleteSubmission,
}) => {
  const activeSituation = useMemo(
    () => SITUATION_ITEMS.find((s) => s.id === selectedSituationId) ?? null,
    [selectedSituationId]
  );

  const isCustom = selectedSituationId === CUSTOM_ID || !activeSituation;

  const [customPrompt, setCustomPrompt] = useState(
    'During a pair-work activity, one student refuses to speak English and switches to Vietnamese while chatting off-topic. What should you do?'
  );
  const [customProblemCount, setCustomProblemCount] = useState<1 | 2>(1);

  const [frames, setFrames] = useState<PracticeFrame[]>([{ ...EMPTY_FRAME }]);
  const [showTranslation, setShowTranslation] = useState(false);
  const [showHints, setShowHints] = useState(true);
  const [showModelComparison, setShowModelComparison] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeResult, setActiveResult] = useState<{
    result: GradingResult;
    modelUsed: string;
    provider: string;
  } | null>(null);

  const [showHistory, setShowHistory] = useState(false);

  // Sync frame count suggestion when switching situation
  useEffect(() => {
    setErrorMsg(null);
    setActiveResult(null);
    setShowModelComparison(false);
    if (activeSituation?.problemCount === 2) {
      setFrames([{ ...EMPTY_FRAME }, { ...EMPTY_FRAME }]);
    } else {
      setFrames([{ ...EMPTY_FRAME }]);
    }
  }, [selectedSituationId, activeSituation?.problemCount]);

  const suggestedVocab = useMemo(() => {
    if (!activeSituation) return VOCABULARY_ITEMS.slice(0, 6);
    return VOCABULARY_ITEMS.filter((v) => activeSituation.suggestedVocabIds.includes(v.id));
  }, [activeSituation]);

  const suggestedPatterns = useMemo(() => {
    if (!activeSituation) return SENTENCE_PATTERNS.slice(0, 5);
    return SENTENCE_PATTERNS.filter((p) => activeSituation.suggestedPatternIds.includes(p.id));
  }, [activeSituation]);

  const promptEn = isCustom ? customPrompt : activeSituation.promptEn;
  const expectedProblemCount: 1 | 2 = isCustom
    ? customProblemCount
    : activeSituation.problemCount;

  const updateFrameField = (
    frameIdx: number,
    field: keyof PracticeFrame,
    value: string
  ) => {
    setFrames((prev) =>
      prev.map((f, idx) => (idx === frameIdx ? { ...f, [field]: value } : f))
    );
  };

  const handleAddSecondFrame = () => {
    if (frames.length < 2) {
      setFrames((prev) => [...prev, { ...EMPTY_FRAME }]);
    }
  };

  const handleRemoveSecondFrame = () => {
    if (frames.length > 1) {
      setFrames((prev) => prev.slice(0, 1));
    }
  };

  const handleSubmit = async () => {
    if (isLoading) return;

    const hasContent = frames.some(
      (f) => f.action.trim() || f.saying.trim() || f.goal.trim()
    );
    if (!hasContent) {
      setErrorMsg('Bạn hãy viết ít nhất nội dung cho Action, Saying hoặc Goal trước khi chấm bài.');
      return;
    }

    if (isCustom && !customPrompt.trim()) {
      setErrorMsg('Vui lòng nhập đề bài tình huống tự chọn.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const { result, modelUsed } = await gradeSituationResponse({
        settings: aiSettings,
        situationPromptEn: promptEn,
        expectedProblemCount,
        frames,
      });

      setActiveResult({
        result,
        modelUsed,
        provider: aiSettings.provider,
      });

      const record: SubmissionRecord = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        createdAt: new Date().toISOString(),
        situationId: isCustom ? CUSTOM_ID : activeSituation.id,
        situationTitle: isCustom
          ? 'Tình huống tự nhập'
          : `${activeSituation.code}: ${activeSituation.titleVi}`,
        promptEn,
        frames: frames.map((f) => ({ ...f })),
        provider: aiSettings.provider,
        modelUsed,
        result,
      };
      onAddSubmission(record);
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Đã có lỗi khi chấm bài. Vui lòng thử lại.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadHistoryRecord = (record: SubmissionRecord) => {
    setFrames(record.frames.length > 0 ? record.frames : [{ ...EMPTY_FRAME }]);
    setActiveResult({
      result: record.result,
      modelUsed: record.modelUsed,
      provider: record.provider,
    });
    setErrorMsg(null);
    setShowHistory(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Situation Picker & History Toggle */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex-1 min-w-[240px] space-y-1">
          <label className="text-xs font-bold uppercase tracking-wider text-[#475569] block">
            Chọn tình huống luyện tập
          </label>
          <select
            value={selectedSituationId}
            onChange={(e) => onSelectSituationId(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-[#E2E8F0] bg-[#F5F7FA] text-sm font-semibold text-[#1B365D] focus:outline-none focus:ring-2 focus:ring-[#2E6B9E]"
          >
            {SITUATION_ITEMS.map((sit) => (
              <option key={sit.id} value={sit.id}>
                [{sit.code}] ({sit.problemCount} vấn đề) — {sit.titleVi}
              </option>
            ))}
            <option value={CUSTOM_ID}>+ Tự nhập tình huống của riêng bạn</option>
          </select>
        </div>

        <button
          type="button"
          onClick={() => setShowHistory((prev) => !prev)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E2E8F0] hover:bg-slate-50 text-xs sm:text-sm font-semibold text-[#1B365D] cursor-pointer"
        >
          <History className="w-4 h-4 text-[#2E6B9E]" />
          Lịch sử chấm ({submissions.length})
        </button>
      </div>

      {/* Submission History Drawer */}
      {showHistory && (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-[#1B365D] text-sm">Lịch sử bài đã chấm AI</h4>
            <span className="text-xs text-[#475569]">Lưu cục bộ trong trình duyệt</span>
          </div>

          {submissions.length === 0 ? (
            <p className="text-sm text-[#475569]">Chưa có bài làm nào được lưu.</p>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {submissions.map((rec) => (
                <div
                  key={rec.id}
                  className="p-3.5 rounded-xl bg-[#F5F7FA] border border-[#E2E8F0] flex flex-wrap items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded-md bg-[#1B365D] text-white text-xs font-bold">
                        {rec.result.overallScore}/10
                      </span>
                      <span className="text-xs font-semibold text-[#1B365D] truncate">
                        {rec.situationTitle}
                      </span>
                      <span className="text-[11px] text-[#475569]">
                        ({rec.provider.toUpperCase()} • {rec.modelUsed})
                      </span>
                    </div>
                    <p className="text-xs text-[#475569] mt-1">
                      {new Date(rec.createdAt).toLocaleString('vi-VN')}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleLoadHistoryRecord(rec)}
                      className="px-3 py-1.5 rounded-lg bg-white border border-[#E2E8F0] hover:bg-[#DBEAFE] text-xs font-semibold text-[#1B365D] cursor-pointer"
                    >
                      Xem lại
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteSubmission(rec.id)}
                      className="p-1.5 rounded-lg text-[#B91C1C] hover:bg-[#FEE2E2] cursor-pointer"
                      title="Xóa bản ghi"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Split-Screen Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Situation Prompt + Hint Drawer (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                  expectedProblemCount === 2
                    ? 'bg-[#FEF3C7] text-[#B45309] border-amber-200'
                    : 'bg-[#DCFCE7] text-[#15803D] border-emerald-200'
                }`}
              >
                {expectedProblemCount === 2
                  ? '2 Vấn đề → Viết 2 Khung'
                  : '1 Vấn đề → Viết 1 Khung'}
              </span>
              {!isCustom && (
                <span className="text-xs font-semibold text-[#2E6B9E]">
                  {activeSituation.topic}
                </span>
              )}
            </div>

            {isCustom ? (
              <div className="space-y-3">
                <textarea
                  rows={4}
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Nhập đề bài tình huống bằng tiếng Anh..."
                  className="w-full p-3 text-sm rounded-xl border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#2E6B9E]"
                />
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-semibold text-[#475569]">Số vấn đề dự kiến:</span>
                  {([1, 2] as const).map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setCustomProblemCount(num)}
                      className={`px-2.5 py-1 rounded-md border font-semibold cursor-pointer ${
                        customProblemCount === num
                          ? 'bg-[#1B365D] text-white border-[#1B365D]'
                          : 'bg-[#F5F7FA] text-[#475569] border-[#E2E8F0]'
                      }`}
                    >
                      {num} Problem
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm text-[#1F2933] leading-relaxed font-medium">
                    {activeSituation.promptEn}
                  </p>
                  {isSpeechSupported() && (
                    <button
                      type="button"
                      onClick={() => speakEnglish(activeSituation.promptEn, 'en-GB')}
                      className="p-1.5 rounded-lg bg-[#F5F7FA] border border-[#E2E8F0] text-[#2E6B9E] hover:bg-[#DBEAFE] shrink-0 cursor-pointer"
                      title="Nghe đề bài"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <p className="text-xs text-[#475569] bg-[#F5F7FA] p-2.5 rounded-lg border border-[#E2E8F0]">
                  {activeSituation.problemNoteVi}
                </p>

                <button
                  type="button"
                  onClick={() => setShowTranslation((prev) => !prev)}
                  className="text-xs font-semibold text-[#2E6B9E] hover:underline cursor-pointer"
                >
                  {showTranslation ? 'Ẩn bản dịch tiếng Việt' : 'Hiện bản dịch tiếng Việt'}
                </button>

                {showTranslation && (
                  <p className="text-xs text-[#475569] leading-relaxed border-t border-[#E2E8F0] pt-2">
                    {activeSituation.promptVi}
                  </p>
                )}
              </>
            )}
          </div>

          {/* Hint Drawer */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
            <button
              type="button"
              onClick={() => setShowHints((prev) => !prev)}
              className="w-full px-5 py-3.5 flex items-center justify-between text-left bg-[#F5F7FA] border-b border-[#E2E8F0] cursor-pointer"
            >
              <span className="flex items-center gap-2 text-sm font-bold text-[#1B365D]">
                <Lightbulb className="w-4 h-4 text-[#B45309]" />
                Gợi ý Từ vựng & Mẫu câu
              </span>
              {showHints ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showHints && (
              <div className="p-4 space-y-4">
                <div>
                  <div className="text-xs font-bold uppercase text-[#475569] mb-2">
                    Từ vựng nên dùng
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {suggestedVocab.map((v) => (
                      <span
                        key={v.id}
                        title={`${v.ipaBrE} — ${v.meaningVi}`}
                        className="px-2.5 py-1 rounded-lg bg-[#F5F7FA] border border-[#E2E8F0] text-xs font-medium text-[#1B365D]"
                      >
                        <strong>{v.word}</strong>{' '}
                        <span className="text-[#475569]">({v.meaningVi})</span>
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-bold uppercase text-[#475569] mb-2">
                    Mẫu câu gợi ý
                  </div>
                  <div className="space-y-2">
                    {suggestedPatterns.map((p) => (
                      <div
                        key={p.id}
                        className="p-2.5 rounded-lg bg-slate-50 border border-[#E2E8F0] text-xs space-y-0.5"
                      >
                        <span className="font-bold uppercase text-[10px] text-[#2E6B9E]">
                          {p.category}
                        </span>
                        <p className="text-[#1F2933] font-medium">{p.template}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Optional Model Comparison Drawer */}
          {!isCustom && (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
              <button
                type="button"
                onClick={() => setShowModelComparison((prev) => !prev)}
                className="w-full px-5 py-3.5 flex items-center justify-between text-left bg-white cursor-pointer"
              >
                <span className="flex items-center gap-2 text-sm font-bold text-[#1B365D]">
                  <BookOpen className="w-4 h-4 text-[#2E6B9E]" />
                  Đối chiếu đáp án mẫu
                </span>
                {showModelComparison ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {showModelComparison && (
                <div className="px-4 pb-4 space-y-3 border-t border-[#E2E8F0] pt-3">
                  {activeSituation.frames.map((fr, idx) => (
                    <div key={idx} className="space-y-2 text-xs">
                      {fr.labelVi && <div className="font-bold text-[#1B365D]">{fr.labelVi}</div>}
                      <div className="p-2.5 rounded-lg bg-[#DBEAFE]/40 border border-blue-200">
                        <strong className="text-[#1D4ED8]">Action: </strong>
                        {fr.action}
                      </div>
                      <div className="p-2.5 rounded-lg bg-[#FEF3C7]/50 border border-amber-200 italic">
                        <strong className="text-[#B45309] not-italic">Saying: </strong>
                        {fr.saying}
                      </div>
                      <div className="p-2.5 rounded-lg bg-[#DCFCE7]/50 border border-emerald-200">
                        <strong className="text-[#15803D]">Goal: </strong>
                        {fr.goal}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Response Editor + AI Scorecard (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 sm:p-6 shadow-xs space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#1B365D]">
                  Bài làm theo Form Action – Saying – Goal
                </h3>
                <p className="text-xs text-[#475569]">
                  Đang dùng: <strong>{aiSettings.provider === 'gemini' ? 'Google Gemini' : 'Groq'}</strong>{' '}
                  (<span className="font-mono">{aiSettings.provider === 'gemini' ? aiSettings.geminiModel : aiSettings.groqModel}</span>)
                </p>
              </div>

              {frames.length < 2 ? (
                <button
                  type="button"
                  onClick={handleAddSecondFrame}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#2E6B9E] text-[#2E6B9E] hover:bg-[#DBEAFE]/40 text-xs font-semibold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Thêm Khung Vấn đề 2
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleRemoveSecondFrame}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-200 text-[#B91C1C] hover:bg-[#FEE2E2]/50 text-xs font-semibold cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Xóa Khung 2
                </button>
              )}
            </div>

            {frames.map((frame, idx) => (
              <div
                key={idx}
                className="space-y-4 p-4 rounded-xl bg-[#F5F7FA] border border-[#E2E8F0]"
              >
                {frames.length > 1 && (
                  <div className="text-xs font-extrabold uppercase tracking-wider text-[#1B365D]">
                    Khung Vấn đề {idx + 1}
                  </div>
                )}

                {/* Action */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#1D4ED8] uppercase">
                      Action — What would you do?
                    </label>
                    <span className="text-[11px] text-[#475569]">
                      Rõ hành động, thời điểm & đối tượng
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={frame.action}
                    onChange={(e) => updateFrameField(idx, 'action', e.target.value)}
                    placeholder="Ví dụ: Schedule a private one-on-one meeting with the student after class..."
                    className="w-full p-3 text-sm rounded-xl border border-blue-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#2E6B9E]"
                  />
                </div>

                {/* Saying */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#B45309] uppercase">
                      Saying — What would you say? (Direct Speech)
                    </label>
                    <span className="text-[11px] text-[#475569]">
                      Dùng ngoặc kép &ldquo;...&rdquo;, giọng tôn trọng
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={frame.saying}
                    onChange={(e) => updateFrameField(idx, 'saying', e.target.value)}
                    placeholder='Ví dụ: "I&apos;ve noticed you seem distracted during class. Is there something bothering you?"'
                    className="w-full p-3 text-sm rounded-xl border border-amber-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#B45309]"
                  />
                </div>

                {/* Goal */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#15803D] uppercase">
                      Goal — Why would you do it?
                    </label>
                    <span className="text-[11px] text-[#475569]">
                      Nêu rõ mục đích sư phạm
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    value={frame.goal}
                    onChange={(e) => updateFrameField(idx, 'goal', e.target.value)}
                    placeholder="Ví dụ: Understand the underlying reasons for his/her behavior and maintain a respectful classroom environment."
                    className="w-full p-3 text-sm rounded-xl border border-emerald-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#15803D]"
                  />
                </div>
              </div>
            ))}

            {errorMsg && (
              <div className="p-4 rounded-xl bg-[#FEE2E2] border border-red-200 text-[#B91C1C] text-xs sm:text-sm space-y-2">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
                <div className="flex flex-wrap gap-2 pl-6">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-white border border-red-300 text-xs font-semibold text-[#B91C1C] hover:bg-red-50 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Thử lại
                  </button>
                  <button
                    type="button"
                    onClick={onOpenSettings}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-[#1B365D] text-white text-xs font-semibold hover:bg-[#152a49] cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5" /> Mở Cài đặt AI
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <button
                type="button"
                onClick={onOpenSettings}
                className="text-xs font-semibold text-[#2E6B9E] hover:underline cursor-pointer"
              >
                Đổi API Key / Nhà cung cấp (Gemini ↔ Groq)
              </button>

              <button
                type="button"
                disabled={isLoading}
                onClick={handleSubmit}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1B365D] hover:bg-[#152a49] text-white text-sm font-bold shadow-sm disabled:opacity-60 transition cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Đang chấm bài AI...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Chấm bài với AI
                  </>
                )}
              </button>
            </div>
          </div>

          {/* AI Scorecard */}
          {activeResult && (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-[#1B365D] text-white flex flex-col items-center justify-center shadow-sm">
                    <span className="text-xl font-extrabold leading-none">
                      {activeResult.result.overallScore}
                    </span>
                    <span className="text-[10px] text-slate-300">/ 10</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-base sm:text-lg text-[#1B365D] flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[#2E6B9E]" /> Kết quả Chấm điểm AI
                    </h4>
                    <p className="text-xs text-[#475569]">
                      Model: <span className="font-mono">{activeResult.modelUsed}</span>
                      {activeResult.result.usedFallbackModel && (
                        <span className="ml-2 px-2 py-0.5 rounded bg-[#FEF3C7] text-[#B45309] font-semibold">
                          Đã tự động chuyển sang model dự phòng do 429
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* 4 Sub-scores */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Action Clarity', val: activeResult.result.scores.action, color: 'bg-[#1D4ED8]' },
                  { label: 'Saying & Tone', val: activeResult.result.scores.saying, color: 'bg-[#B45309]' },
                  { label: 'Goal Alignment', val: activeResult.result.scores.goal, color: 'bg-[#15803D]' },
                  { label: 'Grammar & Vocab', val: activeResult.result.scores.language, color: 'bg-[#2E6B9E]' },
                ].map((metric) => (
                  <div
                    key={metric.label}
                    className="p-3 rounded-xl bg-[#F5F7FA] border border-[#E2E8F0] space-y-1.5"
                  >
                    <div className="text-[11px] font-semibold text-[#475569]">{metric.label}</div>
                    <div className="text-lg font-extrabold text-[#1B365D]">{metric.val}/10</div>
                    <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${metric.color}`}
                        style={{ width: `${Math.min(100, metric.val * 10)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-sm text-[#1F2933] bg-[#F5F7FA] p-4 rounded-xl border border-[#E2E8F0] leading-relaxed">
                <strong className="text-[#1B365D]">Nhận xét tổng quan: </strong>
                {activeResult.result.summaryVi}
              </p>

              {/* Strengths & Improvements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#DCFCE7]/50 border border-emerald-200 space-y-2">
                  <div className="text-xs font-bold uppercase text-[#15803D] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Điểm mạnh
                  </div>
                  <ul className="space-y-1.5 text-xs sm:text-sm text-[#1F2933] list-disc pl-4">
                    {activeResult.result.strengths.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-[#FEF3C7]/50 border border-amber-200 space-y-2">
                  <div className="text-xs font-bold uppercase text-[#B45309] flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4" /> Cần cải thiện
                  </div>
                  <ul className="space-y-1.5 text-xs sm:text-sm text-[#1F2933] list-disc pl-4">
                    {activeResult.result.improvements.map((imp, i) => (
                      <li key={i}>{imp}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Grammar Fixes */}
              {activeResult.result.grammarFixes.length > 0 && (
                <div className="space-y-2.5">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#B91C1C]">
                    Sửa lỗi Ngữ pháp & Diễn đạt
                  </div>
                  <div className="space-y-2">
                    {activeResult.result.grammarFixes.map((fix, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-slate-50 border border-[#E2E8F0] space-y-1 text-xs sm:text-sm"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-[#FEE2E2] text-[#B91C1C] line-through">
                            {fix.original}
                          </span>
                          <span>→</span>
                          <span className="px-2 py-0.5 rounded bg-[#DCFCE7] text-[#15803D] font-semibold">
                            {fix.corrected}
                          </span>
                        </div>
                        <p className="text-xs text-[#475569]">{fix.reasonVi}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Improved Sample */}
              {(activeResult.result.improvedSample.action ||
                activeResult.result.improvedSample.saying ||
                activeResult.result.improvedSample.goal) && (
                <div className="space-y-2.5 pt-2 border-t border-[#E2E8F0]">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#1B365D]">
                    Gợi ý bài viết nâng cấp chuẩn Action – Saying – Goal
                  </div>
                  <div className="space-y-2 text-xs sm:text-sm">
                    {activeResult.result.improvedSample.action && (
                      <div className="p-3 rounded-xl bg-[#DBEAFE]/40 border border-blue-200">
                        <strong className="text-[#1D4ED8]">Action: </strong>
                        {activeResult.result.improvedSample.action}
                      </div>
                    )}
                    {activeResult.result.improvedSample.saying && (
                      <div className="p-3 rounded-xl bg-[#FEF3C7]/50 border border-amber-200 italic">
                        <strong className="text-[#B45309] not-italic">Saying: </strong>
                        {activeResult.result.improvedSample.saying}
                      </div>
                    )}
                    {activeResult.result.improvedSample.goal && (
                      <div className="p-3 rounded-xl bg-[#DCFCE7]/50 border border-emerald-200">
                        <strong className="text-[#15803D]">Goal: </strong>
                        {activeResult.result.improvedSample.goal}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
