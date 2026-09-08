import React, { useState, useMemo, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  CalendarDays,
  Clock,
  User,
  Users,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Plus,
  CheckCircle2,
  AlertCircle,
  X,
  Phone,
  Image as ImageIcon,
  Trash2,
  Filter,
  List,
  Search,
  ExternalLink,
  Radio
} from "lucide-react";
import SlipZoomModal from "./SlipZoomModal";

// Generate 30-minute base slots from 09:00 to 21:00 to cover all studio operating hours
const TIME_SLOTS = [
  "09:00", "09:30",
  "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30",
  "19:00", "19:30", "20:00", "20:30", "21:00"
];

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

export function normalizeDate(d) {
  if (!d) return "";
  if (typeof d === "string") {
    const trimmed = d.trim();
    if (trimmed.includes("T")) return trimmed.split("T")[0];
    const parts = trimmed.replace(/\//g, "-").split("-");
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        return `${parts[0]}-${parts[1].padStart(2, "0")}-${parts[2].padStart(2, "0")}`;
      }
      if (parts[2].length === 4) {
        return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
      }
    }
    return trimmed;
  }
  if (d instanceof Date && !isNaN(d.getTime())) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }
  return String(d);
}

export function getLocalTodayDate() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const THAI_DAYS = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];
const THAI_MONTHS = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
];

function formatThaiDateDisplay(dateStr) {
  if (!dateStr) return "";
  const norm = normalizeDate(dateStr);
  const parts = norm.split("-").map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return dateStr;
  const [y, m, d] = parts;
  const dateObj = new Date(y, m - 1, d);
  const dayName = THAI_DAYS[dateObj.getDay()] || "";
  const monthName = THAI_MONTHS[m - 1] || "";
  const buddhistYear = y + 543;
  return `วัน${dayName}ที่ ${d} ${monthName} ${buddhistYear}`;
}

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

