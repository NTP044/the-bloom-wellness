/**
 * The Bloom Studio - Google Apps Script (Code.gs)
 * All-in-One Google Workspace Integration (Spreadsheet, Drive, Calendar, Mail, Session, UrlFetch)
 * รองรับการเชื่อมข้อมูล 2 ทิศทาง (Two-Way Real-Time Synchronization) ทั้ง 5 แท็บ
 */

export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * =========================================================================
 * 🌸 The Bloom Studio - Google Apps Script All-in-One Integration
 * Curated Beauty & Wellness Spa Management System
 * =========================================================================
 * Google Services Used (All-in-One Authorization):
 *  1. SpreadsheetApp - จัดการ 5 แท็บชีต (Bookings, Services, Staff, Customers, Settings)
 *  2. DriveApp       - จัดการโฟลเดอร์เก็บสลิปและเอกสารร้าน
 *  3. CalendarApp    - ซิงค์นัดหมายลง Google Calendar ของร้านอัตโนมัติ
 *  4. MailApp        - ส่งอีเมลแจ้งเตือนการจองคิวใหม่ถึง Admin/Owner
 *  5. Session        - ตรวจสอบบัญชีผู้ใช้งานที่เปิดระบบ
 *  6. UrlFetchApp    - ส่ง Webhook กลับมายัง Server ของระบบจอง
 * =========================================================================
 */

/**
 * ⚡ ALL-IN-ONE AUTHORIZATION TRIGGER
 * เรียกใช้งาน Services ทั้ง 6 ตัวไว้ในฟังก์ชันเริ่มต้น เพื่อขอสิทธิ์ครบ 100% ในคลิกเดียว
 */
function authorizeAllServices() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const rootFolder = DriveApp.getRootFolder();
    const defaultCal = CalendarApp.getDefaultCalendar();
    const quota = MailApp.getRemainingDailyQuota();
    const userEmail = Session.getActiveUser().getEmail();
    const testPing = UrlFetchApp.getRequest("https://www.google.com");

    Logger.log("✅ All Google Services Authorized Successfully! User: " + userEmail + ", Mail Quota: " + quota);
    return { success: true, user: userEmail, mailQuota: quota };
  } catch (err) {
    Logger.log("⚠️ Authorization check warning: " + err.toString());
    return { success: false, error: err.toString() };
  }
}

/**
 * 🌸 Google Sheet Custom Menu เมื่อเปิดไฟล์ชีต
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu("🌸 The Bloom Studio")
    .addItem("⚡ 1-Click Setup โครงสร้าง 5 แท็บ & ขอสิทธิ์ทั้งหมด", "setupSheets")
    .addSeparator()
    .addItem("📥 ส่งข้อมูลจากชีตกลับไประบบจอง (Push to System Webhook)", "pushToWebApp")
    .addItem("📤 ดึงข้อมูลล่าสุดจากระบบจองลงชีต (Pull from System)", "pullFromWebApp")
    .addSeparator()
    .addItem("📁 เปิดโฟลเดอร์ Google Drive", "openDriveFolder")
    .addItem("📅 เปิดดู Google Calendar", "openCalendar")
    .addItem("✉️ ทดสอบส่งอีเมลแจ้งเตือน Admin", "testEmailNotification")
    .addToUi();
}

/**
 * 1. ฟังก์ชัน 1-Click Setup: สร้างและจัดรูปแบบ 5 แท็บเริ่มต้นอัตโนมัติ
 */
