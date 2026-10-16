"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import authService from "@/src/services/authService";

/**
 * Hook to protect admin routes with authentication check.
 * Always validates the token against the API (not just localStorage).
 */
export function useAuth({ redirectTo = "/admin/login", redirectIfAuthenticated = false } = {}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      // No token at all — definitely not authenticated
      if (!authService.isAuthenticated()) {
        setIsAuthenticated(false);
        setUser(null);
        setIsLoading(false);
        if (!redirectIfAuthenticated) {
          router.replace(redirectTo);
        }
        return;
      }

      // Token exists — verify it with the API to catch expired/invalid tokens
      try {
        const res = await authService.getMe();
        if (res && res.success) {
          // If we successfully authenticated using localStorage, ensure cookies are also set
          // to prevent infinite redirect loops with the proxy/middleware.
          authService.syncSessionCookie();
          
          setIsAuthenticated(true);
          setUser(res.data);
          setIsLoading(false);
          if (redirectIfAuthenticated) {
            router.replace(redirectTo);
          }
        } else {
          throw new Error("Invalid session");
        }
      } catch {
        // Token is expired or invalid — clear it and treat as logged out
        authService.logout();
        setIsAuthenticated(false);
        setUser(null);
        setIsLoading(false);
        if (!redirectIfAuthenticated) {
          router.replace(redirectTo);
        }
      }
    };

    checkAuth();
  }, [router, redirectTo, redirectIfAuthenticated]);

  return { isLoading, isAuthenticated, user };
}

/**
 * Hook for pages that require authentication.
 * Redirects to login if not authenticated.
 */
export function useRequireAuth() {
  return useAuth({ redirectTo: "/admin/login" });
}

/**
 * Hook for the login page — redirects to dashboard if already authenticated.
 */
export function useRedirectIfAuthenticated() {
  return useAuth({ redirectTo: "/admin/dashboard", redirectIfAuthenticated: true });
}
