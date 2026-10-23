"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Lock, Mail } from "lucide-react";
import Logo from "@/components/Logo";
import authService from "@/src/services/authService";
import { useRedirectIfAuthenticated } from "@/src/lib/hooks/useAuth";

export default function AdminLoginPage() {
  const router = useRouter();
  const { isLoading: authLoading } = useRedirectIfAuthenticated();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isInteractive, setIsInteractive] = useState(false);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center space-y-3">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#D71920] border-r-transparent"></div>
          <p className="text-sm font-medium text-neutral-400">Loading...</p>
        </div>
      </div>
    );
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authService.login(email, password);
      const params =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search)
          : null;
      const destination = params?.get("from") || "/admin/dashboard";
      window.location.href = destination;
    } catch (err) {
      setError(err.message || "Login failed. Check your credentials.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 py-12">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <Logo size="md" showText={true} href="/" />
        </div>

        {/* Heading */}
        <h1 className="text-center text-2xl font-black tracking-tight text-[#000000]">
          Admin Login
        </h1>

        {/* Error Message */}
        {error && (
          <div className="rounded-xl border border-[#D71920]/25 bg-[#D71920]/5 px-4 py-3 text-xs font-semibold text-[#D71920]">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} autoComplete="off" className="space-y-5">
          {/* Hidden decoy fields to divert aggressive browser credential autofill */}
          <div className="sr-only hidden" aria-hidden="true">
            <input type="text" name="mesob_fake_user" tabIndex={-1} autoComplete="off" />
            <input type="password" name="mesob_fake_pass" tabIndex={-1} autoComplete="new-password" />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="admin-email" className="block text-xs font-bold text-[#000000] mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-neutral-400" />
              <input
                id="admin-email"
                name="admin_login_email"
                type="email"
                required
                autoComplete="off"
                data-lpignore="true"
                data-1p-ignore="true"
                data-form-type="other"
                readOnly={!isInteractive}
                onFocus={() => setIsInteractive(true)}
                onMouseDown={() => setIsInteractive(true)}
                onTouchStart={() => setIsInteractive(true)}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@burayu.gov.et"
                className="w-full rounded-xl border border-neutral-300 bg-white pl-10 pr-4 py-2.5 text-sm text-[#000000] placeholder-neutral-400 focus:border-[#D71920] focus:outline-none focus:ring-2 focus:ring-[#D71920]/15 transition"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="admin-password" className="block text-xs font-bold text-[#000000] mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-neutral-400" />
              <input
                id="admin-password"
                name="admin_login_password"
                type="password"
                required
                autoComplete="new-password"
                data-lpignore="true"
                data-1p-ignore="true"
                data-form-type="other"
                readOnly={!isInteractive}
                onFocus={() => setIsInteractive(true)}
                onMouseDown={() => setIsInteractive(true)}
                onTouchStart={() => setIsInteractive(true)}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-xl border border-neutral-300 bg-white pl-10 pr-4 py-2.5 text-sm text-[#000000] placeholder-neutral-400 focus:border-[#D71920] focus:outline-none focus:ring-2 focus:ring-[#D71920]/15 transition"
              />
            </div>
          </div>

          {/* Forgot Password */}
          <div className="text-right">
            <Link
              href="/admin/forgot-password"
              className="text-xs font-bold text-[#D71920] hover:underline transition"
            >
              Forgot password?
            </Link>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#D71920] hover:bg-[#b5141a] py-3 text-sm font-bold text-white shadow-md transition disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Return to Public Portal */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-500 hover:text-[#D71920] transition group cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
            <span>Return to Public Web Portal</span>
          </Link>
        </div>

        {/* Copyright */}
        <p className="text-center text-[11px] text-neutral-400">
          &copy; {new Date().getFullYear()} Burayu MESOB. All rights reserved.
        </p>
      </div>
    </div>
  );
}