function setupSheets() {
  authorizeAllServices();
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. แท็บ Bookings (18 คอลัมน์)
  let bookingsSheet = ss.getSheetByName("Bookings");
  if (!bookingsSheet) {
    bookingsSheet = ss.insertSheet("Bookings");
  }
  const bookingsHeaders = [
    "ID", "CreatedAt", "Status", "Date", "Time",
    "ServiceName", "ServicePrice", "ServiceDuration", "StaffName",
    "CustomerName", "CustomerPhone", "CustomerEmail", "SpecialRequest",
    "PaymentStatus", "PaymentSlipUrl", "CalendarEventId", "LineUserId", "LineDisplayName"
  ];
  if (bookingsSheet.getLastRow() === 0) {
    bookingsSheet.appendRow(bookingsHeaders);
  } else {
    bookingsSheet.getRange(1, 1, 1, bookingsHeaders.length).setValues([bookingsHeaders]);
  }
  // ตั้งค่าคอลัมน์ Phone, Date, Time ให้เป็น Plain Text เพื่อไม่ให้เลข 0 นำหน้าหรือรูปแบบเวลาหาย
  bookingsSheet.getRange("D:E").setNumberFormat("@");
  bookingsSheet.getRange("K:K").setNumberFormat("@");
  formatHeaderRow(bookingsSheet, bookingsHeaders.length, "#F4EAE0", "#3E2723");

  // 2. แท็บ Services (7 คอลัมน์)
  let servicesSheet = ss.getSheetByName("Services");
  if (!servicesSheet) {
    servicesSheet = ss.insertSheet("Services");
  }
  const servicesHeaders = ["ID", "Name", "Category", "Price", "DurationMinutes", "Description", "Icon"];
  const defaultServices = [
    ["srv-nails", "ทำเล็บเจล พรีเมียม (Gel Manicure & Art)", "Nails", 790, 60, "ตัดแต่งทรงเล็บ เคลียร์หนัง ทาสีเจลเกรดพรีเมียมนำเข้าจากเกาหลี พร้อมเคลือบบำรุงหน้าเล็บ", "Sparkles"],
    ["srv-pedicure", "สปาเท้าและเพดิคิวร์อโรมา (Aroma Foot Spa & Pedicure)", "Spa & Care", 990, 75, "แช่เกลือหิมาลายัน สครับผิวผลัดเซลล์ นวดบำรุงด้วยน้ำมันอโรมา พร้อมตัดแต่งทรงเล็บเท้า", "Footprints"],
    ["srv-facial", "ทรีตเมนต์บำรุงผิวหน้าออร์แกนิก (Organic Facial Glow)", "Facial", 1590, 90, "ทำความสะอาดล้ำลึก ผลักวิตามินเข้มข้น นวดกระตุ้นคอลลาเจน และมาสก์ทองคำเปล่งประกาย", "Smile"],
    ["srv-massage", "นวดอโรมาเธอราปีผ่อนคลาย (Aromatherapy Body Massage)", "Massage", 1290, 60, "นวดน้ำมันกลิ่นเอกลักษณ์สูตร The Bloom Studio ช่วยคลายกล้ามเนื้อและความตึงเครียด", "HeartHandshake"],
    ["srv-guasha", "นวดกัวซาหน้ายกกระชับ & หินร้อน (Facial Gua Sha & Hot Stone)", "Facial & Spa", 1490, 75, "ศาสตร์กัวซายกกระชับกรอบหน้า กระตุ้นการไหลเวียนโลหิต ผสานหินร้อนสปาคลายความตึง", "Flame"],
    ["srv-lashes", "ต่อขนตาเส้นต่อเส้นสไตล์เกาหลี (Natural Lash Extension)", "Lashes", 1200, 90, "ต่อขนตาเกรดไหมพรีเมียมนุ่มเบา ไม่ระคายเคืองตา ดูเป็นธรรมชาติและอ่อนหวาน", "Eye"]
  ];
  if (servicesSheet.getLastRow() <= 1) {
    servicesSheet.clear();
    servicesSheet.appendRow(servicesHeaders);
    defaultServices.forEach(row => servicesSheet.appendRow(row));
  }
  formatHeaderRow(servicesSheet, servicesHeaders.length, "#F4EAE0", "#3E2723");

  // 3. แท็บ Staff (9 คอลัมน์)
  let staffSheet = ss.getSheetByName("Staff");
  if (!staffSheet) {
    staffSheet = ss.insertSheet("Staff");
  }
  const staffHeaders = ["ID", "Name", "Nickname", "Role", "Experience", "Rating", "Avatar", "Services", "Bio"];
  const defaultStaff = [
    ["stf-mina", "คุณมีนา สุขเกษม", "มีนา (Mina)", "Senior Nail & Spa Artist", "ประสบการณ์ 6 ปี", 4.95, "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300", "srv-nails, srv-pedicure, srv-lashes", "เชี่ยวชาญการออกแบบลายเล็บสไตล์มินิมอลเกาหลีและงานดีเทลประณีต"],
    ["stf-linda", "คุณลินดา รัตนกุล", "ลินดา (Linda)", "Facial & Wellness Therapist", "ประสบการณ์ 8 ปี", 4.98, "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300", "srv-facial, srv-massage, srv-pedicure, srv-guasha", "ผู้เชี่ยวชาญด้านการวิเคราะห์สภาพผิว ทรีตเมนต์ยกกระชับ และศาสตร์กัวซา"],
    ["stf-ava", "คุณเอวา พงศ์ไพศาล", "เอวา (Ava)", "Holistic Spa & Body Specialist", "ประสบการณ์ 7 ปี", 4.92, "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300", "srv-massage, srv-guasha, srv-facial", "เชี่ยวชาญศาสตร์การนวดคลายจุดกล้ามเนื้อลึก อโรมาเธอราปี และหินร้อนบำบัด"],
    ["stf-praewa", "คุณแพรวา วงศ์สว่าง", "แพรวา (Praewa)", "Lash & Nail Design Master", "ประสบการณ์ 5 ปี", 4.96, "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300", "srv-nails, srv-lashes, srv-pedicure", "ผู้ชำนาญการต่อขนตาเส้นต่อเส้นและการดูแลเล็บสุขภาพดี"]
  ];
  if (staffSheet.getLastRow() <= 1) {
    staffSheet.clear();
    staffSheet.appendRow(staffHeaders);
    defaultStaff.forEach(row => staffSheet.appendRow(row));
  }
  formatHeaderRow(staffSheet, staffHeaders.length, "#F4EAE0", "#3E2723");

  // 4. แท็บ Customers (CRM 7 คอลัมน์)
  let customersSheet = ss.getSheetByName("Customers");
  if (!customersSheet) {
    customersSheet = ss.insertSheet("Customers");
  }
  const customersHeaders = ["Customer Phone", "Customer Name", "Customer Email", "Total Bookings", "Total Spent (THB)", "Last Visit Date", "LINE User ID"];
  if (customersSheet.getLastRow() === 0) {
    customersSheet.appendRow(customersHeaders);
  } else {
    customersSheet.getRange(1, 1, 1, customersHeaders.length).setValues([customersHeaders]);
  }
  customersSheet.getRange("A:A").setNumberFormat("@");
  formatHeaderRow(customersSheet, customersHeaders.length, "#FDEBD0", "#7E3B00");

  // 5. แท็บ Settings (3 คอลัมน์)
  let settingsSheet = ss.getSheetByName("Settings");
  if (!settingsSheet) {
    settingsSheet = ss.insertSheet("Settings");
  }
  const settingsHeaders = ["Key", "Value", "Description"];

  // เตรียมโฟลเดอร์ Google Drive
  let driveFolderUrl = "";
  let driveFolderId = "";
  try {
    const existingFolders = DriveApp.getFoldersByName("The Bloom Studio - Slips & Attachments");
    let targetFolder;
    if (existingFolders.hasNext()) {
      targetFolder = existingFolders.next();
    } else {
      targetFolder = DriveApp.createFolder("The Bloom Studio - Slips & Attachments");
    }
    driveFolderUrl = targetFolder.getUrl();
    driveFolderId = targetFolder.getId();
  } catch (err) {
    driveFolderUrl = "https://drive.google.com";
  }

  const defaultSettings = [
    ["OwnerEmail", Session.getActiveUser().getEmail() || "NatapongMumklang@gmail.com", "อีเมลเจ้าของร้านสำหรับรับการแจ้งเตือนคิวจอง"],
    ["PromptPayNumber", "0812345678", "เบอร์พร้อมเพย์รับชำระเงินของ The Bloom Studio"],
    ["ShopName", "The Bloom Studio", "ชื่อแบรนด์ร้านความงามและสปา"],
    ["ServerWebhookUrl", "", "URL เซิร์ฟเวอร์ของระบบจอง"],
    ["GoogleDriveFolderUrl", driveFolderUrl, "ลิงก์โฟลเดอร์ Google Drive เก็บสลิปและไฟล์แนบ"],
    ["GoogleDriveFolderId", driveFolderId, "Folder ID ของ Google Drive"],
    ["GoogleCalendarId", "primary", "ID ของ Google Calendar ที่ใช้ลงบันทึกนัดหมาย"]
  ];

  if (settingsSheet.getLastRow() <= 1) {
    settingsSheet.clear();
    settingsSheet.appendRow(settingsHeaders);
    defaultSettings.forEach(row => settingsSheet.appendRow(row));
  }
  settingsSheet.getRange("B:B").setNumberFormat("@");
  formatHeaderRow(settingsSheet, settingsHeaders.length, "#F4EAE0", "#3E2723");

  // ลบ Sheet1 ค่าเริ่มต้นหากมี
  const defaultSheet1 = ss.getSheetByName("Sheet1");
  if (defaultSheet1 && ss.getSheets().length > 1) {
    try { ss.deleteSheet(defaultSheet1); } catch (e) {}
  }

  return {
    success: true,
    message: "สร้างโครงสร้าง 5 แท็บชีต และเชื่อมต่อ Google Workspace สำเร็จเรียบร้อยแล้ว!",
    sheets: ["Bookings", "Services", "Staff", "Customers", "Settings"],
    driveFolderUrl: driveFolderUrl,
    sheetUrl: ss.getUrl()
  };
}

