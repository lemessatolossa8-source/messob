import api from "./api";

export const newsApiService = {
  getAll: (params = {}) => api.get("/news", params),
  getById: (id) => api.get(`/news/${id}`),
  create: (data) => api.post("/news", data),
  update: (id, data) => api.put(`/news/${id}`, data),
  remove: (id) => api.delete(`/news/${id}`),
};

export default newsApiService;
