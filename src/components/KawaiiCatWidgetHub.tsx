import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  HelpCircle, 
  ChevronRight, 
  Plus, 
  Sparkles, 
  Check, 
  Play, 
  Pause, 
  RotateCcw, 
  Coffee, 
  Droplets, 
  Calendar as CalendarIcon,
  Star,
  Edit3,
  Heart,
  Palette,
  Smile,
  Tag,
  Flame
} from 'lucide-react';
import { ScheduleEvent, GoalRoadmap, UserPreferences, CalendarViewType } from '../types';
import { formatDateToYYYYMMDD } from '../utils/dateUtils';
import { CAT_STICKERS, CatSticker, CatStickerData } from './CatStickers';

// Asset references
const CUTE_CAT_MASCOT = '/src/assets/images/cute_cat_mascot_1787839179633.jpg';
const CUTE_CAT_FOCUS = '/src/assets/images/cute_cat_focus_1787839195072.jpg';

interface KawaiiCatWidgetHubProps {
  currentDate: Date;
  events: ScheduleEvent[];
  roadmaps: GoalRoadmap[];
  preferences: UserPreferences;
  onToggleComplete: (id: string) => void;
  onAddEvent: (event: Partial<ScheduleEvent>) => void;
  onOpenNewEventModal: (prefills?: any) => void;
  onOpenAiSmartModal: () => void;
  onOpenAiRoadmapModal: () => void;
  onSelectView: (view: CalendarViewType) => void;
  onUpdatePreferences?: (prefs: UserPreferences) => void;
}

