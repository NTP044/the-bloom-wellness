import React, { useState, useMemo } from "react";
import {
  Users,
  Search,
  Phone,
  Mail,
  Calendar,
  Sparkles,
  Award,
  Crown,
  TrendingUp,
  CreditCard,
  Copy,
  Check,
  ExternalLink,
  MessageCircle,
  Filter,
  ArrowUpDown
} from "lucide-react";

export default function AdminCustomersTab({
  customers = [],
  bookings = [],
  onRefresh
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all"); // 'all' | 'vip' | 'regular' | 'new'
  const [sortBy, setSortBy] = useState("spent_desc"); // 'spent_desc' | 'bookings_desc' | 'recent' | 'name'
  const [copiedPhone, setCopiedPhone] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Copy phone handler
  const handleCopyPhone = (phone) => {
    if (!phone) return;
    navigator.clipboard.writeText(phone);
    setCopiedPhone(phone);
    setTimeout(() => setCopiedPhone(null), 2000);
  };

  // Safe formatting utilities
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
      maximumFractionDigits: 0
    }).format(Number(amount) || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("th-TH", {
        year: "numeric",
        month: "short",
        day: "numeric"
      });
    } catch {
      return dateStr;
    }
  };

  // Metrics calculation
  const metrics = useMemo(() => {
    const list = Array.isArray(customers) ? customers : [];
    const totalCustomers = list.length;
    let totalRevenue = 0;
    let vipCount = 0;

    list.forEach((c) => {
      const spent = Number(c.totalSpent || c["Total Spent (THB)"]) || 0;
      const totalBks = Number(c.totalBookings || c["Total Bookings"]) || 1;
      totalRevenue += spent;
      if (totalBks >= 2 || spent >= 2000) {
        vipCount++;
      }
    });

    const avgSpend = totalCustomers > 0 ? Math.round(totalRevenue / totalCustomers) : 0;

    return {
      totalCustomers,
      totalRevenue,
      vipCount,
      avgSpend
    };
  }, [customers]);

  // Filtered & Sorted Customer List
  const filteredCustomers = useMemo(() => {
    const list = Array.isArray(customers) ? [...customers] : [];
    const query = searchQuery.trim().toLowerCase();

    return list
      .filter((c) => {
        const phone = String(c.customerPhone || c["Customer Phone"] || "").toLowerCase();
        const name = String(c.customerName || c["Customer Name"] || "").toLowerCase();
        const email = String(c.customerEmail || c["Customer Email"] || "").toLowerCase();
        const lineId = String(c.lineUserId || c["LINE User ID"] || "").toLowerCase();

        const matchesSearch =
          !query ||
          phone.includes(query) ||
          name.includes(query) ||
          email.includes(query) ||
          lineId.includes(query);

        if (!matchesSearch) return false;

        const totalBks = Number(c.totalBookings || c["Total Bookings"]) || 1;
        const spent = Number(c.totalSpent || c["Total Spent (THB)"]) || 0;

        if (filterType === "vip") {
          return totalBks >= 3 || spent >= 3000;
        } else if (filterType === "regular") {
          return totalBks >= 2;
        } else if (filterType === "new") {
          return totalBks <= 1;
        }
        return true;
      })
      .sort((a, b) => {
        const spentA = Number(a.totalSpent || a["Total Spent (THB)"]) || 0;
        const spentB = Number(b.totalSpent || b["Total Spent (THB)"]) || 0;
        const bksA = Number(a.totalBookings || a["Total Bookings"]) || 1;
        const bksB = Number(b.totalBookings || b["Total Bookings"]) || 1;
        const dateA = new Date(a.lastVisitDate || a["Last Visit Date"] || 0).getTime() || 0;
        const dateB = new Date(b.lastVisitDate || b["Last Visit Date"] || 0).getTime() || 0;
        const nameA = String(a.customerName || a["Customer Name"] || "");
        const nameB = String(b.customerName || b["Customer Name"] || "");

        if (sortBy === "spent_desc") return spentB - spentA;
        if (sortBy === "bookings_desc") return bksB - bksA;
        if (sortBy === "recent") return dateB - dateA;
        if (sortBy === "name") return nameA.localeCompare(nameB, "th");
        return 0;
      });
  }, [customers, searchQuery, filterType, sortBy]);

  // Customer's matching bookings
  const selectedCustomerBookings = useMemo(() => {
    if (!selectedCustomer) return [];
    const phone = String(selectedCustomer.customerPhone || selectedCustomer["Customer Phone"] || "").replace(/\D/g, "");
    const lineId = String(selectedCustomer.lineUserId || selectedCustomer["LINE User ID"] || "");

    return (bookings || []).filter((b) => {
      const bPhone = String(b.customerPhone || "").replace(/\D/g, "");
      const bLine = String(b.lineUserId || "");
      return (phone && bPhone === phone) || (lineId && bLine === lineId);
    });
  }, [selectedCustomer, bookings]);

  return (
    <div className="space-y-6">
      {/* 1. Header & Summary Stats */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-gray-100">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#D4A373]/15 border border-[#D4A373]/30 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6 text-[#b07e4c]" />
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-widest text-[#D4A373] uppercase block mb-1">
                Customer Relationship Management (CRM)
              </span>
              <h3 className="text-lg font-serif text-gray-900">
                รายชื่อลูกค้า & ประวัติการรับบริการ
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                ฐานข้อมูลลูกค้าและยอดสะสม ซิงค์ตรงกับแท็บ Customers ใน Google Sheet
              </p>
            </div>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 pt-5">
          <div className="p-4 rounded-xl bg-gradient-to-br from-stone-50 to-stone-100/60 border border-stone-200/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                ลูกค้าทั้งหมด (Total Customers)
              </span>
              <Users className="w-4 h-4 text-[#D4A373]" />
            </div>
            <div className="text-2xl font-serif font-semibold text-gray-900">
              {metrics.totalCustomers} <span className="text-xs font-sans font-normal text-gray-500">คน</span>
            </div>
            <span className="text-[10px] text-gray-400 mt-1 block">บันทึกอัตโนมัติจากทุกการจอง</span>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50/60 to-amber-100/40 border border-amber-200/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                ลูกค้าประจำ & VIP
              </span>
              <Crown className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-serif font-semibold text-amber-900">
              {metrics.vipCount} <span className="text-xs font-sans font-normal text-amber-700">คน</span>
            </div>
            <span className="text-[10px] text-amber-600 mt-1 block">
              {metrics.totalCustomers > 0 ? Math.round((metrics.vipCount / metrics.totalCustomers) * 100) : 0}% ของฐานลูกค้า
            </span>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50/60 to-emerald-100/40 border border-emerald-200/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                ยอดใช้จ่ายสะสมรวม (LTV)
              </span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-serif font-semibold text-emerald-900">
              {formatCurrency(metrics.totalRevenue)}
            </div>
            <span className="text-[10px] text-emerald-600 mt-1 block">รวมรายได้จากลูกค้าทั้งหมด</span>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50/60 to-blue-100/40 border border-blue-200/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800">
                ยอดเฉลี่ย / คน (Avg. Spend)
              </span>
              <CreditCard className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-serif font-semibold text-blue-900">
              {formatCurrency(metrics.avgSpend)}
            </div>
            <span className="text-[10px] text-blue-600 mt-1 block">เฉลี่ยต่อลูกค้า 1 บัญชี</span>
          </div>
        </div>
      </div>

      {/* 2. Controls: Search, Filter, Sort */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาชื่อลูกค้า, เบอร์โทรศัพท์, อีเมล, LINE ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:border-[#D4A373] outline-none transition-all"
          />
        </div>

        {/* Filter & Sort buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl border border-gray-100">
            {[
              { id: "all", label: "ทั้งหมด" },
              { id: "vip", label: "VIP (≥฿3k)" },
              { id: "regular", label: "ประจำ (≥2 ครั้ง)" },
              { id: "new", label: "ลูกค้าใหม่" }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterType(f.id)}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                  filterType === f.id
                    ? "bg-white text-gray-900 shadow-xs font-semibold"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200 text-xs text-gray-600">
            <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent border-none outline-none font-medium text-xs text-gray-700 cursor-pointer"
            >
              <option value="spent_desc">ยอดสะสมสูงสุด (Max Spent)</option>
              <option value="bookings_desc">จำนวนครั้งสูงสุด (Max Bookings)</option>
              <option value="recent">มาล่าสุด (Recent Visit)</option>
              <option value="name">ชื่อลูกค้า (ก-ฮ / A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Customer List Table / Cards */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        {filteredCustomers.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-700">ไม่พบรายชื่อลูกค้าที่ตรงกับเงื่อนไข</p>
            <p className="text-xs text-gray-400 mt-1">ลองเปลี่ยนคำค้นหา หรือรีเซ็ตตัวกรอง</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50/80 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">ลูกค้า</th>
                  <th className="py-3.5 px-4">เบอร์โทรศัพท์ & อีเมล</th>
                  <th className="py-3.5 px-4 text-center">จำนวนการจอง</th>
                  <th className="py-3.5 px-4 text-right">ยอดใช้จ่ายสะสม</th>
                  <th className="py-3.5 px-4">มาใช้บริการล่าสุด</th>
                  <th className="py-3.5 px-4">LINE ID</th>
                  <th className="py-3.5 px-4 text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                {filteredCustomers.map((c, idx) => {
                  const phone = c.customerPhone || c["Customer Phone"] || "-";
                  const name = c.customerName || c["Customer Name"] || "ไม่ระบุชื่อ";
                  const email = c.customerEmail || c["Customer Email"] || "";
                  const totalBks = Number(c.totalBookings || c["Total Bookings"]) || 1;
                  const totalSpent = Number(c.totalSpent || c["Total Spent (THB)"]) || 0;
                  const lastVisit = c.lastVisitDate || c["Last Visit Date"] || "-";
                  const lineId = c.lineUserId || c["LINE User ID"] || "";

                  const isVip = totalBks >= 3 || totalSpent >= 3000;
                  const isRegular = totalBks >= 2 && !isVip;

                  return (
                    <tr
                      key={phone + idx}
                      className="hover:bg-stone-50/60 transition-colors"
                    >
                      {/* Customer Name & VIP Badge */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#D4A373]/10 border border-[#D4A373]/30 flex items-center justify-center text-sm font-semibold text-[#b07e4c] shrink-0">
                            {name.charAt(0) || "C"}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-semibold text-gray-900">{name}</span>
                              {isVip && (
                                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-0.5">
                                  <Crown className="w-2.5 h-2.5 text-amber-600" />
                                  VIP
                                </span>
                              )}
                              {isRegular && (
                                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                  Regular
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-gray-400">
                              สมาชิก #{idx + 1}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Phone & Email */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-gray-400" />
                            <a
                              href={`tel:${phone.replace(/\D/g, "")}`}
                              className="font-mono text-gray-900 hover:text-[#b07e4c] font-medium transition-colors"
                            >
                              {phone}
                            </a>
                            <button
                              type="button"
                              onClick={() => handleCopyPhone(phone)}
                              title="คัดลอกเบอร์โทร"
                              className="text-gray-400 hover:text-gray-700 p-0.5"
                            >
                              {copiedPhone === phone ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                          {email && (
                            <div className="flex items-center gap-1.5 text-gray-400 text-[11px]">
                              <Mail className="w-3 h-3" />
                              <span className="truncate max-w-[160px]">{email}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Total Bookings */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-800">
                          {totalBks} ครั้ง
                        </span>
                      </td>

                      {/* Total Spent */}
                      <td className="py-3.5 px-4 text-right">
                        <span className="font-semibold text-gray-900 font-mono">
                          {formatCurrency(totalSpent)}
                        </span>
                      </td>

                      {/* Last Visit */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-gray-600 text-xs">
                          <Calendar className="w-3 h-3 text-gray-400 shrink-0" />
                          <span>{formatDate(lastVisit)}</span>
                        </div>
                      </td>

                      {/* LINE User ID */}
                      <td className="py-3.5 px-4">
                        {lineId ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <MessageCircle className="w-2.5 h-2.5 text-emerald-600" />
                            LINE Connected
                          </span>
                        ) : (
                          <span className="text-[11px] text-gray-400">-</span>
                        )}
                      </td>

                      {/* Action Button: View Bookings Drawer */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedCustomer(c)}
                          className="px-3 py-1 bg-stone-100 hover:bg-[#D4A373]/20 hover:text-[#b07e4c] text-gray-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                        >
                          ดูประวัติ
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. Customer Detail Modal / Drawer */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#D4A373]/15 border border-[#D4A373]/40 flex items-center justify-center text-base font-bold text-[#b07e4c]">
                  {(selectedCustomer.customerName || selectedCustomer["Customer Name"] || "C").charAt(0)}
                </div>
                <div>
                  <h4 className="font-serif text-base font-semibold text-gray-900">
                    {selectedCustomer.customerName || selectedCustomer["Customer Name"] || "ลูกค้า"}
                  </h4>
                  <p className="text-xs text-gray-400">
                    เบอร์โทร: {selectedCustomer.customerPhone || selectedCustomer["Customer Phone"]}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Customer Stats Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase block">ยอดใช้จ่ายสะสม</span>
                <span className="text-base font-bold text-[#b07e4c]">
                  {formatCurrency(selectedCustomer.totalSpent || selectedCustomer["Total Spent (THB)"])}
                </span>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase block">จำนวนครั้งที่จอง</span>
                <span className="text-base font-bold text-gray-800">
                  {selectedCustomer.totalBookings || selectedCustomer["Total Bookings"] || 1} ครั้ง
                </span>
              </div>
            </div>

            {/* Booking History for this customer */}
            <div>
              <h5 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                ประวัติการจองคิว ({selectedCustomerBookings.length} รายการ)
              </h5>
              {selectedCustomerBookings.length === 0 ? (
                <div className="p-4 bg-gray-50 rounded-xl text-center text-xs text-gray-500">
                  ยังไม่พบรายการจองล่าสุดในระบบ หรือการจองนี้ถูกลบแล้ว
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {selectedCustomerBookings.map((b) => (
                    <div
                      key={b.id}
                      className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-semibold text-gray-900">{b.serviceName}</div>
                        <div className="text-[11px] text-gray-500 flex items-center gap-2 mt-0.5">
                          <span>📅 {b.date} {b.time} น.</span>
                          <span>•</span>
                          <span>ช่าง: {b.staffName || "-"}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">{formatCurrency(b.servicePrice)}</div>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                            b.status === "confirmed"
                              ? "bg-emerald-100 text-emerald-800"
                              : b.status === "cancelled"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {b.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
