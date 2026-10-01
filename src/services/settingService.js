const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

/**
 * Settings Service
 * Handles all settings-related API calls
 */
const settingService = {
  /**
   * Get all settings (admin only)
   */
  async getAll() {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/settings`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch settings");
    }

    const data = await response.json();
    return data.data;
  },

  /**
   * Get public settings (no auth required)
   * Used on frontend to display site info, contact details, etc.
   */
  async getPublic() {
    const response = await fetch(`${API_BASE_URL}/settings/public`);

    if (!response.ok) {
      throw new Error("Failed to fetch public settings");
    }

    const data = await response.json();
    return data.data;
  },

  /**
   * Update settings (admin only)
   */
  async update(settingsData) {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/settings`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(settingsData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update settings");
    }

    return await response.json();
  },

  /**
   * Get a single setting by key
   */
  async getSetting(key) {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/settings/${key}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch setting");
    }

    const data = await response.json();
    return data.data;
  },

  /**
   * Delete a setting
   */
  async deleteSetting(key) {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/settings/${key}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to delete setting");
    }

    return await response.json();
  },

  /**
   * Reset all settings to defaults
   */
  async reset() {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/settings/reset`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to reset settings");
    }

    return await response.json();
  },
};

export default settingService;