export const KawaiiCatWidgetHub: React.FC<KawaiiCatWidgetHubProps> = ({
  currentDate,
  events,
  roadmaps,
  preferences,
  onToggleComplete,
  onAddEvent,
  onOpenNewEventModal,
  onOpenAiSmartModal,
  onOpenAiRoadmapModal,
  onSelectView,
  onUpdatePreferences,
}) => {
  // Top category tabs
  const [activeTab, setActiveTab] = useState<'widget' | 'sticker' | 'palette'>('widget');
  
  // Selected cat companion
  const currentStickerId = preferences.selectedCatStickerId || 'snow_white_happy';
  const activeStickerObj = CAT_STICKERS.find(s => s.id === currentStickerId) || CAT_STICKERS[14];

  // Selected cat mood quote
  const [catMessage, setCatMessage] = useState(activeStickerObj.moodQuote);

  // Notepad state
  const [newNoteTask, setNewNoteTask] = useState('');
  const [selectedStickerForNewTask, setSelectedStickerForNewTask] = useState<string>('snow_white_happy');

  // Countdown Widget State
  const [countdownTargetDate, setCountdownTargetDate] = useState('2026-06-12');
  const [countdownTitle, setCountdownTitle] = useState('Ngày thi & bảo vệ đồ án');
  const [isEditingCountdown, setIsEditingCountdown] = useState(false);

  // Focus Timer state (Pomodoro)
  const [focusSeconds, setFocusSeconds] = useState(25 * 60);
  const [isFocusActive, setIsFocusActive] = useState(false);
  const [totalFocusMinutes, setTotalFocusMinutes] = useState(0);

  // Water & Coffee tracker
  const [waterCups, setWaterCups] = useState(5);
  const [coffeeCups, setCoffeeCups] = useState(1);

  // Floating assistant widget state
  const [showCatBubble, setShowCatBubble] = useState(true);

  // Filtered sticker selection modal/drawer
  const [inspectSticker, setInspectSticker] = useState<CatStickerData | null>(null);

  // Today's date string
  const todayStr = formatDateToYYYYMMDD(currentDate);
  const todayEvents = events.filter(e => e.startDate === todayStr);
  const completedTodayCount = todayEvents.filter(e => e.isCompleted).length;
  const totalTodayCount = todayEvents.length || 4;

  const handleSelectCompanion = (sticker: CatStickerData) => {
    if (onUpdatePreferences) {
      onUpdatePreferences({
        ...preferences,
        selectedCatStickerId: sticker.id,
      });
    }
    setCatMessage(sticker.moodQuote);
    setShowCatBubble(true);
  };

  // Focus timer effect
  useEffect(() => {
    let interval: any = null;
    if (isFocusActive && focusSeconds > 0) {
      interval = setInterval(() => {
        setFocusSeconds(prev => prev - 1);
      }, 1000);
    } else if (focusSeconds === 0 && isFocusActive) {
      setIsFocusActive(false);
      setTotalFocusMinutes(prev => prev + 25);
      setCatMessage('Hoan hô sen! Bạn đã hoàn thành 1 phiên tập trung 25 phút meow! 🎉🐾');
      setShowCatBubble(true);
    }
    return () => clearInterval(interval);
  }, [isFocusActive, focusSeconds]);

  const toggleFocusTimer = () => {
    setIsFocusActive(!isFocusActive);
  };

  const resetFocusTimer = () => {
    setIsFocusActive(false);
    setFocusSeconds(25 * 60);
  };

  const formatTimerDisplay = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Calculate countdown days
  const calculateDaysLeft = () => {
    const target = new Date(countdownTargetDate);
    const now = new Date(todayStr);
    const diffTime = target.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'is today';
    if (diffDays > 0) return `Còn ${diffDays} ngày`;
    return `Đã qua ${Math.abs(diffDays)} ngày`;
  };

  // Add quick task to notepad
  const handleAddNotepadTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTask.trim()) return;
    onAddEvent({
      title: newNoteTask.trim(),
      startDate: todayStr,
      startTime: '10:00',
      endTime: '11:00',
      durationMinutes: 60,
      category: 'personal',
      priority: 'P2',
      eisenhower: 'schedule',
      stickerId: selectedStickerForNewTask,
    });
    setNewNoteTask('');
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 pb-24 text-slate-800 animate-in fade-in duration-300">
      
      {/* Top Navigation & Hub Header */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-5 border border-[#FFD1DA] shadow-xs space-y-4">
        
        {/* Style Hub Top Bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => onSelectView('day')}
            className="p-2 text-slate-700 hover:text-slate-950 hover:bg-[#FFF0F3] rounded-full transition-colors"
            title="Quay lại Lịch Ngày"
          >
            <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
          </button>
          
          <div className="text-center">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center justify-center gap-2">
              <span>Style Hub & 16 Mèo Cưng</span>
              <span className="text-sm">🐾</span>
            </h2>
            <p className="text-[11px] font-bold text-[#B9375E]">Bảng màu Hồng Phấn & Xanh Lá Pastel (Nyanza - Celadon - Mint - Jade)</p>
          </div>

          <button 
            onClick={() => onOpenAiSmartModal()}
            className="p-2 text-slate-700 hover:text-slate-950 hover:bg-[#D8F3DC] rounded-full transition-colors"
            title="Trợ giúp & Gợi ý AI"
          >
            <HelpCircle className="w-6 h-6 text-[#2D6A4F]" />
          </button>
        </div>

        {/* Category Pills (Theme | Widget | 16 Sticker | AI Smart) */}
        <div className="flex items-center justify-center gap-1.5 p-1 bg-gradient-to-r from-[#FFF0F3] via-[#FFE5E9] to-[#D8F3DC] rounded-full border border-[#FFD1DA]">
          <button
            onClick={() => setActiveTab('widget')}
            className={`flex-1 py-2 px-3 text-xs font-extrabold rounded-full transition-all text-center ${
              activeTab === 'widget'
                ? 'bg-white text-[#B9375E] shadow-xs border border-[#FFD1DA]'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Widget Mèo
          </button>
          <button
            onClick={() => setActiveTab('sticker')}
            className={`flex-1 py-2 px-3 text-xs font-extrabold rounded-full transition-all text-center flex items-center justify-center gap-1 ${
              activeTab === 'sticker'
                ? 'bg-white text-[#2D6A4F] shadow-xs border border-[#B7E4C7]'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Bộ 16 Sticker</span>
            <span className="text-[10px] bg-[#D8F3DC] text-[#2D6A4F] font-bold px-1.5 py-0.2 rounded-full">16</span>
          </button>
          <button
            onClick={() => onSelectView('day')}
            className="flex-1 py-2 px-3 text-xs font-bold rounded-full text-slate-500 hover:text-slate-800 transition-all text-center"
          >
            Lịch Ngày
          </button>
          <button
            onClick={() => onOpenAiRoadmapModal()}
            className="flex-1 py-2 px-3 text-xs font-bold rounded-full text-slate-500 hover:text-slate-800 transition-all text-center"
          >
            Lộ Trình
          </button>
        </div>

        {/* Companion Cat Quick Select Strip (16 Cats from the user image) */}
        <div className="pt-2 border-t border-[#FFD1DA]/60">
          <div className="flex items-center justify-between px-1 mb-2">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#FF859B]" />
              <span>Chọn Mèo Đồng Hành Của Bạn ({activeStickerObj.nameVi})</span>
            </span>
            <button
              onClick={() => setActiveTab('sticker')}
              className="text-[10px] text-[#B9375E] font-extrabold bg-[#FFF0F3] hover:bg-[#FFE5E9] px-2.5 py-0.5 rounded-full border border-[#FFD1DA] transition-colors"
            >
              Xem cả 16 mèo 🐾
            </button>
          </div>

          {/* Horizontal scrollable 16 cat avatars */}
          <div className="flex items-center gap-3 overflow-x-auto pb-3 pt-1 no-scrollbar">
            {CAT_STICKERS.map(s => {
              const isSelected = currentStickerId === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => handleSelectCompanion(s)}
                  className={`flex flex-col items-center justify-between p-3 rounded-2xl transition-all duration-200 flex-shrink-0 w-24 min-h-[135px] text-center font-kawaii cursor-pointer ${
                    isSelected
                      ? 'border-2 border-[#FF6B81] bg-[#FFF0F3] -translate-y-1 shadow-[0_6px_20px_rgba(255,107,129,0.22)]'
                      : 'bg-white border border-[#FFD1DA] hover:-translate-y-1 hover:border-[#FF6B81]/60 hover:bg-[#FFF0F3]/50 shadow-[0_4px_15px_rgba(255,107,129,0.10)]'
                  }`}
                  title={s.nameVi}
                >
                  <div className="w-14 h-14 flex items-center justify-center p-1 bg-white/80 rounded-xl border border-[#FFD1DA]/60">
                    <CatSticker catId={s.id} size={48} />
                  </div>
                  <div className="w-full mt-1.5">
                    <span className="text-[11px] font-extrabold text-slate-800 block truncate w-full text-center">
                      {s.tag}
                    </span>
                    <span className="text-[9px] text-[#FF6B81] font-bold block truncate">
                      #{s.index}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Companion Cat Card (Khu vực thông tin chính - Rounded 20px, 70x70px avatar, capsule tag, soft shadow) */}
          {showCatBubble && (
            <div className="mt-3 p-4 bg-gradient-to-r from-[#FFF0F3] via-[#FFEDF0] to-[#E8F5E9] rounded-[20px] border border-[#FFD1DA] flex items-center gap-4 shadow-[0_4px_15px_rgba(255,107,129,0.15)] animate-in fade-in">
              {/* Avatar avatar >= 70x70px with light pink border */}
              <div className="w-[72px] h-[72px] min-w-[72px] min-h-[72px] rounded-2xl bg-white border-2 border-[#FFD1DA] p-1 flex items-center justify-center shadow-xs flex-shrink-0">
                <CatSticker catId={currentStickerId} size={64} />
              </div>

              {/* Cat Information */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center flex-wrap gap-2">
                  <span className="font-kawaii font-extrabold text-slate-900 text-sm tracking-tight">
                    {activeStickerObj.nameVi}
                  </span>
                  {/* Capsule Tag */}
                  <span className="rounded-full px-3 py-0.5 text-[10px] font-extrabold bg-[#FFF0F3] text-[#FF6B81] border border-[#FFCCD5] shadow-xs">
                    {activeStickerObj.badgeText}
                  </span>
                </div>
                <p className="text-xs text-slate-700 font-semibold leading-relaxed line-clamp-2">
                  "{catMessage}"
                </p>
                <div className="text-[10px] text-slate-500 font-medium">
                  {activeStickerObj.description}
                </div>
              </div>

              <button
                onClick={() => setShowCatBubble(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-white/60 transition-colors self-start"
                title="Đóng thông báo"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </div>

      {/* VIEW TAB 2: FULL 16 CAT STICKERS GALLERY */}
      {activeTab === 'sticker' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-5 border border-[#FFD1DA] shadow-[0_4px_15px_rgba(255,107,129,0.15)] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2 font-kawaii">
                  <span>Bộ Sưu Tập 16 Chú Mèo Dễ Thương</span>
                  <span className="text-xs bg-[#FFF0F3] text-[#FF6B81] px-2.5 py-0.5 rounded-full font-bold border border-[#FFCCD5]">
                    Full 16 Stickers PNG
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  Nhấp vào bất kỳ chú mèo nào để đặt làm Mèo Đồng Hành hoặc dán sticker vào lịch trình!
                </p>
              </div>
              <button
                onClick={() => setActiveTab('widget')}
                className="text-xs font-bold text-[#FF6B81] hover:text-[#B9375E] bg-[#FFF0F3] px-3.5 py-1.5 rounded-full border border-[#FFCCD5] transition-colors"
              >
                Quay lại Widget
              </button>
            </div>

            {/* 4x4 Grid of 16 Cat Stickers - Increased height, hover & active states, rounded typography */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-2">
              {CAT_STICKERS.map((cat, idx) => {
                const isCurrentCompanion = currentStickerId === cat.id;
                return (
                  <div
                    key={cat.id}
                    onClick={() => {
                      setInspectSticker(cat);
                      handleSelectCompanion(cat);
                    }}
                    className={`p-3.5 rounded-[20px] transition-all duration-200 cursor-pointer flex flex-col items-center justify-between text-center min-h-[175px] relative group font-kawaii ${
                      isCurrentCompanion
                        ? 'border-2 border-[#FF6B81] bg-[#FFF0F3] -translate-y-1 shadow-[0_6px_20px_rgba(255,107,129,0.22)]'
                        : 'bg-white border border-[#FFD1DA] hover:-translate-y-1 hover:border-[#FF6B81]/60 hover:bg-[#FFF0F3]/40 shadow-[0_4px_15px_rgba(255,107,129,0.10)] hover:shadow-[0_8px_25px_rgba(255,107,129,0.20)]'
                    }`}
                  >
                    {/* Top badges */}
                    <div className="w-full flex items-center justify-between text-[10px] font-bold text-slate-400 mb-1">
                      <span className="font-mono">#{idx + 1}</span>
                      {isCurrentCompanion ? (
                        <span className="bg-[#FF6B81] text-white px-2 py-0.5 rounded-full font-black text-[9px] shadow-xs">
                          ACTIVE
                        </span>
                      ) : (
                        <span className="rounded-full px-2 py-0.5 text-[9px] font-extrabold bg-[#FFF0F3] text-[#FF6B81] border border-[#FFCCD5]">
                          {cat.tag}
                        </span>
                      )}
                    </div>

                    {/* Cat PNG Mascot Image (Natural contain, prominent size) */}
                    <div className="w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center my-1 transform group-hover:scale-105 transition-transform">
                      <CatSticker catId={cat.id} size={84} />
                    </div>

                    {/* Title & Tag */}
                    <div className="w-full space-y-0.5 mt-1">
                      <div className="text-xs font-extrabold text-slate-800 leading-tight line-clamp-1" title={cat.nameVi}>
                        {cat.nameVi}
                      </div>
                      <p className="text-[10px] text-slate-500 line-clamp-1 font-medium">
                        {cat.description}
                      </p>
                    </div>

                    {/* Hover select action */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectCompanion(cat);
                      }}
                      className={`mt-2 w-full py-1.5 rounded-full text-[10px] font-extrabold transition-all shadow-xs ${
                        isCurrentCompanion
                          ? 'bg-[#FF6B81] text-white'
                          : 'bg-[#FFF0F3] hover:bg-[#FF6B81] text-[#FF6B81] hover:text-white border border-[#FFCCD5]'
                      }`}
                    >
                      {isCurrentCompanion ? 'Đang Sử Dụng 🐾' : 'Chọn Mèo Này'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VIEW TAB 1: MAIN WIDGETS HUB */}
      {activeTab === 'widget' && (
        <>
          {/* SECTION 1: POPULAR (Khám Phá & Đếm Ngược & Mèo Xanh Bơ) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <span className="text-lg">🔥</span>
                <span>Popular</span>
              </h3>
              <button 
                onClick={() => onSelectView('roadmap')}
                className="text-emerald-700 hover:text-emerald-900 text-xs font-bold flex items-center gap-0.5"
              >
                <span>Xem tất cả</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* 2 Bento Grid Cards (Countdown + Matcha Green Peeking Cat) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Card 1: Countdown Widget */}
              <div className="bg-white rounded-3xl p-5 border border-[#FFD1DA] shadow-xs flex flex-col justify-between min-h-[190px] relative overflow-hidden group hover:border-[#FFBAC7] transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    Create a countdown
                  </span>
                  <button
                    onClick={() => setIsEditingCountdown(!isEditingCountdown)}
                    className="p-1 text-slate-400 hover:text-[#FF859B] rounded-lg transition-colors"
                    title="Chỉnh sửa đếm ngược"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {isEditingCountdown ? (
                  <div className="space-y-2 py-2">
                    <input
                      type="text"
                      value={countdownTitle}
                      onChange={(e) => setCountdownTitle(e.target.value)}
                      className="w-full text-xs p-2 bg-[#FFF0F3] border border-[#FFD1DA] rounded-xl text-slate-800 font-bold focus:outline-none"
                      placeholder="Tên sự kiện đếm ngược..."
                    />
                    <input
                      type="date"
                      value={countdownTargetDate}
                      onChange={(e) => setCountdownTargetDate(e.target.value)}
                      className="w-full text-xs p-2 bg-[#FFF0F3] border border-[#FFD1DA] rounded-xl text-slate-800 focus:outline-none font-mono"
                    />
                    <button
                      onClick={() => setIsEditingCountdown(false)}
                      className="w-full py-1.5 bg-gradient-to-r from-[#FF859B] to-[#FFA1B3] text-white rounded-xl text-xs font-bold shadow-xs"
                    >
                      Xong
                    </button>
                  </div>
                ) : (
                  <div className="my-auto py-3">
                    <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none">
                      {calculateDaysLeft()}
                    </div>
                    <p className="text-xs font-bold text-slate-500 mt-1 truncate">
                      {countdownTitle}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-slate-400 font-medium pt-2 border-t border-[#FFD1DA]/50">
                  <span className="flex items-center gap-1 font-mono">
                    <CalendarIcon className="w-3.5 h-3.5 text-[#FF859B]" />
                    {countdownTargetDate}
                  </span>
                  <span className="text-[10px] bg-[#FFF0F3] text-[#B9375E] px-2 py-0.5 rounded-full font-bold border border-[#FFD1DA]">
                    Mục tiêu ⭐
                  </span>
                </div>
              </div>

              {/* Card 2: Celadon Green Peeking Cat Mascot Card (Pastel Green #B7E4C7 - #95D5B2 from user image) */}
              <div className="bg-gradient-to-br from-[#B7E4C7] to-[#95D5B2] rounded-3xl p-5 border border-[#74C69D] shadow-xs flex flex-col justify-between min-h-[190px] relative overflow-hidden text-[#1B4332] group">
                {/* Top Star & Score Badge */}
                <div className="flex items-center justify-between z-10">
                  <div className="flex items-center gap-1 text-sm font-extrabold text-[#1B4332] bg-white/80 backdrop-blur-xs px-2.5 py-1 rounded-full border border-white/60 shadow-xs">
                    <span>1</span>
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                  </div>
                  <span className="text-[11px] font-bold bg-white/70 text-[#2D6A4F] px-2.5 py-1 rounded-full border border-[#B7E4C7]">
                    {activeStickerObj.nameVi} 🍀
                  </span>
                </div>

                {/* Cute Peeking Cat Illustration */}
                <div className="relative flex flex-col items-center justify-end mt-2 z-10">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-white shadow-md bg-white -mb-3 transform group-hover:scale-105 transition-transform flex items-center justify-center p-1">
                    <CatSticker stickerId={currentStickerId} size={88} />
                  </div>
                </div>

                {/* Bottom cute doodle curve */}
                <div className="text-center z-10 pt-2">
                  <span className="text-[11px] font-extrabold text-[#2D6A4F] bg-white/90 px-3 py-0.5 rounded-full shadow-xs">
                    Meow! Chúc bạn ngày an lành 🐾
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* SECTION 2: PLAN (Sổ Tay Kế Hoạch & Today Progress) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <span className="text-lg">📋</span>
                <span>Plan</span>
              </h3>
              <button 
                onClick={() => onSelectView('agenda')}
                className="text-emerald-700 hover:text-emerald-900 text-xs font-bold flex items-center gap-0.5"
              >
                <span>Xem lịch trình</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* 2 Plan Cards (Spiral Notepad + Today Circular Ring Checklist) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Card 1: Spiral Notepad Widget (Sổ Tay Kế Hoạch) */}
              <div className="bg-white rounded-3xl p-5 border border-[#FFD1DA] shadow-xs relative overflow-hidden flex flex-col justify-between min-h-[260px]">
                {/* Spiral binding rings at the top */}
                <div className="flex items-center justify-center gap-5 -mt-2 mb-3">
                  {[1, 2, 3, 4, 5].map(ring => (
                    <div key={ring} className="w-3.5 h-3.5 rounded-full border-2 border-slate-700 bg-[#FFF0F3] shadow-inner flex items-center justify-center">
                      <div className="w-1 h-1 rounded-full bg-slate-700"></div>
                    </div>
                  ))}
                </div>

                {/* Checklist items in Notepad with pink circle bullets and cat stickers */}
                <div className="space-y-2.5 flex-1">
                  {todayEvents.slice(0, 4).map((task) => (
                    <div
                      key={task.id}
                      onClick={() => onToggleComplete(task.id)}
                      className="flex items-center gap-2.5 group cursor-pointer text-xs"
                    >
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                        task.isCompleted
                          ? 'border-[#FF859B] bg-[#FF859B] text-white'
                          : 'border-[#FFA1B3] hover:border-[#FF758F] bg-white'
                      }`}>
                        {task.isCompleted && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>

                      {/* Small cat sticker badge if assigned */}
                      {task.stickerId ? (
                        <div className="w-5 h-5 flex-shrink-0">
                          <CatSticker stickerId={task.stickerId} size={20} />
                        </div>
                      ) : null}

                      <span className={`font-bold truncate flex-1 ${
                        task.isCompleted ? 'line-through text-slate-400' : 'text-slate-800'
                      }`}>
                        {task.title}
                      </span>
                    </div>
                  ))}

                  {todayEvents.length === 0 && (
                    <div className="space-y-2 text-slate-400 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full border-2 border-[#FFBAC7]"></div>
                        <span>Booking a meeting...</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full border-2 border-[#FFBAC7]"></div>
                        <span>Check and respond email...</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full border-2 border-[#FFBAC7]"></div>
                        <span>30 minutes of study...</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full border-2 border-[#FFBAC7]"></div>
                        <span>Have breakfast with cat</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Cute star doodle & squiggle decoration with sticker picker */}
                <div className="flex items-center justify-between pt-3 border-t border-dashed border-[#FFD1DA] mt-2">
                  <form onSubmit={handleAddNotepadTask} className="flex-1 flex items-center gap-1.5 mr-2">
                    <input
                      type="text"
                      placeholder="Thêm việc nhanh..."
                      value={newNoteTask}
                      onChange={(e) => setNewNoteTask(e.target.value)}
                      className="w-full text-xs px-2.5 py-1 bg-[#FFF0F3] border border-[#FFD1DA] rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white"
                    />
                    <button
                      type="submit"
                      className="p-1 bg-[#FF859B] text-white rounded-lg hover:bg-[#FF758F] transition-colors"
                      title="Thêm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </form>
                  <div className="flex items-center gap-1 text-amber-400">
                    <Star className="w-4 h-4 fill-amber-400 animate-bounce" />
                    <span className="text-[10px] font-bold text-slate-500">⭐</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Today Progress Card */}
              <div className="bg-white rounded-3xl p-5 border border-[#FFD1DA] shadow-xs relative overflow-hidden flex flex-col justify-between min-h-[260px]">
                {/* Top NEW badge */}
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 bg-gradient-to-r from-[#FF859B] to-[#FFA1B3] text-white text-[9px] font-black rounded-md tracking-wider uppercase shadow-xs">
                    NEW
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    Tiến độ ngày
                  </span>
                </div>

                {/* Circular Progress & Cat Headphone Avatar */}
                <div className="flex items-center justify-center my-2">
                  <div className="relative w-28 h-28 flex items-center justify-center">
                    {/* SVG Ring */}
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-[#FFE5E9]"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-[#FF859B]"
                        strokeDasharray={`${Math.round((completedTodayCount / Math.max(totalTodayCount, 1)) * 100)}, 100`}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>

                    {/* Center Cute Content with Badge */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-xs font-extrabold text-slate-800">Today</span>
                      <span className="text-xs font-mono font-bold text-[#B9375E]">
                        {completedTodayCount}/{totalTodayCount}
                      </span>
                      
                      {/* Plus button / Cat Avatar */}
                      <button
                        onClick={() => onOpenNewEventModal()}
                        className="mt-1 w-6 h-6 rounded-full bg-slate-900 hover:bg-[#FF859B] text-white flex items-center justify-center transition-colors shadow-xs"
                        title="Thêm lịch trình"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Checklist items with cute pink circles */}
                <div className="space-y-1.5 pt-2 border-t border-[#FFD1DA]/50">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700">Tỷ lệ hoàn thành</span>
                    <span className="font-mono font-bold text-[#2D6A4F]">
                      {Math.round((completedTodayCount / Math.max(totalTodayCount, 1)) * 100)}%
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">
                    {completedTodayCount === totalTodayCount && totalTodayCount > 0
                      ? 'Tuyệt vời meow! Bạn đã xong hết việc hôm nay! 🌟'
                      : `Còn ${totalTodayCount - completedTodayCount} việc cần làm hôm nay 🐾`}
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* SECTION 3: FOCUS (Tập Trung Cùng Mèo & Cà Phê Thư Giãn) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <span className="text-lg">⏱️</span>
                <span>Focus</span>
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                Đã tập trung: <strong className="text-[#2D6A4F] font-bold">{totalFocusMinutes}min</strong> hôm nay
              </span>
            </div>

            {/* 2 Focus Cards (Focus Timer with Headphone Cat + Coffee/Water Tracker) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Focus Card 1: Pomodoro Focus Timer */}
              <div className="bg-white rounded-3xl p-5 border border-[#FFD1DA] shadow-xs flex flex-col justify-between min-h-[210px] relative overflow-hidden group">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    Focus today
                  </span>
                  <span className="text-[10px] bg-[#D8F3DC] text-[#2D6A4F] px-2 py-0.5 rounded-full font-bold border border-[#B7E4C7]">
                    Pomodoro 25p 🎧
                  </span>
                </div>

                {/* Center: Cat with Headphones & Timer */}
                <div className="flex items-center gap-3 my-2">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-[#B7E4C7] bg-[#D8F3DC] shadow-xs flex-shrink-0 flex items-center justify-center p-1">
                    <CatSticker stickerId={currentStickerId} size={56} />
                  </div>

                  <div>
                    <div className="text-3xl font-black font-mono tracking-tight text-[#1B4332]">
                      {formatTimerDisplay(focusSeconds)}
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {isFocusActive ? 'Mèo đang canh bạn học nè...' : 'Sẵn sàng tập trung chưa sen?'}
                    </p>
                  </div>
                </div>

                {/* Timer Controls */}
                <div className="flex items-center gap-2 pt-2 border-t border-[#FFD1DA]/50">
                  <button
                    onClick={toggleFocusTimer}
                    className={`flex-1 py-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all shadow-xs ${
                      isFocusActive
                        ? 'bg-amber-400 hover:bg-amber-500 text-slate-950'
                        : 'bg-gradient-to-r from-[#3DAC78] to-[#74C69D] hover:from-[#2D6A4F] hover:to-[#3DAC78] text-white'
                    }`}
                  >
                    {isFocusActive ? (
                      <>
                        <Pause className="w-3.5 h-3.5" />
                        <span>Tạm Dừng</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5" />
                        <span>Bắt Đầu Focus</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={resetFocusTimer}
                    className="p-2 bg-[#FFF0F3] hover:bg-[#FFE5E9] text-slate-700 rounded-xl transition-colors border border-[#FFD1DA]"
                    title="Đặt lại"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onSelectView('focus')}
                    className="p-2 bg-gradient-to-r from-[#FF758F] to-[#FF859B] text-white rounded-xl transition-all hover:scale-105 shadow-xs"
                    title="Chế độ tập trung P1 chuyên sâu (Toàn màn hình & ẩn xao nhãng)"
                  >
                    <Flame className="w-3.5 h-3.5 fill-white" />
                  </button>
                </div>
              </div>

              {/* Focus Card 2: Coffee & Water Tracker */}
              <div className="bg-white rounded-3xl p-5 border border-[#FFD1DA] shadow-xs flex flex-col justify-between min-h-[210px] relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    Focus today
                  </span>
                  <span className="text-[10px] bg-[#FFF0F3] text-[#B9375E] px-2 py-0.5 rounded-full font-bold border border-[#FFD1DA]">
                    Nạp Năng Lượng ☕
                  </span>
                </div>

                {/* Coffee and Water meters */}
                <div className="space-y-3 my-2">
                  {/* Coffee tracker */}
                  <div className="flex items-center justify-between p-2.5 bg-amber-50/60 rounded-2xl border border-amber-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                        <Coffee className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800">Cà phê / Trà</div>
                        <div className="text-[10px] text-slate-500">{coffeeCups} ly hôm nay</div>
                      </div>
                    </div>
                    <button
                      onClick={() => setCoffeeCups(prev => prev + 1)}
                      className="px-2.5 py-1 bg-white hover:bg-amber-50 text-amber-800 text-xs font-bold rounded-xl border border-amber-200 shadow-xs transition-colors"
                    >
                      +1 Ly
                    </button>
                  </div>

                  {/* Water tracker */}
                  <div className="flex items-center justify-between p-2.5 bg-[#D8F3DC]/70 rounded-2xl border border-[#B7E4C7]">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-[#95D5B2] text-[#1B4332] flex items-center justify-center">
                        <Droplets className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800">Uống Nước</div>
                        <div className="text-[10px] text-[#2D6A4F]">{waterCups}/8 ly nước</div>
                      </div>
                    </div>
                    <button
                      onClick={() => setWaterCups(prev => Math.min(prev + 1, 8))}
                      className="px-2.5 py-1 bg-white hover:bg-[#D8F3DC] text-[#2D6A4F] text-xs font-bold rounded-xl border border-[#B7E4C7] shadow-xs transition-colors"
                    >
                      +1 Cốc
                    </button>
                  </div>
                </div>

                {/* Bottom note */}
                <div className="text-[10px] text-slate-400 italic text-center">
                  🐾 Uống đủ nước để mèo khen bạn nha~
                </div>
              </div>

            </div>
          </div>
        </>
      )}

      {/* Floating Mascot Bar (Matching the bottom "My widget" Duck Mascot in Reference Image, with our Active Cute Cat) */}
      <div className="fixed bottom-6 right-6 z-40 animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-end gap-2">
          {/* Mascot Action Bubble */}
          <div className="bg-slate-900 text-white rounded-full pl-3 pr-4 py-2 shadow-xl flex items-center gap-2.5 border-2 border-pink-200">
            {/* Active Cute cat sticker */}
            <div className="w-8 h-8 rounded-full overflow-hidden bg-white border border-pink-300 flex-shrink-0 -my-1 -ml-1 shadow-xs flex items-center justify-center p-0.5">
              <CatSticker stickerId={currentStickerId} size={28} />
            </div>
            
            <button
              onClick={() => onOpenAiSmartModal()}
              className="text-xs font-extrabold text-white flex items-center gap-1 hover:text-pink-300 transition-colors"
            >
              <span>My widget</span>
              <Sparkles className="w-3 h-3 text-emerald-300" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
