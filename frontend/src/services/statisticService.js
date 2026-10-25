import api from "./api";

export const statisticService = {
  async getAll(params = {}) {
    try {
      const res = await api.get("/statistics", params);
      return res.data;
    } catch (err) {
      console.error("[statisticService] getAll error:", err);
      return { items: [], total: 0, totalPages: 1, currentPage: 1 };
    }
  },

  async getById(id) {
    try {
      const res = await api.get(`/statistics/${id}`);
      return res.data;
    } catch {
      return null;
    }
  },

  async create(data) {
    const res = await api.post("/statistics", data);
    return res.data;
  },

  async update(id, data) {
    const res = await api.put(`/statistics/${id}`, data);
    return res.data;
  },

  async patch(id, data) {
    const res = await api.patch(`/statistics/${id}`, data);
    return res.data;
  },

  async delete(id) {
    const res = await api.delete(`/statistics/${id}`);
    return res;
  },

  async publish(id) {
    const res = await api.put(`/statistics/${id}`, { status: "published" });
    return res.data;
  },

  async unpublish(id) {
    const res = await api.put(`/statistics/${id}`, { status: "draft" });
    return res.data;
  },

  subscribe(_cb) {
    return () => {};
  },
};
