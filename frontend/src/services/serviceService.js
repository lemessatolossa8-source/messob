/**
 * serviceService — wraps the Express/MySQL backend API.
 * Replaces the previous localStorage-based storageStore implementation.
 */
import api from "./api";

export const serviceService = {
  async getAll(params = {}) {
    try {
      const res = await api.get("/services", params);
      return res.data;
    } catch (err) {
      console.error("[serviceService] getAll error:", err);
      return { items: [], total: 0, totalPages: 1, currentPage: 1 };
    }
  },

  async getById(id) {
    try {
      const res = await api.get(`/services/${id}`);
      return res.data;
    } catch {
      return null;
    }
  },

  async create(data) {
    const res = await api.post("/services", data);
    return res.data;
  },

  async update(id, data) {
    const res = await api.put(`/services/${id}`, data);
    return res.data;
  },

  async delete(id) {
    return api.delete(`/services/${id}`);
  },

  async publish(id) {
    const res = await api.put(`/services/${id}`, { status: "published" });
    return res.data;
  },

  async unpublish(id) {
    const res = await api.put(`/services/${id}`, { status: "draft" });
    return res.data;
  },

  subscribe(_cb) {
    return () => {};
  },
};
