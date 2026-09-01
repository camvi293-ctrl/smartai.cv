import React, { useState } from 'react';
import { Sparkles, ArrowRight, CornerDownLeft, Loader2, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ScheduleEvent, UserPreferences } from '../types';
import { formatDateToYYYYMMDD } from '../utils/dateUtils';

interface QuickAddBarProps {
  currentDate: Date;
  preferences: UserPreferences;
  onAddEvent: (event: Partial<ScheduleEvent>) => void;
  onOpenDetailedModal: (prefilled: Partial<ScheduleEvent>) => void;
}

export const QuickAddBar: React.FC<QuickAddBarProps> = ({
  currentDate,
  preferences,
  onAddEvent,
  onOpenDetailedModal,
}) => {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const samplePrompts = [
    'Họp tiến độ dự án 14h đến 15h30 chiều mai ưu tiên P1',
    'Tối thứ 5 20:00 - 21:30 học tiếng Anh IELTS',
    'Chạy bộ 45 phút lúc 6h sáng mai',
  ];

  const handleQuickAdd = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/ai/parse-quick-add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText.trim(),
          currentDate: formatDateToYYYYMMDD(currentDate),
        }),
      });

      if (!response.ok) throw new Error('Lỗi AI parse');
      const parsed = await response.json();

      onAddEvent({
        title: parsed.title || inputText.trim(),
        description: parsed.description || '',
        category: parsed.category || 'work',
        priority: parsed.priority || 'P2',
        eisenhower: parsed.priority === 'P1' ? 'do_first' : 'schedule',
        startDate: parsed.startDate || formatDateToYYYYMMDD(currentDate),
        startTime: parsed.startTime || '09:00',
        endDate: parsed.startDate || formatDateToYYYYMMDD(currentDate),
        endTime: parsed.endTime || '10:00',
        durationMinutes: parsed.durationMinutes || 60,
        location: parsed.location || '',
        isCompleted: false,
        isAiGenerated: true,
        reminder: {
          email: preferences.emailNotificationsEnabled,
          inApp: true,
          minutesBefore: 15,
          emailSent: false,
        }
      });

      setInputText('');
      confetti({
        particleCount: 35,
        spread: 50,
        origin: { y: 0.9 },
      });
    } catch (err) {
      console.error(err);
      // Fallback
      onOpenDetailedModal({
        title: inputText.trim(),
        startDate: formatDateToYYYYMMDD(currentDate),
        startTime: '09:00',
        endTime: '10:00',
        priority: 'P2',
      });
      setInputText('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white border border-rose-100 rounded-2xl p-3 sm:p-4 shadow-xs text-slate-800">
      <form onSubmit={handleQuickAdd} className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-pink-500">
            <Sparkles className="w-4 h-4" />
          </div>

          <input
            type="text"
            placeholder="Thêm nhanh bằng ngôn ngữ tự nhiên: 'Họp khách hàng 14h-15h chiều mai P1'..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isLoading}
            className="w-full pl-10 pr-24 py-2.5 bg-rose-50/40 border border-rose-200/90 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-pink-400 focus:bg-white transition-all shadow-inner"
          />

          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="px-3 py-1.5 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold rounded-lg text-xs flex items-center gap-1 transition-all shadow-xs disabled:opacity-40"
            >
              {isLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <span>Thêm AI</span>
                  <CornerDownLeft className="w-3 h-3 opacity-70" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Suggested Quick Prompts */}
      <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto text-[11px] text-slate-500">
        <span className="text-slate-400 flex-shrink-0 font-medium">Gợi ý mẫu:</span>
        {samplePrompts.map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setInputText(prompt)}
            className="px-2 py-0.5 bg-rose-50 hover:bg-pink-50 border border-rose-100 rounded-md text-slate-700 hover:text-pink-700 transition-colors whitespace-nowrap"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
};
