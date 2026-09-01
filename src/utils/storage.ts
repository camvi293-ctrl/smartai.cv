import { ScheduleEvent, GoalRoadmap, UserPreferences, EmailLogEntry } from '../types';
import { formatDateToYYYYMMDD } from './dateUtils';

const STORAGE_KEYS = {
  EVENTS: 'smart_schedule_events_v2',
  ROADMAPS: 'smart_schedule_roadmaps_v2',
  PREFERENCES: 'smart_schedule_preferences_v2',
  EMAIL_LOGS: 'smart_schedule_email_logs_v2',
};

export function getInitialDateString(offsetDays = 0): string {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return formatDateToYYYYMMDD(date);
}

export const defaultPreferences: UserPreferences = {
  userName: 'Cam Vi',
  userEmail: 'camvi293@gmail.com',
  wakeTime: '06:30',
  bedTime: '23:00',
  workStartTime: '08:30',
  workEndTime: '17:30',
  lunchStartTime: '12:00',
  lunchEndTime: '13:00',
  preferredFocusTime: 'morning',
  autoScheduleBufferMinutes: 15,
  emailNotificationsEnabled: true,
  dailyBriefingEmail: true,
  dailyBriefingTime: '07:00',
  weeklyDigestEmail: true,
  selectedCatStickerId: 'snow_white_happy',
  syncKey: 'SYNC-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
};

export const defaultRoadmaps: GoalRoadmap[] = [
  {
    id: 'roadmap-1',
    title: 'Hoàn thành Khóa học & Dự án AI Fullstack',
    description: 'Xây dựng năng lực AI ứng dụng, hoàn thiện 2 dự án thực chiến và triển khai Cloud.',
    category: 'study',
    startDate: getInitialDateString(-7),
    targetDate: getInitialDateString(45),
    totalEstimatedHours: 40,
    completedHours: 14,
    status: 'in_progress',
    priority: 'P1',
    aiAnalysis: 'Lộ trình được tối ưu hóa dựa trên 8 giờ rảnh mỗi tuần (chủ yếu khung giờ sáng 07:00 - 08:30 và tối 20:00 - 21:30).',
    createdAt: new Date().toISOString(),
    milestones: [
      {
        id: 'ms-1',
        title: 'Chặng 1: Nắm vững Kiến trúc LLM & Gemini API',
        description: 'Tích hợp mô hình ngôn ngữ, streaming, function calling và system instructions.',
        targetWeek: 1,
        targetDate: getInitialDateString(3),
        estimatedHours: 10,
        completedHours: 8,
        status: 'in_progress',
        tasks: [
          { id: 't1', title: 'Học kiến trúc Context & Multi-turn Chat', durationMinutes: 90, priority: 'P1', isCompleted: true },
          { id: 't2', title: 'Thực hành Server-side API Integration', durationMinutes: 120, priority: 'P1', isCompleted: true },
          { id: 't3', title: 'Viết Schema JSON Structured Output', durationMinutes: 60, priority: 'P2', isCompleted: false },
        ]
      },
      {
        id: 'ms-2',
        title: 'Chặng 2: Xây dựng Hệ thống Tối ưu Lịch & Phân tích Thời gian Rảnh',
        description: 'Xây dựng thuật toán xếp lịch theo ma trận Eisenhower và slot trống trong ngày.',
        targetWeek: 2,
        targetDate: getInitialDateString(14),
        estimatedHours: 15,
        completedHours: 6,
        status: 'in_progress',
        tasks: [
          { id: 't4', title: 'Thiết kế thuật toán phân tích Free-time Slots', durationMinutes: 120, priority: 'P1', isCompleted: true },
          { id: 't5', title: 'Tích hợp AI Auto-Reschedule & Rebalance', durationMinutes: 90, priority: 'P1', isCompleted: false },
          { id: 't6', title: 'Triển khai Email Reminder & Sync Service', durationMinutes: 90, priority: 'P2', isCompleted: false },
        ]
      },
      {
        id: 'ms-3',
        title: 'Chặng 3: Đóng gói Sản phẩm & Triển khai Đa nền tảng',
        description: 'Test đồng bộ hóa đám mây, tối ưu UI/UX di động và phát hành bản thử nghiệm.',
        targetWeek: 3,
        targetDate: getInitialDateString(28),
        estimatedHours: 15,
        completedHours: 0,
        status: 'pending',
        tasks: [
          { id: 't7', title: 'Kiểm thử đồng bộ hóa qua Cloud Key & QR', durationMinutes: 60, priority: 'P2', isCompleted: false },
          { id: 't8', title: 'Hoàn thiện giao diện Calendar Đa chế độ (Day/Week/Month)', durationMinutes: 120, priority: 'P1', isCompleted: false },
        ]
      }
    ]
  }
];

