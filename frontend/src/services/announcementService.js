/**
 * announcementService — wraps the Express/MySQL backend API.
 * Replaces the previous localStorage-based storageStore implementation.
 */
import api, { invalidateCacheAndNotify, getApiBase } from "./api";

const getToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("mesob_token");
};

const createWithImage = async (formData) => {
  const token = getToken();
  const base = getApiBase();
  const response = await fetch(`${base}/announcements`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || "Failed to create announcement");
  invalidateCacheAndNotify();
  return result;
};

const updateWithImage = async (id, formData) => {
  const token = getToken();
  const base = getApiBase();
  const response = await fetch(`${base}/announcements/${id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || "Failed to update announcement");
  invalidateCacheAndNotify();
  return result;
};

export const announcementService = {
  async getAll(params = {}) {
    try {
      const res = await api.get("/announcements", params);
      return res.data;
    } catch (err) {
      console.error("[announcementService] getAll error:", err);
      return { items: [], total: 0, totalPages: 1, currentPage: 1 };
    }
  },

  async getById(id) {
    try {
      const res = await api.get(`/announcements/${id}`);
      return res.data;
    } catch {
      return null;
    }
  },

  async create(data) {
    const res = await api.post("/announcements", data);
    return res.data;
  },

  createWithImage,

  async update(id, data) {
    const res = await api.put(`/announcements/${id}`, data);
    return res.data;
  },

  updateWithImage,

  async delete(id) {
    return api.delete(`/announcements/${id}`);
  },

  async publish(id) {
    const res = await api.put(`/announcements/${id}`, { status: "published" });
    return res.data;
  },

  async unpublish(id) {
    const res = await api.put(`/announcements/${id}`, { status: "draft" });
    return res.data;
  },

  subscribe(_cb) {
    return () => {};
  },
};
