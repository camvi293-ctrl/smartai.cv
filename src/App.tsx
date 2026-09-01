import React, { useState, useEffect, useCallback } from 'react';
import { 
  ScheduleEvent, 
  GoalRoadmap, 
  RoadmapMilestone, 
  UserPreferences, 
  EmailLogEntry, 
  CalendarViewType, 
  EisenhowerQuadrant 
} from './types';
import { 
  loadEvents, 
  saveEvents, 
  loadRoadmaps, 
  saveRoadmaps, 
  loadPreferences, 
  savePreferences, 
  loadEmailLogs, 
  saveEmailLogs 
} from './utils/storage';
import { formatDateToYYYYMMDD, calculateDayFreeTime } from './utils/dateUtils';
import { Header } from './components/Header';
import { FreeTimeAnalyzer } from './components/FreeTimeAnalyzer';
import { QuickAddBar } from './components/QuickAddBar';
import { CalendarDayView } from './components/CalendarDayView';
import { CalendarWeekView } from './components/CalendarWeekView';
import { CalendarMonthView } from './components/CalendarMonthView';
import { AgendaView } from './components/AgendaView';
import { RoadmapView } from './components/RoadmapView';
import { EisenhowerMatrixView } from './components/EisenhowerMatrixView';
import { EventModal } from './components/EventModal';
import { AISmartScheduleModal } from './components/AISmartScheduleModal';
import { AIGoalRoadmapModal } from './components/AIGoalRoadmapModal';
import { EmailNotificationCenter } from './components/EmailNotificationCenter';
import { CrossPlatformSyncModal } from './components/CrossPlatformSyncModal';
import { KawaiiCatWidgetHub } from './components/KawaiiCatWidgetHub';
import { FocusModeView } from './components/FocusModeView';

