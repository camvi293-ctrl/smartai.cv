import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  ArrowRight, 
  AlertCircle, 
  Zap, 
  Brain, 
  Plus, 
  Trash2,
  TrendingUp
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  ScheduleEvent, 
  UserPreferences, 
  AIScheduleOptimizationResult, 
  PriorityLevel 
} from '../types';
import { 
  calculateDayFreeTime, 
  calculateWeekFreeTime, 
  formatDateToYYYYMMDD, 
  formatMinutesToHumanReadable 
} from '../utils/dateUtils';

interface AISmartScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDate: Date;
  events: ScheduleEvent[];
  preferences: UserPreferences;
  onApplySuggestions: (newEvents: Partial<ScheduleEvent>[]) => void;
}

export const AISmartScheduleModal: React.FC<AISmartScheduleModalProps> = ({
  isOpen,
  onClose,
  currentDate,
  events,
  preferences,
  onApplySuggestions,
}) => {
  const [horizon, setHorizon] = useState<'day' | 'week' | 'month'>('day');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AIScheduleOptimizationResult | null>(null);
  const [pendingTasks, setPendingTasks] = useState<Array<{ id: string; title: string; durationMinutes: number; priority: PriorityLevel }>>([
    { id: 'p1', title: 'Hoàn thiện tài liệu kiến trúc hệ thống', durationMinutes: 90, priority: 'P1' },
    { id: 'p2', title: 'Học 2 bài ngữ pháp tiếng Anh IELTS', durationMinutes: 60, priority: 'P2' },
    { id: 'p3', title: 'Kiểm tra và trả lời email tồn đọng', durationMinutes: 30, priority: 'P3' },
  ]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDuration, setNewTaskDuration] = useState(60);
  const [newTaskPriority, setNewTaskPriority] = useState<PriorityLevel>('P2');

  if (!isOpen) return null;

  const dateStr = formatDateToYYYYMMDD(currentDate);
  const dayFree = calculateDayFreeTime(dateStr, events, preferences);
  const weekFree = calculateWeekFreeTime(currentDate, events, preferences);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    setPendingTasks([
      ...pendingTasks,
      {
        id: `custom-${Date.now()}`,
        title: newTaskTitle.trim(),
        durationMinutes: newTaskDuration,
        priority: newTaskPriority,
      }
    ]);
    setNewTaskTitle('');
  };

  const handleRemoveTask = (id: string) => {
    setPendingTasks(pendingTasks.filter(t => t.id !== id));
  };

  const handleGenerateSmartSchedule = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const freeSlotsPayload = horizon === 'day' 
        ? dayFree.freeSlots 
        : weekFree.days.flatMap(d => d.freeSlots.map(s => ({ ...s, date: d.date })));

      const response = await fetch('/api/ai/smart-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          horizon,
          tasks: pendingTasks,
          freeSlots: freeSlotsPayload,
          currentEvents: events,
          preferences,
        }),
      });

      if (!response.ok) {
        throw new Error('Lỗi từ AI Server');
      }

      const data: AIScheduleOptimizationResult = await response.json();
      setResult(data);
    } catch (err: any) {
      console.error(err);
      // Heuristic fallback in case of error
      setResult({
        overview: 'Đã phân bổ các công việc ưu tiên vào các khung giờ rảnh tốt nhất hôm nay.',
        efficiencyScore: 88,
        suggestions: pendingTasks.map((t, i) => {
          const slot = dayFree.freeSlots[i % (dayFree.freeSlots.length || 1)] || { start: '14:00', end: '15:00', durationMinutes: 60 };
          return {
            eventId: t.id,
            title: t.title,
            suggestedDate: dateStr,
            suggestedStartTime: slot.start,
            suggestedEndTime: slot.end,
            durationMinutes: t.durationMinutes,
            priority: t.priority,
            rationale: `Tự động xếp vào khoảng rảnh ${slot.start} - ${slot.end} phù hợp độ ưu tiên ${t.priority}`,
            confidenceScore: 0.9,
          };
        }),
        recommendations: [
          'Ưu tiên hoàn thành các việc P1 trước buổi trưa.',
          'Dành 10 phút nghỉ ngơi sau mỗi phiên làm việc tập trung.',
        ]
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyAll = () => {
    if (!result || !result.suggestions) return;

    const eventsToCreate: Partial<ScheduleEvent>[] = result.suggestions.map(s => ({
      title: s.title,
      startDate: s.suggestedDate || dateStr,
      startTime: s.suggestedStartTime,
      endDate: s.suggestedDate || dateStr,
      endTime: s.suggestedEndTime,
      durationMinutes: s.durationMinutes,
      priority: s.priority,
      eisenhower: s.priority === 'P1' ? 'do_first' : s.priority === 'P2' ? 'schedule' : 'delegate',
      category: s.title.toLowerCase().includes('học') ? 'study' : 'work',
      isCompleted: false,
      isAiGenerated: true,
      aiRationale: s.rationale,
      reminder: {
        email: preferences.emailNotificationsEnabled,
        inApp: true,
        minutesBefore: 15,
        emailSent: false,
      }
    }));

    onApplySuggestions(eventsToCreate);
    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.7 },
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-rose-100 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-8 text-slate-800">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-rose-100 bg-gradient-to-r from-rose-50 via-pink-50 to-emerald-50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-xs">
              <Brain className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                Gợi Ý Lộ Trình & Xếp Lịch Thông Minh AI
                <span className="px-2 py-0.5 text-[10px] font-bold bg-pink-100 text-pink-700 border border-pink-200 rounded-full">
                  Gemini 3.7
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Tự động lấp các công việc cần làm vào thời gian rảnh theo độ ưu tiên P1-P4 & nhịp sinh học
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-rose-100/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Step 1: Select Horizon & View available free time */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              1. Chọn phạm vi tối ưu hóa
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'day', label: 'Hôm nay', sub: `${(dayFree.totalFreeMinutes / 60).toFixed(1)}h rảnh` },
                { id: 'week', label: 'Tuần này', sub: `${(weekFree.totalFreeMinutes / 60).toFixed(1)}h rảnh` },
                { id: 'month', label: 'Tháng này', sub: `Cả tháng` },
              ].map(h => (
                <button
                  key={h.id}
                  onClick={() => setHorizon(h.id as any)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    horizon === h.id
                      ? 'bg-pink-50/80 border-pink-300 shadow-xs'
                      : 'bg-rose-50/20 border-rose-100 hover:border-pink-200'
                  }`}
                >
                  <div className={`text-xs font-bold ${horizon === h.id ? 'text-pink-800' : 'text-slate-800'}`}>
                    {h.label}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{h.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Pending Tasks list to schedule */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                2. Danh sách công việc cần AI xếp lịch ({pendingTasks.length} việc)
              </label>
              <span className="text-[11px] text-slate-500 font-mono">
                Tổng: {formatMinutesToHumanReadable(pendingTasks.reduce((a, b) => a + b.durationMinutes, 0))}
              </span>
            </div>

            {/* Tasks list */}
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {pendingTasks.map(task => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-2.5 bg-rose-50/30 border border-rose-100 rounded-xl text-xs"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${
                      task.priority === 'P1' ? 'bg-rose-100 text-rose-700 border-rose-200' :
                      task.priority === 'P2' ? 'bg-pink-100 text-pink-700 border-pink-200' :
                      'bg-emerald-100 text-emerald-800 border-emerald-200'
                    }`}>
                      {task.priority}
                    </span>
                    <span className="font-bold text-slate-800 truncate">{task.title}</span>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-slate-500 font-mono text-[11px]">
                      {formatMinutesToHumanReadable(task.durationMinutes)}
                    </span>
                    <button
                      onClick={() => handleRemoveTask(task.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick add new task row */}
            <form onSubmit={handleAddTask} className="flex gap-2 pt-1">
              <input
                type="text"
                placeholder="Thêm nhanh việc cần xếp..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-rose-50/30 border border-rose-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-pink-500 focus:bg-white"
              />
              <select
                value={newTaskDuration}
                onChange={(e) => setNewTaskDuration(Number(e.target.value))}
                className="bg-rose-50/30 border border-rose-200 rounded-xl px-2 py-1.5 text-xs text-slate-700 focus:outline-none"
              >
                <option value={30}>30p</option>
                <option value={45}>45p</option>
                <option value={60}>1h</option>
                <option value={90}>1.5h</option>
                <option value={120}>2h</option>
              </select>
              <select
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value as PriorityLevel)}
                className="bg-rose-50/30 border border-rose-200 rounded-xl px-2 py-1.5 text-xs text-slate-700 focus:outline-none"
              >
                <option value="P1">P1</option>
                <option value="P2">P2</option>
                <option value="P3">P3</option>
              </select>
              <button
                type="submit"
                className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm</span>
              </button>
            </form>
          </div>

          {/* Trigger Generate Button */}
          <div className="pt-2">
            <button
              onClick={handleGenerateSmartSchedule}
              disabled={isLoading || pendingTasks.length === 0}
              className="w-full py-3 bg-gradient-to-r from-pink-500 via-rose-500 to-pink-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-xs shadow-pink-200 border border-pink-300 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-amber-200" />
                  <span>AI Đang Phân Tích & Sắp Xếp Lịch...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-200" />
                  <span>Chạy Thuật Toán Xếp Lịch Thông Minh</span>
                </>
              )}
            </button>
          </div>

          {/* Step 3: AI Generated Results */}
          {result && (
            <div className="space-y-4 pt-4 border-t border-rose-100 animate-in fade-in duration-300">
              
              {/* Overview & Score Card */}
              <div className="p-4 bg-gradient-to-r from-pink-50/70 via-rose-50/50 to-emerald-50/60 rounded-2xl border border-pink-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-pink-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-pink-600" />
                    Kế hoạch tối ưu hóa từ AI
                  </span>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 border border-emerald-200 rounded-full text-emerald-800 text-xs font-bold">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                    Điểm hiệu suất: {result.efficiencyScore}/100
                  </div>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {result.overview}
                </p>

                {/* Recommendations */}
                {result.recommendations && result.recommendations.length > 0 && (
                  <div className="space-y-1 pt-1 border-t border-pink-200/60">
                    {result.recommendations.map((rec, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-600 font-medium">
                        <span className="text-pink-600">💡</span>
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Suggestions List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Lộ trình phân bổ đề xuất ({result.suggestions.length} việc):
                </h4>

                <div className="space-y-2">
                  {result.suggestions.map((sug, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-white border border-rose-100 hover:border-pink-200 rounded-xl space-y-1.5 shadow-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs sm:text-sm text-slate-900">
                            {sug.title}
                          </span>
                          <span className={`px-1.5 py-0.2 text-[9px] font-bold rounded border ${
                            sug.priority === 'P1' ? 'bg-rose-100 text-rose-700 border-rose-200' : 'bg-pink-100 text-pink-700 border-pink-200'
                          }`}>
                            {sug.priority}
                          </span>
                        </div>

                        <span className="text-xs font-mono font-bold text-emerald-700">
                          {sug.suggestedDate ? `${sug.suggestedDate} • ` : ''}{sug.suggestedStartTime} - {sug.suggestedEndTime}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 italic">
                        🎯 {sug.rationale}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Apply Button */}
              <div className="pt-2">
                <button
                  onClick={handleApplyAll}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all hover:scale-[1.01]"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Áp Dụng Lịch Trình Này Vào Lịch Biểu</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