/**
 * ฟังก์ชันช่วยจัดรูปแบบหัวตารางและ Freeze แถวแรก
 */
function formatHeaderRow(sheet, numColumns, bgColor, textColor) {
  sheet.setFrozenRows(1);
  const headerRange = sheet.getRange(1, 1, 1, numColumns);
  headerRange
    .setBackground(bgColor)
    .setFontColor(textColor)
    .setFontWeight("bold")
    .setFontFamily("Sarabun")
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle");
  sheet.setRowHeight(1, 38);
  for (let i = 1; i <= numColumns; i++) {
    sheet.autoResizeColumn(i);
  }
}

/**
 * =========================================================================
 * WEB APP API HANDLERS (doGet & doPost)
 * รองรับการเชื่อมต่อกับระบบหลังบ้านผ่าน JSON RESTful API
 * =========================================================================
 */

function doGet(e) {
  const action = e && e.parameter ? e.parameter.action : "ping";
  let result = {};

  if (action === "ping") {
    result = {
      success: true,
      status: "online",
      app: "The Bloom Studio Google Apps Script Web App",
      timestamp: new Date().toISOString(),
      user: Session.getActiveUser().getEmail()
    };
  } else if (action === "setup") {
    result = setupSheets();
  } else if (action === "pullAll") {
    result = pullAllData();
  } else if (action === "counts") {
    result = getSheetCounts();
  } else {
    result = { success: false, message: "Unknown action: " + action };
  }

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  let result = {};
  try {
    let body = {};
    if (e && e.postData && e.postData.contents) {
      body = JSON.parse(e.postData.contents);
    }
    const action = body.action || (e && e.parameter ? e.parameter.action : "ping");

    if (action === "ping") {
      result = {
        success: true,
        status: "online",
        timestamp: new Date().toISOString(),
        user: Session.getActiveUser().getEmail()
      };
    } else if (action === "setup") {
      result = setupSheets();
    } else if (action === "pushAll") {
      result = pushAllData(body.data);
    } else if (action === "pullAll") {
      result = pullAllData();
    } else if (action === "counts") {
      result = getSheetCounts();
    } else if (action === "addBooking") {
      result = handleAddBooking(body.booking);
    } else if (action === "updateBookingStatus") {
      result = handleUpdateBookingStatus(body.bookingId, body.status, body.updates);
    } else if (action === "deleteBooking") {
      result = handleDeleteBooking(body.bookingId);
    } else if (action === "syncServices") {
      result = syncServicesData(body.services);
    } else if (action === "syncStaff") {
      result = syncStaffData(body.staff);
    } else {
      result = { success: false, message: "Action not supported: " + action };
    }
  } catch (err) {
    result = { success: false, error: err.toString() };
  }

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * ดึงจำนวนแถวของแต่ละแท็บ
 */
function getSheetCounts() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const getCount = (name) => {
    const s = ss.getSheetByName(name);
    return s ? Math.max(0, s.getLastRow() - 1) : 0;
  };
  return {
    success: true,
    status: "online",
    user: Session.getActiveUser().getEmail(),
    timestamp: new Date().toISOString(),
    counts: {
      bookings: getCount("Bookings"),
      services: getCount("Services"),
      staff: getCount("Staff"),
      customers: getCount("Customers"),
      settings: getCount("Settings")
    }
  };
}

