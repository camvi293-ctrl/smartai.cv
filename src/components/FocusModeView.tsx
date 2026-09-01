import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ScheduleEvent, 
  UserPreferences,
  AllowedAppOrWebsite,
  FocusGuardConfig
} from '../types';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  X, 
  Maximize2, 
  Minimize2, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  AlertCircle, 
  Flame, 
  Plus, 
  Tag, 
  Check, 
  ArrowLeft,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Unlock,
  ExternalLink,
  PlusCircle,
  Trash2,
  Settings,
  HelpCircle,
  FileText,
  Calculator,
  Laptop,
  Smartphone,
  AlertTriangle
} from 'lucide-react';
import { CatSticker, CAT_STICKERS } from './CatStickers';
import { formatDateToYYYYMMDD, formatMinutesToHumanReadable } from '../utils/dateUtils';

interface FocusModeViewProps {
  events: ScheduleEvent[];
  preferences: UserPreferences;
  currentDate: Date;
  onExitFocusMode: () => void;
  onToggleComplete: (eventId: string) => void;
  onOpenNewP1Modal: () => void;
}

const DEFAULT_ALLOWED_APPS: AllowedAppOrWebsite[] = [
  { id: 'docs', name: 'Google Docs / Sheets', category: 'work', icon: '📄', url: 'https://docs.google.com', isAllowed: true, description: 'Tài liệu, bảng tính phục vụ công việc' },
  { id: 'notion', name: 'Notion Workspace', category: 'work', icon: '📝', url: 'https://www.notion.so', isAllowed: true, description: 'Ghi chú tài liệu dự án' },
  { id: 'vscode', name: 'VS Code / Code Editor', category: 'work', icon: '💻', isAllowed: true, description: 'Trình soạn thảo mã nguồn & lập trình' },
  { id: 'figma', name: 'Figma Design', category: 'work', icon: '🎨', url: 'https://www.figma.com', isAllowed: true, description: 'Thiết kế giao diện UI/UX' },
  { id: 'github', name: 'GitHub / GitLab', category: 'work', icon: '🐙', url: 'https://github.com', isAllowed: true, description: 'Quản lý mã nguồn dự án' },
  { id: 'dict', name: 'Từ điển Oxford / Cambridge', category: 'study', icon: '📖', url: 'https://dictionary.cambridge.org', isAllowed: true, description: 'Tra cứu thuật ngữ ngoại ngữ' },
  { id: 'zoom', name: 'Zoom / Google Meet', category: 'communication', icon: '📹', isAllowed: true, description: 'Họp khẩn cấp nội bộ' },
];

const DEFAULT_BLOCKED_APPS: { name: string; icon: string; reason: string }[] = [
  { name: 'Facebook / Messenger', icon: '📘', reason: 'Mạng xã hội gây xao nhãng' },
  { name: 'TikTok', icon: '🎵', reason: 'Video ngắn tiêu tốn thời gian' },
  { name: 'YouTube', icon: '▶️', reason: 'Video giải trí đề xuất liên tục' },
  { name: 'Instagram', icon: '📸', reason: 'Bảng tin hình ảnh vô tận' },
  { name: 'X / Twitter', icon: '🐦', reason: 'Luồng tin tức liên tục' },
  { name: 'Shopee / Lazada / Tiki', icon: '🛍️', reason: 'Mua sắm & săn sale' },
  { name: 'Netflix / Xem phim', icon: '🍿', reason: 'Phim ảnh giải trí dài tập' },
  { name: 'Game Online / Steam', icon: '🎮', reason: 'Trò chơi điện tử' },
];

const FOCUS_GUARD_STORAGE_KEY = 'focus_guard_config_v1';

