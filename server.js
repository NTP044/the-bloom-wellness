import express from "express";
import http from "http";
import path from "path";
import fs from "fs";
import cors from "cors";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";

const __dirname = process.cwd();

const PORT = 3000;
const DB_PATH = path.join(__dirname, "data", "database.json");

// ==========================================
// Persistent Database Store (data/database.json)
// ==========================================

function getInitialDatabase() {
  const today = new Date().toISOString().split("T")[0];
  return {
    services: [
      {
        id: "srv-nails",
        name: "ทำเล็บเจล พรีเมียม (Gel Manicure & Art)",
        category: "Nails",
        duration: 60,
        price: 790,
        description: "ตัดแต่งทรงเล็บ เคลียร์หนัง ทาสีเจลเกรดพรีเมียมนำเข้าจากเกาหลี พร้อมเคลือบบำรุงหน้าเล็บ",
        icon: "Sparkles"
      },
      {
        id: "srv-pedicure",
        name: "สปาเท้าและเพดิคิวร์อโรมา (Aroma Foot Spa & Pedicure)",
        category: "Spa & Care",
        duration: 75,
        price: 990,
        description: "แช่เกลือหิมาลายัน สครับผิวผลัดเซลล์ นวดบำรุงด้วยน้ำมันอโรมา พร้อมตัดแต่งทรงเล็บเท้า",
        icon: "Footprints"
      },
      {
        id: "srv-facial",
        name: "ทรีตเมนต์บำรุงผิวหน้าออร์แกนิก (Organic Facial Glow)",
        category: "Facial",
        duration: 90,
        price: 1590,
        description: "ทำความสะอาดล้ำลึก ผลักวิตามินเข้มข้น นวดกระตุ้นคอลลาเจน และมาสก์ทองคำเปล่งประกาย",
        icon: "Smile"
      },
      {
        id: "srv-massage",
        name: "นวดอโรมาเธอราปีผ่อนคลาย (Aromatherapy Body Massage)",
        category: "Massage",
        duration: 60,
        price: 1290,
        description: "นวดน้ำมันกลิ่นเอกลักษณ์สูตร The Bloom Studio ช่วยคลายกล้ามเนื้อและความตึงเครียดทั่วเรือนร่าง",
        icon: "HeartHandshake"
      },
      {
        id: "srv-guasha",
        name: "นวดกัวซาหน้ายกกระชับ & หินร้อน (Facial Gua Sha & Hot Stone)",
        category: "Facial & Spa",
        duration: 75,
        price: 1490,
        description: "ศาสตร์กัวซายกกระชับกรอบหน้า กระตุ้นการไหลเวียนโลหิต ผสานประคบหินร้อนสปาคลายความตึง",
        icon: "Flame"
      },
      {
        id: "srv-lashes",
        name: "ต่อขนตาเส้นต่อเส้นสไตล์เกาหลี (Natural Lash Extension)",
        category: "Lashes",
        duration: 90,
        price: 1200,
        description: "ต่อขนตาเกรดไหมพรีเมียมนุ่มเบา ไม่ระคายเคืองตา ดูเป็นธรรมชาติและอ่อนหวาน",
        icon: "Eye"
      }
    ],
    staff: [
      {
        id: "stf-mina",
        name: "คุณมีนา สุขเกษม",
        nickname: "มีนา (Mina)",
        role: "Senior Nail & Spa Artist",
        experience: "ประสบการณ์ 6 ปี",
        rating: 4.95,
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80",
        skills: ["srv-nails", "srv-pedicure", "srv-lashes"],
        bio: "เชี่ยวชาญการออกแบบลายเล็บสไตล์มินิมอลเกาหลีและงานดีเทลประณีต"
      },
      {
        id: "stf-linda",
        name: "คุณลินดา รัตนกุล",
        nickname: "ลินดา (Linda)",
        role: "Facial & Wellness Therapist",
        experience: "ประสบการณ์ 8 ปี",
        rating: 4.98,
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80",
        skills: ["srv-facial", "srv-massage", "srv-pedicure", "srv-guasha"],
        bio: "ผู้เชี่ยวชาญด้านการวิเคราะห์สภาพผิว ทรีตเมนต์ยกกระชับ และศาสตร์กัวซาชะลอวัย"
      },
      {
        id: "stf-ava",
        name: "คุณเอวา พงศ์ไพศาล",
        nickname: "เอวา (Ava)",
        role: "Holistic Spa & Body Specialist",
        experience: "ประสบการณ์ 7 ปี",
        rating: 4.92,
        avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80",
        skills: ["srv-massage", "srv-guasha", "srv-facial"],
        bio: "เชี่ยวชาญศาสตร์การนวดคลายจุดกล้ามเนื้อลึก อโรมาเธอราปี และหินร้อนบำบัด"
      },
      {
        id: "stf-praewa",
        name: "คุณแพรวา วงศ์สว่าง",
        nickname: "แพรวา (Praewa)",
        role: "Lash & Nail Design Master",
        experience: "ประสบการณ์ 5 ปี",
        rating: 4.96,
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
        skills: ["srv-nails", "srv-lashes", "srv-pedicure"],
        bio: "ผู้ชำนาญการต่อขนตาเส้นต่อเส้นและการดูแลเล็บสุขภาพดีแบบครบวงจร"
      }
    ],
    bookings: [
      {
        id: "BK-SAMPLE-01",
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        status: "pending",
        date: today,
        time: "13:00",
        serviceId: "srv-nails",
        serviceName: "ทำเล็บเจล พรีเมียม (Gel Manicure & Art)",
        servicePrice: 790,
        serviceDuration: 60,
        staffId: "stf-mina",
        staffName: "มีนา (Mina)",
        customerName: "คุณวรัญญา สิทธิสาร",
        customerPhone: "081-234-5678",
        customerEmail: "waranya@example.com",
        specialRequest: "ขอโทนสีนู้ดเรียบหรู",
        paymentStatus: "paid",
        paymentSlipUrl: "https://images.unsplash.com/photo-1580048915913-4f8f5cb481c4?w=600&auto=format&fit=crop&q=80",
        calendarEventId: "",
        lineUserId: "U1234567890abcdef",
        lineDisplayName: "Waranya S."
      },
      {
        id: "BK-SAMPLE-02",
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        status: "confirmed",
        date: today,
        time: "15:00",
        serviceId: "srv-facial",
        serviceName: "ทรีตเมนต์บำรุงผิวหน้าออร์แกนิก (Organic Facial Glow)",
        servicePrice: 1590,
        serviceDuration: 90,
        staffId: "stf-linda",
        staffName: "ลินดา (Linda)",
        customerName: "คุณธนภัทร รัตนเวช",
        customerPhone: "089-876-5432",
        customerEmail: "thanapat@example.com",
        specialRequest: "ผิวแพ้ง่ายเป็นพิเศษ",
        paymentStatus: "paid",
        paymentSlipUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80",
        calendarEventId: "",
        lineUserId: "U0987654321fedcba",
        lineDisplayName: "Thanapat R."
      }
    ],
    customers: [
      {
        customerPhone: "081-234-5678",
        customerName: "คุณวรัญญา สิทธิสาร",
        customerEmail: "waranya@example.com",
        totalBookings: 1,
        totalSpent: 790,
        lastVisitDate: today,
        lineUserId: "U1234567890abcdef"
      },
      {
        customerPhone: "089-876-5432",
        customerName: "คุณธนภัทร รัตนเวช",
        customerEmail: "thanapat@example.com",
        totalBookings: 1,
        totalSpent: 1590,
        lastVisitDate: today,
        lineUserId: "U0987654321fedcba"
      }
    ],
    settings: {
      adminPin: "1234",
      ownerEmail: "NatapongMumklang@gmail.com",
      promptPayNumber: "0812345678",
      shopName: "The Bloom Studio",
      serverWebhookUrl: "",
      gasWebAppUrl: "",
      googleSheetUrl: "",
      googleDriveFolderUrl: "",
      googleDriveFolderId: "",
      googleCalendarId: "primary"
    }
  };
}

