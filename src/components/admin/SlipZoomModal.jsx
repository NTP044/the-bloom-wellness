import React, { useState } from "react";
import { X, ExternalLink, ZoomIn, ZoomOut, Check, Image as ImageIcon } from "lucide-react";

export default function SlipZoomModal({ isOpen, onClose, slipUrl, bookingId, customerName, onUpdateSlip }) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [newUrl, setNewUrl] = useState(slipUrl || "");
  const [isEditing, setIsEditing] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    if (onUpdateSlip) {
      onUpdateSlip(bookingId, newUrl);
    }
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4A373] block">
              Payment Evidence
            </span>
            <h3 className="text-base font-serif text-gray-800">
              หลักฐานการโอนเงิน: {customerName} ({bookingId})
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {slipUrl && (
              <a
                href={slipUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2 text-gray-500 hover:text-[#D4A373] hover:bg-white rounded-lg transition-colors border border-gray-200"
                title="เปิดรูปในแท็บใหม่"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-700 hover:bg-white rounded-lg transition-colors border border-gray-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-auto flex flex-col items-center justify-center bg-stone-900/5 min-h-[300px]">
          {slipUrl ? (
            <div
              className={`relative cursor-pointer transition-all duration-300 ${
                isZoomed ? "scale-125" : "scale-100"
              }`}
              onClick={() => setIsZoomed(!isZoomed)}
            >
              <img
                src={slipUrl}
                alt="Payment Slip"
                referrerPolicy="no-referrer"
                className="max-h-[60vh] max-w-full rounded-lg shadow-md object-contain border border-gray-200"
              />
              <div className="absolute bottom-2 right-2 px-2.5 py-1 bg-black/60 text-white rounded text-[10px] backdrop-blur-sm flex items-center gap-1">
                {isZoomed ? <ZoomOut className="w-3 h-3" /> : <ZoomIn className="w-3 h-3" />}
                <span>{isZoomed ? "คลิกเพื่อย่อ" : "คลิกเพื่อขยาย"}</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-30 text-gray-400" />
              <p className="text-sm font-medium text-gray-600">ยังไม่มีการแนบรูปสลิปสำหรับรายการนี้</p>
              <p className="text-xs text-gray-400 mt-1">สามารถใส่ URL รูปสลิปด้านล่างเพื่อบันทึกหลักฐาน</p>
            </div>
          )}
        </div>

        {/* Footer / Edit slip URL */}
        <div className="p-4 border-t border-gray-100 bg-white">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <input
                type="url"
                placeholder="วาง URL รูปสลิป (https://...)"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-xs outline-none focus:border-[#D4A373]"
              />
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-[#D4A373] text-white rounded-lg text-xs font-medium hover:bg-[#c49262] transition-colors"
              >
                บันทึก
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-2 border border-gray-200 text-gray-600 rounded-lg text-xs hover:bg-gray-50 transition-colors"
              >
                ยกเลิก
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 truncate max-w-sm">
                {slipUrl ? `URL: ${slipUrl}` : "ไม่มีข้อมูลสลิป"}
              </span>
              <button
                onClick={() => {
                  setNewUrl(slipUrl || "");
                  setIsEditing(true);
                }}
                className="text-xs font-semibold text-[#D4A373] hover:underline"
              >
                {slipUrl ? "เปลี่ยนรูปสลิป" : "+ เพิ่มรูปสลิป"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
