export type PriorityLevel = 'P1' | 'P2' | 'P3' | 'P4';
export type EisenhowerQuadrant = 'do_first' | 'schedule' | 'delegate' | 'eliminate';
export type EventCategory = 'work' | 'study' | 'personal' | 'health' | 'meeting' | 'urgent' | 'roadmap';
export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly';
export type CalendarViewType = 'widgets' | 'day' | 'week' | 'month' | 'agenda' | 'roadmap' | 'matrix' | 'focus';

export interface ReminderConfig {
  email: boolean;
  inApp: boolean;
  minutesBefore: number; // e.g. 15, 30, 60, 1440
  emailSent?: boolean;
  emailSentAt?: string;
}

export interface ScheduleEvent {
  id: string;
  title: string;
  description?: string;
  category: EventCategory;
  priority: PriorityLevel;
  eisenhower: EisenhowerQuadrant;
  startDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endDate: string; // YYYY-MM-DD
  endTime: string; // HH:mm
  durationMinutes: number;
  isCompleted: boolean;
  isAllDay?: boolean;
  location?: string;
  recurrence: RecurrenceType;
  isAiGenerated?: boolean;
  aiRationale?: string;
  roadmapId?: string;
  milestoneId?: string;
  stickerId?: string;
  reminder: ReminderConfig;
  createdAt: string;
  updatedAt: string;
}

export interface RoadmapMilestone {
  id: string;
  title: string;
  description: string;
  targetWeek: number; // Week 1, 2, 3...
  targetDate: string;
  estimatedHours: number;
  completedHours: number;
  status: 'pending' | 'in_progress' | 'completed';
  tasks: {
    id: string;
    title: string;
    durationMinutes: number;
    priority: PriorityLevel;
    scheduledEventId?: string;
    isCompleted: boolean;
  }[];
}

export interface GoalRoadmap {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  startDate: string;
  targetDate: string;
  totalEstimatedHours: number;
  completedHours: number;
  status: 'in_progress' | 'completed' | 'paused';
  priority: PriorityLevel;
  milestones: RoadmapMilestone[];
  aiAnalysis?: string;
  createdAt: string;
}

export interface TimeSlot {
  start: string; // HH:mm
  end: string; // HH:mm
  durationMinutes: number;
  isFree: boolean;
  eventId?: string;
  eventTitle?: string;
}

export interface DayFreeTimeSummary {
  date: string; // YYYY-MM-DD
  dayOfWeek: string;
  totalFreeMinutes: number;
  totalBusyMinutes: number;
  freeSlots: { start: string; end: string; durationMinutes: number }[];
  busySlots: { start: string; end: string; title: string; category: EventCategory }[];
  utilizationRate: number; // 0 - 100%
}

export interface UserPreferences {
  userName: string;
  userEmail: string;
  wakeTime: string; // e.g. "07:00"
  bedTime: string; // e.g. "23:00"
  workStartTime: string; // e.g. "08:30"
  workEndTime: string; // e.g. "17:30"
  lunchStartTime: string; // e.g. "12:00"
  lunchEndTime: string; // e.g. "13:00"
  preferredFocusTime: 'morning' | 'afternoon' | 'evening';
  autoScheduleBufferMinutes: number; // e.g. 15 mins buffer between tasks
  emailNotificationsEnabled: boolean;
  dailyBriefingEmail: boolean;
  dailyBriefingTime: string; // e.g. "07:00"
  weeklyDigestEmail: boolean;
  selectedCatStickerId?: string;
  syncKey: string;
  lastSyncedAt?: string;
}

export interface EmailLogEntry {
  id: string;
  type: 'reminder' | 'daily_briefing' | 'weekly_digest' | 'roadmap_update';
  toEmail: string;
  subject: string;
  sentAt: string;
  status: 'sent' | 'queued' | 'simulated';
  previewHtml: string;
  eventId?: string;
  eventTitle?: string;
}

export interface SmartScheduleSuggestion {
  eventId: string;
  title: string;
  suggestedDate: string;
  suggestedStartTime: string;
  suggestedEndTime: string;
  durationMinutes: number;
  priority: PriorityLevel;
  rationale: string;
  confidenceScore: number;
}

export interface AllowedAppOrWebsite {
  id: string;
  name: string;
  category: 'work' | 'study' | 'tool' | 'communication' | 'custom';
  icon: string;
  url?: string;
  isAllowed: boolean;
  description?: string;
  isCustom?: boolean;
}

export interface FocusGuardConfig {
  strictLockMode: boolean; // Prevent casual exit
  blockDistractionsAlert: boolean; // Sound & popup when tab/app loses focus
  autoFullscreen: boolean;
  allowedApps: AllowedAppOrWebsite[];
}

export interface AIScheduleOptimizationResult {
  overview: string;
  efficiencyScore: number;
  suggestions: SmartScheduleSuggestion[];
  recommendations: string[];
  workloadWarnings?: string[];
}