/**
 * ดึงข้อมูลทั้งหมดจาก 5 แท็บชีต (ใช้ getDisplayValues เพื่อรักษา string และเลข 0 นำหน้า)
 */
function pullAllData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const getSheetData = (sheetName) => {
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) return [];
    const values = sheet.getDataRange().getDisplayValues();
    if (values.length <= 1) return [];
    const headers = values[0];
    return values.slice(1).map(row => {
      let obj = {};
      headers.forEach((h, idx) => { obj[h] = row[idx] !== undefined ? row[idx] : ""; });
      return obj;
    });
  };

  return {
    success: true,
    sheetUrl: ss.getUrl(),
    data: {
      bookings: getSheetData("Bookings"),
      services: getSheetData("Services"),
      staff: getSheetData("Staff"),
      customers: getSheetData("Customers"),
      settings: getSheetData("Settings")
    },
    timestamp: new Date().toISOString()
  };
}

/**
 * นำข้อมูลจากระบบหลังบ้านไปเขียนลง Google Sheet ทั้ง 5 แท็บ 100% จริงทุกแท็บ
 */
function pushAllData(dbData) {
  if (!dbData) return { success: false, message: "No data provided" };
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. ซิงค์แท็บ Bookings
  if (Array.isArray(dbData.bookings)) {
    let sheet = ss.getSheetByName("Bookings");
    if (!sheet) {
      setupSheets();
      sheet = ss.getSheetByName("Bookings");
    }
    sheet.clear();
    const headers = [
      "ID", "CreatedAt", "Status", "Date", "Time",
      "ServiceName", "ServicePrice", "ServiceDuration", "StaffName",
      "CustomerName", "CustomerPhone", "CustomerEmail", "SpecialRequest",
      "PaymentStatus", "PaymentSlipUrl", "CalendarEventId", "LineUserId", "LineDisplayName"
    ];
    sheet.appendRow(headers);
    sheet.getRange("D:E").setNumberFormat("@");
    sheet.getRange("K:K").setNumberFormat("@");

    dbData.bookings.forEach(b => {
      sheet.appendRow([
        String(b.id || ""),
        String(b.createdAt || ""),
        String(b.status || "pending"),
        String(b.date || ""),
        String(b.time || ""),
        String(b.serviceName || ""),
        Number(b.servicePrice) || 0,
        Number(b.serviceDuration) || 60,
        String(b.staffName || ""),
        String(b.customerName || ""),
        String(b.customerPhone || ""),
        String(b.customerEmail || ""),
        String(b.specialRequest || ""),
        String(b.paymentStatus || "pending"),
        String(b.paymentSlipUrl || ""),
        String(b.calendarEventId || ""),
        String(b.lineUserId || ""),
        String(b.lineDisplayName || "")
      ]);
    });
    formatHeaderRow(sheet, headers.length, "#F4EAE0", "#3E2723");
  }

  // 2. ซิงค์แท็บ Services
  if (Array.isArray(dbData.services)) {
    syncServicesData(dbData.services);
  }

  // 3. ซิงค์แท็บ Staff
  if (Array.isArray(dbData.staff)) {
    syncStaffData(dbData.staff);
  }

  // 4. ซิงค์แท็บ Customers
  if (Array.isArray(dbData.customers)) {
    let sheet = ss.getSheetByName("Customers");
    if (!sheet) {
      sheet = ss.insertSheet("Customers");
    }
    sheet.clear();
    const headers = ["Customer Phone", "Customer Name", "Customer Email", "Total Bookings", "Total Spent (THB)", "Last Visit Date", "LINE User ID"];
    sheet.appendRow(headers);
    sheet.getRange("A:A").setNumberFormat("@");

    dbData.customers.forEach(c => {
      sheet.appendRow([
        String(c.customerPhone || c["Customer Phone"] || ""),
        String(c.customerName || c["Customer Name"] || ""),
        String(c.customerEmail || c["Customer Email"] || ""),
        Number(c.totalBookings || c["Total Bookings"]) || 1,
        Number(c.totalSpent || c["Total Spent (THB)"]) || 0,
        String(c.lastVisitDate || c["Last Visit Date"] || ""),
        String(c.lineUserId || c["LINE User ID"] || "")
      ]);
    });
    formatHeaderRow(sheet, headers.length, "#FDEBD0", "#7E3B00");
  }

  // 5. ซิงค์แท็บ Settings
  if (dbData.settings && typeof dbData.settings === "object") {
    let sheet = ss.getSheetByName("Settings");
    if (!sheet) {
      sheet = ss.insertSheet("Settings");
    }
    sheet.clear();
    const headers = ["Key", "Value", "Description"];
    sheet.appendRow(headers);
    sheet.getRange("B:B").setNumberFormat("@");

    const st = dbData.settings;
    const settingsRows = [
      ["OwnerEmail", String(st.ownerEmail || Session.getActiveUser().getEmail() || ""), "อีเมลเจ้าของร้านสำหรับรับการแจ้งเตือนคิวจอง"],
      ["PromptPayNumber", String(st.promptPayNumber || "0812345678"), "เบอร์พร้อมเพย์รับชำระเงินของ The Bloom Studio"],
      ["ShopName", String(st.shopName || "The Bloom Studio"), "ชื่อแบรนด์ร้านความงามและสปา"],
      ["ServerWebhookUrl", String(st.serverWebhookUrl || ""), "URL เซิร์ฟเวอร์ของระบบจอง"],
      ["GoogleDriveFolderUrl", String(st.googleDriveFolderUrl || ""), "ลิงก์โฟลเดอร์ Google Drive เก็บสลิปและไฟล์แนบ"],
      ["GoogleDriveFolderId", String(st.googleDriveFolderId || ""), "Folder ID ของ Google Drive"],
      ["GoogleCalendarId", String(st.googleCalendarId || "primary"), "ID ของ Google Calendar ที่ใช้ลงบันทึกนัดหมาย"]
    ];
    settingsRows.forEach(row => sheet.appendRow(row));
    formatHeaderRow(sheet, headers.length, "#F4EAE0", "#3E2723");
  }

  return {
    success: true,
    message: "ซิงค์ข้อมูลขึ้น Google Sheet สำเร็จครบทั้ง 5 แท็บเรียบร้อยแล้ว!",
    timestamp: new Date().toISOString()
  };
}

