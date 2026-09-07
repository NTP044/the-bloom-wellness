import React, { useState } from "react";
import {
  FileSpreadsheet,
  Copy,
  Check,
  Zap,
  ArrowUpCircle,
  ArrowDownCircle,
  ExternalLink,
  FolderOpen,
  Calendar,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Save,
  Send,
  RefreshCw,
  Database,
  Activity,
  CheckCheck
} from "lucide-react";
import { GOOGLE_APPS_SCRIPT_CODE } from "../../data/googleAppsScriptCode";
import { adminService } from "../../api/adminService";

export default function AdminGoogleSheetTab({
  settings = {},
  onUpdateSettings,
  onRefreshData
}) {
  const [copied, setCopied] = useState(false);

  // Persistent URL State with dual-layer (settings prop + localStorage backup)
  const [webAppUrl, setWebAppUrl] = useState(() => {
    return settings.gasWebAppUrl || localStorage.getItem("bloom_gasWebAppUrl") || "";
  });
  const [googleSheetUrl, setGoogleSheetUrl] = useState(() => {
    return settings.googleSheetUrl || localStorage.getItem("bloom_googleSheetUrl") || "";
  });
  const [googleDriveFolderUrl, setGoogleDriveFolderUrl] = useState(() => {
    return settings.googleDriveFolderUrl || localStorage.getItem("bloom_googleDriveFolderUrl") || "";
  });

  // Safe external URL opener that works reliably across LINE LIFF in-app browser and standard browsers
  const openExternalUrl = (url) => {
    if (!url) return;
    try {
      if (
        typeof window !== "undefined" &&
        window.liff &&
        typeof window.liff.isInClient === "function" &&
        window.liff.isInClient()
      ) {
        window.liff.openWindow({ url, external: true });
        return;
      }
    } catch (e) {
      console.warn("LIFF openWindow error:", e);
    }
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // Live GAS Status & Auto-Sync Tracking
  const [gasStatus, setGasStatus] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(false);

  const fetchGasStatus = async (targetUrl = webAppUrl) => {
    const url = (targetUrl || "").trim();
    if (!url) return;
    setLoadingStatus(true);
    try {
      const res = await adminService.getGasStatus(url);
      setGasStatus(res);
      if (res?.sheetUrl && (!googleSheetUrl || googleSheetUrl !== res.sheetUrl)) {
        setGoogleSheetUrl(res.sheetUrl);
        try {
          localStorage.setItem("bloom_googleSheetUrl", res.sheetUrl);
        } catch (e) {}
      }
    } catch (err) {
      console.warn("Could not fetch GAS live status:", err);
    } finally {
      setLoadingStatus(false);
    }
  };

  // Sync state if settings prop arrives or updates from backend
  React.useEffect(() => {
    if (settings.gasWebAppUrl) {
      setWebAppUrl(settings.gasWebAppUrl);
      try { localStorage.setItem("bloom_gasWebAppUrl", settings.gasWebAppUrl); } catch(e){}
      fetchGasStatus(settings.gasWebAppUrl);
    }
    if (settings.googleSheetUrl) {
      setGoogleSheetUrl(settings.googleSheetUrl);
      try { localStorage.setItem("bloom_googleSheetUrl", settings.googleSheetUrl); } catch(e){}
    }
    if (settings.googleDriveFolderUrl) {
      setGoogleDriveFolderUrl(settings.googleDriveFolderUrl);
      try { localStorage.setItem("bloom_googleDriveFolderUrl", settings.googleDriveFolderUrl); } catch(e){}
    }
  }, [settings.gasWebAppUrl, settings.googleSheetUrl, settings.googleDriveFolderUrl]);

  // Initial status fetch
  React.useEffect(() => {
    if (webAppUrl) {
      fetchGasStatus(webAppUrl);
    }
  }, [webAppUrl]);

  // Action states
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const [initializing, setInitializing] = useState(false);
  const [initResult, setInitResult] = useState(null);

  const [pushing, setPushing] = useState(false);
  const [pushResult, setPushResult] = useState(null);

  const [pulling, setPulling] = useState(false);
  const [pullResult, setPullResult] = useState(null);

  const [saveStatus, setSaveStatus] = useState("");

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Failed to copy code: ", err);
    }
  };

  const handleSaveSettings = async () => {
    setSaveStatus("saving");
    try {
      const trimmedGas = webAppUrl.trim();
      const trimmedSheet = googleSheetUrl.trim();
      const trimmedDrive = googleDriveFolderUrl.trim();

      try {
        localStorage.setItem("bloom_gasWebAppUrl", trimmedGas);
        localStorage.setItem("bloom_googleSheetUrl", trimmedSheet);
        localStorage.setItem("bloom_googleDriveFolderUrl", trimmedDrive);
      } catch (e) {}

      if (onUpdateSettings) {
        await onUpdateSettings({
          gasWebAppUrl: trimmedGas,
          googleSheetUrl: trimmedSheet,
          googleDriveFolderUrl: trimmedDrive
        });
      }
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus(""), 3000);
      fetchGasStatus(trimmedGas);
    } catch (err) {
      setSaveStatus("error");
    }
  };

  const handleTestConnection = async () => {
    const trimmed = webAppUrl.trim();
    if (!trimmed) {
      alert("กรุณาใส่ Web App URL ก่อนทดสอบ");
      return;
    }
    setTesting(true);
    setTestResult(null);

    // Auto-save setting simultaneously
    if (onUpdateSettings) {
      onUpdateSettings({
        gasWebAppUrl: trimmed,
        googleSheetUrl: googleSheetUrl.trim(),
        googleDriveFolderUrl: googleDriveFolderUrl.trim()
      }).catch(() => {});
    }

    try {
      const res = await adminService.testGas(trimmed);
      setTestResult({ success: true, message: res.message || "เชื่อมต่อสำเร็จ 100%!" });
    } catch (err) {
      setTestResult({ success: false, message: err.message || "เชื่อมต่อไม่สำเร็จ" });
    } finally {
      setTesting(false);
    }
  };

  const handle1ClickInitSheet = async () => {
    const trimmed = webAppUrl.trim();
    if (!trimmed) {
      alert("กรุณาระบุ Google Apps Script Web App URL ก่อน");
      return;
    }
    setInitializing(true);
    setInitResult(null);

    // Auto-save setting simultaneously
    if (onUpdateSettings) {
      onUpdateSettings({
        gasWebAppUrl: trimmed,
        googleSheetUrl: googleSheetUrl.trim(),
        googleDriveFolderUrl: googleDriveFolderUrl.trim()
      }).catch(() => {});
    }

    try {
      const res = await adminService.setupGas(trimmed);
      setInitResult({
        success: true,
        message: res.message || "สร้าง 5 แท็บและขอสิทธิ์ Google Workspace สำเร็จ!"
      });
      if (res.details && res.details.driveFolderUrl) {
        setGoogleDriveFolderUrl(res.details.driveFolderUrl);
      }
    } catch (err) {
      setInitResult({ success: false, message: err.message });
    } finally {
      setInitializing(false);
    }
  };

  const handlePushData = async () => {
    const trimmed = webAppUrl.trim();
    if (!trimmed) {
      alert("กรุณาใส่ Web App URL ก่อน");
      return;
    }
    setPushing(true);
    setPushResult(null);
    try {
      const res = await adminService.pushData(trimmed);
      setPushResult({
        success: true,
        message: res.message || "ส่งข้อมูลขึ้น Google Sheet สำเร็จครบทุกแท็บ!"
      });
    } catch (err) {
      setPushResult({ success: false, message: err.message });
    } finally {
      setPushing(false);
      fetchGasStatus(trimmed);
    }
  };

  const handlePullData = async () => {
    const trimmed = webAppUrl.trim();
    if (!trimmed) {
      alert("กรุณาใส่ Web App URL ก่อน");
      return;
    }
    setPulling(true);
    setPullResult(null);
    try {
      const res = await adminService.pullData(trimmed);
      setPullResult({
        success: true,
        message: res.message || "ดึงข้อมูลจาก Google Sheet สำเร็จ!"
      });
      if (onRefreshData) {
        await onRefreshData();
      }
    } catch (err) {
      setPullResult({ success: false, message: err.message });
    } finally {
      setPulling(false);
      fetchGasStatus(trimmed);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Overview */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-widest text-[#D4A373] uppercase block mb-1">
                Workspace Integration
              </span>
              <h3 className="text-lg font-serif text-gray-900">
                Google Sheets & Workspace All-in-One Sync
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                เชื่อมต่อฐานข้อมูล The Bloom Studio กับ Google Sheets, Google Drive, และ Google Calendar อัตโนมัติ
              </p>
            </div>
          </div>

          {/* Quick External Links */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => openExternalUrl(googleSheetUrl || "https://sheets.new")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>{googleSheetUrl ? "เปิด Google Sheet" : "สร้างชีตใหม่ (sheets.new)"}</span>
              <ExternalLink className="w-3 h-3" />
            </button>

            <button
              type="button"
              onClick={() => openExternalUrl(googleDriveFolderUrl || "https://drive.google.com")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>เปิด Google Drive</span>
              <ExternalLink className="w-3 h-3" />
            </button>

            <button
              type="button"
              onClick={() => openExternalUrl("https://calendar.google.com")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>เปิด Google Calendar</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* 1.5 Real-Time Data Sync & Verification Dashboard */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-serif text-base font-semibold text-gray-900 flex items-center gap-2 flex-wrap">
                <span>ระบบเชื่อมต่อข้อมูลสด 2-Way Real-Time</span>
                {gasStatus?.connected ? (
                  <span className="text-[10px] font-medium bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    🟢 เชื่อมต่อสด Auto-Sync 24/7
                  </span>
                ) : (
                  <span className="text-[10px] font-medium bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    พร้อมเชื่อมต่อ
                  </span>
                )}
              </h4>
              <p className="text-[11px] text-gray-500">
                ซิงค์สองทางอัตโนมัติ (Two-Way Auto-Sync ทุก 30 วินาที) ไม่ต้องคอยกดส่ง/ดึงข้อมูลเอง
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            <button
              onClick={() => handlePullData()}
              disabled={pulling || !webAppUrl}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${pulling ? "animate-spin text-emerald-600" : "text-emerald-600"}`} />
              <span>{pulling ? "กำลังซิงค์..." : "ซิงค์ทันที (Sync Now)"}</span>
            </button>

            <button
              onClick={() => fetchGasStatus()}
              disabled={loadingStatus || !webAppUrl}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer"
            >
              <Activity className={`w-3.5 h-3.5 ${loadingStatus ? "animate-spin text-[#D4A373]" : "text-gray-500"}`} />
              <span>{loadingStatus ? "กำลังเช็ค..." : "ตรวจสถานะสด"}</span>
            </button>
          </div>
        </div>

        {/* Counts Comparison Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
              คิวจอง (Bookings)
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-base font-semibold text-gray-900">
                {gasStatus?.localCounts?.bookings ?? 0}
              </span>
              <span className="text-[10px] text-gray-500">
                ชีต: {gasStatus?.sheetCounts ? gasStatus.sheetCounts.bookings : "-"}
              </span>
            </div>
            <span className="text-[10px] text-emerald-600 block mt-0.5">5 แท็บอัปเดตอัตโนมัติ</span>
          </div>

          <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
              บริการ (Services)
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-base font-semibold text-gray-900">
                {gasStatus?.localCounts?.services ?? 0}
              </span>
              <span className="text-[10px] text-gray-500">
                ชีต: {gasStatus?.sheetCounts ? gasStatus.sheetCounts.services : "-"}
              </span>
            </div>
            <span className="text-[10px] text-emerald-600 block mt-0.5">ซิงค์ชื่อ/ราคา/เวลา</span>
          </div>

          <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
              พนักงาน (Staff)
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-base font-semibold text-gray-900">
                {gasStatus?.localCounts?.staff ?? 0}
              </span>
              <span className="text-[10px] text-gray-500">
                ชีต: {gasStatus?.sheetCounts ? gasStatus.sheetCounts.staff : "-"}
              </span>
            </div>
            <span className="text-[10px] text-emerald-600 block mt-0.5">ซิงค์ชื่อ/ความเชี่ยวชาญ</span>
          </div>

          <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
              ลูกค้า (Customers)
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-base font-semibold text-gray-900">
                {gasStatus?.localCounts?.customers ?? 0}
              </span>
              <span className="text-[10px] text-gray-500">
                ชีต: {gasStatus?.sheetCounts ? gasStatus.sheetCounts.customers : "-"}
              </span>
            </div>
            <span className="text-[10px] text-emerald-600 block mt-0.5">สะสมยอดอัตโนมัติ</span>
          </div>
        </div>

        {/* Auto-Sync Status & Guarantee Banner */}
        <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-emerald-900">
            <CheckCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>ระบบ Real-Time Auto-Sync:</strong> ทำงานอัตโนมัติเบื้องหลังทุก 30 วินาที และซิงค์ทันทีเมื่อมีรายการใหม่
            </span>
          </div>
          {gasStatus?.lastSync?.timestamp && (
            <span className="text-[11px] text-emerald-700 shrink-0 font-medium">
              ซิงค์ล่าสุด: {new Date(gasStatus.lastSync.timestamp).toLocaleTimeString("th-TH")} น.
            </span>
          )}
        </div>
      </div>

      {/* 2. Web App URL Configuration Card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h4 className="font-serif text-base font-semibold text-gray-900 flex items-center gap-2">
            <span>กำหนดค่า Google Apps Script Web App URL</span>
            {settings.gasWebAppUrl && (
              <span className="text-[10px] font-medium bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                เชื่อมต่อแล้ว
              </span>
            )}
          </h4>
          <span className="text-[11px] text-gray-400">บันทึกอัตโนมัติลงฐานข้อมูลระบบ</span>
        </div>

        {/* Deployment Instructions Banner */}
        <div className="p-4 bg-amber-50/80 border border-amber-200/80 rounded-xl text-xs space-y-2 text-amber-900">
          <div className="flex items-center gap-2 font-semibold text-amber-900">
            <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>คำแนะนำสำคัญ: วิธีตั้งค่า Deploy ใน Google Apps Script เพื่อให้ระบบเชื่อมโยงและบันทึกข้อมูลได้ 100%</span>
          </div>
          <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-amber-800 leading-relaxed">
            <li>ในหน้าต่าง Google Apps Script คลิกปุ่มสีน้ำเงินมุมขวาบน <strong>Deploy</strong> &gt; <strong>Manage deployments</strong> (หรือ New deployment)</li>
            <li>คลิกที่ไอคอนรูปดินสอ <strong>Edit</strong></li>
            <li>ช่อง <strong>Execute as</strong>: เลือกเป็น <strong>Me (อีเมลของคุณ)</strong> <em>(ห้ามเลือก User accessing the web app เพื่อไม่ให้ติดสิทธิ์ Drive)</em></li>
            <li>ช่อง <strong>Who has access</strong>: เลือกเป็น <strong>Anyone (ทุกคน)</strong> <em>(ห้ามเลือก Only myself)</em></li>
            <li>กด <strong>Deploy</strong> แล้วคัดลอก Web App URL (ลงท้ายด้วย <code>/exec</code>) มาวางลงในช่องด้านล่าง แล้วกด <strong>บันทึก URL</strong></li>
          </ol>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
              Google Apps Script Web App URL (นำมาจาก Deploy &gt; Manage Deployments)
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="url"
                placeholder="https://script.google.com/macros/s/.../exec"
                value={webAppUrl}
                onChange={(e) => {
                  const val = e.target.value;
                  setWebAppUrl(val);
                  try { localStorage.setItem("bloom_gasWebAppUrl", val); } catch (err) {}
                }}
                className="flex-1 px-3 py-2 text-xs font-mono border border-gray-200 rounded-xl focus:border-[#D4A373] outline-none"
              />
              <button
                onClick={handleTestConnection}
                disabled={testing || !webAppUrl}
                className="flex items-center justify-center gap-1.5 px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 text-xs font-semibold rounded-xl transition-colors shrink-0"
              >
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>{testing ? "กำลังทดสอบ..." : "ทดสอบการเชื่อมต่อ"}</span>
              </button>
              <button
                onClick={handleSaveSettings}
                disabled={saveStatus === "saving"}
                className="flex items-center justify-center gap-1.5 px-4 py-2 bg-[#D4A373] hover:bg-[#c49262] text-white text-xs font-semibold rounded-xl transition-colors shadow-xs shrink-0"
              >
                <Save className="w-3.5 h-3.5" />
                <span>
                  {saveStatus === "saving"
                    ? "กำลังบันทึก..."
                    : saveStatus === "saved"
                    ? "บันทึกเรียบร้อย!"
                    : "บันทึก URL"}
                </span>
              </button>
            </div>
          </div>

          {/* Optional Sheet & Drive URL inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                Google Sheet URL (สำหรับคลิกเปิดด่วน)
              </label>
              <input
                type="url"
                placeholder="https://docs.google.com/spreadsheets/d/..."
                value={googleSheetUrl}
                onChange={(e) => {
                  const val = e.target.value;
                  setGoogleSheetUrl(val);
                  try { localStorage.setItem("bloom_googleSheetUrl", val); } catch (err) {}
                }}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:border-[#D4A373] outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                Google Drive Folder URL (สลิปโอนเงิน)
              </label>
              <input
                type="url"
                placeholder="https://drive.google.com/drive/folders/..."
                value={googleDriveFolderUrl}
                onChange={(e) => {
                  const val = e.target.value;
                  setGoogleDriveFolderUrl(val);
                  try { localStorage.setItem("bloom_googleDriveFolderUrl", val); } catch (err) {}
                }}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:border-[#D4A373] outline-none font-mono"
              />
            </div>
          </div>

          {/* Unified Save All Workspace Settings Button */}
          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={handleSaveSettings}
              disabled={saveStatus === "saving"}
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-black text-white text-xs font-semibold rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5 text-[#D4A373]" />
              <span>
                {saveStatus === "saving"
                  ? "กำลังบันทึกการตั้งค่า..."
                  : saveStatus === "saved"
                  ? "✓ บันทึกลิงก์ Workspace ทั้งหมดเรียบร้อยแล้ว!"
                  : "💾 บันทึกลิงก์ Workspace ทั้งหมด (Save All URLs)"}
              </span>
            </button>
          </div>

          {/* Test connection alert message */}
          {testResult && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center gap-2 animate-in fade-in ${
                testResult.success
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-rose-50 border-rose-200 text-rose-800"
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}
        </div>

        {/* 1-Click Operations Bar */}
        <div className="pt-4 border-t border-gray-100">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
            คำสั่งซิงค์อัตโนมัติ (1-Click Operations)
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={handle1ClickInitSheet}
              disabled={initializing || !webAppUrl}
              className="flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-[#D4A373]/15 to-[#D4A373]/30 border border-[#D4A373]/40 hover:border-[#D4A373] text-gray-800 rounded-xl text-xs font-semibold transition-all shadow-xs"
            >
              <Zap className="w-4 h-4 text-[#D4A373]" />
              <span>{initializing ? "กำลังสร้างโครงสร้าง..." : "⚡ 1-Click Setup Google Sheets"}</span>
            </button>

            <button
              onClick={handlePushData}
              disabled={pushing || !webAppUrl}
              className="flex items-center justify-center gap-2 p-3 bg-blue-50/70 border border-blue-200 hover:border-blue-400 text-blue-800 rounded-xl text-xs font-semibold transition-all shadow-xs"
            >
              <ArrowUpCircle className="w-4 h-4 text-blue-600" />
              <span>{pushing ? "กำลังส่งข้อมูล..." : "⬆️ ส่งข้อมูลขึ้น Google Sheet"}</span>
            </button>

            <button
              onClick={handlePullData}
              disabled={pulling || !webAppUrl}
              className="flex items-center justify-center gap-2 p-3 bg-emerald-50/70 border border-emerald-200 hover:border-emerald-400 text-emerald-800 rounded-xl text-xs font-semibold transition-all shadow-xs"
            >
              <ArrowDownCircle className="w-4 h-4 text-emerald-600" />
              <span>{pulling ? "กำลังดึงข้อมูล..." : "⬇️ ดึงข้อมูลจาก Google Sheet"}</span>
            </button>
          </div>

          {/* Action results feedback */}
          {initResult && (
            <div
              className={`mt-3 p-3 rounded-xl border text-xs flex items-center gap-2 ${
                initResult.success
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-rose-50 border-rose-200 text-rose-800"
              }`}
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{initResult.message}</span>
            </div>
          )}
          {pushResult && (
            <div
              className={`mt-3 p-3 rounded-xl border text-xs flex items-center gap-2 ${
                pushResult.success
                  ? "bg-blue-50 border-blue-200 text-blue-800"
                  : "bg-rose-50 border-rose-200 text-rose-800"
              }`}
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{pushResult.message}</span>
            </div>
          )}
          {pullResult && (
            <div
              className={`mt-3 p-3 rounded-xl border text-xs flex items-center gap-2 ${
                pullResult.success
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-rose-50 border-rose-200 text-rose-800"
              }`}
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{pullResult.message}</span>
            </div>
          )}
        </div>
      </div>

      {/* 3. Step-by-Step Illustrated Guide */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs space-y-4">
        <h4 className="font-serif text-base font-semibold text-gray-900 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-[#D4A373]" />
          <span>ขั้นตอนการติดตั้ง Google Apps Script (ทำครั้งเดียวจบ)</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 space-y-1.5">
            <span className="w-6 h-6 rounded-full bg-[#D4A373] text-white flex items-center justify-center font-bold text-[11px]">
              1
            </span>
            <div className="font-semibold text-gray-800">สร้างชีตและเปิด Apps Script</div>
            <p className="text-gray-500 leading-relaxed text-[11px]">
              ไปที่ Google Sheets (หรือกด sheets.new) จากนั้นคลิกเมนู <strong>ส่วนขยาย (Extensions)</strong> &gt; <strong>Apps Script</strong>
            </p>
          </div>

          <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 space-y-1.5">
            <span className="w-6 h-6 rounded-full bg-[#D4A373] text-white flex items-center justify-center font-bold text-[11px]">
              2
            </span>
            <div className="font-semibold text-gray-800">วางโค้ดและกดบันทึก</div>
            <p className="text-gray-500 leading-relaxed text-[11px]">
              กดปุ่ม <strong>"คัดลอกโค้ดทั้งหมด"</strong> ด้านล่าง แล้วนำไปวางทับในไฟล์ <code>Code.gs</code> ทั้งหมด แล้วกดบันทึก (Ctrl+S)
            </p>
          </div>

          <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 space-y-1.5">
            <span className="w-6 h-6 rounded-full bg-[#D4A373] text-white flex items-center justify-center font-bold text-[11px]">
              3
            </span>
            <div className="font-semibold text-gray-800">Deploy as Web App</div>
            <p className="text-gray-500 leading-relaxed text-[11px]">
              กดปุ่มสีน้ำเงิน <strong>ทำให้ใช้งานได้ (Deploy)</strong> &gt; <strong>การทำให้ใช้งานได้ใหม่ (New deployment)</strong> เลือกประเภท <strong>เว็บแอป (Web App)</strong> และตั้งค่า Who has access เป็น <strong>Anyone (ทุกคน)</strong>
            </p>
          </div>

          <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 space-y-1.5">
            <span className="w-6 h-6 rounded-full bg-[#D4A373] text-white flex items-center justify-center font-bold text-[11px]">
              4
            </span>
            <div className="font-semibold text-gray-800">ขอสิทธิ์ 100% ครั้งเดียว</div>
            <p className="text-gray-500 leading-relaxed text-[11px]">
              กด Authorize และ Copy Web App URL มาใส่ในช่องด้านบน แล้วกดปุ่ม <strong>"⚡ 1-Click Setup"</strong> เพื่อสร้าง 5 แท็บอัตโนมัติ!
            </p>
          </div>
        </div>
      </div>

      {/* 4. Google Apps Script Code Viewer with 1-Click Copy */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="font-serif text-base font-semibold text-gray-900">
              โค้ด Google Apps Script (Code.gs)
            </h4>
            <p className="text-xs text-gray-500">
              รวมฟังก์ชัน 1-Click Setup, เมนูด้านบนชีต, ซิงค์ Google Drive, Google Calendar และแจ้งเตือนอีเมล
            </p>
          </div>

          <button
            onClick={handleCopyCode}
            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold shadow-xs transition-all ${
              copied
                ? "bg-emerald-600 text-white"
                : "bg-gray-900 hover:bg-black text-white hover:shadow-md"
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-200" />
                <span>คัดลอกโค้ดสำเร็จแล้ว!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>📋 คัดลอกโค้ดทั้งหมด (Copy Code)</span>
              </>
            )}
          </button>
        </div>

        {/* Code Box Container */}
        <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-stone-900 shadow-inner">
          <div className="flex items-center justify-between px-4 py-2 bg-stone-800/90 text-stone-300 text-xs border-b border-stone-700">
            <span className="font-mono text-[11px]">Code.gs (All-in-One Google Workspace Script)</span>
            <span className="text-[10px] text-stone-400">JavaScript / Google Apps Script</span>
          </div>
          <pre className="p-4 text-xs font-mono text-stone-100 overflow-x-auto max-h-[420px] leading-relaxed select-all">
            {GOOGLE_APPS_SCRIPT_CODE}
          </pre>
        </div>
      </div>
    </div>
  );
}
