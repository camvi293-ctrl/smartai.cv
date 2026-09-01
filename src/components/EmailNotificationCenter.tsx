import React, { useState } from 'react';
import { 
  Mail, 
  X, 
  Send, 
  CheckCircle2, 
  Clock, 
  Eye, 
  Sparkles, 
  Sun, 
  Calendar, 
  Bell, 
  Check, 
  AlertCircle 
} from 'lucide-react';
import { UserPreferences, EmailLogEntry, ScheduleEvent } from '../types';
import { formatDateToYYYYMMDD, formatVietnameseDate } from '../utils/dateUtils';

interface EmailNotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: UserPreferences;
  onUpdatePreferences: (newPrefs: UserPreferences) => void;
  emailLogs: EmailLogEntry[];
  events: ScheduleEvent[];
  onTriggerDailyBriefing: () => void;
}

export const EmailNotificationCenter: React.FC<EmailNotificationCenterProps> = ({
  isOpen,
  onClose,
  preferences,
  onUpdatePreferences,
  emailLogs,
  events,
  onTriggerDailyBriefing,
}) => {
  const [emailInput, setEmailInput] = useState(preferences.userEmail);
  const [isEmailSaved, setIsEmailSaved] = useState(false);
  const [previewHtmlContent, setPreviewHtmlContent] = useState<string | null>(null);
  const [isSendingBriefing, setIsSendingBriefing] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  if (!isOpen) return null;

  const handleSaveEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    onUpdatePreferences({
      ...preferences,
      userEmail: emailInput.trim(),
    });
    setIsEmailSaved(true);
    setTimeout(() => setIsEmailSaved(false), 3000);
  };

  const handleSendInstantBriefing = async () => {
    setIsSendingBriefing(true);
    setFeedbackMsg('');
    try {
      await onTriggerDailyBriefing();
      setFeedbackMsg('Đã gửi bản tin lịch trình buổi sáng thành công!');
    } catch (e: any) {
      setFeedbackMsg('Lỗi gửi email: ' + e.message);
    } finally {
      setIsSendingBriefing(false);
      setTimeout(() => setFeedbackMsg(''), 5000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-rose-100 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-8 text-slate-800">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-rose-100 bg-gradient-to-r from-rose-50 via-pink-50 to-emerald-50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 text-white font-bold shadow-xs">
              <Mail className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                Trung Tâm Thông Báo & Nhắc Nhở Email
                <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full">
                  Active
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Nhận email nhắc việc tức thời, bản tin lịch trình đầu ngày và tổng kết lộ trình tuần
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
          
          {/* Email Settings Box */}
          <div className="p-4 bg-rose-50/30 rounded-xl border border-rose-100 space-y-4">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-pink-600" />
              Cấu hình Hòm Thư Nhận Thông Báo
            </h4>

            <form onSubmit={handleSaveEmail} className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="camvi293@gmail.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-rose-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-pink-500 font-mono"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-xs"
              >
                {isEmailSaved ? <Check className="w-4 h-4" /> : null}
                <span>{isEmailSaved ? 'Đã Lưu!' : 'Lưu Email'}</span>
              </button>
            </form>

            {/* Notification Toggles */}
            <div className="space-y-3 pt-2 border-t border-rose-100">
              <label className="flex items-center justify-between text-xs cursor-pointer">
                <div>
                  <div className="font-semibold text-slate-800">Kích hoạt thông báo nhắc việc qua Email</div>
                  <div className="text-slate-500 text-[11px]">Tự động gửi email trước khi sự kiện hoặc nhiệm vụ bắt đầu</div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.emailNotificationsEnabled}
                  onChange={(e) => onUpdatePreferences({ ...preferences, emailNotificationsEnabled: e.target.checked })}
                  className="rounded bg-white border-rose-300 text-pink-500 focus:ring-pink-400 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between text-xs cursor-pointer">
                <div>
                  <div className="font-semibold text-slate-800">Bản tin lịch trình mỗi buổi sáng (Daily Morning Briefing)</div>
                  <div className="text-slate-500 text-[11px]">Gửi tổng hợp các sự kiện trong ngày và khoảng thời gian rảnh lúc 07:00</div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.dailyBriefingEmail}
                  onChange={(e) => onUpdatePreferences({ ...preferences, dailyBriefingEmail: e.target.checked })}
                  className="rounded bg-white border-rose-300 text-pink-500 focus:ring-pink-400 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between text-xs cursor-pointer">
                <div>
                  <div className="font-semibold text-slate-800">Tổng kết Lộ trình hàng tuần (Weekly Review Digest)</div>
                  <div className="text-slate-500 text-[11px]">Báo cáo tiến độ hoàn thành các chặng mục tiêu vào Chủ nhật</div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.weeklyDigestEmail}
                  onChange={(e) => onUpdatePreferences({ ...preferences, weeklyDigestEmail: e.target.checked })}
                  className="rounded bg-white border-rose-300 text-pink-500 focus:ring-pink-400 w-4 h-4"
                />
              </label>
            </div>
          </div>

          {/* Quick Actions Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 bg-gradient-to-r from-pink-50/70 via-rose-50/50 to-emerald-50/60 rounded-xl border border-pink-200">
            <div className="text-xs text-slate-700">
              <span className="font-bold text-pink-700">Thử nghiệm ngay:</span> Gửi bản tin buổi sáng tổng hợp {events.length} lịch hẹn hôm nay đến hòm thư <strong className="font-mono text-slate-900">{preferences.userEmail}</strong>
            </div>

            <button
              onClick={handleSendInstantBriefing}
              disabled={isSendingBriefing}
              className="px-3.5 py-2 bg-white hover:bg-rose-50 text-pink-700 border border-pink-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap shadow-xs disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5 text-pink-600" />
              <span>{isSendingBriefing ? 'Đang gửi...' : 'Gửi Thử Bản Tin Ngay'}</span>
            </button>
          </div>

          {feedbackMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{feedbackMsg}</span>
            </div>
          )}

          {/* Dispatch Logs & HTML Previews */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
              <span>Nhật ký Email đã phát ({emailLogs.length})</span>
              <span className="text-[11px] text-slate-400 font-normal">Nhấp để xem trước template HTML</span>
            </h4>

            {emailLogs.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400 bg-rose-50/20 rounded-xl border border-rose-100">
                Chưa có email nào được gửi.
              </div>
            ) : (
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {emailLogs.map(log => (
                  <div
                    key={log.id}
                    className="p-3 bg-white border border-rose-100 hover:border-pink-200 rounded-xl flex items-center justify-between gap-3 text-xs shadow-xs"
                  >
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="font-bold text-slate-800 truncate">{log.subject}</span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
                        <span>Đến: {log.toEmail}</span>
                        <span>•</span>
                        <span>{new Date(log.sentAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setPreviewHtmlContent(log.previewHtml)}
                      className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-slate-700 hover:text-slate-900 border border-rose-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors flex-shrink-0"
                      title="Xem trước mẫu email HTML"
                    >
                      <Eye className="w-3.5 h-3.5 text-pink-600" />
                      <span>Xem HTML</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* HTML Email Template Preview Modal */}
      {previewHtmlContent && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden text-slate-900 border border-rose-100">
            <div className="p-3.5 bg-rose-50 border-b border-rose-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-pink-600" />
                Xem trước giao diện Email thực tế
              </span>
              <button
                onClick={() => setPreviewHtmlContent(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 max-h-[70vh] overflow-y-auto">
              <div 
                dangerouslySetInnerHTML={{ __html: previewHtmlContent }} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
