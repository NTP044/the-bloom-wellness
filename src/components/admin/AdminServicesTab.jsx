import React, { useState, useMemo } from "react";
import {
  Plus,
  Edit3,
  Trash2,
  Clock,
  Sparkles,
  Footprints,
  Smile,
  HeartHandshake,
  Flame,
  Eye,
  Scissors,
  Flower2,
  Shield,
  Search,
  Check,
  X,
  Tag
} from "lucide-react";

const ICON_OPTIONS = [
  { name: "Sparkles", icon: Sparkles, label: "เล็บเจล & ตกแต่ง (Nails)" },
  { name: "Footprints", icon: Footprints, label: "สปาเท้า & ผิว (Spa & Care)" },
  { name: "Smile", icon: Smile, label: "ทรีตเมนต์ผิวหน้า (Facial)" },
  { name: "HeartHandshake", icon: HeartHandshake, label: "นวดอโรมา & ผ่อนคลาย (Massage)" },
  { name: "Flame", icon: Flame, label: "กัวซา & หินร้อน (Gua Sha / Hot Stone)" },
  { name: "Eye", icon: Eye, label: "ต่อขนตา & ลิฟติ้ง (Lashes)" },
  { name: "Scissors", icon: Scissors, label: "ตัดแต่ง & สไตล์ลิ่ง (Styling)" },
  { name: "Flower2", icon: Flower2, label: "ออร์แกนิก & สปา (Wellness)" },
  { name: "Shield", icon: Shield, label: "ทรีตเมนต์ฟื้นฟู (Treatment)" }
];

const CATEGORY_COLORS = {
  Nails: "bg-rose-50 text-rose-700 border-rose-200/80",
  "Spa & Care": "bg-emerald-50 text-emerald-700 border-emerald-200/80",
  Facial: "bg-amber-50 text-amber-700 border-amber-200/80",
  Massage: "bg-orange-50 text-orange-700 border-orange-200/80",
  "Facial & Spa": "bg-yellow-50 text-yellow-800 border-yellow-200/80",
  Lashes: "bg-purple-50 text-purple-700 border-purple-200/80",
  General: "bg-stone-100 text-stone-700 border-stone-200/80"
};