/**
 * อัปเดตแท็บ Services
 */
function syncServicesData(services) {
  if (!Array.isArray(services)) return { success: false, message: "Invalid services array" };
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("Services");
  if (!sheet) {
    sheet = ss.insertSheet("Services");
  }
  sheet.clear();
  const headers = ["ID", "Name", "Category", "Price", "DurationMinutes", "Description", "Icon"];
  sheet.appendRow(headers);

  services.forEach(s => {
    sheet.appendRow([
      String(s.id || ""),
      String(s.name || ""),
      String(s.category || "General"),
      Number(s.price) || 0,
      Number(s.duration || s.durationMinutes) || 60,
      String(s.description || ""),
      String(s.icon || "Sparkles")
    ]);
  });
  formatHeaderRow(sheet, headers.length, "#F4EAE0", "#3E2723");
  return { success: true, count: services.length };
}

/**
 * อัปเดตแท็บ Staff
 */
function syncStaffData(staffList) {
  if (!Array.isArray(staffList)) return { success: false, message: "Invalid staff array" };
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("Staff");
  if (!sheet) {
    sheet = ss.insertSheet("Staff");
  }
  sheet.clear();
  const headers = ["ID", "Name", "Nickname", "Role", "Experience", "Rating", "Avatar", "Services", "Bio"];
  sheet.appendRow(headers);

  staffList.forEach(st => {
    const srvSkills = Array.isArray(st.skills) ? st.skills.join(", ") : String(st.skills || st.services || "");
    sheet.appendRow([
      String(st.id || ""),
      String(st.name || ""),
      String(st.nickname || st.name || ""),
      String(st.role || "Therapist"),
      String(st.experience || ""),
      Number(st.rating) || 5.0,
      String(st.avatar || ""),
      srvSkills,
      String(st.bio || "")
    ]);
  });
  formatHeaderRow(sheet, headers.length, "#F4EAE0", "#3E2723");
  return { success: true, count: staffList.length };
}

