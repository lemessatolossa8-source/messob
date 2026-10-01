import api from "./api";

export const contactApiService = {
  /** Public – submit a contact form */
  submit: (data) => api.post("/contact", data),

  /** Admin – list all messages */
  getAll: (params = {}) => api.get("/contact", params),
  getById: (id) => api.get(`/contact/${id}`),
  updateStatus: (id, status) => api.put(`/contact/${id}`, { status }),
  remove: (id) => api.delete(`/contact/${id}`),
};

export default contactApiService;