export default function AdminCalendarTab({
  bookings = [],
  services = [],
  staffList = [],
  targetDate = null,
  onTargetDateHandled,
  onUpdateStatus,
  onDeleteBooking,
  onUpdateSlip,
  onCreateBooking
}) {
  // Calendar View State: "day", "week", or "agenda"
  const [viewMode, setViewMode] = useState("day");
  const [selectedDate, setSelectedDate] = useState(() => getLocalTodayDate());
  const [selectedStaffFilter, setSelectedStaffFilter] = useState("all");
  const [selectedServiceFilter, setSelectedServiceFilter] = useState("all");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("all");
  const [agendaSearch, setAgendaSearch] = useState("");

  // Target date navigation hook
  useEffect(() => {
    if (targetDate) {
      const norm = normalizeDate(targetDate);
      if (norm) {
        setSelectedDate(norm);
        setViewMode("day");
        if (onTargetDateHandled) onTargetDateHandled();
      }
    }
  }, [targetDate, onTargetDateHandled]);

  // Booking Detail & Modals
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedSlip, setSelectedSlip] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newBooking, setNewBooking] = useState({
    serviceId: "",
    staffId: "",
    date: getLocalTodayDate(),
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
    const validBookings = (bookings || []).filter((b) => b.status !== "cancelled");

    for (let i = 0; i < validBookings.length; i++) {
      const b1 = validBookings[i];
      const s1 = timeToMinutes(b1.time);
      let d1 = parseInt(b1.serviceDuration, 10);
      if (!d1 || isNaN(d1)) {
        const srv = services.find((s) => s.id === b1.serviceId || s.name === b1.serviceName);
        d1 = srv?.duration ? parseInt(srv.duration, 10) : 60;
      }
      const e1 = s1 + d1;

      for (let j = i + 1; j < validBookings.length; j++) {
        const b2 = validBookings[j];
        const isSameStaff =
          (b1.staffId && b2.staffId && b1.staffId === b2.staffId) ||
          (b1.staffName && b2.staffName && b1.staffName === b2.staffName);

        if (isSameStaff && normalizeDate(b1.date) === normalizeDate(b2.date)) {
          const s2 = timeToMinutes(b2.time);
          let d2 = parseInt(b2.serviceDuration, 10);
          if (!d2 || isNaN(d2)) {
            const srv = services.find((s) => s.id === b2.serviceId || s.name === b2.serviceName);
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

  // Calculate Week Days for Week View (7 days starting from selectedDate's Monday)
  const weekDays = useMemo(() => {
    const norm = normalizeDate(selectedDate) || getLocalTodayDate();
    const parts = norm.split("-").map(Number);
    const curr = parts.length === 3 && !parts.some(isNaN) ? new Date(parts[0], parts[1] - 1, parts[2]) : new Date();

    const dayOfWeek = curr.getDay(); // 0 is Sunday, 1 is Monday
    const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(curr);
    monday.setDate(curr.getDate() + distanceToMonday);

    const todayStr = getLocalTodayDate();
    const days = [];
    for (let i = 0; i < 7; i++) {
      const dt = new Date(monday);
      dt.setDate(monday.getDate() + i);
      const yStr = dt.getFullYear();
      const mStr = String(dt.getMonth() + 1).padStart(2, "0");
      const dStr = String(dt.getDate()).padStart(2, "0");
      const dateStr = `${yStr}-${mStr}-${dStr}`;
      days.push({
        dateStr,
        dayNum: dt.getDate(),
        dayName: THAI_DAYS[dt.getDay()],
        monthName: THAI_MONTHS[dt.getMonth()],
        isToday: dateStr === todayStr,
        isSelected: dateStr === norm
      });
    }
    return days;
  }, [selectedDate]);

  // Quick jump dates: Dates that have active bookings
  const datesWithBookings = useMemo(() => {
    const countsByDate = {};
    (bookings || []).forEach((b) => {
      if (b.status === "cancelled") return;
      const d = normalizeDate(b.date);
      if (d) {
        countsByDate[d] = (countsByDate[d] || 0) + 1;
      }
    });

    const sortedDates = Object.keys(countsByDate).sort();
    return sortedDates.map((dStr) => {
      const parts = dStr.split("-").map(Number);
      const dt = new Date(parts[0], parts[1] - 1, parts[2]);
      const isToday = dStr === getLocalTodayDate();
      return {
        dateStr: dStr,
        count: countsByDate[dStr],
        display: isToday
          ? `วันนี้ (${countsByDate[dStr]} คิว)`
          : `${dt.getDate()} ${THAI_MONTHS[dt.getMonth()]} (${countsByDate[dStr]} คิว)`,
        isToday,
        isSelected: dStr === normalizeDate(selectedDate)
      };
    });
  }, [bookings, selectedDate]);

  // Navigate dates
  const handlePrev = () => {
    const norm = normalizeDate(selectedDate) || getLocalTodayDate();
    const parts = norm.split("-").map(Number);
    const dt = new Date(parts[0], parts[1] - 1, parts[2]);
    dt.setDate(dt.getDate() - (viewMode === "day" ? 1 : 7));
    const yStr = dt.getFullYear();
    const mStr = String(dt.getMonth() + 1).padStart(2, "0");
    const dStr = String(dt.getDate()).padStart(2, "0");
    setSelectedDate(`${yStr}-${mStr}-${dStr}`);
  };

  const handleNext = () => {
    const norm = normalizeDate(selectedDate) || getLocalTodayDate();
    const parts = norm.split("-").map(Number);
    const dt = new Date(parts[0], parts[1] - 1, parts[2]);
    dt.setDate(dt.getDate() + (viewMode === "day" ? 1 : 7));
    const yStr = dt.getFullYear();
    const mStr = String(dt.getMonth() + 1).padStart(2, "0");
    const dStr = String(dt.getDate()).padStart(2, "0");
    setSelectedDate(`${yStr}-${mStr}-${dStr}`);
  };

  const handleToday = () => {
    setSelectedDate(getLocalTodayDate());
  };

  // Filter staff list based on filter
  const displayedStaff = useMemo(() => {
    if (selectedStaffFilter === "all") return staffList;
    return staffList.filter((s) => s.id === selectedStaffFilter);
  }, [staffList, selectedStaffFilter]);

  // Active bookings on selected date(s)
  const activeBookings = useMemo(() => {
    const normSelected = normalizeDate(selectedDate);
    return (bookings || []).filter((b) => {
      if (b.status === "cancelled") return false;
      if (selectedStaffFilter !== "all" && b.staffId !== selectedStaffFilter) return false;
      if (selectedServiceFilter !== "all" && b.serviceId !== selectedServiceFilter) return false;
      if (selectedStatusFilter !== "all" && b.status !== selectedStatusFilter) return false;

      const normBDate = normalizeDate(b.date);
      if (viewMode === "day") {
        return normBDate === normSelected;
      } else if (viewMode === "week") {
        return weekDays.some((w) => normalizeDate(w.dateStr) === normBDate);
      }
      return true; // For agenda mode
    });
  }, [bookings, selectedDate, viewMode, weekDays, selectedStaffFilter, selectedServiceFilter, selectedStatusFilter]);

  // Agenda Bookings (Grouped by date)
  const agendaGroupedBookings = useMemo(() => {
    const searchLower = agendaSearch.trim().toLowerCase();
    const filtered = (bookings || []).filter((b) => {
      if (b.status === "cancelled") return false;
      if (selectedStaffFilter !== "all" && b.staffId !== selectedStaffFilter) return false;
      if (selectedServiceFilter !== "all" && b.serviceId !== selectedServiceFilter) return false;
      if (selectedStatusFilter !== "all" && b.status !== selectedStatusFilter) return false;

      if (searchLower) {
        const matchName = b.customerName?.toLowerCase().includes(searchLower);
        const matchPhone = b.customerPhone?.toLowerCase().includes(searchLower);
        const matchSrv = b.serviceName?.toLowerCase().includes(searchLower);
        const matchStaff = b.staffName?.toLowerCase().includes(searchLower);
        const matchId = String(b.id || "").toLowerCase().includes(searchLower);
        if (!matchName && !matchPhone && !matchSrv && !matchStaff && !matchId) return false;
      }
      return true;
    });

    // Sort chronologically (Date + Time)
    filtered.sort((a, b) => {
      const dComp = normalizeDate(a.date).localeCompare(normalizeDate(b.date));
      if (dComp !== 0) return dComp;
      return timeToMinutes(a.time) - timeToMinutes(b.time);
    });

    // Group by normalized date
    const groups = {};
    filtered.forEach((b) => {
      const d = normalizeDate(b.date) || "ไม่มีวันที่";
      if (!groups[d]) groups[d] = [];
      groups[d].push(b);
    });

    return groups;
  }, [bookings, selectedStaffFilter, selectedServiceFilter, selectedStatusFilter, agendaSearch]);

  // Handle Quick Add on specific slot and staff
  const handleQuickAdd = (dateStr, timeStr, staffId) => {
    const defaultSrv = services[0]?.id || "";
    setNewBooking({
      serviceId: defaultSrv,
      staffId: staffId || staffList[0]?.id || "",
      date: normalizeDate(dateStr) || normalizeDate(selectedDate) || getLocalTodayDate(),
      time: timeStr || "10:00",
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
      alert(err.message || "เกิดข้อผิดพลาดในการสร้างคิวจอง");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to find all bookings occupying a specific slot for a staff
  const getBookingsForSlot = (dateStr, timeStr, staffId) => {
    const slotMin = timeToMinutes(timeStr);
    const normTargetDate = normalizeDate(dateStr);

    return (bookings || []).filter((b) => {
      if (b.status === "cancelled") return false;
      if (normalizeDate(b.date) !== normTargetDate) return false;

      // Match staff by ID or Name
      if (staffId) {
        const staffObj = staffList.find((s) => s.id === staffId);
        const matchId = b.staffId === staffId;
        const matchName =
          staffObj &&
          b.staffName &&
          (b.staffName === staffObj.name || b.staffName.includes(staffObj.nickname || "___"));
        if (!matchId && !matchName) return false;
      }

      if (selectedStatusFilter !== "all" && b.status !== selectedStatusFilter) return false;

      const bStartMin = timeToMinutes(b.time);
      let bDur = parseInt(b.serviceDuration, 10);
      if (!bDur || isNaN(bDur)) {
        const srv = services.find((s) => s.id === b.serviceId || s.name === b.serviceName);
        bDur = srv?.duration ? parseInt(srv.duration, 10) : 60;
      }
      const bEndMin = bStartMin + bDur;

      // Slot is occupied if slotMin is within [bStartMin, bEndMin)
      return slotMin >= bStartMin && slotMin < bEndMin;
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return {
          bg: "bg-emerald-50 hover:bg-emerald-100/90 border-emerald-300 text-emerald-900",
          badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
          text: "ยืนยันแล้ว"
        };
      case "completed":
        return {
          bg: "bg-blue-50 hover:bg-blue-100/90 border-blue-300 text-blue-900",
          badge: "bg-blue-100 text-blue-800 border-blue-200",
          text: "เสร็จสิ้น"
        };
      default:
        return {
          bg: "bg-amber-50 hover:bg-amber-100/90 border-amber-300 text-amber-900",
          badge: "bg-amber-100 text-amber-800 border-amber-200",
          text: "รอยืนยัน"
        };
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Header Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-stone-200/80 shadow-xs flex flex-col gap-3">
        {/* Top Row: Date Navigation & View Mode */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Left: Date Navigation */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleToday}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 transition cursor-pointer border border-stone-200"
            >
              วันนี้ (Today)
            </button>
            <div className="flex items-center bg-stone-100 rounded-lg p-0.5 border border-stone-200">
              <button
                type="button"
                onClick={handlePrev}
                className="p-1.5 rounded-md hover:bg-white text-stone-600 transition cursor-pointer"
                title="ย้อนกลับ"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="p-1.5 rounded-md hover:bg-white text-stone-600 transition cursor-pointer"
                title="ถัดไป"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="date"
                value={normalizeDate(selectedDate)}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="text-xs py-1.5 px-2.5 rounded-lg border border-stone-200 bg-white focus:border-[#D4A373] outline-none font-medium text-stone-800"
              />
              <span className="text-sm font-serif font-semibold text-stone-800 hidden sm:inline">
                {formatThaiDateDisplay(selectedDate)}
              </span>
            </div>

            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/80">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              ซิงค์สดอัตโนมัติ
            </span>
          </div>

          {/* Right: View Mode Switcher & Add Button */}
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <div className="flex items-center bg-stone-100 rounded-lg p-0.5 border border-stone-200 text-xs">
              <button
                type="button"
                onClick={() => setViewMode("day")}
                className={`px-3 py-1 rounded-md font-medium transition cursor-pointer ${
                  viewMode === "day"
                    ? "bg-white text-stone-900 shadow-2xs font-semibold"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                รายวัน (Day)
              </button>
              <button
                type="button"
                onClick={() => setViewMode("week")}
                className={`px-3 py-1 rounded-md font-medium transition cursor-pointer ${
                  viewMode === "week"
                    ? "bg-white text-stone-900 shadow-2xs font-semibold"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                รายสัปดาห์ (Week)
              </button>
              <button
                type="button"
                onClick={() => setViewMode("agenda")}
                className={`px-3 py-1 rounded-md font-medium transition cursor-pointer flex items-center gap-1 ${
                  viewMode === "agenda"
                    ? "bg-white text-stone-900 shadow-2xs font-semibold"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>กำหนดการทั้งหมด (Agenda)</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => handleQuickAdd(selectedDate, "10:00", staffList[0]?.id)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#D4A373] hover:bg-[#c19262] text-white flex items-center gap-1.5 shadow-2xs cursor-pointer transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>เพิ่มคิวจอง</span>
            </button>
          </div>
        </div>

        {/* Second Row: Filters */}
        <div className="flex items-center justify-between gap-2 flex-wrap pt-2 border-t border-stone-100">
          <div className="flex items-center gap-2 flex-wrap text-xs">
            {/* Staff Filter */}
            <div className="flex items-center gap-1 bg-stone-50 px-2 py-1 rounded-lg border border-stone-200">
              <Users className="w-3.5 h-3.5 text-stone-400" />
              <select
                value={selectedStaffFilter}
                onChange={(e) => setSelectedStaffFilter(e.target.value)}
                className="text-xs bg-transparent text-stone-700 outline-none cursor-pointer"
              >
                <option value="all">ช่างทุกคน ({staffList.length})</option>
                {staffList.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name} {st.nickname ? `(${st.nickname})` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Service Filter */}
            <div className="flex items-center gap-1 bg-stone-50 px-2 py-1 rounded-lg border border-stone-200">
              <Sparkles className="w-3.5 h-3.5 text-stone-400" />
              <select
                value={selectedServiceFilter}
                onChange={(e) => setSelectedServiceFilter(e.target.value)}
                className="text-xs bg-transparent text-stone-700 outline-none cursor-pointer"
              >
                <option value="all">ทุกบริการ ({services.length})</option>
                {services.map((srv) => (
                  <option key={srv.id} value={srv.id}>
                    {srv.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1 bg-stone-50 px-2 py-1 rounded-lg border border-stone-200">
              <Filter className="w-3.5 h-3.5 text-stone-400" />
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="text-xs bg-transparent text-stone-700 outline-none cursor-pointer"
              >
                <option value="all">ทุกสถานะ</option>
                <option value="confirmed">ยืนยันแล้ว</option>
                <option value="pending">รอยืนยัน</option>
                <option value="completed">เสร็จสิ้น</option>
              </select>
            </div>
          </div>

          <div className="text-xs text-stone-500 font-medium">
            คิวแสดงผล: <strong className="text-stone-800">{activeBookings.length}</strong> รายการ (จากทั้งหมด {bookings.filter(b => b.status !== 'cancelled').length} คิว)
          </div>
        </div>

        {/* Quick Booking Dates Strip */}
        {datesWithBookings.length > 0 && (
          <div className="pt-2 border-t border-stone-100 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-[11px] font-semibold text-stone-500 shrink-0 flex items-center gap-1">
              <CalendarDays className="w-3.5 h-3.5 text-[#D4A373]" />
              วันที่มีคิวจอง:
            </span>
            <div className="flex items-center gap-1.5 flex-nowrap">
              {datesWithBookings.map((item) => (
                <button
                  key={item.dateStr}
                  type="button"
                  onClick={() => {
                    setSelectedDate(item.dateStr);
                    if (viewMode === "agenda") setViewMode("day");
                  }}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition cursor-pointer shrink-0 border flex items-center gap-1 ${
                    normalizeDate(selectedDate) === item.dateStr
                      ? "bg-[#D4A373] text-white border-[#D4A373] shadow-2xs font-semibold"
                      : "bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100"
                  }`}
                >
                  <span>{item.display}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Conflict Alert Banner if any conflicts on current date */}
      {conflictingBookingIds.size > 0 && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-950 flex items-start gap-3 shadow-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-rose-900 text-sm">
                ⚠️ มีรายการจองที่เวลาทับซ้อนกัน ({conflictingBookingIds.size} รายการ)
              </span>
              <span className="text-[10px] font-semibold bg-rose-100 px-2 py-0.5 rounded text-rose-800 border border-rose-300">
                Booking Conflicts
              </span>
            </div>
            <p className="text-rose-700 mt-0.5 leading-relaxed">
              ในตารางด้านล่าง ช่องเวลาที่มีการจองซ้ำซ้อนจะแสดงแถบสีแดง <strong>"⚠️ คิวซ้ำซ้อน"</strong> เพื่อให้แอดมินสังเกตเห็นได้ทันที คลิกที่การ์ดเพื่อดูรายละเอียดหรือย้ายเวลา
            </p>
          </div>
        </div>
      )}

      {/* 2. CALENDAR VIEW: DAY VIEW (Columns by Staff) */}
      {viewMode === "day" && (
        <div className="bg-white rounded-xl border border-stone-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] border-collapse text-left">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200">
                  <th className="py-3 px-3 w-20 text-[11px] font-bold text-stone-500 uppercase tracking-wider text-center border-r border-stone-200 bg-stone-100/50 sticky left-0 z-20">
                    เวลา
                  </th>
                  {displayedStaff.map((staff) => (
                    <th
                      key={staff.id}
                      className="py-3 px-4 text-xs font-semibold text-stone-800 border-r border-stone-200 last:border-r-0 min-w-[180px]"
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={staff.avatar || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100"}
                          alt={staff.name}
                          className="w-7 h-7 rounded-full object-cover border border-stone-200"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-stone-900 truncate text-xs">
                            {staff.name}
                          </p>
                          <p className="text-[10px] text-stone-400 truncate">
                            {staff.nickname ? `(${staff.nickname}) • ` : ""}{staff.role}
                          </p>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {TIME_SLOTS.map((timeSlot) => {
                  const slotMin = timeToMinutes(timeSlot);
                  return (
                    <tr key={timeSlot} className="hover:bg-stone-50/40 transition-colors">
                      {/* Time Slot Label */}
                      <td className="py-2.5 px-2 text-xs font-mono font-bold text-stone-600 text-center border-r border-stone-200 bg-stone-50/50 sticky left-0 z-10 select-none">
                        {timeSlot}
                      </td>

                      {/* Staff Columns */}
                      {displayedStaff.map((staff) => {
                        const slotBookings = getBookingsForSlot(selectedDate, timeSlot, staff.id);

                        if (slotBookings.length > 0) {
                          return (
                            <td
                              key={`${staff.id}-${timeSlot}`}
                              className="p-1 border-r border-stone-200 last:border-r-0 align-top space-y-1"
                            >
                              {slotBookings.map((booking) => {
                                const bStartMin = timeToMinutes(booking.time);
                                const isStartSlot =
                                  booking.time === timeSlot ||
                                  (bStartMin >= slotMin && bStartMin < slotMin + 30);
                                const isConflict = conflictingBookingIds.has(booking.id);
                                const colors = getStatusColor(booking.status);
                                const duration = booking.serviceDuration || 60;
                                const endTime =
                                  booking.endTime ||
                                  minutesToTime(timeToMinutes(booking.time) + duration);

                                if (isStartSlot) {
                                  return (
                                    <div
                                      key={booking.id}
                                      onClick={() => setSelectedBooking(booking)}
                                      className={`p-2.5 rounded-lg border shadow-2xs transition cursor-pointer ${
                                        isConflict
                                          ? "bg-rose-50 hover:bg-rose-100 border-rose-400 text-rose-950 ring-1 ring-rose-300"
                                          : colors.bg
                                      }`}
                                    >
                                      <div className="flex items-center justify-between gap-1 mb-1">
                                        <span className="font-bold text-xs truncate">
                                          {booking.customerName}
                                        </span>
                                        {isConflict ? (
                                          <span className="text-[9px] px-1.5 py-0.2 rounded-full font-bold bg-rose-100 text-rose-800 border border-rose-300 animate-pulse whitespace-nowrap">
                                            ⚠️ คิวซ้ำซ้อน
                                          </span>
                                        ) : (
                                          <span
                                            className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold border whitespace-nowrap ${colors.badge}`}
                                          >
                                            {colors.text}
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-[11px] font-medium text-stone-700 truncate">
                                        {booking.serviceName}
                                      </p>
                                      <div className="flex items-center justify-between mt-1 text-[10px] text-stone-500">
                                        <span>
                                          ⏰ {booking.time} - {endTime} ({duration} นาที)
                                        </span>
                                        <span className="font-semibold text-stone-800">
                                          ฿{Number(booking.servicePrice || 0).toLocaleString()}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                } else {
                                  return (
                                    <div
                                      key={booking.id}
                                      onClick={() => setSelectedBooking(booking)}
                                      className={`h-full min-h-[28px] rounded border border-dashed text-[10px] flex items-center justify-center cursor-pointer ${
                                        isConflict
                                          ? "border-rose-300 bg-rose-50/70 text-rose-600 font-medium"
                                          : "border-stone-200 bg-stone-50/80 text-stone-400 hover:bg-stone-100"
                                      }`}
                                    >
                                      ↳ ต่อเนื่อง ({booking.customerName}) {isConflict && "⚠️"}
                                    </div>
                                  );
                                }
                              })}
                            </td>
                          );
                        }

                        // Empty / Available Slot
                        return (
                          <td
                            key={`${staff.id}-${timeSlot}`}
                            className="p-1 border-r border-stone-200 last:border-r-0 group cursor-pointer"
                            onClick={() => handleQuickAdd(selectedDate, timeSlot, staff.id)}
                          >
                            <div className="h-full min-h-[36px] rounded-lg border border-transparent hover:border-[#D4A373]/40 hover:bg-[#FAF7F2] transition flex items-center justify-center text-[11px] text-stone-300 group-hover:text-[#D4A373]">
                              <span className="opacity-0 group-hover:opacity-100 flex items-center gap-1 font-medium text-xs">
                                <Plus className="w-3 h-3" /> ว่าง (คลิกจอง)
                              </span>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. CALENDAR VIEW: WEEK VIEW (7 Days Grid) */}
      {viewMode === "week" && (
        <div className="bg-white rounded-xl border border-stone-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] border-collapse text-left">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200">
                  <th className="py-3 px-3 w-16 text-[11px] font-bold text-stone-500 uppercase tracking-wider text-center border-r border-stone-200 bg-stone-100/50 sticky left-0 z-20">
                    เวลา
                  </th>
                  {weekDays.map((w) => (
                    <th
                      key={w.dateStr}
                      onClick={() => {
                        setSelectedDate(w.dateStr);
                        setViewMode("day");
                      }}
                      className={`py-3 px-2 text-center border-r border-stone-200 last:border-r-0 cursor-pointer hover:bg-stone-100/70 transition ${
                        w.isSelected ? "bg-amber-50/50" : ""
                      }`}
                    >
                      <p className={`text-[10px] font-bold uppercase ${w.isToday ? "text-[#D4A373]" : "text-stone-400"}`}>
                        {w.isToday ? "วันนี้" : w.dayName}
                      </p>
                      <p className={`text-base font-serif font-bold ${w.isToday ? "text-[#D4A373]" : "text-stone-800"}`}>
                        {w.dayNum}
                      </p>
                      <p className="text-[9px] text-stone-400">
                        {w.monthName}
                      </p>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {TIME_SLOTS.map((timeSlot) => {
                  const slotMin = timeToMinutes(timeSlot);
                  return (
                    <tr key={timeSlot} className="hover:bg-stone-50/40 transition-colors">
                      {/* Time Slot Label */}
                      <td className="py-2.5 px-2 text-xs font-mono font-bold text-stone-600 text-center border-r border-stone-200 bg-stone-50/50 sticky left-0 z-10 select-none">
                        {timeSlot}
                      </td>

                      {/* 7 Days Columns */}
                      {weekDays.map((w) => {
                        const slotBookings = getBookingsForSlot(
                          w.dateStr,
                          timeSlot,
                          selectedStaffFilter === "all" ? null : selectedStaffFilter
                        );

                        if (slotBookings.length > 0) {
                          return (
                            <td
                              key={`${w.dateStr}-${timeSlot}`}
                              className="p-1 border-r border-stone-200 last:border-r-0 align-top space-y-1"
                            >
                              {slotBookings.map((booking) => {
                                const bStartMin = timeToMinutes(booking.time);
                                const isStartSlot =
                                  booking.time === timeSlot ||
                                  (bStartMin >= slotMin && bStartMin < slotMin + 30);
                                const isConflict = conflictingBookingIds.has(booking.id);
                                const colors = getStatusColor(booking.status);

                                if (isStartSlot) {
                                  return (
                                    <div
                                      key={booking.id}
                                      onClick={() => setSelectedBooking(booking)}
                                      className={`p-1.5 rounded-lg border shadow-2xs transition cursor-pointer ${
                                        isConflict
                                          ? "bg-rose-50 hover:bg-rose-100 border-rose-400 text-rose-950 ring-1 ring-rose-300"
                                          : colors.bg
                                      }`}
                                    >
                                      <div className="flex items-center justify-between gap-1">
                                        <p className="font-bold text-[11px] truncate">
                                          {booking.customerName}
                                        </p>
                                        {isConflict && (
                                          <span className="text-[8px] px-1 py-0.2 rounded font-bold bg-rose-100 text-rose-800 border border-rose-300 animate-pulse whitespace-nowrap">
                                            ⚠️ ซ้ำ
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-[10px] text-stone-600 truncate">
                                        {booking.serviceName}
                                      </p>
                                      <div className="flex items-center justify-between text-[9px] text-stone-500 mt-0.5">
                                        <span>{booking.staffName?.replace(/คุณ|\(.*\)/g, "")}</span>
                                        <span>{booking.time}</span>
                                      </div>
                                    </div>
                                  );
                                } else {
                                  return (
                                    <div
                                      key={booking.id}
                                      onClick={() => setSelectedBooking(booking)}
                                      className={`h-full min-h-[28px] rounded border border-dashed text-[9px] flex items-center justify-center cursor-pointer ${
                                        isConflict
                                          ? "border-rose-300 bg-rose-50/70 text-rose-600 font-medium"
                                          : "border-stone-200 bg-stone-50/80 text-stone-400 hover:bg-stone-100"
                                      }`}
                                    >
                                      ↳ {booking.customerName} {isConflict && "⚠️"}
                                    </div>
                                  );
                                }
                              })}
                            </td>
                          );
                        }

                        // Empty Slot
                        return (
                          <td
                            key={`${w.dateStr}-${timeSlot}`}
                            className="p-1 border-r border-stone-200 last:border-r-0 group cursor-pointer"
                            onClick={() => handleQuickAdd(w.dateStr, timeSlot, staffList[0]?.id)}
                          >
                            <div className="h-full min-h-[32px] rounded-md border border-transparent hover:border-[#D4A373]/30 hover:bg-[#FAF7F2] transition flex items-center justify-center text-[10px] text-stone-300 group-hover:text-[#D4A373]">
                              <Plus className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. CALENDAR VIEW: AGENDA VIEW (Chronological list grouped by date) */}
      {viewMode === "agenda" && (
        <div className="space-y-4">
          {/* Search bar in Agenda */}
          <div className="bg-white p-3.5 rounded-xl border border-stone-200/80 shadow-xs flex items-center gap-3">
            <Search className="w-4 h-4 text-stone-400 shrink-0" />
            <input
              type="text"
              placeholder="ค้นหาชื่อลูกค้า, เบอร์โทร, บริการ, หรือช่าง ในกำหนดการทั้งหมด..."
              value={agendaSearch}
              onChange={(e) => setAgendaSearch(e.target.value)}
              className="w-full text-xs outline-none bg-transparent text-stone-800"
            />
            {agendaSearch && (
              <button
                type="button"
                onClick={() => setAgendaSearch("")}
                className="text-stone-400 hover:text-stone-600 text-xs"
              >
                ล้าง
              </button>
            )}
          </div>

          {Object.keys(agendaGroupedBookings).length === 0 ? (
            <div className="bg-white p-12 rounded-xl border border-stone-200/80 text-center space-y-2">
              <CalendarIcon className="w-10 h-10 text-stone-300 mx-auto" />
              <h4 className="font-serif text-sm font-semibold text-stone-800">
                ไม่พบคิวการจองตามเงื่อนไขที่เลือก
              </h4>
              <p className="text-xs text-stone-400 max-w-sm mx-auto">
                สามารถกดปุ่ม "เพิ่มคิวจอง" หรือปรับตัวกรองช่าง/บริการเพื่อดูรายการอื่นๆ
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(agendaGroupedBookings).map(([dateKey, items]) => {
                const isToday = dateKey === getLocalTodayDate();
                return (
                  <div
                    key={dateKey}
                    className="bg-white rounded-xl border border-stone-200/80 shadow-xs overflow-hidden"
                  >
                    {/* Date Header */}
                    <div className="p-3 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CalendarDays className={`w-4 h-4 ${isToday ? "text-[#D4A373]" : "text-stone-500"}`} />
                        <span className="font-serif font-bold text-xs sm:text-sm text-stone-900">
                          {formatThaiDateDisplay(dateKey)}
                        </span>
                        {isToday && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#D4A373] text-white">
                            วันนี้
                          </span>
                        )}
                        <span className="text-xs text-stone-400 font-medium">
                          ({items.length} คิว)
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDate(dateKey);
                          setViewMode("day");
                        }}
                        className="text-xs text-[#D4A373] hover:text-[#b88555] font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <span>เปิดดูในตารางวัน</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Bookings List for this Date */}
                    <div className="divide-y divide-stone-100">
                      {items.map((b) => {
                        const isConflict = conflictingBookingIds.has(b.id);
                        const colors = getStatusColor(b.status);
                        return (
                          <div
                            key={b.id}
                            className="p-3.5 hover:bg-stone-50/60 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          >
                            <div className="flex items-start gap-3">
                              {/* Time Badge */}
                              <div className="px-2.5 py-1.5 rounded-lg bg-stone-100 border border-stone-200 font-mono text-xs font-bold text-stone-800 shrink-0 text-center">
                                <div>{b.time} น.</div>
                                <div className="text-[9px] text-stone-400 font-normal">
                                  {b.serviceDuration || 60} นาที
                                </div>
                              </div>

                              <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-bold text-stone-900 text-xs sm:text-sm">
                                    {b.customerName}
                                  </span>
                                  {isConflict && (
                                    <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
                                      ⚠️ คิวซ้ำซ้อน
                                    </span>
                                  )}
                                  <span
                                    className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold border ${colors.badge}`}
                                  >
                                    {colors.text}
                                  </span>
                                </div>

                                <div className="text-xs text-stone-600 flex items-center gap-2 flex-wrap">
                                  <span className="font-medium text-[#B88555]">{b.serviceName}</span>
                                  <span>•</span>
                                  <span>ช่าง: <strong>{b.staffName}</strong></span>
                                  <span>•</span>
                                  <span className="font-mono text-stone-500">฿{Number(b.servicePrice || 0).toLocaleString()}</span>
                                </div>

                                <div className="flex items-center gap-3 text-[11px] text-stone-400">
                                  <a
                                    href={`tel:${b.customerPhone}`}
                                    className="text-stone-600 hover:text-[#B88555] flex items-center gap-1 font-medium"
                                  >
                                    <Phone className="w-3 h-3" />
                                    {b.customerPhone}
                                  </a>
                                  {b.specialRequest && (
                                    <span className="text-amber-700 italic truncate max-w-xs">
                                      "{b.specialRequest}"
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 self-end sm:self-center">
                              {b.paymentSlipUrl && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setSelectedSlip({
                                      url: b.paymentSlipUrl,
                                      id: b.id,
                                      name: b.customerName
                                    })
                                  }
                                  className="p-1.5 text-stone-500 hover:text-stone-800 bg-stone-100 hover:bg-stone-200 rounded-lg text-xs flex items-center gap-1 cursor-pointer"
                                  title="ดูสลิป"
                                >
                                  <ImageIcon className="w-3.5 h-3.5 text-[#D4A373]" />
                                </button>
                              )}

                              <select
                                value={b.status}
                                onChange={(e) => onUpdateStatus(b.id, e.target.value)}
                                className="text-xs font-semibold py-1 px-2 rounded-lg border outline-none cursor-pointer bg-white"
                              >
                                <option value="pending">รอยืนยัน</option>
                                <option value="confirmed">ยืนยันแล้ว</option>
                                <option value="completed">เสร็จสิ้น</option>
                                <option value="cancelled">ยกเลิก</option>
                              </select>

                              <button
                                type="button"
                                onClick={() => setSelectedBooking(b)}
                                className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-medium cursor-pointer"
                              >
                                รายละเอียด
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 5. Booking Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl border border-stone-100 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-stone-50">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#D4A373]">
                  Booking Details
                </span>
                <h3 className="font-serif text-base font-semibold text-stone-900">
                  รหัสจอง #{selectedBooking.id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="w-8 h-8 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-500 hover:text-stone-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs">
              {/* Conflict Alert Banner */}
              {conflictingBookingIds.has(selectedBooking.id) && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-2 animate-pulse">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-xs text-rose-800">⚠️ ตรวจพบคิวซ้ำซ้อน (Booking Conflict)</p>
                    <p className="text-[11px] text-rose-700 mt-0.5">
                      คิวนี้มีช่วงเวลาทับซ้อนกับคิวอื่นของช่างคนเดียวกัน กรุณาตรวจสอบหรือปรับเปลี่ยนเวลานัด
                    </p>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center p-2.5 rounded-lg bg-stone-50 border border-stone-100">
                <span className="text-stone-500 font-medium">สถานะคิวจอง:</span>
                <select
                  value={selectedBooking.status}
                  onChange={(e) => {
                    const newStatus = e.target.value;
                    onUpdateStatus(selectedBooking.id, newStatus);
                    setSelectedBooking((prev) => ({ ...prev, status: newStatus }));
                  }}
                  className="text-xs font-semibold py-1 px-2.5 rounded-lg border outline-none cursor-pointer bg-white"
                >
                  <option value="pending">รอยืนยัน (Pending)</option>
                  <option value="confirmed">ยืนยันแล้ว (Confirmed)</option>
                  <option value="completed">เสร็จสิ้น (Completed)</option>
                  <option value="cancelled">ยกเลิก (Cancelled)</option>
                </select>
              </div>

              <div className="space-y-2 border-b border-stone-100 pb-3">
                <div className="flex justify-between">
                  <span className="text-stone-500">บริการ (Service):</span>
                  <span className="font-bold text-stone-900 text-right">{selectedBooking.serviceName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">ผู้ให้บริการ (Specialist):</span>
                  <span className="font-semibold text-stone-800">{selectedBooking.staffName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">วัน & เวลา (Appointment):</span>
                  <span className="font-bold text-[#B88555]">
                    {selectedBooking.date} • {selectedBooking.time} - {selectedBooking.endTime || minutesToTime(timeToMinutes(selectedBooking.time) + (selectedBooking.serviceDuration || 60))} น.
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">ระยะเวลา:</span>
                  <span className="font-medium text-stone-700">{selectedBooking.serviceDuration || 60} นาที</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">ราคา (Price):</span>
                  <span className="font-bold text-stone-900">฿{Number(selectedBooking.servicePrice || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[11px] pt-1 border-t border-stone-100/60 font-mono">
                  <span className="text-stone-400">เวลาส่งคำขอ (Precision):</span>
                  <span className="text-[#B88555] font-semibold">
                    {formatPrecisionTimestamp(selectedBooking.createdAt, selectedBooking.createdAtMs)} น.
                    {selectedBooking.createdAtMs && (
                      <span className="text-stone-400 text-[9px] block text-right font-normal">
                        (ms: {selectedBooking.createdAtMs})
                      </span>
                    )}
                  </span>
                </div>
              </div>

              <div className="space-y-2 border-b border-stone-100 pb-3">
                <div className="flex justify-between">
                  <span className="text-stone-500">ชื่อลูกค้า:</span>
                  <span className="font-bold text-stone-900">{selectedBooking.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">เบอร์โทรศัพท์:</span>
                  <a href={`tel:${selectedBooking.customerPhone}`} className="font-medium text-[#B88555] hover:underline flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {selectedBooking.customerPhone}
                  </a>
                </div>
                {selectedBooking.customerEmail && (
                  <div className="flex justify-between">
                    <span className="text-stone-500">อีเมล:</span>
                    <span className="text-stone-700">{selectedBooking.customerEmail}</span>
                  </div>
                )}
                {selectedBooking.specialRequest && (
                  <div className="p-2 rounded bg-amber-50/70 border border-amber-100 text-amber-900 text-[11px]">
                    <span className="font-semibold">คำขอพิเศษ: </span>
                    {selectedBooking.specialRequest}
                  </div>
                )}
              </div>

              {/* Payment Slip Actions */}
              <div className="flex items-center justify-between pt-1">
                {selectedBooking.paymentSlipUrl ? (
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedSlip({
                        url: selectedBooking.paymentSlipUrl,
                        id: selectedBooking.id,
                        name: selectedBooking.customerName
                      })
                    }
                    className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 font-medium flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-[#D4A373]" />
                    <span>ดูสลิปการโอนเงิน</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedSlip({
                        url: "",
                        id: selectedBooking.id,
                        name: selectedBooking.customerName
                      })
                    }
                    className="text-stone-400 hover:text-stone-600 hover:underline"
                  >
                    + เพิ่มสลิปการโอน
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`คุณต้องการลบรายการจองของ ${selectedBooking.customerName} ใช่หรือไม่?`)) {
                      onDeleteBooking(selectedBooking.id);
                      setSelectedBooking(null);
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 font-medium flex items-center gap-1 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>ลบรายการ</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Quick Add Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl border border-stone-100 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-stone-50">
              <div>
                <h3 className="font-serif text-base font-semibold text-stone-900 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-[#D4A373]" />
                  เพิ่มคิวจองใหม่บนปฏิทิน
                </h3>
                <p className="text-xs text-stone-400">
                  สำหรับลูกค้า Walk-in หรือโทรจองล่วงหน้า
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-500 hover:text-stone-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              {/* Service */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
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
                  className="w-full p-2.5 rounded-lg border border-stone-200 bg-white focus:border-[#D4A373] outline-none"
                >
                  <option value="">-- กรุณาเลือกบริการ --</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.duration} นาที - ฿{Number(s.price).toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              {/* Staff */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  เลือกช่างผู้ให้บริการ <span className="text-rose-500">*</span>
                </label>
                <select
                  value={newBooking.staffId}
                  onChange={(e) => setNewBooking((prev) => ({ ...prev, staffId: e.target.value }))}
                  required
                  className="w-full p-2.5 rounded-lg border border-stone-200 bg-white focus:border-[#D4A373] outline-none"
                >
                  <option value="">-- กรุณาเลือกช่าง --</option>
                  {staffList.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} ({st.nickname || st.role})
                    </option>
                  ))}
                </select>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    วันที่จอง <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={normalizeDate(newBooking.date)}
                    onChange={(e) => setNewBooking((prev) => ({ ...prev, date: e.target.value }))}
                    required
                    className="w-full p-2.5 rounded-lg border border-stone-200 bg-white focus:border-[#D4A373] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    เวลาเริ่มต้น <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={newBooking.time}
                    onChange={(e) => setNewBooking((prev) => ({ ...prev, time: e.target.value }))}
                    required
                    className="w-full p-2.5 rounded-lg border border-stone-200 bg-white focus:border-[#D4A373] outline-none font-mono"
                  >
                    {TIME_SLOTS.map((t) => (
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
                  <label className="block font-semibold text-stone-700 mb-1">
                    ชื่อลูกค้า <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น คุณกมลวรรณ"
                    value={newBooking.customerName}
                    onChange={(e) => setNewBooking((prev) => ({ ...prev, customerName: e.target.value }))}
                    required
                    className="w-full p-2.5 rounded-lg border border-stone-200 bg-white focus:border-[#D4A373] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    เบอร์โทรศัพท์ <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="081-234-5678"
                    value={newBooking.customerPhone}
                    onChange={(e) => setNewBooking((prev) => ({ ...prev, customerPhone: e.target.value }))}
                    required
                    className="w-full p-2.5 rounded-lg border border-stone-200 bg-white focus:border-[#D4A373] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  อีเมล (ถ้ามี)
                </label>
                <input
                  type="email"
                  placeholder="customer@example.com"
                  value={newBooking.customerEmail}
                  onChange={(e) => setNewBooking((prev) => ({ ...prev, customerEmail: e.target.value }))}
                  className="w-full p-2.5 rounded-lg border border-stone-200 bg-white focus:border-[#D4A373] outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  หมายเหตุ / คำขอพิเศษ
                </label>
                <textarea
                  rows={2}
                  placeholder="ระบุความต้องการเพิ่มเติม"
                  value={newBooking.specialRequest}
                  onChange={(e) => setNewBooking((prev) => ({ ...prev, specialRequest: e.target.value }))}
                  className="w-full p-2.5 rounded-lg border border-stone-200 bg-white focus:border-[#D4A373] outline-none resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 font-medium cursor-pointer transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-lg bg-[#D4A373] hover:bg-[#c19262] text-white font-bold cursor-pointer transition flex items-center gap-1.5"
                >
                  {isSubmitting ? "กำลังบันทึก..." : "ยืนยันการจอง"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Zoom Slip Modal */}
      {selectedSlip && (
        <SlipZoomModal
          slipUrl={selectedSlip.url}
          onClose={() => setSelectedSlip(null)}
          bookingId={selectedSlip.id}
          customerName={selectedSlip.name}
          onUpdateSlip={(id, newUrl) => {
            onUpdateSlip(id, newUrl);
            setSelectedSlip((prev) => (prev ? { ...prev, url: newUrl } : null));
          }}
        />
      )}
    </div>
  );
}