export const FocusModeView: React.FC<FocusModeViewProps> = ({
  events,
  preferences,
  currentDate,
  onExitFocusMode,
  onToggleComplete,
  onOpenNewP1Modal,
}) => {
  const dateStr = formatDateToYYYYMMDD(currentDate);

  // Filter all P1 events (Prioritize today's uncompleted P1s, then all uncompleted P1s, then all P1s)
  const p1Events = useMemo(() => {
    const todayP1s = events.filter(e => e.priority === 'P1' && e.startDate === dateStr);
    const uncompletedToday = todayP1s.filter(e => !e.isCompleted);
    const completedToday = todayP1s.filter(e => e.isCompleted);

    if (uncompletedToday.length > 0) return uncompletedToday;
    if (completedToday.length > 0) return completedToday;

    const otherUncompletedP1s = events.filter(e => e.priority === 'P1' && !e.isCompleted);
    if (otherUncompletedP1s.length > 0) return otherUncompletedP1s;

    return [];
  }, [events, dateStr]);

  // Current selected P1 task index
  const [selectedTaskIndex, setSelectedTaskIndex] = useState(0);
  const activeTask: ScheduleEvent | undefined = p1Events[selectedTaskIndex] || p1Events[0];

  // Timer State
  const [timerDurationMinutes, setTimerDurationMinutes] = useState(25);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompletedCelebrate, setIsCompletedCelebrate] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [ambientSound, setAmbientSound] = useState<'off' | 'rain' | 'waves' | 'cafe'>('off');

  // App Blocker & Whitelist Guard State
  const [guardConfig, setGuardConfig] = useState<FocusGuardConfig>(() => {
    try {
      const saved = localStorage.getItem(FOCUS_GUARD_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (_) {}
    return {
      strictLockMode: true,
      blockDistractionsAlert: true,
      autoFullscreen: false,
      allowedApps: DEFAULT_ALLOWED_APPS
    };
  });

  // Save Guard config
  useEffect(() => {
    try {
      localStorage.setItem(FOCUS_GUARD_STORAGE_KEY, JSON.stringify(guardConfig));
    } catch (_) {}
  }, [guardConfig]);

  // Modals & Panels in Focus View
  const [isWhitelistModalOpen, setIsWhitelistModalOpen] = useState(false);
  const [isOsGuideModalOpen, setIsOsGuideModalOpen] = useState(false);
  const [isScratchpadOpen, setIsScratchpadOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isDistractionAlertOpen, setIsDistractionAlertOpen] = useState(false);
  const [isExitConfirmationOpen, setIsExitConfirmationOpen] = useState(false);
  
  // Stats & Distraction Strikes
  const [distractionStrikes, setDistractionStrikes] = useState(0);
  const [lastDistractionTime, setLastDistractionTime] = useState<string | null>(null);

  // Scratchpad Notes State
  const [scratchpadNote, setScratchpadNote] = useState<string>(() => {
    return localStorage.getItem('focus_scratchpad_notes') || '';
  });

  // Calculator State
  const [calcInput, setCalcInput] = useState('0');
  const [calcPrev, setCalcPrev] = useState('');

  // Audio Context Ref for synthetic timer sound & ambient noise
  const audioContextRef = useRef<AudioContext | null>(null);
  const ambientGainRef = useRef<GainNode | null>(null);
  const ambientSourceRef = useRef<AudioNode | null>(null);

  // New App Input in Whitelist
  const [newAppName, setNewAppName] = useState('');
  const [newAppUrl, setNewAppUrl] = useState('');
  const [newAppCategory, setNewAppCategory] = useState<'work' | 'study' | 'tool'>('work');

  // Anti-Distraction & Tab-Switch Monitor
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isRunning && guardConfig.blockDistractionsAlert) {
        // User switched away from this focus screen
        setDistractionStrikes(prev => prev + 1);
        const nowStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setLastDistractionTime(nowStr);
      } else if (!document.hidden && isRunning && guardConfig.blockDistractionsAlert) {
        // User came back from other tabs/apps
        setIsDistractionAlertOpen(true);
        playWarningBeep();
      }
    };

    const handleWindowBlur = () => {
      if (isRunning && guardConfig.blockDistractionsAlert) {
        setDistractionStrikes(prev => prev + 1);
        const nowStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setLastDistractionTime(nowStr);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [isRunning, guardConfig.blockDistractionsAlert]);

  // Warn on page reload/close if timer is active
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isRunning) {
        e.preventDefault();
        e.returnValue = 'Bạn đang trong phiên tập trung P1. Rời khỏi sẽ làm gián đoạn tiến độ!';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isRunning]);

  // Adjust timer when preset changes
  const setPresetDuration = (minutes: number) => {
    setIsRunning(false);
    setTimerDurationMinutes(minutes);
    setTimeLeftSeconds(minutes * 60);
  };

  // Safe Exit Handler (with Strict Lock Check)
  const handleAttemptExit = () => {
    if (isRunning && guardConfig.strictLockMode) {
      setIsExitConfirmationOpen(true);
    } else {
      onExitFocusMode();
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isWhitelistModalOpen || isOsGuideModalOpen || isScratchpadOpen || isCalculatorOpen || isDistractionAlertOpen) {
          setIsWhitelistModalOpen(false);
          setIsOsGuideModalOpen(false);
          setIsScratchpadOpen(false);
          setIsCalculatorOpen(false);
          setIsDistractionAlertOpen(false);
        } else {
          handleAttemptExit();
        }
      }
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
        setIsRunning(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleAttemptExit, isWhitelistModalOpen, isOsGuideModalOpen, isScratchpadOpen, isCalculatorOpen, isDistractionAlertOpen]);

  // Play Sound Chimes
  const playChime = () => {
    if (!isSoundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15);
      osc.frequency.setValueAtTime(1174.66, ctx.currentTime + 0.3);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    } catch (err) {
      console.warn('Audio chime error:', err);
    }
  };

  const playWarningBeep = () => {
    if (!isSoundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.setValueAtTime(240, ctx.currentTime + 0.2);

      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (err) {
      console.warn('Audio warn error:', err);
    }
  };

  // Timer Tick Interval
  useEffect(() => {
    let interval: any = null;
    if (isRunning && timeLeftSeconds > 0) {
      interval = setInterval(() => {
        setTimeLeftSeconds(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            playChime();
            setIsCompletedCelebrate(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeftSeconds, isSoundEnabled]);

  // Ambient Noise Generator
  useEffect(() => {
    if (ambientSound === 'off') {
      if (ambientSourceRef.current) {
        try {
          (ambientSourceRef.current as any).stop?.();
          (ambientSourceRef.current as any).disconnect?.();
        } catch (_) {}
        ambientSourceRef.current = null;
      }
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = audioContextRef.current || new AudioCtx();
      audioContextRef.current = ctx;

      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      if (ambientSourceRef.current) {
        try {
          (ambientSourceRef.current as any).stop?.();
          (ambientSourceRef.current as any).disconnect?.();
        } catch (_) {}
      }

      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
        b6 = white * 0.115926;
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;
      noiseSource.loop = true;

      const filter = ctx.createBiquadFilter();
      if (ambientSound === 'rain') {
        filter.type = 'lowpass';
        filter.frequency.value = 1000;
      } else if (ambientSound === 'waves') {
        filter.type = 'bandpass';
        filter.frequency.value = 400;
      } else {
        filter.type = 'lowpass';
        filter.frequency.value = 600;
      }

      const gain = ctx.createGain();
      gain.gain.value = 0.15;
      ambientGainRef.current = gain;

      noiseSource.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noiseSource.start();
      ambientSourceRef.current = noiseSource;
    } catch (err) {
      console.warn('Ambient audio error:', err);
    }

    return () => {
      if (ambientSourceRef.current) {
        try {
          (ambientSourceRef.current as any).stop?.();
          (ambientSourceRef.current as any).disconnect?.();
        } catch (_) {}
      }
    };
  }, [ambientSound]);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  // Format MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const totalSeconds = Math.max(timerDurationMinutes * 60, 1);
  const progressPercent = Math.max(0, Math.min(100, ((totalSeconds - timeLeftSeconds) / totalSeconds) * 100));
  const strokeDashoffset = 440 - (440 * progressPercent) / 100;

  // Cat mascot sticker
  const companionStickerId = activeTask?.stickerId || preferences.selectedCatStickerId || 'snow_white_happy';

  // Motivational quote pool
  const motivationalQuotes = [
    'Chỉ tập trung vào duy nhất nhiệm vụ P1 này! Mọi app khác đã bị chặn! 🛡️',
    'Một nhiệm vụ quan trọng tại một thời điểm. Bạn đang làm rất tốt! ✨',
    'Sen ơi, mèo đang canh gác màn hình không cho mở app linh tinh đâu nhé! 🐾',
    'Hít sâu và hoàn thành xong công việc P1 này là bạn đã chiến thắng 80% ngày hôm nay! 🌿',
  ];
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  useEffect(() => {
    const quoteInterval = setInterval(() => {
      setCurrentQuoteIndex(prev => (prev + 1) % motivationalQuotes.length);
    }, 15000);
    return () => clearInterval(quoteInterval);
  }, []);

  const handleCompleteCurrentTask = () => {
    if (activeTask) {
      onToggleComplete(activeTask.id);
      playChime();
      setIsCompletedCelebrate(true);
      setTimeout(() => setIsCompletedCelebrate(false), 3000);
    }
  };

  // Whitelist Toggle Handlers
  const handleToggleAppAllowed = (appId: string) => {
    setGuardConfig(prev => ({
      ...prev,
      allowedApps: prev.allowedApps.map(app => 
        app.id === appId ? { ...app, isAllowed: !app.isAllowed } : app
      )
    }));
  };

  const handleAddNewApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppName.trim()) return;

    const newApp: AllowedAppOrWebsite = {
      id: `custom_${Date.now()}`,
      name: newAppName.trim(),
      category: newAppCategory,
      icon: newAppCategory === 'study' ? '📚' : newAppCategory === 'tool' ? '⚙️' : '💼',
      url: newAppUrl.trim() || undefined,
      isAllowed: true,
      isCustom: true,
      description: 'Ứng dụng tùy chỉnh do người dùng thêm vào'
    };

    setGuardConfig(prev => ({
      ...prev,
      allowedApps: [newApp, ...prev.allowedApps]
    }));

    setNewAppName('');
    setNewAppUrl('');
  };

  const handleDeleteCustomApp = (appId: string) => {
    setGuardConfig(prev => ({
      ...prev,
      allowedApps: prev.allowedApps.filter(a => a.id !== appId)
    }));
  };

  // Filter allowed apps list for quick launcher
  const activeAllowedApps = useMemo(() => {
    return guardConfig.allowedApps.filter(app => app.isAllowed);
  }, [guardConfig.allowedApps]);

  // Calculator basic logic
  const handleCalcClick = (val: string) => {
    if (val === 'C') {
      setCalcInput('0');
      setCalcPrev('');
    } else if (val === '=') {
      try {
        // Safe evaluation of simple math
        const sanitized = calcInput.replace(/[^0-9+\-*/.]/g, '');
        // eslint-disable-next-line no-eval
        const res = Function(`'use strict'; return (${sanitized})`)();
        setCalcPrev(`${calcInput} =`);
        setCalcInput(String(res));
      } catch (_) {
        setCalcInput('Lỗi');
      }
    } else {
      if (calcInput === '0' || calcInput === 'Lỗi') {
        setCalcInput(val);
      } else {
        setCalcInput(prev => prev + val);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-[#FFF0F3] via-[#FAF6F7] to-[#EAF7EF] text-slate-900 flex flex-col justify-between p-3 sm:p-6 overflow-y-auto backdrop-blur-xl animate-in fade-in duration-300">
      
      {/* Top Header & Distraction Shield Controls */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between gap-2 sm:gap-4 pb-3 sm:pb-4 border-b border-[#FFD1DA]/70">
        
        {/* Back / Exit Button */}
        <button
          onClick={handleAttemptExit}
          className="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-white/90 hover:bg-white text-slate-700 hover:text-slate-950 font-bold text-xs sm:text-sm rounded-2xl border border-[#FFD1DA] shadow-xs transition-all hover:scale-105"
          title="Thoát chế độ tập trung (Esc)"
        >
          <ArrowLeft className="w-4 h-4 text-[#B9375E]" />
          <span>Thoát</span>
          <span className="hidden sm:inline text-[10px] px-1.5 py-0.5 bg-[#FFF0F3] text-[#B9375E] rounded-md font-mono">ESC</span>
        </button>

        {/* Center Mode & Shield Status Indicator */}
        <div className="flex items-center gap-1.5 sm:gap-2 bg-white/95 px-3 py-1.5 rounded-full border border-[#FFBAC7] shadow-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF758F] animate-ping" />
          <span className="text-xs font-black tracking-wide text-[#B9375E] flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-[#FF758F] fill-[#FF758F]" />
            <span className="hidden sm:inline">CHẾ ĐỘ TẬP TRUNG P1</span>
            <span className="sm:hidden">P1 FOCUS</span>
          </span>

          <span className="text-slate-300">•</span>

          {/* Whitelist Guard Status Pill */}
          <button
            onClick={() => setIsWhitelistModalOpen(true)}
            className="flex items-center gap-1 text-[11px] font-extrabold text-[#2D6A4F] bg-[#D8F3DC] hover:bg-[#B7E4C7] px-2.5 py-0.5 rounded-full border border-[#B7E4C7] transition-all"
            title="Xem danh sách ứng dụng được phép và đang chặn"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#3DAC78]" />
            <span>Chặn App ({activeAllowedApps.length} cho phép)</span>
          </button>
        </div>

        {/* Quick Utilities & Sound Controls */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          
          {/* Quick Scratchpad Tool */}
          <button
            onClick={() => setIsScratchpadOpen(true)}
            className="p-2 text-slate-700 bg-white/90 hover:bg-white rounded-2xl border border-[#FFD1DA] transition-all shadow-xs flex items-center gap-1 text-xs font-bold"
            title="Sổ nháp ý tưởng nhanh cho P1"
          >
            <FileText className="w-4 h-4 text-[#B9375E]" />
            <span className="hidden lg:inline">Sổ nháp</span>
          </button>

          {/* Quick Calculator Tool */}
          <button
            onClick={() => setIsCalculatorOpen(true)}
            className="p-2 text-slate-700 bg-white/90 hover:bg-white rounded-2xl border border-[#FFD1DA] transition-all shadow-xs flex items-center gap-1 text-xs font-bold"
            title="Máy tính bỏ túi tích hợp"
          >
            <Calculator className="w-4 h-4 text-[#2D6A4F]" />
            <span className="hidden lg:inline">Máy tính</span>
          </button>

          {/* Ambient Sound Selector */}
          <div className="hidden md:flex items-center bg-white/80 border border-[#B7E4C7] rounded-2xl p-1 text-xs shadow-xs">
            <button
              onClick={() => setAmbientSound(prev => prev === 'off' ? 'rain' : prev === 'rain' ? 'waves' : prev === 'waves' ? 'cafe' : 'off')}
              className={`px-2.5 py-1 rounded-xl font-bold flex items-center gap-1.5 transition-colors ${
                ambientSound !== 'off' ? 'bg-[#D8F3DC] text-[#2D6A4F]' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Âm thanh thư giãn nền"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>
                {ambientSound === 'off' ? 'Tiếng ồn trắng' : ambientSound === 'rain' ? 'Tiếng mưa 🌧️' : ambientSound === 'waves' ? 'Sóng biển 🌊' : 'Quán Cafe ☕'}
              </span>
            </button>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => setIsSoundEnabled(!isSoundEnabled)}
            className="p-2 text-slate-600 hover:text-slate-900 bg-white/80 hover:bg-white rounded-2xl border border-[#FFD1DA] transition-colors shadow-xs"
            title={isSoundEnabled ? 'Tắt âm báo' : 'Bật âm báo'}
          >
            {isSoundEnabled ? <Volume2 className="w-4 h-4 text-[#3DAC78]" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>

          {/* Whitelist Settings Modal Trigger */}
          <button
            onClick={() => setIsWhitelistModalOpen(true)}
            className="p-2 text-[#B9375E] hover:text-[#912444] bg-[#FFF0F3] hover:bg-[#FFE5E9] rounded-2xl border border-[#FFD1DA] transition-all shadow-xs"
            title="Cài đặt chặn ứng dụng & danh sách trắng"
          >
            <Shield className="w-4 h-4" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2 text-slate-600 hover:text-slate-900 bg-white/80 hover:bg-white rounded-2xl border border-[#FFD1DA] transition-colors shadow-xs hidden sm:flex"
            title="Toàn màn hình"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Focus Canvas */}
      <main className="max-w-5xl w-full mx-auto my-auto py-3 sm:py-6 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 items-center">
        
        {/* Left Column: Circular Countdown Timer */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center text-center space-y-4 sm:space-y-5">
          
          {/* Preset Buttons */}
          <div className="flex items-center gap-1.5 bg-white/80 p-1.5 rounded-2xl border border-[#FFD1DA] shadow-xs">
            {[
              { label: '15p', min: 15 },
              { label: '25p Pomodoro', min: 25 },
              { label: '45p Tập trung sâu', min: 45 },
              { label: '60p', min: 60 }
            ].map(preset => (
              <button
                key={preset.min}
                onClick={() => setPresetDuration(preset.min)}
                className={`px-3 py-1 text-xs font-extrabold rounded-xl transition-all ${
                  timerDurationMinutes === preset.min
                    ? 'bg-gradient-to-r from-[#FF859B] to-[#FFA1B3] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-[#FFF0F3]'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Large Circular Countdown Timer */}
          <div className="relative w-60 h-60 sm:w-72 sm:h-72 flex items-center justify-center">
            
            {/* SVG Ring */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-[#FFD1DA]/60"
              />
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="url(#focusGradient)"
                strokeWidth="9"
                strokeDasharray="440"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-linear"
              />
              <defs>
                <linearGradient id="focusGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FF758F" />
                  <stop offset="50%" stopColor="#FF859B" />
                  <stop offset="100%" stopColor="#3DAC78" />
                </linearGradient>
              </defs>
            </svg>

            {/* Inner Center Timer Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
              <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-slate-900 select-none">
                {formatTime(timeLeftSeconds)}
              </span>
              <span className="text-xs font-bold text-slate-500 mt-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#3DAC78]" />
                <span>{isRunning ? 'Đang chặn app & tập trung' : timeLeftSeconds === 0 ? 'Đã hoàn tất!' : 'Sẵn sàng'}</span>
              </span>

              {/* +5m / -5m mini adjustments */}
              <div className="flex items-center gap-2 mt-3 opacity-80 hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setTimeLeftSeconds(prev => Math.max(prev - 300, 60))}
                  className="px-2 py-0.5 text-[11px] font-bold text-slate-500 hover:text-slate-800 bg-white/70 rounded-md border border-[#FFD1DA]"
                  title="Giảm 5 phút"
                >
                  -5m
                </button>
                <button
                  onClick={() => setTimeLeftSeconds(prev => prev + 300)}
                  className="px-2 py-0.5 text-[11px] font-bold text-slate-500 hover:text-slate-800 bg-white/70 rounded-md border border-[#FFD1DA]"
                  title="Tăng 5 phút"
                >
                  +5m
                </button>
              </div>
            </div>
          </div>

          {/* Play / Pause / Reset Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`px-8 py-3.5 rounded-2xl font-black text-base flex items-center gap-2.5 shadow-md transition-all hover:scale-105 active:scale-95 ${
                isRunning
                  ? 'bg-amber-400 hover:bg-amber-500 text-slate-950 shadow-amber-200'
                  : 'bg-gradient-to-r from-[#3DAC78] to-[#52B788] hover:from-[#2D6A4F] hover:to-[#3DAC78] text-white shadow-[#95D5B2]/60'
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-5 h-5 fill-current" />
                  <span>TẠM DỪNG</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" />
                  <span>{timeLeftSeconds === 0 ? 'LÀM LẠI' : 'BẮT ĐẦU TẬP TRUNG'}</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                setIsRunning(false);
                setTimeLeftSeconds(timerDurationMinutes * 60);
              }}
              className="p-3.5 bg-white/90 hover:bg-white text-slate-600 hover:text-slate-900 rounded-2xl border border-[#FFD1DA] transition-all hover:scale-105 shadow-xs"
              title="Đặt lại đồng hồ"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>

          {/* Distraction Strike Counter Alert Indicator */}
          {distractionStrikes > 0 && (
            <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-xs text-amber-800 font-bold">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Đã phát hiện {distractionStrikes} lần chuyển màn hình</span>
            </div>
          )}
        </div>

        {/* Right Column: The Current Active P1 Task & Allowed Apps Dock */}
        <div className="lg:col-span-6 space-y-4">
          
          {/* Active P1 Task Card */}
          {activeTask ? (
            <div className="bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-7 border-2 border-[#FF859B]/50 shadow-lg shadow-[#FF859B]/10 space-y-4 relative overflow-hidden">
              
              {/* P1 Badge & Task Switcher (if multiple P1s) */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-gradient-to-r from-[#FF758F] to-[#FF859B] text-white text-xs font-black rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
                    <Flame className="w-3.5 h-3.5 fill-white" />
                    <span>Ưu tiên P1 Khẩn Cấp</span>
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    {activeTask.startDate === dateStr ? 'Hôm nay' : activeTask.startDate}
                  </span>
                </div>

                {p1Events.length > 1 && (
                  <div className="flex items-center gap-1 bg-[#FFF0F3] px-2 py-1 rounded-xl border border-[#FFD1DA]">
                    <span className="text-[11px] font-bold text-[#B9375E]">
                      {selectedTaskIndex + 1}/{p1Events.length}
                    </span>
                    <div className="flex items-center">
                      <button
                        onClick={() => setSelectedTaskIndex(prev => Math.max(0, prev - 1))}
                        disabled={selectedTaskIndex === 0}
                        className="p-0.5 text-slate-500 disabled:opacity-30 hover:text-slate-900"
                        title="Công việc P1 trước"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setSelectedTaskIndex(prev => Math.min(p1Events.length - 1, prev + 1))}
                        disabled={selectedTaskIndex === p1Events.length - 1}
                        className="p-0.5 text-slate-500 disabled:opacity-30 hover:text-slate-900"
                        title="Công việc P1 tiếp theo"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Task Title & Companion Sticker */}
              <div className="flex items-start gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-[#FFF0F3] border border-[#FFD1DA] flex-shrink-0 flex items-center justify-center p-1 shadow-xs">
                  <CatSticker stickerId={companionStickerId} size={48} />
                </div>
                <div className="space-y-1 flex-1 min-w-0">
                  <h2 className={`text-xl sm:text-2xl font-black tracking-tight ${
                    activeTask.isCompleted ? 'line-through text-slate-400' : 'text-slate-900'
                  }`}>
                    {activeTask.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-600">
                    <span className="flex items-center gap-1 text-[#2D6A4F] bg-[#D8F3DC] px-2.5 py-0.5 rounded-lg border border-[#B7E4C7]">
                      <Clock className="w-3.5 h-3.5 text-[#3DAC78]" />
                      <span>{activeTask.startTime} - {activeTask.endTime} ({formatMinutesToHumanReadable(activeTask.durationMinutes)})</span>
                    </span>
                    {activeTask.location && (
                      <span className="text-slate-500">📍 {activeTask.location}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Task Description / Notes if any */}
              {activeTask.description ? (
                <div className="p-3 bg-[#FFF0F3]/60 rounded-2xl border border-[#FFD1DA] text-xs text-slate-700 leading-relaxed font-medium">
                  <p className="font-bold text-[#B9375E] mb-0.5">Ghi chú công việc:</p>
                  <p>{activeTask.description}</p>
                </div>
              ) : (
                <div className="p-2.5 bg-[#FAF6F7] rounded-2xl border border-slate-100 text-xs text-slate-500 italic">
                  Không có ghi chú bổ sung. Hãy hoàn thành trọn vẹn mục tiêu này!
                </div>
              )}

              {/* Action Buttons: Mark Complete or Add P1 */}
              <div className="pt-1 flex flex-col sm:flex-row items-center gap-2.5">
                <button
                  onClick={handleCompleteCurrentTask}
                  className={`w-full sm:flex-1 py-3 px-4 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
                    activeTask.isCompleted
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                      : 'bg-gradient-to-r from-[#FF859B] to-[#FFA1B3] hover:from-[#FF758F] hover:to-[#FF859B] text-white shadow-[#FFD1DA]'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{activeTask.isCompleted ? 'Đã hoàn thành (Bấm để mở lại)' : 'Hoàn thành công việc P1 này'}</span>
                </button>

                <button
                  onClick={onOpenNewP1Modal}
                  className="w-full sm:w-auto px-4 py-3 bg-white hover:bg-[#FFF0F3] text-[#B9375E] font-bold text-xs rounded-2xl border border-[#FFD1DA] transition-colors flex items-center justify-center gap-1.5"
                  title="Thêm công việc P1 khác"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm P1</span>
                </button>
              </div>

            </div>
          ) : (
            /* Empty P1 State */
            <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 border-2 border-dashed border-[#B7E4C7] shadow-xs text-center space-y-3">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#D8F3DC] flex items-center justify-center p-2 border-2 border-[#B7E4C7]">
                <CatSticker stickerId="proud_trophy" size={54} />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-800">Tuyệt vời! Không còn công việc P1 nào bị tồn đọng!</h3>
                <p className="text-xs text-slate-500 mt-0.5 max-w-sm mx-auto">
                  Bạn đã xử lý hết các nhiệm vụ khẩn cấp nhất, hoặc chưa đặt lịch cho công việc P1 hôm nay.
                </p>
              </div>
              <button
                onClick={onOpenNewP1Modal}
                className="px-4 py-2 bg-gradient-to-r from-[#3DAC78] to-[#52B788] hover:from-[#2D6A4F] hover:to-[#3DAC78] text-white font-extrabold text-xs rounded-2xl shadow-md shadow-[#95D5B2]/60 inline-flex items-center gap-2 transition-all hover:scale-105"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Thêm Công Việc P1 Để Tập Trung</span>
              </button>
            </div>
          )}

          {/* Whitelisted Allowed Apps Dock (Trình mở ứng dụng được phép) */}
          <div className="bg-white/90 rounded-3xl p-4 border border-[#B7E4C7] shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-[#1B4332] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#3DAC78]" />
                <span>Ứng dụng được phép dùng trong phiên này ({activeAllowedApps.length})</span>
              </span>
              <button
                onClick={() => setIsWhitelistModalOpen(true)}
                className="text-[11px] font-bold text-[#B9375E] hover:underline flex items-center gap-1"
              >
                <Settings className="w-3 h-3" />
                <span>Quản lý Whitelist</span>
              </button>
            </div>

            {/* Allowed Apps Chips */}
            <div className="flex flex-wrap gap-2">
              {activeAllowedApps.map(app => (
                <div
                  key={app.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#D8F3DC]/70 hover:bg-[#D8F3DC] border border-[#B7E4C7] rounded-xl text-xs font-bold text-[#1B4332] transition-colors"
                >
                  <span>{app.icon}</span>
                  <span>{app.name}</span>
                  {app.url && (
                    <a
                      href={app.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#2D6A4F] hover:text-[#1B4332] ml-0.5"
                      title={`Mở ${app.name} trong tab an toàn`}
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))}

              <button
                onClick={() => setIsWhitelistModalOpen(true)}
                className="flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-[#FFF0F3] border border-dashed border-[#FFD1DA] rounded-xl text-xs font-bold text-[#B9375E] transition-colors"
              >
                <Plus className="w-3 h-3" />
                <span>Thêm app cho phép...</span>
              </button>
            </div>

            <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
              <span>🚫 Các mạng xã hội & game khác đang bị giám sát và cảnh báo nếu mở.</span>
              <button
                onClick={() => setIsOsGuideModalOpen(true)}
                className="text-[#2D6A4F] font-bold hover:underline flex items-center gap-0.5"
              >
                <HelpCircle className="w-3 h-3" />
                <span>Khóa cấp Hệ Điều Hành (OS)?</span>
              </button>
            </div>
          </div>

          {/* Companion Cat Motivational Quote Bubble */}
          <div className="p-3.5 bg-gradient-to-r from-[#FFF0F3] via-[#FFE5E9] to-[#D8F3DC] rounded-3xl border border-[#FFD1DA] flex items-center gap-3 shadow-xs">
            <div className="w-10 h-10 rounded-2xl bg-white p-1 border border-[#FFD1DA] flex-shrink-0 flex items-center justify-center shadow-xs">
              <CatSticker stickerId={preferences.selectedCatStickerId || 'snow_white_happy'} size={34} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-[#B9375E] flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#FF859B]" />
                  <span>Lời nhắc từ Mèo cưng</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {currentQuoteIndex + 1}/{motivationalQuotes.length}
                </span>
              </div>
              <p className="text-xs text-slate-700 font-medium mt-0.5 leading-snug">
                {motivationalQuotes[currentQuoteIndex]}
              </p>
            </div>
          </div>

        </div>

      </main>

      {/* Footer hint */}
      <footer className="max-w-5xl w-full mx-auto pt-2 border-t border-[#FFD1DA]/50 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 font-medium gap-2">
        <div className="flex items-center gap-2">
          <span>🐾 Phím tắt: <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-[10px]">Space</kbd> Bắt đầu/Dừng, <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-[10px]">Esc</kbd> Thoát.</span>
        </div>
        <div className="text-[#2D6A4F] font-bold flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-[#3DAC78]" />
          <span>Hệ thống Giám Sát Chống Xao Nhãng đang BẬT</span>
        </div>
      </footer>

      {/* 1. Whitelist Management Modal (Quản lý ứng dụng cho phép & Chặn app) */}
      {isWhitelistModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border-2 border-[#FFD1DA] overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-[#FFF0F3] via-[#FFE3E7] to-[#D8F3DC] border-b border-[#FFD1DA] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-xs border border-[#FFD1DA]">
                  <Shield className="w-5 h-5 text-[#B9375E]" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Quản Lý Danh Sách Cho Phép (Whitelist)</h3>
                  <p className="text-xs text-slate-600 font-medium">Chỉ cho phép dùng các app/web này khi đang tập trung</p>
                </div>
              </div>
              <button
                onClick={() => setIsWhitelistModalOpen(false)}
                className="p-2 text-slate-500 hover:text-slate-800 rounded-xl hover:bg-white/80 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-5">
              
              {/* Security Guard Toggles */}
              <div className="bg-[#FFF0F3]/70 p-4 rounded-2xl border border-[#FFD1DA] space-y-3">
                <h4 className="text-xs font-black text-[#B9375E] uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Quy Tắc Giám Sát Tập Trung</span>
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-start gap-2.5 bg-white p-3 rounded-xl border border-[#FFD1DA] cursor-pointer hover:border-[#FF859B] transition-colors">
                    <input
                      type="checkbox"
                      checked={guardConfig.blockDistractionsAlert}
                      onChange={e => setGuardConfig(prev => ({ ...prev, blockDistractionsAlert: e.target.checked }))}
                      className="mt-1 rounded text-[#FF758F] focus:ring-[#FF758F]"
                    />
                    <div className="text-xs">
                      <span className="font-black text-slate-900 block">Cảnh báo khi chuyển Tab / App</span>
                      <span className="text-slate-500 text-[11px] leading-tight block mt-0.5">
                        Phát hiện và báo động nếu bạn rời màn hình để mở app khác
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 bg-white p-3 rounded-xl border border-[#FFD1DA] cursor-pointer hover:border-[#FF859B] transition-colors">
                    <input
                      type="checkbox"
                      checked={guardConfig.strictLockMode}
                      onChange={e => setGuardConfig(prev => ({ ...prev, strictLockMode: e.target.checked }))}
                      className="mt-1 rounded text-[#FF758F] focus:ring-[#FF758F]"
                    />
                    <div className="text-xs">
                      <span className="font-black text-slate-900 block">Khóa Nghiêm Ngặt (Strict Lock)</span>
                      <span className="text-slate-500 text-[11px] leading-tight block mt-0.5">
                        Yêu cầu xác nhận và phạt xao nhãng nếu cố tình thoát trước giờ
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Add Custom App Form */}
              <form onSubmit={handleAddNewApp} className="bg-[#FAF6F7] p-4 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                  <PlusCircle className="w-3.5 h-3.5 text-[#3DAC78]" />
                  <span>Thêm Ứng Dụng / Trang Web Được Phép Mới</span>
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Tên ứng dụng (vd: Trello, Canva...)"
                    value={newAppName}
                    onChange={e => setNewAppName(e.target.value)}
                    className="px-3 py-2 text-xs bg-white rounded-xl border border-slate-300 focus:outline-hidden focus:border-[#3DAC78]"
                    required
                  />
                  <input
                    type="url"
                    placeholder="Đường dẫn Web (Tùy chọn: https://...)"
                    value={newAppUrl}
                    onChange={e => setNewAppUrl(e.target.value)}
                    className="px-3 py-2 text-xs bg-white rounded-xl border border-slate-300 focus:outline-hidden focus:border-[#3DAC78]"
                  />
                  <div className="flex gap-2">
                    <select
                      value={newAppCategory}
                      onChange={e => setNewAppCategory(e.target.value as any)}
                      className="px-2.5 py-2 text-xs bg-white rounded-xl border border-slate-300 focus:outline-hidden focus:border-[#3DAC78]"
                    >
                      <option value="work">Công việc</option>
                      <option value="study">Học tập</option>
                      <option value="tool">Công cụ</option>
                    </select>
                    <button
                      type="submit"
                      className="flex-1 px-3 py-2 bg-[#3DAC78] hover:bg-[#2D6A4F] text-white text-xs font-extrabold rounded-xl transition-colors shadow-xs"
                    >
                      Thêm
                    </button>
                  </div>
                </div>
              </form>

              {/* Allowed Apps List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-[#2D6A4F] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#3DAC78]" />
                    <span>Danh Sách Ứng Dụng & Trang Web Trong Hệ Thống</span>
                  </h4>
                  <span className="text-[11px] text-slate-500 font-medium">Bật / Tắt để cho phép hoặc chặn</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {guardConfig.allowedApps.map(app => (
                    <div
                      key={app.id}
                      className={`p-3 rounded-2xl border flex items-center justify-between gap-2 transition-all ${
                        app.isAllowed 
                          ? 'bg-[#D8F3DC]/40 border-[#B7E4C7]' 
                          : 'bg-slate-50 border-slate-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-lg">{app.icon}</span>
                        <div className="min-w-0">
                          <span className={`text-xs font-bold block truncate ${app.isAllowed ? 'text-slate-900' : 'text-slate-500 line-through'}`}>
                            {app.name}
                          </span>
                          <span className="text-[10px] text-slate-500 block truncate">
                            {app.description || app.url || 'Công cụ hỗ trợ'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {app.isCustom && (
                          <button
                            onClick={() => handleDeleteCustomApp(app.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg"
                            title="Xóa ứng dụng này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleToggleAppAllowed(app.id)}
                          className={`px-2.5 py-1 rounded-xl text-[11px] font-extrabold transition-colors ${
                            app.isAllowed
                              ? 'bg-[#3DAC78] text-white'
                              : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                          }`}
                        >
                          {app.isAllowed ? 'Cho phép' : 'Đang chặn'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Blocked Apps Preview */}
              <div className="bg-rose-50/70 p-4 rounded-2xl border border-rose-200 space-y-2">
                <h4 className="text-xs font-black text-rose-800 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <span>Các Ứng Dụng Mặc Định Bị Chặn Hoàn Toàn Trong Phiên Tập Trung:</span>
                </h4>
                <div className="flex flex-wrap gap-2 pt-1">
                  {DEFAULT_BLOCKED_APPS.map(b => (
                    <span
                      key={b.name}
                      className="px-2.5 py-1 bg-white border border-rose-200 rounded-xl text-xs font-bold text-rose-900 flex items-center gap-1 shadow-2xs"
                      title={b.reason}
                    >
                      <span>{b.icon}</span>
                      <span>{b.name}</span>
                      <span className="text-[10px] text-rose-500 font-normal">({b.reason})</span>
                    </span>
                  ))}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => setIsOsGuideModalOpen(true)}
                className="text-xs text-[#2D6A4F] font-bold hover:underline flex items-center gap-1"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Cách kích hoạt khóa sâu cấp Hệ điều hành (OS)</span>
              </button>
              <button
                onClick={() => setIsWhitelistModalOpen(false)}
                className="px-5 py-2 bg-[#B9375E] hover:bg-[#912444] text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
              >
                Lưu & Đóng
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 2. OS Level Blocking Guidance Modal */}
      {isOsGuideModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border-2 border-[#B7E4C7] overflow-hidden">
            
            <div className="p-5 bg-gradient-to-r from-[#D8F3DC] to-[#B7E4C7] border-b border-[#95D5B2] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-xs">
                  <Laptop className="w-5 h-5 text-[#2D6A4F]" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#1B4332]">Khóa Ứng Dụng Cấp Hệ Điều Hành (OS)</h3>
                  <p className="text-xs text-[#2D6A4F] font-medium">Kết hợp cùng tính năng Focus Mode để đạt hiệu quả 100%</p>
                </div>
              </div>
              <button
                onClick={() => setIsOsGuideModalOpen(false)}
                className="p-2 text-slate-500 hover:text-slate-800 rounded-xl hover:bg-white/80 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-700 leading-relaxed">
              <p>
                Trình duyệt web cung cấp <strong>Hệ Thống Cảnh Báo Chống Xao Nhãng & Quản Lý Whitelist</strong>. Để chặn tuyệt đối các ứng dụng native (game, mạng xã hội) ở cấp độ máy tính / điện thoại, bạn có thể kích hoạt các tính năng tích hợp sẵn:
              </p>

              <div className="space-y-3">
                {/* Windows */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <h4 className="font-black text-slate-900 flex items-center gap-1.5 text-xs mb-1">
                    <Laptop className="w-4 h-4 text-blue-600" />
                    <span>Trên Windows 10 / 11: Focus Sessions (Phiên tập trung)</span>
                  </h4>
                  <p className="text-slate-600 text-[11px]">
                    Nhấn vào góc giờ bên phải màn hình taskbar &gt; Chọn <strong>Focus (Tập trung)</strong> để tự động tắt toàn bộ thông báo và chặn các ứng dụng gây xao nhãng.
                  </p>
                </div>

                {/* macOS & iOS */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <h4 className="font-black text-slate-900 flex items-center gap-1.5 text-xs mb-1">
                    <Smartphone className="w-4 h-4 text-purple-600" />
                    <span>Trên macOS / iPhone / iPad: Focus Filters & Screen Time</span>
                  </h4>
                  <p className="text-slate-600 text-[11px]">
                    Vào <strong>Cài đặt &gt; Tập trung (Focus) &gt; Chọn Chế độ Làm việc</strong>. Bạn có thể chọn cụ thể danh sách ứng dụng được phép gửi thông báo và mở trong phiên.
                  </p>
                </div>

                {/* Android */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <h4 className="font-black text-slate-900 flex items-center gap-1.5 text-xs mb-1">
                    <Smartphone className="w-4 h-4 text-green-600" />
                    <span>Trên Android: Digital Wellbeing (Sức khỏe Kỹ thuật số)</span>
                  </h4>
                  <p className="text-slate-600 text-[11px]">
                    Vào <strong>Cài đặt &gt; Sức khỏe kỹ thuật số &gt; Chế độ Tập trung (Focus Mode)</strong> &gt; Tích chọn các ứng dụng gây xao nhãng cần khóa (Facebook, TikTok...).
                  </p>
                </div>
              </div>

            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setIsOsGuideModalOpen(false)}
                className="px-5 py-2 bg-[#3DAC78] hover:bg-[#2D6A4F] text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
              >
                Đã Hiểu
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 3. In-App Focus Scratchpad Modal */}
      {isScratchpadOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#FFFDF6] rounded-3xl max-w-md w-full shadow-2xl border-2 border-[#FFD1DA] overflow-hidden flex flex-col">
            <div className="p-4 bg-[#FFF0F3] border-b border-[#FFD1DA] flex items-center justify-between">
              <span className="text-xs font-black text-[#B9375E] flex items-center gap-1.5">
                <FileText className="w-4 h-4" />
                <span>Sổ Nháp P1 Nhanh (Ghi chú không rời màn hình)</span>
              </span>
              <button
                onClick={() => {
                  localStorage.setItem('focus_scratchpad_notes', scratchpadNote);
                  setIsScratchpadOpen(false);
                }}
                className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4">
              <textarea
                value={scratchpadNote}
                onChange={e => {
                  setScratchpadNote(e.target.value);
                  localStorage.setItem('focus_scratchpad_notes', e.target.value);
                }}
                placeholder="Viết nhanh các ý tưởng hoặc kết quả xử lý công việc P1 tại đây..."
                rows={8}
                className="w-full text-xs font-mono text-slate-800 bg-transparent border-0 focus:outline-hidden resize-none leading-relaxed"
                autoFocus
              />
            </div>
            <div className="p-3 bg-[#FAF6F7] border-t border-slate-200 flex justify-between items-center text-[11px] text-slate-500">
              <span>Đã tự động lưu vào bộ nhớ cục bộ</span>
              <button
                onClick={() => {
                  localStorage.setItem('focus_scratchpad_notes', scratchpadNote);
                  setIsScratchpadOpen(false);
                }}
                className="px-3 py-1 bg-[#B9375E] text-white font-bold rounded-lg"
              >
                Xong
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. In-App Focus Calculator Modal */}
      {isCalculatorOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xs w-full shadow-2xl border-2 border-[#B7E4C7] overflow-hidden">
            <div className="p-3.5 bg-[#D8F3DC] border-b border-[#B7E4C7] flex items-center justify-between">
              <span className="text-xs font-black text-[#1B4332] flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-[#2D6A4F]" />
                <span>Máy Tính Tập Trung</span>
              </span>
              <button
                onClick={() => setIsCalculatorOpen(false)}
                className="p-1 text-slate-500 hover:text-slate-800 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div className="p-3 bg-slate-100 rounded-2xl text-right font-mono">
                <div className="text-[11px] text-slate-400 h-4">{calcPrev}</div>
                <div className="text-2xl font-black text-slate-900 truncate">{calcInput}</div>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {['C', '(', ')', '/'].map(btn => (
                  <button
                    key={btn}
                    onClick={() => handleCalcClick(btn)}
                    className="p-2.5 bg-slate-200 hover:bg-slate-300 rounded-xl text-xs font-black text-slate-700"
                  >
                    {btn}
                  </button>
                ))}
                {['7', '8', '9', '*'].map(btn => (
                  <button
                    key={btn}
                    onClick={() => handleCalcClick(btn)}
                    className={`p-2.5 rounded-xl text-xs font-black ${
                      btn === '*' ? 'bg-slate-200 hover:bg-slate-300 text-slate-700' : 'bg-slate-50 hover:bg-slate-100 text-slate-900 border border-slate-200'
                    }`}
                  >
                    {btn}
                  </button>
                ))}
                {['4', '5', '6', '-'].map(btn => (
                  <button
                    key={btn}
                    onClick={() => handleCalcClick(btn)}
                    className={`p-2.5 rounded-xl text-xs font-black ${
                      btn === '-' ? 'bg-slate-200 hover:bg-slate-300 text-slate-700' : 'bg-slate-50 hover:bg-slate-100 text-slate-900 border border-slate-200'
                    }`}
                  >
                    {btn}
                  </button>
                ))}
                {['1', '2', '3', '+'].map(btn => (
                  <button
                    key={btn}
                    onClick={() => handleCalcClick(btn)}
                    className={`p-2.5 rounded-xl text-xs font-black ${
                      btn === '+' ? 'bg-slate-200 hover:bg-slate-300 text-slate-700' : 'bg-slate-50 hover:bg-slate-100 text-slate-900 border border-slate-200'
                    }`}
                  >
                    {btn}
                  </button>
                ))}
                {['0', '.', '=', ' '].map(btn => {
                  if (btn === ' ') return <div key="blank" />;
                  return (
                    <button
                      key={btn}
                      onClick={() => handleCalcClick(btn)}
                      className={`p-2.5 rounded-xl text-xs font-black ${
                        btn === '=' ? 'bg-[#3DAC78] hover:bg-[#2D6A4F] text-white shadow-xs' : 'bg-slate-50 hover:bg-slate-100 text-slate-900 border border-slate-200'
                      }`}
                    >
                      {btn}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Distraction Alert Modal (Bắt quả tang rời tab / mở app khác) */}
      {isDistractionAlertOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in zoom-in-95 duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center space-y-4 border-2 border-amber-400 shadow-2xl">
            <div className="w-20 h-20 mx-auto rounded-full bg-amber-100 border-2 border-amber-300 flex items-center justify-center p-2 animate-bounce">
              <CatSticker stickerId="proud_trophy" size={64} />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 text-xs font-black rounded-full mb-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>CẢNH BÁO XAO NHÃNG #{distractionStrikes}</span>
              </div>
              <h3 className="text-lg font-black text-slate-900">Bắt quả tang sen chuyển sang ứng dụng khác! 🐾</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Hệ thống phát hiện bạn vừa rời khỏi màn hình lúc <strong>{lastDistractionTime}</strong>. Mọi ứng dụng ngoài Whitelist đều bị giới hạn trong phiên tập trung này.
              </p>
            </div>
            <div className="p-3 bg-[#FFF0F3] rounded-2xl border border-[#FFD1DA] text-xs font-bold text-[#B9375E]">
              💡 Hãy quay lại và hoàn tất nhiệm vụ P1: <br />
              <span className="text-slate-800 font-extrabold">{activeTask?.title || 'Công việc P1'}</span>
            </div>
            <button
              onClick={() => setIsDistractionAlertOpen(false)}
              className="w-full py-3 bg-[#3DAC78] hover:bg-[#2D6A4F] text-white text-xs font-extrabold rounded-2xl transition-colors shadow-md shadow-[#95D5B2]/60"
            >
              Tôi Đã Quay Lại & Tiếp Tục Tập Trung
            </button>
          </div>
        </div>
      )}

      {/* 6. Strict Lock Exit Confirmation Dialog */}
      {isExitConfirmationOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in zoom-in-95 duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 border-2 border-rose-300 shadow-2xl">
            <div className="w-16 h-16 mx-auto rounded-full bg-rose-100 border-2 border-rose-300 flex items-center justify-center p-2">
              <Lock className="w-8 h-8 text-[#B9375E]" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Bạn có chắc muốn từ bỏ phiên tập trung?</h3>
              <p className="text-xs text-slate-600 mt-1">
                Đồng hồ vẫn còn <strong>{formatTime(timeLeftSeconds)}</strong>. Rời đi lúc này sẽ làm gián đoạn chuỗi tập trung của bạn!
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setIsExitConfirmationOpen(false)}
                className="flex-1 py-2.5 bg-[#3DAC78] hover:bg-[#2D6A4F] text-white text-xs font-bold rounded-xl transition-colors"
              >
                Tiếp Tục Làm Việc
              </button>
              <button
                onClick={() => {
                  setIsExitConfirmationOpen(false);
                  onExitFocusMode();
                }}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
              >
                Vẫn Thoát
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Completion Celebratory Overlay */}
      {isCompletedCelebrate && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center animate-in fade-in zoom-in-90 duration-300">
          <div className="bg-white/95 backdrop-blur-md px-8 py-6 rounded-3xl border-2 border-[#3DAC78] shadow-2xl shadow-[#3DAC78]/30 flex flex-col items-center text-center space-y-3 pointer-events-auto">
            <div className="w-20 h-20 rounded-full bg-[#D8F3DC] border-2 border-[#74C69D] flex items-center justify-center p-2 animate-bounce">
              <CatSticker stickerId="proud_trophy" size={64} />
            </div>
            <h3 className="text-xl font-black text-[#1B4332]">XUẤT SẮC MEOW! 🎉</h3>
            <p className="text-xs font-bold text-slate-600">Bạn đã hoàn thành trọn vẹn phiên làm việc tập trung không bị xao nhãng!</p>
            <button
              onClick={() => setIsCompletedCelebrate(false)}
              className="px-5 py-1.5 bg-[#3DAC78] hover:bg-[#2D6A4F] text-white text-xs font-bold rounded-xl transition-colors"
            >
              Tiếp tục
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
