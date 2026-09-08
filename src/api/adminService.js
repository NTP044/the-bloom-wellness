// API Client for Admin Operations in The Bloom Studio

async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || data.error || `Request failed with status ${response.status}`);
  }
  return data;
}

export const adminService = {
  // Authentication
  async login(pin) {
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin })
    });
    return handleResponse(res);
  },

  // Full Database Fetch (Real-Time Sync)
  async getDb() {
    const res = await fetch("/api/admin/db");
    const json = await handleResponse(res);
    return json?.data || json;
  },

  // Get Settings
  async getSettings() {
    const res = await fetch("/api/admin/settings");
    const json = await handleResponse(res);
    return json?.data || json;
  },

  // Bookings Management
  async createBooking(bookingData) {
    const res = await fetch("/api/admin/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bookingData)
    });
    return handleResponse(res);
  },

  async updateBookingStatus(id, updates) {
    const res = await fetch(`/api/admin/bookings/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates)
    });
    return handleResponse(res);
  },

  async deleteBooking(id) {
    const res = await fetch(`/api/admin/bookings/${id}`, {
      method: "DELETE"
    });
    return handleResponse(res);
  },

  // Booking Conflicts & Leads Management
  async getConflicts() {
    const res = await fetch("/api/admin/conflicts");
    const json = await handleResponse(res);
    return json?.data || [];
  },

  async updateConflict(id, updates) {
    const res = await fetch(`/api/admin/conflicts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates)
    });
    return handleResponse(res);
  },

  async deleteConflict(id) {
    const res = await fetch(`/api/admin/conflicts/${id}`, {
      method: "DELETE"
    });
    return handleResponse(res);
  },

  // Services Management
  async createService(serviceData) {
    const res = await fetch("/api/admin/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(serviceData)
    });
    return handleResponse(res);
  },

  async updateService(id, serviceData) {
    const res = await fetch(`/api/admin/services/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(serviceData)
    });
    return handleResponse(res);
  },

  async deleteService(id) {
    const res = await fetch(`/api/admin/services/${id}`, {
      method: "DELETE"
    });
    return handleResponse(res);
  },

  // Staff Management
  async createStaff(staffData) {
    const res = await fetch("/api/admin/staff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(staffData)
    });
    return handleResponse(res);
  },

  async updateStaff(id, staffData) {
    const res = await fetch(`/api/admin/staff/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(staffData)
    });
    return handleResponse(res);
  },

  async deleteStaff(id) {
    const res = await fetch(`/api/admin/staff/${id}`, {
      method: "DELETE"
    });
    return handleResponse(res);
  },

  // Settings Management
  async updateSettings(settingsData) {
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settingsData)
    });
    return handleResponse(res);
  },

  // Google Apps Script Actions
  async testGas(webAppUrl) {
    const res = await fetch("/api/admin/gas/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: webAppUrl, webAppUrl })
    });
    return handleResponse(res);
  },

  async testEmail(webAppUrl, email = "") {
    const res = await fetch("/api/admin/gas/test-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: webAppUrl, webAppUrl, email })
    });
    return handleResponse(res);
  },

  async setupGas(webAppUrl) {
    const res = await fetch("/api/admin/gas/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: webAppUrl, webAppUrl })
    });
    return handleResponse(res);
  },

  async pushData(webAppUrl) {
    const res = await fetch("/api/admin/gas/push", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: webAppUrl, webAppUrl })
    });
    return handleResponse(res);
  },

  async pullData(webAppUrl) {
    const res = await fetch("/api/admin/gas/pull", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: webAppUrl, webAppUrl })
    });
    return handleResponse(res);
  },

  async getGasStatus(webAppUrl) {
    const query = webAppUrl ? `?url=${encodeURIComponent(webAppUrl)}` : "";
    const res = await fetch(`/api/admin/gas/status${query}`);
    return handleResponse(res);
  }
};
