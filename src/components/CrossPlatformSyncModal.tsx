import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  X, 
  Download, 
  Upload, 
  QrCode, 
  Copy, 
  Check, 
  RefreshCw, 
  Smartphone, 
  Laptop, 
  Share2, 
  Calendar,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import QRCode from 'qrcode';
import { ScheduleEvent, GoalRoadmap, UserPreferences } from '../types';
import { downloadICSFile } from '../utils/icalExport';

interface CrossPlatformSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: UserPreferences;
  onUpdatePreferences: (newPrefs: UserPreferences) => void;
  events: ScheduleEvent[];
  roadmaps: GoalRoadmap[];
  onImportState: (importedData: { events?: ScheduleEvent[]; roadmaps?: GoalRoadmap[]; preferences?: UserPreferences }) => void;
}

export const CrossPlatformSyncModal: React.FC<CrossPlatformSyncModalProps> = ({
  isOpen,
  onClose,
  preferences,
  onUpdatePreferences,
  events,
  roadmaps,
  onImportState,
}) => {
  const [syncKeyInput, setSyncKeyInput] = useState(preferences.syncKey);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSyncKeyInput(preferences.syncKey);
      // Generate QR Code containing sync key pairing URL
      const pairingUrl = `${window.location.origin}/?syncKey=${preferences.syncKey}`;
      QRCode.toDataURL(pairingUrl, { width: 200, margin: 1, color: { dark: '#0f172a', light: '#ffffff' } })
        .then(url => setQrCodeUrl(url))
        .catch(err => console.error(err));
    }
  }, [isOpen, preferences.syncKey]);

  if (!isOpen) return null;

  const handleCopySyncKey = () => {
    navigator.clipboard.writeText(preferences.syncKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2500);
  };

  const handlePushToCloud = async () => {
    setIsPushing(true);
    setStatusMessage(null);
    try {
      const response = await fetch('/api/sync/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          syncKey: preferences.syncKey,
          events,
          roadmaps,
          preferences,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Lỗi đồng bộ');

      onUpdatePreferences({
        ...preferences,
        lastSyncedAt: new Date().toISOString(),
      });
      setStatusMessage({ type: 'success', text: 'Đã đẩy dữ liệu mới nhất lên Cloud thành công!' });
    } catch (e: any) {
      setStatusMessage({ type: 'error', text: e.message || 'Lỗi khi đồng bộ lên Cloud' });
    } finally {
      setIsPushing(false);
    }
  };

  const handlePullFromCloud = async () => {
    if (!syncKeyInput.trim()) return;
    setIsPulling(true);
    setStatusMessage(null);
    try {
      const response = await fetch(`/api/sync/pull/${encodeURIComponent(syncKeyInput.trim())}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Không tìm thấy dữ liệu');

      if (data.data) {
        onImportState(data.data);
        onUpdatePreferences({
          ...preferences,
          syncKey: syncKeyInput.trim(),
          lastSyncedAt: new Date().toISOString(),
        });
        setStatusMessage({ type: 'success', text: 'Đã tải và hợp nhất dữ liệu từ thiết bị khác thành công!' });
      }
    } catch (e: any) {
      setStatusMessage({ type: 'error', text: e.message || 'Lỗi khi kéo dữ liệu' });
    } finally {
      setIsPulling(false);
    }
  };

  const handleExportJSON = () => {
    const data = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      events,
      roadmaps,
      preferences,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `smartschedule_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        onImportState(parsed);
        setStatusMessage({ type: 'success', text: 'Khôi phục dữ liệu từ file JSON thành công!' });
      } catch (err) {
        setStatusMessage({ type: 'error', text: 'File JSON không hợp lệ' });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-rose-100 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-8 text-slate-800">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-rose-100 bg-gradient-to-r from-rose-50 via-pink-50 to-emerald-50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-xs">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                Đồng Bộ Đa Nền Tảng & Xuất Dữ Liệu
              </h3>
              <p className="text-xs text-slate-500">
                Đồng bộ hóa tức thời giữa Điện thoại, Máy tính bảng và Máy tính qua Cloud hoặc mã QR
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
          
          {/* Status alert message */}
          {statusMessage && (
            <div className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 font-medium ${
              statusMessage.type === 'success' 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}>
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Sync Key & QR code card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-rose-50/30 rounded-2xl border border-rose-100">
            {/* Left: Sync Code & Actions */}
            <div className="space-y-3 flex flex-col justify-between">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Mã Đồng Bộ Riêng Của Bạn (Sync Key)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={preferences.syncKey}
                    readOnly
                    className="w-full px-3 py-2 bg-white border border-rose-200 rounded-xl text-sm font-mono font-bold text-pink-700 focus:outline-none"
                  />
                  <button
                    onClick={handleCopySyncKey}
                    className="px-3 py-2 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-rose-200 whitespace-nowrap shadow-xs"
                  >
                    {copiedKey ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedKey ? 'Đã chép' : 'Sao chép'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                  Nhập mã này trên bất kỳ thiết bị nào khác (Điện thoại, Laptop) để đồng bộ toàn bộ lịch trình.
                </p>
              </div>

              {/* Cloud Push & Pull Buttons */}
              <div className="space-y-2 pt-2 border-t border-rose-100">
                <button
                  onClick={handlePushToCloud}
                  disabled={isPushing}
                  className="w-full py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs shadow-pink-200 transition-all disabled:opacity-50"
                >
                  <Cloud className="w-4 h-4" />
                  <span>{isPushing ? 'Đang đẩy lên...' : 'Đẩy Lên Cloud (Push Live State)'}</span>
                </button>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nhập mã thiết bị khác..."
                    value={syncKeyInput}
                    onChange={(e) => setSyncKeyInput(e.target.value.toUpperCase())}
                    className="flex-1 px-3 py-1.5 bg-white border border-rose-200 rounded-xl text-xs font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:border-pink-500"
                  />
                  <button
                    onClick={handlePullFromCloud}
                    disabled={isPulling || !syncKeyInput.trim()}
                    className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-rose-200 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isPulling ? 'animate-spin' : ''}`} />
                    <span>Kéo về</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right: QR Code for mobile pairing */}
            <div className="flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-rose-100 text-center shadow-xs">
              <div className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-pink-600" />
                Quét QR từ Điện Thoại
              </div>

              {qrCodeUrl ? (
                <div className="p-2 bg-rose-50/50 border border-rose-100 rounded-xl shadow-xs inline-block">
                  <img src={qrCodeUrl} alt="Sync QR Code" className="w-36 h-36" />
                </div>
              ) : (
                <div className="w-36 h-36 bg-rose-50 rounded-xl flex items-center justify-center text-xs text-slate-400">
                  Đang tạo QR...
                </div>
              )}

              <p className="text-[10px] text-slate-500 mt-2">
                Mở camera trên điện thoại để quét và đồng bộ tức thời
              </p>
            </div>
          </div>

          {/* Export & Import Integrations */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Tương thích & Xuất Dữ Liệu Ngoại Vi
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* iCalendar ICS Export */}
              <div className="p-3.5 bg-white rounded-xl border border-rose-100 flex flex-col justify-between space-y-2 shadow-xs">
                <div>
                  <div className="font-bold text-xs sm:text-sm text-slate-800 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    Google / Apple Calendar (.ics)
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Xuất file chuẩn iCalendar để nhập vào Google Calendar, Outlook hoặc Apple Calendar.
                  </p>
                </div>

                <button
                  onClick={() => downloadICSFile(events)}
                  className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Tải File .ICS ({events.length} sự kiện)</span>
                </button>
              </div>

              {/* JSON Backup & Restore */}
              <div className="p-3.5 bg-white rounded-xl border border-rose-100 flex flex-col justify-between space-y-2 shadow-xs">
                <div>
                  <div className="font-bold text-xs sm:text-sm text-slate-800 flex items-center gap-2">
                    <Download className="w-4 h-4 text-pink-600" />
                    Sao Lưu & Khôi Phục JSON
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Lưu trữ toàn bộ lịch trình, lộ trình và cấu hình cá nhân về máy an toàn.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleExportJSON}
                    className="flex-1 py-2 bg-rose-50 hover:bg-rose-100 text-slate-800 border border-rose-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                  >
                    <span>Xuất JSON</span>
                  </button>

                  <label className="flex-1 py-2 bg-rose-50 hover:bg-rose-100 text-slate-800 border border-rose-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer text-center">
                    <Upload className="w-3.5 h-3.5 text-pink-600" />
                    <span>Nhập JSON</span>
                    <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
