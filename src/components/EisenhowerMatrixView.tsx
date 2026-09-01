import React from 'react';
import { 
  Grid2X2, 
  Flame, 
  CalendarClock, 
  Users, 
  Trash, 
  CheckCircle2, 
  Circle, 
  Plus, 
  Sparkles,
  Clock 
} from 'lucide-react';
import { ScheduleEvent, EisenhowerQuadrant } from '../types';
import { formatVietnameseDate, formatMinutesToHumanReadable } from '../utils/dateUtils';

interface EisenhowerMatrixViewProps {
  events: ScheduleEvent[];
  onToggleComplete: (id: string) => void;
  onEditEvent: (event: ScheduleEvent) => void;
  onAddEventInQuadrant: (quadrant: EisenhowerQuadrant) => void;
}

export const EisenhowerMatrixView: React.FC<EisenhowerMatrixViewProps> = ({
  events,
  onToggleComplete,
  onEditEvent,
  onAddEventInQuadrant,
}) => {
  const quadrants = [
    {
      id: 'do_first' as EisenhowerQuadrant,
      title: '1. Khẩn cấp & Quan trọng (LÀM NGAY)',
      subtitle: 'Xử lý ngay lập tức, ưu tiên cao nhất (P1)',
      icon: Flame,
      headerBg: 'bg-rose-100/70 border-rose-200 text-rose-800',
      badgeClass: 'bg-rose-100 text-rose-700 border-rose-200',
      items: events.filter(e => e.eisenhower === 'do_first' || e.priority === 'P1'),
    },
    {
      id: 'schedule' as EisenhowerQuadrant,
      title: '2. Quan trọng, Không khẩn cấp (LÊN LỊCH)',
      subtitle: 'Lập lộ trình, xếp vào giờ rảnh để phát triển dài hạn (P2)',
      icon: CalendarClock,
      headerBg: 'bg-pink-100/70 border-pink-200 text-pink-800',
      badgeClass: 'bg-pink-100 text-pink-700 border-pink-200',
      items: events.filter(e => e.eisenhower === 'schedule' || (e.priority === 'P2' && e.eisenhower !== 'do_first')),
    },
    {
      id: 'delegate' as EisenhowerQuadrant,
      title: '3. Khẩn cấp, Không quan trọng (ỦY QUYỀN / RÚT GỌN)',
      subtitle: 'Việc phát sinh, email, hành chính (P3)',
      icon: Users,
      headerBg: 'bg-emerald-100/70 border-emerald-200 text-emerald-800',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      items: events.filter(e => e.eisenhower === 'delegate' || (e.priority === 'P3' && e.eisenhower !== 'do_first' && e.eisenhower !== 'schedule')),
    },
    {
      id: 'eliminate' as EisenhowerQuadrant,
      title: '4. Không khẩn cấp, Không quan trọng (LOẠI BỎ)',
      subtitle: 'Việc giải trí quá đà, sao nhãng, không tạo giá trị (P4)',
      icon: Trash,
      headerBg: 'bg-slate-100 border-slate-200 text-slate-700',
      badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
      items: events.filter(e => e.eisenhower === 'eliminate' || e.priority === 'P4'),
    },
  ];

  return (
    <div className="bg-white border border-rose-100 rounded-2xl p-4 sm:p-6 shadow-xs text-slate-800 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-rose-100 gap-2">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
            <Grid2X2 className="w-5 h-5 text-pink-500" />
            Ma Trận Ưu Tiên Eisenhower
          </h2>
          <p className="text-xs text-slate-500">
            Phân loại mức độ khẩn cấp & quan trọng giúp AI định vị chính xác khung giờ vàng để xếp lịch
          </p>
        </div>
      </div>

      {/* 4 Quadrants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quadrants.map(q => {
          const Icon = q.icon;
          return (
            <div
              key={q.id}
              className="bg-rose-50/20 border border-rose-100 rounded-2xl p-4 flex flex-col justify-between shadow-xs hover:border-pink-200 transition-all min-h-[280px]"
            >
              {/* Quadrant Header */}
              <div>
                <div className={`p-3 rounded-xl border ${q.headerBg} flex items-center justify-between`}>
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <div>
                      <h3 className="font-bold text-xs sm:text-sm">{q.title}</h3>
                      <p className="text-[11px] opacity-80">{q.subtitle}</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-white border border-rose-200 text-slate-700">
                    {q.items.length}
                  </span>
                </div>

                {/* Items in Quadrant */}
                <div className="my-3 space-y-2 max-h-56 overflow-y-auto pr-1">
                  {q.items.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">
                      Chưa có việc nào trong ô này.
                    </div>
                  ) : (
                    q.items.map(ev => (
                      <div
                        key={ev.id}
                        onClick={() => onEditEvent(ev)}
                        className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 cursor-pointer transition-all hover:scale-[1.01] ${
                          ev.isCompleted
                            ? 'bg-slate-50 border-slate-200 opacity-60'
                            : 'bg-white border-rose-100 hover:border-pink-200 shadow-xs'
                        }`}
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleComplete(ev.id);
                            }}
                            className="text-slate-400 hover:text-emerald-600 flex-shrink-0"
                          >
                            {ev.isCompleted ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                            ) : (
                              <Circle className="w-4 h-4 text-slate-400" />
                            )}
                          </button>
                          <span className={`text-xs font-semibold truncate ${ev.isCompleted ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                            {ev.title}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-slate-400 font-mono text-[10px] flex-shrink-0">
                          <span>{ev.startDate.split('-').slice(1).join('/')}</span>
                          <span>•</span>
                          <span>{ev.startTime}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Bottom Add button */}
              <button
                onClick={() => onAddEventInQuadrant(q.id)}
                className="w-full py-1.5 bg-white hover:bg-rose-50 text-rose-700 hover:text-rose-800 border border-rose-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm việc vào ô này</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
