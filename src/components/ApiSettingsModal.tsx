import React, { useState } from 'react';
import { CheckCircle2, Eye, EyeOff, KeyRound, Loader2, Server, ShieldCheck, X, AlertCircle } from 'lucide-react';
import { AiMode, AiProvider, AiSettings } from '../types';
import {
  GEMINI_MODEL_PRESETS,
  GROQ_MODEL_PRESETS,
  testAiConnection,
} from '../services/aiGrader';

interface ApiSettingsModalProps {
  isOpen: boolean;
  settings: AiSettings;
  onSave: (next: AiSettings) => void;
  onClose: () => void;
}

export const ApiSettingsModal: React.FC<ApiSettingsModalProps> = ({
  isOpen,
  settings,
  onSave,
  onClose,
}) => {
  const [draft, setDraft] = useState<AiSettings>(settings);
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleModeChange = (mode: AiMode) => {
    setDraft((prev) => ({ ...prev, mode }));
    setTestResult(null);
  };

  const handleProviderChange = (provider: AiProvider) => {
    setDraft((prev) => ({ ...prev, provider }));
    setTestResult(null);
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const msg = await testAiConnection(draft);
      setTestResult({ ok: true, message: msg });
    } catch (error) {
      setTestResult({
        ok: false,
        message: error instanceof Error ? error.message : 'Kiểm tra kết nối thất bại.',
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    onSave(draft);
    onClose();
  };

  const isGemini = draft.provider === 'gemini';
  const activeKey = isGemini ? draft.geminiApiKey : draft.groqApiKey;
  const activeModel = isGemini ? draft.geminiModel : draft.groqModel;
  const presets = isGemini ? GEMINI_MODEL_PRESETS : GROQ_MODEL_PRESETS;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white w-full max-w-xl rounded-2xl border border-[#E2E8F0] shadow-xl overflow-hidden max-h-[92vh] flex flex-col">
        <div className="px-6 py-4 bg-[#1B365D] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <KeyRound className="w-5 h-5 text-sky-300" />
            <div>
              <h3 className="font-bold text-base">Cài đặt AI Chấm bài Miễn phí</h3>
              <p className="text-xs text-slate-300">Hỗ trợ Google AI Studio (Gemini) & Groq dự phòng</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 transition cursor-pointer"
            aria-label="Đóng cài đặt"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Deployment Mode */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#475569]">
              Chế độ kết nối
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleModeChange('byok')}
                className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                  draft.mode === 'byok'
                    ? 'border-[#2E6B9E] bg-[#DBEAFE]/40 ring-2 ring-[#2E6B9E]/20'
                    : 'border-[#E2E8F0] hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2 font-semibold text-sm text-[#1B365D]">
                  <ShieldCheck className="w-4 h-4 text-[#2E6B9E]" />
                  Cá nhân (BYOK)
                </div>
                <p className="text-xs text-[#475569] mt-1">
                  Key lưu cục bộ trong trình duyệt (`localStorage`), gọi trực tiếp API.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleModeChange('proxy')}
                className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                  draft.mode === 'proxy'
                    ? 'border-[#2E6B9E] bg-[#DBEAFE]/40 ring-2 ring-[#2E6B9E]/20'
                    : 'border-[#E2E8F0] hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2 font-semibold text-sm text-[#1B365D]">
                  <Server className="w-4 h-4 text-[#2E6B9E]" />
                  Vercel Proxy (`/api/grade`)
                </div>
                <p className="text-xs text-[#475569] mt-1">
                  Dùng khi deploy lên Vercel với biến môi trường server, tránh CORS.
                </p>
              </button>
            </div>
          </div>

          {/* Provider Switcher */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#475569]">
              Nhà cung cấp AI đang chọn
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleProviderChange('gemini')}
                className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                  isGemini
                    ? 'border-[#2E6B9E] bg-[#DBEAFE]/40 ring-2 ring-[#2E6B9E]/20'
                    : 'border-[#E2E8F0] hover:bg-slate-50'
                }`}
              >
                <div className="font-bold text-sm text-[#1B365D]">Google Gemini</div>
                <div className="text-xs text-[#475569] mt-0.5">Google AI Studio Free Tier</div>
              </button>

              <button
                type="button"
                onClick={() => handleProviderChange('groq')}
                className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                  !isGemini
                    ? 'border-[#2E6B9E] bg-[#DBEAFE]/40 ring-2 ring-[#2E6B9E]/20'
                    : 'border-[#E2E8F0] hover:bg-slate-50'
                }`}
              >
                <div className="font-bold text-sm text-[#1B365D]">Groq Cloud</div>
                <div className="text-xs text-[#475569] mt-0.5">Llama 3.3 + Tự fallback 429</div>
              </button>
            </div>
          </div>

          {/* API Key Input (BYOK) */}
          {draft.mode === 'byok' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#475569]">
                  {isGemini ? 'Gemini API Key' : 'Groq API Key'}
                </label>
                <a
                  href={isGemini ? 'https://aistudio.google.com/apikey' : 'https://console.groq.com/keys'}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-medium text-[#2E6B9E] hover:underline"
                >
                  Lấy key miễn phí →
                </a>
              </div>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={activeKey}
                  onChange={(e) => {
                    const val = e.target.value;
                    setDraft((prev) =>
                      isGemini ? { ...prev, geminiApiKey: val } : { ...prev, groqApiKey: val }
                    );
                  }}
                  placeholder={isGemini ? 'AIzaSy...' : 'gsk_...'}
                  className="w-full pr-10 pl-3.5 py-2.5 text-sm rounded-lg border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#2E6B9E] font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowKey((prev) => !prev)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#475569] hover:text-[#1B365D] cursor-pointer"
                  aria-label={showKey ? 'Ẩn API Key' : 'Hiện API Key'}
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-[#475569]">
                Mẹo: Bạn có thể lưu cả hai key (Gemini và Groq) để chuyển đổi nhanh nếu một bên chạm giới hạn lượt miễn phí.
              </p>
            </div>
          )}

          {/* Model ID */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#475569]">
              Model ID (có thể chỉnh sửa)
            </label>
            <input
              type="text"
              value={activeModel}
              onChange={(e) => {
                const val = e.target.value;
                setDraft((prev) =>
                  isGemini ? { ...prev, geminiModel: val } : { ...prev, groqModel: val }
                );
              }}
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#2E6B9E] font-mono"
            />
            <div className="flex flex-wrap gap-1.5">
              {presets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() =>
                    setDraft((prev) =>
                      isGemini ? { ...prev, geminiModel: preset } : { ...prev, groqModel: preset }
                    )
                  }
                  className={`px-2.5 py-1 rounded-md text-xs font-mono border transition cursor-pointer ${
                    activeModel === preset
                      ? 'bg-[#1B365D] text-white border-[#1B365D]'
                      : 'bg-slate-50 text-[#475569] border-[#E2E8F0] hover:bg-slate-100'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {testResult && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                testResult.ok
                  ? 'bg-[#DCFCE7] border-emerald-200 text-[#15803D]'
                  : 'bg-[#FEE2E2] border-red-200 text-[#B91C1C]'
              }`}
            >
              {testResult.ok ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-[#E2E8F0] flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleTest}
            disabled={testing}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#2E6B9E] text-[#2E6B9E] hover:bg-[#DBEAFE]/50 text-sm font-semibold disabled:opacity-50 transition cursor-pointer"
          >
            {testing && <Loader2 className="w-4 h-4 animate-spin" />}
            Kiểm tra kết nối
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-[#475569] hover:bg-slate-200/60 transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-lg bg-[#1B365D] hover:bg-[#152a49] text-white text-sm font-semibold shadow-sm transition cursor-pointer"
            >
              Lưu cài đặt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
