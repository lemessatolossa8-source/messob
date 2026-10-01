import api from "./api";

export const announcementApiService = {
  getAll: (params = {}) => api.get("/announcements", params),
  getById: (id) => api.get(`/announcements/${id}`),
  create: (data) => api.post("/announcements", data),
  update: (id, data) => api.put(`/announcements/${id}`, data),
  remove: (id) => api.delete(`/announcements/${id}`),
};

export default announcementApiService;
