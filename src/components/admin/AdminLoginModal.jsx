import React, { useState, useEffect, useCallback } from "react";
import { Lock, Delete, X, AlertCircle, Sparkles, KeyRound } from "lucide-react";
import { adminService } from "../../api/adminService";

export default function AdminLoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const handleVerify = useCallback(async (pinToTest) => {
    if (pinToTest.length !== 4) return;
    setLoading(true);
    setError("");

    try {
      await adminService.login(pinToTest);
      setLoading(false);
      setPin("");
      onLoginSuccess();
    } catch (err) {
      setLoading(false);
      setError(err.message || "รหัส PIN ไม่ถูกต้อง");
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setPin("");
    }
  }, [onLoginSuccess]);

  const handleDigit = useCallback((digit) => {
    if (loading) return;
    setError("");
    setPin((prev) => {
      if (prev.length >= 4) return prev;
      const next = prev + digit;
      if (next.length === 4) {
        setTimeout(() => handleVerify(next), 50);
      }
      return next;
    });
  }, [loading, handleVerify]);

  const handleBackspace = useCallback(() => {
    if (loading) return;
    setError("");
    setPin((prev) => prev.slice(0, -1));
  }, [loading]);

  const handleClear = useCallback(() => {
    if (loading) return;
    setError("");
    setPin("");
  }, [loading]);

  // Handle Physical Computer Keyboard
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key >= "0" && e.key <= "9") {
        e.preventDefault();
        handleDigit(e.key);
      } else if (e.key === "Backspace") {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "Enter" && pin.length === 4) {
        e.preventDefault();
        handleVerify(pin);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, pin, handleDigit, handleBackspace, handleVerify, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 md:p-8 text-center transform transition-transform ${
          shake ? "animate-shake" : ""
        }`}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Icon & Title */}
        <div className="mx-auto w-12 h-12 rounded-full bg-[#D4A373]/10 border border-[#D4A373]/30 flex items-center justify-center mb-3">
          <KeyRound className="w-6 h-6 text-[#D4A373]" />
        </div>

        <span className="text-[10px] font-bold tracking-widest text-[#D4A373] uppercase block mb-1">
          Security Verification
        </span>
        <h3 className="text-xl font-serif text-gray-800 mb-1">Admin Portal</h3>
        <p className="text-xs text-gray-500 mb-6">
          ป้อนรหัส PIN 4 หลักเพื่อเข้าสู่ระบบศูนย์ควบคุมหลังบ้าน
        </p>

        {/* PIN Indicator Dots */}
        <div className="flex justify-center items-center gap-4 mb-4">
          {[0, 1, 2, 3].map((idx) => {
            const isFilled = pin.length > idx;
            return (
              <div
                key={idx}
                className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-200 ${
                  isFilled
                    ? "bg-[#D4A373] border-[#D4A373] scale-110 shadow-sm"
                    : "border-gray-300 bg-gray-50"
                }`}
              />
            );
          })}
        </div>

        {/* Error message */}
        {error ? (
          <div className="flex items-center justify-center gap-1 text-xs text-rose-500 font-medium mb-4 animate-in fade-in">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        ) : (
          <div className="h-5 mb-3 text-[11px] text-gray-400">
            {loading ? "กำลังตรวจสอบรหัส..." : "รองรับทั้งปุ่มบนจอและแป้นพิมพ์คอมพิวเตอร์"}
          </div>
        )}

        {/* Touch / Click Keypad */}
        <div className="grid grid-cols-3 gap-2.5 max-w-[240px] mx-auto mb-5">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleDigit(String(num))}
              disabled={loading}
              className="h-12 rounded-xl bg-gray-50 hover:bg-[#D4A373]/10 active:bg-[#D4A373]/20 border border-gray-100 text-lg font-medium text-gray-700 hover:text-[#D4A373] transition-colors flex items-center justify-center"
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            onClick={handleClear}
            disabled={loading || pin.length === 0}
            className="h-12 rounded-xl bg-gray-50 hover:bg-gray-100 active:bg-gray-200 border border-gray-100 text-xs font-semibold text-gray-500 transition-colors flex items-center justify-center"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => handleDigit("0")}
            disabled={loading}
            className="h-12 rounded-xl bg-gray-50 hover:bg-[#D4A373]/10 active:bg-[#D4A373]/20 border border-gray-100 text-lg font-medium text-gray-700 hover:text-[#D4A373] transition-colors flex items-center justify-center"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            disabled={loading || pin.length === 0}
            className="h-12 rounded-xl bg-gray-50 hover:bg-gray-100 active:bg-gray-200 border border-gray-100 text-gray-600 transition-colors flex items-center justify-center"
            aria-label="Backspace"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Hint footer */}
        <div className="pt-3 border-t border-gray-100 text-[11px] text-gray-400">
          💡 รหัสเริ่มต้นจากระบบ: <span className="font-mono font-bold text-gray-600">1234</span>
        </div>
      </div>
    </div>
  );
}
