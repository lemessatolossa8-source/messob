/**
 * newsService — wraps the Express/MySQL backend API.
 * Replaces the previous localStorage-based storageStore implementation.
 * All methods return the same shape { items, total, totalPages, currentPage }
 * so existing components need no changes.
 */
import api, { invalidateCacheAndNotify } from "./api";

const getToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("mesob_token");
};

const getApiBase = () =>
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

/** Upload a news item with an image file via FormData */
const createWithImage = async (formData) => {
  const token = getToken();
  const base = getApiBase();
  const response = await fetch(`${base}/news`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || "Failed to create news");
  invalidateCacheAndNotify();
  return result;
};

const updateWithImage = async (id, formData) => {
  const token = getToken();
  const base = getApiBase();
  const response = await fetch(`${base}/news/${id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || "Failed to update news");
  invalidateCacheAndNotify();
  return result;
};

export const newsService = {
  /**
   * Returns { items, total, totalPages, currentPage }
   * Matches the shape storageStore used to return.
   */
  async getAll(params = {}) {
    try {
      const res = await api.get("/news", params);
      return res.data;
    } catch (err) {
      console.error("[newsService] getAll error:", err);
      return { items: [], total: 0, totalPages: 1, currentPage: 1 };
    }
  },

  async getById(id) {
    try {
      const res = await api.get(`/news/${id}`);
      return res.data;
    } catch {
      return null;
    }
  },

  async create(data) {
    const res = await api.post("/news", data);
    return res.data;
  },

  createWithImage,

  async update(id, data) {
    const res = await api.put(`/news/${id}`, data);
    return res.data;
  },

  updateWithImage,

  async delete(id) {
    return api.delete(`/news/${id}`);
  },

  async publish(id) {
    const res = await api.put(`/news/${id}`, { status: "published" });
    return res.data;
  },

  async unpublish(id) {
    const res = await api.put(`/news/${id}`, { status: "draft" });
    return res.data;
  },

  /**
   * No-op subscribe — API data is fetched via useEffect.
   * Kept for backward compatibility with components that call subscribe().
   */
  subscribe(_cb) {
    return () => {};
  },
};
