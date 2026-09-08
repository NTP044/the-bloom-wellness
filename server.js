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
    bookingConflicts: [],
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
        bookingConflicts: parsed.bookingConflicts || [],
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
  let str = String(val).trim().replace(/[^0-9]/g, "");
  if (str.length === 9 && !str.startsWith("0")) {
    str = "0" + str;
  }
  return str;
}

// Data Sanitization & Strict Deduplication Helper (DISCARDS duplicates, NEVER clones them)
function sanitizeDatabase(targetDb) {
  if (!targetDb) return targetDb;

  // 1. Deduplicate Services (Unique by ID and lowercased trimmed Name)
  if (Array.isArray(targetDb.services)) {
    const seenSrvIds = new Set();
    const seenSrvNames = new Set();
    const cleanServices = [];

    targetDb.services.forEach((s) => {
      if (!s) return;
      const sId = (s.id || s.ID || "").toString().trim();
      const sName = (s.name || s.Name || "").toString().trim().toLowerCase();
      if (!sName) return;

      if ((sId && seenSrvIds.has(sId)) || seenSrvNames.has(sName)) {
        // Merge missing properties into existing
        const existing = cleanServices.find(
          (x) => (sId && x.id === sId) || (x.name && x.name.trim().toLowerCase() === sName)
        );
        if (existing) {
          if (!existing.price && s.price) existing.price = parseFloat(s.price) || 0;
          if (!existing.duration && s.duration) existing.duration = parseInt(s.duration, 10) || 60;
          if (!existing.description && s.description) existing.description = s.description;
          if ((!existing.icon || existing.icon === "Sparkles") && s.icon) existing.icon = s.icon;
        }
        return; // DISCARD DUPLICATE
      }

      const finalId = sId || `srv-${Date.now().toString(36)}-${cleanServices.length}`;
      seenSrvIds.add(finalId);
      seenSrvNames.add(sName);

      cleanServices.push({
        id: finalId,
        name: s.name || s.Name || "",
        category: s.category || s.Category || "General",
        price: parseFloat(s.price || s.Price) || 0,
        duration: parseInt(s.duration || s.DurationMinutes || s.Duration, 10) || 60,
        description: s.description || s.Description || "",
        icon: s.icon || s.Icon || "Sparkles"
      });
    });
    targetDb.services = cleanServices;
  }

  // 2. Deduplicate Staff (Unique by ID and lowercased Name/Nickname)
  if (Array.isArray(targetDb.staff)) {
    const seenStaffIds = new Set();
    const seenStaffNames = new Set();
    const cleanStaff = [];

    targetDb.staff.forEach((st) => {
      if (!st) return;
      const stId = (st.id || st.ID || "").toString().trim();
      const stName = (st.name || st.Name || "").toString().trim().toLowerCase();
      const stNick = (st.nickname || st.Nickname || "").toString().trim().toLowerCase();
      if (!stName && !stNick) return;

      const nameKey = stName || stNick;
      if ((stId && seenStaffIds.has(stId)) || seenStaffNames.has(nameKey)) {
        // Merge skills and properties into existing
        const existing = cleanStaff.find(
          (x) => (stId && x.id === stId) || (x.name && x.name.trim().toLowerCase() === nameKey)
        );
        if (existing) {
          const incomingSkills = Array.isArray(st.skills)
            ? st.skills
            : (typeof st.skills === "string" ? st.skills.split(",").map((x) => x.trim()) : (typeof st.Services === "string" ? st.Services.split(",").map((x) => x.trim()) : []));
          incomingSkills.forEach((sk) => {
            if (sk && !existing.skills.includes(sk)) existing.skills.push(sk);
          });
          if (!existing.avatar && st.avatar) existing.avatar = st.avatar;
          if (!existing.experience && st.experience) existing.experience = st.experience;
          if (!existing.bio && st.bio) existing.bio = st.bio;
        }
        return; // DISCARD DUPLICATE
      }

      const slug = (st.nickname || st.Nickname || st.name || "staff").toLowerCase().replace(/[^a-z0-9]/g, "");
      const finalId = stId || `stf-${slug || cleanStaff.length}`;
      seenStaffIds.add(finalId);
      seenStaffNames.add(nameKey);

      const skills = Array.isArray(st.skills)
        ? st.skills
        : (typeof st.skills === "string" ? st.skills.split(",").map((x) => x.trim()) : (typeof st.Services === "string" ? st.Services.split(",").map((x) => x.trim()) : []));

      cleanStaff.push({
        id: finalId,
        name: st.name || st.Name || "",
        nickname: st.nickname || st.Nickname || st.name || "",
        role: st.role || st.Role || "Therapist",
        experience: st.experience || st.Experience || "ประสบการณ์ 3 ปี",
        rating: parseFloat(st.rating || st.Rating) || 5.0,
        avatar: st.avatar || st.Avatar || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300",
        skills: skills.filter(Boolean),
        bio: st.bio || st.Bio || ""
      });
    });
    targetDb.staff = cleanStaff;
  }

  // 3. Deduplicate Bookings (Unique by ID or Phone + Date + Time)
  if (Array.isArray(targetDb.bookings)) {
    const seenBookingIds = new Set();
    const seenSignatures = new Set();
    const cleanBookings = [];

    targetDb.bookings.forEach((b) => {
      if (!b) return;
      const bId = (b.id || b.ID || "").toString().trim();
      const phone = formatGasPhone(b.customerPhone || b.CustomerPhone);
      const date = formatGasDate(b.date || b.Date);
      const time = formatGasTime(b.time || b.Time);
      const sig = phone && date && time ? `${phone}_${date}_${time}` : "";

      if ((bId && seenBookingIds.has(bId)) || (sig && seenSignatures.has(sig))) {
        // Update existing booking with more accurate details if available
        const existing = cleanBookings.find(
          (x) => (bId && x.id === bId) || (sig && `${formatGasPhone(x.customerPhone)}_${x.date}_${x.time}` === sig)
        );
        if (existing) {
          if (b.status && b.status !== "pending" && existing.status === "pending") {
            existing.status = b.status;
          }
          if (b.paymentStatus && b.paymentStatus !== "pending" && existing.paymentStatus === "pending") {
            existing.paymentStatus = b.paymentStatus;
          }
          if (b.paymentSlipUrl && !existing.paymentSlipUrl) {
            existing.paymentSlipUrl = b.paymentSlipUrl;
          }
          if (b.calendarEventId && !existing.calendarEventId) {
            existing.calendarEventId = b.calendarEventId;
          }
        }
        return; // DISCARD DUPLICATE! NEVER CREATE A NEW CLONED ID!
      }

      const finalId = bId || `BK-${Date.now().toString(36).toUpperCase()}-${cleanBookings.length}`;
      seenBookingIds.add(finalId);
      if (sig) seenSignatures.add(sig);

      const rawCreatedAt = b.createdAt || b.CreatedAt || new Date().toISOString();
      const rawCreatedAtMs = b.createdAtMs || b.CreatedAtMs || (rawCreatedAt ? new Date(rawCreatedAt).getTime() : Date.now());

      cleanBookings.push({
        id: finalId,
        createdAt: rawCreatedAt,
        createdAtMs: Number(rawCreatedAtMs) || Date.now(),
        status: b.status || b.Status || "pending",
        date,
        time,
        serviceId: b.serviceId || b.ServiceId || "",
        serviceName: b.serviceName || b.ServiceName || "",
        servicePrice: parseFloat(b.servicePrice || b.ServicePrice) || 0,
        serviceDuration: parseInt(b.serviceDuration || b.ServiceDuration, 10) || 60,
        staffId: b.staffId || b.StaffId || "",
        staffName: b.staffName || b.StaffName || "",
        staffAvatar: b.staffAvatar || b.StaffAvatar || "",
        customerName: b.customerName || b.CustomerName || "",
        customerPhone: phone,
        customerEmail: b.customerEmail || b.CustomerEmail || "",
        specialRequest: b.specialRequest || b.SpecialRequest || "",
        paymentStatus: b.paymentStatus || b.PaymentStatus || "pending",
        paymentSlipUrl: b.paymentSlipUrl || b.PaymentSlipUrl || "",
        calendarEventId: b.calendarEventId || b.CalendarEventId || "",
        lineUserId: b.lineUserId || b.LineUserId || "",
        lineDisplayName: b.lineDisplayName || b.LineDisplayName || ""
      });
    });
    targetDb.bookings = cleanBookings;
  }

  // 4. Deduplicate Customers (Unique by 10-digit Phone)
  if (Array.isArray(targetDb.customers)) {
    const seenPhones = new Set();
    const cleanCustomers = [];

    targetDb.customers.forEach((c) => {
      if (!c) return;
      const phone = formatGasPhone(c.customerPhone || c["Customer Phone"]);
      if (!phone) return;

      if (seenPhones.has(phone)) {
        const existing = cleanCustomers.find((x) => x.customerPhone === phone);
        if (existing) {
          existing.totalBookings = Math.max(existing.totalBookings || 1, parseInt(c.totalBookings || c["Total Bookings"], 10) || 1);
          existing.totalSpent = Math.max(existing.totalSpent || 0, parseFloat(c.totalSpent || c["Total Spent (THB)"]) || 0);
          if (c.customerName && !existing.customerName) existing.customerName = c.customerName;
          if (c.customerEmail && !existing.customerEmail) existing.customerEmail = c.customerEmail;
          if (c.lineUserId && !existing.lineUserId) existing.lineUserId = c.lineUserId;
          const vDate = formatGasDate(c.lastVisitDate || c["Last Visit Date"]);
          if (vDate && vDate > (existing.lastVisitDate || "")) existing.lastVisitDate = vDate;
        }
        return; // DISCARD DUPLICATE
      }

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
    });
    targetDb.customers = cleanCustomers;
  }

  // 5. Booking Conflicts & Collision Leads
  if (Array.isArray(targetDb.bookingConflicts)) {
    const seenConflictIds = new Set();
    const cleanConflicts = [];
    targetDb.bookingConflicts.forEach((c) => {
      if (!c) return;
      const cId = c.id || `CONF-${Date.now().toString(36).toUpperCase()}-${cleanConflicts.length}`;
      if (seenConflictIds.has(cId)) return;
      seenConflictIds.add(cId);
      cleanConflicts.push({
        id: cId,
        timestamp: c.timestamp || new Date().toISOString(),
        timestampMs: Number(c.timestampMs) || Date.now(),
        date: c.date || "",
        time: c.time || "",
        endTime: c.endTime || "",
        serviceId: c.serviceId || "",
        serviceName: c.serviceName || "",
        servicePrice: parseFloat(c.servicePrice) || 0,
        serviceDuration: parseInt(c.serviceDuration, 10) || 60,
        staffId: c.staffId || "",
        staffName: c.staffName || "",
        customerName: c.customerName || "",
        customerPhone: formatGasPhone(c.customerPhone),
        customerEmail: c.customerEmail || "",
        specialRequest: c.specialRequest || "",
        lineUserId: c.lineUserId || "",
        lineDisplayName: c.lineDisplayName || "",
        conflictWithBookingId: c.conflictWithBookingId || "",
        conflictWithCustomer: c.conflictWithCustomer || "",
        conflictOccupiedTime: c.conflictOccupiedTime || "",
        status: c.status || "pending_callback", // pending_callback | contacted | rebooked | resolved
        adminNote: c.adminNote || "",
        rebookedBookingId: c.rebookedBookingId || ""
      });
    });
    targetDb.bookingConflicts = cleanConflicts;
  } else {
    targetDb.bookingConflicts = [];
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

// Standard daily time slots & Operating Hours (10:00 - 20:30)
const SHOP_OPERATING_HOURS = {
  open: "10:00",
  close: "20:30",
  slotIntervalMinutes: 30, // Every 30 minutes
  openMinutes: 10 * 60, // 600
  closeMinutes: 20 * 60 + 30 // 1230
};

// Helper: Convert "HH:mm" to minutes from midnight
function timeToMinutes(timeStr) {
  if (!timeStr || typeof timeStr !== "string") return 0;
  const parts = timeStr.trim().split(":");
  const hours = parseInt(parts[0], 10) || 0;
  const minutes = parseInt(parts[1], 10) || 0;
  return hours * 60 + minutes;
}

// Helper: Convert minutes from midnight to "HH:mm"
function minutesToTime(minutes) {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

// Generate base 30-minute time slots from 10:00 to 20:00
function generateAllTimeSlots() {
  const slots = [];
  for (
    let m = SHOP_OPERATING_HOURS.openMinutes;
    m < SHOP_OPERATING_HOURS.closeMinutes;
    m += SHOP_OPERATING_HOURS.slotIntervalMinutes
  ) {
    slots.push(minutesToTime(m));
  }
  return slots;
}

const ALL_TIME_SLOTS = generateAllTimeSlots();

/**
 * Calculate detailed available slots for a staff member on a specific date,
 * taking service duration, shop operating hours (10:00 - 20:30), and existing bookings into account.
 */
function calculateAvailabilityEngine({ staffId, date, serviceId, duration }) {
  // Determine service duration
  let serviceDuration = parseInt(duration, 10);
  if (!serviceDuration || isNaN(serviceDuration)) {
    if (serviceId) {
      const srv = db.services.find((s) => s.id === serviceId);
      if (srv && srv.duration) {
        serviceDuration = parseInt(srv.duration, 10);
      }
    }
  }
  if (!serviceDuration || serviceDuration <= 0) {
    serviceDuration = 60; // Default 60 minutes
  }

  // Active bookings for this staff on this date
  const existingBookings = (db.bookings || []).filter(
    (b) => b.staffId === staffId && b.date === date && b.status !== "cancelled"
  );

  // Map existing bookings to minute ranges [startMin, endMin)
  const busyIntervals = existingBookings.map((b) => {
    const bStart = timeToMinutes(b.time);
    let bDuration = parseInt(b.serviceDuration, 10);
    if (!bDuration || isNaN(bDuration)) {
      const srv = db.services.find((s) => s.id === b.serviceId);
      bDuration = srv?.duration ? parseInt(srv.duration, 10) : 60;
    }
    const bEnd = bStart + bDuration;
    return {
      bookingId: b.id,
      customerName: b.customerName,
      serviceName: b.serviceName,
      time: b.time,
      startMin: bStart,
      endMin: bEnd,
      endTime: minutesToTime(bEnd),
      duration: bDuration
    };
  });

  const slotDetails = ALL_TIME_SLOTS.map((slotTime) => {
    const slotStartMin = timeToMinutes(slotTime);
    const slotEndMin = slotStartMin + serviceDuration;
    const slotEndTime = minutesToTime(slotEndMin);

    // Rule 1: Exceeds Closing Hours (20:30 = 1230)
    if (slotEndMin > SHOP_OPERATING_HOURS.closeMinutes) {
      return {
        time: slotTime,
        endTime: slotEndTime,
        duration: serviceDuration,
        available: false,
        reason: "exceeds_closing",
        reasonText: `เวลาสิ้นสุด (${slotEndTime} น.) เกินเวลาปิดร้าน (${SHOP_OPERATING_HOURS.close} น.)`
      };
    }

    // Rule 2: Conflict with Existing Booking for this Staff
    // Overlap condition: slotStartMin < busy.endMin && slotEndMin > busy.startMin
    const conflict = busyIntervals.find(
      (busy) => slotStartMin < busy.endMin && slotEndMin > busy.startMin
    );

    if (conflict) {
      return {
        time: slotTime,
        endTime: slotEndTime,
        duration: serviceDuration,
        available: false,
        reason: "conflict",
        conflictWith: {
          bookingId: conflict.bookingId,
          time: conflict.time,
          endTime: conflict.endTime,
          serviceName: conflict.serviceName
        },
        reasonText: `ติดคิวบริการ (${conflict.time} - ${conflict.endTime} น.)`
      };
    }

    return {
      time: slotTime,
      endTime: slotEndTime,
      duration: serviceDuration,
      available: true,
      reason: null,
      reasonText: "ว่างพร้อมให้บริการ"
    };
  });

  const availableSlots = slotDetails.filter((s) => s.available).map((s) => s.time);
  const bookedSlots = slotDetails.filter((s) => !s.available).map((s) => s.time);

  return {
    success: true,
    staffId,
    date,
    serviceId: serviceId || null,
    serviceDuration,
    operatingHours: SHOP_OPERATING_HOURS,
    allSlots: ALL_TIME_SLOTS,
    availableSlots,
    bookedSlots,
    slotDetails
  };
}

// Status tracking for real-time GAS sync
let lastGasSync = {
  timestamp: null,
  success: false,
  message: "ระบบเชื่อมต่อ Google Sheet อัตโนมัติพร้อมทำงาน",
  action: null
};

// ==========================================
// Real-Time Server-Sent Events (SSE) Hub
// ==========================================
const sseClients = new Set();

function broadcastSSE(eventType, data = {}) {
  const payload = `data: ${JSON.stringify({
    type: eventType,
    data,
    timestamp: Date.now(),
    iso: new Date().toISOString()
  })}\n\n`;

  sseClients.forEach((client) => {
    try {
      client.res.write(payload);
    } catch (err) {
      sseClients.delete(client);
    }
  });
}

// Concurrency & Mutex Lock for Atomic First-Come First-Served Booking
let bookingMutex = Promise.resolve();
function withBookingLock(fn) {
  const next = bookingMutex.then(fn, fn);
  bookingMutex = next.catch(() => {});
  return next;
}

// Concurrency & Cooldown Locks to prevent reading stale data after local mutations
let lastPushTimestamp = 0;
let isPushingToGas = false;

// Helper: sync booking to Google Apps Script Web App asynchronously & update Calendar
async function syncBookingToGas(booking) {
  if (!db.settings.gasWebAppUrl) return;
  lastPushTimestamp = Date.now();
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
async function syncStatusToGas(bookingId, status, updates = {}, booking = null) {
  if (!db.settings.gasWebAppUrl) return;
  lastPushTimestamp = Date.now();
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
        updates,
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
async function syncDeleteToGas(bookingId, booking = null) {
  if (!db.settings.gasWebAppUrl) return;
  lastPushTimestamp = Date.now();
  try {
    const url = db.settings.gasWebAppUrl.trim();
    if (!url.startsWith("http")) return;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "deleteBooking",
        bookingId,
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

  lastPushTimestamp = Date.now();
  isPushingToGas = true;
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
  } finally {
    isPushingToGas = false;
  }
}

// Helper: Automatically pull latest data from Google Apps Script to Server Database
async function pullFromGas(isBackground = false) {
  if (!db.settings.gasWebAppUrl) return null;
  const url = db.settings.gasWebAppUrl.trim();
  if (!url.startsWith("http")) return null;

  // Background cooldown protection: Skip pull if we pushed recently (<30s) or push is in progress
  if (isBackground && (isPushingToGas || Date.now() - lastPushTimestamp < 30000)) {
    return db;
  }

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

      // 1. Smart Merge Bookings (Upsert by ID or Phone + Date + Time)
      if (Array.isArray(result.data.bookings) && result.data.bookings.length > 0) {
        result.data.bookings.forEach((b) => {
          const bId = (b.ID || b.id || "").toString().trim();
          const phone = formatGasPhone(b.CustomerPhone || b.customerPhone);
          const date = formatGasDate(b.Date || b.date);
          const time = formatGasTime(b.Time || b.time);
          const sig = phone && date && time ? `${phone}_${date}_${time}` : "";

          const existing = db.bookings.find(
            (x) => (bId && x.id === bId) || (sig && `${formatGasPhone(x.customerPhone)}_${x.date}_${x.time}` === sig)
          );

          if (existing) {
            if (b.Status || b.status) existing.status = b.Status || b.status;
            if (b.PaymentStatus || b.paymentStatus) existing.paymentStatus = b.PaymentStatus || b.paymentStatus;
            if (b.PaymentSlipUrl || b.paymentSlipUrl) existing.paymentSlipUrl = b.PaymentSlipUrl || b.paymentSlipUrl;
            if (b.CalendarEventId || b.calendarEventId) existing.calendarEventId = b.CalendarEventId || b.calendarEventId;
          } else {
            db.bookings.push({
              id: bId || `BK-${Date.now().toString(36).toUpperCase()}-${db.bookings.length}`,
              createdAt: b.CreatedAt || b.createdAt || new Date().toISOString(),
              status: b.Status || b.status || "pending",
              date,
              time,
              serviceId: b.ServiceId || b.serviceId || "",
              serviceName: b.ServiceName || b.serviceName || "",
              servicePrice: parseFloat(b.ServicePrice || b.servicePrice) || 0,
              serviceDuration: parseInt(b.ServiceDuration || b.serviceDuration, 10) || 60,
              staffId: b.StaffId || b.staffId || "",
              staffName: b.StaffName || b.staffName || "",
              customerName: b.CustomerName || b.customerName || "",
              customerPhone: phone,
              customerEmail: b.CustomerEmail || b.customerEmail || "",
              specialRequest: b.SpecialRequest || b.specialRequest || "",
              paymentStatus: b.PaymentStatus || b.paymentStatus || "pending",
              paymentSlipUrl: b.PaymentSlipUrl || b.paymentSlipUrl || "",
              calendarEventId: b.CalendarEventId || b.calendarEventId || "",
              lineUserId: b.LineUserId || b.lineUserId || "",
              lineDisplayName: b.LineDisplayName || b.lineDisplayName || ""
            });
          }
        });
      }

      // 2. Smart Merge Services (Upsert by ID or lowercased Name)
      if (Array.isArray(result.data.services) && result.data.services.length > 0) {
        result.data.services.forEach((s) => {
          const sId = (s.ID || s.id || "").toString().trim();
          const sName = (s.Name || s.name || "").toString().trim().toLowerCase();
          if (!sName) return;

          const existing = db.services.find(
            (x) => (sId && x.id === sId) || (x.name && x.name.trim().toLowerCase() === sName)
          );

          if (existing) {
            if (s.Price || s.price) existing.price = parseFloat(s.Price || s.price) || existing.price;
            if (s.DurationMinutes || s.duration) existing.duration = parseInt(s.DurationMinutes || s.duration, 10) || existing.duration;
            if (s.Description || s.description) existing.description = s.Description || s.description;
            if (s.Icon || s.icon) existing.icon = s.Icon || s.icon;
          } else {
            db.services.push({
              id: sId || `srv-${Date.now().toString(36)}-${db.services.length}`,
              name: s.Name || s.name || "",
              category: s.Category || s.category || "General",
              price: parseFloat(s.Price || s.price) || 0,
              duration: parseInt(s.DurationMinutes || s.duration, 10) || 60,
              description: s.Description || s.description || "",
              icon: s.Icon || s.icon || "Sparkles"
            });
          }
        });
      }

      // 3. Smart Merge Staff (Upsert by ID or lowercased Name/Nickname)
      if (Array.isArray(result.data.staff) && result.data.staff.length > 0) {
        result.data.staff.forEach((st) => {
          const stId = (st.ID || st.id || "").toString().trim();
          const stName = (st.Name || st.name || "").toString().trim().toLowerCase();
          const stNick = (st.Nickname || st.nickname || "").toString().trim().toLowerCase();
          const nameKey = stName || stNick;
          if (!nameKey) return;

          const existing = db.staff.find(
            (x) => (stId && x.id === stId) || (x.name && x.name.trim().toLowerCase() === nameKey)
          );

          if (existing) {
            if (st.Role || st.role) existing.role = st.Role || st.role;
            if (st.Experience || st.experience) existing.experience = st.Experience || st.experience;
            if (st.Rating || st.rating) existing.rating = parseFloat(st.Rating || st.rating) || existing.rating;
            if (st.Avatar || st.avatar) existing.avatar = st.Avatar || st.avatar;
            if (st.Bio || st.bio) existing.bio = st.Bio || st.bio;
          } else {
            const nick = (st.Nickname || st.Name || "staff").toLowerCase().replace(/[^a-z0-9]/g, "");
            db.staff.push({
              id: stId || `stf-${nick || db.staff.length}`,
              name: st.Name || st.name || "",
              nickname: st.Nickname || st.nickname || st.Name || "",
              role: st.Role || st.role || "Therapist",
              experience: st.Experience || st.experience || "ประสบการณ์ 3 ปี",
              rating: parseFloat(st.Rating || st.rating) || 5.0,
              avatar: st.Avatar || st.avatar || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300",
              skills: typeof st.Services === "string" ? st.Services.split(",").map(x => x.trim()) : (st.skills || []),
              bio: st.Bio || st.bio || ""
            });
          }
        });
      }

      // 4. Smart Merge Customers (Upsert by Phone)
      if (Array.isArray(result.data.customers) && result.data.customers.length > 0) {
        result.data.customers.forEach((c) => {
          const phone = formatGasPhone(c["Customer Phone"] || c.customerPhone);
          if (!phone) return;

          const existing = db.customers.find((x) => x.customerPhone === phone);
          if (existing) {
            existing.totalBookings = Math.max(existing.totalBookings || 1, parseInt(c["Total Bookings"] || c.totalBookings, 10) || 1);
            existing.totalSpent = Math.max(existing.totalSpent || 0, parseFloat(c["Total Spent (THB)"] || c.totalSpent) || 0);
            if (c["Customer Name"] || c.customerName) existing.customerName = c["Customer Name"] || c.customerName;
            if (c["Customer Email"] || c.customerEmail) existing.customerEmail = c["Customer Email"] || c.customerEmail;
          } else {
            db.customers.push({
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
      timestamp: new Date().toISOString(),
      timestampMs: Date.now()
    });
  });

  // Real-Time Server-Sent Events (SSE) stream for instant slot invalidation & live admin alerts
  app.get("/api/events", (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders?.();

    const client = { id: `client-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`, res };
    sseClients.add(client);

    // Initial connection ack with millisecond timestamp
    res.write(
      `data: ${JSON.stringify({
        type: "connected",
        clientId: client.id,
        timestamp: Date.now(),
        iso: new Date().toISOString()
      })}\n\n`
    );

    // Keep-alive heartbeat every 20 seconds
    const heartbeat = setInterval(() => {
      try {
        res.write(`: heartbeat\n\n`);
      } catch (e) {
        clearInterval(heartbeat);
      }
    }, 20000);

    req.on("close", () => {
      clearInterval(heartbeat);
      sseClients.delete(client);
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

  // 3. GET /api/availability?staffId=&date=&serviceId=&duration=
  app.get("/api/availability", (req, res) => {
    loadDatabase();
    const { staffId, date, serviceId, duration } = req.query;

    if (!staffId || !date) {
      return res.status(400).json({
        success: false,
        message: "กรุณาระบุ staffId และ date (YYYY-MM-DD)"
      });
    }

    const availabilityResult = calculateAvailabilityEngine({
      staffId,
      date,
      serviceId,
      duration
    });

    res.json(availabilityResult);
  });

  // 4. POST /api/bookings (Atomic First-Come, First-Served Concurrency Control)
  app.post("/api/bookings", async (req, res) => {
    // Record exact arrival millisecond timestamp
    const requestArrivedAtMs = Date.now();
    const requestArrivedAtIso = new Date(requestArrivedAtMs).toISOString();

    return withBookingLock(async () => {
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

      // Duration-Based Availability & Concurrency Conflict Check
      const newStartMin = timeToMinutes(time);
      const serviceDuration = parseInt(selectedService.duration, 10) || 60;
      const newEndMin = newStartMin + serviceDuration;
      const newEndTimeStr = minutesToTime(newEndMin);

      // Rule 1: Check against store closing hours (20:30)
      if (newEndMin > SHOP_OPERATING_HOURS.closeMinutes) {
        return res.status(400).json({
          success: false,
          message: `ขออภัย เวลาสิ้นสุดบริการ (${newEndTimeStr} น.) เกินเวลาปิดทำการของร้าน (ปิด ${SHOP_OPERATING_HOURS.close} น.) กรุณาเลือกช่วงเวลาอื่น`
        });
      }

      // Rule 2: Strict First-Come, First-Served Conflict Check within Atomic Mutex
      const conflictingBooking = db.bookings.find((b) => {
        if (b.staffId !== staffId || b.date !== date || b.status === "cancelled") return false;
        const bStart = timeToMinutes(b.time);
        let bDur = parseInt(b.serviceDuration, 10);
        if (!bDur || isNaN(bDur)) {
          const srv = db.services.find((s) => s.id === b.serviceId);
          bDur = srv?.duration ? parseInt(srv.duration, 10) : 60;
        }
        const bEnd = bStart + bDur;
        // Overlap condition
        return newStartMin < bEnd && newEndMin > bStart;
      });

      if (conflictingBooking) {
        const bStart = conflictingBooking.time;
        let bDur = parseInt(conflictingBooking.serviceDuration, 10);
        if (!bDur || isNaN(bDur)) {
          const srv = db.services.find((s) => s.id === conflictingBooking.serviceId);
          bDur = srv?.duration ? parseInt(srv.duration, 10) : 60;
        }
        const bEnd = minutesToTime(timeToMinutes(bStart) + bDur);

        // 1. Calculate alternative available slots for the selected specialist on this date
        const currentStaffAvailability = calculateAvailabilityEngine({
          staffId,
          date,
          serviceId,
          duration: serviceDuration
        });
        const alternateSlots = currentStaffAvailability.availableSlots || [];

        // 2. Find other eligible specialists with open slots on this date
        const eligibleOtherStaff = (db.staff || []).filter(
          (st) => st.id !== staffId && Array.isArray(st.skills) && st.skills.includes(serviceId)
        );
        const alternateStaff = eligibleOtherStaff
          .map((st) => {
            const stAvail = calculateAvailabilityEngine({
              staffId: st.id,
              date,
              serviceId,
              duration: serviceDuration
            });
            return {
              staffId: st.id,
              staffName: st.name,
              nickname: st.nickname || st.name,
              staffAvatar: st.avatar || "",
              role: st.role || "",
              rating: st.rating || 5.0,
              hasRequestedSlot: stAvail.availableSlots.includes(time),
              availableSlots: stAvail.availableSlots || []
            };
          })
          .filter((st) => st.availableSlots.length > 0);

        // 3. Log conflict attempt in DB for Admin lead follow-up
        const conflictId = `CONF-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        const cleanPhone = customerPhone.trim();
        const conflictLog = {
          id: conflictId,
          timestamp: requestArrivedAtIso,
          timestampMs: requestArrivedAtMs,
          date,
          time,
          endTime: newEndTimeStr,
          serviceId,
          serviceName: selectedService.name,
          servicePrice: parseFloat(selectedService.price) || 0,
          serviceDuration,
          staffId,
          staffName: selectedStaff.name,
          customerName: customerName.trim(),
          customerPhone: cleanPhone,
          customerEmail: customerEmail ? customerEmail.trim() : "",
          specialRequest: specialRequest ? specialRequest.trim() : "",
          lineUserId: finalLineUserId || "",
          lineDisplayName: finalLineDisplayName || "",
          conflictWithBookingId: conflictingBooking.id,
          conflictWithCustomer: conflictingBooking.customerName || "ลูกค้าท่านอื่น",
          conflictOccupiedTime: `${bStart} - ${bEnd} น.`,
          status: "pending_callback", // pending_callback | contacted | rebooked | resolved
          adminNote: "",
          rebookedBookingId: ""
        };

        if (!Array.isArray(db.bookingConflicts)) {
          db.bookingConflicts = [];
        }
        db.bookingConflicts.unshift(conflictLog);
        saveDatabase();

        // 4. Real-time broadcast conflict alert to Admin
        broadcastSSE("booking:conflict_logged", {
          conflict: conflictLog
        });

        // 5. Immediate 409 Conflict return with alternate slots to allow instant customer reselection
        return res.status(409).json({
          success: false,
          conflict: true,
          message: "ขออภัย ช่วงเวลานี้เพิ่งถูกจองไปแล้ว กรุณาเลือกช่วงเวลาหรือช่างท่านอื่น",
          conflictDetails: {
            staffName: selectedStaff.name,
            occupiedTime: `${bStart} - ${bEnd} น.`,
            requestedTime: `${time} - ${newEndTimeStr} น.`,
            conflictId: conflictLog.id
          },
          alternateSlots,
          alternateStaff
        });
      }

      const id = `BK-${Date.now().toString(36).toUpperCase()}-${Math.random()
        .toString(36)
        .substring(2, 6)
        .toUpperCase()}`;

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
        endTime: newEndTimeStr,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail ? customerEmail.trim() : "",
        specialRequest: specialRequest ? specialRequest.trim() : "",
        paymentStatus: paymentSlipUrl ? "paid" : "pending",
        paymentSlipUrl: paymentSlipUrl || "",
        calendarEventId: "",
        lineUserId: finalLineUserId,
        lineDisplayName: finalLineDisplayName,
        createdAt: requestArrivedAtIso,
        createdAtMs: requestArrivedAtMs,
        status: "pending"
      };

      db.bookings.unshift(newBooking);

      // Auto-resolve any pending conflict leads for this customer phone/line
      if (Array.isArray(db.bookingConflicts)) {
        db.bookingConflicts.forEach((conf) => {
          if (
            conf.status === "pending_callback" &&
            (conf.customerPhone === customerPhone.trim() || (finalLineUserId && conf.lineUserId === finalLineUserId))
          ) {
            conf.status = "rebooked";
            conf.rebookedBookingId = newBooking.id;
            conf.adminNote = (conf.adminNote ? conf.adminNote + " | " : "") + `ลูกค้าจองรอบใหม่สำเร็จ (${newBooking.date} ${newBooking.time} น.)`;
          }
        });
      }

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

      // Real-Time Live Slot Invalidation Broadcast to all connected clients via SSE
      broadcastSSE("booking:created", {
        booking: newBooking,
        staffId,
        date,
        time,
        endTime: newEndTimeStr,
        serviceDuration
      });
      broadcastSSE("slot:invalidated", {
        staffId,
        date,
        time,
        endTime: newEndTimeStr
      });

      // Sync to Google Apps Script (Adds to sheet, Calendar, Email - no duplicate pushAll)
      syncBookingToGas(newBooking).catch((err) => {
        console.warn("[GAS Sync Async] Error:", err.message);
      });

      return res.status(201).json({
        success: true,
        message: "จองคิวสำเร็จเรียบร้อยแล้ว",
        booking: newBooking
      });
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
      bookingConflicts: db.bookingConflicts || [],
      settings: db.settings || {}
    });
  });

  // Get Conflict Logs for Admin
  app.get("/api/admin/conflicts", (req, res) => {
    loadDatabase();
    res.json({
      success: true,
      data: db.bookingConflicts || []
    });
  });

  // Update Conflict Log (Status or Admin Note)
  app.patch("/api/admin/conflicts/:id", (req, res) => {
    loadDatabase();
    const { id } = req.params;
    const { status, adminNote } = req.body;
    const conflict = (db.bookingConflicts || []).find((c) => c.id === id);
    if (!conflict) {
      return res.status(404).json({ success: false, message: "ไม่พบบันทึกคิวซ้อนนี้" });
    }
    if (status !== undefined) conflict.status = status;
    if (adminNote !== undefined) conflict.adminNote = adminNote;
    saveDatabase();
    broadcastSSE("booking:conflict_updated", { conflict });
    res.json({
      success: true,
      message: "อัปเดตข้อมูลบันทึกคิวซ้อนเรียบร้อย",
      data: conflict
    });
  });

  // Delete Conflict Log
  app.delete("/api/admin/conflicts/:id", (req, res) => {
    loadDatabase();
    const { id } = req.params;
    const initialLen = (db.bookingConflicts || []).length;
    db.bookingConflicts = (db.bookingConflicts || []).filter((c) => c.id !== id);
    if (db.bookingConflicts.length === initialLen) {
      return res.status(404).json({ success: false, message: "ไม่พบบันทึกคิวซ้อนนี้" });
    }
    saveDatabase();
    broadcastSSE("booking:conflict_deleted", { id });
    res.json({
      success: true,
      message: "ลบบันทึกคิวซ้อนเรียบร้อย"
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
  app.post("/api/admin/bookings", async (req, res) => {
    const requestArrivedAtMs = Date.now();
    const requestArrivedAtIso = new Date(requestArrivedAtMs).toISOString();

    return withBookingLock(async () => {
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
      const serviceDuration = selectedService ? (parseInt(selectedService.duration, 10) || 60) : 60;
      const startMin = timeToMinutes(time);
      const endMin = startMin + serviceDuration;
      const endTimeStr = minutesToTime(endMin);

      const id = `BK-ADMIN-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      const newBooking = {
        id,
        serviceId,
        serviceName: selectedService ? selectedService.name : "บริการความงาม",
        serviceDuration,
        servicePrice: selectedService ? selectedService.price : 0,
        staffId,
        staffName: selectedStaff ? selectedStaff.name : "ช่างผู้เชี่ยวชาญ",
        staffAvatar: selectedStaff ? (selectedStaff.avatar || "") : "",
        date,
        time,
        endTime: endTimeStr,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail ? customerEmail.trim() : "",
        specialRequest: specialRequest ? specialRequest.trim() : "",
        paymentStatus: paymentStatus || (paymentSlipUrl ? "paid" : "pending"),
        paymentSlipUrl: paymentSlipUrl || "",
        calendarEventId: "",
        lineUserId: null,
        lineDisplayName: null,
        createdAt: requestArrivedAtIso,
        createdAtMs: requestArrivedAtMs,
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

      // Real-Time Broadcast to all clients
      broadcastSSE("booking:created", {
        booking: newBooking,
        staffId,
        date,
        time,
        endTime: endTimeStr,
        serviceDuration
      });
      broadcastSSE("slot:invalidated", {
        staffId,
        date,
        time,
        endTime: endTimeStr
      });

      syncBookingToGas(newBooking).catch((err) => {
        console.warn("[Admin GAS Sync Async] Error:", err.message);
      });

      res.status(201).json({
        success: true,
        message: "สร้างรายการจองโดยแอดมินสำเร็จ",
        booking: newBooking
      });
    });
  });

  // Change Booking Status
  app.patch("/api/admin/bookings/:id/status", async (req, res) => {
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

    // Broadcast SSE update
    broadcastSSE("booking:updated", {
      bookingId: id,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      staffId: booking.staffId,
      date: booking.date,
      time: booking.time
    });

    if (status || paymentSlipUrl !== undefined || paymentStatus) {
      await syncStatusToGas(id, status, { paymentStatus: booking.paymentStatus, paymentSlipUrl: booking.paymentSlipUrl }, booking);
    }
    await autoSyncToGas();

    res.json({
      success: true,
      message: "อัปเดตสถานะคิวจองสำเร็จ",
      data: booking
    });
  });

  // Delete Booking
  app.delete("/api/admin/bookings/:id", async (req, res) => {
    loadDatabase();
    const { id } = req.params;
    const initialLen = db.bookings.length;
    const targetBooking = db.bookings.find((b) => b.id === id);
    db.bookings = db.bookings.filter((b) => b.id !== id);

    if (db.bookings.length === initialLen) {
      return res.status(404).json({ success: false, message: "ไม่พบรายการจองนี้" });
    }

    saveDatabase();

    // Broadcast SSE deletion to free up slots immediately
    broadcastSSE("booking:deleted", {
      bookingId: id,
      staffId: targetBooking?.staffId,
      date: targetBooking?.date,
      time: targetBooking?.time
    });

    await syncDeleteToGas(id, targetBooking);
    await autoSyncToGas();
    res.json({
      success: true,
      message: "ลบรายการจองสำเร็จเรียบร้อย"
    });
  });

  // Create Service
  app.post("/api/admin/services", async (req, res) => {
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
    await autoSyncToGas();

    res.status(201).json({
      success: true,
      message: "เพิ่มบริการใหม่สำเร็จ",
      data: newService
    });
  });

  // Update Service
  app.put("/api/admin/services/:id", async (req, res) => {
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
    await autoSyncToGas();
    res.json({
      success: true,
      message: "อัปเดตข้อมูลบริการสำเร็จ",
      data: db.services[idx]
    });
  });

  // Delete Service
  app.delete("/api/admin/services/:id", async (req, res) => {
    loadDatabase();
    const { id } = req.params;
    db.services = db.services.filter((s) => s.id !== id);
    saveDatabase();
    await autoSyncToGas();
    res.json({
      success: true,
      message: "ลบบริการสำเร็จ"
    });
  });

  // Create Staff
  app.post("/api/admin/staff", async (req, res) => {
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
    await autoSyncToGas();

    res.status(201).json({
      success: true,
      message: "เพิ่มช่างผู้เชี่ยวชาญสำเร็จ",
      data: newStaff
    });
  });

  // Update Staff
  app.put("/api/admin/staff/:id", async (req, res) => {
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
    await autoSyncToGas();
    res.json({
      success: true,
      message: "อัปเดตข้อมูลช่างสำเร็จ",
      data: db.staff[idx]
    });
  });

  // Delete Staff
  app.delete("/api/admin/staff/:id", async (req, res) => {
    loadDatabase();
    const { id } = req.params;
    db.staff = db.staff.filter((s) => s.id !== id);
    saveDatabase();
    await autoSyncToGas();
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

  // Test Sending Luxury HTML Notification Email to Admin
  app.post("/api/admin/gas/test-email", async (req, res) => {
    loadDatabase();
    const url = getGasUrl(req);
    const { email } = req.body;
    if (!url) {
      return res.status(400).json({
        success: false,
        message: "กรุณาระบุ Google Apps Script Web App URL ก่อนทดสอบส่งอีเมล"
      });
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "testEmail",
          email: email || db.settings.ownerEmail || ""
        }),
        redirect: "follow"
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        return res.status(500).json({
          success: false,
          message: "ไม่สามารถแปลงข้อมูลการตอบกลับจาก Google Apps Script: " + text.slice(0, 150)
        });
      }

      if (data && data.success) {
        return res.json({
          success: true,
          message: data.message || `ส่งอีเมลแจ้งเตือนทดสอบดีไซน์หรูหราไปยัง ${data.adminEmail || "Admin"} สำเร็จ!`,
          details: data
        });
      } else {
        return res.status(400).json({
          success: false,
          message: data.message || data.error || "ไม่สามารถส่งอีเมลทดสอบได้",
          details: data
        });
      }
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "เกิดข้อผิดพลาดในการเชื่อมต่อส่งอีเมล: " + err.message
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
        data.bookings.forEach((b) => {
          const bId = (b.ID || b.id || "").toString().trim();
          const phone = formatGasPhone(b.CustomerPhone || b.customerPhone);
          const date = formatGasDate(b.Date || b.date);
          const time = formatGasTime(b.Time || b.time);
          const sig = phone && date && time ? `${phone}_${date}_${time}` : "";

          const existing = db.bookings.find(
            (x) => (bId && x.id === bId) || (sig && `${formatGasPhone(x.customerPhone)}_${x.date}_${x.time}` === sig)
          );

          if (existing) {
            if (b.Status || b.status) existing.status = b.Status || b.status;
            if (b.PaymentStatus || b.paymentStatus) existing.paymentStatus = b.PaymentStatus || b.paymentStatus;
            if (b.PaymentSlipUrl || b.paymentSlipUrl) existing.paymentSlipUrl = b.PaymentSlipUrl || b.paymentSlipUrl;
            if (b.CalendarEventId || b.calendarEventId) existing.calendarEventId = b.CalendarEventId || b.calendarEventId;
          } else {
            db.bookings.push({
              id: bId || `BK-${Date.now().toString(36).toUpperCase()}-${db.bookings.length}`,
              createdAt: b.CreatedAt || b.createdAt || new Date().toISOString(),
              status: b.Status || b.status || "pending",
              date,
              time,
              serviceName: b.ServiceName || b.serviceName || "",
              servicePrice: parseFloat(b.ServicePrice || b.servicePrice) || 0,
              serviceDuration: parseInt(b.ServiceDuration || b.serviceDuration, 10) || 60,
              staffName: b.StaffName || b.staffName || "",
              customerName: b.CustomerName || b.customerName || "",
              customerPhone: phone,
              customerEmail: b.CustomerEmail || b.customerEmail || "",
              specialRequest: b.SpecialRequest || b.specialRequest || "",
              paymentStatus: b.PaymentStatus || b.paymentStatus || "pending",
              paymentSlipUrl: b.PaymentSlipUrl || b.paymentSlipUrl || "",
              calendarEventId: b.CalendarEventId || b.calendarEventId || "",
              lineUserId: b.LineUserId || b.lineUserId || "",
              lineDisplayName: b.LineDisplayName || b.lineDisplayName || ""
            });
          }
        });
      }

      if (Array.isArray(data.services) && data.services.length > 0) {
        data.services.forEach((s) => {
          const sId = (s.ID || s.id || "").toString().trim();
          const sName = (s.Name || s.name || "").toString().trim().toLowerCase();
          if (!sName) return;

          const existing = db.services.find(
            (x) => (sId && x.id === sId) || (x.name && x.name.trim().toLowerCase() === sName)
          );

          if (existing) {
            if (s.Price || s.price) existing.price = parseFloat(s.Price || s.price) || existing.price;
            if (s.DurationMinutes || s.duration) existing.duration = parseInt(s.DurationMinutes || s.duration, 10) || existing.duration;
            if (s.Description || s.description) existing.description = s.Description || s.description;
            if (s.Icon || s.icon) existing.icon = s.Icon || s.icon;
          } else {
            db.services.push({
              id: sId || `srv-${Date.now().toString(36)}-${db.services.length}`,
              name: s.Name || s.name || "",
              category: s.Category || s.category || "General",
              price: parseFloat(s.Price || s.price) || 0,
              duration: parseInt(s.DurationMinutes || s.duration, 10) || 60,
              description: s.Description || s.description || "",
              icon: s.Icon || s.icon || "Sparkles"
            });
          }
        });
      }

      if (Array.isArray(data.staff) && data.staff.length > 0) {
        data.staff.forEach((st) => {
          const stId = (st.ID || st.id || "").toString().trim();
          const stName = (st.Name || st.name || "").toString().trim().toLowerCase();
          const stNick = (st.Nickname || st.nickname || "").toString().trim().toLowerCase();
          const nameKey = stName || stNick;
          if (!nameKey) return;

          const existing = db.staff.find(
            (x) => (stId && x.id === stId) || (x.name && x.name.trim().toLowerCase() === nameKey)
          );

          if (existing) {
            if (st.Role || st.role) existing.role = st.Role || st.role;
            if (st.Experience || st.experience) existing.experience = st.Experience || st.experience;
            if (st.Rating || st.rating) existing.rating = parseFloat(st.Rating || st.rating) || existing.rating;
            if (st.Avatar || st.avatar) existing.avatar = st.Avatar || st.avatar;
            if (st.Bio || st.bio) existing.bio = st.Bio || st.bio;
          } else {
            const nick = (st.Nickname || st.Name || "staff").toLowerCase().replace(/[^a-z0-9]/g, "");
            db.staff.push({
              id: stId || `stf-${nick || db.staff.length}`,
              name: st.Name || st.name || "",
              nickname: st.Nickname || st.nickname || st.Name || "",
              role: st.Role || st.role || "Therapist",
              experience: st.Experience || st.experience || "ประสบการณ์ 3 ปี",
              rating: parseFloat(st.Rating || st.rating) || 5.0,
              avatar: st.Avatar || st.avatar || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300",
              skills: typeof st.Services === "string" ? st.Services.split(",").map((x) => x.trim()) : (st.skills || []),
              bio: st.Bio || st.bio || ""
            });
          }
        });
      }

      if (Array.isArray(data.customers) && data.customers.length > 0) {
        data.customers.forEach((c) => {
          const phone = formatGasPhone(c["Customer Phone"] || c.customerPhone);
          if (!phone) return;

          const existing = db.customers.find((x) => x.customerPhone === phone);
          if (existing) {
            existing.totalBookings = Math.max(existing.totalBookings || 1, parseInt(c["Total Bookings"] || c.totalBookings, 10) || 1);
            existing.totalSpent = Math.max(existing.totalSpent || 0, parseFloat(c["Total Spent (THB)"] || c.totalSpent) || 0);
            if (c["Customer Name"] || c.customerName) existing.customerName = c["Customer Name"] || c.customerName;
            if (c["Customer Email"] || c.customerEmail) existing.customerEmail = c["Customer Email"] || c.customerEmail;
          } else {
            db.customers.push({
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
      }

      sanitizeDatabase(db);
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
