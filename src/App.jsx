import React, { useState, useEffect, useMemo } from "react";
import {
  Sparkles,
  Footprints,
  Smile,
  HeartHandshake,
  Flame,
  Eye,
  Calendar,
  Clock,
  User,
  Phone,
  MessageSquare,
  Check,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  RefreshCw,
  Star,
  MapPin,
  X,
  Share2,
  Receipt,
  Scissors,
  LogOut,
  ShieldCheck,
  Mail,
  Lock,
  Shield
} from "lucide-react";
import AdminLoginModal from "./components/admin/AdminLoginModal";
import AdminPanel from "./components/admin/AdminPanel";
import {
  fetchServices,
  fetchStaff,
  fetchAvailability,
  createBooking,
  fetchBookings,
  fetchCustomerProfile,
} from "./api/bookingService.js";
import {
  initLiff,
  isLiffLoggedIn,
  isLiffInClient,
  getLiffContext,
  getLiffProfile,
  liffLogin,
  liffLogout,
  LIFF_ID,
} from "./liff.js";

// Official LINE Logo Icon
function LineBubbleIcon({ className = "w-4 h-4", ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M19.365 9.864c0-4.04-4.201-7.327-9.365-7.327S.635 5.824.635 9.864c0 3.618 3.327 6.643 7.82 7.21.305.066.72.202.824.464.095.239.062.613.03.854-.047.348-.225 1.344-.249 1.487-.04.237-.184.927.406.505.59-.422 3.195-2.28 4.363-3.155.087-.065.176-.118.258-.16 3.181-.723 5.282-3.411 5.282-6.84zM6.92 11.956H5.21c-.24 0-.435-.195-.435-.435V7.79c0-.24.195-.435.435-.435h1.71c.24 0 .435.195.435.435s-.195.435-.435.435H5.645v1.076h1.275c.24 0 .435.195.435.435s-.195.435-.435.435H5.645v1.385H6.92c.24 0 .435.195.435.435s-.195.435-.435.435zm3.045 0h-1.28c-.24 0-.435-.195-.435-.435V7.79c0-.24.195-.435.435-.435s.435.195.435.435v3.296h.845c.24 0 .435.195.435.435s-.195.435-.435.435zm2.57 0h-.87c-.24 0-.435-.195-.435-.435V7.79c0-.24.195-.435.435-.435s.435.195.435.435v3.731c0 .24-.195.435-.435.435zm4.845 0c-.24 0-.435-.195-.435-.435v-2.31l-1.92 2.6c-.085.115-.22.18-.365.18h-.07c-.19-.035-.34-.185-.365-.375V7.79c0-.24.195-.435.435-.435s.435.195.435.435v2.24l1.89-2.56c.09-.12.23-.19.38-.18.15.01.285.095.35.23.045.09.065.19.065.29v3.526c0 .24-.195.435-.435.435z" />
    </svg>
  );
}

// Helper icon resolver
const getServiceIcon = (iconName) => {
  switch (iconName) {
    case "Sparkles":
      return <Sparkles className="w-5 h-5 text-[#D4A373]" />;
    case "Footprints":
      return <Footprints className="w-5 h-5 text-[#D4A373]" />;
    case "Smile":
      return <Smile className="w-5 h-5 text-[#D4A373]" />;
    case "HeartHandshake":
      return <HeartHandshake className="w-5 h-5 text-[#D4A373]" />;
    case "Flame":
      return <Flame className="w-5 h-5 text-[#D4A373]" />;
    case "Eye":
      return <Eye className="w-5 h-5 text-[#D4A373]" />;
    default:
      return <Scissors className="w-5 h-5 text-[#D4A373]" />;
  }
};

// Thai Date Helpers
const THAI_MONTHS_SHORT = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
];

const THAI_MONTHS_FULL = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
];

const THAI_DAYS_SHORT = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];
const THAI_DAYS_FULL = [
  "วันอาทิตย์", "วันจันทร์", "วันอังคาร", "วันพุธ",
  "วันพฤหัสบดี", "วันศุกร์", "วันเสาร์"
];

// Generate 14 upcoming booking dates starting from today
function generateNextDates(count = 14) {
  const dates = [];
  const today = new Date();

  for (let i = 0; i < count; i++) {
    const d = new Date();
    d.setDate(today.getDate() + i);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;

    dates.push({
      dateStr,
      dayNum: d.getDate(),
      dayNameShort: THAI_DAYS_SHORT[d.getDay()],
      dayNameFull: THAI_DAYS_FULL[d.getDay()],
      monthNameShort: THAI_MONTHS_SHORT[d.getMonth()],
      monthNameFull: THAI_MONTHS_FULL[d.getMonth()],
      buddhistYear: year + 543,
      isToday: i === 0,
    });
  }
  return dates;
}

