import React from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Cloud, 
  Mail, 
  Plus, 
  LayoutGrid, 
  Columns, 
  CalendarDays, 
  ListTodo, 
  Target, 
  Grid2X2,
  Clock,
  Zap,
  Flame,
  Download
} from 'lucide-react';
import { CalendarViewType } from '../types';
import { formatVietnameseDate, formatDateToYYYYMMDD } from '../utils/dateUtils';
import { CatSticker } from './CatStickers';

interface HeaderProps {
  currentDate: Date;
  activeView: CalendarViewType;
  onSelectView?: (view: CalendarViewType) => void;
  setActiveView?: (view: CalendarViewType) => void;
  onPrevDate?: () => void;
  onNextDate?: () => void;
  onToday?: () => void;
  onNewEvent: () => void;
  onOpenAiSmartModal?: () => void;
  onOpenAiSchedule?: () => void;
  onOpenAiRoadmapModal?: () => void;
  onOpenAiRoadmap?: () => void;
  onOpenSyncModal?: () => void;
  onOpenSync?: () => void;
  onOpenEmailModal?: () => void;
  onOpenEmailCenter?: () => void;
  onOpenFreeTimeDrawer?: () => void;
  freeMinutesToday?: number;
  syncStatus?: 'synced' | 'syncing' | 'offline';
  pendingEmailCount?: number;
  userEmail?: string;
  selectedCatStickerId?: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentDate,
  activeView,
  onSelectView,
  setActiveView,
  onPrevDate,
  onNextDate,
  onToday,
  onNewEvent,
  onOpenAiSmartModal,
  onOpenAiSchedule,
  onOpenAiRoadmapModal,
  onOpenAiRoadmap,
  onOpenSyncModal,
  onOpenSync,
  onOpenEmailModal,
  onOpenEmailCenter,
  onOpenFreeTimeDrawer,
  freeMinutesToday = 240,
  syncStatus = 'synced',
  pendingEmailCount = 0,
  userEmail,
  selectedCatStickerId = 'snow_white_happy',
}) => {
  const handleSelectView = (v: CalendarViewType) => {
    if (onSelectView) onSelectView(v);
    else if (setActiveView) setActiveView(v);
  };

  const handlePrev = () => {
    if (onPrevDate) onPrevDate();
  };

  const handleNext = () => {
    if (onNextDate) onNextDate();
  };

  const handleToday = () => {
    if (onToday) onToday();
  };

  const handleOpenAi = () => {
    if (onOpenAiSmartModal) onOpenAiSmartModal();
    else if (onOpenAiSchedule) onOpenAiSchedule();
  };

  const handleOpenRoadmap = () => {
    if (onOpenAiRoadmapModal) onOpenAiRoadmapModal();
    else if (onOpenAiRoadmap) onOpenAiRoadmap();
  };

  const handleOpenSync = () => {
    if (onOpenSyncModal) onOpenSyncModal();
    else if (onOpenSync) onOpenSync();
  };

  const handleOpenEmail = () => {
    if (onOpenEmailModal) onOpenEmailModal();
    else if (onOpenEmailCenter) onOpenEmailCenter();
  };

  const formattedDate = formatVietnameseDate(formatDateToYYYYMMDD(currentDate));
  const freeHours = (freeMinutesToday / 60).toFixed(1);

  return (
    <header className="bg-white/90 backdrop-blur-md text-slate-800 border-b border-[#FFD1DA]/80 sticky top-0 z-30 shadow-[0_2px_12px_rgba(255,133,155,0.08)]">
      {/* Top tier navigation & quick actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & App Name */}
          <div className="flex items-center gap-3">
            <div 
              onClick={() => handleSelectView('widgets')}
              className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FF859B] via-[#FFA1B3] to-[#74C69D] p-0.5 shadow-md shadow-[#FFBAC7]/60 cursor-pointer group hover:scale-105 transition-transform overflow-hidden flex items-center justify-center bg-white"
              title="Mở Style Hub & Widget Mèo Kawaii"
            >
              <CatSticker stickerId={selectedCatStickerId || 'snow_white_happy'} size={36} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-[#FF758F] via-[#FF859B] to-[#3DAC78] bg-clip-text text-transparent">
                  SmartSchedule
                </span>
                <span className="px-2 py-0.5 text-[10px] font-extrabold tracking-wide bg-[#FFF0F3] text-[#B9375E] border border-[#FFD1DA] rounded-full flex items-center gap-1">
                  <span>🐾</span>
                  <span>KAWAII HUB</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">Lịch trình & 16 Sticker Mèo Dễ Thương</p>
            </div>
          </div>

          {/* Date navigator controls */}
          <div className="flex items-center gap-1 sm:gap-2 bg-[#FFF0F3]/80 p-1 rounded-xl border border-[#FFD1DA]">
            <button
              onClick={handleToday}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-white rounded-lg transition-all shadow-xs"
            >
              Hôm nay
            </button>
            <div className="flex items-center">
              <button
                onClick={handlePrev}
                aria-label="Lùi thời gian"
                className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-white rounded-lg transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 sm:px-3 text-xs sm:text-sm font-bold text-slate-800 min-w-[130px] sm:min-w-[170px] text-center truncate">
                {formattedDate}
              </span>
              <button
                onClick={handleNext}
                aria-label="Tiến thời gian"
                className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-white rounded-lg transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {/* Free Time Badge */}
            <button
              onClick={onOpenFreeTimeDrawer}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[#D8F3DC] border border-[#B7E4C7] hover:bg-[#B7E4C7]/70 rounded-xl text-[#2D6A4F] text-xs font-bold transition-all group"
            >
              <Clock className="w-3.5 h-3.5 text-[#3DAC78] group-hover:scale-110 transition-transform" />
              <span>Rảnh hôm nay: <strong>{freeHours}h</strong></span>
            </button>

            {/* Chế độ tập trung (Focus Mode) Button */}
            <button
              onClick={() => handleSelectView('focus')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-[#FF758F] to-[#FF859B] hover:from-[#B9375E] hover:to-[#FF758F] text-white rounded-xl text-xs sm:text-sm font-extrabold shadow-md shadow-[#FFD1DA] border border-[#FFBAC7] transition-all hover:scale-[1.02] active:scale-[0.98]"
              title="Kích hoạt Chế độ tập trung P1 và đồng hồ đếm ngược"
            >
              <Flame className="w-4 h-4 text-amber-200 fill-amber-200 animate-pulse" />
              <span className="hidden sm:inline">Chế độ tập trung</span>
              <span className="sm:hidden">Tập trung</span>
            </button>

            {/* Smart AI Actions Button */}
            <button
              onClick={handleOpenAi}
              className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-[#FF859B] via-[#FFA1B3] to-[#74C69D] hover:opacity-95 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-[#FFD1DA] border border-[#FFBAC7] transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4 text-white animate-pulse" />
              <span className="hidden sm:inline">Gợi ý Xếp lịch AI</span>
              <span className="sm:hidden">AI</span>
            </button>

            {/* AI Roadmap Generator */}
            <button
              onClick={handleOpenRoadmap}
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 bg-[#FFF0F3] hover:bg-[#FFE5E9] border border-[#FFD1DA] text-[#B9375E] rounded-xl text-xs font-bold transition-colors"
            >
              <Target className="w-4 h-4 text-[#FF859B]" />
              <span>Lập Lộ Trình</span>
            </button>

            {/* Email Notification Center button */}
            <button
              onClick={handleOpenEmail}
              title="Thông báo & Nhắc nhở Email"
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-[#FFF0F3] bg-white rounded-xl border border-[#FFD1DA] transition-colors shadow-xs"
            >
              <Mail className="w-4 h-4 text-slate-600" />
              {pendingEmailCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#FF758F] text-[10px] font-bold text-white rounded-full flex items-center justify-center animate-bounce">
                  {pendingEmailCount}
                </span>
              )}
            </button>

            {/* Multi-platform Sync button */}
            <button
              onClick={handleOpenSync}
              title="Đồng bộ hóa đa nền tảng"
              className="flex items-center gap-1.5 px-2.5 py-2 text-slate-600 hover:text-slate-900 hover:bg-[#D8F3DC]/60 bg-white rounded-xl border border-[#B7E4C7] transition-colors text-xs shadow-xs font-semibold"
            >
              <Cloud className={`w-4 h-4 ${syncStatus === 'syncing' ? 'text-[#FF758F] animate-spin' : syncStatus === 'synced' ? 'text-[#3DAC78]' : 'text-slate-400'}`} />
              <span className="hidden xl:inline">{syncStatus === 'synced' ? 'Đã đồng bộ' : syncStatus === 'syncing' ? 'Đang đồng bộ...' : 'Đồng bộ'}</span>
            </button>

            {/* New Event Button */}
            <button
              onClick={onNewEvent}
              className="p-2 sm:px-3.5 sm:py-2 bg-gradient-to-r from-[#3DAC78] to-[#52B788] hover:from-[#2D6A4F] hover:to-[#3DAC78] text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-[#95D5B2]/60 transition-all hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span className="hidden sm:inline">Tạo Lịch Trình</span>
            </button>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center justify-between py-2 border-t border-[#FFD1DA]/70 overflow-x-auto no-scrollbar gap-2">
          <div className="flex items-center gap-1 bg-[#FFF0F3]/90 p-1 rounded-xl border border-[#FFD1DA]">
            <button
              onClick={() => handleSelectView('widgets')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                activeView === 'widgets'
                  ? 'bg-gradient-to-r from-[#FF859B] to-[#FFA1B3] text-white shadow-xs'
                  : 'text-[#B9375E] hover:text-[#912444] bg-[#FFE5E9]/80 border border-[#FFD1DA]'
              }`}
            >
              <span>🐱</span>
              <span>Widget Mèo</span>
            </button>

            <button
              onClick={() => handleSelectView('day')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeView === 'day'
                  ? 'bg-white text-[#B9375E] shadow-xs border border-[#FFD1DA]'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Theo Ngày</span>
            </button>

            <button
              onClick={() => handleSelectView('week')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeView === 'week'
                  ? 'bg-white text-[#B9375E] shadow-xs border border-[#FFD1DA]'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Theo Tuần</span>
            </button>

            <button
              onClick={() => handleSelectView('month')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeView === 'month'
                  ? 'bg-white text-[#B9375E] shadow-xs border border-[#FFD1DA]'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Theo Tháng</span>
            </button>

            <button
              onClick={() => handleSelectView('agenda')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeView === 'agenda'
                  ? 'bg-white text-[#B9375E] shadow-xs border border-[#FFD1DA]'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ListTodo className="w-3.5 h-3.5" />
              <span>Danh Sách</span>
            </button>

            <button
              onClick={() => handleSelectView('roadmap')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeView === 'roadmap'
                  ? 'bg-[#FFE5E9] text-[#B9375E] border border-[#FFD1DA] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>Lộ Trình Mục Tiêu</span>
            </button>

            <button
              onClick={() => handleSelectView('matrix')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeView === 'matrix'
                  ? 'bg-[#D8F3DC] text-[#2D6A4F] border border-[#B7E4C7] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Grid2X2 className="w-3.5 h-3.5" />
              <span>Ma Trận Ưu Tiên</span>
            </button>

            <button
              onClick={() => handleSelectView('focus')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                activeView === 'focus'
                  ? 'bg-gradient-to-r from-[#FF758F] to-[#FF859B] text-white shadow-xs'
                  : 'text-[#B9375E] hover:text-[#912444] bg-[#FFE5E9]/70 hover:bg-[#FFE5E9]'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-[#FF758F]" />
              <span>Chế Độ Tập Trung</span>
            </button>
          </div>

          <div className="hidden md:flex items-center gap-3 text-xs text-slate-500 font-semibold">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF758F] inline-block"></span> P1 Khẩn cấp
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FFA1B3] inline-block"></span> P2 Quan trọng
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#95D5B2] inline-block"></span> P3 Trung bình
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#3DAC78] inline-block"></span> Giờ rảnh
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
