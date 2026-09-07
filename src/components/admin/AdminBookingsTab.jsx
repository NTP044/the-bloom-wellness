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
  X
} from "lucide-react";
import SlipZoomModal from "./SlipZoomModal";

export default function AdminBookingsTab({
  bookings = [],
  services = [],
  staffList = [],
  onUpdateStatus,
  onDeleteBooking,
  onUpdateSlip,
  onCreateBooking
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedSlip, setSelectedSlip] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

      {/* 2. Filter & Search Controls */}
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
                {filteredBookings.map((b, bIdx) => (
                  <tr key={`${b.id || "bk"}-${bIdx}`} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono">
                      <div className="font-semibold text-gray-900">{b.id}</div>
                      <div className="text-[10px] text-gray-400">
                        {new Date(b.createdAt).toLocaleDateString("th-TH", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-gray-900 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#D4A373]" />
                        {b.date}
                      </div>
                      <div className="text-gray-500 flex items-center gap-1.5 mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        {b.time} น. ({b.serviceDuration || 60} นาที)
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
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors border border-gray-200"
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
                          className="text-[11px] text-gray-400 hover:text-gray-600 hover:underline"
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
                      <button
                        onClick={() => handleDeleteConfirm(b.id)}
                        className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="ลบรายการจอง"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
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

                  <div className="flex items-center gap-2">
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
                    เวลา <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={newBooking.time}
                    onChange={(e) => setNewBooking((prev) => ({ ...prev, time: e.target.value }))}
                    required
                    className="w-full text-xs p-2.5 rounded-lg border border-gray-200 bg-white focus:border-[#D4A373] outline-none"
                  >
                    {["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"].map((t) => (
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
