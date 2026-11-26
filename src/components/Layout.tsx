import React from 'react';
import {
  FileText,
  Flame,
  GraduationCap,
  Grid2x2,
  Layers,
  Settings,
  Sparkles,
} from 'lucide-react';
import { AiSettings, StudyStreak, TabId } from '../types';

interface LayoutProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  progressPercent: number;
  streak: StudyStreak;
  aiSettings: AiSettings;
  onOpenSettings: () => void;
  children: React.ReactNode;
}

const NAV_ITEMS: { id: TabId; label: string; shortLabel: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'hub', label: '12 Chế độ học', shortLabel: '12 Chế độ', icon: Grid2x2 },
  { id: 'patterns', label: 'Mẫu câu Form Ảnh 4', shortLabel: 'Mẫu câu', icon: Layers },
  { id: 'grammar', label: 'Ngữ pháp trọng tâm', shortLabel: 'Ngữ pháp', icon: GraduationCap },
  { id: 'situations', label: 'Kho tình huống mẫu', shortLabel: 'Tình huống', icon: FileText },
  { id: 'practice', label: 'Luyện viết & Chấm AI', shortLabel: 'Chấm AI', icon: Sparkles },
];

export const Layout: React.FC<LayoutProps> = ({
  activeTab,
  onTabChange,
  progressPercent,
  streak,
  aiSettings,
  onOpenSettings,
  children,
}) => {
  const currentTab = NAV_ITEMS.find((item) => item.id === activeTab) ?? NAV_ITEMS[0];
  const isAiReady =
    aiSettings.mode === 'proxy' ||
    (aiSettings.provider === 'gemini' ? Boolean(aiSettings.geminiApiKey.trim()) : Boolean(aiSettings.groqApiKey.trim()));

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-[#1F2933]">
      {/* Fixed Left Sidebar (Desktop) */}
      <aside className="hidden md:flex md:fixed md:inset-y-0 md:left-0 md:w-[240px] md:flex-col bg-[#1B365D] text-white z-30 shadow-lg">
        <div className="px-5 py-6 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#2E6B9E] flex items-center justify-center font-extrabold text-sm tracking-tight shadow-inner">
              ASG
            </div>
            <div>
              <h1 className="text-base font-bold leading-tight tracking-tight">Situation English</h1>
              <p className="text-[11px] text-slate-300">4 Kỹ năng · Ưu tiên Viết</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1.5" aria-label="Điều hướng chính">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = item.id === activeTab;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#2E6B9E] text-white shadow-sm'
                    : 'text-slate-200 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate text-left">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-3">
          <div className="rounded-lg bg-white/10 p-3 text-xs space-y-1.5">
            <div className="flex items-center justify-between text-slate-200">
              <span>Tiến độ tổng thể</span>
              <span className="font-bold text-white">{progressPercent}%</span>
            </div>
            <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#4ADE80] rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenSettings}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-medium transition cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Settings className="w-3.5 h-3.5" />
              Cài đặt AI ({aiSettings.provider === 'gemini' ? 'Gemini' : 'Groq'})
            </span>
            <span
              className={`w-2 h-2 rounded-full ${isAiReady ? 'bg-[#4ADE80]' : 'bg-amber-400'}`}
              title={isAiReady ? 'Đã sẵn sàng' : 'Chưa có API Key'}
            />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="md:pl-[240px] pb-20 md:pb-8 min-h-screen flex flex-col">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-[#E2E8F0]">
          <div className="max-w-[1040px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
            <div className="min-w-0 flex items-center gap-3">
              <div className="md:hidden w-8 h-8 rounded-lg bg-[#1B365D] text-white flex items-center justify-center font-bold text-xs shrink-0">
                ASG
              </div>
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-bold text-[#1B365D] truncate">
                  {currentTab.label}
                </h2>
                <p className="text-xs text-[#475569] hidden sm:block">
                  Nghe – Nói – Đọc – Viết &amp; Action – Saying – Goal Classroom Situations
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <div
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[#FEF3C7] text-[#B45309] text-xs font-semibold border border-amber-200"
                title="Chuỗi ngày học liên tiếp"
              >
                <Flame className="w-3.5 h-3.5" />
                <span>{streak.count} ngày</span>
              </div>

              <div
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F5F7FA] border border-[#E2E8F0] text-xs font-semibold text-[#1B365D]"
                title="Hoàn thành từ vựng, ngữ pháp & bài luyện tập"
              >
                <span>Tiến độ: {progressPercent}%</span>
              </div>

              <button
                type="button"
                onClick={onOpenSettings}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E2E8F0] bg-white hover:bg-[#F5F7FA] text-xs sm:text-sm font-medium text-[#1B365D] transition cursor-pointer"
              >
                <Settings className="w-4 h-4 text-[#2E6B9E]" />
                <span className="hidden sm:inline">Cài đặt AI</span>
                <span
                  className={`w-2 h-2 rounded-full ${isAiReady ? 'bg-[#15803D]' : 'bg-[#B45309]'}`}
                />
              </button>
            </div>
          </div>
        </header>

        {/* Centered Container */}
        <main className="flex-1 w-full max-w-[1040px] mx-auto px-4 sm:px-6 py-6">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-[#E2E8F0] grid grid-cols-5 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]"
        aria-label="Điều hướng di động"
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === activeTab;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center justify-center py-2 px-1 text-[11px] font-medium transition cursor-pointer ${
                isActive ? 'text-[#1B365D] bg-[#DBEAFE]/40 font-semibold' : 'text-[#475569]'
              }`}
            >
              <Icon className={`w-4 h-4 mb-0.5 ${isActive ? 'text-[#2E6B9E]' : ''}`} />
              <span className="truncate max-w-full">{item.shortLabel}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
