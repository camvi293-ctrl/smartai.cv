import React, { useState } from 'react';
import { 
  Target, 
  Sparkles, 
  X, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  ArrowRight, 
  BookOpen, 
  Zap, 
  Layers,
  Award 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { GoalRoadmap, EventCategory } from '../types';
import { formatDateToYYYYMMDD, formatMinutesToHumanReadable } from '../utils/dateUtils';

interface AIGoalRoadmapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveRoadmap: (newRoadmap: GoalRoadmap) => void;
}

export const AIGoalRoadmapModal: React.FC<AIGoalRoadmapModalProps> = ({
  isOpen,
  onClose,
  onSaveRoadmap,
}) => {
  const [goalTitle, setGoalTitle] = useState('');
  const [goalDescription, setGoalDescription] = useState('');
  const [category, setCategory] = useState<EventCategory>('study');
  const [timeframeWeeks, setTimeframeWeeks] = useState(4);
  const [weeklyHours, setWeeklyHours] = useState(8);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedRoadmap, setGeneratedRoadmap] = useState<any | null>(null);

  if (!isOpen) return null;

  const handleGenerateRoadmap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle.trim()) return;

    setIsLoading(true);
    setGeneratedRoadmap(null);

    try {
      const response = await fetch('/api/ai/generate-roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goalTitle: goalTitle.trim(),
          goalDescription: goalDescription.trim(),
          category,
          timeframeWeeks,
          weeklyHoursAvailable: weeklyHours,
        }),
      });

      if (!response.ok) throw new Error('Lỗi từ AI Server');

      const data = await response.json();
      setGeneratedRoadmap(data);
    } catch (err: any) {
      console.error(err);
      // Fallback roadmap
      setGeneratedRoadmap({
        title: goalTitle,
        description: goalDescription || 'Lộ trình tối ưu hóa mục tiêu cá nhân.',
        category,
        totalEstimatedHours: timeframeWeeks * weeklyHours,
        aiAnalysis: `Lộ trình phân bổ thành ${Math.min(3, timeframeWeeks)} chặng thực hiện trong ${timeframeWeeks} tuần dựa trên quỹ ${weeklyHours}h rảnh/tuần.`,
        milestones: [
          {
            id: `ms-${Date.now()}-1`,
            title: 'Chặng 1: Nền tảng & Kiến thức cốt lõi',
            description: 'Tập trung học và nắm chắc các nguyên lý nền tảng.',
            targetWeek: 1,
            estimatedHours: weeklyHours,
            tasks: [
              { id: 't1', title: 'Thu thập tài liệu & lập danh mục cần học', durationMinutes: 90, priority: 'P1' },
              { id: 't2', title: 'Hoàn thành các bài thực hành đầu tiên', durationMinutes: 120, priority: 'P2' },
            ]
          },
          {
            id: `ms-${Date.now()}-2`,
            title: 'Chặng 2: Nâng cao & Ứng dụng thực chiến',
            description: 'Áp dụng kiến thức vào bài tập lớn hoặc dự án thực tế.',
            targetWeek: 2,
            estimatedHours: weeklyHours,
            tasks: [
              { id: 't3', title: 'Thực hiện dự án ứng dụng thực tế', durationMinutes: 180, priority: 'P1' },
            ]
          }
        ]
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAndActivate = () => {
    if (!generatedRoadmap) return;

    const startDate = new Date();
    const targetDate = new Date();
    targetDate.setDate(startDate.getDate() + timeframeWeeks * 7);

    const fullRoadmap: GoalRoadmap = {
      id: `roadmap-${Date.now()}`,
      title: generatedRoadmap.title || goalTitle,
      description: generatedRoadmap.description || goalDescription,
      category: (generatedRoadmap.category as EventCategory) || category,
      startDate: formatDateToYYYYMMDD(startDate),
      targetDate: formatDateToYYYYMMDD(targetDate),
      totalEstimatedHours: generatedRoadmap.totalEstimatedHours || (timeframeWeeks * weeklyHours),
      completedHours: 0,
      status: 'in_progress',
      priority: 'P1',
      aiAnalysis: generatedRoadmap.aiAnalysis,
      createdAt: new Date().toISOString(),
      milestones: (generatedRoadmap.milestones || []).map((m: any, idx: number) => {
        const msTargetDate = new Date();
        msTargetDate.setDate(startDate.getDate() + (m.targetWeek || idx + 1) * 7);

        return {
          id: m.id || `ms-${Date.now()}-${idx}`,
          title: m.title,
          description: m.description,
          targetWeek: m.targetWeek || idx + 1,
          targetDate: formatDateToYYYYMMDD(msTargetDate),
          estimatedHours: m.estimatedHours || weeklyHours,
          completedHours: 0,
          status: 'pending',
          tasks: (m.tasks || []).map((t: any, tIdx: number) => ({
            id: t.id || `t-${Date.now()}-${idx}-${tIdx}`,
            title: t.title,
            durationMinutes: t.durationMinutes || 60,
            priority: t.priority || 'P2',
            isCompleted: false,
          })),
        };
      }),
    };

    onSaveRoadmap(fullRoadmap);
    confetti({
      particleCount: 80,
      spread: 80,
      origin: { y: 0.6 },
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
              <Target className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                Kiến Tạo Lộ Trình Mục Tiêu Thông Minh
                <span className="px-2 py-0.5 text-[10px] font-bold bg-pink-100 text-pink-700 border border-pink-200 rounded-full">
                  AI Roadmap
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Phân rã mục tiêu lớn thành các chặng hành động khả thi theo tuần và quỹ giờ rảnh
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
          
          {/* Goal Input Form */}
          <form onSubmit={handleGenerateRoadmap} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Mục tiêu của bạn là gì? <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="VD: Luyện thi IELTS 7.5, Học lập trình Fullstack AI, Viết xong sách hướng dẫn..."
                value={goalTitle}
                onChange={(e) => setGoalTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-rose-50/30 border border-rose-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-pink-500 focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Danh mục
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as EventCategory)}
                  className="w-full px-3 py-2 bg-rose-50/30 border border-rose-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-pink-500 focus:bg-white"
                >
                  <option value="study">📚 Học tập & Kỹ năng</option>
                  <option value="work">💼 Dự án & Công việc</option>
                  <option value="health">🏃 Sức khỏe & Thể lực</option>
                  <option value="personal">🌟 Cá nhân & Phát triển</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Thời gian thực hiện
                </label>
                <select
                  value={timeframeWeeks}
                  onChange={(e) => setTimeframeWeeks(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-rose-50/30 border border-rose-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-pink-500 focus:bg-white"
                >
                  <option value={2}>2 Tuần (Sprint ngắn)</option>
                  <option value={4}>4 Tuần (~1 Tháng)</option>
                  <option value={8}>8 Tuần (~2 Tháng)</option>
                  <option value={12}>12 Tuần (~3 Tháng - Quý)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Giờ rảnh / tuần
                </label>
                <select
                  value={weeklyHours}
                  onChange={(e) => setWeeklyHours(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-rose-50/30 border border-rose-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-pink-500 focus:bg-white"
                >
                  <option value={5}>5 giờ / tuần (Thong thả)</option>
                  <option value={8}>8 giờ / tuần (Cân bằng)</option>
                  <option value={12}>12 giờ / tuần (Tập trung cao)</option>
                  <option value={20}>20 giờ / tuần (Chuyên sâu)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ghi chú thêm hoặc kỳ vọng cụ thể (tùy chọn)
              </label>
              <textarea
                rows={2}
                placeholder="VD: Muốn tập trung nhiều vào kỹ năng nghe và viết, cần bài tập thực hành cụ thể mỗi ngày..."
                value={goalDescription}
                onChange={(e) => setGoalDescription(e.target.value)}
                className="w-full px-3 py-2 bg-rose-50/30 border border-rose-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-pink-500 focus:bg-white resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !goalTitle.trim()}
              className="w-full py-3 bg-gradient-to-r from-pink-500 via-rose-500 to-pink-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-xs shadow-pink-200 border border-pink-300 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-amber-200" />
                  <span>AI Đang Phân Rã Mục Tiêu Thành Lộ Trình Từng Tuần...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-200" />
                  <span>Khởi Tạo Lộ Trình Hành Động Bằng AI</span>
                </>
              )}
            </button>
          </form>

          {/* Generated Roadmap Preview */}
          {generatedRoadmap && (
            <div className="space-y-4 pt-4 border-t border-rose-100 animate-in fade-in duration-300">
              {/* Analysis overview */}
              <div className="p-4 bg-gradient-to-r from-pink-50/70 via-rose-50/50 to-emerald-50/60 border border-pink-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-pink-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-pink-600" />
                    Chiến lược Lộ Trình Phân Bổ
                  </span>
                  <span className="text-xs font-bold text-emerald-800 font-mono">
                    Tổng: {generatedRoadmap.totalEstimatedHours} giờ
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {generatedRoadmap.aiAnalysis}
                </p>
              </div>

              {/* Milestones list */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Các chặng hoàn thành đề xuất:
                </h4>

                {generatedRoadmap.milestones?.map((ms: any, i: number) => (
                  <div
                    key={i}
                    className="p-3.5 bg-white border border-rose-100 rounded-xl space-y-2 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-pink-100 text-pink-700 border border-pink-200 rounded">
                          Tuần {ms.targetWeek || i + 1}
                        </span>
                        <h5 className="font-bold text-xs sm:text-sm text-slate-800">
                          {ms.title}
                        </h5>
                      </div>
                      <span className="text-xs text-slate-500 font-mono">
                        {ms.estimatedHours} giờ
                      </span>
                    </div>

                    <p className="text-xs text-slate-500">{ms.description}</p>

                    {/* Subtasks */}
                    <div className="space-y-1.5 pt-1">
                      {ms.tasks?.map((t: any, tIdx: number) => (
                        <div
                          key={tIdx}
                          className="flex items-center justify-between p-2 bg-rose-50/40 border border-rose-100/80 rounded-lg text-xs text-slate-800"
                        >
                          <span className="truncate pr-2 font-medium">• {t.title}</span>
                          <span className="text-[11px] text-slate-500 font-mono flex-shrink-0">
                            {formatMinutesToHumanReadable(t.durationMinutes || 60)} ({t.priority || 'P2'})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Save & Activate Button */}
              <div className="pt-2">
                <button
                  onClick={handleSaveAndActivate}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all hover:scale-[1.01]"
                >
                  <Award className="w-4 h-4" />
                  <span>Lưu & Kích Hoạt Lộ Trình Này</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
