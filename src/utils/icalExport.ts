import { ScheduleEvent } from '../types';

export function exportEventsToICS(events: ScheduleEvent[]): string {
  const formatICSDate = (dateStr: string, timeStr: string) => {
    const cleanDate = dateStr.replace(/-/g, '');
    const cleanTime = timeStr.replace(/:/g, '') + '00';
    return `${cleanDate}T${cleanTime}`;
  };

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SmartSchedule AI//Personal Smart Calendar//VI',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:SmartSchedule AI Calendar',
    'X-WR-TIMEZONE:Asia/Ho_Chi_Minh',
  ];

  for (const ev of events) {
    const startIso = formatICSDate(ev.startDate, ev.startTime || '09:00');
    const endIso = formatICSDate(ev.endDate || ev.startDate, ev.endTime || '10:00');
    const nowIso = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    lines.push(
      'BEGIN:VEVENT',
      `UID:${ev.id}@smartschedule.ai`,
      `DTSTAMP:${nowIso}`,
      `DTSTART:${startIso}`,
      `DTEND:${endIso}`,
      `SUMMARY:${ev.title.replace(/,/g, '\\,')}`,
      `DESCRIPTION:${(ev.description || '').replace(/\n/g, '\\n')}`,
      `PRIORITY:${ev.priority === 'P1' ? '1' : ev.priority === 'P2' ? '3' : ev.priority === 'P3' ? '5' : '9'}`,
      `CATEGORIES:${ev.category.toUpperCase()}`,
      `STATUS:${ev.isCompleted ? 'COMPLETED' : 'CONFIRMED'}`,
      'END:VEVENT'
    );
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

export function downloadICSFile(events: ScheduleEvent[], filename = 'smart_schedule_calendar.ics') {
  const icsData = exportEventsToICS(events);
  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
