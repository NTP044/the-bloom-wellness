import React from "react";
import {
  CalendarDays,
  Sparkles,
  Users,
  FileSpreadsheet,
  Store,
  LogOut,
  RefreshCw,
  ShieldCheck
} from "lucide-react";

export default function AdminNavbar({
  activeTab,
  onTabChange,
  counts,
  onExitAdmin,
  onLogout,
  onRefresh,
  isRefreshing
}) {
  const navItems = [
    {
      id: "bookings",
      label: "รายการจอง",
      icon: CalendarDays,
      badge: counts.bookings
    },
    {
      id: "services",
      label: "บริการ",
      icon: Sparkles,
      badge: counts.services
    },
    {
      id: "staff",
      label: "ช่าง",
      icon: Users,
      badge: counts.staff
    },
    {
      id: "sheet",
      label: "Google Sheet",
      icon: FileSpreadsheet,
      badge: null
    }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#D4A373]/10 border border-[#D4A373]/40 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-[#D4A373]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-base tracking-wider font-semibold text-gray-900">
                  The Bloom Studio
                </span>
                <span className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full bg-[#D4A373]/15 text-[#b07e4c]">
                  Admin
                </span>
              </div>
              <p className="text-[10px] text-gray-400">Workspace Management & Database</p>
            </div>
          </div>

          {/* Center Navigation Tabs (Desktop) */}
          <nav className="hidden md:flex items-center gap-1 bg-gray-50/80 p-1 rounded-xl border border-gray-100">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? "bg-white text-gray-900 shadow-xs font-semibold"
                      : "text-gray-500 hover:text-gray-900 hover:bg-white/50"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#D4A373]" : "text-gray-400"}`} />
                  <span>{item.label}</span>
                  {item.badge !== null && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                        isActive
                          ? "bg-[#D4A373]/15 text-[#b07e4c] font-bold"
                          : "bg-gray-200 text-gray-600"
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
          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              title="ดึงข้อมูลล่าสุด (Sync Data)"
              className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors border border-gray-100 flex items-center justify-center"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-[#D4A373]" : ""}`} />
            </button>

            <button
              onClick={onExitAdmin}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors"
            >
              <Store className="w-3.5 h-3.5 text-gray-500" />
              <span className="hidden sm:inline">หน้าร้าน</span>
            </button>

            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/70 border border-rose-100 rounded-lg transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ออกจากระบบ</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="flex md:hidden items-center justify-between overflow-x-auto py-2 border-t border-gray-100 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-medium rounded-lg whitespace-nowrap ${
                  isActive
                    ? "bg-[#D4A373]/10 text-[#b07e4c] font-semibold border border-[#D4A373]/20"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                {item.badge !== null && (
                  <span className="text-[10px] bg-gray-200 px-1 rounded-full text-gray-700">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