// In-memory cache synced with data/database.json
let db = getInitialDatabase();

function loadDatabase() {
  try {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (fs.existsSync(DB_PATH)) {
      const content = fs.readFileSync(DB_PATH, "utf-8");
      const parsed = JSON.parse(content);
      db = {
        services: parsed.services || [],
        staff: parsed.staff || [],
        bookings: parsed.bookings || [],
        customers: parsed.customers || [],
        settings: {
          adminPin: "1234",
          ownerEmail: "NatapongMumklang@gmail.com",
          promptPayNumber: "0812345678",
          shopName: "The Bloom Studio",
          serverWebhookUrl: "",
          gasWebAppUrl: "",
          googleSheetUrl: "",
          googleDriveFolderUrl: "",
          googleDriveFolderId: "",
          googleCalendarId: "primary",
          ...(parsed.settings || {})
        }
      };
    } else {
      saveDatabase();
    }
    sanitizeDatabase(db);
  } catch (err) {
    console.error("[Database] Error loading database.json:", err);
  }
}

// Data Sanitization & Deduplication Helper
function sanitizeDatabase(targetDb) {
  if (!targetDb) return targetDb;

  // 1. Deduplicate Bookings
  if (Array.isArray(targetDb.bookings)) {
    const seenBookingIds = new Set();
    const cleanBookings = [];
    targetDb.bookings.forEach((b, idx) => {
      let bId = b.id || b.ID;
      if (!bId || seenBookingIds.has(bId)) {
        bId = `BK-${Date.now().toString(36).toUpperCase()}-${idx}`;
      }
      seenBookingIds.add(bId);
      cleanBookings.push({ ...b, id: bId });
    });
    targetDb.bookings = cleanBookings;
  }

  // 2. Deduplicate Staff
  if (Array.isArray(targetDb.staff)) {
    const seenStaffIds = new Set();
    const cleanStaff = [];
    targetDb.staff.forEach((st, idx) => {
      let sId = st.id || st.ID;
      if (!sId || seenStaffIds.has(sId)) {
        const slug = (st.nickname || st.Nickname || st.name || "staff")
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "");
        sId = `stf-${slug || idx}`;
        if (seenStaffIds.has(sId)) {
          sId = `${sId}-${idx}`;
        }
      }
      seenStaffIds.add(sId);
      cleanStaff.push({ ...st, id: sId });
    });
    targetDb.staff = cleanStaff;
  }

  // 3. Deduplicate Services
  if (Array.isArray(targetDb.services)) {
    const seenSrvIds = new Set();
    const cleanServices = [];
    targetDb.services.forEach((s, idx) => {
      let sId = s.id || s.ID;
      if (!sId || seenSrvIds.has(sId)) {
        sId = `srv-${Date.now().toString(36)}-${idx}`;
      }
      seenSrvIds.add(sId);
      cleanServices.push({ ...s, id: sId });
    });
    targetDb.services = cleanServices;
  }

  // 4. Clean Customers
  if (Array.isArray(targetDb.customers)) {
    const seenPhones = new Set();
    const cleanCustomers = [];
    targetDb.customers.forEach((c) => {
      const phone = formatGasPhone(c.customerPhone || c["Customer Phone"]);
      if (phone && !seenPhones.has(phone)) {
        seenPhones.add(phone);
        cleanCustomers.push({
          customerPhone: phone,
          customerName: c.customerName || c["Customer Name"] || "",
          customerEmail: c.customerEmail || c["Customer Email"] || "",
          totalBookings: parseInt(c.totalBookings || c["Total Bookings"], 10) || 1,
          totalSpent: parseFloat(c.totalSpent || c["Total Spent (THB)"]) || 0,
          lastVisitDate: formatGasDate(c.lastVisitDate || c["Last Visit Date"]),
          lineUserId: c.lineUserId || c["LINE User ID"] || ""
        });
      }
    });
    targetDb.customers = cleanCustomers;
  }

  return targetDb;
}

function saveDatabase() {
  try {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    sanitizeDatabase(db);
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
  } catch (err) {
    console.error("[Database] Error saving database.json:", err);
  }
}

// Initial DB load & sanitization
loadDatabase();

// Standard daily time slots
const ALL_TIME_SLOTS = [
  "10:00", "11:00", "12:00", "13:00", "14:00",
  "15:00", "16:00", "17:00", "18:00", "19:00"
];

// Formatting helpers for Google Apps Script data
function formatGasDate(val) {
  if (!val) return "";
  if (typeof val === "string") {
    if (val.includes("T")) {
      return val.split("T")[0];
    }
    return val.trim();
  }
  return String(val).trim();
}

function formatGasTime(val) {
  if (!val) return "10:00";
  if (typeof val === "string") {
    if (val.includes("T")) {
      const d = new Date(val);
      if (!isNaN(d.getTime())) {
        const hours = String((d.getUTCHours() + 7) % 24).padStart(2, "0");
        const minutes = String(d.getUTCMinutes()).padStart(2, "0");
        return `${hours}:${minutes}`;
      }
    }
    const match = val.match(/\b\d{1,2}:\d{2}\b/);
    if (match) return match[0].padStart(5, "0");
    return val.trim();
  }
  return String(val).trim();
}

function formatGasPhone(val) {
  if (!val) return "";
  let str = String(val).trim();
  if (str.length === 9 && !str.startsWith("0")) {
    str = "0" + str;
  }
  return str;
}

// Status tracking for real-time GAS sync
let lastGasSync = {
  timestamp: null,
  success: false,
  message: "ระบบเชื่อมต่อ Google Sheet อัตโนมัติพร้อมทำงาน",
  action: null
};

