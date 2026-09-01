import React from 'react';
import { 
  Clock, 
  Plus, 
  Sparkles, 
  CheckCircle2, 
  Circle, 
  Mail,
  ChevronRight
} from 'lucide-react';
import { ScheduleEvent, UserPreferences } from '../types';
import { 
  getWeekDays, 
  formatDateToYYYYMMDD, 
  calculateDayFreeTime, 
  timeStringToMinutes,
  formatMinutesToHumanReadable 
} from '../utils/dateUtils';

interface CalendarWeekViewProps {
  currentDate: Date;
  events: ScheduleEvent[];
  preferences: UserPreferences;
  onSelectDate: (date: Date) => void;
  onToggleComplete: (id: string) => void;
  onEditEvent: (event: ScheduleEvent) => void;
  onAddEventInSlot: (dateStr: string, startTime: string, endTime: string) => void;
}

export const CalendarWeekView: React.FC<CalendarWeekViewProps> = ({
  currentDate,
  events,
  preferences,
  onSelectDate,
  onToggleComplete,
  onEditEvent,
  onAddEventInSlot,
}) => {
  const weekDays = getWeekDays(currentDate);
  const todayStr = formatDateToYYYYMMDD(new Date());

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case 'P1': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'P2': return 'bg-pink-100 text-pink-700 border-pink-200';
      case 'P3': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white border border-rose-100 rounded-2xl p-4 sm:p-6 shadow-xs text-slate-800">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 mb-4 border-b border-rose-100 gap-2">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-800">
            Lịch Trình 7 Ngày Trong Tuần
          </h2>
          <p className="text-xs text-slate-500">
            Theo dõi khối lượng công việc và khoảng thời gian rảnh giữa các ngày trong tuần
          </p>
        </div>
      </div>

      {/* 7 Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
        {weekDays.map((day, idx) => {
          const dateStr = formatDateToYYYYMMDD(day);
          const isToday = dateStr === todayStr;
          const dayName = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'][day.getDay()];
          const dayNumber = day.getDate();
          const monthNumber = day.getMonth() + 1;

          const dayEvents = events
            .filter(e => e.startDate === dateStr)
            .sort((a, b) => timeStringToMinutes(a.startTime) - timeStringToMinutes(b.startTime));

          const freeAnalysis = calculateDayFreeTime(dateStr, events, preferences);
          const freeHours = (freeAnalysis.totalFreeMinutes / 60).toFixed(1);

          return (
            <div
              key={idx}
              className={`rounded-xl border flex flex-col transition-all min-h-[380px] ${
                isToday 
                  ? 'bg-white border-pink-400 shadow-md shadow-pink-100/60 ring-2 ring-pink-200' 
                  : 'bg-rose-50/20 border-rose-100 hover:border-pink-200 hover:bg-white'
              }`}
            >
              {/* Day Header */}
              <div 
                onClick={() => onSelectDate(day)}
                className="p-3 border-b border-rose-100 cursor-pointer hover:bg-rose-50/60 rounded-t-xl transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${isToday ? 'text-pink-600' : 'text-slate-500'}`}>
                    {dayName}
                  </span>
                  {isToday && (
                    <span className="w-2 h-2 rounded-full bg-pink-500 animate-ping" />
                  )}
                </div>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-lg font-black text-slate-800">{dayNumber}</span>
                  <span className="text-xs text-slate-400">/ Th.{monthNumber}</span>
                </div>
                
                {/* Free time pill */}
                <div className="mt-1.5 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Rảnh: <strong className="text-emerald-600">{freeHours}h</strong></span>
                  <span className="text-slate-400 font-mono">{dayEvents.length} việc</span>
                </div>
              </div>

              {/* Day Events Container */}
              <div className="p-2 flex-1 space-y-2 overflow-y-auto max-h-[320px]">
                {dayEvents.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center py-6 text-center">
                    <span className="text-[11px] text-slate-400 font-medium">Trống lịch</span>
                    <button
                      onClick={() => onAddEventInSlot(dateStr, '09:00', '10:00')}
                      className="mt-2 p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 rounded-lg text-xs transition-colors border border-rose-200"
                      title="Thêm việc vào ngày này"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  dayEvents.map(ev => (
                    <div
                      key={ev.id}
                      onClick={() => onEditEvent(ev)}
                      className={`p-2 rounded-lg border text-left cursor-pointer transition-all hover:scale-[1.02] ${
                        ev.isCompleted ? 'opacity-50 bg-slate-50 border-slate-200' : 'bg-white border-rose-100 hover:border-pink-300 shadow-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] font-mono font-bold text-slate-500">
                          {ev.startTime} - {ev.endTime}
                        </span>
                        <span className={`px-1.5 py-0.2 text-[9px] font-bold rounded border ${getPriorityBadgeClass(ev.priority)}`}>
                          {ev.priority}
                        </span>
                      </div>

                      <div className="flex items-start gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleComplete(ev.id);
                          }}
                          className="mt-0.5 text-slate-400 hover:text-emerald-600 flex-shrink-0"
                        >
                          {ev.isCompleted ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Circle className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <span className={`text-xs font-semibold line-clamp-2 ${ev.isCompleted ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                          {ev.title}
                        </span>
                      </div>

                      {ev.isAiGenerated && (
                        <div className="mt-1 flex items-center gap-1 text-[9px] text-pink-700 bg-pink-50 px-1 py-0.5 rounded border border-pink-100">
                          <Sparkles className="w-2.5 h-2.5 text-pink-500" />
                          <span>AI xếp</span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Day bottom action */}
              <div className="p-2 border-t border-rose-100 bg-rose-50/30 rounded-b-xl">
                <button
                  onClick={() => onAddEventInSlot(dateStr, '09:00', '10:00')}
                  className="w-full py-1 text-[11px] font-semibold text-slate-500 hover:text-rose-700 hover:bg-rose-100/80 rounded-lg flex items-center justify-center gap-1 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  <span>Thêm</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
