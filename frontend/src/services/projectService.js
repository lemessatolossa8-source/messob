/**
 * Project Service – connects to the Express/MySQL backend.
 * All methods are async and return Promises.
 */
import api from "./api";

const BASE = "/projects";

export const projectService = {
  /**
   * Fetch all projects. Pass { status, category, search, page, limit }.
   * Returns { items, total, totalPages, currentPage }
   */
  async getAll(params = {}) {
    const res = await api.get(BASE, params);
    return res.data;
  },

  /**
   * Fetch a single project by ID.
   */
  async getById(id) {
    const res = await api.get(`${BASE}/${id}`);
    return res.data;
  },

  /**
   * Create a new project. Requires admin/editor token.
   */
  async create(data) {
    const res = await api.post(BASE, data);
    return res.data;
  },

  /**
   * Update a project by ID. Requires admin/editor token.
   */
  async update(id, data) {
    const res = await api.put(`${BASE}/${id}`, data);
    return res.data;
  },

  /**
   * Delete a project by ID. Requires admin token.
   */
  async delete(id) {
    const res = await api.delete(`${BASE}/${id}`);
    return res;
  },

  /**
   * Publish a project (set status to published).
   */
  async publish(id) {
    const res = await api.put(`${BASE}/${id}`, { status: "published" });
    return res.data;
  },

  /**
   * Unpublish a project (set status to draft).
   */
  async unpublish(id) {
    const res = await api.put(`${BASE}/${id}`, { status: "draft" });
    return res.data;
  },

  /**
   * No-op subscribe (real-time not needed with API; polling via useEffect works fine).
   * Returns an unsubscribe function for API compatibility with existing code.
   */
  subscribe(cb) {
    // Intentional no-op – API data is fetched via useEffect dependencies
    return () => {};
  },
};
