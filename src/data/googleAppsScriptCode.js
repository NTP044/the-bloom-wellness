/**
 * The Bloom Studio - Google Apps Script (Code.gs)
 * All-in-One Google Workspace Integration (Spreadsheet, Drive, Calendar, Mail, Session, UrlFetch)
 * ระบบจัดการคิวจองและส่งอีเมลแจ้งเตือน Gmail อัตโนมัติ (Luxury HTML Email Templates)
 */

export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * =========================================================================
 * 🌸 The Bloom Studio - Google Apps Script All-in-One Integration
 * Curated Beauty & Wellness Spa Management System
 * =========================================================================
 * Google Services Used:
 *  1. SpreadsheetApp - จัดการ 5 แท็บชีต (Bookings, Services, Staff, Customers, Settings)
 *  2. DriveApp       - จัดการโฟลเดอร์เก็บสลิปและเอกสารร้าน
 *  3. CalendarApp    - ซิงค์นัดหมายลง Google Calendar ของร้านอัตโนมัติ
 *  4. MailApp / Gmail - ส่งอีเมลแจ้งเตือน HTML ดีไซน์หรูหราถึง Admin/Owner
 *  5. Session        - ตรวจสอบบัญชีผู้ใช้งานที่เปิดระบบ
 *  6. UrlFetchApp    - ส่ง Webhook เชื่อมต่อกับระบบจอง
 * =========================================================================
 */

/**
 * ⚡ ALL-IN-ONE AUTHORIZATION TRIGGER
 * เรียกใช้งาน Services ทั้งหมดไว้ในฟังก์ชันเริ่มต้น เพื่อขอสิทธิ์ครบ 100% ในคลิกเดียว
 */
