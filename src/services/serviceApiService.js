import api from "./api";

export const serviceApiService = {
  getAll: (params = {}) => api.get("/services", params),
  getById: (id) => api.get(`/services/${id}`),
  create: (data) => api.post("/services", data),
  update: (id, data) => api.put(`/services/${id}`, data),
  remove: (id) => api.delete(`/services/${id}`),
};

export default serviceApiService;
