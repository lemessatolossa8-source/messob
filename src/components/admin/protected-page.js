"use client";

import { useRequireAuth } from "@/src/lib/hooks/useAuth";

/**
 * Wrapper component for protected admin pages
 * Automatically checks authentication and shows loading state
 */
export default function ProtectedPage({ children, loadingMessage = "Loading..." }) {
  const { isLoading, isAuthenticated, user } = useRequireAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-600 border-r-transparent"></div>
          <p className="text-sm text-slate-600 font-medium">{loadingMessage}</p>
        </div>
      </div>
    );
  }

  // If authenticated, render the protected content with user context
  return <>{typeof children === "function" ? children({ user }) : children}</>;
}