/**
 * รับการจองใหม่: เขียนลงชีต Bookings, บันทึก Calendar Event, ส่งเมลหา Admin, อัปเดต Customers CRM
 */
function handleAddBooking(b) {
  if (!b) return { success: false, message: "No booking data" };
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("Bookings");
  if (!sheet) {
    setupSheets();
    sheet = ss.getSheetByName("Bookings");
  }

  // 1. สร้าง Calendar Event
  let calendarEventId = "";
  try {
    const cal = CalendarApp.getDefaultCalendar();
    const durationMin = Number(b.serviceDuration) || 60;
    const startDate = new Date(b.date + "T" + b.time + ":00");
    const endDate = new Date(startDate.getTime() + durationMin * 60000);

    const title = "🌸 [The Bloom Studio] " + b.serviceName + " - " + b.customerName;
    const desc = "บริการ: " + b.serviceName +
      "\\nช่างดูแล: " + b.staffName +
      "\\nลูกค้า: " + b.customerName + " (" + b.customerPhone + ")" +
      "\\nคำขอพิเศษ: " + (b.specialRequest || "-") +
      "\\nรหัสคิวจอง: " + b.id;

    const event = cal.createEvent(title, startDate, endDate, {
      description: desc,
      location: "The Bloom Studio"
    });
    calendarEventId = event.getId();
  } catch (calErr) {
    Logger.log("Calendar error: " + calErr.toString());
  }

  // 2. บันทึกลงแถวชีต Bookings (Upsert: ป้องกันการเพิ่มแถวซ้ำหาก ID มีอยู่แล้ว)
  const bookingRowData = [
    String(b.id || ("BK-" + Date.now())),
    String(b.createdAt || new Date().toISOString()),
    String(b.status || "pending"),
    String(b.date || ""),
    String(b.time || ""),
    String(b.serviceName || ""),
    Number(b.servicePrice) || 0,
    Number(b.serviceDuration) || 60,
    String(b.staffName || ""),
    String(b.customerName || ""),
    String(b.customerPhone || ""),
    String(b.customerEmail || ""),
    String(b.specialRequest || ""),
    String(b.paymentStatus || "pending"),
    String(b.paymentSlipUrl || ""),
    calendarEventId,
    String(b.lineUserId || ""),
    String(b.lineDisplayName || "")
  ];

  const bookingId = String(b.id || "").trim();
  const lastRow = sheet.getLastRow();
  let existingRow = -1;
  if (bookingId && lastRow > 1) {
    const idValues = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    for (let i = 0; i < idValues.length; i++) {
      if (String(idValues[i][0]).trim() === bookingId) {
        existingRow = i + 2;
        break;
      }
    }
  }

  if (existingRow > 0) {
    sheet.getRange(existingRow, 1, 1, bookingRowData.length).setValues([bookingRowData]);
  } else {
    sheet.appendRow(bookingRowData);
  }

  // 3. ส่งอีเมลแจ้งเตือนเจ้าของร้าน
  try {
    const userEmail = Session.getActiveUser().getEmail() || "NatapongMumklang@gmail.com";
    const subject = "🌸 คิวจองใหม่: " + b.serviceName + " (" + b.customerName + ") - " + b.date + " " + b.time;
    const body = "แจ้งเตือนคิวจองใหม่ The Bloom Studio\\n\\n" +
      "รหัสการจอง: " + b.id + "\\n" +
      "บริการ: " + b.serviceName + " (" + b.servicePrice + " บาท)\\n" +
      "ช่างผู้ดูแล: " + b.staffName + "\\n" +
      "วันและเวลานัด: " + b.date + " เวลา " + b.time + " น.\\n" +
      "ลูกค้า: " + b.customerName + " โทร " + b.customerPhone + "\\n" +
      "หมายเหตุ: " + (b.specialRequest || "-") + "\\n\\n" +
      "ระบบได้บันทึกนัดหมายลง Google Calendar เรียบร้อยแล้ว";
    MailApp.sendEmail(userEmail, subject, body);
  } catch (mailErr) {
    Logger.log("Mail error: " + mailErr.toString());
  }

  // 4. อัปเดต Customers CRM
  try {
    const custSheet = ss.getSheetByName("Customers");
    if (custSheet) {
      const custData = custSheet.getDataRange().getDisplayValues();
      let foundIndex = -1;
      for (let i = 1; i < custData.length; i++) {
        if (custData[i][0] === String(b.customerPhone)) {
          foundIndex = i + 1;
          break;
        }
      }
      if (foundIndex > 0) {
        const curBookings = parseInt(custSheet.getRange(foundIndex, 4).getValue() || 0, 10);
        const curSpent = parseFloat(custSheet.getRange(foundIndex, 5).getValue() || 0);
        custSheet.getRange(foundIndex, 4).setValue(curBookings + 1);
        custSheet.getRange(foundIndex, 5).setValue(curSpent + (parseFloat(b.servicePrice) || 0));
        custSheet.getRange(foundIndex, 6).setValue(b.date);
      } else {
        custSheet.appendRow([
          String(b.customerPhone),
          String(b.customerName),
          String(b.customerEmail || ""),
          1,
          parseFloat(b.servicePrice) || 0,
          String(b.date),
          String(b.lineUserId || "")
        ]);
      }
    }
  } catch (crmErr) {
    Logger.log("CRM update error: " + crmErr.toString());
  }

  return {
    success: true,
    message: "บันทึกคิวจองลง Google Sheet, Calendar, และส่งเมลแจ้งเตือนสำเร็จ",
    calendarEventId: calendarEventId
  };
}

