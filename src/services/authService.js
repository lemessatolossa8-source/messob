import api from "./api";

const TOKEN_KEY = "mesob_token";
const USER_KEY = "mesob_user";
const COOKIE_NAME = "mesob_session";

/** Write a non-HttpOnly cookie readable by Next.js middleware */
function setSessionCookie(token) {
  if (typeof document === "undefined") return;
  const maxAge = 7 * 24 * 60 * 60; // 7 days in seconds
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(token)}; path=/; max-age=${maxAge}; SameSite=Strict`;
}

/** Clear the session cookie */
function clearSessionCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; SameSite=Strict`;
}

export const authService = {
  /**
   * Login with email + password.
   * Stores JWT in localStorage and as a cookie for middleware access.
   */
  async login(email, password) {
    const trimmedEmail = (email || "").trim().toLowerCase();
    const trimmedPass = (password || "").trim();

    const res = await api.post("/auth/login", { email: trimmedEmail, password: trimmedPass });
    if (res && res.success) {
      localStorage.setItem(TOKEN_KEY, res.data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(res.data.user));
      setSessionCookie(res.data.token);
      return res;
    }

    throw new Error("Invalid email or password");
  },

  /**
   * Register a new admin/editor.
   */
  async register(name, email, password, role = "editor") {
    const res = await api.post("/auth/register", { name, email, password, role });
    if (res.success) {
      localStorage.setItem(TOKEN_KEY, res.data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(res.data.user));
      setSessionCookie(res.data.token);
    }
    return res;
  },

  /**
   * Get current user profile from the API.
   */
  async getMe() {
    return api.get("/auth/me");
  },

  /**
   * Logout – clear stored token, user info, and session cookie.
   */
  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    clearSessionCookie();
  },

  /**
   * Returns the stored user object (without API call).
   */
  getStoredUser() {
    if (typeof window === "undefined") return null;
    try {
      return JSON.parse(localStorage.getItem(USER_KEY));
    } catch {
      return null;
    }
  },

  /**
   * Returns true if a JWT token exists in storage.
   */
  isAuthenticated() {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem(TOKEN_KEY);
  },
};

export default authService;
