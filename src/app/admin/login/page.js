"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Lock, Mail, ShieldCheck, CheckSquare, HelpCircle } from "lucide-react";
import Logo from "@/components/logo";
import authService from "@/src/services/authService";
import { useRedirectIfAuthenticated } from "@/src/lib/hooks/useAuth";

export default function AdminLoginPage() {
  const router = useRouter();
  const { isLoading: authLoading } = useRedirectIfAuthenticated();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="text-center space-y-3">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="text-sm text-slate-600">Loading...</p>
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
      router.push("/admin/dashboard");
    } catch (err) {
      setError(err.message || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f4f6f9] text-slate-800 font-sans antialiased">
      <div className="grid w-full grid-cols-1 lg:grid-cols-12 min-h-screen">
        {/* Left Side: Form Container */}
        <div className="col-span-1 lg:col-span-5 xl:col-span-4 flex flex-col justify-between bg-white px-6 py-8 sm:px-12 md:px-16 border-r border-slate-200/80 shadow-sm">
          {/* Top Logo */}
          <div className="flex items-center justify-between">
            <Logo size="md" showText={true} href="/" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
              Admin Portal
            </span>
          </div>

          {/* Form Content */}
          <div className="my-auto py-8 space-y-6 max-w-md w-full mx-auto">
            <div className="space-y-1.5">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Sign In to MESOB Admin
              </h1>
              <p className="text-xs text-slate-500">
                Official Burayu City Administration CMS and Public Services Portal
              </p>
            </div>

            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-700 flex items-start gap-2">
                <span className="font-bold">Error:</span> {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@burayu.gov.et"
                  className="w-full rounded-lg border border-slate-300 bg-[#f8fafc] px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-slate-300 bg-[#f8fafc] px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition"
                />
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600 select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Remember me</span>
                </label>

                <Link
                  href="/admin/forgot-password"
                  className="font-medium text-blue-600 hover:text-blue-700 hover:underline transition"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-blue-600 py-3 text-sm font-bold text-white shadow-md shadow-blue-600/25 hover:bg-blue-700 active:scale-[0.99] transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Signing in..." : "Log In"}
              </button>
            </form>



            <div className="pt-2 text-center">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Return to Public Web Portal</span>
              </Link>
            </div>
          </div>

          {/* Footer Copyright */}
          <div className="text-center text-[11px] text-slate-400 border-t border-slate-100 pt-4">
            &copy; {new Date().getFullYear()} Burayu City Administration. All rights reserved.
          </div>
        </div>

        {/* Right Side: Graphic Illustration Showcase */}
        <div className="hidden lg:flex lg:col-span-7 xl:col-span-8 bg-[#eef2f7] items-center justify-center p-12 relative overflow-hidden">
          {/* Subtle Background Geometric Accents */}
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-blue-400/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-indigo-400/10 blur-3xl" />

          <div className="max-w-xl text-center space-y-8 z-10 flex flex-col items-center">
            {/* Civic Announcement Vector Graphic Illustration */}
            <div className="w-full max-w-lg p-6 bg-white/40 backdrop-blur-md rounded-3xl border border-white/60 shadow-xl shadow-slate-200/50 flex justify-center">
              <svg
                viewBox="0 0 800 600"
                className="w-full h-auto max-h-[380px]"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Background City Buildings Silhouette */}
                <path d="M120 420V260H190V420" stroke="#cbd5e1" strokeWidth="3" fill="#f1f5f9" />
                <path d="M190 420V220H260V420" stroke="#cbd5e1" strokeWidth="3" fill="#f8fafc" />
                <path d="M260 420V300H320V420" stroke="#cbd5e1" strokeWidth="3" fill="#f1f5f9" />
                <path d="M500 420V200H570V420" stroke="#cbd5e1" strokeWidth="3" fill="#f8fafc" />
                <path d="M570 420V280H630V420" stroke="#cbd5e1" strokeWidth="3" fill="#f1f5f9" />
                <path d="M630 420V240H700V420" stroke="#cbd5e1" strokeWidth="3" fill="#f8fafc" />
                <line x1="80" y1="420" x2="720" y2="420" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />

                {/* Cloud & Bush Curves */}
                <path d="M100 420C120 380 160 380 180 420C200 370 250 370 280 420" fill="#e2e8f0" opacity="0.7" />
                <path d="M520 420C550 370 600 370 630 420C650 380 690 380 710 420" fill="#e2e8f0" opacity="0.7" />

                {/* Megaphone Soundwaves */}
                <path d="M180 180L100 150" stroke="#2563eb" strokeWidth="4" strokeLinecap="round" />
                <path d="M170 240L80 230" stroke="#2563eb" strokeWidth="4" strokeLinecap="round" />
                <path d="M190 290L100 320" stroke="#2563eb" strokeWidth="4" strokeLinecap="round" />

                {/* Megaphone Illustration */}
                <path d="M250 240L380 170V310L250 240Z" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="4" />
                <ellipse cx="380" cy="240" rx="20" ry="70" fill="#1e40af" stroke="#1d4ed8" strokeWidth="4" />
                <path d="M250 220H210V260H250V220Z" fill="#1e293b" />
                <rect x="255" y="255" width="20" height="40" rx="5" transform="rotate(15 255 255)" fill="#0f172a" />

                {/* Person Illustration */}
                {/* Legs */}
                <path d="M470 420L510 300H450L410 420H470Z" fill="#0f172a" />
                <path d="M370 420L410 300H360L330 420H370Z" fill="#0f172a" />
                {/* Feet */}
                <ellipse cx="350" cy="420" rx="25" ry="8" fill="#1e293b" />
                <ellipse cx="490" cy="420" rx="25" ry="8" fill="#1e293b" />

                {/* Body / Shirt */}
                <path d="M380 300C380 250 420 230 460 230C500 230 520 260 520 300H380Z" fill="#f8fafc" stroke="#0f172a" strokeWidth="4" />

                {/* Arms */}
                <path d="M320 240C330 260 370 270 400 260" stroke="#0f172a" strokeWidth="12" strokeLinecap="round" />
                <path d="M320 240L270 245" stroke="#0f172a" strokeWidth="10" strokeLinecap="round" />

                {/* Head */}
                <circle cx="480" cy="190" r="30" fill="#f1f5f9" stroke="#0f172a" strokeWidth="4" />
                <path d="M465 170C475 160 500 165 505 185C505 185 490 190 465 170Z" fill="#0f172a" />
                <path d="M495 190C495 195 490 200 485 200" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" fill="none" />
              </svg>
            </div>

            {/* Subtext */}
            <div className="space-y-2 max-w-md">
              <h2 className="text-xl font-bold text-slate-800">
                Burayu City Administration Portal
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Centralized civic disclosures, municipal service workflows, economic news, and citizen services management system.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
