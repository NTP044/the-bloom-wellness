import React, { useState } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Star,
  Award,
  Sparkles,
  X,
  UserCheck
} from "lucide-react";

export default function AdminStaffTab({
  staff = [],
  services = [],
  onCreateStaff,
  onUpdateStaff,
  onDeleteStaff
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    nickname: "",
    role: "Senior Beauty Therapist",
    experience: "ประสบการณ์ 5 ปี",
    rating: "4.95",
    avatar: "",
    skills: [],
    bio: ""
  });

  const handleOpenCreate = () => {
    setEditingStaff(null);
    setFormData({
      name: "",
      nickname: "",
      role: "Senior Beauty Therapist",
      experience: "ประสบการณ์ 5 ปี",
      rating: "4.95",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80",
      skills: services.map((s) => s.id),
      bio: ""
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (st) => {
    setEditingStaff(st);
    setFormData({
      name: st.name || "",
      nickname: st.nickname || "",
      role: st.role || "Therapist",
      experience: st.experience || "",
      rating: String(st.rating || 5.0),
      avatar: st.avatar || "",
      skills: Array.isArray(st.skills) ? st.skills : [],
      bio: st.bio || ""
    });
    setModalOpen(true);
  };

  const toggleSkill = (srvId) => {
    setFormData((prev) => {
      const skills = prev.skills.includes(srvId)
        ? prev.skills.filter((id) => id !== srvId)
        : [...prev.skills, srvId];
      return { ...prev, skills };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) return;

    if (editingStaff) {
      onUpdateStaff(editingStaff.id, formData);
    } else {
      onCreateStaff(formData);
    }
    setModalOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm("คุณต้องการลบรายชื่อช่างท่านนี้ใช่หรือไม่?")) {
      onDeleteStaff(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-serif text-gray-800">ทีมช่างผู้เชี่ยวชาญ</h3>
          <p className="text-xs text-gray-500">
            จัดการรายชื่อช่าง ประสบการณ์ ทักษะบริการ และคะแนนรีวิว ({staff.length} ท่าน)
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#D4A373] hover:bg-[#c49262] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มช่างใหม่</span>
        </button>
      </div>

      {/* Staff Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {staff.map((st) => (
          <div
            key={st.id}
            className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs flex flex-col justify-between hover:border-[#D4A373]/40 transition-colors"
          >
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <img
                  src={
                    st.avatar ||
                    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80"
                  }
                  alt={st.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-xs shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif text-base font-semibold text-gray-900 truncate">
                      {st.name}
                    </h4>
                    <div className="flex items-center gap-1 text-amber-500 text-xs font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{st.rating || "5.0"}</span>
                    </div>
                  </div>

                  <p className="text-xs font-medium text-[#b07e4c] mt-0.5">{st.role}</p>

                  <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mt-1">
                    <Award className="w-3.5 h-3.5 text-gray-400" />
                    <span>{st.experience || "ผู้เชี่ยวชาญด้านสปา"}</span>
                    {st.nickname && (
                      <span className="text-gray-400">• ชื่อเล่น: {st.nickname}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bio */}
              {st.bio && (
                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed bg-gray-50/70 p-2.5 rounded-xl">
                  {st.bio}
                </p>
              )}

              {/* Skills Tags */}
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                  บริการที่รองรับ:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {Array.isArray(st.skills) && st.skills.length > 0 ? (
                    st.skills.map((skillId) => {
                      const srv = services.find((s) => s.id === skillId);
                      return (
                        <span
                          key={skillId}
                          className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-[#D4A373]/10 text-[#a06f3e] border border-[#D4A373]/20"
                        >
                          {srv ? srv.name.split(" ")[0] : skillId}
                        </span>
                      );
                    })
                  ) : (
                    <span className="text-[10px] text-gray-400">ยังไม่ได้ระบุทักษะบริการ</span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 mt-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-[10px] text-gray-400 font-mono">ID: {st.id}</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEdit(st)}
                  className="p-1.5 text-gray-400 hover:text-[#D4A373] hover:bg-gray-50 rounded-lg transition-colors"
                  title="แก้ไข"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(st.id)}
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
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in duration-200 max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/80">
              <h3 className="font-serif text-base font-semibold text-gray-800">
                {editingStaff ? "แก้ไขข้อมูลช่าง" : "เพิ่มช่างผู้เชี่ยวชาญใหม่"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    ชื่อ-นามสกุล <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น คุณมีนา สุขเกษม"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:border-[#D4A373] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    ชื่อเล่น (Nickname)
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น มีนา (Mina)"
                    value={formData.nickname}
                    onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:border-[#D4A373] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    ตำแหน่ง / บทบาท
                  </label>
                  <input
                    type="text"
                    placeholder="Senior Nail & Spa Artist"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:border-[#D4A373] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    ประสบการณ์
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น ประสบการณ์ 6 ปี"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:border-[#D4A373] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    คะแนน Rating (1.0 - 5.0)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    max="5"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:border-[#D4A373] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    ลิงก์รูปโปรไฟล์ (Avatar URL)
                  </label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={formData.avatar}
                    onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:border-[#D4A373] outline-none"
                  />
                </div>
              </div>

              {/* Skills Selector */}
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  บริการที่สามารถทำได้ (เลือกได้หลายข้อ)
                </label>
                <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded-xl max-h-40 overflow-y-auto border border-gray-100">
                  {services.map((srv) => {
                    const isChecked = formData.skills.includes(srv.id);
                    return (
                      <label
                        key={srv.id}
                        className={`flex items-center gap-2 p-2 rounded-lg text-xs cursor-pointer border transition-colors ${
                          isChecked
                            ? "bg-white border-[#D4A373] text-gray-900 font-medium"
                            : "bg-transparent border-gray-200 text-gray-600 hover:bg-white"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSkill(srv.id)}
                          className="accent-[#D4A373] rounded"
                        />
                        <span className="truncate">{srv.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                  ประวัติและทักษะพิเศษ (Bio)
                </label>
                <textarea
                  rows={2}
                  placeholder="ความเชี่ยวชาญ สไตล์การทำงาน หรือจุดเด่นของช่าง..."
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
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
                  {editingStaff ? "บันทึกการแก้ไข" : "เพิ่มช่าง"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
