import React, { useState, useMemo } from "react";
import {
  Search,
  Phone,
  Calendar,
  Clock,
  User,
  Trash2,
  Eye,
  CheckCircle2,
  Clock4,
  XCircle,
  AlertCircle,
  Image as ImageIcon,
  MessageCircle,
  Sparkles,
  TrendingUp,
  DollarSign,
  Plus,
  X,
  PhoneCall,
  Edit3,
  Save,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  History
} from "lucide-react";
import SlipZoomModal from "./SlipZoomModal";

// Helper to format exact timestamp with millisecond precision
function formatPrecisionTimestamp(isoStr, msTimestamp) {
  if (msTimestamp) {
    const d = new Date(msTimestamp);
    if (!isNaN(d.getTime())) {
      const h = String(d.getHours()).padStart(2, "0");
      const m = String(d.getMinutes()).padStart(2, "0");
      const s = String(d.getSeconds()).padStart(2, "0");
      const ms = String(d.getMilliseconds()).padStart(3, "0");
      return `${h}:${m}:${s}.${ms}`;
    }
  }
  if (isoStr) {
    const d = new Date(isoStr);
    if (!isNaN(d.getTime())) {
      const h = String(d.getHours()).padStart(2, "0");
      const m = String(d.getMinutes()).padStart(2, "0");
      const s = String(d.getSeconds()).padStart(2, "0");
      const ms = String(d.getMilliseconds()).padStart(3, "0");
      return `${h}:${m}:${s}.${ms}`;
    }
  }
  return "-";
}

function timeToMinutes(timeStr) {
  if (!timeStr || typeof timeStr !== "string") return 0;
  const parts = timeStr.trim().split(":");
  const h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  return h * 60 + m;
}