// Helper: sync booking to Google Apps Script Web App asynchronously & update Calendar
async function syncBookingToGas(booking) {
  if (!db.settings.gasWebAppUrl) return;
  try {
    const url = db.settings.gasWebAppUrl.trim();
    if (!url.startsWith("http")) return;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "addBooking",
        booking
      }),
      redirect: "follow"
    });
    const text = await res.text();
    try {
      const json = JSON.parse(text);
      if (json.success) {
        lastGasSync = {
          timestamp: new Date().toISOString(),
          success: true,
          message: `เพิ่มการจอง ${booking.id} ลง Google Sheet และ Calendar สำเร็จ`,
          action: "addBooking"
        };
        console.log(`[GAS Sync] Auto-synced booking ${booking.id} to Google Apps Script`);
        if (json.calendarEventId) {
          const b = db.bookings.find(x => x.id === booking.id);
          if (b) {
            b.calendarEventId = json.calendarEventId;
            saveDatabase();
          }
        }
      }
    } catch (e) {}
  } catch (err) {
    console.warn(`[GAS Sync] Warning syncing booking to GAS:`, err.message);
  }
}

// Helper: sync status change to Google Apps Script Web App
async function syncStatusToGas(bookingId, status, updates = {}) {
  if (!db.settings.gasWebAppUrl) return;
  try {
    const url = db.settings.gasWebAppUrl.trim();
    if (!url.startsWith("http")) return;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "updateBookingStatus",
        bookingId,
        status,
        updates
      }),
      redirect: "follow"
    });
    const text = await res.text();
    try {
      const json = JSON.parse(text);
      if (json.success) {
        lastGasSync = {
          timestamp: new Date().toISOString(),
          success: true,
          message: `อัปเดตสถานะ ${bookingId} เป็น ${status} ใน Google Sheet สำเร็จ`,
          action: "updateBookingStatus"
        };
        console.log(`[GAS Sync] Updated status for ${bookingId} to ${status}`);
      }
    } catch (e) {}
  } catch (err) {
    console.warn(`[GAS Sync] Warning updating status in GAS:`, err.message);
  }
}

// Helper: sync delete booking to Google Apps Script Web App & Google Calendar
async function syncDeleteToGas(bookingId) {
  if (!db.settings.gasWebAppUrl) return;
  try {
    const url = db.settings.gasWebAppUrl.trim();
    if (!url.startsWith("http")) return;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "deleteBooking",
        bookingId
      }),
      redirect: "follow"
    });
    const text = await res.text();
    try {
      const json = JSON.parse(text);
      if (json.success) {
        lastGasSync = {
          timestamp: new Date().toISOString(),
          success: true,
          message: `ลบรายการ ${bookingId} ออกจาก Google Sheet และ Calendar สำเร็จ`,
          action: "deleteBooking"
        };
        console.log(`[GAS Sync] Deleted booking ${bookingId} from Google Apps Script`);
      }
    } catch (e) {}
  } catch (err) {
    console.warn(`[GAS Sync] Warning deleting booking from GAS:`, err.message);
  }
}

// Helper: full automatic synchronization to Google Sheet (5 tabs)
async function autoSyncToGas() {
  if (!db.settings.gasWebAppUrl) return;
  const url = db.settings.gasWebAppUrl.trim();
  if (!url.startsWith("http")) return;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "pushAll",
        data: db
      }),
      redirect: "follow"
    });
    const text = await res.text();
    try {
      const json = JSON.parse(text);
      if (json.success) {
        lastGasSync = {
          timestamp: new Date().toISOString(),
          success: true,
          message: "ซิงค์ข้อมูลทั้ง 5 แท็บขึ้น Google Sheet อัตโนมัติสำเร็จ",
          action: "pushAll"
        };
        console.log("[GAS Auto-Sync] Pushed latest data to Google Sheet successfully");
      } else {
        lastGasSync = {
          timestamp: new Date().toISOString(),
          success: false,
          message: json.message || json.error || "GAS returned warning",
          action: "pushAll"
        };
      }
    } catch (e) {
      if (text.includes("<!DOCTYPE") || text.includes("<html")) {
        lastGasSync = {
          timestamp: new Date().toISOString(),
          success: false,
          message: "GAS ต้องการสิทธิ์: ตั้งค่า Execute as: Me และ Who has access: Anyone",
          action: "pushAll"
        };
      }
    }
  } catch (err) {
    console.warn("[GAS Auto-Sync] Error triggering sync:", err.message);
  }
}