export default function AdminServicesTab({
  services = [],
  onCreateService,
  onUpdateService,
  onDeleteService
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const [formData, setFormData] = useState({
    name: "",
    category: "Nails",
    price: "",
    duration: "60",
    description: "",
    icon: "Sparkles"
  });

  // Extract unique categories for filter tabs
  const categories = useMemo(() => {
    const list = Array.isArray(services) ? services : [];
    const set = new Set();
    list.forEach((s) => {
      if (s.category) set.add(s.category);
    });
    return ["all", ...Array.from(set)];
  }, [services]);

  // Filtered services
  const filteredServices = useMemo(() => {
    const list = Array.isArray(services) ? services : [];
    const query = searchQuery.trim().toLowerCase();

    return list.filter((s) => {
      const matchCat = selectedCategory === "all" || s.category === selectedCategory;
      const matchQuery =
        !query ||
        (s.name && s.name.toLowerCase().includes(query)) ||
        (s.description && s.description.toLowerCase().includes(query)) ||
        (s.category && s.category.toLowerCase().includes(query));
      return matchCat && matchQuery;
    });
  }, [services, searchQuery, selectedCategory]);

  const handleOpenCreate = () => {
    setEditingService(null);
    setFormData({
      name: "",
      category: "Nails",
      price: "",
      duration: "60",
      description: "",
      icon: "Sparkles"
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (srv) => {
    setEditingService(srv);
    setFormData({
      name: srv.name || "",
      category: srv.category || "General",
      price: String(srv.price || ""),
      duration: String(srv.duration || 60),
      description: srv.description || "",
      icon: srv.icon || "Sparkles"
    });
    setModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price) return;

    if (editingService) {
      onUpdateService(editingService.id, formData);
    } else {
      onCreateService(formData);
    }
    setModalOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm("คุณต้องการลบบริการนี้ใช่หรือไม่? ข้อมูลจะถูกลบออกจากระบบและ Google Sheet")) {
      onDeleteService(id);
    }
  };

  const renderIcon = (iconName) => {
    const item = ICON_OPTIONS.find((opt) => opt.name === iconName) || ICON_OPTIONS[0];
    const IconComponent = item.icon;
    return <IconComponent className="w-5 h-5 text-[#b07e4c]" />;
  };

  return (
    <div className="space-y-5 sm:space-y-6 pb-20 md:pb-6">
      {/* 1. Header Section */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#D4A373]/15 border border-[#D4A373]/30 flex items-center justify-center shrink-0 shadow-xs">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-[#b07e4c]" />
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-wider text-[#b07e4c] uppercase block mb-0.5">
              Service Management
            </span>
            <h3 className="text-base sm:text-lg font-semibold text-stone-900 tracking-tight">
              เมนูบริการ & ทรีตเมนต์
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              จัดการรายการบริการ ราคา และระยะเวลา ({services.length} รายการ)
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-[#b07e4c] to-[#c49262] hover:from-[#9d6c3b] hover:to-[#b07e4c] text-white rounded-xl text-xs font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>+ เพิ่มบริการใหม่</span>
        </button>
      </div>

      {/* 2. Controls: Search & Category Filter */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-3 sm:p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาชื่อบริการ, หมวดหมู่, หรือคำอธิบาย..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:border-[#b07e4c] outline-none transition-all"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            const count = cat === "all" ? services.length : services.filter((s) => s.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs rounded-xl font-medium whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-stone-900 text-white font-semibold shadow-xs"
                    : "bg-stone-100/80 hover:bg-stone-200/80 text-stone-600"
                }`}
              >
                <span>{cat === "all" ? "ทั้งหมด" : cat}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${isSelected ? "bg-white/20 text-white" : "bg-stone-200 text-stone-600"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Services Grid */}
      {filteredServices.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200/80 p-12 text-center shadow-xs">
          <Sparkles className="w-10 h-10 text-stone-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-stone-700">ไม่พบบริการที่ตรงกับการค้นหา</p>
          <p className="text-xs text-stone-400 mt-1">ลองเปลี่ยนคำค้นหา หรือเลือกหมวดหมู่อื่น</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServices.map((srv, sIdx) => {
            const priceNum = parseFloat(srv.price) || 0;
            const catBadgeClass = CATEGORY_COLORS[srv.category] || CATEGORY_COLORS.General;

            return (
              <div
                key={`${srv.id || "srv"}-${sIdx}`}
                className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs hover:shadow-md hover:border-[#D4A373]/60 transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  {/* Top Row: Icon + Category Badge */}
                  <div className="flex items-start justify-between gap-2 mb-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#D4A373]/15 to-[#D4A373]/5 border border-[#D4A373]/30 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                      {renderIcon(srv.icon)}
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border ${catBadgeClass}`}>
                      {srv.category || "General"}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h4 className="text-sm sm:text-base font-semibold text-stone-900 mb-1.5 leading-snug line-clamp-2">
                    {srv.name}
                  </h4>
                  <p className="text-xs text-stone-500 line-clamp-2 mb-4 leading-relaxed font-normal">
                    {srv.description || "ไม่มีคำอธิบายเพิ่มเติม"}
                  </p>
                </div>

                {/* Bottom Row: Price + Duration + Action Buttons */}
                <div className="pt-3.5 border-t border-stone-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    {/* Clean Currency Display (Zero font collision) */}
                    <div className="flex items-baseline">
                      <span className="text-xs font-semibold text-stone-500 mr-0.5">฿</span>
                      <span className="text-lg font-bold text-stone-900 font-sans tracking-tight">
                        {priceNum.toLocaleString("th-TH")}
                      </span>
                    </div>

                    {/* Duration Capsule */}
                    <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 font-medium">
                      <Clock className="w-3 h-3 text-stone-400" />
                      <span>{srv.duration} น.</span>
                    </span>
                  </div>

                  {/* Action Icons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(srv)}
                      className="p-1.5 text-stone-400 hover:text-[#b07e4c] hover:bg-[#D4A373]/10 rounded-lg transition-colors cursor-pointer"
                      title="แก้ไขข้อมูล"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(srv.id)}
                      className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="ลบบริการ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Add / Edit Service Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-stone-200/80 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-stone-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#D4A373]/15 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-[#b07e4c]" />
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-stone-900">
                  {editingService ? "แก้ไขข้อมูลบริการ" : "เพิ่มบริการใหม่"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-500 hover:text-stone-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                  ชื่อบริการ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น ทำเล็บเจล พรีเมียม (Gel Manicure & Art)"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:border-[#b07e4c] outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                    หมวดหมู่
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น Nails, Spa & Care, Facial"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:border-[#b07e4c] outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                    ราคา (บาท) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="790"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:border-[#b07e4c] outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                    ระยะเวลา (นาที)
                  </label>
                  <select
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:border-[#b07e4c] outline-none bg-white cursor-pointer"
                  >
                    <option value="30">30 นาที</option>
                    <option value="45">45 นาที</option>
                    <option value="60">60 นาที (1 ชม.)</option>
                    <option value="75">75 นาที (1 ชม. 15 น.)</option>
                    <option value="90">90 นาที (1.5 ชม.)</option>
                    <option value="120">120 นาที (2 ชม.)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                    ไอคอนประจำบริการ
                  </label>
                  <select
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:border-[#b07e4c] outline-none bg-white cursor-pointer"
                  >
                    {ICON_OPTIONS.map((opt) => (
                      <option key={opt.name} value={opt.name}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                  คำอธิบายบริการ
                </label>
                <textarea
                  rows={3}
                  placeholder="รายละเอียดขั้นตอนการดูแล บำรุงผิว หรือผลิตภัณฑ์ที่ใช้..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:border-[#b07e4c] outline-none transition-all"
                />
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs text-stone-600 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-[#b07e4c] to-[#c49262] hover:from-[#9d6c3b] hover:to-[#b07e4c] text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
                >
                  {editingService ? "บันทึกการแก้ไข" : "สร้างบริการ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
