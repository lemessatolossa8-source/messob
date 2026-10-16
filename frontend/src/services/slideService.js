/**
 * slideService — wraps the Express/MySQL backend API.
 * Replaces the previous localStorage-based storageStore implementation.
 */
import api, { invalidateCacheAndNotify } from "./api";

const getToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("mesob_token");
};

const getApiBase = () =>
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

/** Upload a slide with an image file via FormData */
const createWithImage = async (formData) => {
  const token = getToken();
  const base = getApiBase();
  const response = await fetch(`${base}/slides`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || "Failed to create slide");
  invalidateCacheAndNotify();
  return result;
};

const updateWithImage = async (id, formData) => {
  const token = getToken();
  const base = getApiBase();
  const response = await fetch(`${base}/slides/${id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || "Failed to update slide");
  invalidateCacheAndNotify();
  return result;
};

export const slideService = {
  async getAll(params = {}) {
    try {
      const res = await api.get("/slides", params);
      return res.data;
    } catch (err) {
      console.error("[slideService] getAll error:", err);
      return { items: [], total: 0, totalPages: 1, currentPage: 1 };
    }
  },

  async getById(id) {
    try {
      const res = await api.get(`/slides/${id}`);
      return res.data;
    } catch {
      return null;
    }
  },

  async create(data) {
    const res = await api.post("/slides", data);
    return res.data;
  },

  createWithImage,

  async update(id, data) {
    const res = await api.put(`/slides/${id}`, data);
    return res.data;
  },

  updateWithImage,

  async delete(id) {
    return api.delete(`/slides/${id}`);
  },

  async publish(id) {
    const res = await api.put(`/slides/${id}/publish`);
    return res.data;
  },

  async unpublish(id) {
    const res = await api.put(`/slides/${id}/unpublish`);
    return res.data;
  },

  /** No-op subscribe — kept for backward compatibility */
  subscribe(_cb) {
    return () => {};
  },
};
