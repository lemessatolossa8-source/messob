import api from "./api";
import { DEFAULT_SITE_SETTINGS, mergeSiteSettings } from "@/src/data/defaultSiteSettings";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

async function parseError(response, fallback) {
  try {
    const error = await response.json();
    return error.message || fallback;
  } catch {
    return fallback;
  }
}

const listeners = new Set();

export const settingService = {
  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },

  notify(data) {
    listeners.forEach((fn) => {
      try {
        fn(data);
      } catch (err) {
        console.error("[settingService] listener error:", err);
      }
    });
  },

  async getAll() {
    const res = await api.get("/settings");
    return mergeSiteSettings(DEFAULT_SITE_SETTINGS, res.data || {});
  },

  async getPublic() {
    try {
      const res = await api.get("/settings/public");
      return mergeSiteSettings(DEFAULT_SITE_SETTINGS, res.data || {});
    } catch {
      // Fallback direct fetch if called in SSR or before full hydration
      const response = await fetch(`${API_BASE_URL}/settings/public`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(await parseError(response, "Failed to fetch public settings"));
      }

      const data = await response.json();
      return mergeSiteSettings(DEFAULT_SITE_SETTINGS, data.data || {});
    }
  },

  async update(settingsData) {
    const res = await api.put("/settings", settingsData);
    const merged = mergeSiteSettings(DEFAULT_SITE_SETTINGS, res.data || settingsData);
    this.notify(merged);
    return {
      ...res,
      data: merged,
    };
  },

  async reset() {
    const res = await api.post("/settings/reset", {});
    const merged = mergeSiteSettings(DEFAULT_SITE_SETTINGS, res.data || {});
    this.notify(merged);
    return {
      ...res,
      data: merged,
    };
  },
};

export default settingService;
