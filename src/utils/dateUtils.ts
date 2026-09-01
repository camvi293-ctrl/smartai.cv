import { ScheduleEvent, DayFreeTimeSummary, UserPreferences } from '../types';

export function timeStringToMinutes(time: string): number {
  if (!time) return 0;
  const [h, m] = time.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function minutesToTimeString(minutes: number): string {
  const normalized = Math.max(0, Math.min(1439, Math.floor(minutes)));
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function formatDateToYYYYMMDD(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseYYYYMMDD(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function formatVietnameseDate(dateStr: string, includeDayOfWeek = true): string {
  if (!dateStr) return '';
  const date = parseYYYYMMDD(dateStr);
  const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const dayName = days[date.getDay()];
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  
  if (includeDayOfWeek) {
    return `${dayName}, ${day}/${month}/${year}`;
  }
  return `${day}/${month}/${year}`;
}

export function getWeekDays(currentDate: Date): Date[] {
  const date = new Date(currentDate);
  const day = date.getDay();
  // We make Monday index 0, Sunday index 6
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(date);
  monday.setDate(date.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const nextDay = new Date(monday);
    nextDay.setDate(monday.getDate() + i);
    days.push(nextDay);
  }
  return days;
}

export function getMonthDays(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  const days: Date[] = [];
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d));
  }
  return days;
}

export function calculateDayFreeTime(
  dateStr: string,
  events: ScheduleEvent[],
  prefs: UserPreferences
): DayFreeTimeSummary {
  const date = parseYYYYMMDD(dateStr);
  const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  const dayOfWeek = days[date.getDay()];

  const dayStart = timeStringToMinutes(prefs.wakeTime || '07:00');
  const dayEnd = timeStringToMinutes(prefs.bedTime || '23:00');
  const totalActiveMinutes = Math.max(0, dayEnd - dayStart);

  // Filter events for this day
  const dayEvents = events.filter(e => e.startDate === dateStr && !e.isAllDay);

  // Busy intervals
  const busyIntervals: { start: number; end: number; title: string; category: any }[] = [];

  // Optional: add lunch break as busy
  if (prefs.lunchStartTime && prefs.lunchEndTime) {
    const lunchStart = timeStringToMinutes(prefs.lunchStartTime);
    const lunchEnd = timeStringToMinutes(prefs.lunchEndTime);
    if (lunchEnd > lunchStart) {
      busyIntervals.push({
        start: lunchStart,
        end: lunchEnd,
        title: 'Nghỉ trưa',
        category: 'health',
      });
    }
  }

  for (const ev of dayEvents) {
    const evStart = timeStringToMinutes(ev.startTime);
    const evEnd = timeStringToMinutes(ev.endTime);
    if (evEnd > evStart) {
      busyIntervals.push({
        start: evStart,
        end: evEnd,
        title: ev.title,
        category: ev.category,
      });
    }
  }

  // Sort busy intervals by start time
  busyIntervals.sort((a, b) => a.start - b.start);

  // Merge overlapping busy intervals
  const mergedBusy: { start: number; end: number }[] = [];
  for (const interval of busyIntervals) {
    const clampedStart = Math.max(dayStart, Math.min(dayEnd, interval.start));
    const clampedEnd = Math.max(dayStart, Math.min(dayEnd, interval.end));
    if (clampedEnd <= clampedStart) continue;

    if (mergedBusy.length === 0) {
      mergedBusy.push({ start: clampedStart, end: clampedEnd });
    } else {
      const last = mergedBusy[mergedBusy.length - 1];
      if (clampedStart <= last.end) {
        last.end = Math.max(last.end, clampedEnd);
      } else {
        mergedBusy.push({ start: clampedStart, end: clampedEnd });
      }
    }
  }

  // Calculate free slots
  const freeSlots: { start: string; end: string; durationMinutes: number }[] = [];
  let currentPointer = dayStart;
  let totalBusyMinutes = 0;

  for (const busy of mergedBusy) {
    totalBusyMinutes += (busy.end - busy.start);
    if (busy.start > currentPointer) {
      const duration = busy.start - currentPointer;
      if (duration >= 15) { // minimum 15 mins to be considered a viable free slot
        freeSlots.push({
          start: minutesToTimeString(currentPointer),
          end: minutesToTimeString(busy.start),
          durationMinutes: duration,
        });
      }
    }
    currentPointer = Math.max(currentPointer, busy.end);
  }

  if (currentPointer < dayEnd) {
    const duration = dayEnd - currentPointer;
    if (duration >= 15) {
      freeSlots.push({
        start: minutesToTimeString(currentPointer),
        end: minutesToTimeString(dayEnd),
        durationMinutes: duration,
      });
    }
  }

  const totalFreeMinutes = Math.max(0, totalActiveMinutes - totalBusyMinutes);
  const utilizationRate = totalActiveMinutes > 0 
    ? Math.min(100, Math.round((totalBusyMinutes / totalActiveMinutes) * 100))
    : 0;

  return {
    date: dateStr,
    dayOfWeek,
    totalFreeMinutes,
    totalBusyMinutes,
    freeSlots,
    busySlots: busyIntervals.map(b => ({
      start: minutesToTimeString(b.start),
      end: minutesToTimeString(b.end),
      title: b.title,
      category: b.category,
    })),
    utilizationRate,
  };
}

export function calculateWeekFreeTime(
  currentDate: Date,
  events: ScheduleEvent[],
  prefs: UserPreferences
): { days: DayFreeTimeSummary[]; totalFreeMinutes: number; totalBusyMinutes: number; averageUtilization: number } {
  const weekDays = getWeekDays(currentDate);
  const daysSummary = weekDays.map(d => calculateDayFreeTime(formatDateToYYYYMMDD(d), events, prefs));
  
  const totalFreeMinutes = daysSummary.reduce((acc, d) => acc + d.totalFreeMinutes, 0);
  const totalBusyMinutes = daysSummary.reduce((acc, d) => acc + d.totalBusyMinutes, 0);
  const averageUtilization = daysSummary.length > 0
    ? Math.round(daysSummary.reduce((acc, d) => acc + d.utilizationRate, 0) / daysSummary.length)
    : 0;

  return {
    days: daysSummary,
    totalFreeMinutes,
    totalBusyMinutes,
    averageUtilization,
  };
}

export function calculateMonthFreeTime(
  year: number,
  month: number,
  events: ScheduleEvent[],
  prefs: UserPreferences
): { totalFreeMinutes: number; totalBusyMinutes: number; averageUtilization: number; daysCount: number } {
  const days = getMonthDays(year, month);
  const summaries = days.map(d => calculateDayFreeTime(formatDateToYYYYMMDD(d), events, prefs));
  
  const totalFreeMinutes = summaries.reduce((acc, d) => acc + d.totalFreeMinutes, 0);
  const totalBusyMinutes = summaries.reduce((acc, d) => acc + d.totalBusyMinutes, 0);
  const averageUtilization = summaries.length > 0
    ? Math.round(summaries.reduce((acc, d) => acc + d.utilizationRate, 0) / summaries.length)
    : 0;

  return {
    totalFreeMinutes,
    totalBusyMinutes,
    averageUtilization,
    daysCount: days.length,
  };
}

export function formatMinutesToHumanReadable(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} phút`;
  if (m === 0) return `${h} giờ`;
  return `${h}h ${m}p`;
}
