/**
 * Base API client for the Burayu MESOB backend.
 * All service files import this.
 */

const getApiBase = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    console.log('[api.js] Using NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== "undefined") {
    const fallback = `${window.location.origin}/api`;
    console.log('[api.js] Using fallback URL:', fallback);
    return fallback;
  }
  console.log('[api.js] Using SSR fallback: http://localhost:3000/api');
  return "http://localhost:3000/api";
};

// Retrieve the JWT from localStorage (client-side only)
const getToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("mesob_token");
};

const buildHeaders = (extra = {}) => {
  const headers = {
    "Content-Type": "application/json",
    ...extra,
  };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
};

const handleResponse = async (res) => {
  const contentType = res.headers.get("content-type") || "";
  let data;
  if (contentType.includes("application/json")) {
    data = await res.json();
  } else {
    const text = await res.text();
    data = { success: res.ok, message: text };
  }

  if (!res.ok) {
    const error = new Error(data.message || `Request failed with status ${res.status}`);
    error.status = res.status;
    throw error;
  }
  return data;
};

export const api = {
  get: (path, params = {}) => {
    const base = getApiBase();
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    const url = new URL(`${base}${cleanPath}`);
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, v);
    });
    return fetch(url.toString(), { headers: buildHeaders() }).then(handleResponse);
  },

  post: (path, body) => {
    const base = getApiBase();
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return fetch(`${base}${cleanPath}`, {
      method: "POST",
      headers: buildHeaders(),
      body: JSON.stringify(body),
    }).then(handleResponse);
  },

  put: (path, body) => {
    const base = getApiBase();
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return fetch(`${base}${cleanPath}`, {
      method: "PUT",
      headers: buildHeaders(),
      body: JSON.stringify(body),
    }).then(handleResponse);
  },

  delete: (path) => {
    const base = getApiBase();
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return fetch(`${base}${cleanPath}`, {
      method: "DELETE",
      headers: buildHeaders(),
    }).then(handleResponse);
  },
};

export default api;
