import api from "./api";

export const branchApiService = {
  getAll: (params = {}) => api.get("/branches", params),
  getById: (id) => api.get(`/branches/${id}`),
  create: (data) => api.post("/branches", data),
  update: (id, data) => api.put(`/branches/${id}`, data),
  remove: (id) => api.delete(`/branches/${id}`),
};

export default branchApiService;