export default function App() {
  // Application State
  const [events, setEvents] = useState<ScheduleEvent[]>(() => loadEvents());
  const [roadmaps, setRoadmaps] = useState<GoalRoadmap[]>(() => loadRoadmaps());
  const [preferences, setPreferences] = useState<UserPreferences>(() => loadPreferences());
  const [emailLogs, setEmailLogs] = useState<EmailLogEntry[]>(() => loadEmailLogs());
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [activeView, setActiveView] = useState<CalendarViewType>('widgets');
  const [previousView, setPreviousView] = useState<CalendarViewType>('widgets');

  // Modals state
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ScheduleEvent | null>(null);
  const [eventModalPrefills, setEventModalPrefills] = useState<{
    date?: string;
    startTime?: string;
    endTime?: string;
    quadrant?: EisenhowerQuadrant;
  }>({});

  const [isAiSmartModalOpen, setIsAiSmartModalOpen] = useState(false);
  const [isAiRoadmapModalOpen, setIsAiRoadmapModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Sync with LocalStorage on updates
  useEffect(() => {
    saveEvents(events);
  }, [events]);

  useEffect(() => {
    saveRoadmaps(roadmaps);
  }, [roadmaps]);

  useEffect(() => {
    savePreferences(preferences);
  }, [preferences]);

  useEffect(() => {
    saveEmailLogs(emailLogs);
  }, [emailLogs]);

  // Handle URL Sync Pairing (e.g. ?syncKey=SYNC-XYZ from QR scan)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const syncKeyParam = params.get('syncKey');
    if (syncKeyParam && syncKeyParam !== preferences.syncKey) {
      fetch(`/api/sync/pull/${encodeURIComponent(syncKeyParam)}`)
        .then(res => res.json())
        .then(data => {
          if (data.data) {
            if (data.data.events) setEvents(data.data.events);
            if (data.data.roadmaps) setRoadmaps(data.data.roadmaps);
            if (data.data.preferences) setPreferences({ ...data.data.preferences, syncKey: syncKeyParam });
            showToast(`Đã đồng bộ dữ liệu từ thiết bị (Mã ${syncKeyParam})!`, 'success');
          }
        })
        .catch(err => console.error('Sync URL pull error:', err));
    }
  }, []);

  // Navigation handlers
  const handlePrevDate = () => {
    const next = new Date(currentDate);
    if (activeView === 'day') next.setDate(next.getDate() - 1);
    else if (activeView === 'week') next.setDate(next.getDate() - 7);
    else if (activeView === 'month') next.setMonth(next.getMonth() - 1);
    else next.setDate(next.getDate() - 1);
    setCurrentDate(next);
  };

  const handleNextDate = () => {
    const next = new Date(currentDate);
    if (activeView === 'day') next.setDate(next.getDate() + 1);
    else if (activeView === 'week') next.setDate(next.getDate() + 7);
    else if (activeView === 'month') next.setMonth(next.getMonth() + 1);
    else next.setDate(next.getDate() + 1);
    setCurrentDate(next);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Event actions
  const handleToggleComplete = (id: string) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, isCompleted: !e.isCompleted } : e));
  };

  const handleOpenNewEventModal = (prefills?: { date?: string; startTime?: string; endTime?: string; quadrant?: EisenhowerQuadrant }) => {
    setEditingEvent(null);
    setEventModalPrefills(prefills || {
      date: formatDateToYYYYMMDD(currentDate),
      startTime: '09:00',
      endTime: '10:00',
    });
    setIsEventModalOpen(true);
  };

  const handleEditEvent = (event: ScheduleEvent) => {
    setEditingEvent(event);
    setEventModalPrefills({});
    setIsEventModalOpen(true);
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
    showToast('Đã xóa sự kiện khỏi lịch trình', 'info');
  };

  const handleSaveEvent = (eventData: Partial<ScheduleEvent>) => {
    if (eventData.id) {
      // Update
      setEvents(prev => prev.map(e => e.id === eventData.id ? { ...e, ...eventData } as ScheduleEvent : e));
      showToast('Đã cập nhật lịch trình thành công!', 'success');
    } else {
      // Create new
      const newEvent: ScheduleEvent = {
        id: `ev-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        title: eventData.title || 'Lịch trình mới',
        description: eventData.description,
        startDate: eventData.startDate || formatDateToYYYYMMDD(currentDate),
        startTime: eventData.startTime || '09:00',
        endDate: eventData.endDate || eventData.startDate || formatDateToYYYYMMDD(currentDate),
        endTime: eventData.endTime || '10:00',
        durationMinutes: eventData.durationMinutes || 60,
        category: eventData.category || 'work',
        priority: eventData.priority || 'P2',
        eisenhower: eventData.eisenhower || 'schedule',
        isCompleted: false,
        location: eventData.location,
        recurrence: eventData.recurrence || 'none',
        isAiGenerated: eventData.isAiGenerated || false,
        aiRationale: eventData.aiRationale,
        reminder: eventData.reminder || {
          email: preferences.emailNotificationsEnabled,
          inApp: true,
          minutesBefore: 15,
          emailSent: false,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setEvents(prev => [...prev, newEvent]);
      showToast('Đã thêm lịch trình mới vào kế hoạch!', 'success');
    }
  };

  // AI Smart Schedule Apply
  const handleApplyAiSchedule = (newEvents: Partial<ScheduleEvent>[]) => {
    const nowIso = new Date().toISOString();
    const fullNewEvents: ScheduleEvent[] = newEvents.map((ev, i) => ({
      id: `ai-sched-${Date.now()}-${i}`,
      title: ev.title || 'Công việc tối ưu hóa',
      description: ev.description || '',
      startDate: ev.startDate || formatDateToYYYYMMDD(currentDate),
      startTime: ev.startTime || '14:00',
      endDate: ev.endDate || ev.startDate || formatDateToYYYYMMDD(currentDate),
      endTime: ev.endTime || '15:00',
      durationMinutes: ev.durationMinutes || 60,
      category: ev.category || 'work',
      priority: ev.priority || 'P2',
      eisenhower: ev.eisenhower || 'schedule',
      isCompleted: false,
      isAiGenerated: true,
      aiRationale: ev.aiRationale,
      location: ev.location,
      recurrence: 'none',
      reminder: {
        email: preferences.emailNotificationsEnabled,
        inApp: true,
        minutesBefore: 15,
        emailSent: false,
      },
      createdAt: nowIso,
      updatedAt: nowIso,
    }));

    setEvents(prev => [...prev, ...fullNewEvents]);
    showToast(`Đã áp dụng ${fullNewEvents.length} công việc vào lịch biểu tối ưu!`, 'success');
  };

  // Roadmap actions
  const handleSaveRoadmap = (newRoadmap: GoalRoadmap) => {
    setRoadmaps(prev => [newRoadmap, ...prev]);
    showToast('Đã kích hoạt Lộ trình Mục tiêu thông minh!', 'success');
  };

  const handleUpdateRoadmap = (updated: GoalRoadmap) => {
    setRoadmaps(prev => prev.map(r => r.id === updated.id ? updated : r));
  };

  const handleDeleteRoadmap = (id: string) => {
    setRoadmaps(prev => prev.filter(r => r.id !== id));
    showToast('Đã xóa lộ trình', 'info');
  };

  // Sync a roadmap milestone's tasks into calendar free slots
  const handleSyncMilestoneToCalendar = (roadmap: GoalRoadmap, milestone: RoadmapMilestone) => {
    const dateStr = formatDateToYYYYMMDD(currentDate);
    const dayFree = calculateDayFreeTime(dateStr, events, preferences);
    const nowIso = new Date().toISOString();

    let nextSlotIdx = 0;
    const generatedEvents: ScheduleEvent[] = [];

    milestone.tasks.filter(t => !t.isCompleted).forEach((task, idx) => {
      const slot = dayFree.freeSlots[nextSlotIdx] || { start: '15:00', end: '16:30', durationMinutes: 90 };
      nextSlotIdx = (nextSlotIdx + 1) % (dayFree.freeSlots.length || 1);

      generatedEvents.push({
        id: `ms-event-${Date.now()}-${idx}`,
        title: `[${milestone.title}] ${task.title}`,
        description: `Thuộc lộ trình: ${roadmap.title}. Chặng: ${milestone.title}`,
        startDate: dateStr,
        startTime: slot.start,
        endDate: dateStr,
        endTime: slot.end,
        durationMinutes: task.durationMinutes,
        category: 'roadmap',
        priority: task.priority,
        eisenhower: task.priority === 'P1' ? 'do_first' : 'schedule',
        isCompleted: false,
        recurrence: 'none',
        isAiGenerated: true,
        aiRationale: `Tự động phân bổ từ Chặng ${milestone.targetWeek} vào khung giờ rảnh ${slot.start} - ${slot.end}`,
        reminder: {
          email: preferences.emailNotificationsEnabled,
          inApp: true,
          minutesBefore: 15,
          emailSent: false,
        },
        createdAt: nowIso,
        updatedAt: nowIso,
      });
    });

    if (generatedEvents.length > 0) {
      setEvents(prev => [...prev, ...generatedEvents]);
      showToast(`Đã xếp ${generatedEvents.length} công việc từ chặng "${milestone.title}" vào lịch!`, 'success');
      setActiveView('day');
    } else {
      showToast('Tất cả công việc trong chặng này đã hoàn thành!', 'info');
    }
  };

  // Email Notification Handlers
  const handleTriggerDailyBriefing = async () => {
    const todayEvents = events.filter(e => e.startDate === formatDateToYYYYMMDD(currentDate));
    const response = await fetch('/api/email/send-briefing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        toEmail: preferences.userEmail,
        date: formatDateToYYYYMMDD(currentDate),
        events: todayEvents,
        freeMinutesRemaining: calculateDayFreeTime(formatDateToYYYYMMDD(currentDate), events, preferences).totalFreeMinutes,
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Lỗi gửi email');

    const newLog: EmailLogEntry = {
      id: `log-${Date.now()}`,
      toEmail: preferences.userEmail,
      subject: data.subject || 'Bản tin lịch trình buổi sáng',
      sentAt: new Date().toISOString(),
      status: 'sent',
      type: 'daily_briefing',
      previewHtml: data.previewHtml,
    };
    setEmailLogs(prev => [newLog, ...prev]);
    return data;
  };

  const handleSendTestEmailReminder = async (eventData: any) => {
    const response = await fetch('/api/email/send-reminder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData),
    });

    const data = await response.json();
    if (response.ok) {
      const newLog: EmailLogEntry = {
        id: `log-${Date.now()}`,
        toEmail: eventData.toEmail || preferences.userEmail,
        subject: data.subject || `Nhắc nhở: ${eventData.eventTitle}`,
        sentAt: new Date().toISOString(),
        status: 'sent',
        type: 'reminder',
        previewHtml: data.previewHtml,
      };
      setEmailLogs(prev => [newLog, ...prev]);
      showToast(`Đã gửi email nhắc nhở đến ${preferences.userEmail}`, 'success');
    }
  };

  // State Import (From Cloud Sync or JSON)
  const handleImportState = (imported: { events?: ScheduleEvent[]; roadmaps?: GoalRoadmap[]; preferences?: UserPreferences }) => {
    if (imported.events) setEvents(imported.events);
    if (imported.roadmaps) setRoadmaps(imported.roadmaps);
    if (imported.preferences) setPreferences(imported.preferences);
    showToast('Đã nhập và cập nhật trạng thái lịch trình thành công!', 'success');
  };

  return (
    <div className="min-h-screen bg-[#FAF8F7] text-slate-800 flex flex-col font-sans selection:bg-pink-200 selection:text-slate-900">
      
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 animate-in fade-in slide-in-from-top duration-200">
          <div className={`px-4 py-2.5 rounded-xl border shadow-xl text-xs sm:text-sm font-bold flex items-center gap-2 ${
            toastMessage.type === 'success' ? 'bg-white border-emerald-300 text-emerald-800 shadow-emerald-100' :
            toastMessage.type === 'error' ? 'bg-white border-rose-300 text-rose-800 shadow-rose-100' :
            'bg-white border-pink-300 text-pink-800 shadow-pink-100'
          }`}>
            <span className="w-2 h-2 rounded-full bg-current" />
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Focus Mode View (Exclusive Full Screen View) */}
      {activeView === 'focus' ? (
        <FocusModeView
          events={events}
          preferences={preferences}
          currentDate={currentDate}
          onExitFocusMode={() => setActiveView(previousView === 'focus' ? 'widgets' : previousView)}
          onToggleComplete={handleToggleComplete}
          onOpenNewP1Modal={() => handleOpenNewEventModal({ 
            date: formatDateToYYYYMMDD(currentDate), 
            quadrant: 'do_first' 
          })}
        />
      ) : (
        <>
          {/* Primary Top Header */}
          <Header
            activeView={activeView}
            onSelectView={(v) => {
              if (v === 'focus') setPreviousView(activeView);
              setActiveView(v);
            }}
            currentDate={currentDate}
            onPrevDate={handlePrevDate}
            onNextDate={handleNextDate}
            onToday={handleToday}
            onOpenAiSmartModal={() => setIsAiSmartModalOpen(true)}
            onOpenAiRoadmapModal={() => setIsAiRoadmapModalOpen(true)}
            onOpenEmailModal={() => setIsEmailModalOpen(true)}
            onOpenSyncModal={() => setIsSyncModalOpen(true)}
            onNewEvent={() => handleOpenNewEventModal()}
            userEmail={preferences.userEmail}
            selectedCatStickerId={preferences.selectedCatStickerId}
          />

          {/* Main Content Area */}
          <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 space-y-5">
            
            {/* Free Time Analyzer Bar (Day / Week / Month) */}
            <FreeTimeAnalyzer
              currentDate={currentDate}
              events={events}
              preferences={preferences}
              onOpenAiOptimizer={() => setIsAiSmartModalOpen(true)}
              onAddEventInSlot={(dateStr, start, end) => handleOpenNewEventModal({ date: dateStr, startTime: start, endTime: end })}
            />

            {/* Natural Language Quick Add Bar */}
            <QuickAddBar
              currentDate={currentDate}
              preferences={preferences}
              onAddEvent={handleSaveEvent}
              onOpenDetailedModal={(prefilled) => handleOpenNewEventModal(prefilled as any)}
            />

            {/* Dynamic Views Switcher */}
            {activeView === 'widgets' && (
              <KawaiiCatWidgetHub
                currentDate={currentDate}
                events={events}
                roadmaps={roadmaps}
                preferences={preferences}
                onToggleComplete={handleToggleComplete}
                onAddEvent={handleSaveEvent}
                onOpenNewEventModal={handleOpenNewEventModal}
                onOpenAiSmartModal={() => setIsAiSmartModalOpen(true)}
                onOpenAiRoadmapModal={() => setIsAiRoadmapModalOpen(true)}
                onSelectView={(v) => {
                  if (v === 'focus') setPreviousView(activeView);
                  setActiveView(v);
                }}
                onUpdatePreferences={setPreferences}
              />
            )}

            {activeView === 'day' && (
              <CalendarDayView
                currentDate={currentDate}
                events={events}
                preferences={preferences}
                onToggleComplete={handleToggleComplete}
                onEditEvent={handleEditEvent}
                onDeleteEvent={handleDeleteEvent}
                onAddEventInSlot={(start, end) => handleOpenNewEventModal({ date: formatDateToYYYYMMDD(currentDate), startTime: start, endTime: end })}
              />
            )}

            {activeView === 'week' && (
              <CalendarWeekView
                currentDate={currentDate}
                events={events}
                preferences={preferences}
                onSelectDate={(d) => {
                  setCurrentDate(d);
                  setActiveView('day');
                }}
                onToggleComplete={handleToggleComplete}
                onEditEvent={handleEditEvent}
                onAddEventInSlot={(dateStr, start, end) => handleOpenNewEventModal({ date: dateStr, startTime: start, endTime: end })}
              />
            )}

            {activeView === 'month' && (
              <CalendarMonthView
                currentDate={currentDate}
                events={events}
                preferences={preferences}
                onSelectDate={(d) => {
                  setCurrentDate(d);
                  setActiveView('day');
                }}
                onEditEvent={handleEditEvent}
                onAddEventInSlot={(dateStr, start, end) => handleOpenNewEventModal({ date: dateStr, startTime: start, endTime: end })}
              />
            )}

            {activeView === 'agenda' && (
              <AgendaView
                events={events}
                onToggleComplete={handleToggleComplete}
                onEditEvent={handleEditEvent}
                onDeleteEvent={handleDeleteEvent}
                onNewEvent={() => handleOpenNewEventModal()}
              />
            )}

            {activeView === 'roadmap' && (
              <RoadmapView
                roadmaps={roadmaps}
                onOpenAiRoadmapModal={() => setIsAiRoadmapModalOpen(true)}
                onUpdateRoadmap={handleUpdateRoadmap}
                onDeleteRoadmap={handleDeleteRoadmap}
                onSyncMilestoneToCalendar={handleSyncMilestoneToCalendar}
              />
            )}

            {activeView === 'matrix' && (
              <EisenhowerMatrixView
                events={events}
                onToggleComplete={handleToggleComplete}
                onEditEvent={handleEditEvent}
                onAddEventInQuadrant={(quadrant) => handleOpenNewEventModal({ quadrant })}
              />
            )}
          </main>

          {/* Footer */}
          <footer className="border-t border-rose-100 bg-white/80 py-4 px-6 text-center text-xs text-slate-500">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
              <div>
                <span className="font-medium">Smart Schedule & Roadmap AI • Quản lý lịch trình & đồng bộ đa nền tảng</span>
              </div>
              <div className="flex items-center gap-4 text-slate-500">
                <span>Hòm thư nhận: <strong className="text-slate-800 font-mono">{preferences.userEmail}</strong></span>
                <span>•</span>
                <span>Mã đồng bộ: <strong className="text-pink-600 font-mono">{preferences.syncKey}</strong></span>
              </div>
            </div>
          </footer>
        </>
      )}

      {/* Modals */}
      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        onSave={handleSaveEvent}
        editingEvent={editingEvent}
        initialDate={eventModalPrefills.date}
        initialStartTime={eventModalPrefills.startTime}
        initialEndTime={eventModalPrefills.endTime}
        initialQuadrant={eventModalPrefills.quadrant}
        preferences={preferences}
        onSendTestEmailReminder={handleSendTestEmailReminder}
      />

      <AISmartScheduleModal
        isOpen={isAiSmartModalOpen}
        onClose={() => setIsAiSmartModalOpen(false)}
        currentDate={currentDate}
        events={events}
        preferences={preferences}
        onApplySuggestions={handleApplyAiSchedule}
      />

      <AIGoalRoadmapModal
        isOpen={isAiRoadmapModalOpen}
        onClose={() => setIsAiRoadmapModalOpen(false)}
        onSaveRoadmap={handleSaveRoadmap}
      />

      <EmailNotificationCenter
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        preferences={preferences}
        onUpdatePreferences={setPreferences}
        emailLogs={emailLogs}
        events={events}
        onTriggerDailyBriefing={handleTriggerDailyBriefing}
      />

      <CrossPlatformSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        preferences={preferences}
        onUpdatePreferences={setPreferences}
        events={events}
        roadmaps={roadmaps}
        onImportState={handleImportState}
      />
    </div>
  );
}
