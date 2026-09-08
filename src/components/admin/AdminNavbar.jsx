import React from "react";
import {
  CalendarDays,
  Calendar as CalendarIcon,
  Sparkles,
  Users,
  UserCheck,
  FileSpreadsheet,
  Store,
  LogOut,
  RefreshCw,
  ShieldCheck
} from "lucide-react";

export default function AdminNavbar({
  activeTab,
  onTabChange,
  counts = {},
  onExitAdmin,
  onLogout,
  onRefresh,
  isRefreshing
}) {
  const navItems = [
    {
      id: "bookings",
      label: "รายการจอง",
      shortLabel: "คิวจอง",
      icon: CalendarDays,
      badge: counts.bookings
    },
    {
      id: "calendar",
      label: "ปฏิทินคิวงาน",
      shortLabel: "ปฏิทิน",
      icon: CalendarIcon,
      badge: null
    },
    {
      id: "services",
      label: "บริการ",
      shortLabel: "บริการ",
      icon: Sparkles,
      badge: counts.services
    },
    {
      id: "staff",
      label: "ช่าง",
      shortLabel: "ช่าง",
      icon: Users,
      badge: counts.staff
    },
    {
      id: "customers",
      label: "ลูกค้า CRM",
      shortLabel: "ลูกค้า",
      icon: UserCheck,
      badge: counts.customers
    },
    {
      id: "sheet",
      label: "Google Sheet",
      shortLabel: "ชีต",
      icon: FileSpreadsheet,
      badge: null
    }
  ];

  return (
    <>
      {/* 1. Top Navbar (Desktop & Mobile Header) */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-200/80 shadow-xs transition-all">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
            {/* Brand / Logo */}
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-[#D4A373]/20 to-[#D4A373]/10 border border-[#D4A373]/40 flex items-center justify-center shrink-0 shadow-xs">
                <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-[#b07e4c]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-semibold text-xs sm:text-sm text-stone-900 tracking-tight whitespace-nowrap">
                    The Bloom Studio
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-bold tracking-wider uppercase px-1.5 py-0.2 rounded-md bg-[#D4A373]/15 text-[#a06f3e] border border-[#D4A373]/30">
                    Admin
                  </span>
                </div>
                <p className="text-[10px] text-stone-400 truncate hidden sm:block">
                  Workspace Management & Google Sync
                </p>
              </div>
            </div>

            {/* Center Segmented Tabs (Desktop >= 768px) */}
            <nav className="hidden md:flex items-center gap-1 bg-stone-100/80 p-1 rounded-xl border border-stone-200/70">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      isActive
                        ? "bg-white text-stone-900 shadow-xs font-semibold"
                        : "text-stone-600 hover:text-stone-900 hover:bg-white/60"
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#b07e4c]" : "text-stone-400"}`} />
                    <span>{item.label}</span>
                    {item.badge !== null && item.badge !== undefined && (
                      <span
                        className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                          isActive
                            ? "bg-[#D4A373]/20 text-[#8d5e31]"
                            : "bg-stone-200 text-stone-600"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Refresh / Sync Button */}
              <button
                onClick={onRefresh}
                disabled={isRefreshing}
                title="ดึงข้อมูลล่าสุด (Sync Data)"
                className="p-1.5 sm:p-2 text-stone-500 hover:text-stone-800 bg-stone-100/70 hover:bg-stone-200/80 rounded-xl transition-all border border-stone-200/60 flex items-center justify-center cursor-pointer active:scale-95"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-[#b07e4c]" : ""}`} />
              </button>

              {/* Storefront Button */}
              <button
                onClick={onExitAdmin}
                className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-stone-700 hover:text-stone-900 bg-stone-100/70 hover:bg-stone-200/80 border border-stone-200/60 rounded-xl transition-all cursor-pointer active:scale-95"
              >
                <Store className="w-3.5 h-3.5 text-stone-500" />
                <span className="hidden sm:inline">หน้าร้าน</span>
              </button>

              {/* Logout Button */}
              <button
                onClick={onLogout}
                className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/60 rounded-xl transition-all cursor-pointer active:scale-95"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">ออก</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Floating Mobile Bottom Navigation Bar (Mobile Native App Style < 768px) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-stone-200/90 px-2 py-1.5 shadow-lg safe-area-bottom">
        <div className="grid grid-cols-5 gap-1 max-w-md mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl text-[10px] font-medium transition-all relative ${
                  isActive
                    ? "text-[#a06f3e] font-semibold bg-[#D4A373]/10"
                    : "text-stone-400 hover:text-stone-700"
                }`}
              >
                <div className="relative">
                  <Icon className={`w-4 h-4 mb-0.5 ${isActive ? "text-[#b07e4c]" : "text-stone-400"}`} />
                  {item.badge !== null && item.badge !== undefined && (
                    <span
                      className={`absolute -top-1.5 -right-2.5 min-w-[14px] h-[14px] px-0.5 rounded-full text-[8px] font-bold flex items-center justify-center ${
                        isActive
                          ? "bg-[#b07e4c] text-white"
                          : "bg-stone-300 text-stone-700"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="leading-tight tracking-tight">{item.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