function authorizeAllServices() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const rootFolder = DriveApp.getRootFolder();
    const defaultCal = CalendarApp.getDefaultCalendar();
    const quota = MailApp.getRemainingDailyQuota();
    const userEmail = Session.getEffectiveUser().getEmail() || Session.getActiveUser().getEmail();
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
    .addItem("✉️ ทดสอบส่งอีเมลแจ้งเตือน Admin", "testEmailNotification")
    .addSeparator()
    .addItem("📥 ส่งข้อมูลจากชีตกลับไประบบจอง (Push to System Webhook)", "pushToWebApp")
    .addItem("📤 ดึงข้อมูลล่าสุดจากระบบจองลงชีต (Pull from System)", "pullFromWebApp")
    .addSeparator()
    .addItem("📁 เปิดโฟลเดอร์ Google Drive", "openDriveFolder")
    .addItem("📅 เปิดดู Google Calendar", "openCalendar")
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
    defaultServices.forEach(function(row) { servicesSheet.appendRow(row); });
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
    defaultStaff.forEach(function(row) { staffSheet.appendRow(row); });
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

  const effectiveEmail = Session.getEffectiveUser().getEmail() || Session.getActiveUser().getEmail() || "NatapongMumklang@gmail.com";

  const defaultSettings = [
    ["OwnerEmail", effectiveEmail, "อีเมลเจ้าของร้าน/Admin สำหรับรับการแจ้งเตือนคิวจองและการเงินอัตโนมัติ"],
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
    defaultSettings.forEach(function(row) { settingsSheet.appendRow(row); });
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
 * 📧 ADMIN EMAIL CONFIGURATION & LUXURY HTML EMAIL ENGINE
 * =========================================================================
 */

/**
 * 1. ดึงอีเมล Admin จากแท็บ Settings (แถว OwnerEmail)
 * หากไม่ได้ระบุไว้ ให้ดึงอีเมลของเจ้าของบัญชี Google Sheet อัตโนมัติ
 */
function getAdminEmail(ss) {
  try {
    if (!ss) ss = SpreadsheetApp.getActiveSpreadsheet();
    if (ss) {
      const settingsSheet = ss.getSheetByName("Settings");
      if (settingsSheet) {
        const data = settingsSheet.getDataRange().getDisplayValues();
        for (let i = 1; i < data.length; i++) {
          const key = String(data[i][0] || "").trim().toLowerCase();
          const val = String(data[i][1] || "").trim();
          if ((key === "owneremail" || key === "adminemail") && val && val.indexOf("@") !== -1) {
            return val;
          }
        }
      }
    }
  } catch (err) {
    Logger.log("getAdminEmail error: " + err.toString());
  }

  // Fallback: ดึงอีเมลเจ้าของบัญชี Google Sheet อัตโนมัติ
  let fallback = "";
  try {
    fallback = Session.getEffectiveUser().getEmail();
  } catch (e) {}
  if (!fallback) {
    try {
      fallback = Session.getActiveUser().getEmail();
    } catch (e) {}
  }
  return fallback || "NatapongMumklang@gmail.com";
}

/**
 * 2. สร้างโครงสร้าง Luxury HTML Email สไตล์ The Bloom Studio ตรงตามดีไซน์พรีเมียม (Card-Based Luxury Layout)
 */
function buildLuxuryEmailHtml(params) {
  const badgeText = params.badgeText || "🔔 NEW BOOKING ALERT";
  const badgeBg = params.badgeBg || "#1E5A44";
  const badgeColor = params.badgeColor || "#FFFFFF";
  const headerTitle = params.headerTitle || "The Bloom Studio";
  const subTitle = params.subTitle || "มีการจองคิวบริการ Wellness & Beauty ใหม่เข้ามาในระบบ";
  const innerCardHtml = params.innerCardHtml || "";
  const actionButtonHtml = params.actionButtonHtml || "";
  const footerNote = params.footerNote || "ข้อมูลนี้ถูกบันทึกลง Google Sheet และ Google Calendar เรียบร้อยแล้วแบบ Real-Time";

  return '<!DOCTYPE html>' +
  '<html>' +
  '<head>' +
    '<meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
    '<title>' + headerTitle + '</title>' +
  '</head>' +
  '<body style="margin: 0; padding: 0; background-color: #FAF6F0; font-family: Sarabun, Tahoma, Arial, Helvetica, sans-serif; -webkit-font-smoothing: antialiased;">' +
    '<table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FAF6F0; padding: 35px 15px;">' +
      '<tr>' +
        '<td align="center">' +
          '<table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; background-color: #FFFFFF; border-radius: 28px; border: 1px solid #EBE4DA; box-shadow: 0 10px 30px rgba(0,0,0,0.03); overflow: hidden;">' +
            '<tr>' +
              '<td style="padding: 36px 32px 30px 32px;">' +
                '<!-- Top Badge -->' +
                '<div style="text-align: center; margin-bottom: 14px;">' +
                  '<span style="display: inline-block; background-color: ' + badgeBg + '; color: ' + badgeColor + '; font-size: 12px; font-weight: 800; padding: 7px 20px; border-radius: 50px; letter-spacing: 0.8px; text-transform: uppercase;">' +
                    badgeText +
                  '</span>' +
                '</div>' +
                '<!-- Title & Subtitle -->' +
                '<h1 style="margin: 0 0 8px 0; text-align: center; font-size: 26px; font-weight: 800; color: #322520; letter-spacing: -0.2px;">' +
                  headerTitle +
                '</h1>' +
                '<p style="margin: 0 0 22px 0; text-align: center; font-size: 14px; color: #6D5E55; font-weight: 400; line-height: 1.4;">' +
                  subTitle +
                '</p>' +
                '<!-- Divider -->' +
                '<div style="height: 1px; background-color: #EFE8DE; margin: 0 0 24px 0;"></div>' +
                '<!-- Inner Cream Box -->' +
                innerCardHtml +
                '<!-- CTA Action Button -->' +
                actionButtonHtml +
                '<!-- Bottom Footer Note -->' +
                '<p style="margin: 22px 0 0 0; text-align: center; font-size: 13px; color: #3A302A; font-weight: 400; line-height: 1.5;">' +
                  footerNote +
                '</p>' +
              '</td>' +
            '</tr>' +
          '</table>' +
        '</td>' +
      '</tr>' +
    '</table>' +
  '</body>' +
  '</html>';
}

/**
 * 3. เทมเพลต: มีการจองใหม่ (New Booking) - ออกแบบตรงตามตัวอย่างในภาพ 100%
 */
function sendNewBookingEmail(b, ss) {
  if (!b) return false;
  if (!ss) ss = SpreadsheetApp.getActiveSpreadsheet();
  const adminEmail = getAdminEmail(ss);
  if (!adminEmail) return false;

  const subject = "🔔 มีการจองใหม่ - " + (b.customerName || "ลูกค้า") + " " + (b.date || "") + " เวลา " + (b.time || "") + " น.";
  const sheetUrl = ss ? ss.getUrl() : "https://sheets.google.com";
  const duration = Number(b.serviceDuration) || 60;
  const rawPrice = Number(b.servicePrice || 0);
  const formattedPrice = rawPrice.toLocaleString() + " บาท";
  const bookingId = b.id || ("BLM-" + Date.now().toString(36).toUpperCase());
  const slipUrl = b.paymentSlipUrl || "";

  let payStatusText = '<span style="color: #008264; font-weight: 700; font-size: 14px;">แนบสลิปแล้ว (Paid Slip)</span>';
  if (b.paymentStatus === 'pending' && !slipUrl) {
    payStatusText = '<span style="color: #C46210; font-weight: 700; font-size: 14px;">รอชำระเงิน (Pending)</span>';
  } else if (b.paymentStatus === 'confirmed') {
    payStatusText = '<span style="color: #008264; font-weight: 700; font-size: 14px;">ยืนยันแล้ว (Confirmed)</span>';
  }

  let specialReqRow = "";
  if (b.specialRequest && String(b.specialRequest).trim() !== "-") {
    specialReqRow = '<tr>' +
      '<td style="padding: 6px 0; font-size: 14px; color: #706155; font-weight: 500; vertical-align: top;">คำขอพิเศษ:</td>' +
      '<td style="padding: 6px 0; font-size: 14px; color: #5D4037; font-style: italic;">' + b.specialRequest + '</td>' +
    '</tr>';
  }

  const innerCardHtml = '<table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FAF6F0; border: 1px solid #EFE7DC; border-radius: 20px; padding: 24px 28px; margin-bottom: 26px;">' +
    '<tr>' +
      '<td style="padding: 6px 0; font-size: 14px; color: #706155; font-weight: 500; width: 40%;">รหัสการจอง:</td>' +
      '<td style="padding: 6px 0; font-size: 15px; color: #C68A4C; font-weight: 700; letter-spacing: 0.5px;">' + bookingId + '</td>' +
    '</tr>' +
    '<tr>' +
      '<td style="padding: 6px 0; font-size: 14px; color: #706155; font-weight: 500;">ลูกค้า:</td>' +
      '<td style="padding: 6px 0; font-size: 15px; color: #1A1A1A; font-weight: 700;">' + (b.customerName || '-') + '</td>' +
    '</tr>' +
    '<tr>' +
      '<td style="padding: 6px 0; font-size: 14px; color: #706155; font-weight: 500;">เบอร์โทรศัพท์:</td>' +
      '<td style="padding: 6px 0; font-size: 15px; font-weight: 700;"><a href="tel:' + (b.customerPhone || '') + '" style="color: #1D64B4; text-decoration: none; font-weight: 700;">' + (b.customerPhone || '-') + '</a></td>' +
    '</tr>' +
    '<tr>' +
      '<td style="padding: 6px 0; font-size: 14px; color: #706155; font-weight: 500;">อีเมลลูกค้า:</td>' +
      '<td style="padding: 6px 0; font-size: 14px;"><a href="mailto:' + (b.customerEmail || '') + '" style="color: #1D64B4; text-decoration: underline;">' + (b.customerEmail || '-') + '</a></td>' +
    '</tr>' +
    '<tr>' +
      '<td style="padding: 6px 0; font-size: 14px; color: #706155; font-weight: 500;">บริการ:</td>' +
      '<td style="padding: 6px 0; font-size: 15px; color: #1A1A1A; font-weight: 700;">' + (b.serviceName || '-') + '</td>' +
    '</tr>' +
    '<tr>' +
      '<td style="padding: 6px 0; font-size: 14px; color: #706155; font-weight: 500;">ช่างผู้ให้บริการ:</td>' +
      '<td style="padding: 6px 0; font-size: 15px; color: #8B3A1C; font-weight: 700;">' + (b.staffName || 'ช่างประจำร้าน') + '</td>' +
    '</tr>' +
    '<tr>' +
      '<td style="padding: 6px 0; font-size: 14px; color: #706155; font-weight: 500;">วันและเวลานัดหมาย:</td>' +
      '<td style="padding: 6px 0; font-size: 15px; color: #008264; font-weight: 700;">' + (b.date || '-') + ' เวลา ' + (b.time || '-') + ' น. (' + duration + ' นาที)</td>' +
    '</tr>' +
    '<tr>' +
      '<td style="padding: 6px 0; font-size: 14px; color: #706155; font-weight: 500;">ยอดชำระ:</td>' +
      '<td style="padding: 6px 0; font-size: 16px; color: #C46210; font-weight: 800;">' + formattedPrice + '</td>' +
    '</tr>' +
    '<tr>' +
      '<td style="padding: 6px 0; font-size: 14px; color: #706155; font-weight: 500;">สถานะการชำระเงิน:</td>' +
      '<td style="padding: 6px 0;">' + payStatusText + '</td>' +
    '</tr>' +
    specialReqRow +
  '</table>';

  let ctaBtnUrl = slipUrl || sheetUrl;
  let ctaBtnText = slipUrl ? "🖼️ คลิกเพื่อดูสลิปโอนเงินบน Google Drive" : "📊 เปิดดูข้อมูลใน Google Sheet & Calendar";

  const actionButtonHtml = '<div style="text-align: center; margin-bottom: 24px;">' +
    '<a href="' + ctaBtnUrl + '" target="_blank" style="display: inline-block; background-color: #006E4E; color: #FFFFFF; font-size: 15px; font-weight: 700; text-decoration: none; padding: 14px 28px; border-radius: 12px; box-shadow: 0 4px 14px rgba(0, 110, 78, 0.25);">' +
      ctaBtnText +
    '</a>' +
  '</div>';

  const htmlBody = buildLuxuryEmailHtml({
    badgeText: "🔔 NEW BOOKING ALERT",
    badgeBg: "#1E5A44",
    badgeColor: "#FFFFFF",
    headerTitle: "The Bloom Studio",
    subTitle: "มีการจองคิวบริการ Wellness & Beauty ใหม่เข้ามาในระบบ",
    innerCardHtml: innerCardHtml,
    actionButtonHtml: actionButtonHtml,
    footerNote: "ข้อมูลนี้ถูกบันทึกลง Google Sheet และ Google Calendar เรียบร้อยแล้วแบบ Real-Time"
  });

  try {
    MailApp.sendEmail({
      to: adminEmail,
      subject: subject,
      htmlBody: htmlBody
    });
    Logger.log("✅ Sent New Booking Email to: " + adminEmail);
    return true;
  } catch (err) {
    Logger.log("⚠️ Error sending new booking email: " + err.toString());
    return false;
  }
}

/**
 * 4. เทมเพลต: แจ้งเตือนการยกเลิกคิว (Booking Cancelled)
 */
function sendCancelledBookingEmail(b, ss) {
  if (!b) return false;
  if (!ss) ss = SpreadsheetApp.getActiveSpreadsheet();
  const adminEmail = getAdminEmail(ss);
  if (!adminEmail) return false;

  const subject = "❌ แจ้งเตือนการยกเลิกคิว - " + (b.customerName || "ลูกค้า") + " " + (b.date || "") + " เวลา " + (b.time || "") + " น.";
  const sheetUrl = ss ? ss.getUrl() : "https://sheets.google.com";
  const calendarUrl = "https://calendar.google.com";
  const bookingId = b.id || ("BLM-" + Date.now().toString(36).toUpperCase());

  const innerCardHtml = '<table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FAF6F0; border: 1px solid #EFE7DC; border-radius: 20px; padding: 24px 28px; margin-bottom: 26px;">' +
    '<tr>' +
      '<td style="padding: 6px 0; font-size: 14px; color: #706155; font-weight: 500; width: 40%;">รหัสการจอง:</td>' +
      '<td style="padding: 6px 0; font-size: 15px; color: #C68A4C; font-weight: 700; letter-spacing: 0.5px;">' + bookingId + '</td>' +
    '</tr>' +
    '<tr>' +
      '<td style="padding: 6px 0; font-size: 14px; color: #706155; font-weight: 500;">ลูกค้า:</td>' +
      '<td style="padding: 6px 0; font-size: 15px; color: #1A1A1A; font-weight: 700;">' + (b.customerName || '-') + '</td>' +
    '</tr>' +
    '<tr>' +
      '<td style="padding: 6px 0; font-size: 14px; color: #706155; font-weight: 500;">เบอร์โทรศัพท์:</td>' +
      '<td style="padding: 6px 0; font-size: 15px; font-weight: 700;"><a href="tel:' + (b.customerPhone || '') + '" style="color: #1D64B4; text-decoration: none; font-weight: 700;">' + (b.customerPhone || '-') + '</a></td>' +
    '</tr>' +
    '<tr>' +
      '<td style="padding: 6px 0; font-size: 14px; color: #706155; font-weight: 500;">บริการที่ยกเลิก:</td>' +
      '<td style="padding: 6px 0; font-size: 15px; color: #1A1A1A; font-weight: 700;">' + (b.serviceName || '-') + '</td>' +
    '</tr>' +
    '<tr>' +
      '<td style="padding: 6px 0; font-size: 14px; color: #706155; font-weight: 500;">ช่างผู้ให้บริการ:</td>' +
      '<td style="padding: 6px 0; font-size: 15px; color: #8B3A1C; font-weight: 700;">' + (b.staffName || 'ช่างประจำร้าน') + '</td>' +
    '</tr>' +
    '<tr>' +
      '<td style="padding: 6px 0; font-size: 14px; color: #706155; font-weight: 500;">วันและเวลานัดเดิม:</td>' +
      '<td style="padding: 6px 0; font-size: 15px; color: #C62828; font-weight: 700;">' + (b.date || '-') + ' เวลา ' + (b.time || '-') + ' น.</td>' +
    '</tr>' +
    '<tr>' +
      '<td style="padding: 6px 0; font-size: 14px; color: #706155; font-weight: 500;">สถานะ:</td>' +
      '<td style="padding: 6px 0; font-size: 14px; color: #C62828; font-weight: 700;">ยกเลิกคิวแล้ว (Cancelled)</td>' +
    '</tr>' +
  '</table>';

  const actionButtonHtml = '<div style="text-align: center; margin-bottom: 24px;">' +
    '<a href="' + calendarUrl + '" target="_blank" style="display: inline-block; background-color: #3E2723; color: #FFFFFF; font-size: 15px; font-weight: 700; text-decoration: none; padding: 14px 28px; border-radius: 12px; box-shadow: 0 4px 14px rgba(62, 39, 35, 0.25);">' +
      '📅 จัดการตารางเวลาใน Google Calendar' +
    '</a>' +
  '</div>';

  const htmlBody = buildLuxuryEmailHtml({
    badgeText: "❌ BOOKING CANCELLED",
    badgeBg: "#C62828",
    badgeColor: "#FFFFFF",
    headerTitle: "The Bloom Studio",
    subTitle: "แจ้งเตือนรายการยกเลิกคิวจองในระบบ",
    innerCardHtml: innerCardHtml,
    actionButtonHtml: actionButtonHtml,
    footerNote: "ช่วงเวลานี้ว่างลงแล้ว พร้อมเปิดรับคิวใหม่สำหรับลูกค้าท่านอื่น"
  });

  try {
    MailApp.sendEmail({
      to: adminEmail,
      subject: subject,
      htmlBody: htmlBody
    });
    Logger.log("✅ Sent Cancellation Email to: " + adminEmail);
    return true;
  } catch (err) {
    Logger.log("⚠️ Error sending cancellation email: " + err.toString());
    return false;
  }
}

/**
 * 5. เทมเพลต: มีการแนบสลิปโอนเงินใหม่ (Payment Slip Attached)
 */
function sendPaymentSlipEmail(b, ss) {
  if (!b) return false;
  if (!ss) ss = SpreadsheetApp.getActiveSpreadsheet();
  const adminEmail = getAdminEmail(ss);
  if (!adminEmail) return false;

  const subject = "💳 มีการแนบสลิปโอนเงินใหม่ - " + (b.customerName || "ลูกค้า") + " [" + (b.id || "คิวจอง") + "]";
  const sheetUrl = ss ? ss.getUrl() : "https://sheets.google.com";
  const slipUrl = b.paymentSlipUrl || "";
  const rawPrice = Number(b.servicePrice || 0);
  const formattedPrice = rawPrice.toLocaleString() + " บาท";
  const bookingId = b.id || ("BLM-" + Date.now().toString(36).toUpperCase());

  let slipPreviewHtml = "";
  if (slipUrl) {
    slipPreviewHtml = '<div style="margin-top: 16px; text-align: center; background-color: #FFFFFF; padding: 12px; border-radius: 14px; border: 1px solid #EAE0D5;">' +
      '<div style="font-size: 12px; font-weight: 700; color: #5D4037; margin-bottom: 8px;">📷 ภาพตัวอย่างสลิปโอนเงิน (PAYMENT SLIP PREVIEW)</div>' +
      '<div style="max-width: 280px; margin: 0 auto; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border: 1px solid #D7CCC8;">' +
        '<img src="' + slipUrl + '" alt="Payment Slip" style="width: 100%; height: auto; display: block;" />' +
      '</div>' +
    '</div>';
  }

  const innerCardHtml = '<table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FAF6F0; border: 1px solid #EFE7DC; border-radius: 20px; padding: 24px 28px; margin-bottom: 26px;">' +
    '<tr>' +
      '<td style="padding: 6px 0; font-size: 14px; color: #706155; font-weight: 500; width: 40%;">รหัสการจอง:</td>' +
      '<td style="padding: 6px 0; font-size: 15px; color: #C68A4C; font-weight: 700; letter-spacing: 0.5px;">' + bookingId + '</td>' +
    '</tr>' +
    '<tr>' +
      '<td style="padding: 6px 0; font-size: 14px; color: #706155; font-weight: 500;">ลูกค้า:</td>' +
      '<td style="padding: 6px 0; font-size: 15px; color: #1A1A1A; font-weight: 700;">' + (b.customerName || '-') + '</td>' +
    '</tr>' +
    '<tr>' +
      '<td style="padding: 6px 0; font-size: 14px; color: #706155; font-weight: 500;">เบอร์โทรศัพท์:</td>' +
      '<td style="padding: 6px 0; font-size: 15px; font-weight: 700;"><a href="tel:' + (b.customerPhone || '') + '" style="color: #1D64B4; text-decoration: none; font-weight: 700;">' + (b.customerPhone || '-') + '</a></td>' +
    '</tr>' +
    '<tr>' +
      '<td style="padding: 6px 0; font-size: 14px; color: #706155; font-weight: 500;">บริการ:</td>' +
      '<td style="padding: 6px 0; font-size: 15px; color: #1A1A1A; font-weight: 700;">' + (b.serviceName || '-') + '</td>' +
    '</tr>' +
    '<tr>' +
      '<td style="padding: 6px 0; font-size: 14px; color: #706155; font-weight: 500;">วันและเวลานัดหมาย:</td>' +
      '<td style="padding: 6px 0; font-size: 15px; color: #008264; font-weight: 700;">' + (b.date || '-') + ' เวลา ' + (b.time || '-') + ' น.</td>' +
    '</tr>' +
    '<tr>' +
      '<td style="padding: 6px 0; font-size: 14px; color: #706155; font-weight: 500;">ยอดชำระในสลิป:</td>' +
      '<td style="padding: 6px 0; font-size: 16px; color: #C46210; font-weight: 800;">' + formattedPrice + '</td>' +
    '</tr>' +
    '<tr>' +
      '<td style="padding: 6px 0; font-size: 14px; color: #706155; font-weight: 500;">สถานะ:</td>' +
      '<td style="padding: 6px 0; font-size: 14px; color: #008264; font-weight: 700;">แนบสลิปแล้ว (Paid Slip)</td>' +
    '</tr>' +
    (slipPreviewHtml ? '<tr><td colspan="2">' + slipPreviewHtml + '</td></tr>' : '') +
  '</table>';

  const ctaUrl = slipUrl || sheetUrl;
  const actionButtonHtml = '<div style="text-align: center; margin-bottom: 24px;">' +
    '<a href="' + ctaUrl + '" target="_blank" style="display: inline-block; background-color: #006E4E; color: #FFFFFF; font-size: 15px; font-weight: 700; text-decoration: none; padding: 14px 28px; border-radius: 12px; box-shadow: 0 4px 14px rgba(0, 110, 78, 0.25);">' +
      '🖼️ คลิกเพื่อดูสลิปโอนเงินบน Google Drive' +
    '</a>' +
  '</div>';

  const htmlBody = buildLuxuryEmailHtml({
    badgeText: "💳 NEW PAYMENT SLIP",
    badgeBg: "#1565C0",
    badgeColor: "#FFFFFF",
    headerTitle: "The Bloom Studio",
    subTitle: "ลูกค้าได้แนบหลักฐานการโอนเงินชำระค่าบริการ",
    innerCardHtml: innerCardHtml,
    actionButtonHtml: actionButtonHtml,
    footerNote: "โปรดตรวจสอบความถูกต้องของยอดเงินและเวลาในสลิปกับบัญชีธนาคารของร้านค้า"
  });

  try {
    MailApp.sendEmail({
      to: adminEmail,
      subject: subject,
      htmlBody: htmlBody
    });
    Logger.log("✅ Sent Payment Slip Email to: " + adminEmail);
    return true;
  } catch (err) {
    Logger.log("⚠️ Error sending payment slip email: " + err.toString());
    return false;
  }
}

/**
 * 6. เมนู & API: ทดสอบส่งอีเมลแจ้งเตือน Admin (Test Email Trigger)
 */
function testEmailNotification(targetEmail) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const adminEmail = targetEmail || getAdminEmail(ss);
  
  if (!adminEmail) {
    const msg = "ไม่พบบัญชีอีเมลผู้รับ กรุณาระบุ OwnerEmail ในแท็บ Settings หรือลงชื่อเข้าใช้ Google";
    if (typeof SpreadsheetApp.getUi === "function") {
      try { SpreadsheetApp.getUi().alert(msg); } catch (e) {}
    }
    return { success: false, message: msg };
  }

  const quota = MailApp.getRemainingDailyQuota();
  const sheetUrl = ss ? ss.getUrl() : "https://sheets.google.com";

  const innerCardHtml = '<table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FAF6F0; border: 1px solid #EFE7DC; border-radius: 20px; padding: 24px 28px; margin-bottom: 26px;">' +
    '<tr>' +
      '<td style="padding: 6px 0; font-size: 14px; color: #706155; font-weight: 500; width: 40%;">รหัสการจอง:</td>' +
      '<td style="padding: 6px 0; font-size: 15px; color: #C68A4C; font-weight: 700; letter-spacing: 0.5px;">BLM-1LG3AH90</td>' +
    '</tr>' +
    '<tr>' +
      '<td style="padding: 6px 0; font-size: 14px; color: #706155; font-weight: 500;">ลูกค้า:</td>' +
      '<td style="padding: 6px 0; font-size: 15px; color: #1A1A1A; font-weight: 700;">mac</td>' +
    '</tr>' +
    '<tr>' +
      '<td style="padding: 6px 0; font-size: 14px; color: #706155; font-weight: 500;">เบอร์โทรศัพท์:</td>' +
      '<td style="padding: 6px 0; font-size: 15px; font-weight: 700;"><a href="tel:0991234567" style="color: #1D64B4; text-decoration: none; font-weight: 700;">0991234567</a></td>' +
    '</tr>' +
    '<tr>' +
      '<td style="padding: 6px 0; font-size: 14px; color: #706155; font-weight: 500;">อีเมลลูกค้า:</td>' +
      '<td style="padding: 6px 0; font-size: 14px;"><a href="mailto:' + adminEmail + '" style="color: #1D64B4; text-decoration: underline;">' + adminEmail + '</a></td>' +
    '</tr>' +
    '<tr>' +
      '<td style="padding: 6px 0; font-size: 14px; color: #706155; font-weight: 500;">บริการ:</td>' +
      '<td style="padding: 6px 0; font-size: 15px; color: #1A1A1A; font-weight: 700;">ทำเล็บเจลพรีเมียม (Gel Manicure Art)</td>' +
    '</tr>' +
    '<tr>' +
      '<td style="padding: 6px 0; font-size: 14px; color: #706155; font-weight: 500;">ช่างผู้ให้บริการ:</td>' +
      '<td style="padding: 6px 0; font-size: 15px; color: #8B3A1C; font-weight: 700;">ช่างพลอย (Ploy)</td>' +
    '</tr>' +
    '<tr>' +
      '<td style="padding: 6px 0; font-size: 14px; color: #706155; font-weight: 500;">วันและเวลานัดหมาย:</td>' +
      '<td style="padding: 6px 0; font-size: 15px; color: #008264; font-weight: 700;">2026-09-08 เวลา 10:00 น. (60 นาที)</td>' +
    '</tr>' +
    '<tr>' +
      '<td style="padding: 6px 0; font-size: 14px; color: #706155; font-weight: 500;">ยอดชำระ:</td>' +
      '<td style="padding: 6px 0; font-size: 16px; color: #C46210; font-weight: 800;">690 บาท</td>' +
    '</tr>' +
    '<tr>' +
      '<td style="padding: 6px 0; font-size: 14px; color: #706155; font-weight: 500;">สถานะการชำระเงิน:</td>' +
      '<td style="padding: 6px 0; font-size: 14px; color: #008264; font-weight: 700;">แนบสลิปแล้ว (Paid Slip)</td>' +
    '</tr>' +
  '</table>';

  const actionButtonHtml = '<div style="text-align: center; margin-bottom: 24px;">' +
    '<a href="' + sheetUrl + '" target="_blank" style="display: inline-block; background-color: #006E4E; color: #FFFFFF; font-size: 15px; font-weight: 700; text-decoration: none; padding: 14px 28px; border-radius: 12px; box-shadow: 0 4px 14px rgba(0, 110, 78, 0.25);">' +
      '🖼️ คลิกเพื่อดูสลิปโอนเงินบน Google Drive' +
    '</a>' +
  '</div>';

  const htmlBody = buildLuxuryEmailHtml({
    badgeText: "🔔 NEW BOOKING ALERT",
    badgeBg: "#1E5A44",
    badgeColor: "#FFFFFF",
    headerTitle: "The Bloom Studio",
    subTitle: "มีการจองคิวบริการ Wellness & Beauty ใหม่เข้ามาในระบบ",
    innerCardHtml: innerCardHtml,
    actionButtonHtml: actionButtonHtml,
    footerNote: "ข้อมูลนี้ถูกบันทึกลง Google Sheet และ Google Calendar เรียบร้อยแล้วแบบ Real-Time (โควต้าคงเหลือ: " + quota + " ฉบับ/วัน)"
  });

  try {
    MailApp.sendEmail({
      to: adminEmail,
      subject: "🌸 [ทดสอบระบบ] The Bloom Studio - Google Workspace Notification",
      htmlBody: htmlBody
    });

    if (typeof SpreadsheetApp.getUi === "function") {
      try {
        SpreadsheetApp.getUi().alert(
          "ส่งอีเมลทดสอบดีไซน์หรูหราไปยัง " + adminEmail + " สำเร็จเรียบร้อยแล้ว!\\n\\n" +
          "โควต้าส่งอีเมลคงเหลือประจำวัน: " + quota + " ฉบับ"
        );
      } catch (e) {}
    }

    return {
      success: true,
      message: "ส่งอีเมลทดสอบไปยัง " + adminEmail + " เรียบร้อยแล้ว!",
      adminEmail: adminEmail,
      mailQuota: quota
    };
  } catch (err) {
    if (typeof SpreadsheetApp.getUi === "function") {
      try { SpreadsheetApp.getUi().alert("เกิดข้อผิดพลาดในการส่งอีเมล: " + err.toString()); } catch (e) {}
    }
    return { success: false, error: err.toString() };
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
      user: Session.getEffectiveUser().getEmail() || Session.getActiveUser().getEmail(),
      mailQuota: MailApp.getRemainingDailyQuota()
    };
  } else if (action === "setup") {
    result = setupSheets();
  } else if (action === "pullAll") {
    result = pullAllData();
  } else if (action === "counts") {
    result = getSheetCounts();
  } else if (action === "testEmail") {
    result = testEmailNotification(e && e.parameter ? e.parameter.email : null);
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
        user: Session.getEffectiveUser().getEmail() || Session.getActiveUser().getEmail(),
        mailQuota: MailApp.getRemainingDailyQuota()
      };
    } else if (action === "setup") {
      result = setupSheets();
    } else if (action === "pushAll") {
      result = pushAllData(body.data);
    } else if (action === "pullAll") {
      result = pullAllData();
    } else if (action === "counts") {
      result = getSheetCounts();
    } else if (action === "testEmail") {
      result = testEmailNotification(body.email);
    } else if (action === "addBooking") {
      result = handleAddBooking(body.booking);
    } else if (action === "updateBookingStatus") {
      result = handleUpdateBookingStatus(body.bookingId, body.status, body.updates, body.booking);
    } else if (action === "deleteBooking") {
      result = handleDeleteBooking(body.bookingId, body.booking);
    } else if (action === "syncServices") {
      result = syncServicesData(body.services);
    } else if (action === "syncStaff") {
      result = syncStaffData(body.staff);
    } else if (action === "syncCustomers") {
      result = syncCustomersData(body.customers);
    } else if (action === "syncSettings") {
      result = syncSettingsData(body.settings);
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
  const getCount = function(name) {
    const s = ss.getSheetByName(name);
    return s ? Math.max(0, s.getLastRow() - 1) : 0;
  };
  return {
    success: true,
    status: "online",
    user: Session.getEffectiveUser().getEmail() || Session.getActiveUser().getEmail(),
    adminEmail: getAdminEmail(ss),
    mailQuota: MailApp.getRemainingDailyQuota(),
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

  const getSheetData = function(sheetName) {
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) return [];
    const values = sheet.getDataRange().getDisplayValues();
    if (values.length <= 1) return [];
    const headers = values[0];
    return values.slice(1).map(function(row) {
      let obj = {};
      headers.forEach(function(h, idx) { obj[h] = row[idx] !== undefined ? row[idx] : ""; });
      return obj;
    });
  };

  return {
    success: true,
    sheetUrl: ss.getUrl(),
    adminEmail: getAdminEmail(ss),
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

    dbData.bookings.forEach(function(b) {
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
    syncCustomersData(dbData.customers);
  }

  // 5. ซิงค์แท็บ Settings
  if (dbData.settings && typeof dbData.settings === "object") {
    syncSettingsData(dbData.settings);
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

  services.forEach(function(s) {
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

  staffList.forEach(function(st) {
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
 * อัปเดตแท็บ Customers (CRM)
 */
function syncCustomersData(customers) {
  if (!Array.isArray(customers)) return { success: false, message: "Invalid customers array" };
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("Customers");
  if (!sheet) {
    sheet = ss.insertSheet("Customers");
  }
  sheet.clear();
  const headers = ["Customer Phone", "Customer Name", "Customer Email", "Total Bookings", "Total Spent (THB)", "Last Visit Date", "LINE User ID"];
  sheet.appendRow(headers);
  sheet.getRange("A:A").setNumberFormat("@");

  customers.forEach(function(c) {
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
  return { success: true, count: customers.length };
}

/**
 * อัปเดตแท็บ Settings
 */
function syncSettingsData(settings) {
  if (!settings || typeof settings !== "object") return { success: false, message: "Invalid settings object" };
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("Settings");
  if (!sheet) {
    sheet = ss.insertSheet("Settings");
  }
  sheet.clear();
  const headers = ["Key", "Value", "Description"];
  sheet.appendRow(headers);
  sheet.getRange("B:B").setNumberFormat("@");

  const effectiveEmail = Session.getEffectiveUser().getEmail() || Session.getActiveUser().getEmail() || "NatapongMumklang@gmail.com";

  const settingsRows = [
    ["OwnerEmail", String(settings.ownerEmail || effectiveEmail), "อีเมลเจ้าของร้าน/Admin สำหรับรับการแจ้งเตือนคิวจองและการเงินอัตโนมัติ"],
    ["PromptPayNumber", String(settings.promptPayNumber || "0812345678"), "เบอร์พร้อมเพย์รับชำระเงินของ The Bloom Studio"],
    ["ShopName", String(settings.shopName || "The Bloom Studio"), "ชื่อแบรนด์ร้านความงามและสปา"],
    ["ServerWebhookUrl", String(settings.serverWebhookUrl || ""), "URL เซิร์ฟเวอร์ของระบบจอง"],
    ["GoogleDriveFolderUrl", String(settings.googleDriveFolderUrl || ""), "ลิงก์โฟลเดอร์ Google Drive เก็บสลิปและไฟล์แนบ"],
    ["GoogleDriveFolderId", String(settings.googleDriveFolderId || ""), "Folder ID ของ Google Drive"],
    ["GoogleCalendarId", String(settings.googleCalendarId || "primary"), "ID ของ Google Calendar ที่ใช้ลงบันทึกนัดหมาย"]
  ];
  settingsRows.forEach(function(row) { sheet.appendRow(row); });
  formatHeaderRow(sheet, headers.length, "#F4EAE0", "#3E2723");
  return { success: true, count: settingsRows.length };
}

/**
 * รับการจองใหม่: เขียนลงชีต Bookings, บันทึก Calendar Event, ส่งอีเมลแจ้งเตือนหรูหราหา Admin, อัปเดต Customers CRM
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

  // 3. ส่งอีเมลแจ้งเตือนการจองใหม่ (New Booking Luxury HTML Email)
  sendNewBookingEmail(b, ss);

  // หากมีการแนบสลิปมาด้วยตั้งแต่ตอนจอง ให้ส่งอีเมลแจ้งสลิปด้วย
  if (b.paymentSlipUrl) {
    sendPaymentSlipEmail(b, ss);
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
    message: "บันทึกคิวจองลง Google Sheet, Calendar, และส่งอีเมลแจ้งเตือนสำเร็จ",
    calendarEventId: calendarEventId
  };
}

/**
 * อัปเดตสถานะการจองในชีต Bookings พร้อมส่งอีเมลแจ้งเตือนเมื่อยกเลิกหรือแนบสลิป
 */
function handleUpdateBookingStatus(bookingId, newStatus, updates, bookingData) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Bookings");
  if (!sheet) return { success: false, message: "Sheet Bookings not found" };

  let targetBooking = bookingData || null;
  let targetRowIndex = -1;
  const data = sheet.getDataRange().getDisplayValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === bookingId) {
      targetRowIndex = i + 1;
      if (!targetBooking) {
        targetBooking = {
          id: data[i][0],
          createdAt: data[i][1],
          status: newStatus || data[i][2],
          date: data[i][3],
          time: data[i][4],
          serviceName: data[i][5],
          servicePrice: data[i][6],
          serviceDuration: data[i][7],
          staffName: data[i][8],
          customerName: data[i][9],
          customerPhone: data[i][10],
          customerEmail: data[i][11],
          specialRequest: data[i][12],
          paymentStatus: (updates && updates.paymentStatus) || data[i][13],
          paymentSlipUrl: (updates && updates.paymentSlipUrl) || data[i][14],
          calendarEventId: data[i][15]
        };
      }
      break;
    }
  }

  if (targetRowIndex > 0) {
    if (newStatus) sheet.getRange(targetRowIndex, 3).setValue(newStatus);
    if (updates && updates.paymentStatus) sheet.getRange(targetRowIndex, 14).setValue(updates.paymentStatus);
    if (updates && updates.paymentSlipUrl) sheet.getRange(targetRowIndex, 15).setValue(updates.paymentSlipUrl);

    // 1. หากสถานะเปลี่ยนเป็น Cancelled ให้ส่งอีเมลแจ้งเตือนการยกเลิกคิว
    if (newStatus === "cancelled" && targetBooking) {
      sendCancelledBookingEmail(targetBooking, ss);

      // ลบหรืออัปเดต Event ใน Calendar
      if (targetBooking.calendarEventId) {
        try {
          const cal = CalendarApp.getDefaultCalendar();
          const ev = cal.getEventById(targetBooking.calendarEventId);
          if (ev) ev.deleteEvent();
        } catch (e) {}
      }
    }

    // 2. หากมีการแนบสลิปโอนเงินใหม่ ให้ส่งอีเมลแจ้งเตือนสลิป
    if (updates && updates.paymentSlipUrl && targetBooking) {
      targetBooking.paymentSlipUrl = updates.paymentSlipUrl;
      sendPaymentSlipEmail(targetBooking, ss);
    }

    return { success: true, message: "Updated booking " + bookingId };
  }

  return { success: false, message: "Booking ID not found: " + bookingId };
}

/**
 * ลบรายการจองออกจากชีต Bookings และลบ Event ใน Google Calendar
 */
function handleDeleteBooking(bookingId, bookingData) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Bookings");
  if (!sheet) return { success: false, message: "Sheet Bookings not found" };

  const data = sheet.getDataRange().getDisplayValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === bookingId) {
      const calendarEventId = data[i][15]; // Column P
      const bData = bookingData || {
        id: data[i][0],
        status: "cancelled",
        date: data[i][3],
        time: data[i][4],
        serviceName: data[i][5],
        staffName: data[i][8],
        customerName: data[i][9],
        customerPhone: data[i][10]
      };

      // ส่งอีเมลแจ้งเตือนยกเลิก
      sendCancelledBookingEmail(bData, ss);

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
    const found = sData.find(function(r) { return r[0] === "ServerWebhookUrl"; });
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
    const row = data.find(function(r) { return r[0] === "GoogleDriveFolderUrl"; });
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
`;