export default function App() {
  // Calendar dates
  const calendarDates = useMemo(() => generateNextDates(14), []);

  // Server Data
  const [services, setServices] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [serverError, setServerError] = useState(null);

  // Category Filter for Dynamic Services
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Selected Booking Form States
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [selectedDate, setSelectedDate] = useState(calendarDates[0]?.dateStr || "");
  const [selectedTime, setSelectedTime] = useState("");

  // Customer Form with Smart User Memory (Auto-Fill)
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [specialRequest, setSpecialRequest] = useState("");
  const [isAutoFilled, setIsAutoFilled] = useState(false);

  // Availability & Slots
  const [availableSlots, setAvailableSlots] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loadingAvailability, setLoadingAvailability] = useState(false);

  // Submitting State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccessData, setBookingSuccessData] = useState(null);
  const [bookingErrorMessage, setBookingErrorMessage] = useState(null);

  // My Bookings Drawer (Strict Customer Privacy & Isolation)
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [allBookings, setAllBookings] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // LINE MINI App & LIFF State
  const [isLineLoggedIn, setIsLineLoggedIn] = useState(false);
  const [lineProfile, setLineProfile] = useState(null);
  const [isInLineClient, setIsInLineClient] = useState(false);
  const [lineContext, setLineContext] = useState(null);
  const [liffInitialized, setLiffInitialized] = useState(false);

  // Admin Control Panel State
  const [isAdminView, setIsAdminView] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    return (
      typeof window !== "undefined" &&
      (sessionStorage.getItem("thebloom_admin_auth") === "true" ||
        localStorage.getItem("thebloom_admin_auth") === "true")
    );
  });

  // Smart User Memory Helpers
  const loadRememberedUser = async (userId, displayName) => {
    if (!userId) return;
    try {
      // 1. Try local storage cache
      let localData = null;
      const raw = localStorage.getItem(`thebloom_customer_${userId}`);
      if (raw) {
        try {
          localData = JSON.parse(raw);
        } catch (e) {}
      }

      // 2. Fetch server database profile (previous bookings / customer records)
      const serverProfile = await fetchCustomerProfile({ lineUserId: userId });

      const name = localData?.name || serverProfile?.customerName || displayName || "";
      const phone = localData?.phone || serverProfile?.customerPhone || "";
      const email = localData?.email || serverProfile?.customerEmail || "";

      if (name) setCustomerName(name);
      if (phone) setCustomerPhone(phone);
      if (email) setCustomerEmail(email);

      if (phone || email) {
        setIsAutoFilled(true);
      }
    } catch (err) {
      console.warn("loadRememberedUser error:", err);
    }
  };

  // Guest / Browser Memory for Web Users without LINE
  useEffect(() => {
    if (!isLineLoggedIn && typeof window !== "undefined") {
      try {
        const rawGuest = localStorage.getItem("thebloom_guest_customer");
        if (rawGuest) {
          const guest = JSON.parse(rawGuest);
          if (guest.name && !customerName) setCustomerName(guest.name);
          if (guest.phone && !customerPhone) setCustomerPhone(guest.phone);
          if (guest.email && !customerEmail) setCustomerEmail(guest.email);
          if (guest.phone) setIsAutoFilled(true);
        }
      } catch (e) {}
    }
  }, [isLineLoggedIn]);

  const saveUserMemory = (userId, name, phone, email) => {
    if (!userId) return;
    try {
      const data = {
        name: name ? name.trim() : "",
        phone: phone ? phone.trim() : "",
        email: email ? email.trim() : "",
        savedAt: new Date().toISOString()
      };
      localStorage.setItem(`thebloom_customer_${userId}`, JSON.stringify(data));
    } catch (e) {
      console.warn("saveUserMemory error:", e);
    }
  };

  // Multi-Device & Window Focus Real-Time Sync
  useEffect(() => {
    const handleSyncOnFocus = () => {
      if (document.visibilityState === "visible") {
        fetchServices().then((res) => setServices(res)).catch(() => {});
        fetchStaff().then((res) => setStaffList(res)).catch(() => {});
      }
    };
    window.addEventListener("focus", handleSyncOnFocus);
    document.addEventListener("visibilitychange", handleSyncOnFocus);
    return () => {
      window.removeEventListener("focus", handleSyncOnFocus);
      document.removeEventListener("visibilitychange", handleSyncOnFocus);
    };
  }, []);

  // Initialize LIFF with liff.init({ liffId, withLoginOnExternalBrowser: true })
  useEffect(() => {
    let isMounted = true;

    async function setupLiff() {
      try {
        await initLiff();
        if (!isMounted) return;

        // Detect whether running in LINE in-app browser
        const inClient = isLiffInClient();
        setIsInLineClient(inClient);

        // Retrieve environment context
        const context = getLiffContext();
        setLineContext(context);

        // Check if user is logged in
        const loggedIn = isLiffLoggedIn();
        setIsLineLoggedIn(loggedIn);

        if (loggedIn) {
          const profile = await getLiffProfile();
          if (isMounted && profile) {
            setLineProfile(profile);
            // Smart Memory Auto-Fill
            loadRememberedUser(profile.userId, profile.displayName);
          }
        }
      } catch (err) {
        console.warn("[LIFF] Initialization caught error:", err);
      } finally {
        if (isMounted) {
          setLiffInitialized(true);
        }
      }
    }

    setupLiff();

    return () => {
      isMounted = false;
    };
  }, []);

  // When Login is clicked, call liff.login()
  const handleLineLogin = () => {
    liffLogin();
  };

  // Test / Simulated LINE Login for preview environments
  const handleSimulateDevLogin = (customUserId = "U_LINE_VIP_DEMO", customName = "คุณณฐพงศ์ (LINE User)") => {
    const mockProfile = {
      userId: customUserId,
      displayName: customName,
      pictureUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      statusMessage: "รักความสงบและสปาผ่อนคลาย ✨"
    };
    setIsLineLoggedIn(true);
    setLineProfile(mockProfile);
    loadRememberedUser(mockProfile.userId, mockProfile.displayName);
  };

  // When Logout is clicked: Completely purge user data and bookings list for privacy
  const handleLineLogout = () => {
    liffLogout();
    setIsLineLoggedIn(false);
    setLineProfile(null);
    setAllBookings([]);
    setCustomerName("");
    setCustomerPhone("");
    setCustomerEmail("");
    setIsAutoFilled(false);
    setShowHistoryModal(false);
    setBookingSuccessData(null);
  };

  // 1. Initial Load: Services & Staff
  useEffect(() => {
    async function loadData() {
      try {
        setLoadingInitial(true);
        setServerError(null);
        const [servicesRes, staffRes] = await Promise.all([
          fetchServices(),
          fetchStaff(),
        ]);
        setServices(servicesRes);
        setStaffList(staffRes);

        // Pre-select first service if available
        if (servicesRes.length > 0) {
          const firstService = servicesRes[0];
          setSelectedServiceId(firstService.id);

          // Find first staff that can do this service
          const eligible = staffRes.filter((s) => Array.isArray(s.skills) && s.skills.includes(firstService.id));
          if (eligible.length > 0) {
            setSelectedStaffId(eligible[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to load initial data:", err);
        setServerError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง");
      } finally {
        setLoadingInitial(false);
      }
    }
    loadData();
  }, []);

  // Dynamic Categories from Services
  const categories = useMemo(() => {
    const cats = Array.from(new Set(services.map((s) => s.category).filter(Boolean)));
    return ["All", ...cats];
  }, [services]);

  const filteredServices = useMemo(() => {
    if (selectedCategory === "All") return services;
    return services.filter((s) => s.category === selectedCategory);
  }, [services, selectedCategory]);

  // 2. When selected service changes, strictly filter eligible staff
  const eligibleStaff = useMemo(() => {
    if (!selectedServiceId) return staffList;
    return staffList.filter((st) => Array.isArray(st.skills) && st.skills.includes(selectedServiceId));
  }, [selectedServiceId, staffList]);

  useEffect(() => {
    if (eligibleStaff.length > 0) {
      // If current selected staff is not eligible for the new service, pick the first eligible
      const stillValid = eligibleStaff.some((st) => st.id === selectedStaffId);
      if (!stillValid) {
        setSelectedStaffId(eligibleStaff[0].id);
        setSelectedTime(""); // reset chosen time
      }
    } else {
      setSelectedStaffId("");
      setSelectedTime("");
    }
  }, [eligibleStaff, selectedStaffId]);

  // 3. Fetch availability whenever staffId or date changes
  useEffect(() => {
    if (!selectedStaffId || !selectedDate) {
      setAvailableSlots([]);
      setBookedSlots([]);
      return;
    }

    let isMounted = true;
    async function checkSlots() {
      setLoadingAvailability(true);
      try {
        const res = await fetchAvailability(selectedStaffId, selectedDate);
        if (isMounted) {
          setAvailableSlots(res.availableSlots || []);
          setBookedSlots(res.bookedSlots || []);

          // If current selected time is no longer available, clear it
          if (selectedTime && !res.availableSlots.includes(selectedTime)) {
            setSelectedTime("");
          }
        }
      } catch (err) {
        console.error("Failed to fetch slots:", err);
      } finally {
        if (isMounted) {
          setLoadingAvailability(false);
        }
      }
    }

    checkSlots();
    return () => {
      isMounted = false;
    };
  }, [selectedStaffId, selectedDate]);

  // Selected Service & Staff Objects
  const currentService = useMemo(
    () => services.find((s) => s.id === selectedServiceId),
    [services, selectedServiceId]
  );
  const currentStaff = useMemo(
    () => staffList.find((s) => s.id === selectedStaffId),
    [staffList, selectedStaffId]
  );
  const currentDateObj = useMemo(
    () => calendarDates.find((d) => d.dateStr === selectedDate),
    [calendarDates, selectedDate]
  );

  // Form Validity: Name & Phone required; LINE login recommended for customers, unblocked for Admin and direct web users
  const isFormComplete =
    Boolean(selectedServiceId) &&
    Boolean(selectedStaffId) &&
    Boolean(selectedDate) &&
    Boolean(selectedTime) &&
    customerName.trim().length >= 2 &&
    customerPhone.trim().length >= 9;

  // Handle Form Submit
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!isFormComplete || isSubmitting) return;

    setIsSubmitting(true);
    setBookingErrorMessage(null);

    try {
      const payload = {
        serviceId: selectedServiceId,
        staffId: selectedStaffId,
        date: selectedDate,
        time: selectedTime,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || undefined,
        specialRequest: specialRequest.trim() || undefined,
        lineUserId: lineProfile?.userId || (isAdminAuthenticated ? "ADMIN_BOOKING" : undefined),
        lineDisplayName: lineProfile?.displayName || (isAdminAuthenticated ? "ผู้ดูแลระบบ (Admin)" : customerName.trim()),
        linePictureUrl: lineProfile?.pictureUrl || undefined
      };

      const response = await createBooking(payload);
      if (response && response.success) {
        setBookingSuccessData(response.booking);
        // Save to smart user memory
        if (lineProfile?.userId) {
          saveUserMemory(lineProfile.userId, customerName, customerPhone, customerEmail);
        } else {
          try {
            localStorage.setItem(
              "thebloom_guest_customer",
              JSON.stringify({
                name: customerName.trim(),
                phone: customerPhone.trim(),
                email: customerEmail.trim()
              })
            );
          } catch (e) {}
        }
        setIsAutoFilled(true);

        // Refresh availability
        const res = await fetchAvailability(selectedStaffId, selectedDate);
        setAvailableSlots(res.availableSlots || []);
        setBookedSlots(res.bookedSlots || []);
        setSelectedTime("");
      }
    } catch (err) {
      console.error("Booking error:", err);
      setBookingErrorMessage(
        err.message || "ขออภัย ไม่สามารถดำเนินการจองได้ กรุณาตรวจสอบช่วงเวลาอีกครั้ง"
      );
      // Auto refresh slots on error in case slot was just booked
      if (selectedStaffId && selectedDate) {
        fetchAvailability(selectedStaffId, selectedDate).then((res) => {
          setAvailableSlots(res.availableSlots || []);
          setBookedSlots(res.bookedSlots || []);
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form for a new booking (Keeps remembered name, phone, email for speed!)
  const handleResetForNewBooking = () => {
    setBookingSuccessData(null);
    setSelectedTime("");
    setSpecialRequest("");
    setBookingErrorMessage(null);
  };

  // Open "คิวของฉัน (My Bookings)" with strict privacy filtering
  const handleOpenHistory = async () => {
    setShowHistoryModal(true);
    if (!isLineLoggedIn || !lineProfile?.userId) {
      setAllBookings([]);
      return;
    }
    setLoadingHistory(true);
    try {
      const list = await fetchBookings({
        lineUserId: lineProfile.userId,
        phone: customerPhone
      });
      setAllBookings(list || []);
    } catch (err) {
      console.error("Failed to load user bookings:", err);
      setAllBookings([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  if (isAdminView) {
    return (
      <AdminPanel
        onExitAdmin={() => setIsAdminView(false)}
        onLogout={() => {
          setIsAdminAuthenticated(false);
          sessionStorage.removeItem("thebloom_admin_auth");
          localStorage.removeItem("thebloom_admin_auth");
          setIsAdminView(false);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans flex flex-col antialiased">
      {/* Header - Artistic Flair */}
      <header className="h-20 sm:h-24 border-b border-gray-100 flex items-center justify-between px-6 lg:px-12 bg-white sticky top-0 z-30">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif tracking-tight text-gray-900">
            THE BLOOM <span className="text-[#D4A373]">STUDIO</span>
          </h1>
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-gray-400 mt-1 font-medium">
            Curated Beauty & Wellness Experiences
          </p>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden lg:flex gap-8 text-xs font-semibold uppercase tracking-widest text-gray-400 mr-2">
            <span className="hover:text-gray-700 transition cursor-pointer">Services</span>
            <span className="hover:text-gray-700 transition cursor-pointer">Specialists</span>
            <span className="hover:text-gray-700 transition cursor-pointer">About</span>
            <span className="text-[#D4A373] border-b border-[#D4A373] pb-1">Booking</span>
          </div>

          <button
            type="button"
            id="btn-my-bookings"
            onClick={handleOpenHistory}
            className="text-[11px] uppercase tracking-wider font-semibold flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50/90 border border-emerald-200 text-emerald-800 hover:bg-emerald-100 transition active:scale-95 cursor-pointer shadow-2xs"
            title="คิวของฉัน (My Bookings)"
          >
            <Receipt className="w-3.5 h-3.5 text-emerald-600" />
            <span>คิวของฉัน</span>
            {isLineLoggedIn && allBookings.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-[#06C755] text-white text-[9px] font-bold">
                {allBookings.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              if (isAdminAuthenticated) {
                setIsAdminView(true);
              } else {
                setIsAdminModalOpen(true);
              }
            }}
            className="text-[11px] uppercase tracking-wider font-semibold flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#D4A373]/10 border border-[#D4A373]/30 text-[#a3703e] hover:bg-[#D4A373]/20 transition active:scale-95 cursor-pointer shadow-2xs"
            title="ระบบจัดการหลังบ้าน (Admin Control Panel)"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#D4A373]" />
            <span>Admin</span>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="border-b border-gray-100 bg-[#FCFAF8] py-7 sm:py-9 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-[#06C755]/10 text-[#05963E] border border-[#06C755]/25">
                <LineBubbleIcon className="w-3.5 h-3.5 fill-[#06C755]" />
                LINE MINI App
              </span>
              {isInLineClient ? (
                <span className="text-[11px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  LINE In-App Browser
                </span>
              ) : (
                <span className="text-[11px] font-medium text-gray-500 bg-white border border-gray-200 px-2.5 py-0.5 rounded-full shadow-2xs">
                  Web Browser
                </span>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif text-gray-900 tracking-tight">
              Reserve Your Curated Studio Experience
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              สัมผัสบริการทำเล็บ สปา และทรีตเมนต์เพื่อความผ่อนคลายอย่างสมบูรณ์แบบ ดึงข้อมูลบริการและช่างแบบ Live Dynamic พร้อมระบบความปลอดภัยคิวส่วนตัว
            </p>
          </div>

          {/* Login with LINE and Logout button under the hero */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 shrink-0">
            {!isLineLoggedIn ? (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <button
                  type="button"
                  id="btn-line-login"
                  onClick={handleLineLogin}
                  className="inline-flex items-center justify-center gap-2.5 px-5 py-2.5 rounded-lg bg-[#06C755] hover:bg-[#05B34C] active:scale-98 text-white font-semibold text-xs tracking-wider uppercase transition shadow-sm hover:shadow cursor-pointer"
                >
                  <LineBubbleIcon className="w-4 h-4 fill-white" />
                  <span>Login with LINE</span>
                </button>
                <button
                  type="button"
                  id="btn-dev-login"
                  onClick={() => handleSimulateDevLogin()}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-medium transition cursor-pointer shadow-2xs"
                  title="ทดสอบจำลอง LINE User สำหรับดูระบบ Auto-Fill และคิวส่วนตัว"
                >
                  <span>⚡ จำลอง LINE User</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500">
                  <span className="w-2 h-2 rounded-full bg-[#06C755]"></span>
                  <span>Logged in as <strong className="text-gray-800">{lineProfile?.displayName || "LINE User"}</strong></span>
                </div>
                <button
                  type="button"
                  id="btn-line-logout"
                  onClick={handleLineLogout}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 active:scale-98 text-gray-700 font-semibold text-xs tracking-wider uppercase transition shadow-2xs cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-gray-500" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* LINE User Profile Card at the top of the reservation page after login using liff.getProfile() */}
      {isLineLoggedIn && lineProfile && (
        <div className="max-w-7xl w-full mx-auto px-6 pt-6">
          <div
            id="line-user-profile-card"
            className="p-5 sm:p-6 rounded-xl bg-white border border-[#06C755]/30 shadow-xs relative overflow-hidden transition-all"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-[#06C755]" />
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-4">
                <div className="relative shrink-0">
                  {lineProfile.pictureUrl ? (
                    <img
                      src={lineProfile.pictureUrl}
                      alt={lineProfile.displayName || "LINE User"}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-[#06C755]/25 shadow-xs"
                    />
                  ) : (
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-50 border-2 border-[#06C755]/25 flex items-center justify-center text-[#06C755] font-bold text-xl">
                      {lineProfile.displayName ? lineProfile.displayName.charAt(0) : "L"}
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#06C755] text-white flex items-center justify-center shadow-xs border-2 border-white">
                    <LineBubbleIcon className="w-3.5 h-3.5 fill-white" />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#06C755]">
                      LINE User Profile
                    </span>
                    {isInLineClient ? (
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                        LINE In-App Client
                      </span>
                    ) : (
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-semibold">
                        External Browser
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg sm:text-xl font-serif font-bold text-gray-900 leading-tight">
                    {lineProfile.displayName || "LINE User"}
                  </h3>

                  <p className="text-xs text-gray-500 font-mono flex items-center gap-1.5">
                    <span className="text-gray-400 font-sans">LINE ID:</span>
                    <span className="font-semibold text-gray-700">{lineProfile.userId || "-"}</span>
                  </p>

                  {lineProfile.statusMessage && (
                    <p className="text-xs text-gray-600 italic bg-gray-50 px-3 py-1.5 rounded-md border border-gray-100 mt-1.5">
                      "{lineProfile.statusMessage}"
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:items-end gap-1.5 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg font-medium">
                  <CheckCircle2 className="w-4 h-4 text-[#06C755]" />
                  {isAutoFilled ? "ความจำอัจฉริยะ: ดึงข้อมูลชื่อ เบอร์โทร อีเมล อัตโนมัติ" : "เข้าสู่ระบบแล้ว: ข้อมูลจะถูกจดจำอัตโนมัติ"}
                </span>
                <p className="text-[11px] text-gray-400">จองครั้งต่อไปไม่ต้องพิมพ์ซ้ำ พร้อมยืนยันได้ทันที</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Alerts & Error Notices */}
      <div className="max-w-7xl w-full mx-auto px-6 pt-4 space-y-2">
        {serverError && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-100 text-red-700 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium">เกิดข้อผิดพลาดในการเชื่อมต่อ</p>
              <p className="text-xs text-red-600 mt-0.5">{serverError}</p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="text-xs underline text-red-800 shrink-0 font-medium cursor-pointer"
            >
              โหลดใหม่
            </button>
          </div>
        )}

        {bookingErrorMessage && (
          <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-amber-950">แจ้งเตือนการจอง</p>
              <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                {bookingErrorMessage}
              </p>
            </div>
            <button
              onClick={() => setBookingErrorMessage(null)}
              className="text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Main Content Layout - 3 Columns on Large Screens (Artistic Flair), Single Column Fluid on Mobile */}
      <div className="flex-1 w-full max-w-7xl mx-auto flex flex-col">
        <main className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-0 border-b border-gray-100">
          {/* Column 1: Step 01 - Select Service */}
          <section className="border-b lg:border-b-0 lg:border-r border-gray-100 p-6 lg:p-8 flex flex-col bg-white">
            <div className="mb-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4A373] mb-1.5 block">
                Step 01
              </span>
              <div className="flex items-baseline justify-between mb-3">
                <h2 className="text-xl font-serif text-gray-800">Select Service</h2>
                <span className="text-[11px] text-gray-400">
                  {filteredServices.length} บริการ
                </span>
              </div>

              {/* Dynamic Category Filter Tabs */}
              {categories.length > 1 && (
                <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1">
                  {categories.map((cat, cIdx) => {
                    const isCatSelected = selectedCategory === cat;
                    return (
                      <button
                        key={`cat-${cat}-${cIdx}`}
                        type="button"
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition cursor-pointer shrink-0 ${
                          isCatSelected
                            ? "bg-[#D4A373] text-white shadow-2xs font-semibold"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {cat === "All" ? "ทั้งหมด" : cat}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="space-y-3.5 flex-1 overflow-y-auto max-h-[560px] pr-1">
              {loadingInitial ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((n) => (
                    <div
                      key={n}
                      className="h-24 rounded-lg bg-gray-50 border border-gray-100 animate-pulse"
                    />
                  ))}
                </div>
              ) : filteredServices.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-xs bg-gray-50 rounded-lg border border-dashed border-gray-200">
                  ไม่พบบริการในหมวดหมู่นี้
                </div>
              ) : (
                filteredServices.map((service, sIdx) => {
                  const isSelected = selectedServiceId === service.id;
                  return (
                    <div
                      key={`srv-${service.id}-${sIdx}`}
                      onClick={() => setSelectedServiceId(service.id)}
                      className={`group p-4 sm:p-4.5 rounded-lg transition-all cursor-pointer ${
                        isSelected
                          ? "border-2 border-[#D4A373] bg-white relative shadow-sm"
                          : "border border-gray-100 bg-gray-50/70 hover:border-[#D4A373] hover:bg-white"
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute -top-2 -right-2 bg-[#D4A373] text-white p-1 rounded-full shadow-xs">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}

                      <div className="flex justify-between items-start mb-1">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-[#D4A373]/10 flex items-center justify-center shrink-0">
                            {getServiceIcon(service.icon)}
                          </div>
                          <h3 className="font-medium text-sm text-gray-900 leading-snug">
                            {service.name}
                          </h3>
                        </div>
                        <span className="text-[#D4A373] font-semibold text-sm shrink-0 ml-2">
                          ฿{Number(service.price || 0).toLocaleString()}
                        </span>
                      </div>

                      <p className="text-xs text-gray-500 mb-2 leading-relaxed pl-8">
                        {service.description}
                      </p>

                      <div className="flex items-center justify-between pl-8 text-[10px]">
                        <span
                          className={`uppercase tracking-wider ${
                            isSelected
                              ? "text-[#D4A373] font-bold"
                              : "text-gray-500 font-medium"
                          }`}
                        >
                          ⏱️ {service.duration} นาที
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-white border border-gray-200/70 text-gray-600 font-medium">
                          {service.category}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* Column 2: Step 02 (Your Specialist) & Step 03 (Availability) */}
          <section className="border-b lg:border-b-0 lg:border-r border-gray-100 p-6 lg:p-8 flex flex-col bg-gray-50/30">
            {/* Step 02: Your Specialist */}
            <div className="mb-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4A373] mb-1.5 block">
                Step 02
              </span>
              <div className="flex items-baseline justify-between">
                <h2 className="text-xl font-serif text-gray-800">Your Specialist</h2>
                <span className="text-[11px] text-gray-400">
                  {eligibleStaff.length} available
                </span>
              </div>
            </div>

            {/* Specialist Avatars */}
            <div className="flex gap-4 overflow-x-auto pb-4 mb-8 no-scrollbar -mx-2 px-2">
              {eligibleStaff.length === 0 ? (
                <div className="w-full text-center py-6 text-xs text-gray-400 bg-white rounded-lg border border-gray-100">
                  ไม่มีช่างที่รองรับบริการนี้
                </div>
              ) : (
                eligibleStaff.map((staff, stIdx) => {
                  const isSelected = selectedStaffId === staff.id;
                  return (
                    <div
                      key={`staff-${staff.id}-${stIdx}`}
                      onClick={() => setSelectedStaffId(staff.id)}
                      className={`flex-shrink-0 w-28 text-center cursor-pointer transition-all ${
                        isSelected ? "opacity-100 scale-102" : "opacity-40 hover:opacity-90"
                      }`}
                    >
                      <div
                        className={`w-20 h-20 mx-auto rounded-full bg-gray-200 p-1 mb-2 transition-all ${
                          isSelected
                            ? "border-2 border-[#D4A373] shadow-sm"
                            : "border border-transparent"
                        }`}
                      >
                        <div className="w-full h-full rounded-full bg-gray-300 overflow-hidden relative">
                          <img
                            src={staff.avatar}
                            alt={staff.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                      <p
                        className={`text-xs font-bold truncate ${
                          isSelected ? "text-gray-900" : "text-gray-700"
                        }`}
                      >
                        {staff.name.replace(/คุณ|\(.*\)/g, "").trim() || staff.name}
                      </p>
                      <p className="text-[10px] text-gray-400 truncate mt-0.5">
                        {staff.role}
                      </p>
                      <div className="flex items-center justify-center gap-1 mt-1 text-[10px] text-amber-600 font-medium">
                        <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                        <span>{staff.rating}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Step 03: Availability */}
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4A373] mb-1.5 block">
                    Step 03
                  </span>
                  <h2 className="text-xl font-serif text-gray-800">Availability</h2>
                </div>
                {loadingAvailability && (
                  <span className="text-[11px] text-gray-400 flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 animate-spin text-[#D4A373]" />
                    Checking...
                  </span>
                )}
              </div>
            </div>

            {/* Date Picker Cards */}
            <div className="flex gap-2 mb-5 overflow-x-auto pb-2 no-scrollbar -mx-2 px-2">
              {calendarDates.map((item, dIdx) => {
                const isSelected = selectedDate === item.dateStr;
                return (
                  <div
                    key={`date-${item.dateStr}-${dIdx}`}
                    onClick={() => setSelectedDate(item.dateStr)}
                    className={`flex-1 min-w-[62px] rounded-md p-2.5 text-center bg-white cursor-pointer transition-all ${
                      isSelected
                        ? "border-2 border-[#D4A373] shadow-sm"
                        : "border border-gray-200 hover:border-[#D4A373]"
                    }`}
                  >
                    <p
                      className={`text-[10px] font-bold uppercase ${
                        isSelected ? "text-[#D4A373]" : "text-gray-400"
                      }`}
                    >
                      {item.isToday ? "Today" : item.dayNameShort}
                    </p>
                    <p
                      className={`text-lg font-serif mt-0.5 leading-none ${
                        isSelected ? "text-[#D4A373] font-bold" : "text-gray-800"
                      }`}
                    >
                      {item.dayNum}
                    </p>
                    <p className="text-[9px] text-gray-400 mt-1 uppercase">
                      {item.monthNameShort}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Time Slots Grid */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                "10:00",
                "11:00",
                "12:00",
                "13:00",
                "14:00",
                "15:00",
                "16:00",
                "17:00",
                "18:00",
                "19:00",
              ].map((timeSlot, tIdx) => {
                const isBooked = bookedSlots.includes(timeSlot);
                const isSelected = selectedTime === timeSlot;

                if (isBooked) {
                  return (
                    <button
                      key={`booked-${timeSlot}-${tIdx}`}
                      type="button"
                      disabled
                      className="py-2.5 px-1 text-xs border border-gray-100 bg-white rounded-md opacity-35 cursor-not-allowed line-through text-gray-400"
                    >
                      {timeSlot}
                    </button>
                  );
                }

                return (
                  <button
                    key={`avail-${timeSlot}-${tIdx}`}
                    type="button"
                    onClick={() => setSelectedTime(timeSlot)}
                    className={`py-2.5 px-1 text-xs rounded-md transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-[#D4A373] text-white font-bold shadow-sm shadow-[#D4A373]/30 border border-transparent"
                        : "border border-gray-200 bg-white text-gray-800 hover:bg-[#D4A373] hover:text-white hover:border-[#D4A373]"
                    }`}
                  >
                    {timeSlot}
                  </button>
                );
              })}
            </div>

            {availableSlots.length === 0 && !loadingAvailability && (
              <p className="text-xs text-center text-amber-800 bg-amber-50 p-2.5 rounded border border-amber-100">
                ไม่มีช่วงเวลาว่างในวันนี้ กรุณาเลือกวันอื่น
              </p>
            )}
          </section>

          {/* Column 3: Final Step - Guest Details & Treatment Summary */}
          <section className="p-6 lg:p-8 flex flex-col bg-white">
            <div className="mb-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4A373] mb-1.5 block">
                Final Step
              </span>
              <div className="flex items-baseline justify-between">
                <h2 className="text-xl font-serif text-gray-800">Guest Details</h2>
                {isAutoFilled && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                    ⚡ Auto-Filled
                  </span>
                )}
              </div>
            </div>

            <form onSubmit={handleBookingSubmit} className="space-y-3.5 flex-1 flex flex-col">
              {isAutoFilled && (
                <div className="p-2.5 rounded-lg bg-emerald-50/80 border border-emerald-200/80 text-[11px] text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#06C755] shrink-0" />
                  <span>ระบบดึงข้อมูลจากประวัติเดิมของคุณอัตโนมัติ (แก้ไขได้ตามต้องการ)</span>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                    Full Name <span className="text-rose-400">*</span>
                  </label>
                  {isLineLoggedIn && lineProfile?.displayName && (
                    <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                      <LineBubbleIcon className="w-3 h-3 fill-emerald-600" />
                      LINE Profile
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  required
                  placeholder="Enter your name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full border-b border-gray-200 py-2 focus:border-[#D4A373] outline-none text-sm font-medium text-gray-900 bg-transparent transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1 tracking-wider">
                  Mobile Phone <span className="text-rose-400">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="081-234-5678"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full border-b border-gray-200 py-2 focus:border-[#D4A373] outline-none text-sm font-medium text-gray-900 bg-transparent transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1 tracking-wider">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  placeholder="your.email@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full border-b border-gray-200 py-2 focus:border-[#D4A373] outline-none text-sm font-medium text-gray-900 bg-transparent transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1 tracking-wider">
                  Special Requests (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Tell us about allergies or preferences..."
                  value={specialRequest}
                  onChange={(e) => setSpecialRequest(e.target.value)}
                  className="w-full border border-gray-200 p-2.5 rounded-md outline-none text-sm resize-none focus:border-[#D4A373] bg-transparent text-gray-900 transition-colors"
                />
              </div>

              {/* Treatment Total Box - Artistic Flair */}
              <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-gray-500">Selected Service</span>
                  <span className="font-medium text-gray-800 truncate max-w-[170px]">
                    {currentService ? currentService.name : "None"}
                  </span>
                </div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-gray-500">Specialist</span>
                  <span className="font-medium text-gray-800">
                    {currentStaff ? currentStaff.name : "-"}
                  </span>
                </div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-gray-500">Appointment</span>
                  <span className="font-medium text-gray-800">
                    {selectedDate} {selectedTime ? `• ${selectedTime}` : ""}
                  </span>
                </div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-gray-500">Treatment Total</span>
                  <span className="font-bold text-gray-900">
                    ฿{currentService ? Number(currentService.price || 0).toLocaleString() : "0"}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-1.5 mt-1.5 flex justify-between items-baseline">
                  <span className="text-sm font-serif text-gray-900 font-medium">Total</span>
                  <span className="text-base font-bold text-[#D4A373]">
                    ฿{currentService ? Number(currentService.price || 0).toLocaleString() : "0"}
                  </span>
                </div>
              </div>

              {/* Confirm Button / Login Gate */}
              <div className="pt-2 space-y-2.5">
                {!isLineLoggedIn ? (
                  <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200/80 text-center space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-emerald-800">
                      <span className="font-medium flex items-center gap-1.5 text-left">
                        <LineBubbleIcon className="w-3.5 h-3.5 fill-[#06C755] shrink-0" />
                        <span>เข้าสู่ระบบด้วย LINE เพื่อรับการแจ้งเตือนคิวจองอัตโนมัติ</span>
                      </span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={handleLineLogin}
                        className="px-3.5 py-1.5 rounded-md bg-[#06C755] hover:bg-[#05B34C] text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer transition"
                      >
                        <LineBubbleIcon className="w-3.5 h-3.5 fill-white" />
                        <span>Login with LINE</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSimulateDevLogin()}
                        className="px-2.5 py-1.5 rounded-md bg-white border border-gray-200 text-gray-700 font-medium text-xs hover:bg-gray-50 cursor-pointer transition"
                      >
                        <span>⚡ จำลอง Login</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-200/70 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-[#06C755] flex items-center justify-center text-white shrink-0">
                        <LineBubbleIcon className="w-3 h-3 fill-white" />
                      </div>
                      <span className="text-emerald-950 font-medium truncate max-w-[180px]">
                        {lineProfile?.displayName || "LINE User"}
                      </span>
                    </div>
                    <span className="text-[10px] text-emerald-700 font-medium bg-white px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                      LINE Verified
                    </span>
                  </div>
                )}

                {isAdminAuthenticated && (
                  <div className="px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-md text-[11px] text-amber-900 flex items-center justify-between">
                    <span className="font-semibold">🔑 โหมดผู้ดูแลระบบ (Admin Mode)</span>
                    <span className="text-[10px] text-amber-700">ลงคิวให้ลูกค้าได้ทันที</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!isFormComplete || isSubmitting}
                  className={`w-full h-13 font-bold uppercase tracking-[0.2em] rounded-md shadow-lg transition-all flex items-center justify-center gap-3 text-xs sm:text-sm ${
                    isFormComplete && !isSubmitting
                      ? "bg-[#D4A373] text-white shadow-[#D4A373]/20 hover:bg-[#c19262] cursor-pointer active:scale-99"
                      : "bg-gray-200 text-gray-400 shadow-none cursor-not-allowed"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>CONFIRMING...</span>
                    </>
                  ) : (
                    <>
                      <span>CONFIRM BOOKING</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <p className="text-center text-[10px] text-gray-400 mt-2 tracking-tight">
                  By booking, you agree to our 24h cancellation policy.
                </p>
              </div>
            </form>
          </section>
        </main>
      </div>

      {/* Confirmation Modal - Artistic Flair */}
      {bookingSuccessData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-xl w-full max-w-sm p-6 text-center shadow-2xl border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-[#D4A373]" />

            <div className="w-16 h-16 rounded-full bg-[#D4A373]/15 text-[#D4A373] mx-auto flex items-center justify-center mb-3 mt-1">
              <CheckCircle2 className="w-9 h-9 stroke-[2.2]" />
            </div>

            <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4A373] mb-1 block">
              Reservation Confirmed
            </span>
            <h3 className="text-2xl font-serif text-gray-900">Booking Success</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              The Bloom Studio welcomes you
            </p>

            <div className="mt-3.5 py-2 px-3 rounded bg-gray-50 border border-gray-200 inline-flex items-center gap-2 text-xs">
              <span className="text-gray-400 uppercase tracking-wider font-semibold text-[10px]">
                Ref Code:
              </span>
              <span className="font-mono font-bold text-[#B88555]">
                {bookingSuccessData.id}
              </span>
            </div>

            <div className="mt-4 p-4 rounded-lg bg-gray-50 border border-gray-100 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Treatment:</span>
                <span className="font-medium text-gray-900 text-right">
                  {bookingSuccessData.serviceName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Specialist:</span>
                <span className="font-medium text-gray-900">
                  {bookingSuccessData.staffName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Date & Time:</span>
                <span className="font-bold text-[#D4A373]">
                  {bookingSuccessData.date} • {bookingSuccessData.time}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Guest:</span>
                <span className="text-gray-800 font-medium">
                  {bookingSuccessData.customerName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Phone:</span>
                <span className="text-gray-800 font-medium">
                  {bookingSuccessData.customerPhone}
                </span>
              </div>
              {bookingSuccessData.specialRequest && (
                <div className="pt-1.5 border-t border-gray-200">
                  <span className="text-gray-400 text-[10px] block uppercase tracking-wider">
                    Note:
                  </span>
                  <span className="text-gray-700 italic">
                    "{bookingSuccessData.specialRequest}"
                  </span>
                </div>
              )}
            </div>

            <p className="text-[10px] text-gray-400 mt-3">
              Please arrive 10-15 minutes prior to your session.
            </p>

            <div className="mt-5 space-y-2">
              <button
                type="button"
                onClick={handleResetForNewBooking}
                className="w-full h-12 rounded-md bg-[#D4A373] text-white font-bold uppercase tracking-wider text-xs hover:bg-[#c19262] transition cursor-pointer"
              >
                Book Another Experience
              </button>
              <button
                type="button"
                onClick={() => {
                  setBookingSuccessData(null);
                  handleOpenHistory();
                }}
                className="w-full h-10 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold text-xs hover:bg-emerald-100 transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Receipt className="w-3.5 h-3.5 text-emerald-600" />
                <span>ดูคิวของฉัน (My Bookings)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Strict Privacy: "คิวของฉัน (My Bookings)" Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-t-xl sm:rounded-xl w-full max-w-md max-h-[85vh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden animate-slide-up">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#06C755] block">
                  Private & Secure
                </span>
                <h3 className="font-serif text-lg text-gray-900 flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-[#D4A373]" />
                  คิวของฉัน (My Bookings)
                </h3>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  แสดงเฉพาะคิวของคุณเท่านั้น ไม่เห็นคิวของผู้อื่น
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 flex-1">
              {!isLineLoggedIn ? (
                <div className="text-center py-10 px-4 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 mx-auto flex items-center justify-center border border-amber-200">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h4 className="font-medium text-sm text-gray-800">
                    กรุณาเข้าสู่ระบบเพื่อดูคิวของคุณ
                  </h4>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    ระบบจะแสดงเฉพาะประวัติคิวที่เชื่อมโยงกับบัญชี LINE หรือเบอร์โทรของคุณเท่านั้น เพื่อความปลอดภัยสูงสุด
                  </p>
                  <div className="pt-2 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={handleLineLogin}
                      className="w-full py-2.5 rounded-lg bg-[#06C755] text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#05B34C] transition cursor-pointer"
                    >
                      <LineBubbleIcon className="w-3.5 h-3.5 fill-white" />
                      <span>Login with LINE</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSimulateDevLogin()}
                      className="w-full py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-700 text-xs font-medium hover:bg-gray-100 transition cursor-pointer"
                    >
                      <span>⚡ จำลอง LINE User เพื่อทดสอบ</span>
                    </button>
                  </div>
                </div>
              ) : loadingHistory ? (
                <div className="text-center py-8 text-gray-400 text-xs">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#D4A373] mb-2" />
                  กำลังค้นหาคิวของคุณ...
                </div>
              ) : allBookings.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-xs space-y-2">
                  <Calendar className="w-8 h-8 text-gray-300 mx-auto" />
                  <p className="font-medium text-gray-600">ยังไม่มีรายการคิวจองในบัญชีของคุณ</p>
                  <p className="text-[11px] text-gray-400">เมื่อคุณทำการจอง คิวจะแสดงที่นี่ทันที</p>
                </div>
              ) : (
                allBookings.map((b, bIdx) => (
                  <div
                    key={`hist-${b.id || "bk"}-${bIdx}`}
                    className="p-3.5 rounded-lg border border-gray-100 bg-gray-50 text-xs space-y-1.5 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-semibold text-[#B88555]">
                        #{b.id}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-700 font-semibold uppercase tracking-wider border border-emerald-200">
                        {b.status || "CONFIRMED"}
                      </span>
                    </div>
                    <div className="font-semibold text-sm text-gray-900">{b.serviceName}</div>
                    <div className="text-gray-600 flex items-center justify-between text-[11px]">
                      <span>ช่าง: <strong>{b.staffName}</strong></span>
                      <span className="font-bold text-[#D4A373]">
                        {b.date} • {b.time}
                      </span>
                    </div>
                    <div className="text-gray-500 pt-1 border-t border-gray-200/60 flex items-center justify-between text-[11px]">
                      <span>ผู้จอง: {b.customerName}</span>
                      <span>{b.customerPhone}</span>
                    </div>
                    {b.specialRequest && (
                      <div className="text-[11px] text-gray-500 italic bg-white/70 p-1.5 rounded border border-gray-100">
                        หมายเหตุ: "{b.specialRequest}"
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-3">
              <span className="text-[11px] text-gray-500 truncate">
                {isLineLoggedIn ? `บัญชี: ${lineProfile?.displayName}` : "ยังไม่ได้เข้าสู่ระบบ"}
              </span>
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="px-5 py-2 rounded-md bg-white border border-gray-200 text-gray-700 text-xs font-medium hover:bg-gray-100 transition cursor-pointer"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin PIN Login Modal */}
      <AdminLoginModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onLoginSuccess={() => {
          setIsAdminAuthenticated(true);
          sessionStorage.setItem("thebloom_admin_auth", "true");
          localStorage.setItem("thebloom_admin_auth", "true");
          setIsAdminModalOpen(false);
          setIsAdminView(true);
        }}
      />
    </div>
  );
}

