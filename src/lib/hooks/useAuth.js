"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import authService from "@/src/services/authService";

/**
 * Hook to protect admin routes with authentication check
 * Redirects to login if not authenticated
 */
export function useAuth({ redirectTo = "/admin/login", redirectIfAuthenticated = false } = {}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = authService.isAuthenticated();
      const storedUser = authService.getStoredUser();

      setIsAuthenticated(authenticated);
      setUser(storedUser);
      setIsLoading(false);

      // Redirect to login if not authenticated (for protected pages)
      if (!authenticated && !redirectIfAuthenticated) {
        router.replace(redirectTo);
      }

      // Redirect to dashboard if authenticated (for login page)
      if (authenticated && redirectIfAuthenticated) {
        router.replace(redirectTo);
      }
    };

    checkAuth();
  }, [router, redirectTo, redirectIfAuthenticated]);

  return {
    isLoading,
    isAuthenticated,
    user,
  };
}

/**
 * Hook for pages that require authentication
 * Shows loading state while checking, redirects if not authenticated
 */
export function useRequireAuth() {
  return useAuth({ redirectTo: "/admin/login" });
}

/**
 * Hook for login page - redirects to dashboard if already authenticated
 */
export function useRedirectIfAuthenticated() {
  return useAuth({ redirectTo: "/admin/dashboard", redirectIfAuthenticated: true });
}
