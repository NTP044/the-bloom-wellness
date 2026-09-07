import React, { useState, useEffect, useCallback } from "react";
import AdminNavbar from "./AdminNavbar";
import AdminBookingsTab from "./AdminBookingsTab";
import AdminServicesTab from "./AdminServicesTab";
import AdminStaffTab from "./AdminStaffTab";
import AdminGoogleSheetTab from "./AdminGoogleSheetTab";
import { adminService } from "../../api/adminService";

export default function AdminPanel({ onExitAdmin, onLogout }) {
  const [activeTab, setActiveTab] = useState("bookings");
  const [dbData, setDbData] = useState({
    services: [],
    staff: [],
    bookings: [],
    customers: [],
    settings: {}
  });
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message, type = "success") => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchDatabase = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsRefreshing(true);
    try {
      const data = await adminService.getDb();
      if (data) {
        const actual = data.data || data;
        const normalized = {
          services: Array.isArray(actual.services) ? actual.services : (Array.isArray(data.services) ? data.services : []),
          staff: Array.isArray(actual.staff) ? actual.staff : (Array.isArray(data.staff) ? data.staff : []),
          bookings: Array.isArray(actual.bookings) ? actual.bookings : (Array.isArray(data.bookings) ? data.bookings : []),
          customers: Array.isArray(actual.customers) ? actual.customers : (Array.isArray(data.customers) ? data.customers : []),
          settings: (actual.settings && typeof actual.settings === 'object') ? actual.settings : (data.settings || {})
        };
        setDbData(normalized);
      }
    } catch (err) {
      console.error("Failed to load admin db:", err);
      if (!isSilent) showToast("ไม่สามารถดึงข้อมูลล่าสุดได้", "error");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchDatabase();
  }, [fetchDatabase]);

  // Window Focus & Visibility Change Real-Time Sync
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchDatabase(true);
      }
    };

    const handleWindowFocus = () => {
      fetchDatabase(true);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleWindowFocus);

    // Optional 15-second polling interval for multi-device sync
    const interval = setInterval(() => {
      fetchDatabase(true);
    }, 15000);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleWindowFocus);
      clearInterval(interval);
    };
  }, [fetchDatabase]);

  // Booking handlers
  const handleUpdateBookingStatus = async (id, status) => {
    try {
      await adminService.updateBookingStatus(id, { status });
      showToast(`อัปเดตสถานะเป็น "${status}" เรียบร้อย`);
      fetchDatabase(true);
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleDeleteBooking = async (id) => {
    try {
      await adminService.deleteBooking(id);
      showToast("ลบรายการจองสำเร็จเรียบร้อย");
      fetchDatabase(true);
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleCreateBooking = async (bookingData) => {
    try {
      await adminService.createBooking(bookingData);
      showToast("สร้างรายการจองใหม่สำเร็จเรียบร้อย");
      fetchDatabase(true);
    } catch (err) {
      showToast(err.message, "error");
      throw err;
    }
  };

  const handleUpdateSlip = async (id, newSlipUrl) => {
    try {
      await adminService.updateBookingStatus(id, {
        paymentSlipUrl: newSlipUrl,
        paymentStatus: newSlipUrl ? "paid" : "pending"
      });
      showToast("อัปเดตหลักฐานการโอนเงินสำเร็จ");
      fetchDatabase(true);
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  // Services handlers
  const handleCreateService = async (serviceData) => {
    try {
      await adminService.createService(serviceData);
      showToast("เพิ่มบริการใหม่สำเร็จ");
      fetchDatabase(true);
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleUpdateService = async (id, serviceData) => {
    try {
      await adminService.updateService(id, serviceData);
      showToast("แก้ไขข้อมูลบริการสำเร็จ");
      fetchDatabase(true);
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleDeleteService = async (id) => {
    try {
      await adminService.deleteService(id);
      showToast("ลบบริการสำเร็จ");
      fetchDatabase(true);
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  // Staff handlers
  const handleCreateStaff = async (staffData) => {
    try {
      await adminService.createStaff(staffData);
      showToast("เพิ่มช่างผู้เชี่ยวชาญใหม่สำเร็จ");
      fetchDatabase(true);
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleUpdateStaff = async (id, staffData) => {
    try {
      await adminService.updateStaff(id, staffData);
      showToast("แก้ไขข้อมูลช่างสำเร็จ");
      fetchDatabase(true);
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleDeleteStaff = async (id) => {
    try {
      await adminService.deleteStaff(id);
      showToast("ลบรายชื่อช่างสำเร็จ");
      fetchDatabase(true);
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  // Settings handler
  const handleUpdateSettings = async (newSettings) => {
    try {
      const res = await adminService.updateSettings(newSettings);
      showToast("บันทึกการตั้งค่าระบบสำเร็จ");
      const updated = res?.data || newSettings;
      setDbData((prev) => ({
        ...prev,
        settings: {
          ...(prev.settings || {}),
          ...updated
        }
      }));
      fetchDatabase(true);
    } catch (err) {
      showToast(err.message, "error");
      throw err;
    }
  };

  const counts = {
    bookings: Array.isArray(dbData.bookings) ? dbData.bookings.length : 0,
    services: Array.isArray(dbData.services) ? dbData.services.length : 0,
    staff: Array.isArray(dbData.staff) ? dbData.staff.length : 0
  };

  return (
    <div className="min-h-screen bg-stone-50 text-gray-800 font-sans flex flex-col">
      {/* Admin Navbar */}
      <AdminNavbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        counts={counts}
        onExitAdmin={onExitAdmin}
        onLogout={onLogout}
        onRefresh={() => fetchDatabase(false)}
        isRefreshing={isRefreshing}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#D4A373] border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs text-gray-500 font-medium">กำลังโหลดฐานข้อมูล The Bloom Studio...</p>
          </div>
        ) : (
          <div>
            <div className={activeTab === "bookings" ? "block" : "hidden"}>
              <AdminBookingsTab
                bookings={dbData.bookings || []}
                services={dbData.services || []}
                staffList={dbData.staff || []}
                onUpdateStatus={handleUpdateBookingStatus}
                onDeleteBooking={handleDeleteBooking}
                onUpdateSlip={handleUpdateSlip}
                onCreateBooking={handleCreateBooking}
              />
            </div>

            <div className={activeTab === "services" ? "block" : "hidden"}>
              <AdminServicesTab
                services={dbData.services || []}
                onCreateService={handleCreateService}
                onUpdateService={handleUpdateService}
                onDeleteService={handleDeleteService}
              />
            </div>

            <div className={activeTab === "staff" ? "block" : "hidden"}>
              <AdminStaffTab
                staff={dbData.staff || []}
                services={dbData.services || []}
                onCreateStaff={handleCreateStaff}
                onUpdateStaff={handleUpdateStaff}
                onDeleteStaff={handleDeleteStaff}
              />
            </div>

            <div className={activeTab === "sheet" ? "block" : "hidden"}>
              <AdminGoogleSheetTab
                settings={dbData.settings || {}}
                onUpdateSettings={handleUpdateSettings}
                onRefreshData={() => fetchDatabase(false)}
              />
            </div>
          </div>
        )}
      </main>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-3 duration-300">
          <div
            className={`px-4 py-3 rounded-xl shadow-lg border text-xs font-medium flex items-center gap-2 ${
              toastMessage.type === "error"
                ? "bg-rose-900 text-white border-rose-800"
                : "bg-gray-900 text-white border-gray-800"
            }`}
          >
            <span>{toastMessage.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