/**
 * อัปเดตสถานะการจองในชีต Bookings
 */
function handleUpdateBookingStatus(bookingId, newStatus, updates) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Bookings");
  if (!sheet) return { success: false, message: "Sheet Bookings not found" };

  const data = sheet.getDataRange().getDisplayValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === bookingId) {
      const rowIndex = i + 1;
      if (newStatus) sheet.getRange(rowIndex, 3).setValue(newStatus);
      if (updates && updates.paymentStatus) sheet.getRange(rowIndex, 14).setValue(updates.paymentStatus);
      if (updates && updates.paymentSlipUrl) sheet.getRange(rowIndex, 15).setValue(updates.paymentSlipUrl);
      return { success: true, message: "Updated booking " + bookingId };
    }
  }
  return { success: false, message: "Booking ID not found: " + bookingId };
}

/**
 * ลบรายการจองออกจากชีต Bookings และลบ Event ใน Google Calendar
 */
function handleDeleteBooking(bookingId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Bookings");
  if (!sheet) return { success: false, message: "Sheet Bookings not found" };

  const data = sheet.getDataRange().getDisplayValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === bookingId) {
      const calendarEventId = data[i][15]; // Column P
      if (calendarEventId) {
        try {
          const cal = CalendarApp.getDefaultCalendar();
          const ev = cal.getEventById(calendarEventId);
          if (ev) ev.deleteEvent();
        } catch (calErr) {
          Logger.log("Could not delete calendar event: " + calErr);
        }
      }
      sheet.deleteRow(i + 1);
      return { success: true, message: "Deleted booking " + bookingId + " from Google Sheet" };
    }
  }
  return { success: false, message: "Booking ID not found in sheet: " + bookingId };
}

