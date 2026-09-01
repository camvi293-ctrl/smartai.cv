import React from 'react';
import { 
  Plus, 
  Calendar as CalendarIcon, 
  Sparkles,
  ChevronRight 
} from 'lucide-react';
import { ScheduleEvent, UserPreferences } from '../types';
import { 
  getMonthDays, 
  formatDateToYYYYMMDD, 
  calculateDayFreeTime,
  calculateMonthFreeTime 
} from '../utils/dateUtils';

interface CalendarMonthViewProps {
  currentDate: Date;
  events: ScheduleEvent[];
  preferences: UserPreferences;
  onSelectDate: (date: Date) => void;
  onEditEvent: (event: ScheduleEvent) => void;
  onAddEventInSlot: (dateStr: string, startTime: string, endTime: string) => void;
}

export const CalendarMonthView: React.FC<CalendarMonthViewProps> = ({
  currentDate,
  events,
  preferences,
  onSelectDate,
  onEditEvent,
  onAddEventInSlot,
}) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthDays = getMonthDays(year, month);
  const todayStr = formatDateToYYYYMMDD(new Date());

  const firstDayIndex = new Date(year, month, 1).getDay();
  // Adjust so Monday is 0
  const leadingBlanks = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

  const monthStats = calculateMonthFreeTime(year, month, events, preferences);
  const monthFreeHours = (monthStats.totalFreeMinutes / 60).toFixed(1);

  const getPriorityDot = (p: string) => {
    switch (p) {
      case 'P1': return 'bg-rose-500';
      case 'P2': return 'bg-pink-400';
      case 'P3': return 'bg-emerald-400';
      default: return 'bg-slate-400';
    }
  };

  const dayNames = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'];

  return (
    <div className="bg-white border border-rose-100 rounded-2xl p-4 sm:p-6 shadow-xs text-slate-800">
      {/* Month Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 mb-4 border-b border-rose-100 gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800">
            Tháng {month + 1} / {year}
          </h2>
          <p className="text-xs text-slate-500">
            Tổng quan mật độ lịch trình và quỹ thời gian rảnh cả tháng
          </p>
        </div>

        <div className="flex items-center gap-3 bg-rose-50/50 px-3 py-1.5 rounded-xl border border-rose-100 text-xs">
          <div>
            <span className="text-slate-500">Thời gian rảnh tháng: </span>
            <strong className="text-emerald-700">{monthFreeHours} giờ</strong>
          </div>
          <span className="text-rose-200">|</span>
          <div>
            <span className="text-slate-500">Độ lấp đầy: </span>
            <strong className="text-pink-600">{monthStats.averageUtilization}%</strong>
          </div>
        </div>
      </div>

      {/* Weekday Names Header */}
      <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-slate-400 pb-2 border-b border-rose-100">
        {dayNames.map((d, i) => (
          <div key={i} className="py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1.5 pt-2">
        {/* Leading blanks */}
        {Array.from({ length: leadingBlanks }).map((_, i) => (
          <div key={`blank-${i}`} className="min-h-[90px] sm:min-h-[110px] bg-rose-50/20 rounded-xl border border-transparent opacity-30" />
        ))}

        {/* Real month days */}
        {monthDays.map((day, idx) => {
          const dateStr = formatDateToYYYYMMDD(day);
          const isToday = dateStr === todayStr;
          const dayEvents = events.filter(e => e.startDate === dateStr);
          const free = calculateDayFreeTime(dateStr, events, preferences);
          const freeHrs = (free.totalFreeMinutes / 60).toFixed(1);

          return (
            <div
              key={idx}
              onClick={() => onSelectDate(day)}
              className={`min-h-[90px] sm:min-h-[110px] p-2 rounded-xl border flex flex-col justify-between transition-all cursor-pointer group ${
                isToday 
                  ? 'bg-white border-pink-400 shadow-md shadow-pink-100 ring-2 ring-pink-200' 
                  : 'bg-rose-50/20 border-rose-100 hover:border-pink-200 hover:bg-white'
              }`}
            >
              {/* Day Top Bar */}
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold ${isToday ? 'text-pink-600 font-extrabold' : 'text-slate-700'}`}>
                  {day.getDate()}
                </span>
                <span className="text-[10px] text-emerald-600 font-mono font-medium">
                  {freeHrs}h rảnh
                </span>
              </div>

              {/* Day Events Badges */}
              <div className="space-y-1 my-1 overflow-hidden">
                {dayEvents.slice(0, 2).map(ev => (
                  <div
                    key={ev.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditEvent(ev);
                    }}
                    className={`px-1.5 py-0.5 rounded text-[10px] truncate flex items-center gap-1 font-medium ${
                      ev.isCompleted ? 'line-through opacity-50 bg-slate-100 text-slate-400' : 'bg-rose-50 border border-rose-100/80 text-slate-700 hover:text-slate-900'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${getPriorityDot(ev.priority)}`} />
                    <span className="truncate">{ev.title}</span>
                  </div>
                ))}
                {dayEvents.length > 2 && (
                  <div className="text-[10px] font-bold text-pink-600 pl-1">
                    +{dayEvents.length - 2} việc khác
                  </div>
                )}
              </div>

              {/* Quick Add Button */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Xem chi tiết</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddEventInSlot(dateStr, '09:00', '10:00');
                  }}
                  className="p-1 hover:text-emerald-600 hover:bg-rose-100 rounded"
                  title="Thêm sự kiện"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
