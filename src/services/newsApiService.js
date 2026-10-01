import api from "./api";

const getToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("mesob_token");
};

const getApiBase = () => {
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
};

export const newsApiService = {
  getAll: (params = {}) => api.get("/news", params),
  getById: (id) => api.get(`/news/${id}`),
  
  // Standard JSON create
  create: (data) => api.post("/news", data),
  
  // Create with file upload (FormData)
  createWithImage: async (formData) => {
    const token = getToken();
    const base = getApiBase();
    const response = await fetch(`${base}/news`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || "Failed to create news");
    }
    return result;
  },
  
  // Standard JSON update
  update: (id, data) => api.put(`/news/${id}`, data),
  
  // Update with file upload (FormData)
  updateWithImage: async (id, formData) => {
    const token = getToken();
    const base = getApiBase();
    const response = await fetch(`${base}/news/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || "Failed to update news");
    }
    return result;
  },
  
  remove: (id) => api.delete(`/news/${id}`),
};

export default newsApiService;
