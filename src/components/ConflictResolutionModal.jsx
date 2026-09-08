import React from "react";
import {
  AlertCircle,
  Clock,
  User,
  Sparkles,
  Calendar,
  CheckCircle2,
  ChevronRight,
  X,
  PhoneCall,
  HeartHandshake
} from "lucide-react";

export default function ConflictResolutionModal({
  isOpen,
  conflictData,
  onSelectSlot,
  onSelectStaff,
  onClose
}) {
  if (!isOpen || !conflictData) return null;

  const {
    message = "ขออภัย ช่วงเวลานี้เพิ่งถูกจองเต็มไปเมื่อสักครู่",
    conflictDetails = {},
    alternateSlots = [],
    alternateStaff = [],
    requestedTime = "",
    requestedStaffName = "ช่างประจำร้าน",
    date = "",
    serviceName = "บริการ"
  } = conflictData;

  const occupiedTime = conflictDetails.occupiedTime || requestedTime;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/65 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-stone-200/80 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-amber-600 via-[#C68A4C] to-[#D4A373] p-4 sm:p-5 text-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0">
              <AlertCircle className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-amber-100">
              Double Booking Protected
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-serif font-bold text-white leading-tight">
            ช่วงเวลานี้มีผู้จองเข้ามาพร้อมกัน
          </h3>
          <p className="text-xs text-amber-100/90 mt-1 leading-relaxed">
            ระบบได้บันทึกข้อมูลของคุณไว้ให้ผู้จัดการร้านเรียบร้อยแล้วค่ะ และคุณสามารถเลือกช่วงเวลาใหม่ได้ทันทีโดยไม่ต้องกรอกข้อมูลใหม่
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Summary Box */}
          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/60 text-xs space-y-1.5">
            <div className="flex items-center justify-between text-stone-600">
              <span>บริการ: <strong>{serviceName}</strong></span>
              <span className="text-stone-500">{date}</span>
            </div>
            <div className="flex items-center justify-between text-stone-700">
              <span>ช่างที่เลือก: <strong>{requestedStaffName}</strong></span>
              <span className="text-rose-600 font-semibold flex items-center gap-1">
                <span className="line-through">{requestedTime} น.</span>
                <span className="text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.2 rounded font-bold">เต็ม</span>
              </span>
            </div>
          </div>

          {/* Section 1: Alternate Slots for Same Specialist */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#C68A4C]" />
                <span>เวลาว่างอื่นของ {requestedStaffName} (วันเดียวกัน)</span>
              </h4>
              <span className="text-[11px] text-stone-500 font-medium">
                {alternateSlots.length > 0 ? `${alternateSlots.length} ช่วงเวลาว่าง` : "เต็มทุกรอบ"}
              </span>
            </div>

            {alternateSlots.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {alternateSlots.map((slot) => (
                  <button
                    key={`alt-slot-${slot}`}
                    type="button"
                    onClick={() => onSelectSlot(slot)}
                    className="py-2 px-2.5 rounded-lg border border-stone-200 bg-white hover:border-[#C68A4C] hover:bg-[#FAF6F0] text-stone-800 text-xs font-semibold flex items-center justify-center gap-1 transition-all active:scale-97 cursor-pointer group shadow-2xs"
                  >
                    <Clock className="w-3 h-3 text-stone-400 group-hover:text-[#C68A4C]" />
                    <span>{slot} น.</span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-stone-500 italic p-3 bg-stone-50 rounded-lg text-center">
                ช่าง {requestedStaffName} ไม่มีรอบว่างอื่นในวันนี้แล้วค่ะ แนะนำเลือกช่างท่านอื่นด้านล่าง
              </p>
            )}
          </div>

          {/* Section 2: Alternate Specialists */}
          {alternateStaff.length > 0 && (
            <div className="space-y-2.5 pt-2 border-t border-stone-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>หรือเลือกช่างผู้เชี่ยวชาญท่านอื่นที่ว่าง</span>
              </h4>

              <div className="space-y-2">
                {alternateStaff.map((st) => (
                  <div
                    key={`alt-st-${st.staffId}`}
                    className="p-3 rounded-xl border border-stone-200 bg-stone-50/50 hover:bg-stone-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition"
                  >
                    <div className="flex items-center gap-2.5">
                      {st.staffAvatar ? (
                        <img
                          src={st.staffAvatar}
                          alt={st.staffName}
                          className="w-10 h-10 rounded-full object-cover border border-stone-200 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#FAF6F0] text-[#C68A4C] border border-stone-200 flex items-center justify-center font-bold text-sm shrink-0">
                          {st.staffName.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-xs text-stone-900 flex items-center gap-1.5">
                          <span>{st.staffName}</span>
                          {st.hasRequestedSlot && (
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-full">
                              ว่างเวลาเดิม ({requestedTime} น.)
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-stone-500">{st.role || "ผู้เชี่ยวชาญ"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap sm:justify-end">
                      {st.hasRequestedSlot ? (
                        <button
                          type="button"
                          onClick={() => onSelectStaff(st.staffId, requestedTime)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition cursor-pointer flex items-center gap-1 shadow-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>เลือกเวลา {requestedTime} น.</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onSelectStaff(st.staffId, st.availableSlots[0] || "")}
                          className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-900 text-white font-semibold text-xs transition cursor-pointer flex items-center gap-1 shadow-xs"
                        >
                          <span>เลือก {st.nickname} ({st.availableSlots[0]} น.)</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between gap-3">
          <span className="text-[11px] text-stone-500 flex items-center gap-1">
            <HeartHandshake className="w-3.5 h-3.5 text-[#C68A4C]" />
            <span>ข้อมูลการจองของคุณยังอยู่ครบ</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white border border-stone-200 text-stone-700 hover:bg-stone-100 text-xs font-semibold transition cursor-pointer"
          >
            เลือกเวลาด้วยตนเองในหน้าหลัก
          </button>
        </div>
      </div>
    </div>
  );
}
