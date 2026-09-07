import React, { useState } from "react";
import {
  Plus,
  Edit2,
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
  X
} from "lucide-react";

const ICON_OPTIONS = [
  { name: "Sparkles", icon: Sparkles, label: "ประกาย (Nails)" },
  { name: "Footprints", icon: Footprints, label: "เท้า (Spa & Care)" },
  { name: "Smile", icon: Smile, label: "ใบหน้า (Facial)" },
  { name: "HeartHandshake", icon: HeartHandshake, label: "นวดผ่อนคลาย (Massage)" },
  { name: "Flame", icon: Flame, label: "หินร้อน/กัวซา (Hot Stone)" },
  { name: "Eye", icon: Eye, label: "ขนตา (Lashes)" },
  { name: "Scissors", icon: Scissors, label: "ตัดแต่ง (Styling)" },
  { name: "Flower2", icon: Flower2, label: "ความงามธรรมชาติ (Wellness)" },
  { name: "Shield", icon: Shield, label: "ฟื้นฟูบำรุง (Treatment)" }
];

export default function AdminServicesTab({
  services = [],
  onCreateService,
  onUpdateService,
  onDeleteService
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "Nails",
    price: "",
    duration: "60",
    description: "",
    icon: "Sparkles"
  });

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
    if (window.confirm("คุณต้องการลบบริการนี้ใช่หรือไม่?")) {
      onDeleteService(id);
    }
  };

  const renderIcon = (iconName) => {
    const item = ICON_OPTIONS.find((opt) => opt.name === iconName) || ICON_OPTIONS[0];
    const IconComponent = item.icon;
    return <IconComponent className="w-5 h-5 text-[#D4A373]" />;
  };

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-serif text-gray-800">เมนูบริการของร้าน</h3>
          <p className="text-xs text-gray-500">
            จัดการรายการบริการ ทรีตเมนต์ ราคา และระยะเวลา ({services.length} รายการ)
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#D4A373] hover:bg-[#c49262] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มบริการใหม่</span>
        </button>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((srv) => (
          <div
            key={srv.id}
            className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs flex flex-col justify-between hover:border-[#D4A373]/40 transition-colors"
          >
            <div>
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#D4A373]/10 flex items-center justify-center">
                  {renderIcon(srv.icon)}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-gray-100 text-gray-600">
                  {srv.category}
                </span>
              </div>

              <h4 className="font-serif text-base font-semibold text-gray-900 mb-1.5 line-clamp-1">
                {srv.name}
              </h4>
              <p className="text-xs text-gray-500 line-clamp-2 mb-4 leading-relaxed">
                {srv.description || "ไม่มีคำอธิบายเพิ่มเติม"}
              </p>
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-base font-serif font-bold text-gray-900">
                  ฿{(parseFloat(srv.price) || 0).toLocaleString()}
                </span>
                <span className="text-[11px] text-gray-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {srv.duration} นาที
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEdit(srv)}
                  className="p-1.5 text-gray-400 hover:text-[#D4A373] hover:bg-gray-50 rounded-lg transition-colors"
                  title="แก้ไข"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(srv.id)}
                  className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="ลบ"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in duration-200">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/80">
              <h3 className="font-serif text-base font-semibold text-gray-800">
                {editingService ? "แก้ไขข้อมูลบริการ" : "เพิ่มบริการใหม่"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                  ชื่อบริการ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น ทำเล็บเจล พรีเมียม"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:border-[#D4A373] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    หมวดหมู่
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น Nails, Spa & Care, Facial"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:border-[#D4A373] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    ราคา (บาท) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="790"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:border-[#D4A373] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    ระยะเวลา (นาที)
                  </label>
                  <select
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:border-[#D4A373] outline-none bg-white"
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
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    ไอคอนประจำบริการ
                  </label>
                  <select
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:border-[#D4A373] outline-none bg-white"
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
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                  คำอธิบายบริการ
                </label>
                <textarea
                  rows={3}
                  placeholder="รายละเอียดขั้นตอนการดูแล บำรุงผิว หรือสินค้าที่ใช้..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:border-[#D4A373] outline-none"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#D4A373] hover:bg-[#c49262] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
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
