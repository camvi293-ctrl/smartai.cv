import React from 'react';
import { 
  Clock, 
  CheckCircle2, 
  Circle, 
  Mail, 
  MapPin, 
  Sparkles, 
  Plus, 
  Trash2, 
  Edit3, 
  Tag, 
  AlertCircle,
  ArrowUpRight
} from 'lucide-react';
import { ScheduleEvent, UserPreferences } from '../types';
import { 
  timeStringToMinutes, 
  minutesToTimeString, 
  calculateDayFreeTime, 
  formatDateToYYYYMMDD, 
  formatVietnameseDate,
  formatMinutesToHumanReadable 
} from '../utils/dateUtils';
import { CatSticker } from './CatStickers';

interface CalendarDayViewProps {
  currentDate: Date;
  events: ScheduleEvent[];
  preferences: UserPreferences;
  onToggleComplete: (id: string) => void;
  onEditEvent: (event: ScheduleEvent) => void;
  onDeleteEvent: (id: string) => void;
  onAddEventInSlot: (dateStr: string, startTime: string, endTime: string) => void;
}

export const CalendarDayView: React.FC<CalendarDayViewProps> = ({
  currentDate,
  events,
  preferences,
  onToggleComplete,
  onEditEvent,
  onDeleteEvent,
  onAddEventInSlot,
}) => {
  const dateStr = formatDateToYYYYMMDD(currentDate);
  const dayAnalysis = calculateDayFreeTime(dateStr, events, preferences);

  // Time range from wake to bed
  const startHour = 6;
  const endHour = 23;
  const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);

  // Day events sorted by start time
  const dayEvents = events
    .filter(e => e.startDate === dateStr)
    .sort((a, b) => timeStringToMinutes(a.startTime) - timeStringToMinutes(b.startTime));

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'P1':
        return {
          border: 'border-l-4 border-l-rose-500 border-rose-200/80 bg-rose-50/40 text-slate-800',
          badge: 'bg-rose-100 text-rose-700 border-rose-200 font-bold',
          dot: 'bg-rose-500',
        };
      case 'P2':
        return {
          border: 'border-l-4 border-l-pink-400 border-pink-200/80 bg-pink-50/30 text-slate-800',
          badge: 'bg-pink-100 text-pink-700 border-pink-200 font-bold',
          dot: 'bg-pink-400',
        };
      case 'P3':
        return {
          border: 'border-l-4 border-l-emerald-400 border-emerald-200/80 bg-emerald-50/30 text-slate-800',
          badge: 'bg-emerald-100 text-emerald-800 border-emerald-200 font-bold',
          dot: 'bg-emerald-500',
        };
      default:
        return {
          border: 'border-l-4 border-l-slate-300 border-slate-200 bg-slate-50/60 text-slate-700',
          badge: 'bg-slate-100 text-slate-600 border-slate-200',
          dot: 'bg-slate-400',
        };
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'work': return 'Công việc';
      case 'study': return 'Học tập';
      case 'meeting': return 'Cuộc họp';
      case 'health': return 'Sức khỏe';
      case 'roadmap': return 'Mục tiêu Lộ trình';
      case 'urgent': return 'Khẩn cấp';
      default: return 'Cá nhân';
    }
  };

  return (
    <div className="bg-white border border-rose-100 rounded-2xl p-4 sm:p-6 shadow-xs text-slate-800">
      {/* Day summary header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-rose-100 gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
            <span>{formatVietnameseDate(dateStr)}</span>
            {dateStr === formatDateToYYYYMMDD(new Date()) && (
              <span className="px-2 py-0.5 text-xs font-bold bg-pink-50 text-pink-700 border border-pink-200 rounded-full">
                Hôm nay
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tổng cộng {dayEvents.length} lịch hẹn • {dayAnalysis.totalFreeMinutes > 0 ? `${formatMinutesToHumanReadable(dayAnalysis.totalFreeMinutes)} rảnh` : 'Kín lịch'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onAddEventInSlot(dateStr, '09:00', '10:00')}
            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm sự kiện mới</span>
          </button>
        </div>
      </div>

      {/* Vertical Timeline View */}
      <div className="relative pl-12 sm:pl-16 space-y-4">
        {/* Hour Guide Lines */}
        <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-16 flex flex-col justify-between select-none pointer-events-none pr-3 text-right">
          {hours.map(hour => (
            <div key={hour} className="text-xs font-bold text-slate-400 font-mono">
              {String(hour).padStart(2, '0')}:00
            </div>
          ))}
        </div>

        {/* Free slots quick banners */}
        {dayAnalysis.freeSlots.length > 0 && (
          <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-3 mb-4">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-800 mb-2">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-600" />
                Các khoảng rảnh khả dụng hôm nay (Bấm để xếp việc nhanh):
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {dayAnalysis.freeSlots.map((slot, idx) => (
                <button
                  key={idx}
                  onClick={() => onAddEventInSlot(dateStr, slot.start, slot.end)}
                  className="px-2.5 py-1 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all group shadow-xs"
                >
                  <span>{slot.start} - {slot.end}</span>
                  <span className="text-[11px] text-emerald-600">({formatMinutesToHumanReadable(slot.durationMinutes)})</span>
                  <Plus className="w-3 h-3 text-emerald-600 group-hover:scale-125 transition-transform" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* List of Events for the day */}
        {dayEvents.length === 0 ? (
          <div className="py-10 text-center bg-pink-50/40 border border-dashed border-pink-200 rounded-3xl p-6">
            <div className="w-20 h-20 mx-auto mb-3 rounded-full overflow-hidden border-2 border-pink-200 bg-white shadow-xs flex items-center justify-center p-1">
              <CatSticker stickerId={preferences.selectedCatStickerId || 'snow_white_happy'} size={72} />
            </div>
            <p className="text-sm font-extrabold text-slate-800">Chưa có lịch trình nào cho ngày này meow~</p>
            <p className="text-xs text-slate-500 mt-1">Toàn bộ thời gian đang rảnh rỗi. Hãy để mèo nhắc bạn lên kế hoạch nhé!</p>
            <button
              onClick={() => onAddEventInSlot(dateStr, '09:00', '10:00')}
              className="mt-3.5 px-4 py-2 bg-gradient-to-r from-pink-500 via-rose-400 to-emerald-500 hover:from-pink-600 hover:to-emerald-600 text-white font-bold rounded-2xl text-xs inline-flex items-center gap-1.5 shadow-xs shadow-pink-200"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tạo lịch trình đầu tiên</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {dayEvents.map(event => {
              const priorityStyle = getPriorityStyle(event.priority);
              return (
                <div
                  key={event.id}
                  className={`p-4 rounded-2xl border ${priorityStyle.border} transition-all hover:shadow-md relative group ${
                    event.isCompleted ? 'opacity-60 bg-slate-100/70' : 'bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      {/* Completion toggle */}
                      <button
                        onClick={() => onToggleComplete(event.id)}
                        className="mt-0.5 text-slate-400 hover:text-emerald-600 transition-colors"
                        title={event.isCompleted ? 'Đánh dấu chưa xong' : 'Đánh dấu hoàn thành'}
                      >
                        {event.isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-400 hover:text-slate-600" />
                        )}
                      </button>

                      {/* Cat Sticker Icon */}
                      <div className="w-8 h-8 rounded-xl bg-pink-50/70 border border-pink-100 flex items-center justify-center flex-shrink-0 p-0.5" title="Sticker mèo">
                        <CatSticker stickerId={event.stickerId || preferences.selectedCatStickerId || 'snow_white_happy'} size={30} />
                      </div>

                      <div className="space-y-1 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className={`text-sm sm:text-base font-bold ${event.isCompleted ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                            {event.title}
                          </h4>

                          {/* Priority badge */}
                          <span className={`px-2 py-0.5 text-[10px] rounded-md border ${priorityStyle.badge}`}>
                            {event.priority}
                          </span>

                          {/* Category badge */}
                          <span className="px-2 py-0.5 text-[10px] font-medium bg-rose-50 text-slate-700 rounded-md border border-rose-100">
                            {getCategoryLabel(event.category)}
                          </span>

                          {/* AI generated indicator */}
                          {event.isAiGenerated && (
                            <span className="px-2 py-0.5 text-[10px] font-bold bg-pink-100 text-pink-700 border border-pink-200 rounded-md flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-pink-600" />
                              AI Xếp Lịch
                            </span>
                          )}

                          {/* Email reminder badge */}
                          {event.reminder?.email && (
                            <span className="px-2 py-0.5 text-[10px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md flex items-center gap-1">
                              <Mail className="w-3 h-3 text-emerald-600" />
                              Nhắc email ({event.reminder.minutesBefore}p)
                            </span>
                          )}
                        </div>

                        {/* Time & Duration */}
                        <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
                          <span className="flex items-center gap-1 text-slate-700 font-bold">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {event.startTime} - {event.endTime}
                          </span>
                          <span>•</span>
                          <span>{formatMinutesToHumanReadable(event.durationMinutes)}</span>
                          {event.location && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1 text-slate-500">
                                <MapPin className="w-3 h-3" />
                                {event.location}
                              </span>
                            </>
                          )}
                        </div>

                        {/* Description */}
                        {event.description && (
                          <p className="text-xs text-slate-600 line-clamp-2 pt-1">
                            {event.description}
                          </p>
                        )}

                        {/* AI Rationale if present */}
                        {event.aiRationale && (
                          <div className="mt-2 p-2 bg-pink-50/70 border border-pink-200 rounded-lg text-[11px] text-pink-900 flex items-start gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-pink-600 flex-shrink-0 mt-0.5" />
                            <span><strong>Lý do tối ưu:</strong> {event.aiRationale}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onEditEvent(event)}
                        className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteEvent(event.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Xóa sự kiện"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
