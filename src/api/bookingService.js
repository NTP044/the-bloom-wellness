/**
 * The Bloom Studio - Frontend API Service Layer
 * Handles communication with Express backend endpoints
 */

const API_BASE_URL = "/api";

/**
 * Fetch all available spa & beauty services
 * @returns {Promise<Array>} List of services
 */
export async function fetchServices() {
  try {
    const response = await fetch(`${API_BASE_URL}/services`);
    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.message || "ไม่สามารถโหลดข้อมูลบริการได้");
    }
    return result.data;
  } catch (error) {
    console.error("Error in fetchServices:", error);
    throw error;
  }
}

/**
 * Fetch staff members, optionally filtered by service ID
 * @param {string} [serviceId] Optional service ID filter
 * @returns {Promise<Array>} List of staff members
 */
export async function fetchStaff(serviceId) {
  try {
    const query = serviceId ? `?serviceId=${encodeURIComponent(serviceId)}` : "";
    const response = await fetch(`${API_BASE_URL}/staff${query}`);
    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.message || "ไม่สามารถโหลดรายชื่อช่างได้");
    }
    return result.data;
  } catch (error) {
    console.error("Error in fetchStaff:", error);
    throw error;
  }
}

/**
 * Fetch available time slots for a specific staff member on a chosen date
 * @param {string} staffId Staff ID
 * @param {string} date Date in YYYY-MM-DD format
 * @param {string} [serviceId] Service ID to calculate duration-based availability
 * @returns {Promise<{ allSlots: string[], bookedSlots: string[], availableSlots: string[], slotDetails: Array }>}
 */
export async function fetchAvailability(staffId, date, serviceId) {
  try {
    if (!staffId || !date) {
      return { allSlots: [], bookedSlots: [], availableSlots: [], slotDetails: [] };
    }
    let query = `?staffId=${encodeURIComponent(staffId)}&date=${encodeURIComponent(date)}`;
    if (serviceId) {
      query += `&serviceId=${encodeURIComponent(serviceId)}`;
    }
    const response = await fetch(`${API_BASE_URL}/availability${query}`);
    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.message || "ไม่สามารถตรวจสอบเวลาว่างได้");
    }
    return result;
  } catch (error) {
    console.error("Error in fetchAvailability:", error);
    throw error;
  }
}

/**
 * Submit a new appointment booking
 * @param {Object} bookingData Booking payload
 * @returns {Promise<{ success: boolean, message: string, booking: Object }>}
 */
export async function createBooking(bookingData) {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bookingData),
    });

    const result = await response.json();
    if (!response.ok || !result.success) {
      const error = new Error(result.message || "เกิดข้อผิดพลาดในการจองคิว");
      error.status = response.status;
      error.data = result;
      throw error;
    }
    return result;
  } catch (error) {
    console.error("Error in createBooking:", error);
    throw error;
  }
}

/**
 * Fetch customer's bookings (Strict privacy isolation)
 * @param {Object} [params] Query parameters { lineUserId, phone }
 * @returns {Promise<Array>} List of bookings belonging only to this user
 */
export async function fetchBookings(params = {}) {
  try {
    const query = new URLSearchParams();
    if (params.lineUserId) query.append("lineUserId", params.lineUserId);
    if (params.phone) query.append("phone", params.phone);
    const queryString = query.toString() ? `?${query.toString()}` : "";

    const response = await fetch(`${API_BASE_URL}/bookings${queryString}`);
    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.message || "ไม่สามารถดึงข้อมูลการจองได้");
    }
    return result.data || [];
  } catch (error) {
    console.error("Error in fetchBookings:", error);
    throw error;
  }
}

/**
 * Fetch remembered customer profile (Smart User Memory & Auto-Fill)
 * @param {Object} params Query parameters { lineUserId, phone }
 * @returns {Promise<Object|null>} Saved customer record
 */
export async function fetchCustomerProfile(params = {}) {
  try {
    const query = new URLSearchParams();
    if (params.lineUserId) query.append("lineUserId", params.lineUserId);
    if (params.phone) query.append("phone", params.phone);
    const queryString = query.toString() ? `?${query.toString()}` : "";

    const response = await fetch(`${API_BASE_URL}/customers/profile${queryString}`);
    const result = await response.json();
    if (!response.ok || !result.success) {
      return null;
    }
    return result.data || null;
  } catch (error) {
    console.warn("Could not fetch customer profile:", error);
    return null;
  }
}