/**
 * ส่งข้อมูลทั้งหมดจาก Google Sheet กลับไปอัปเดตระบบเว็บแอป (Push to Webhook)
 */
function pushToWebApp() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const settingsSheet = ss.getSheetByName("Settings");
  let webhookUrl = "";

  if (settingsSheet) {
    const sData = settingsSheet.getDataRange().getDisplayValues();
    const found = sData.find(r => r[0] === "ServerWebhookUrl");
    if (found && found[1]) webhookUrl = found[1].trim();
  }

  if (!webhookUrl) {
    SpreadsheetApp.getUi().alert("กรุณาระบุ ServerWebhookUrl ในแท็บ Settings ก่อน เพื่อใช้ส่งข้อมูลกลับเข้าระบบ");
    return;
  }

  const allData = pullAllData();
  try {
    const options = {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify({
        action: "syncFromSheet",
        data: allData.data
      }),
      muteHttpExceptions: true
    };
    const response = UrlFetchApp.fetch(webhookUrl, options);
    SpreadsheetApp.getUi().alert("ส่งข้อมูลจาก Google Sheet กลับไปยังระบบจองสำเร็จ! (" + response.getResponseCode() + ")");
  } catch (err) {
    SpreadsheetApp.getUi().alert("เกิดข้อผิดพลาดในการส่ง Webhook: " + err.toString());
  }
}

/**
 * ดึงข้อมูลล่าสุดจากระบบจองมาอัปเดตลง Google Sheet
 */
function pullFromWebApp() {
  SpreadsheetApp.getUi().alert("ระบบจองเว็บแอปมีระบบ Auto-Sync ส่งข้อมูลมาอัปเดตให้อัตโนมัติทุกครั้งที่มีการจองหรือแก้ไขครับ");
}

/**
 * เมนู: เปิดโฟลเดอร์ Google Drive
 */
function openDriveFolder() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const settingsSheet = ss.getSheetByName("Settings");
  let folderUrl = "https://drive.google.com";
  if (settingsSheet) {
    const data = settingsSheet.getDataRange().getDisplayValues();
    const row = data.find(r => r[0] === "GoogleDriveFolderUrl");
    if (row && row[1]) folderUrl = row[1];
  }
  const html = '<script>window.open("' + folderUrl + '", "_blank");google.script.host.close();</script>';
  SpreadsheetApp.getUi().showModalDialog(HtmlService.createHtmlOutput(html).setWidth(300).setHeight(100), "กำลังเปิด Google Drive...");
}

/**
 * เมนู: เปิด Google Calendar
 */
function openCalendar() {
  const calendarUrl = "https://calendar.google.com";
  const html = '<script>window.open("' + calendarUrl + '", "_blank");google.script.host.close();</script>';
  SpreadsheetApp.getUi().showModalDialog(HtmlService.createHtmlOutput(html).setWidth(300).setHeight(100), "กำลังเปิด Google Calendar...");
}

/**
 * เมนู: ทดสอบส่งอีเมลแจ้งเตือน Admin
 */
function testEmailNotification() {
  const userEmail = Session.getActiveUser().getEmail();
  if (!userEmail) {
    SpreadsheetApp.getUi().alert("ไม่พบบัญชีอีเมลผู้ใช้งาน กรุณาลงชื่อเข้าใช้ Google");
    return;
  }
  const subject = "🌸 [ทดสอบระบบ] The Bloom Studio - Google Workspace Notification";
  const body = "สวัสดีคุณแอดมิน,\\n\\nนี่คือข้อความทดสอบการเชื่อมต่อระบบแจ้งเตือนผ่าน Google Apps Script (MailApp) ของ The Bloom Studio สำเร็จเรียบร้อยแล้ว!\\n\\nวันเวลา: " + new Date().toLocaleString("th-TH");
  MailApp.sendEmail(userEmail, subject, body);
  SpreadsheetApp.getUi().alert("ส่งอีเมลทดสอบไปยัง " + userEmail + " เรียบร้อยแล้ว!");
}
`;
