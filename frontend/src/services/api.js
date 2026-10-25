/**
 * Base API client for the Burayu MESOB backend.
 * All service files import this.
 */

export const getApiBase = () => {
  if (typeof window !== "undefined") {
    // If NEXT_PUBLIC_API_URL is configured with an absolute URL, use it directly (e.g. Render backend)
    const publicUrl = process.env.NEXT_PUBLIC_API_URL;
    if (publicUrl && publicUrl.startsWith("http")) {
      return publicUrl.replace(/\/+$/, "");
    }
    // Otherwise fallback to same-origin /api rewrite via Next.js proxy
    return `${window.location.origin}/api`;
  }
  const backend = process.env.BACKEND_URL
    ? `${process.env.BACKEND_URL.replace(/\/+$/, "").replace(/\/api$/, "")}/api`
    : null;
  return (
    process.env.INTERNAL_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    backend ||
    "http://127.0.0.1:5000/api"
  );
};

// Retrieve the JWT from localStorage (client-side only)
const getToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("mesob_token");
};

// Short-lived in-memory cache for unauthenticated public GET requests only (prevents duplicate waterfalls)
const publicGetCache = new Map();
const CACHE_TTL_MS = 60 * 1000;

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

    const token = getToken();
    const urlString = url.toString();

    // Authenticated (admin/editor) requests are NEVER cached
    if (token) {
      return fetch(urlString, { headers: buildHeaders() }).then(handleResponse);
    }

    // Public GET request — check cache
    const cached = publicGetCache.get(urlString);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.promise;
    }

    const promise = fetch(urlString, { headers: buildHeaders() })
      .then(handleResponse)
      .catch((err) => {
        publicGetCache.delete(urlString);
        throw err;
      });

    publicGetCache.set(urlString, { timestamp: Date.now(), promise });
    return promise;
  },

  post: (path, body) => {
    invalidateCacheAndNotify();
    const base = getApiBase();
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return fetch(`${base}${cleanPath}`, {
      method: "POST",
      headers: buildHeaders(),
      body: JSON.stringify(body),
    }).then(handleResponse);
  },

  put: (path, body) => {
    invalidateCacheAndNotify();
    const base = getApiBase();
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return fetch(`${base}${cleanPath}`, {
      method: "PUT",
      headers: buildHeaders(),
      body: JSON.stringify(body),
    }).then(handleResponse);
  },

  delete: (path) => {
    invalidateCacheAndNotify();
    const base = getApiBase();
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return fetch(`${base}${cleanPath}`, {
      method: "DELETE",
      headers: buildHeaders(),
    }).then(handleResponse);
  },
};

export const invalidateCacheAndNotify = () => {
  publicGetCache.clear();
  if (typeof window !== "undefined") {
    try {
      window.dispatchEvent(new CustomEvent("mesob_content_updated"));
    } catch {}
  }
};

export default api;
