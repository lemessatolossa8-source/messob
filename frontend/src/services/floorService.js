import api, { getApiBase } from "./api";

const getToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("mesob_token") || localStorage.getItem("token");
};

const listeners = new Set();
const notify = () => listeners.forEach((cb) => cb());

export const floorService = {
  subscribe(callback) {
    listeners.add(callback);
    return () => listeners.delete(callback);
  },

  /**
   * Fetch all floors
   * @param {Object} params - query parameters (e.g. status)
   */
  async getAll(params = {}) {
    try {
      const res = await api.get("/floors", params);
      return res.data || [];
    } catch (err) {
      console.error("[floorService] getAll error:", err);
      return [];
    }
  },

  /**
   * Fetch a specific floor by floor number (1, 2, 3, 4)
   * @param {number|string} floorNumber
   */
  async getByNumber(floorNumber) {
    try {
      const res = await api.get(`/floors/number/${floorNumber}`);
      return res.data;
    } catch (err) {
      console.error(`[floorService] getByNumber(${floorNumber}) error:`, err);
      throw err;
    }
  },

  /**
   * Fetch floor by ID
   * @param {number|string} id
   */
  async getById(id) {
    try {
      const res = await api.get(`/floors/${id}`);
      return res.data;
    } catch (err) {
      console.error(`[floorService] getById(${id}) error:`, err);
      throw err;
    }
  },

  /**
   * Create a new floor (with optional image file)
   */
  async create(data, imageFile = null) {
    const token = getToken();
    const base = getApiBase();

    if (imageFile) {
      const form = new FormData();
      Object.entries(data).forEach(([key, val]) => {
        if (typeof val === "object" && val !== null) {
          form.append(key, JSON.stringify(val));
        } else {
          form.append(key, val);
        }
      });
      form.append("image", imageFile);

      const res = await fetch(`${base}/floors`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to create floor");
      notify();
      return result;
    }

    const res = await api.post("/floors", data);
    notify();
    return res;
  },

  /**
   * Update floor (with optional image file)
   */
  async update(id, data, imageFile = null) {
    const token = getToken();
    const base = getApiBase();

    if (imageFile) {
      const form = new FormData();
      Object.entries(data).forEach(([key, val]) => {
        if (typeof val === "object" && val !== null) {
          form.append(key, JSON.stringify(val));
        } else {
          form.append(key, val);
        }
      });
      form.append("image", imageFile);

      const res = await fetch(`${base}/floors/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to update floor");
      notify();
      return result;
    }

    const res = await api.put(`/floors/${id}`, data);
    notify();
    return res;
  },

  /**
   * Delete floor
   */
  async delete(id) {
    const res = await api.delete(`/floors/${id}`);
    notify();
    return res;
  },

  /**
   * Toggle publish / unpublish
   */
  async publish(id) {
    const res = await api.put(`/floors/${id}`, { status: "published" });
    notify();
    return res;
  },

  async unpublish(id) {
    const res = await api.put(`/floors/${id}`, { status: "draft" });
    notify();
    return res;
  },

  /**
   * Add service to a floor
   */
  async addService(floorId, data, imageFile = null) {
    const token = getToken();
    const base = getApiBase();

    if (imageFile) {
      const form = new FormData();
      Object.entries(data).forEach(([key, val]) => {
        if (typeof val === "object" && val !== null) {
          form.append(key, JSON.stringify(val));
        } else {
          form.append(key, val);
        }
      });
      form.append("image", imageFile);

      const res = await fetch(`${base}/floors/${floorId}/services`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to add service to floor");
      notify();
      return result;
    }

    const res = await api.post(`/floors/${floorId}/services`, data);
    notify();
    return res;
  },

  /**
   * Update a floor service
   */
  async updateService(floorId, serviceId, data, imageFile = null) {
    const token = getToken();
    const base = getApiBase();

    if (imageFile) {
      const form = new FormData();
      Object.entries(data).forEach(([key, val]) => {
        if (typeof val === "object" && val !== null) {
          form.append(key, JSON.stringify(val));
        } else {
          form.append(key, val);
        }
      });
      form.append("image", imageFile);

      const res = await fetch(`${base}/floors/${floorId}/services/${serviceId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to update floor service");
      notify();
      return result;
    }

    const res = await api.put(`/floors/${floorId}/services/${serviceId}`, data);
    notify();
    return res;
  },

  /**
   * Delete a floor service
   */
  async deleteService(floorId, serviceId) {
    const res = await api.delete(`/floors/${floorId}/services/${serviceId}`);
    notify();
    return res;
  },

  /**
   * Reorder floor services
   */
  async reorderServices(floorId, items) {
    const res = await api.put(`/floors/${floorId}/services-reorder`, { items });
    notify();
    return res;
  },

  /**
   * Fetch all services across all floors
   */
  async getAllServices(params = {}) {
    try {
      const res = await api.get("/floors/services/all", params);
      return res.data || [];
    } catch (err) {
      console.error("[floorService] getAllServices error:", err);
      return [];
    }
  },

  /**
   * Add service directly (with floorId in data)
   */
  async addServiceDirect(data, imageFile = null) {
    const token = getToken();
    const base = getApiBase();

    if (imageFile) {
      const form = new FormData();
      Object.entries(data).forEach(([key, val]) => {
        if (typeof val === "object" && val !== null) {
          form.append(key, JSON.stringify(val));
        } else {
          form.append(key, val);
        }
      });
      form.append("image", imageFile);

      const res = await fetch(`${base}/floors/services`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to add service");
      notify();
      return result;
    }

    const res = await api.post("/floors/services", data);
    notify();
    return res;
  },

  /**
   * Update service directly by service ID
   */
  async updateServiceDirect(serviceId, data, imageFile = null) {
    const token = getToken();
    const base = getApiBase();

    if (imageFile) {
      const form = new FormData();
      Object.entries(data).forEach(([key, val]) => {
        if (typeof val === "object" && val !== null) {
          form.append(key, JSON.stringify(val));
        } else {
          form.append(key, val);
        }
      });
      form.append("image", imageFile);

      const res = await fetch(`${base}/floors/services/${serviceId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to update service");
      notify();
      return result;
    }

    const res = await api.put(`/floors/services/${serviceId}`, data);
    notify();
    return res;
  },

  /**
   * Delete service directly by service ID
   */
  async deleteServiceDirect(serviceId) {
    const res = await api.delete(`/floors/services/${serviceId}`);
    notify();
    return res;
  },

  /**
   * Toggle service publish/draft
   */
  async publishService(serviceId) {
    const res = await api.put(`/floors/services/${serviceId}`, { status: "published" });
    notify();
    return res;
  },

  async unpublishService(serviceId) {
    const res = await api.put(`/floors/services/${serviceId}`, { status: "draft" });
    notify();
    return res;
  },
};

export default floorService;
