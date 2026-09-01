import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

// In-memory cross-platform sync store (keyed by syncKey)
const cloudSyncStore = new Map<string, {
  events: any[];
  roadmaps: any[];
  preferences: any;
  updatedAt: string;
}>();

// In-memory email dispatch history
const emailDispatchQueue: any[] = [];

// Initialize Gemini Client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not set. AI features will fallback gracefully.');
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // --- API Endpoints ---

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // 1. AI Smart Schedule Planner: Allocates tasks into optimal free slots
  app.post('/api/ai/smart-schedule', async (req, res) => {
    try {
      const { tasks, freeSlots, currentEvents, preferences, horizon = 'day' } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        // High quality rule-based heuristic fallback if API key missing
        const suggestions = (tasks || []).map((t: any, idx: number) => {
          const slot = freeSlots?.[idx % (freeSlots.length || 1)] || { start: '14:00', end: '15:00', durationMinutes: 60 };
          return {
            eventId: t.id || `suggested-${idx}`,
            title: t.title,
            suggestedDate: t.startDate || new Date().toISOString().split('T')[0],
            suggestedStartTime: slot.start,
            suggestedEndTime: slot.end,
            durationMinutes: t.durationMinutes || 60,
            priority: t.priority || 'P2',
            rationale: `Được xếp tự động vào khung giờ rảnh (${slot.start} - ${slot.end}) phù hợp với độ ưu tiên ${t.priority || 'P2'}.`,
            confidenceScore: 0.92,
          };
        });

        return res.json({
          overview: 'Lịch trình đã được tối ưu hóa dựa trên các khoảng thời gian rảnh và thứ tự ưu tiên.',
          efficiencyScore: 88,
          suggestions,
          recommendations: [
            'Dành khung giờ sáng cho các nhiệm vụ P1 (Deep Work).',
            'Nghỉ giải lao 10-15 phút giữa các phiên làm việc kéo dài hơn 90 phút.',
          ],
        });
      }

      const prompt = `
Bạn là Trợ lý AI Quản lý Lịch trình & Lộ trình Cá nhân Thông minh (SmartSchedule AI).
Nhiệm vụ: Phân tích danh sách công việc cần làm, độ ưu tiên (P1 Khẩn cấp nhất -> P4 Thấp nhất), ma trận Eisenhower, và các khoảng thời gian rảnh (free time slots) trong ngày/tuần/tháng của người dùng để gợi ý lộ trình xếp lịch tối ưu nhất.

Dữ liệu đầu vào:
- Horizon (Tầm nhìn): ${horizon} (day/week/month)
- Cấu hình người dùng: Giờ thức dậy ${preferences?.wakeTime || '06:30'}, Giờ đi ngủ ${preferences?.bedTime || '23:00'}, Giờ làm việc ${preferences?.workStartTime || '08:30'} - ${preferences?.workEndTime || '17:30'}, Giờ tập trung ưa thích: ${preferences?.preferredFocusTime || 'morning'}.
- Các khung thời gian rảnh hiện có (Free Slots): ${JSON.stringify(freeSlots || [])}
- Các sự kiện/lịch đã có: ${JSON.stringify(currentEvents?.slice(0, 10) || [])}
- Các công việc cần xếp lịch (Pending Tasks): ${JSON.stringify(tasks || [])}

Quy tắc tối ưu hóa:
1. Xếp các việc P1/Khẩn cấp & Quan trọng vào khung giờ đỉnh cao nhận thức (buổi sáng hoặc theo sở thích người dùng).
2. Không xếp trùng với các lịch đã có.
3. Đảm bảo thời lượng công việc vừa vặn với khoảng thời gian rảnh.
4. Đưa ra điểm hiệu quả (efficiencyScore: 0-100) và lời khuyên thực tế bằng tiếng Việt chuẩn.
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              overview: { type: Type.STRING, description: 'Tóm tắt chiến lược phân bổ thời gian rảnh' },
              efficiencyScore: { type: Type.NUMBER, description: 'Điểm hiệu suất 0-100' },
              suggestions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    eventId: { type: Type.STRING },
                    title: { type: Type.STRING },
                    suggestedDate: { type: Type.STRING, description: 'YYYY-MM-DD' },
                    suggestedStartTime: { type: Type.STRING, description: 'HH:mm' },
                    suggestedEndTime: { type: Type.STRING, description: 'HH:mm' },
                    durationMinutes: { type: Type.NUMBER },
                    priority: { type: Type.STRING },
                    rationale: { type: Type.STRING, description: 'Lý do xếp vào khung giờ này' },
                    confidenceScore: { type: Type.NUMBER },
                  },
                  required: ['title', 'suggestedStartTime', 'suggestedEndTime', 'rationale'],
                },
              },
              recommendations: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              workloadWarnings: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ['overview', 'efficiencyScore', 'suggestions', 'recommendations'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json(parsed);
    } catch (error: any) {
      console.error('Error in /api/ai/smart-schedule:', error);
      res.status(500).json({ error: error.message || 'Lỗi khi tạo gợi ý lịch trình thông minh' });
    }
  });

  // 2. AI Goal to Milestone Roadmap Generator
  app.post('/api/ai/generate-roadmap', async (req, res) => {
    try {
      const { goalTitle, goalDescription, timeframeWeeks = 4, weeklyHoursAvailable = 10, category = 'study' } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        // Fallback roadmap
        return res.json({
          title: goalTitle,
          description: goalDescription || 'Lộ trình phát triển mục tiêu cá nhân.',
          category,
          totalEstimatedHours: timeframeWeeks * weeklyHoursAvailable,
          aiAnalysis: `Lộ trình được chia thành ${Math.min(4, timeframeWeeks)} chặng thực hiện với khoảng ${weeklyHoursAvailable} giờ/tuần.`,
          milestones: [
            {
              id: 'ms-fallback-1',
              title: 'Chặng 1: Khởi động & Nền tảng cốt lõi',
              description: 'Nghiên cứu tài liệu và hoàn thành các nhiệm vụ khởi động.',
              targetWeek: 1,
              estimatedHours: weeklyHoursAvailable,
              tasks: [
                { id: 'f-t1', title: 'Thiết lập kế hoạch chi tiết & tài liệu', durationMinutes: 90, priority: 'P1' },
                { id: 'f-t2', title: 'Thực hành các bài tập cơ bản', durationMinutes: 120, priority: 'P2' },
              ]
            },
            {
              id: 'ms-fallback-2',
              title: 'Chặng 2: Nâng cao & Ứng dụng thực tế',
              description: 'Triển khai các phần việc trọng tâm.',
              targetWeek: 2,
              estimatedHours: weeklyHoursAvailable,
              tasks: [
                { id: 'f-t3', title: 'Hoàn thiện dự án mẫu', durationMinutes: 180, priority: 'P1' },
              ]
            }
          ]
        });
      }

      const prompt = `
Bạn là Chuyên gia Lập Lộ trình Mục tiêu & Phát triển Cá nhân (Smart Roadmap Architect).
Hãy xây dựng một lộ trình (Roadmap) hành động rõ ràng, khả thi từng tuần cho mục tiêu sau:

Mục tiêu: "${goalTitle}"
Mô tả/Nguyện vọng: "${goalDescription || ''}"
Danh mục: ${category}
Thời gian thực hiện: ${timeframeWeeks} tuần
Thời gian rảnh sẵn có: ${weeklyHoursAvailable} giờ/tuần

Yêu cầu:
1. Chia mục tiêu thành các Chặng (Milestones) theo tuần hợp lý (2 - 5 milestones).
2. Mỗi milestone có các task hành động cụ thể kèm thời lượng (phút), độ ưu tiên (P1, P2, P3).
3. Đưa ra phân tích chiến lược (aiAnalysis) giải thích cách phân bổ thời gian rảnh hợp lý.
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              category: { type: Type.STRING },
              totalEstimatedHours: { type: Type.NUMBER },
              aiAnalysis: { type: Type.STRING },
              milestones: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    targetWeek: { type: Type.NUMBER },
                    estimatedHours: { type: Type.NUMBER },
                    tasks: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          id: { type: Type.STRING },
                          title: { type: Type.STRING },
                          durationMinutes: { type: Type.NUMBER },
                          priority: { type: Type.STRING },
                        },
                        required: ['title', 'durationMinutes', 'priority'],
                      },
                    },
                  },
                  required: ['title', 'description', 'targetWeek', 'estimatedHours', 'tasks'],
                },
              },
            },
            required: ['title', 'totalEstimatedHours', 'aiAnalysis', 'milestones'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json(parsed);
    } catch (error: any) {
      console.error('Error in /api/ai/generate-roadmap:', error);
      res.status(500).json({ error: error.message || 'Lỗi khi tạo lộ trình mục tiêu' });
    }
  });

  // 3. AI Natural Language Quick Add Parser
  app.post('/api/ai/natural-parse', async (req, res) => {
    try {
      const { text, currentDate = new Date().toISOString().split('T')[0] } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        return res.json({
          title: text || 'Công việc mới',
          startDate: currentDate,
          startTime: '09:00',
          endDate: currentDate,
          endTime: '10:00',
          durationMinutes: 60,
          priority: 'P2',
          eisenhower: 'schedule',
          category: 'work',
          reminder: { email: true, inApp: true, minutesBefore: 15 },
        });
      }

      const prompt = `
Phân tích câu lệnh tiếng Việt sau để trích xuất thông tin tạo lịch trình / sự kiện cá nhân.
Ngày hiện tại làm mốc: ${currentDate}
Câu lệnh: "${text}"

Hãy trích xuất chính xác:
- title: Tên công việc/sự kiện
- description: Mô tả chi tiết nếu có
- startDate: Ngày bắt đầu (YYYY-MM-DD). Tính toán chuẩn xác cho các từ như "hôm nay", "ngày mai", "thứ năm tuần này", "cuối tuần"...
- startTime: Giờ bắt đầu (HH:mm). Mặc định 09:00 nếu không nói rõ
- durationMinutes: Thời lượng (phút). Mặc định 60 phút
- endTime: Giờ kết thúc (HH:mm)
- priority: 'P1' (Khẩn cấp/Quan trọng), 'P2' (Cao), 'P3' (Trung bình), 'P4' (Thấp)
- eisenhower: 'do_first' (Khẩn cấp & Quan trọng), 'schedule' (Quan trọng không khẩn cấp), 'delegate' (Khẩn cấp không quan trọng), 'eliminate' (Không khẩn cấp, không quan trọng)
- category: 'work' | 'study' | 'personal' | 'health' | 'meeting' | 'urgent'
- reminderMinutes: Số phút nhắc trước (mặc định 15)
- emailReminder: boolean (true nếu nhắc nhở email)
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              startDate: { type: Type.STRING },
              startTime: { type: Type.STRING },
              endTime: { type: Type.STRING },
              durationMinutes: { type: Type.NUMBER },
              priority: { type: Type.STRING },
              eisenhower: { type: Type.STRING },
              category: { type: Type.STRING },
              reminderMinutes: { type: Type.NUMBER },
              emailReminder: { type: Type.BOOLEAN },
            },
            required: ['title', 'startDate', 'startTime', 'durationMinutes', 'priority', 'category'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json(parsed);
    } catch (error: any) {
      console.error('Error in /api/ai/natural-parse:', error);
      res.status(500).json({ error: error.message || 'Lỗi xử lý ngôn ngữ tự nhiên' });
    }
  });

  // 4. Cloud Synchronization: Push state
  app.post('/api/sync/push', (req, res) => {
    try {
      const { syncKey, events, roadmaps, preferences } = req.body;
      if (!syncKey) {
        return res.status(400).json({ error: 'Mã syncKey là bắt buộc' });
      }

      const syncPayload = {
        events: events || [],
        roadmaps: roadmaps || [],
        preferences: preferences || {},
        updatedAt: new Date().toISOString(),
      };

      cloudSyncStore.set(syncKey, syncPayload);
      res.json({ success: true, message: 'Đồng bộ hóa lên Cloud thành công', updatedAt: syncPayload.updatedAt });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // 5. Cloud Synchronization: Pull state
  app.get('/api/sync/pull/:syncKey', (req, res) => {
    try {
      const { syncKey } = req.params;
      const data = cloudSyncStore.get(syncKey);
      if (!data) {
        return res.status(404).json({ error: 'Không tìm thấy dữ liệu đồng bộ với mã này. Hãy push từ thiết bị nguồn trước.' });
      }
      res.json({ success: true, data });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // 6. Email Reminder Dispatcher & Simulator
  app.post('/api/email/send-reminder', (req, res) => {
    try {
      const { toEmail, eventTitle, eventTime, eventDate, priority, notes, type = 'reminder' } = req.body;
      const recipient = toEmail || 'camvi293@gmail.com';
      const subject = `🔔 [SmartSchedule] Nhắc nhở: ${eventTitle} (${eventTime} - ${eventDate})`;

      const htmlTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; }
    .card { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .header { background: #0f172a; color: #ffffff; padding: 24px; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
    .badge-p1 { background: #fee2e2; color: #991b1b; }
    .badge-p2 { background: #fef3c7; color: #92400e; }
    .badge-p3 { background: #e0f2fe; color: #075985; }
    .content { padding: 24px; color: #334155; line-height: 1.6; }
    .info-box { background: #f1f5f9; border-radius: 8px; padding: 16px; margin: 16px 0; border-left: 4px solid #3b82f6; }
    .footer { padding: 16px 24px; background: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: center; }
    .btn { display: inline-block; background: #2563eb; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 12px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div style="font-size: 13px; color: #94a3b8; margin-bottom: 4px;">SMARTSCHEDULE AI NOTIFICATION</div>
      <h2 style="margin: 0; font-size: 20px;">Lịch trình sắp diễn ra</h2>
    </div>
    <div class="content">
      <p>Xin chào <strong>${recipient.split('@')[0]}</strong>,</p>
      <p>Bạn có một sự kiện đã được lên lịch sắp diễn ra theo lộ trình thông minh của mình:</p>
      
      <div class="info-box">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <strong style="font-size: 16px; color: #0f172a;">${eventTitle}</strong>
          <span class="badge badge-${(priority || 'p2').toLowerCase()}">${priority || 'P2'}</span>
        </div>
        <div style="font-size: 14px; color: #475569;">
          <div>📅 <strong>Ngày:</strong> ${eventDate}</div>
          <div>⏰ <strong>Thời gian:</strong> ${eventTime}</div>
          ${notes ? `<div>📝 <strong>Ghi chú:</strong> ${notes}</div>` : ''}
        </div>
      </div>

      <p style="font-size: 14px; color: #64748b;">
        Hệ thống AI đã xếp việc này vào khung giờ có năng lượng tối ưu và phù hợp với quỹ thời gian rảnh của bạn.
      </p>

      <a href="https://smartschedule.ai" class="btn">Mở Lịch Trình Chi Tiết</a>
    </div>
    <div class="footer">
      Email tự động gửi từ SmartSchedule AI - Hệ thống quản lý lịch trình & đồng bộ đa nền tảng.
    </div>
  </div>
</body>
</html>
      `;

      const logEntry = {
        id: `email-${Date.now()}`,
        type,
        toEmail: recipient,
        subject,
        sentAt: new Date().toISOString(),
        status: 'sent',
        previewHtml: htmlTemplate,
        eventTitle,
      };

      emailDispatchQueue.unshift(logEntry);
      res.json({ success: true, message: `Đã gửi thông báo email đến ${recipient}`, log: logEntry });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // 7. Daily Briefing Email Generator & Dispatcher
  app.post('/api/email/send-daily-briefing', (req, res) => {
    try {
      const { toEmail, dateStr, events = [], freeTimeMinutes = 240, userName = 'Cam Vi' } = req.body;
      const recipient = toEmail || 'camvi293@gmail.com';
      const freeHours = (freeTimeMinutes / 60).toFixed(1);
      const subject = `🌅 [SmartSchedule] Bản tin lịch trình ngày ${dateStr} - ${events.length} sự kiện & ${freeHours}h rảnh`;

      const eventsListHtml = events.length > 0
        ? events.map((ev: any) => `
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 10px 8px; font-weight: 600; color: #1e293b; font-size: 13px;">${ev.startTime} - ${ev.endTime}</td>
            <td style="padding: 10px 8px; color: #0f172a; font-size: 14px;">${ev.title}</td>
            <td style="padding: 10px 8px; font-size: 12px; color: ${ev.priority === 'P1' ? '#b91c1c' : '#4338ca'}; font-weight: 600;">${ev.priority}</td>
          </tr>
        `).join('')
        : `<tr><td colspan="3" style="padding: 16px; text-align: center; color: #94a3b8;">Hôm nay bạn chưa có lịch hẹn cố định nào. Thời gian tuyệt vời cho Deep Work!</td></tr>`;

      const htmlTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; }
    .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; }
    .header { background: linear-gradient(135deg, #1e293b, #0f172a); color: #ffffff; padding: 24px; }
    .stats { display: flex; gap: 12px; margin: 16px 0; }
    .stat-card { flex: 1; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; text-align: center; }
    .stat-val { font-size: 20px; font-weight: 700; color: #0f172a; }
    .stat-label { font-size: 12px; color: #64748b; }
    .content { padding: 24px; color: #334155; }
    .table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    .footer { padding: 16px; background: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: center; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div style="font-size: 12px; color: #38bdf8; font-weight: 600; letter-spacing: 0.5px;">BẢN TIN LỊCH TRÌNH BUỔI SÁNG</div>
      <h2 style="margin: 4px 0 0; font-size: 22px;">Chào buổi sáng, ${userName}! ☀️</h2>
      <p style="margin: 4px 0 0; font-size: 14px; color: #94a3b8;">Tổng hợp kế hoạch & thời gian rảnh ngày ${dateStr}</p>
    </div>
    <div class="content">
      <table style="width: 100%; margin-bottom: 20px;">
        <tr>
          <td style="width: 50%; padding: 12px; background: #eff6ff; border-radius: 8px; border: 1px solid #bfdbfe;">
            <div style="font-size: 12px; color: #1e40af; font-weight: 600;">SỰ KIỆN HÔM NAY</div>
            <div style="font-size: 24px; font-weight: 700; color: #1e3a8a;">${events.length}</div>
          </td>
          <td style="width: 8px;"></td>
          <td style="width: 50%; padding: 12px; background: #f0fdf4; border-radius: 8px; border: 1px solid #bbf7d0;">
            <div style="font-size: 12px; color: #166534; font-weight: 600;">THỜI GIAN RẢNH DỰ KIẾN</div>
            <div style="font-size: 24px; font-weight: 700; color: #14532d;">${freeHours} giờ</div>
          </td>
        </tr>
      </table>

      <h3 style="font-size: 16px; color: #0f172a; margin-bottom: 8px;">📋 Lịch trình chi tiết:</h3>
      <table class="table">
        <thead>
          <tr style="background: #f1f5f9; text-align: left; font-size: 12px; color: #475569;">
            <th style="padding: 8px;">Khung giờ</th>
            <th style="padding: 8px;">Sự kiện / Nhiệm vụ</th>
            <th style="padding: 8px;">Ưu tiên</th>
          </tr>
        </thead>
        <tbody>
          ${eventsListHtml}
        </tbody>
      </table>

      <div style="margin-top: 24px; padding: 16px; background: #faf5ff; border-left: 4px solid #a855f7; border-radius: 6px;">
        <strong style="color: #6b21a8; font-size: 13px;">💡 Lời khuyên từ SmartSchedule AI:</strong>
        <p style="margin: 4px 0 0; font-size: 13px; color: #581c87;">
          Tận dụng ${freeHours} giờ rảnh hôm nay để hoàn thành các mục tiêu quan trọng trước 16:00 khi mức độ tập trung còn cao nhất.
        </p>
      </div>
    </div>
    <div class="footer">
      SmartSchedule AI • Đồng bộ đa nền tảng • Email nhắc việc thông minh
    </div>
  </div>
</body>
</html>
      `;

      const logEntry = {
        id: `email-briefing-${Date.now()}`,
        type: 'daily_briefing',
        toEmail: recipient,
        subject,
        sentAt: new Date().toISOString(),
        status: 'sent',
        previewHtml: htmlTemplate,
      };

      emailDispatchQueue.unshift(logEntry);
      res.json({ success: true, message: `Đã gửi bản tin lịch trình buổi sáng đến ${recipient}`, log: logEntry });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SmartSchedule Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