// Helper: Automatically pull latest data from Google Apps Script to Server Database
async function pullFromGas(isBackground = false) {
  if (!db.settings.gasWebAppUrl) return null;
  const url = db.settings.gasWebAppUrl.trim();
  if (!url.startsWith("http")) return null;

  try {
    const pullUrl = url + (url.includes("?") ? "&" : "?") + "action=pullAll";
    const response = await fetch(pullUrl, {
      method: "GET",
      redirect: "follow"
    });
    const result = await response.json();
    if (result && result.data) {
      // Auto-update sheetUrl if discovered
      if (result.sheetUrl && !db.settings.googleSheetUrl) {
        db.settings.googleSheetUrl = result.sheetUrl;
      }
      if (result.driveFolderUrl && !db.settings.googleDriveFolderUrl) {
        db.settings.googleDriveFolderUrl = result.driveFolderUrl;
      }

      // Format & deduplicate pulled bookings
      if (Array.isArray(result.data.bookings) && result.data.bookings.length > 0) {
        const seenBIds = new Set();
        const pulledBookings = [];
        result.data.bookings.forEach((b, idx) => {
          let bId = b.ID || b.id;
          if (!bId || seenBIds.has(bId)) {
            bId = `BK-${Date.now().toString(36).toUpperCase()}-${idx}`;
          }
          seenBIds.add(bId);
          pulledBookings.push({
            id: bId,
            createdAt: b.CreatedAt || b.createdAt || new Date().toISOString(),
            status: b.Status || b.status || "pending",
            date: formatGasDate(b.Date || b.date),
            time: formatGasTime(b.Time || b.time),
            serviceId: b.ServiceId || b.serviceId || "",
            serviceName: b.ServiceName || b.serviceName || "",
            servicePrice: parseFloat(b.ServicePrice || b.servicePrice) || 0,
            serviceDuration: parseInt(b.ServiceDuration || b.serviceDuration, 10) || 60,
            staffId: b.StaffId || b.staffId || "",
            staffName: b.StaffName || b.staffName || "",
            customerName: b.CustomerName || b.customerName || "",
            customerPhone: formatGasPhone(b.CustomerPhone || b.customerPhone),
            customerEmail: b.CustomerEmail || b.customerEmail || "",
            specialRequest: b.SpecialRequest || b.specialRequest || "",
            paymentStatus: b.PaymentStatus || b.paymentStatus || "pending",
            paymentSlipUrl: b.PaymentSlipUrl || b.paymentSlipUrl || "",
            calendarEventId: b.CalendarEventId || b.calendarEventId || "",
            lineUserId: b.LineUserId || b.lineUserId || "",
            lineDisplayName: b.LineDisplayName || b.lineDisplayName || ""
          });
        });
        db.bookings = pulledBookings;
      }

      // Format & deduplicate services
      if (Array.isArray(result.data.services) && result.data.services.length > 0) {
        const seenSrv = new Set();
        const pulledServices = [];
        result.data.services.forEach((s, idx) => {
          let sId = s.ID || s.id;
          if (!sId || seenSrv.has(sId)) {
            sId = `srv-${Date.now().toString(36)}-${idx}`;
          }
          seenSrv.add(sId);
          pulledServices.push({
            id: sId,
            name: s.Name || s.name || "",
            category: s.Category || s.category || "General",
            price: parseFloat(s.Price || s.price) || 0,
            duration: parseInt(s.DurationMinutes || s.duration, 10) || 60,
            description: s.Description || s.description || "",
            icon: s.Icon || s.icon || "Sparkles"
          });
        });
        db.services = pulledServices;
      }

      // Format & deduplicate staff
      if (Array.isArray(result.data.staff) && result.data.staff.length > 0) {
        const seenStaff = new Set();
        const pulledStaff = [];
        result.data.staff.forEach((st, idx) => {
          let stId = st.ID || st.id;
          if (!stId || seenStaff.has(stId)) {
            const nick = (st.Nickname || st.Name || "staff").toLowerCase().replace(/[^a-z0-9]/g, "");
            stId = `stf-${nick || idx}`;
            if (seenStaff.has(stId)) {
              stId = `${stId}-${idx}`;
            }
          }
          seenStaff.add(stId);
          pulledStaff.push({
            id: stId,
            name: st.Name || st.name || "",
            nickname: st.Nickname || st.nickname || st.Name || "",
            role: st.Role || st.role || "Therapist",
            experience: st.Experience || st.experience || "",
            rating: parseFloat(st.Rating || st.rating) || 5.0,
            avatar: st.Avatar || st.avatar || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300",
            skills: typeof st.Services === "string" ? st.Services.split(",").map(x => x.trim()) : (st.skills || []),
            bio: st.Bio || st.bio || ""
          });
        });
        db.staff = pulledStaff;
      }

      // Format customers
      if (Array.isArray(result.data.customers) && result.data.customers.length > 0) {
        const seenPhone = new Set();
        const pulledCustomers = [];
        result.data.customers.forEach((c) => {
          const phone = formatGasPhone(c["Customer Phone"] || c.customerPhone);
          if (phone && !seenPhone.has(phone)) {
            seenPhone.add(phone);
            pulledCustomers.push({
              customerPhone: phone,
              customerName: c["Customer Name"] || c.customerName || "",
              customerEmail: c["Customer Email"] || c.customerEmail || "",
              totalBookings: parseInt(c["Total Bookings"] || c.totalBookings, 10) || 1,
              totalSpent: parseFloat(c["Total Spent (THB)"] || c.totalSpent) || 0,
              lastVisitDate: formatGasDate(c["Last Visit Date"] || c.lastVisitDate),
              lineUserId: c["LINE User ID"] || c.lineUserId || ""
            });
          }
        });
        db.customers = pulledCustomers;
      }

      sanitizeDatabase(db);
      saveDatabase();

      lastGasSync = {
        timestamp: new Date().toISOString(),
        success: true,
        message: "เชื่อมต่อและซิงค์ข้อมูลกับ Google Sheet อัตโนมัติสำเร็จ",
        action: "pullAll"
      };

      if (!isBackground) {
        console.log("[Auto-Sync] Pulled latest data from Google Sheet successfully");
      }
      return db;
    }
  } catch (err) {
    if (!isBackground) {
      console.warn("[Auto-Sync] Warning pulling data from GAS:", err.message);
    }
  }
  return null;
}

// ==========================================
// Express Application Setup
// ==========================================