function minutesToTime(minutes) {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export default function AdminBookingsTab({
  bookings = [],
  services = [],
  staffList = [],
  bookingConflicts = [],
  onUpdateStatus,
  onDeleteBooking,
  onUpdateSlip,
  onCreateBooking,
  onUpdateConflict,
  onDeleteConflict,
  onSwitchToCalendar
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedSlip, setSelectedSlip] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConflictsSection, setShowConflictsSection] = useState(true);
  const [conflictStatusFilter, setConflictStatusFilter] = useState("all");
  const [editingConflictNoteId, setEditingConflictNoteId] = useState(null);
  const [tempNote, setTempNote] = useState("");
  const [updatingConflictId, setUpdatingConflictId] = useState(null);
  const [newBooking, setNewBooking] = useState({
    serviceId: "",
    staffId: "",
    date: new Date().toISOString().split("T")[0],
    time: "10:00",
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    specialRequest: "",
    status: "confirmed"
  });

  // Calculate conflicting bookings (same staff, same date, overlapping time, not cancelled)
  const conflictingBookingIds = useMemo(() => {
    const conflictSet = new Set();
    const validBookings = bookings.filter((b) => b.status !== "cancelled");

    for (let i = 0; i < validBookings.length; i++) {
      const b1 = validBookings[i];
      const s1 = timeToMinutes(b1.time);
      let d1 = parseInt(b1.serviceDuration, 10);
      if (!d1 || isNaN(d1)) {
        const srv = services.find((s) => s.id === b1.serviceId);
        d1 = srv?.duration ? parseInt(srv.duration, 10) : 60;
      }
      const e1 = s1 + d1;

      for (let j = i + 1; j < validBookings.length; j++) {
        const b2 = validBookings[j];
        if (b1.staffId === b2.staffId && b1.date === b2.date) {
          const s2 = timeToMinutes(b2.time);
          let d2 = parseInt(b2.serviceDuration, 10);
          if (!d2 || isNaN(d2)) {
            const srv = services.find((s) => s.id === b2.serviceId);
            d2 = srv?.duration ? parseInt(srv.duration, 10) : 60;
          }
          const e2 = s2 + d2;

          // Overlap condition: start1 < end2 && end1 > start2
          if (s1 < e2 && e1 > s2) {
            conflictSet.add(b1.id);
            conflictSet.add(b2.id);
          }
        }
      }
    }
    return conflictSet;
  }, [bookings, services]);

  // Filter staff by selected service skills
  const availableStaffForModal = useMemo(() => {
    if (!newBooking.serviceId) return staffList;
    return staffList.filter(
      (st) => !st.skills || st.skills.length === 0 || st.skills.includes(newBooking.serviceId)
    );
  }, [staffList, newBooking.serviceId]);

  const handleOpenCreateModal = () => {
    const defaultSrv = services[0]?.id || "";
    const validStaff = staffList.find(
      (st) => !st.skills || st.skills.length === 0 || st.skills.includes(defaultSrv)
    );
    setNewBooking({
      serviceId: defaultSrv,
      staffId: validStaff?.id || staffList[0]?.id || "",
      date: new Date().toISOString().split("T")[0],
      time: "10:00",
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      specialRequest: "",
      status: "confirmed"
    });
    setIsCreateModalOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newBooking.serviceId || !newBooking.staffId || !newBooking.customerName || !newBooking.customerPhone) {
      alert("กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน");
      return;
    }
    setIsSubmitting(true);
    try {
      if (onCreateBooking) {
        await onCreateBooking(newBooking);
      }
      setIsCreateModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Statistics
  const stats = useMemo(() => {
    const total = bookings.length;
    const pending = bookings.filter((b) => b.status === "pending").length;
    const confirmed = bookings.filter((b) => b.status === "confirmed").length;
    const completed = bookings.filter((b) => b.status === "completed").length;
    const cancelled = bookings.filter((b) => b.status === "cancelled").length;
    const revenue = bookings
      .filter((b) => b.status !== "cancelled")
      .reduce((sum, b) => sum + (parseFloat(b.servicePrice) || 0), 0);

    return { total, pending, confirmed, completed, cancelled, revenue };
  }, [bookings]);

  // Filtered bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const matchSearch =
        !searchTerm ||
        (b.customerName && b.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (b.customerPhone && b.customerPhone.includes(searchTerm)) ||
        (b.id && b.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (b.serviceName && b.serviceName.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchStatus = statusFilter === "all" || b.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [bookings, searchTerm, statusFilter]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "confirmed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            ยืนยันแล้ว
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <CheckCircle2 className="w-3 h-3" />
            รับบริการแล้ว
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
            <XCircle className="w-3 h-3" />
            ยกเลิก
          </span>
        );
      case "pending":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock4 className="w-3 h-3" />
            รอยืนยัน
          </span>
        );
    }
  };

  const handleDeleteConfirm = (id) => {
    if (window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบรายการจองนี้? การลบจะไม่สามารถกู้คืนได้")) {
      onDeleteBooking(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
          <span className="text-[10px] font-bold tracking-wider text-gray-400 uppercase block mb-1">
            ยอดจองทั้งหมด
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-serif font-semibold text-gray-900">{stats.total}</span>
            <span className="text-xs text-gray-500">รายการ</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-100/60 shadow-xs bg-amber-50/20">
          <span className="text-[10px] font-bold tracking-wider text-amber-700 uppercase block mb-1">
            รอยืนยัน
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-serif font-semibold text-amber-800">{stats.pending}</span>
            <span className="text-xs text-amber-600">รอตรวจสลิป</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-100/60 shadow-xs bg-emerald-50/20">
          <span className="text-[10px] font-bold tracking-wider text-emerald-700 uppercase block mb-1">
            ยืนยันแล้ว
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-serif font-semibold text-emerald-800">{stats.confirmed}</span>
            <span className="text-xs text-emerald-600">พร้อมบริการ</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-blue-100/60 shadow-xs bg-blue-50/20">
          <span className="text-[10px] font-bold tracking-wider text-blue-700 uppercase block mb-1">
            เสร็จสิ้น
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-serif font-semibold text-blue-800">{stats.completed}</span>
            <span className="text-xs text-blue-600">รับบริการแล้ว</span>
          </div>
        </div>

        <div className="col-span-2 lg:col-span-1 bg-white p-4 rounded-xl border border-[#D4A373]/30 shadow-xs bg-[#D4A373]/5">
          <span className="text-[10px] font-bold tracking-wider text-[#b07e4c] uppercase block mb-1">
            ประมาณการรายได้
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-serif font-semibold text-gray-900">
              ฿{stats.revenue.toLocaleString()}
            </span>
            <span className="text-xs text-[#b07e4c]">THB</span>
          </div>
        </div>
      </div>

      {/* 1.5 Real-Time Double Booking Conflict Leads Section */}
      {bookingConflicts && bookingConflicts.length > 0 && (
        <div className="bg-white rounded-2xl border border-amber-200/90 shadow-sm overflow-hidden animate-fade-in">
          <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/5 p-4 sm:p-5 border-b border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0 border border-amber-300">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                    <span>⚡ บันทึกคิวที่ลูกค้ากดจองชนกัน (Collision Leads & Logs)</span>
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-white shadow-2xs">
                    {bookingConflicts.length} ครั้ง
                  </span>
                  {bookingConflicts.filter(c => (c.status || "pending_callback") === "pending_callback").length > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200 animate-pulse">
                      รอติดต่อ {bookingConflicts.filter(c => (c.status || "pending_callback") === "pending_callback").length} รายการ
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-600 mt-0.5">
                  เมื่อมีลูกค้ากดจองเวลาเดียวกัน ระบบจะแจ้งลูกค้าให้เลือกเวลาใหม่ และส่งข้อมูลมาที่นี่เพื่อให้ผู้จัดการร้านติดตามดูแลได้ทันที
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowConflictsSection(!showConflictsSection)}
                className="px-3.5 py-1.5 rounded-lg bg-white border border-amber-200 hover:bg-amber-50 text-amber-900 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
              >
                <span>{showConflictsSection ? "ย่อรายการ" : "ขยายดูรายละเอียด"}</span>
                {showConflictsSection ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {showConflictsSection && (
            <div className="p-4 sm:p-5 space-y-4">
              {/* Filter Tabs for Conflicts */}
              <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-stone-400 font-medium text-[11px] mr-1">สถานะ:</span>
                  {[
                    { id: "all", label: `ทั้งหมด (${bookingConflicts.length})` },
                    { id: "pending_callback", label: "รอดำเนินการ" },
                    { id: "rebooked", label: "จองรอบใหม่สำเร็จ" },
                    { id: "contacted", label: "ติดต่อแล้ว" },
                    { id: "resolved", label: "เสร็จสิ้น" }
                  ].map((tab) => (
                    <button
                      key={`c-tab-${tab.id}`}
                      type="button"
                      onClick={() => setConflictStatusFilter(tab.id)}
                      className={`px-2.5 py-1 rounded-md font-medium text-xs transition cursor-pointer ${
                        conflictStatusFilter === tab.id
                          ? "bg-stone-800 text-white font-semibold"
                          : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Conflict Cards List */}
              <div className="space-y-3">
                {bookingConflicts
                  .filter((c) => conflictStatusFilter === "all" || (c.status || "pending_callback") === conflictStatusFilter)
                  .map((c) => {
                    const statusVal = c.status || "pending_callback";
                    const isEditingNote = editingConflictNoteId === c.id;

                    return (
                      <div
                        key={`conflict-${c.id}`}
                        className={`p-4 rounded-xl border transition-all ${
                          statusVal === "pending_callback"
                            ? "bg-amber-50/40 border-amber-200/90 shadow-2xs"
                            : statusVal === "rebooked"
                            ? "bg-emerald-50/30 border-emerald-200"
                            : "bg-stone-50/60 border-stone-200"
                        }`}
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                          {/* Left: Customer info & requested slot */}
                          <div className="space-y-1.5 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-sm text-stone-900">{c.customerName}</span>
                              {c.customerPhone && (
                                <a
                                  href={`tel:${c.customerPhone}`}
                                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 hover:bg-blue-100 transition"
                                >
                                  <PhoneCall className="w-3 h-3 text-blue-500" />
                                  <span>{c.customerPhone}</span>
                                </a>
                              )}
                              {c.customerEmail && (
                                <span className="text-[11px] text-stone-500">{c.customerEmail}</span>
                              )}
                              <span className="text-[10px] text-stone-400 font-mono">
                                ({formatPrecisionTimestamp(c.createdAt, c.createdAtMs)})
                              </span>
                            </div>

                            <div className="text-xs text-stone-700 flex items-center gap-2 flex-wrap">
                              <span>บริการ: <strong>{c.serviceName}</strong></span>
                              <span>•</span>
                              <span>ช่าง: <strong>{c.staffName}</strong></span>
                              <span>•</span>
                              <span className="font-semibold text-rose-600 flex items-center gap-1">
                                <span>{c.date} เวลา {c.time} น.</span>
                                <span className="text-[9px] bg-rose-100 text-rose-700 px-1 py-0.2 rounded font-bold">เวลาที่ชน</span>
                              </span>
                            </div>

                            {/* Collision detail note */}
                            {c.conflictWithBooking && (
                              <div className="text-[11px] text-amber-800 bg-amber-100/60 px-2.5 py-1 rounded-md border border-amber-200/80 inline-block">
                                <span>ชนกับคิว: <strong>#{c.conflictWithBooking.id}</strong> ({c.conflictWithBooking.customerName || "ลูกค้าอื่น"}) เวลา {c.conflictWithBooking.time} น.</span>
                              </div>
                            )}

                            {/* Admin Note Display/Edit */}
                            <div className="pt-1">
                              {isEditingNote ? (
                                <div className="flex items-center gap-1.5 max-w-md">
                                  <input
                                    type="text"
                                    value={tempNote}
                                    onChange={(e) => setTempNote(e.target.value)}
                                    placeholder="บันทึกโน้ต (เช่น โทรแจ้งแล้ว ลูกค้าขอเลื่อนเป็น 15:00)..."
                                    className="flex-1 text-xs px-2.5 py-1 bg-white border border-amber-300 rounded outline-none focus:ring-1 focus:ring-amber-500"
                                  />
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      if (onUpdateConflict) {
                                        await onUpdateConflict(c.id, { adminNote: tempNote });
                                      }
                                      setEditingConflictNoteId(null);
                                    }}
                                    className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 text-xs px-2 cursor-pointer flex items-center gap-1"
                                  >
                                    <Save className="w-3 h-3" />
                                    <span>บันทึก</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditingConflictNoteId(null)}
                                    className="p-1 bg-stone-200 text-stone-700 rounded hover:bg-stone-300 text-xs px-2 cursor-pointer"
                                  >
                                    ยกเลิก
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 text-xs text-stone-600">
                                  <span>โน้ต: <em className="text-stone-800">{c.adminNote || "(ไม่มีโน้ต)"}</em></span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingConflictNoteId(c.id);
                                      setTempNote(c.adminNote || "");
                                    }}
                                    className="text-stone-400 hover:text-stone-700 p-0.5 cursor-pointer"
                                    title="แก้ไขโน้ต"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Right: Status selector and actions */}
                          <div className="flex items-center gap-2 self-start lg:self-center flex-wrap">
                            <select
                              value={statusVal}
                              onChange={async (e) => {
                                if (onUpdateConflict) {
                                  setUpdatingConflictId(c.id);
                                  await onUpdateConflict(c.id, { status: e.target.value });
                                  setUpdatingConflictId(null);
                                }
                              }}
                              disabled={updatingConflictId === c.id}
                              className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border outline-none cursor-pointer ${
                                statusVal === "pending_callback"
                                  ? "bg-amber-100 text-amber-900 border-amber-300"
                                  : statusVal === "rebooked"
                                  ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                                  : statusVal === "contacted"
                                  ? "bg-blue-100 text-blue-900 border-blue-300"
                                  : "bg-stone-100 text-stone-800 border-stone-300"
                              }`}
                            >
                              <option value="pending_callback">⏳ รอดำเนินการ / โทรกลับ</option>
                              <option value="contacted">📞 ติดต่อลูกค้าแล้ว</option>
                              <option value="rebooked">✅ ลูกค้าจองรอบใหม่แล้ว</option>
                              <option value="resolved">🏁 จัดการเสร็จสิ้น</option>
                            </select>

                            {c.customerPhone && (
                              <a
                                href={`tel:${c.customerPhone}`}
                                className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition cursor-pointer"
                                title="โทรหาลูกค้า"
                              >
                                <Phone className="w-3.5 h-3.5" />
                              </a>
                            )}

                            {onDeleteConflict && (
                              <button
                                type="button"
                                onClick={() => onDeleteConflict(c.id)}
                                className="p-1.5 rounded-lg bg-stone-100 text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                title="ลบประวัตินี้"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. Filter & Search Controls */}
      {conflictingBookingIds.size > 0 && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-950 flex items-start gap-3 shadow-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-rose-900 text-sm">
                ⚠️ มีรายการจองที่เวลาทับซ้อนกัน ({conflictingBookingIds.size} รายการ)
              </span>
              <span className="text-[10px] font-semibold bg-rose-100 px-2 py-0.5 rounded text-rose-800 border border-rose-300">
                ตรวจพบ Conflict
              </span>
            </div>
            <p className="text-rose-700 mt-0.5 leading-relaxed">
              ระบบตรวจพบคิวที่ช่างคนเดียวกันมีเวลานัดทับซ้อนกัน แถวรายการที่ซ้ำจะถูกไฮไลต์สีแดงอ่อนพร้อมป้ายแจ้งเตือน คุณสามารถคลิกดูรายละเอียดเพื่อตรวจสอบเวลาส่งคำขอระดับมิลลิวินาที (Precision Timestamp) หรือปรับเปลี่ยนเวลาให้ลูกค้าได้ทันที
            </p>
          </div>
        </div>
      )}

      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาชื่อลูกค้า, เบอร์โทร, รหัสคิว..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-[#D4A373] focus:bg-white transition-colors"
          />
        </div>

        {/* Status Filter Chips & Add Booking Button */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {[
              { id: "all", label: "ทั้งหมด" },
              { id: "pending", label: "รอยืนยัน" },
              { id: "confirmed", label: "ยืนยันแล้ว" },
              { id: "completed", label: "เสร็จสิ้น" },
              { id: "cancelled", label: "ยกเลิก" }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setStatusFilter(item.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  statusFilter === item.id
                    ? "bg-gray-900 text-white font-semibold"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {onSwitchToCalendar && (
              <button
                type="button"
                onClick={onSwitchToCalendar}
                className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors border border-stone-200 cursor-pointer whitespace-nowrap"
              >
                <Calendar className="w-3.5 h-3.5 text-[#D4A373]" />
                <span>มุมมองปฏิทิน</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="px-3.5 py-1.5 bg-[#D4A373] hover:bg-[#b07e4c] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ เพิ่มคิวจอง</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Bookings List / Table */}
      {filteredBookings.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h4 className="text-base font-serif text-gray-700 mb-1">ไม่พบรายการจอง</h4>
          <p className="text-xs text-gray-400">
            {searchTerm || statusFilter !== "all"
              ? "ลองปรับเปลี่ยนคำค้นหาหรือตัวกรองสถานะ"
              : "ยังไม่มีรายการจองคิวในระบบ"}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">รหัส / วันที่จอง</th>
                  <th className="py-3.5 px-4">วันและเวลาที่นัด</th>
                  <th className="py-3.5 px-4">บริการ</th>
                  <th className="py-3.5 px-4">ช่างผู้ดูแล</th>
                  <th className="py-3.5 px-4">ข้อมูลลูกค้า</th>
                  <th className="py-3.5 px-4 text-center">หลักฐานโอน</th>
                  <th className="py-3.5 px-4 text-center">สถานะ</th>
                  <th className="py-3.5 px-4 text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {filteredBookings.map((b, bIdx) => {
                  const isConflict = conflictingBookingIds.has(b.id);
                  const precisionTime = formatPrecisionTimestamp(b.createdAt, b.createdAtMs);

                  return (
                    <tr
                      key={`${b.id || "bk"}-${bIdx}`}
                      className={`transition-colors ${
                        isConflict ? "bg-rose-50/40 hover:bg-rose-50/70" : "hover:bg-gray-50/50"
                      }`}
                    >
                      <td className="py-3.5 px-4 font-mono">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-semibold text-gray-900">{b.id}</span>
                          {isConflict && (
                            <span
                              title="พบการจองช่วงเวลาทับซ้อนกับคิวอื่นของช่างคนเดียวกัน"
                              className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 text-[10px] font-bold border border-rose-300 animate-pulse"
                            >
                              ⚠️ คิวซ้ำซ้อน
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-gray-500 mt-0.5" title={`เวลาคำขอระดับมิลลิวินาที: ${b.createdAt || ""}`}>
                          {new Date(b.createdAt).toLocaleDateString("th-TH", {
                            day: "numeric",
                            month: "short"
                          })}{" "}
                          <span className="text-[#B88555] font-semibold">{precisionTime} น.</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-gray-900 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#D4A373]" />
                          {b.date}
                        </div>
                        <div className="text-gray-500 flex items-center gap-1.5 mt-0.5">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          {b.time} - {b.endTime || minutesToTime(timeToMinutes(b.time) + (b.serviceDuration || 60))} น. ({b.serviceDuration || 60} นาที)
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-gray-900 max-w-[180px] truncate">
                          {b.serviceName}
                        </div>
                        <div className="text-emerald-600 font-semibold mt-0.5">
                          ฿{(parseFloat(b.servicePrice) || 0).toLocaleString()}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          {b.staffAvatar ? (
                            <img
                              src={b.staffAvatar}
                              alt={b.staffName}
                              className="w-7 h-7 rounded-full object-cover border border-gray-200 shrink-0"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                              <User className="w-4 h-4" />
                            </div>
                          )}
                          <span className="font-medium text-gray-800">{b.staffName}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-gray-900 flex items-center gap-1.5">
                          <span>{b.customerName}</span>
                          {b.lineDisplayName && (
                            <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded font-medium border border-emerald-100 flex items-center gap-0.5">
                              LINE: {b.lineDisplayName}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <a
                            href={`tel:${b.customerPhone}`}
                            className="inline-flex items-center gap-1 text-[#D4A373] hover:text-[#b07e4c] font-medium bg-[#D4A373]/10 px-2 py-0.5 rounded hover:bg-[#D4A373]/20 transition-colors"
                            title="โทรหาลูกค้าทันที"
                          >
                            <Phone className="w-3 h-3" />
                            <span>{b.customerPhone}</span>
                          </a>
                        </div>
                        {b.specialRequest && (
                          <p className="text-[11px] text-gray-400 mt-1 italic max-w-xs truncate">
                            "{b.specialRequest}"
                          </p>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {b.paymentSlipUrl ? (
                          <button
                            onClick={() =>
                              setSelectedSlip({
                                url: b.paymentSlipUrl,
                                id: b.id,
                                name: b.customerName
                              })
                            }
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors border border-gray-200 cursor-pointer"
                          >
                            <ImageIcon className="w-3.5 h-3.5 text-[#D4A373]" />
                            <span>ดูสลิป</span>
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              setSelectedSlip({
                                url: "",
                                id: b.id,
                                name: b.customerName
                              })
                            }
                            className="text-[11px] text-gray-400 hover:text-gray-600 hover:underline cursor-pointer"
                          >
                            + เพิ่มสลิป
                          </button>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <select
                          value={b.status}
                          onChange={(e) => onUpdateStatus(b.id, e.target.value)}
                          className={`text-xs font-semibold py-1 px-2.5 rounded-lg border outline-none cursor-pointer ${
                            b.status === "confirmed"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : b.status === "completed"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : b.status === "cancelled"
                              ? "bg-gray-100 text-gray-600 border-gray-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          <option value="pending">รอยืนยัน</option>
                          <option value="confirmed">ยืนยันแล้ว</option>
                          <option value="completed">เสร็จสิ้น</option>
                          <option value="cancelled">ยกเลิก</option>
                        </select>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {onSwitchToCalendar && (
                            <button
                              type="button"
                              onClick={() => onSwitchToCalendar(b.date)}
                              className="p-1.5 text-stone-500 hover:text-[#B88555] hover:bg-amber-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-amber-200"
                              title="เปิดดูคิวนี้บนปฏิทิน"
                            >
                              <Calendar className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteConfirm(b.id)}
                            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="ลบรายการจอง"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View */}
          <div className="lg:hidden divide-y divide-gray-100">
            {filteredBookings.map((b, bIdx) => (
              <div key={`${b.id || "bk"}-${bIdx}`} className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-gray-800">{b.id}</span>
                  {getStatusBadge(b.status)}
                </div>

                <div className="space-y-1">
                  <h4 className="font-serif text-sm font-semibold text-gray-900">{b.serviceName}</h4>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#D4A373]" />
                      {b.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      {b.time} น.
                    </span>
                    <span className="font-semibold text-emerald-600">
                      ฿{(parseFloat(b.servicePrice) || 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg flex items-center justify-between">
                  <div>
                    <div className="text-xs font-medium text-gray-900">{b.customerName}</div>
                    <div className="text-[11px] text-gray-500">ช่าง: {b.staffName}</div>
                  </div>
                  <a
                    href={`tel:${b.customerPhone}`}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[#D4A373] text-white rounded-lg text-xs font-medium shadow-xs"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>โทร</span>
                  </a>
                </div>

                {/* Bottom Actions */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    {b.paymentSlipUrl ? (
                      <button
                        onClick={() =>
                          setSelectedSlip({
                            url: b.paymentSlipUrl,
                            id: b.id,
                            name: b.customerName
                          })
                        }
                        className="text-xs text-[#D4A373] font-medium flex items-center gap-1"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>ดูสลิปโอนเงิน</span>
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          setSelectedSlip({
                            url: "",
                            id: b.id,
                            name: b.customerName
                          })
                        }
                        className="text-xs text-gray-400"
                      >
                        + แนบสลิป
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {onSwitchToCalendar && (
                      <button
                        type="button"
                        onClick={() => onSwitchToCalendar(b.date)}
                        className="p-1 text-stone-500 hover:text-[#B88555] bg-stone-100 rounded border border-stone-200"
                        title="เปิดดูบนปฏิทิน"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <select
                      value={b.status}
                      onChange={(e) => onUpdateStatus(b.id, e.target.value)}
                      className="text-xs py-1 px-2 rounded border border-gray-200 bg-white"
                    >
                      <option value="pending">รอยืนยัน</option>
                      <option value="confirmed">ยืนยัน</option>
                      <option value="completed">เสร็จสิ้น</option>
                      <option value="cancelled">ยกเลิก</option>
                    </select>

                    <button
                      onClick={() => handleDeleteConfirm(b.id)}
                      className="p-1 text-gray-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Slip Zoom Modal */}
      {selectedSlip && (
        <SlipZoomModal
          isOpen={true}
          onClose={() => setSelectedSlip(null)}
          slipUrl={selectedSlip.url}
          bookingId={selectedSlip.id}
          customerName={selectedSlip.name}
          onUpdateSlip={(id, newUrl) => {
            onUpdateSlip(id, newUrl);
            setSelectedSlip((prev) => (prev ? { ...prev, url: newUrl } : null));
          }}
        />
      )}

      {/* Admin Manual Booking Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-stone-50">
              <div>
                <h3 className="font-serif text-base font-semibold text-gray-900 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-[#D4A373]" />
                  เพิ่มคิวจองใหม่ (Admin Manual Booking)
                </h3>
                <p className="text-xs text-gray-400">
                  สำหรับลูกค้า Walk-in หรือโทรจอง โดยไม่ต้อง Login with LINE
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
              {/* Select Service */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  เลือกบริการ <span className="text-rose-500">*</span>
                </label>
                <select
                  value={newBooking.serviceId}
                  onChange={(e) => {
                    const sId = e.target.value;
                    const matchingStaff = staffList.find(
                      (st) => !st.skills || st.skills.length === 0 || st.skills.includes(sId)
                    );
                    setNewBooking((prev) => ({
                      ...prev,
                      serviceId: sId,
                      staffId: matchingStaff?.id || staffList[0]?.id || ""
                    }));
                  }}
                  required
                  className="w-full text-xs p-2.5 rounded-lg border border-gray-200 bg-white focus:border-[#D4A373] outline-none"
                >
                  <option value="">-- กรุณาเลือกบริการ --</option>
                  {services.map((s, sIdx) => (
                    <option key={`${s.id}-${sIdx}`} value={s.id}>
                      {s.name} ({s.duration} นาที - ฿{s.price.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Staff */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  เลือกช่างผู้ให้บริการ <span className="text-rose-500">*</span>
                </label>
                <select
                  value={newBooking.staffId}
                  onChange={(e) => setNewBooking((prev) => ({ ...prev, staffId: e.target.value }))}
                  required
                  className="w-full text-xs p-2.5 rounded-lg border border-gray-200 bg-white focus:border-[#D4A373] outline-none"
                >
                  <option value="">-- กรุณาเลือกช่าง --</option>
                  {availableStaffForModal.map((st, stIdx) => (
                    <option key={`${st.id}-${stIdx}`} value={st.id}>
                      {st.name} ({st.nickname || st.role})
                    </option>
                  ))}
                </select>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    วันที่จอง <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={newBooking.date}
                    onChange={(e) => setNewBooking((prev) => ({ ...prev, date: e.target.value }))}
                    required
                    className="w-full text-xs p-2.5 rounded-lg border border-gray-200 bg-white focus:border-[#D4A373] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    เวลาเริ่มต้น <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={newBooking.time}
                    onChange={(e) => setNewBooking((prev) => ({ ...prev, time: e.target.value }))}
                    required
                    className="w-full text-xs p-2.5 rounded-lg border border-gray-200 bg-white focus:border-[#D4A373] outline-none font-mono"
                  >
                    {[
                      "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
                      "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
                      "16:00", "16:30", "17:00", "17:30", "18:00", "18:30",
                      "19:00", "19:30", "20:00"
                    ].map((t) => (
                      <option key={t} value={t}>
                        {t} น.
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    ชื่อลูกค้า <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น คุณกมลวรรณ"
                    value={newBooking.customerName}
                    onChange={(e) => setNewBooking((prev) => ({ ...prev, customerName: e.target.value }))}
                    required
                    className="w-full text-xs p-2.5 rounded-lg border border-gray-200 bg-white focus:border-[#D4A373] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    เบอร์โทรศัพท์ <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="เช่น 0812345678"
                    value={newBooking.customerPhone}
                    onChange={(e) => setNewBooking((prev) => ({ ...prev, customerPhone: e.target.value }))}
                    required
                    className="w-full text-xs p-2.5 rounded-lg border border-gray-200 bg-white focus:border-[#D4A373] outline-none"
                  />
                </div>
              </div>

              {/* Email & Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    อีเมล (ถ้ามี)
                  </label>
                  <input
                    type="email"
                    placeholder="customer@email.com"
                    value={newBooking.customerEmail}
                    onChange={(e) => setNewBooking((prev) => ({ ...prev, customerEmail: e.target.value }))}
                    className="w-full text-xs p-2.5 rounded-lg border border-gray-200 bg-white focus:border-[#D4A373] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    สถานะการจอง
                  </label>
                  <select
                    value={newBooking.status}
                    onChange={(e) => setNewBooking((prev) => ({ ...prev, status: e.target.value }))}
                    className="w-full text-xs p-2.5 rounded-lg border border-gray-200 bg-white focus:border-[#D4A373] outline-none"
                  >
                    <option value="confirmed">ยืนยันแล้ว (Confirmed)</option>
                    <option value="pending">รอยืนยัน (Pending)</option>
                  </select>
                </div>
              </div>

              {/* Special Request */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  หมายเหตุ / ความต้องการพิเศษ
                </label>
                <textarea
                  rows={2}
                  placeholder="เช่น สีเจลโทนชมพูนู้ด, ขอช่างมือเบา"
                  value={newBooking.specialRequest}
                  onChange={(e) => setNewBooking((prev) => ({ ...prev, specialRequest: e.target.value }))}
                  className="w-full text-xs p-2.5 rounded-lg border border-gray-200 bg-white focus:border-[#D4A373] outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 text-xs font-medium hover:bg-gray-50 transition cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-lg bg-[#D4A373] hover:bg-[#b07e4c] text-white text-xs font-semibold shadow-xs transition cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "กำลังบันทึก..." : "บันทึกคิวจอง"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
