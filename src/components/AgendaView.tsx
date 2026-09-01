import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  CheckCircle2, 
  Circle, 
  Clock, 
  MapPin, 
  Sparkles, 
  Mail, 
  Trash2, 
  Edit3, 
  Plus, 
  Calendar 
} from 'lucide-react';
import { ScheduleEvent, EventCategory, PriorityLevel } from '../types';
import { formatVietnameseDate, formatMinutesToHumanReadable } from '../utils/dateUtils';
import { CatSticker } from './CatStickers';

interface AgendaViewProps {
  events: ScheduleEvent[];
  onToggleComplete: (id: string) => void;
  onEditEvent: (event: ScheduleEvent) => void;
  onDeleteEvent: (id: string) => void;
  onNewEvent: () => void;
}

export const AgendaView: React.FC<AgendaViewProps> = ({
  events,
  onToggleComplete,
  onEditEvent,
  onDeleteEvent,
  onNewEvent,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');

  // Filter events
  const filteredEvents = events.filter(e => {
    if (searchTerm) {
      const matchTitle = e.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchDesc = (e.description || '').toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchTitle && !matchDesc) return false;
    }
    if (selectedCategory !== 'all' && e.category !== selectedCategory) return false;
    if (selectedPriority !== 'all' && e.priority !== selectedPriority) return false;
    if (filterStatus === 'pending' && e.isCompleted) return false;
    if (filterStatus === 'completed' && !e.isCompleted) return false;
    return true;
  });

  // Group events by date
  const grouped: Record<string, ScheduleEvent[]> = {};
  filteredEvents.forEach((ev) => {
    if (!grouped[ev.startDate]) grouped[ev.startDate] = [];
    grouped[ev.startDate].push(ev);
  });

  const sortedDates = Object.keys(grouped).sort();

  const getPriorityBadge = (p: PriorityLevel) => {
    switch (p) {
      case 'P1': return 'bg-rose-100 text-rose-700 border-rose-200 font-bold';
      case 'P2': return 'bg-pink-100 text-pink-700 border-pink-200 font-bold';
      case 'P3': return 'bg-emerald-100 text-emerald-800 border-emerald-200 font-bold';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="bg-white border border-rose-100 rounded-2xl p-4 sm:p-6 shadow-xs text-slate-800 space-y-4">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pb-4 border-b border-rose-100">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800">
            Danh Sách Lịch Trình & Nhiệm Vụ
          </h2>
          <p className="text-xs text-slate-500">
            Hiển thị {filteredEvents.length} trên tổng số {events.length} lịch hẹn
          </p>
        </div>

        {/* Search input */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm sự kiện, ghi chú..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-rose-50/40 border border-rose-200/80 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-pink-400 focus:bg-white transition-all shadow-inner"
            />
          </div>

          <button
            onClick={onNewEvent}
            className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors whitespace-nowrap shadow-xs shadow-emerald-200"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm Mới</span>
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-500 font-bold flex items-center gap-1">
          <Filter className="w-3.5 h-3.5 text-pink-500" /> Lọc theo:
        </span>

        {/* Status filter */}
        <div className="flex items-center bg-rose-50/50 p-0.5 rounded-lg border border-rose-100">
          {(['all', 'pending', 'completed'] as const).map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                filterStatus === st ? 'bg-white text-pink-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {st === 'all' ? 'Tất cả' : st === 'pending' ? 'Chưa xong' : 'Đã xong'}
            </button>
          ))}
        </div>

        {/* Priority filter */}
        <select
          value={selectedPriority}
          onChange={(e) => setSelectedPriority(e.target.value)}
          className="bg-white border border-rose-200 rounded-lg px-2.5 py-1 text-slate-700 font-medium text-[11px] focus:outline-none focus:border-pink-400 shadow-xs"
        >
          <option value="all">Mọi độ ưu tiên</option>
          <option value="P1">P1 - Khẩn cấp</option>
          <option value="P2">P2 - Quan trọng</option>
          <option value="P3">P3 - Trung bình</option>
          <option value="P4">P4 - Thấp</option>
        </select>

        {/* Category filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-white border border-rose-200 rounded-lg px-2.5 py-1 text-slate-700 font-medium text-[11px] focus:outline-none focus:border-pink-400 shadow-xs"
        >
          <option value="all">Mọi danh mục</option>
          <option value="work">Công việc</option>
          <option value="study">Học tập</option>
          <option value="meeting">Cuộc họp</option>
          <option value="health">Sức khỏe</option>
          <option value="roadmap">Mục tiêu Lộ trình</option>
          <option value="personal">Cá nhân</option>
        </select>
      </div>

      {/* Events Grouped by Date */}
      {sortedDates.length === 0 ? (
        <div className="py-12 text-center bg-rose-50/30 border border-dashed border-rose-200 rounded-2xl">
          <Calendar className="w-8 h-8 text-rose-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-700">Không tìm thấy lịch trình phù hợp</p>
          <p className="text-xs text-slate-500 mt-1">Thử thay đổi bộ lọc hoặc tạo công việc mới!</p>
        </div>
      ) : (
        <div className="space-y-5">
          {sortedDates.map(dateStr => (
            <div key={dateStr} className="space-y-2">
              <div className="flex items-center gap-2 pb-1 border-b border-rose-100">
                <Calendar className="w-4 h-4 text-pink-500" />
                <span className="font-extrabold text-xs sm:text-sm text-slate-800">
                  {formatVietnameseDate(dateStr)}
                </span>
                <span className="text-xs text-slate-400 font-mono">({grouped[dateStr].length} việc)</span>
              </div>

              <div className="space-y-2 pl-2">
                {grouped[dateStr].map(ev => (
                  <div
                    key={ev.id}
                    className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all hover:bg-white hover:shadow-xs ${
                      ev.isCompleted ? 'bg-slate-50 border-slate-200 opacity-60' : 'bg-rose-50/20 border-rose-100 hover:border-pink-200'
                    }`}
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <button
                        onClick={() => onToggleComplete(ev.id)}
                        className="mt-0.5 text-slate-400 hover:text-emerald-600 transition-colors"
                      >
                        {ev.isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-400" />
                        )}
                      </button>

                      {/* Cat Sticker */}
                      <div className="w-7 h-7 rounded-lg bg-pink-50 border border-pink-100 flex items-center justify-center flex-shrink-0 p-0.5">
                        <CatSticker stickerId={ev.stickerId || 'snow_white_happy'} size={24} />
                      </div>

                      <div className="space-y-1 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-sm font-bold ${ev.isCompleted ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                            {ev.title}
                          </span>
                          <span className={`px-2 py-0.2 text-[10px] rounded border ${getPriorityBadge(ev.priority)}`}>
                            {ev.priority}
                          </span>
                          {ev.isAiGenerated && (
                            <span className="px-1.5 py-0.2 text-[9px] font-bold bg-pink-100 text-pink-700 border border-pink-200 rounded flex items-center gap-1">
                              <Sparkles className="w-2.5 h-2.5 text-pink-500" /> AI
                            </span>
                          )}
                          {ev.reminder?.email && (
                            <span className="px-1.5 py-0.2 text-[9px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 rounded flex items-center gap-1">
                              <Mail className="w-2.5 h-2.5 text-emerald-600" /> Nhắc email
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
                          <span>{ev.startTime} - {ev.endTime} ({formatMinutesToHumanReadable(ev.durationMinutes)})</span>
                          {ev.location && (
                            <span>• {ev.location}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditEvent(ev)}
                        className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Sửa"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteEvent(ev.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