async function startServer() {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: "15mb" }));

  // API Health Check
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      app: "The Bloom Studio Booking Server",
      timestamp: new Date().toISOString()
    });
  });

  // ==========================================
  // Client Storefront Endpoints
  // ==========================================

  // 1. GET /api/services
  app.get("/api/services", (req, res) => {
    loadDatabase();
    res.json({
      success: true,
      data: db.services
    });
  });

  // 2. GET /api/staff?serviceId=
  app.get("/api/staff", (req, res) => {
    loadDatabase();
    const { serviceId } = req.query;
    if (serviceId) {
      const filteredStaff = db.staff.filter((s) => s.skills && s.skills.includes(serviceId));
      return res.json({
        success: true,
        data: filteredStaff
      });
    }
    res.json({
      success: true,
      data: db.staff
    });
  });

  // 3. GET /api/availability?staffId=&date=
  app.get("/api/availability", (req, res) => {
    loadDatabase();
    const { staffId, date } = req.query;

    if (!staffId || !date) {
      return res.status(400).json({
        success: false,
        message: "กรุณาระบุ staffId และ date (YYYY-MM-DD)"
      });
    }

    const bookedTimes = db.bookings
      .filter((b) => b.staffId === staffId && b.date === date && b.status !== "cancelled")
      .map((b) => b.time);

    const availableSlots = ALL_TIME_SLOTS.filter((slot) => !bookedTimes.includes(slot));

    res.json({
      success: true,
      staffId,
      date,
      allSlots: ALL_TIME_SLOTS,
      bookedSlots: bookedTimes,
      availableSlots
    });
  });

  // 4. POST /api/bookings
  app.post("/api/bookings", (req, res) => {
    loadDatabase();
    const {
      serviceId,
      staffId,
      date,
      time,
      customerName,
      customerPhone,
      customerEmail,
      specialRequest,
      paymentSlipUrl,
      lineUserId,
      lineDisplayName
    } = req.body;

    if (!serviceId || !staffId || !date || !time || !customerName || !customerPhone) {
      return res.status(400).json({
        success: false,
        message: "กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน (บริการ, ช่าง, วัน, เวลา, ชื่อ-นามสกุล, เบอร์โทรศัพท์)"
      });
    }

    // LINE Login is optional: Save lineUserId if available, otherwise proceed seamlessly
    const finalLineUserId = lineUserId && String(lineUserId).trim() ? String(lineUserId).trim() : null;
    const finalLineDisplayName = lineDisplayName && String(lineDisplayName).trim() ? String(lineDisplayName).trim() : customerName.trim();

    const selectedService = db.services.find((s) => s.id === serviceId);
    if (!selectedService) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบบริการที่เลือก"
      });
    }

    const selectedStaff = db.staff.find((st) => st.id === staffId);
    if (!selectedStaff) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบช่างที่เลือก"
      });
    }

    if (selectedStaff.skills && !selectedStaff.skills.includes(serviceId)) {
      return res.status(400).json({
        success: false,
        message: `ช่าง ${selectedStaff.name} ไม่รองรับบริการ ${selectedService.name}`
      });
    }

    // Double-booking check
    const isConflict = db.bookings.some(
      (b) =>
        b.staffId === staffId &&
        b.date === date &&
        b.time === time &&
        b.status !== "cancelled"
    );

    if (isConflict) {
      return res.status(409).json({
        success: false,
        message: `ขออภัย ช่วงเวลา ${time} วันที่ ${date} ของ ${selectedStaff.name} มีการจองแล้ว กรุณาเลือกช่วงเวลาอื่น`
      });
    }

    const id = `BK-${Date.now().toString(36).toUpperCase()}-${Math.random()
      .toString(36)
      .substring(2, 6)
      .toUpperCase()}`;
    const createdAt = new Date().toISOString();

    const newBooking = {
      id,
      serviceId,
      serviceName: selectedService.name,
      serviceDuration: selectedService.duration || 60,
      servicePrice: selectedService.price || 0,
      staffId,
      staffName: selectedStaff.name,
      staffAvatar: selectedStaff.avatar || "",
      date,
      time,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail ? customerEmail.trim() : "",
      specialRequest: specialRequest ? specialRequest.trim() : "",
      paymentStatus: paymentSlipUrl ? "paid" : "pending",
      paymentSlipUrl: paymentSlipUrl || "",
      calendarEventId: "",
      lineUserId: finalLineUserId,
      lineDisplayName: finalLineDisplayName,
      createdAt,
      status: "pending"
    };

    db.bookings.unshift(newBooking);

    // Update Customers CRM table in database
    const cleanPhone = customerPhone.trim();
    const existingCustomerIndex = db.customers.findIndex((c) => c.customerPhone === cleanPhone);
    if (existingCustomerIndex >= 0) {
      const c = db.customers[existingCustomerIndex];
      c.totalBookings = (c.totalBookings || 0) + 1;
      c.totalSpent = (c.totalSpent || 0) + (selectedService.price || 0);
      c.lastVisitDate = date;
      if (finalLineUserId) c.lineUserId = finalLineUserId;
      if (customerEmail) c.customerEmail = customerEmail.trim();
    } else {
      db.customers.push({
        customerPhone: cleanPhone,
        customerName: customerName.trim(),
        customerEmail: customerEmail ? customerEmail.trim() : "",
        totalBookings: 1,
        totalSpent: selectedService.price || 0,
        lastVisitDate: date,
        lineUserId: finalLineUserId || ""
      });
    }

    saveDatabase();

    // Async sync with Google Apps Script
    syncBookingToGas(newBooking);
    autoSyncToGas();

    return res.status(201).json({
      success: true,
      message: "จองคิวสำเร็จเรียบร้อยแล้ว",
      booking: newBooking
    });
  });

  // 5. GET /api/bookings - Strict Customer Privacy & Isolation
  app.get("/api/bookings", (req, res) => {
    loadDatabase();
    const { lineUserId, phone } = req.query;

    // Strict Customer Privacy: If no customer identifier is provided from customer front,
    // do not return any other customer's bookings!
    if (!lineUserId && !phone) {
      return res.json({
        success: true,
        count: 0,
        data: []
      });
    }

    const cleanPhone = phone ? String(phone).replace(/\D/g, "") : "";
    const filtered = db.bookings.filter((b) => {
      if (lineUserId && b.lineUserId && String(b.lineUserId) === String(lineUserId)) {
        return true;
      }
      if (cleanPhone && b.customerPhone) {
        const bPhone = String(b.customerPhone).replace(/\D/g, "");
        if (bPhone && bPhone === cleanPhone) {
          return true;
        }
      }
      return false;
    });

    res.json({
      success: true,
      count: filtered.length,
      data: filtered
    });
  });

  // 6. GET /api/customers/profile - Auto-Fill & Smart User Memory
  app.get("/api/customers/profile", (req, res) => {
    loadDatabase();
    const { lineUserId, phone } = req.query;
    if (!lineUserId && !phone) {
      return res.status(400).json({
        success: false,
        message: "กรุณาระบุ lineUserId หรือ phone"
      });
    }

    let customer = null;
    if (lineUserId) {
      customer = db.customers.find((c) => c.lineUserId === lineUserId);
      if (!customer) {
        const recent = db.bookings.find((b) => b.lineUserId === lineUserId);
        if (recent) {
          customer = {
            customerName: recent.customerName,
            customerPhone: recent.customerPhone,
            customerEmail: recent.customerEmail,
            lineUserId: recent.lineUserId
          };
        }
      }
    }

    if (!customer && phone) {
      const cleanPhone = String(phone).replace(/\D/g, "");
      customer = db.customers.find((c) => String(c.customerPhone).replace(/\D/g, "") === cleanPhone);
      if (!customer) {
        const recent = db.bookings.find((b) => String(b.customerPhone).replace(/\D/g, "") === cleanPhone);
        if (recent) {
          customer = {
            customerName: recent.customerName,
            customerPhone: recent.customerPhone,
            customerEmail: recent.customerEmail,
            lineUserId: recent.lineUserId
          };
        }
      }
    }

    res.json({
      success: true,
      data: customer || null
    });
  });

  // ==========================================
  // Admin Backend & Management Endpoints
  // ==========================================

  // Admin Login PIN verification
  app.post("/api/admin/login", (req, res) => {
    loadDatabase();
    const { pin } = req.body;
    const correctPin = (db.settings.adminPin || "1234").trim();

    if (String(pin).trim() === correctPin) {
      return res.json({
        success: true,
        message: "ยืนยันรหัส PIN ถูกต้อง ยินดีต้อนรับสู่ระบบผู้ดูแล The Bloom Studio",
        token: "bloom_admin_" + Date.now().toString(36)
      });
    }

    return res.status(401).json({
      success: false,
      message: "รหัส PIN ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง"
    });
  });

  // Get full database for Admin
  app.get("/api/admin/db", (req, res) => {
    loadDatabase();
    res.json({
      success: true,
      data: db,
      services: db.services || [],
      staff: db.staff || [],
      bookings: db.bookings || [],
      customers: db.customers || [],
      settings: db.settings || {}
    });
  });

  // Get Settings for Admin
  app.get("/api/admin/settings", (req, res) => {
    loadDatabase();
    res.json({
      success: true,
      data: db.settings || {}
    });
  });

  // Update Settings (Supports both PUT and POST)
  const handleUpdateSettings = (req, res) => {
    loadDatabase();
    const updated = req.body || {};
    db.settings = {
      ...db.settings,
      ...updated
    };
    saveDatabase();
    autoSyncToGas();
    res.json({
      success: true,
      message: "บันทึกการตั้งค่าร้านสำเร็จเรียบร้อย",
      data: db.settings
    });
  };
  app.post("/api/admin/settings", handleUpdateSettings);
  app.put("/api/admin/settings", handleUpdateSettings);

  // Admin Create Manual Booking
  app.post("/api/admin/bookings", (req, res) => {
    loadDatabase();
    const {
      serviceId,
      staffId,
      date,
      time,
      customerName,
      customerPhone,
      customerEmail,
      specialRequest,
      status,
      paymentStatus,
      paymentSlipUrl
    } = req.body;

    if (!serviceId || !staffId || !date || !time || !customerName || !customerPhone) {
      return res.status(400).json({
        success: false,
        message: "กรุณาระบุข้อมูลที่จำเป็น (บริการ, ช่าง, วัน, เวลา, ชื่อลูกค้า, เบอร์โทร)"
      });
    }

    const selectedService = db.services.find((s) => s.id === serviceId);
    const selectedStaff = db.staff.find((st) => st.id === staffId);

    const id = `BK-ADMIN-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const createdAt = new Date().toISOString();

    const newBooking = {
      id,
      serviceId,
      serviceName: selectedService ? selectedService.name : "บริการความงาม",
      serviceDuration: selectedService ? selectedService.duration : 60,
      servicePrice: selectedService ? selectedService.price : 0,
      staffId,
      staffName: selectedStaff ? selectedStaff.name : "ช่างผู้เชี่ยวชาญ",
      staffAvatar: selectedStaff ? (selectedStaff.avatar || "") : "",
      date,
      time,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail ? customerEmail.trim() : "",
      specialRequest: specialRequest ? specialRequest.trim() : "",
      paymentStatus: paymentStatus || (paymentSlipUrl ? "paid" : "pending"),
      paymentSlipUrl: paymentSlipUrl || "",
      calendarEventId: "",
      lineUserId: null,
      lineDisplayName: null,
      createdAt,
      status: status || "confirmed"
    };

    db.bookings.unshift(newBooking);

    // Update Customer CRM
    const cleanPhone = customerPhone.trim();
    const existingCustomerIndex = db.customers.findIndex((c) => c.customerPhone === cleanPhone);
    if (existingCustomerIndex >= 0) {
      const c = db.customers[existingCustomerIndex];
      c.totalBookings = (c.totalBookings || 0) + 1;
      c.totalSpent = (c.totalSpent || 0) + (selectedService ? selectedService.price : 0);
      c.lastVisitDate = date;
      if (customerEmail) c.customerEmail = customerEmail.trim();
    } else {
      db.customers.push({
        customerPhone: cleanPhone,
        customerName: customerName.trim(),
        customerEmail: customerEmail ? customerEmail.trim() : "",
        totalBookings: 1,
        totalSpent: selectedService ? selectedService.price : 0,
        lastVisitDate: date,
        lineUserId: ""
      });
    }

    saveDatabase();
    syncBookingToGas(newBooking);
    autoSyncToGas();

    res.status(201).json({
      success: true,
      message: "สร้างรายการจองโดยแอดมินสำเร็จ",
      booking: newBooking
    });
  });

  // Change Booking Status
  app.patch("/api/admin/bookings/:id/status", (req, res) => {
    loadDatabase();
    const { id } = req.params;
    const { status, paymentStatus, paymentSlipUrl } = req.body;

    const booking = db.bookings.find((b) => b.id === id);
    if (!booking) {
      return res.status(404).json({ success: false, message: "ไม่พบรายการจองนี้" });
    }

    if (status) booking.status = status;
    if (paymentStatus) booking.paymentStatus = paymentStatus;
    if (paymentSlipUrl !== undefined) booking.paymentSlipUrl = paymentSlipUrl;

    saveDatabase();

    // Async sync to GAS
    if (status) {
      syncStatusToGas(id, status);
    }
    autoSyncToGas();

    res.json({
      success: true,
      message: "อัปเดตสถานะคิวจองสำเร็จ",
      data: booking
    });
  });

  // Delete Booking
  app.delete("/api/admin/bookings/:id", (req, res) => {
    loadDatabase();
    const { id } = req.params;
    const initialLen = db.bookings.length;
    db.bookings = db.bookings.filter((b) => b.id !== id);

    if (db.bookings.length === initialLen) {
      return res.status(404).json({ success: false, message: "ไม่พบรายการจองนี้" });
    }

    saveDatabase();
    syncDeleteToGas(id);
    autoSyncToGas();
    res.json({
      success: true,
      message: "ลบรายการจองสำเร็จเรียบร้อย"
    });
  });

  // Create Service
  app.post("/api/admin/services", (req, res) => {
    loadDatabase();
    const { name, category, price, duration, description, icon } = req.body;
    if (!name || !price) {
      return res.status(400).json({ success: false, message: "กรุณาระบุชื่อบริการและราคา" });
    }

    const newService = {
      id: "srv-" + Date.now().toString(36),
      name: name.trim(),
      category: category ? category.trim() : "General",
      duration: parseInt(duration, 10) || 60,
      price: parseFloat(price) || 0,
      description: description ? description.trim() : "",
      icon: icon || "Sparkles"
    };

    db.services.push(newService);
    saveDatabase();
    autoSyncToGas();

    res.status(201).json({
      success: true,
      message: "เพิ่มบริการใหม่สำเร็จ",
      data: newService
    });
  });

  // Update Service
  app.put("/api/admin/services/:id", (req, res) => {
    loadDatabase();
    const { id } = req.params;
    const idx = db.services.findIndex((s) => s.id === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: "ไม่พบบริการที่ต้องการแก้ไข" });
    }

    db.services[idx] = {
      ...db.services[idx],
      ...req.body,
      duration: req.body.duration ? parseInt(req.body.duration, 10) : db.services[idx].duration,
      price: req.body.price ? parseFloat(req.body.price) : db.services[idx].price
    };

    saveDatabase();
    autoSyncToGas();
    res.json({
      success: true,
      message: "อัปเดตข้อมูลบริการสำเร็จ",
      data: db.services[idx]
    });
  });

  // Delete Service
  app.delete("/api/admin/services/:id", (req, res) => {
    loadDatabase();
    const { id } = req.params;
    db.services = db.services.filter((s) => s.id !== id);
    saveDatabase();
    autoSyncToGas();
    res.json({
      success: true,
      message: "ลบบริการสำเร็จ"
    });
  });

  // Create Staff
  app.post("/api/admin/staff", (req, res) => {
    loadDatabase();
    const { name, nickname, role, experience, rating, avatar, skills, bio } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: "กรุณาระบุชื่อช่าง" });
    }

    const newStaff = {
      id: "stf-" + Date.now().toString(36),
      name: name.trim(),
      nickname: nickname ? nickname.trim() : name.trim(),
      role: role ? role.trim() : "Therapist",
      experience: experience ? experience.trim() : "ประสบการณ์ 3 ปี",
      rating: parseFloat(rating) || 5.0,
      avatar: avatar && avatar.trim() ? avatar.trim() : "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300",
      skills: Array.isArray(skills) ? skills : (skills ? skills.split(",").map(s => s.trim()) : []),
      bio: bio ? bio.trim() : ""
    };

    db.staff.push(newStaff);
    saveDatabase();
    autoSyncToGas();

    res.status(201).json({
      success: true,
      message: "เพิ่มช่างผู้เชี่ยวชาญสำเร็จ",
      data: newStaff
    });
  });

  // Update Staff
  app.put("/api/admin/staff/:id", (req, res) => {
    loadDatabase();
    const { id } = req.params;
    const idx = db.staff.findIndex((st) => st.id === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: "ไม่พบรายชื่อช่างนี้" });
    }

    db.staff[idx] = {
      ...db.staff[idx],
      ...req.body,
      skills: Array.isArray(req.body.skills)
        ? req.body.skills
        : (req.body.skills ? req.body.skills.split(",").map(s => s.trim()) : db.staff[idx].skills)
    };

    saveDatabase();
    autoSyncToGas();
    res.json({
      success: true,
      message: "อัปเดตข้อมูลช่างสำเร็จ",
      data: db.staff[idx]
    });
  });

  // Delete Staff
  app.delete("/api/admin/staff/:id", (req, res) => {
    loadDatabase();
    const { id } = req.params;
    db.staff = db.staff.filter((s) => s.id !== id);
    saveDatabase();
    autoSyncToGas();
    res.json({
      success: true,
      message: "ลบรายชื่อช่างสำเร็จ"
    });
  });

  // ==========================================
  // Google Apps Script Sync Endpoints
  // ==========================================

  // Helper to extract GAS url from request or saved settings
  const getGasUrl = (req) => {
    const raw = req.body?.url || req.body?.webAppUrl || db.settings?.gasWebAppUrl;
    if (!raw || typeof raw !== "string") return null;
    const trimmed = raw.trim();
    return trimmed.startsWith("http") ? trimmed : null;
  };

  // Test GAS Connection
  app.post("/api/admin/gas/test", async (req, res) => {
    loadDatabase();
    const url = getGasUrl(req);
    if (!url) {
      return res.status(400).json({
        success: false,
        message: "กรุณาระบุ Google Apps Script Web App URL ที่ถูกต้อง (ขึ้นต้นด้วย https://script.google.com/...)"
      });
    }

    // Auto-save to settings if changed
    if (db.settings.gasWebAppUrl !== url) {
      db.settings.gasWebAppUrl = url;
      saveDatabase();
    }

    try {
      const pingUrl = url + (url.includes("?") ? "&" : "?") + "action=ping";
      const response = await fetch(pingUrl, {
        method: "GET",
        redirect: "follow"
      });
      const data = await response.json().catch(async () => {
        return { message: "Connected (non-JSON response received)" };
      });
      return res.json({
        success: true,
        message: "เชื่อมต่อกับ Google Apps Script Web App สำเร็จ 100%!",
        details: data
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "ไม่สามารถเชื่อมต่อกับ Google Apps Script Web App ได้: " + err.message
      });
    }
  });

  // 1-Click Setup Sheets on Google
  app.post("/api/admin/gas/setup", async (req, res) => {
    loadDatabase();
    const url = getGasUrl(req);
    if (!url) {
      return res.status(400).json({
        success: false,
        message: "กรุณาระบุและบันทึก Google Apps Script Web App URL ก่อน"
      });
    }

    // Auto-save to settings if changed
    if (db.settings.gasWebAppUrl !== url) {
      db.settings.gasWebAppUrl = url;
      saveDatabase();
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "setup" }),
        redirect: "follow"
      });
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        if (text.includes("Sorry, unable to open the file at present") || text.includes("Page not found") || text.includes("<!DOCTYPE") || text.includes("<html")) {
          return res.status(400).json({
            success: false,
            message: "Google Apps Script แจ้งเตือนเรื่องสิทธิ์การเข้าถึง: โปรดตรวจสอบการตั้งค่า Deploy ใน Apps Script: ให้ตั้ง 'Execute as' เป็น 'Me (อีเมลของคุณ)' และ 'Who has access' เป็น 'Anyone (ทุกคน)'",
            htmlError: true
          });
        }
        return res.status(500).json({
          success: false,
          message: "ไม่สามารถแปลงข้อมูลการตอบกลับจาก Google: " + text.slice(0, 150)
        });
      }

      // If drive folder URL returned, update settings
      if (data && data.driveFolderUrl) {
        db.settings.googleDriveFolderUrl = data.driveFolderUrl;
        saveDatabase();
      }

      return res.json({
        success: true,
        message: data.message || "สร้าง 5 แท็บใน Google Sheet และขอสิทธิ์ Google Workspace สำเร็จ!",
        details: data
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "เกิดข้อผิดพลาดในการสร้างชีต: " + err.message
      });
    }
  });

  // Push all server data to Google Sheet
  app.post("/api/admin/gas/push", async (req, res) => {
    loadDatabase();
    const url = getGasUrl(req);
    if (!url) {
      return res.status(400).json({
        success: false,
        message: "กรุณาระบุและบันทึก Google Apps Script Web App URL ก่อน"
      });
    }

    if (db.settings.gasWebAppUrl !== url) {
      db.settings.gasWebAppUrl = url;
      saveDatabase();
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "pushAll",
          data: db
        }),
        redirect: "follow"
      });
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        if (text.includes("Sorry, unable to open the file at present") || text.includes("Page not found") || text.includes("<!DOCTYPE") || text.includes("<html")) {
          return res.status(400).json({
            success: false,
            message: "Google Apps Script แจ้งเตือนเรื่องสิทธิ์: โปรดตรวจสอบการตั้งค่า Deploy ใน Apps Script: ให้ตั้ง 'Execute as' เป็น 'Me (อีเมลของคุณ)' และ 'Who has access' เป็น 'Anyone (ทุกคน)'",
            htmlError: true
          });
        }
        return res.status(500).json({
          success: false,
          message: "ไม่สามารถแปลงข้อมูลการตอบกลับจาก Google: " + text.slice(0, 150)
        });
      }

      return res.json({
        success: true,
        message: data.message || "ส่งข้อมูลขึ้น Google Sheet ครบทุกแท็บเรียบร้อยแล้ว!",
        details: data
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "เกิดข้อผิดพลาดในการส่งข้อมูล: " + err.message
      });
    }
  });

  // Pull all data from Google Sheet to Server Database
  app.post("/api/admin/gas/pull", async (req, res) => {
    loadDatabase();
    const url = getGasUrl(req);
    if (!url) {
      return res.status(400).json({
        success: false,
        message: "กรุณาระบุและบันทึก Google Apps Script Web App URL ก่อน"
      });
    }

    if (db.settings.gasWebAppUrl !== url) {
      db.settings.gasWebAppUrl = url;
      saveDatabase();
    }

    try {
      const updated = await pullFromGas(false);
      if (updated) {
        return res.json({
          success: true,
          message: "ดึงข้อมูลจาก Google Sheet อัปเดตลงเซิร์ฟเวอร์สำเร็จ 100%!",
          data: db,
          counts: {
            bookings: db.bookings.length,
            services: db.services.length,
            staff: db.staff.length,
            customers: db.customers.length
          }
        });
      }
      return res.status(500).json({
        success: false,
        message: "ไม่สามารถดึงข้อมูลจาก Google Apps Script ได้"
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "เกิดข้อผิดพลาดในการดึงข้อมูล: " + err.message
      });
    }
  });

  // Get live status & row counts directly from Google Apps Script Web App
  app.get("/api/admin/gas/status", async (req, res) => {
    loadDatabase();
    const url = getGasUrl(req);
    if (!url) {
      return res.json({
        connected: false,
        autoSyncActive: false,
        message: "ยังไม่ได้ระบุ Google Apps Script Web App URL",
        localCounts: {
          bookings: db.bookings.length,
          services: db.services.length,
          staff: db.staff.length,
          customers: db.customers.length
        },
        lastSync: lastGasSync
      });
    }

    try {
      // Use pullAll which is 100% supported by GAS to retrieve real live counts
      const testUrl = url.includes("?") ? `${url}&action=pullAll` : `${url}?action=pullAll`;
      const response = await fetch(testUrl, {
        method: "GET",
        headers: { "Accept": "application/json" },
        redirect: "follow"
      });

      const json = await response.json().catch(() => null);
      if (!json || !json.data) {
        return res.json({
          connected: false,
          autoSyncActive: false,
          error: "Google Apps Script ตอบกลับข้อมูลไม่สมบูรณ์",
          localCounts: {
            bookings: db.bookings.length,
            services: db.services.length,
            staff: db.staff.length,
            customers: db.customers.length
          },
          lastSync: lastGasSync
        });
      }

      const sheetCounts = {
        bookings: Array.isArray(json.data.bookings) ? json.data.bookings.length : 0,
        services: Array.isArray(json.data.services) ? json.data.services.length : 0,
        staff: Array.isArray(json.data.staff) ? json.data.staff.length : 0,
        customers: Array.isArray(json.data.customers) ? json.data.customers.length : 0
      };

      if (json.sheetUrl && !db.settings.googleSheetUrl) {
        db.settings.googleSheetUrl = json.sheetUrl;
        saveDatabase();
      }

      return res.json({
        connected: true,
        autoSyncActive: true,
        sheetUrl: json.sheetUrl || db.settings.googleSheetUrl || "",
        driveFolderUrl: json.driveFolderUrl || db.settings.googleDriveFolderUrl || "",
        gasTimestamp: json.timestamp || new Date().toISOString(),
        sheetCounts,
        localCounts: {
          bookings: db.bookings.length,
          services: db.services.length,
          staff: db.staff.length,
          customers: db.customers.length
        },
        lastSync: lastGasSync
      });
    } catch (err) {
      return res.json({
        connected: false,
        autoSyncActive: false,
        error: err.message,
        localCounts: {
          bookings: db.bookings.length,
          services: db.services.length,
          staff: db.staff.length,
          customers: db.customers.length
        },
        lastSync: lastGasSync
      });
    }
  });

  // Webhook: Google Sheet pushes updates directly to Web App Server
  app.post("/api/webhook/google-sheet", (req, res) => {
    loadDatabase();
    const { action, data } = req.body;
    if (action === "syncFromSheet" && data) {
      if (Array.isArray(data.bookings) && data.bookings.length > 0) {
        db.bookings = data.bookings.map((b) => ({
          id: b.ID || b.id || `BK-${Date.now()}`,
          createdAt: b.CreatedAt || b.createdAt || new Date().toISOString(),
          status: b.Status || b.status || "pending",
          date: formatGasDate(b.Date || b.date),
          time: formatGasTime(b.Time || b.time),
          serviceName: b.ServiceName || b.serviceName || "",
          servicePrice: parseFloat(b.ServicePrice || b.servicePrice) || 0,
          serviceDuration: parseInt(b.ServiceDuration || b.serviceDuration, 10) || 60,
          staffName: b.StaffName || b.staffName || "",
          customerName: b.CustomerName || b.customerName || "",
          customerPhone: formatGasPhone(b.CustomerPhone || b.customerPhone),
          customerEmail: b.CustomerEmail || b.customerEmail || "",
          specialRequest: b.SpecialRequest || b.specialRequest || "",
          paymentStatus: b.PaymentStatus || b.paymentStatus || "pending",
          paymentSlipUrl: b.PaymentSlipUrl || b.paymentSlipUrl || "",
          calendarEventId: b.CalendarEventId || b.calendarEventId || "",
          lineUserId: b.LineUserId || b.lineUserId || "",
          lineDisplayName: b.LineDisplayName || b.lineDisplayName || ""
        }));
      }

      if (Array.isArray(data.services) && data.services.length > 0) {
        db.services = data.services.map((s) => ({
          id: s.ID || s.id || `srv-${Date.now()}`,
          name: s.Name || s.name || "",
          category: s.Category || s.category || "General",
          price: parseFloat(s.Price || s.price) || 0,
          duration: parseInt(s.DurationMinutes || s.duration, 10) || 60,
          description: s.Description || s.description || "",
          icon: s.Icon || s.icon || "Sparkles"
        }));
      }

      if (Array.isArray(data.staff) && data.staff.length > 0) {
        db.staff = data.staff.map((st) => ({
          id: st.ID || st.id || `stf-${Date.now()}`,
          name: st.Name || st.name || "",
          nickname: st.Nickname || st.nickname || st.Name || "",
          role: st.Role || st.role || "Therapist",
          experience: st.Experience || st.experience || "",
          rating: parseFloat(st.Rating || st.rating) || 5.0,
          avatar: st.Avatar || st.avatar || "",
          skills: typeof st.Services === "string" ? st.Services.split(",").map(x => x.trim()) : (st.skills || []),
          bio: st.Bio || st.bio || ""
        }));
      }

      if (Array.isArray(data.customers) && data.customers.length > 0) {
        db.customers = data.customers.map((c) => ({
          customerPhone: formatGasPhone(c["Customer Phone"] || c.customerPhone),
          customerName: c["Customer Name"] || c.customerName || "",
          customerEmail: c["Customer Email"] || c.customerEmail || "",
          totalBookings: parseInt(c["Total Bookings"] || c.totalBookings, 10) || 1,
          totalSpent: parseFloat(c["Total Spent (THB)"] || c.totalSpent) || 0,
          lastVisitDate: formatGasDate(c["Last Visit Date"] || c.lastVisitDate),
          lineUserId: c["LINE User ID"] || c.lineUserId || ""
        }));
      }

      saveDatabase();
      return res.json({
        success: true,
        message: "ระบบอัปเดตข้อมูลจาก Google Sheet สำเร็จ!",
        counts: {
          bookings: db.bookings.length,
          services: db.services.length,
          staff: db.staff.length,
          customers: db.customers.length
        }
      });
    }

    return res.status(400).json({ success: false, message: "Invalid webhook payload" });
  });

  const httpServer = http.createServer(app);

  // Automatic Background Startup Sync with Google Sheets
  if (db.settings.gasWebAppUrl) {
    pullFromGas(true)
      .then(() => {
        console.log("[Auto-Sync] Startup sync completed with Google Apps Script");
      })
      .catch((err) => {
        console.warn("[Auto-Sync] Initial startup sync warning:", err.message);
      });
  }

  // Automatic Periodic Background Sync (Every 30 seconds)
  setInterval(() => {
    if (db.settings.gasWebAppUrl) {
      pullFromGas(true).catch(() => {});
    }
  }, 30000);

  // Vite Middleware for development vs Production Static Serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: {
          server: httpServer
        }
      },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`The Bloom Studio server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
