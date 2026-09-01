import React, { useState } from 'react';
import { 
  Target, 
  Sparkles, 
  Plus, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Calendar, 
  ArrowRight, 
  ChevronDown, 
  ChevronUp, 
  Award, 
  Trash2, 
  Zap,
  TrendingUp
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { GoalRoadmap, RoadmapMilestone, ScheduleEvent } from '../types';
import { formatVietnameseDate, formatMinutesToHumanReadable } from '../utils/dateUtils';

interface RoadmapViewProps {
  roadmaps: GoalRoadmap[];
  onOpenAiRoadmapModal: () => void;
  onUpdateRoadmap: (updated: GoalRoadmap) => void;
  onDeleteRoadmap: (id: string) => void;
  onSyncMilestoneToCalendar: (roadmap: GoalRoadmap, milestone: RoadmapMilestone) => void;
}

export const RoadmapView: React.FC<RoadmapViewProps> = ({
  roadmaps,
  onOpenAiRoadmapModal,
  onUpdateRoadmap,
  onDeleteRoadmap,
  onSyncMilestoneToCalendar,
}) => {
  const [expandedRoadmapId, setExpandedRoadmapId] = useState<string | null>(
    roadmaps.length > 0 ? roadmaps[0].id : null
  );

  const toggleTaskCompleted = (roadmap: GoalRoadmap, milestoneId: string, taskId: string) => {
    const updatedMilestones = roadmap.milestones.map(ms => {
      if (ms.id !== milestoneId) return ms;

      const updatedTasks = ms.tasks.map(t => {
        if (t.id === taskId) {
          const nextCompleted = !t.isCompleted;
          if (nextCompleted) {
            confetti({
              particleCount: 40,
              spread: 60,
              origin: { y: 0.8 },
            });
          }
          return { ...t, isCompleted: nextCompleted };
        }
        return t;
      });

      const completedCount = updatedTasks.filter(t => t.isCompleted).length;
      const allDone = updatedTasks.length > 0 && completedCount === updatedTasks.length;
      const completedHrs = Math.round((completedCount / updatedTasks.length) * ms.estimatedHours);

      return {
        ...ms,
        tasks: updatedTasks,
        completedHours: completedHrs,
        status: allDone ? 'completed' : (completedCount > 0 ? 'in_progress' : 'pending') as any,
      };
    });

    const totalEstimated = updatedMilestones.reduce((acc, m) => acc + m.estimatedHours, 0);
    const totalDone = updatedMilestones.reduce((acc, m) => acc + m.completedHours, 0);
    const allMilestonesDone = updatedMilestones.every(m => m.status === 'completed');

    if (allMilestonesDone) {
      confetti({
        particleCount: 100,
        spread: 100,
        origin: { y: 0.6 },
      });
    }

    const updatedRoadmap: GoalRoadmap = {
      ...roadmap,
      milestones: updatedMilestones,
      totalEstimatedHours: totalEstimated,
      completedHours: totalDone,
      status: allMilestonesDone ? 'completed' : 'in_progress',
    };

    onUpdateRoadmap(updatedRoadmap);
  };

  return (
    <div className="bg-white border border-rose-100 rounded-2xl p-4 sm:p-6 shadow-xs text-slate-800 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-rose-100 gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
            <Target className="w-5 h-5 text-pink-500" />
            Lộ Trình Mục Tiêu Thông Minh (Smart Roadmaps)
          </h2>
          <p className="text-xs text-slate-500">
            Chuyển hóa các mục tiêu lớn thành các chặng (Milestones) hành động theo tuần và tự động chèn vào thời gian rảnh
          </p>
        </div>

        <button
          onClick={onOpenAiRoadmapModal}
          className="px-3.5 py-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs shadow-pink-200 border border-pink-300 transition-all hover:scale-[1.02]"
        >
          <Sparkles className="w-4 h-4 text-amber-200 animate-pulse" />
          <span>Lập Lộ Trình Mới Bằng AI</span>
        </button>
      </div>

      {/* Roadmaps List */}
      {roadmaps.length === 0 ? (
        <div className="py-12 text-center bg-rose-50/30 border border-dashed border-rose-200 rounded-2xl">
          <Target className="w-10 h-10 text-rose-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-700">Chưa có lộ trình mục tiêu nào</p>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Bạn có mục tiêu học tập, dự án phần mềm, hay luyện thi? Hãy để AI phân tích quỹ thời gian rảnh và lập lộ trình từng tuần cho bạn!
          </p>
          <button
            onClick={onOpenAiRoadmapModal}
            className="mt-4 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-xl text-xs inline-flex items-center gap-2 shadow-xs shadow-pink-200"
          >
            <Sparkles className="w-4 h-4 text-amber-200" />
            <span>Tạo Lộ Trình Đầu Tiên</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {roadmaps.map(roadmap => {
            const isExpanded = expandedRoadmapId === roadmap.id;
            const progressPercent = roadmap.totalEstimatedHours > 0
              ? Math.min(100, Math.round((roadmap.completedHours / roadmap.totalEstimatedHours) * 100))
              : 0;

            return (
              <div
                key={roadmap.id}
                className="bg-white border border-rose-100 rounded-2xl overflow-hidden shadow-xs transition-all hover:border-pink-200"
              >
                {/* Roadmap Header Card */}
                <div 
                  onClick={() => setExpandedRoadmapId(isExpanded ? null : roadmap.id)}
                  className="p-4 sm:p-5 cursor-pointer hover:bg-rose-50/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-base sm:text-lg text-slate-900">
                          {roadmap.title}
                        </h3>
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${
                          roadmap.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                            : 'bg-pink-100 text-pink-700 border-pink-200'
                        }`}>
                          {roadmap.status === 'completed' ? 'ĐÃ HOÀN THÀNH' : 'ĐANG THỰC HIỆN'}
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-50 text-slate-700 rounded-md border border-rose-100">
                          {roadmap.priority}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-2">
                        {roadmap.description}
                      </p>

                      {/* AI analysis snippet */}
                      {roadmap.aiAnalysis && (
                        <div className="flex items-center gap-1.5 text-xs text-pink-700 font-medium bg-pink-50/60 px-2.5 py-1 rounded-lg border border-pink-100 w-fit">
                          <Sparkles className="w-3.5 h-3.5 text-pink-500 flex-shrink-0" />
                          <span className="line-clamp-1">{roadmap.aiAnalysis}</span>
                        </div>
                      )}
                    </div>

                    {/* Expand/Collapse and delete */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteRoadmap(roadmap.id);
                        }}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Xóa lộ trình"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="p-2 text-slate-400 hover:text-slate-700">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar & Timeline Stats */}
                  <div className="mt-4 pt-3 border-t border-rose-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-4 text-slate-500 font-medium">
                      <span>Tiến độ: <strong className="text-emerald-700">{roadmap.completedHours}h / {roadmap.totalEstimatedHours}h ({progressPercent}%)</strong></span>
                      <span>•</span>
                      <span>Thời hạn: <strong className="text-slate-800">{formatVietnameseDate(roadmap.targetDate)}</strong></span>
                    </div>

                    <div className="w-full sm:w-48 h-2 bg-rose-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-pink-400 to-emerald-400 transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Expanded Milestones Content */}
                {isExpanded && (
                  <div className="p-4 sm:p-5 bg-rose-50/30 border-t border-rose-100 space-y-4">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-pink-500" />
                      Các Chặng Thực Hiện (Milestones):
                    </h4>

                    <div className="space-y-4">
                      {roadmap.milestones.map((ms) => {
                        const msDone = ms.tasks.filter(t => t.isCompleted).length;
                        const msTotal = ms.tasks.length;
                        const isMsCompleted = ms.status === 'completed';

                        return (
                          <div
                            key={ms.id}
                            className={`p-4 rounded-xl border transition-all ${
                              isMsCompleted
                                ? 'bg-white border-emerald-300'
                                : 'bg-white border-rose-100 hover:border-pink-200'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-rose-100">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="px-2 py-0.5 text-[10px] font-bold bg-pink-100 text-pink-700 border border-pink-200 rounded">
                                    Tuần {ms.targetWeek}
                                  </span>
                                  <h5 className="font-bold text-sm text-slate-800">
                                    {ms.title}
                                  </h5>
                                </div>
                                <p className="text-xs text-slate-500 mt-0.5">{ms.description}</p>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-500">
                                  Ước tính: <strong className="text-slate-800">{ms.estimatedHours}h</strong> ({msDone}/{msTotal} việc)
                                </span>

                                <button
                                  onClick={() => onSyncMilestoneToCalendar(roadmap, ms)}
                                  className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors whitespace-nowrap shadow-xs"
                                  title="Chèn các việc của chặng này vào khung giờ rảnh trong lịch"
                                >
                                  <Calendar className="w-3 h-3 text-emerald-600" />
                                  <span>Xếp vào Lịch Trình</span>
                                </button>
                              </div>
                            </div>

                            {/* Task List under Milestone */}
                            <div className="mt-3 space-y-2">
                              {ms.tasks.map(task => (
                                <div
                                  key={task.id}
                                  className={`flex items-center justify-between p-2.5 rounded-lg text-xs transition-colors ${
                                    task.isCompleted ? 'bg-slate-50 text-slate-400 border border-slate-200' : 'bg-rose-50/40 border border-rose-100 text-slate-800'
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => toggleTaskCompleted(roadmap, ms.id, task.id)}
                                      className="text-slate-400 hover:text-emerald-600 transition-colors"
                                    >
                                      {task.isCompleted ? (
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                                      ) : (
                                        <Circle className="w-4 h-4" />
                                      )}
                                    </button>
                                    <span className={task.isCompleted ? 'line-through' : 'font-semibold'}>
                                      {task.title}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2 text-slate-500 font-mono">
                                    <span className="text-[11px]">{formatMinutesToHumanReadable(task.durationMinutes)}</span>
                                    <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-rose-100 text-rose-700 border border-rose-200">
                                      {task.priority}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