export const defaultEvents: ScheduleEvent[] = [
  {
    id: 'evt-1',
    title: 'Họp giao ban đầu ngày & Review tiến độ Sprint',
    description: 'Thảo luận các tính năng ưu tiên và phân bổ khối lượng công việc.',
    category: 'meeting',
    priority: 'P1',
    eisenhower: 'do_first',
    startDate: getInitialDateString(0),
    startTime: '09:00',
    endDate: getInitialDateString(0),
    endTime: '10:00',
    durationMinutes: 60,
    isCompleted: false,
    location: 'Google Meet / Phòng họp A1',
    recurrence: 'daily',
    reminder: { email: true, inApp: true, minutesBefore: 15, emailSent: false },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'evt-2',
    title: 'Deep Work: Viết tài liệu Kỹ thuật & Thiết kế API',
    description: 'Tập trung cao độ hoàn thành tài liệu API cho module đồng bộ dữ liệu.',
    category: 'work',
    priority: 'P1',
    eisenhower: 'do_first',
    startDate: getInitialDateString(0),
    startTime: '10:30',
    endDate: getInitialDateString(0),
    endTime: '12:00',
    durationMinutes: 90,
    isCompleted: false,
    location: 'Bàn làm việc',
    recurrence: 'none',
    isAiGenerated: true,
    aiRationale: 'Xếp vào khung giờ tập trung buổi sáng (Peak Cognitive Hour) dựa trên thời gian rảnh 90 phút.',
    reminder: { email: true, inApp: true, minutesBefore: 30, emailSent: false },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'evt-3',
    title: 'Xử lý Email & Phản hồi đối tác khách hàng',
    description: 'Rà soát hòm thư, gửi báo cáo tiến độ và xác nhận lịch hẹn tuần tới.',
    category: 'work',
    priority: 'P3',
    eisenhower: 'delegate',
    startDate: getInitialDateString(0),
    startTime: '14:00',
    endDate: getInitialDateString(0),
    endTime: '15:00',
    durationMinutes: 60,
    isCompleted: false,
    recurrence: 'daily',
    reminder: { email: false, inApp: true, minutesBefore: 10 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'evt-4',
    title: 'Thực hành Lộ trình AI: Viết Schema JSON Structured Output',
    description: 'Chặng 1 của Mục tiêu Lộ trình AI Fullstack.',
    category: 'roadmap',
    priority: 'P2',
    eisenhower: 'schedule',
    startDate: getInitialDateString(0),
    startTime: '15:30',
    endDate: getInitialDateString(0),
    endTime: '16:45',
    durationMinutes: 75,
    isCompleted: false,
    recurrence: 'none',
    roadmapId: 'roadmap-1',
    milestoneId: 'ms-1',
    isAiGenerated: true,
    aiRationale: 'Tự động chèn từ Lộ trình mục tiêu vào khung giờ rảnh buổi chiều.',
    reminder: { email: true, inApp: true, minutesBefore: 15 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'evt-5',
    title: 'Tập thể dục & Chạy bộ rèn luyện sức khỏe',
    description: 'Chạy 4km tại công viên gần nhà kết hợp giãn cơ.',
    category: 'health',
    priority: 'P2',
    eisenhower: 'schedule',
    startDate: getInitialDateString(0),
    startTime: '17:45',
    endDate: getInitialDateString(0),
    endTime: '18:45',
    durationMinutes: 60,
    isCompleted: false,
    location: 'Công viên',
    recurrence: 'daily',
    reminder: { email: false, inApp: true, minutesBefore: 15 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Tomorrow events
  {
    id: 'evt-6',
    title: 'Workshop Tối ưu Hóa Lịch trình & Năng suất Cá nhân',
    description: 'Tham gia hội thảo trực tuyến cùng các chuyên gia quản trị thời gian.',
    category: 'study',
    priority: 'P2',
    eisenhower: 'schedule',
    startDate: getInitialDateString(1),
    startTime: '09:30',
    endDate: getInitialDateString(1),
    endTime: '11:00',
    durationMinutes: 90,
    isCompleted: false,
    location: 'Zoom Webinar',
    recurrence: 'none',
    reminder: { email: true, inApp: true, minutesBefore: 60 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'evt-7',
    title: 'Tích hợp AI Auto-Reschedule & Rebalance',
    description: 'Lộ trình Chặng 2: xây dựng thuật toán dời lịch thông minh.',
    category: 'roadmap',
    priority: 'P1',
    eisenhower: 'do_first',
    startDate: getInitialDateString(1),
    startTime: '14:00',
    endDate: getInitialDateString(1),
    endTime: '15:30',
    durationMinutes: 90,
    isCompleted: false,
    recurrence: 'none',
    roadmapId: 'roadmap-1',
    milestoneId: 'ms-2',
    isAiGenerated: true,
    aiRationale: 'Xếp lịch vào khoảng trống 90 phút chiều mai.',
    reminder: { email: true, inApp: true, minutesBefore: 30 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Day + 2
  {
    id: 'evt-8',
    title: 'Họp Tổng kết Tuần & Kế hoạch Lộ trình Tháng Tới',
    description: 'Đánh giá tỷ lệ hoàn thành mục tiêu và cân đối thời gian rảnh.',
    category: 'meeting',
    priority: 'P1',
    eisenhower: 'do_first',
    startDate: getInitialDateString(2),
    startTime: '10:00',
    endDate: getInitialDateString(2),
    endTime: '11:30',
    durationMinutes: 90,
    isCompleted: false,
    recurrence: 'weekly',
    reminder: { email: true, inApp: true, minutesBefore: 30 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export function loadEventsFromStorage(): ScheduleEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EVENTS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error loading events from storage', e);
  }
  return defaultEvents;
}

export function saveEventsToStorage(events: ScheduleEvent[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
  } catch (e) {
    console.error('Error saving events to storage', e);
  }
}

export function loadRoadmapsFromStorage(): GoalRoadmap[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ROADMAPS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error loading roadmaps from storage', e);
  }
  return defaultRoadmaps;
}

export function saveRoadmapsToStorage(roadmaps: GoalRoadmap[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ROADMAPS, JSON.stringify(roadmaps));
  } catch (e) {
    console.error('Error saving roadmaps to storage', e);
  }
}

export function loadPreferencesFromStorage(): UserPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
    if (raw) {
      return { ...defaultPreferences, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error('Error loading preferences from storage', e);
  }
  return defaultPreferences;
}

export function savePreferencesToStorage(prefs: UserPreferences): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(prefs));
  } catch (e) {
    console.error('Error saving preferences to storage', e);
  }
}

export function loadEmailLogsFromStorage(): EmailLogEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EMAIL_LOGS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error loading email logs', e);
  }
  return [
    {
      id: 'log-1',
      type: 'daily_briefing',
      toEmail: 'camvi293@gmail.com',
      subject: `🌅 [SmartSchedule] Bản tin lịch trình ngày hôm nay - 5 sự kiện & 4.5h rảnh`,
      sentAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      status: 'sent',
      previewHtml: `<div style="font-family:sans-serif;padding:20px;color:#1e293b;"><h3>Chào Cam Vi!</h3><p>Hôm nay bạn có 5 sự kiện cần chú ý và khoảng 4.5 giờ rảnh để hoàn thành công việc Deep Work.</p></div>`,
    }
  ];
}

export function saveEmailLogsToStorage(logs: EmailLogEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.EMAIL_LOGS, JSON.stringify(logs));
  } catch (e) {
    console.error('Error saving email logs', e);
  }
}

// Aliases
export const loadEvents = loadEventsFromStorage;
export const saveEvents = saveEventsToStorage;
export const loadRoadmaps = loadRoadmapsFromStorage;
export const saveRoadmaps = saveRoadmapsToStorage;
export const loadPreferences = loadPreferencesFromStorage;
export const savePreferences = savePreferencesToStorage;
export const loadEmailLogs = loadEmailLogsFromStorage;
export const saveEmailLogs = saveEmailLogsToStorage;
