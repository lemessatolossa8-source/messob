/**
 * galleryService — wraps the Express/MySQL backend API.
 * Replaces the previous localStorage-based storageStore implementation.
 */
import api, { invalidateCacheAndNotify, getApiBase } from "./api";

const getToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("mesob_token");
};

/** Create a gallery item with an uploaded image file via FormData */
const createWithImage = async (formData) => {
  const token = getToken();
  const base = getApiBase();
  const response = await fetch(`${base}/gallery`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || "Failed to create gallery item");
  invalidateCacheAndNotify();
  return result;
};

const updateWithImage = async (id, formData) => {
  const token = getToken();
  const base = getApiBase();
  const response = await fetch(`${base}/gallery/${id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || "Failed to update gallery item");
  invalidateCacheAndNotify();
  return result;
};

export const galleryService = {
  async getAll(params = {}) {
    try {
      const res = await api.get("/gallery", params);
      return res.data;
    } catch (err) {
      console.error("[galleryService] getAll error:", err);
      return { items: [], total: 0, totalPages: 1, currentPage: 1 };
    }
  },

  async getById(id) {
    try {
      const res = await api.get(`/gallery/${id}`);
      return res.data;
    } catch {
      return null;
    }
  },

  async create(data) {
    const res = await api.post("/gallery", data);
    return res.data;
  },

  createWithImage,

  async update(id, data) {
    const res = await api.put(`/gallery/${id}`, data);
    return res.data;
  },

  updateWithImage,

  async delete(id) {
    return api.delete(`/gallery/${id}`);
  },

  async publish(id) {
    const res = await api.put(`/gallery/${id}`, { status: "published" });
    return res.data;
  },

  async unpublish(id) {
    const res = await api.put(`/gallery/${id}`, { status: "draft" });
    return res.data;
  },

  /** No-op subscribe — kept for backward compatibility */
  subscribe(_cb) {
    return () => {};
  },
};
