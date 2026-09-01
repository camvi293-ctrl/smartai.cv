import React, { useState } from 'react';
import { 
  Clock, 
  Sparkles, 
  TrendingUp, 
  Zap, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  Sun, 
  Moon, 
  Coffee,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { ScheduleEvent, UserPreferences } from '../types';
import { 
  calculateDayFreeTime, 
  calculateWeekFreeTime, 
  calculateMonthFreeTime, 
  formatDateToYYYYMMDD, 
  formatVietnameseDate, 
  formatMinutesToHumanReadable 
} from '../utils/dateUtils';

interface FreeTimeAnalyzerProps {
  currentDate: Date;
  events: ScheduleEvent[];
  preferences: UserPreferences;
  onSelectSlotToSchedule?: (dateStr: string, startTime: string, endTime: string) => void;
  onAddEventInSlot?: (dateStr: string, startTime: string, endTime: string) => void;
  onOpenAiSchedule?: () => void;
  onOpenAiOptimizer?: () => void;
  onClose?: () => void;
}

export const FreeTimeAnalyzer: React.FC<FreeTimeAnalyzerProps> = ({
  currentDate,
  events,
  preferences,
  onSelectSlotToSchedule,
  onAddEventInSlot,
  onOpenAiSchedule,
  onOpenAiOptimizer,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'day' | 'week' | 'month'>('day');

  const handleSelectSlot = (date: string, start: string, end: string) => {
    if (onAddEventInSlot) onAddEventInSlot(date, start, end);
    else if (onSelectSlotToSchedule) onSelectSlotToSchedule(date, start, end);
  };

  const handleOpenAi = () => {
    if (onOpenAiOptimizer) onOpenAiOptimizer();
    else if (onOpenAiSchedule) onOpenAiSchedule();
  };

  const dateStr = formatDateToYYYYMMDD(currentDate);
  const dayAnalysis = calculateDayFreeTime(dateStr, events, preferences);
  const weekAnalysis = calculateWeekFreeTime(currentDate, events, preferences);
  const monthAnalysis = calculateMonthFreeTime(currentDate.getFullYear(), currentDate.getMonth(), events, preferences);

  const dayFreeHours = (dayAnalysis.totalFreeMinutes / 60).toFixed(1);
  const dayBusyHours = (dayAnalysis.totalBusyMinutes / 60).toFixed(1);
  const weekFreeHours = (weekAnalysis.totalFreeMinutes / 60).toFixed(1);
  const monthFreeHours = (monthAnalysis.totalFreeMinutes / 60).toFixed(1);

  return (
    <div className="bg-white border border-rose-100 rounded-2xl p-5 shadow-xs text-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-rose-100 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-800 flex items-center gap-2">
              Phân Tích Quỹ Thời Gian Rảnh
              <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                Live Engine
              </span>
            </h3>
            <p className="text-xs text-slate-500">Đánh giá dung lượng thời gian rảnh Ngày • Tuần • Tháng để tối ưu lộ trình</p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center bg-rose-50/70 p-1 rounded-xl border border-rose-100 text-xs self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('day')}
            className={`px-3 py-1 rounded-lg font-bold transition-all ${
              activeTab === 'day' ? 'bg-white text-emerald-800 shadow-xs border border-emerald-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Hôm nay
          </button>
          <button
            onClick={() => setActiveTab('week')}
            className={`px-3 py-1 rounded-lg font-bold transition-all ${
              activeTab === 'week' ? 'bg-white text-emerald-800 shadow-xs border border-emerald-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tuần này
          </button>
          <button
            onClick={() => setActiveTab('month')}
            className={`px-3 py-1 rounded-lg font-bold transition-all ${
              activeTab === 'month' ? 'bg-white text-emerald-800 shadow-xs border border-emerald-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tháng này
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mt-4 space-y-4">
        {/* Metric Cards Row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-emerald-50/40 border border-emerald-200 rounded-xl p-3 text-center">
            <div className="text-xs text-emerald-800 font-semibold">Thời gian rảnh</div>
            <div className="text-xl sm:text-2xl font-black text-emerald-700 mt-0.5">
              {activeTab === 'day' ? `${dayFreeHours}h` : activeTab === 'week' ? `${weekFreeHours}h` : `${monthFreeHours}h`}
            </div>
            <div className="text-[11px] text-emerald-600 font-medium">Sẵn sàng phân bổ</div>
          </div>

          <div className="bg-pink-50/40 border border-pink-200 rounded-xl p-3 text-center">
            <div className="text-xs text-pink-800 font-semibold">Đã lên lịch</div>
            <div className="text-xl sm:text-2xl font-black text-pink-600 mt-0.5">
              {activeTab === 'day' 
                ? `${dayBusyHours}h` 
                : activeTab === 'week' 
                  ? `${(weekAnalysis.totalBusyMinutes / 60).toFixed(1)}h` 
                  : `${(monthAnalysis.totalBusyMinutes / 60).toFixed(1)}h`}
            </div>
            <div className="text-[11px] text-pink-600 font-medium">Lịch cố định & việc</div>
          </div>

          <div className="bg-amber-50/40 border border-amber-200 rounded-xl p-3 text-center">
            <div className="text-xs text-amber-800 font-semibold">Tỷ lệ lấp đầy</div>
            <div className="text-xl sm:text-2xl font-black text-amber-700 mt-0.5">
              {activeTab === 'day' ? `${dayAnalysis.utilizationRate}%` : activeTab === 'week' ? `${weekAnalysis.averageUtilization}%` : `${monthAnalysis.averageUtilization}%`}
            </div>
            <div className="text-[11px] text-amber-700 font-medium">
              {dayAnalysis.utilizationRate > 80 ? 'Khối lượng cao' : 'Mức độ cân bằng'}
            </div>
          </div>
        </div>

        {/* Dynamic Tab Body */}
        {activeTab === 'day' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Các khung giờ rảnh hôm nay ({dayAnalysis.freeSlots.length} khoảng trống)
              </span>
              <span className="text-xs text-slate-500 font-medium">Khung hoạt động: {preferences.wakeTime} - {preferences.bedTime}</span>
            </div>

            {dayAnalysis.freeSlots.length === 0 ? (
              <div className="p-4 bg-rose-50/50 border border-rose-100 rounded-xl text-center text-xs text-slate-600">
                Hôm nay lịch trình của bạn đã kín toàn bộ thời gian hoạt động. Hãy cân nhắc dời bớt việc không quan trọng!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {dayAnalysis.freeSlots.map((slot, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 bg-emerald-50/30 border border-emerald-200 hover:bg-emerald-50/70 rounded-xl transition-all group"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <div>
                        <div className="text-xs font-bold text-slate-800">
                          {slot.start} - {slot.end}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Thời lượng: <strong className="text-emerald-700 font-semibold">{formatMinutesToHumanReadable(slot.durationMinutes)}</strong>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleSelectSlot(dateStr, slot.start, slot.end)}
                      className="px-2.5 py-1 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors shadow-xs"
                    >
                      <span>Xếp việc</span>
                      <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'week' && (
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Phân bổ thời gian rảnh 7 ngày trong tuần
            </span>
            <div className="grid grid-cols-7 gap-1.5 pt-2">
              {weekAnalysis.days.map((d, i) => {
                const freeHrs = (d.totalFreeMinutes / 60).toFixed(1);
                const isSelected = d.date === dateStr;
                return (
                  <div
                    key={i}
                    className={`p-2 rounded-xl text-center border transition-all ${
                      isSelected 
                        ? 'bg-pink-50/80 border-pink-300 shadow-xs' 
                        : 'bg-white border-rose-100 hover:border-pink-200'
                    }`}
                  >
                    <div className="text-[10px] font-bold text-slate-500">{d.dayOfWeek}</div>
                    <div className="text-xs font-extrabold text-slate-800 mt-1">{d.date.split('-')[2]}</div>
                    <div className="mt-2 h-12 flex items-end justify-center bg-rose-50/60 rounded-md p-1">
                      <div
                        className="w-full bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-sm transition-all shadow-xs"
                        style={{ height: `${Math.min(100, Math.max(15, (d.totalFreeMinutes / 480) * 100))}%` }}
                        title={`Rảnh: ${freeHrs}h`}
                      />
                    </div>
                    <div className="text-[10px] font-bold text-emerald-700 mt-1">{freeHrs}h</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'month' && (
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Dung lượng tháng {currentDate.getMonth() + 1}/{currentDate.getFullYear()} ({monthAnalysis.daysCount} ngày)
            </span>
            <div className="bg-rose-50/30 p-3.5 rounded-xl border border-rose-100 space-y-2.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-600 font-medium">Tổng thời gian rảnh khả dụng:</span>
                <strong className="text-emerald-700 font-bold">{monthFreeHours} giờ</strong>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-600 font-medium">Thời gian đã khóa cho cam kết cố định:</span>
                <strong className="text-pink-700 font-bold">{(monthAnalysis.totalBusyMinutes / 60).toFixed(1)} giờ</strong>
              </div>
              <div className="w-full h-2.5 bg-rose-100 rounded-full overflow-hidden flex">
                <div 
                  className="bg-pink-400 h-full" 
                  style={{ width: `${monthAnalysis.averageUtilization}%` }}
                  title="Đã lên lịch"
                />
                <div 
                  className="bg-emerald-400 h-full" 
                  style={{ width: `${100 - monthAnalysis.averageUtilization}%` }}
                  title="Còn trống"
                />
              </div>
              <p className="text-[11px] text-slate-600 italic">
                💡 Với {monthFreeHours} giờ rảnh trong tháng này, bạn hoàn toàn có thể hoàn thành từ 1 đến 2 Mục tiêu Lộ trình (Roadmap) lớn!
              </p>
            </div>
          </div>
        )}

        {/* AI Action trigger */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gradient-to-r from-rose-50 via-pink-50/40 to-emerald-50 p-3 rounded-xl border border-rose-200">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-pink-600 flex-shrink-0" />
            <span className="text-xs text-slate-700 font-medium">
              Bạn có việc cần làm? Hãy để AI tự động sắp xếp vào slot trống tối ưu nhất.
            </span>
          </div>
          <button
            onClick={handleOpenAi}
            className="w-full sm:w-auto px-3.5 py-1.5 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-rose-200 flex-shrink-0"
          >
            <span>Tối Ưu Hóa Ngay</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
