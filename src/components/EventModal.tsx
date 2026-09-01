import React, { useState, useEffect } from 'react';
import { 
  X, 
  Clock, 
  Calendar, 
  Tag, 
  Flag, 
  Mail, 
  MapPin, 
  FileText, 
  Repeat, 
  Sparkles, 
  Send,
  AlertCircle
} from 'lucide-react';
import { 
  ScheduleEvent, 
  EventCategory, 
  PriorityLevel, 
  EisenhowerQuadrant, 
  RecurrenceType,
  UserPreferences 
} from '../types';
import { 
  timeStringToMinutes, 
  minutesToTimeString, 
  formatDateToYYYYMMDD, 
  formatMinutesToHumanReadable 
} from '../utils/dateUtils';
import { CAT_STICKERS, CatSticker } from './CatStickers';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (eventData: Partial<ScheduleEvent>) => void;
  editingEvent?: ScheduleEvent | null;
  initialDate?: string;
  initialStartTime?: string;
  initialEndTime?: string;
  initialQuadrant?: EisenhowerQuadrant;
  preferences: UserPreferences;
  onSendTestEmailReminder: (eventData: any) => void;
}

export const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingEvent,
  initialDate,
  initialStartTime,
  initialEndTime,
  initialQuadrant,
  preferences,
  onSendTestEmailReminder,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<EventCategory>('work');
  const [priority, setPriority] = useState<PriorityLevel>('P2');
  const [eisenhower, setEisenhower] = useState<EisenhowerQuadrant>('schedule');
  const [startDate, setStartDate] = useState(formatDateToYYYYMMDD(new Date()));
  const [startTime, setStartTime] = useState('09:00');
  const [endDate, setEndDate] = useState(formatDateToYYYYMMDD(new Date()));
  const [endTime, setEndTime] = useState('10:00');
  const [location, setLocation] = useState('');
  const [recurrence, setRecurrence] = useState<RecurrenceType>('none');
  const [stickerId, setStickerId] = useState<string>('snow_white_happy');
  const [emailReminder, setEmailReminder] = useState(true);
  const [reminderMinutes, setReminderMinutes] = useState(15);
  const [isTestEmailSent, setIsTestEmailSent] = useState(false);

  useEffect(() => {
    if (editingEvent) {
      setTitle(editingEvent.title);
      setDescription(editingEvent.description || '');
      setCategory(editingEvent.category);
      setPriority(editingEvent.priority);
      setEisenhower(editingEvent.eisenhower);
      setStartDate(editingEvent.startDate);
      setStartTime(editingEvent.startTime);
      setEndDate(editingEvent.endDate || editingEvent.startDate);
      setEndTime(editingEvent.endTime);
      setLocation(editingEvent.location || '');
      setRecurrence(editingEvent.recurrence);
      setStickerId(editingEvent.stickerId || 'snow_white_happy');
      setEmailReminder(editingEvent.reminder?.email ?? true);
      setReminderMinutes(editingEvent.reminder?.minutesBefore ?? 15);
    } else {
      const today = formatDateToYYYYMMDD(new Date());
      setTitle('');
      setDescription('');
      setCategory('work');
      setPriority(initialQuadrant === 'do_first' ? 'P1' : 'P2');
      setEisenhower(initialQuadrant || 'schedule');
      setStartDate(initialDate || today);
      setStartTime(initialStartTime || '09:00');
      setEndDate(initialDate || today);
      setEndTime(initialEndTime || '10:00');
      setLocation('');
      setRecurrence('none');
      setStickerId(preferences.selectedCatStickerId || 'snow_white_happy');
      setEmailReminder(preferences.emailNotificationsEnabled);
      setReminderMinutes(15);
    }
    setIsTestEmailSent(false);
  }, [editingEvent, isOpen, initialDate, initialStartTime, initialEndTime, initialQuadrant, preferences]);

  if (!isOpen) return null;

  const durationMins = Math.max(15, timeStringToMinutes(endTime) - timeStringToMinutes(startTime));

  const handleStartTimeChange = (newStart: string) => {
    setStartTime(newStart);
    // Keep 1 hour duration by default if end is before start
    const startM = timeStringToMinutes(newStart);
    const endM = timeStringToMinutes(endTime);
    if (endM <= startM) {
      setEndTime(minutesToTimeString(startM + 60));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      ...(editingEvent ? { id: editingEvent.id } : {}),
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
      eisenhower,
      startDate,
      startTime,
      endDate: endDate || startDate,
      endTime,
      durationMinutes: durationMins,
      isCompleted: editingEvent ? editingEvent.isCompleted : false,
      location: location.trim(),
      recurrence,
      stickerId,
      reminder: {
        email: emailReminder,
        inApp: true,
        minutesBefore: reminderMinutes,
        emailSent: false,
      },
    });

    onClose();
  };

  const handleTestEmail = () => {
    onSendTestEmailReminder({
      eventTitle: title || 'Lịch hẹn mới',
      eventTime: `${startTime} - ${endTime}`,
      eventDate: startDate,
      priority,
      notes: description,
      toEmail: preferences.userEmail,
    });
    setIsTestEmailSent(true);
    setTimeout(() => setIsTestEmailSent(false), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-rose-100 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-8 text-slate-800">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-rose-100 bg-rose-50/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-pink-100 border border-pink-200 text-pink-700">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                {editingEvent ? 'Chỉnh Sửa Lịch Trình' : 'Tạo Lịch Trình Mới'}
              </h3>
              <p className="text-xs text-slate-500">Thiết lập độ ưu tiên, khung giờ và thông báo email</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-rose-100/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tên công việc / Sự kiện <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="VD: Họp báo cáo tiến độ dự án, Học tiếng Anh..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-rose-50/30 border border-rose-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-pink-500 focus:bg-white transition-colors"
            />
          </div>

          {/* Date & Time Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ngày thực hiện
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setEndDate(e.target.value);
                }}
                className="w-full px-3 py-1.5 bg-rose-50/30 border border-rose-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-pink-500 focus:bg-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Giờ bắt đầu
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => handleStartTimeChange(e.target.value)}
                className="w-full px-3 py-1.5 bg-rose-50/30 border border-rose-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-pink-500 focus:bg-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Giờ kết thúc
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-1.5 bg-rose-50/30 border border-rose-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-pink-500 focus:bg-white font-mono"
              />
            </div>
          </div>

          <div className="text-right text-[11px] text-slate-500 font-mono">
            Thời lượng dự tính: <strong className="text-pink-600">{formatMinutesToHumanReadable(durationMins)}</strong>
          </div>

          {/* Priority & Eisenhower Matrix Quadrant */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Độ ưu tiên (Priority)
              </label>
              <select
                value={priority}
                onChange={(e) => {
                  const p = e.target.value as PriorityLevel;
                  setPriority(p);
                  if (p === 'P1') setEisenhower('do_first');
                  else if (p === 'P2') setEisenhower('schedule');
                  else if (p === 'P3') setEisenhower('delegate');
                }}
                className="w-full px-3 py-2 bg-rose-50/30 border border-rose-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-pink-500 focus:bg-white"
              >
                <option value="P1">🔴 P1 - Khẩn cấp nhất (Do First)</option>
                <option value="P2">🟡 P2 - Quan trọng (Schedule)</option>
                <option value="P3">🟢 P3 - Vừa phải (Delegate)</option>
                <option value="P4">⚪ P4 - Thấp (Eliminate)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ma trận Eisenhower
              </label>
              <select
                value={eisenhower}
                onChange={(e) => setEisenhower(e.target.value as EisenhowerQuadrant)}
                className="w-full px-3 py-2 bg-rose-50/30 border border-rose-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-pink-500 focus:bg-white"
              >
                <option value="do_first">1. Khẩn cấp & Quan trọng (Làm ngay)</option>
                <option value="schedule">2. Quan trọng, không khẩn cấp (Lên lịch)</option>
                <option value="delegate">3. Khẩn cấp, không quan trọng (Ủy quyền)</option>
                <option value="eliminate">4. Không khẩn cấp, không quan trọng</option>
              </select>
            </div>
          </div>

          {/* Category & Recurrence */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Danh mục
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as EventCategory)}
                className="w-full px-3 py-2 bg-rose-50/30 border border-rose-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-pink-500 focus:bg-white"
              >
                <option value="work">💼 Công việc</option>
                <option value="study">📚 Học tập / Nghiên cứu</option>
                <option value="meeting">🤝 Cuộc họp</option>
                <option value="roadmap">🎯 Mục tiêu Lộ trình</option>
                <option value="health">🏃 Sức khỏe / Thể thao</option>
                <option value="personal">🌟 Cá nhân / Gia đình</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Lặp lại
              </label>
              <select
                value={recurrence}
                onChange={(e) => setRecurrence(e.target.value as RecurrenceType)}
                className="w-full px-3 py-2 bg-rose-50/30 border border-rose-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-pink-500 focus:bg-white"
              >
                <option value="none">Không lặp lại</option>
                <option value="daily">Hàng ngày</option>
                <option value="weekly">Hàng tuần</option>
                <option value="monthly">Hàng tháng</option>
              </select>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Địa điểm / Đường dẫn họp (tùy chọn)
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Google Meet, Zoom, Văn phòng tầng 3..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-rose-50/30 border border-rose-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-pink-500 focus:bg-white"
              />
            </div>
          </div>

          {/* 16 Cat Sticker Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <span>🐾</span>
                <span>Dán Sticker Mèo Vào Lịch Trình</span>
              </label>
              <span className="text-[10px] text-pink-600 font-bold">16 biểu cảm</span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar bg-pink-50/40 p-2 rounded-2xl border border-pink-200">
              {CAT_STICKERS.map(s => {
                const isSelected = stickerId === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setStickerId(s.id)}
                    className={`flex-shrink-0 p-1.5 rounded-xl border transition-all flex flex-col items-center justify-center w-14 ${
                      isSelected
                        ? 'bg-white border-pink-400 ring-2 ring-pink-300 shadow-xs scale-105'
                        : 'bg-white/70 border-pink-100 hover:border-pink-300'
                    }`}
                    title={s.nameVi}
                  >
                    <CatSticker stickerId={s.id} size={32} />
                    <span className="text-[9px] font-bold text-slate-700 truncate w-full text-center mt-0.5">
                      {s.tag}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description / Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Ghi chú / Nội dung chi tiết
            </label>
            <textarea
              rows={2}
              placeholder="Thêm các đầu mục cần hoàn thành, tài liệu đính kèm..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-rose-50/30 border border-rose-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-pink-500 focus:bg-white resize-none"
            />
          </div>

          {/* Email Notification Section */}
          <div className="p-3.5 bg-rose-50/40 rounded-xl border border-rose-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailReminder}
                  onChange={(e) => setEmailReminder(e.target.checked)}
                  className="rounded border-rose-300 text-pink-600 focus:ring-pink-400 w-4 h-4 accent-pink-500"
                />
                <Mail className="w-4 h-4 text-pink-600" />
                <span>Gửi thông báo nhắc nhở qua Email</span>
              </label>

              {emailReminder && (
                <select
                  value={reminderMinutes}
                  onChange={(e) => setReminderMinutes(Number(e.target.value))}
                  className="bg-white border border-rose-200 rounded-lg px-2 py-1 text-slate-700 text-xs focus:outline-none focus:border-pink-400"
                >
                  <option value={10}>Trước 10 phút</option>
                  <option value={15}>Trước 15 phút</option>
                  <option value={30}>Trước 30 phút</option>
                  <option value={60}>Trước 1 giờ</option>
                  <option value={1440}>Trước 1 ngày</option>
                </select>
              )}
            </div>

            {emailReminder && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2 border-t border-rose-200/80 text-xs text-slate-500">
                <span>Gửi đến: <strong className="text-slate-800 font-mono">{preferences.userEmail}</strong></span>
                <button
                  type="button"
                  onClick={handleTestEmail}
                  className="px-2.5 py-1 bg-white hover:bg-rose-50 text-rose-700 hover:text-rose-800 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-colors border border-rose-200 shadow-xs"
                >
                  <Send className="w-3 h-3 text-pink-500" />
                  <span>{isTestEmailSent ? 'Đã gửi thử!' : 'Gửi thử email ngay'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-rose-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-rose-50 rounded-xl transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold rounded-xl text-xs sm:text-sm shadow-xs shadow-pink-200 transition-all hover:scale-[1.02]"
            >
              {editingEvent ? 'Lưu Thay Đổi' : 'Tạo Lịch Trình'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
