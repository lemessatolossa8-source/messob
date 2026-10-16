"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, Send } from "lucide-react";
import Logo from "@/components/Logo";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errorMsg = data && typeof data.message === "string" && data.message !== "null"
          ? data.message
          : "Failed to send OTP code. Please verify the admin email.";
        throw new Error(errorMsg);
      }

      setSuccess(true);
      // Redirect to OTP verification page after 1.5 seconds
      setTimeout(() => {
        router.push(`/admin/verify-otp?email=${encodeURIComponent(email.trim())}`);
      }, 1500);
    } catch (err) {
      const msg = err && err.message && err.message !== "null" && err.message !== "undefined"
        ? err.message
        : "Failed to send OTP. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f4f6f9] text-[#070707] font-sans antialiased">
      <div className="grid w-full grid-cols-1 lg:grid-cols-12 min-h-screen">
        {/* Left Side: Form Container */}
        <div className="col-span-1 lg:col-span-5 xl:col-span-4 flex flex-col justify-between bg-white px-6 py-8 sm:px-12 md:px-16 border-r border-slate-200/80 shadow-sm">
          {/* Top Logo */}
          <div className="flex items-center justify-between">
            <Logo size="md" showText={true} href="/" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
              Password Recovery
            </span>
          </div>

          {/* Form Content */}
          <div className="my-auto py-8 space-y-6 max-w-md w-full mx-auto">
            <div className="space-y-1.5">
              <h1 className="text-2xl font-extrabold text-[#070707] tracking-tight">
                Forgot Password?
              </h1>
              <p className="text-xs text-slate-500">
                Enter your admin email address to receive a 6-digit OTP code for password recovery
              </p>
            </div>

            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-[#FE0002] flex items-start gap-2">
                <span className="font-bold">Error:</span> {error}
              </div>
            )}

            {success && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-700 flex items-start gap-2">
                <span className="font-bold">Success!</span> OTP sent to your email. Redirecting...
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-[#070707] mb-1.5">
                  Admin Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="lemessatolossa8@gmail.com"
                    className="w-full rounded-lg border border-slate-300 bg-[#f8fafc] pl-10 pr-3.5 py-2.5 text-sm text-[#070707] placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition"
                  />
                </div>
                <p className="mt-1.5 text-xs text-slate-500">
                  We'll send a 6-digit OTP code to this email address
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || success}
                className="w-full rounded-lg bg-blue-600 py-3 text-sm font-bold text-white shadow-md shadow-blue-600/25 hover:bg-blue-700 active:scale-[0.99] transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Sending OTP...</span>
                  </>
                ) : success ? (
                  <span>OTP Sent!</span>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Send OTP Code</span>
                  </>
                )}
              </button>
            </form>

            <div className="pt-2 space-y-3">
              <div className="text-center">
                <Link
                  href="/admin/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#FE0002] transition"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back to Login</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Footer Copyright */}
          <div className="text-center text-[11px] text-slate-400 border-t border-slate-100 pt-4">
            &copy; {new Date().getFullYear()} Burayu MESOB. All rights reserved.
          </div>
        </div>

        {/* Right Side: Graphic Illustration Showcase */}
        <div className="hidden lg:flex lg:col-span-7 xl:col-span-8 bg-[#eef2f7] items-center justify-center p-12 relative overflow-hidden">
          {/* Subtle Background Geometric Accents */}
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-blue-400/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-indigo-400/10 blur-3xl" />

          <div className="max-w-xl text-center space-y-8 z-10 flex flex-col items-center">
            {/* Security Illustration */}
            <div className="w-full max-w-lg p-6 bg-white/40 backdrop-blur-md rounded-3xl border border-white/60 shadow-xl shadow-slate-200/50 flex justify-center">
              <svg
                viewBox="0 0 400 400"
                className="w-full h-auto max-h-[320px]"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Lock Body */}
                <rect x="120" y="180" width="160" height="140" rx="20" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="4" />
                
                {/* Lock Shackle */}
                <path d="M140 180V140C140 110 160 90 200 90C240 90 260 110 260 140V180" 
                      stroke="#1d4ed8" strokeWidth="12" fill="none" strokeLinecap="round" />
                
                {/* Keyhole */}
                <circle cx="200" cy="230" r="15" fill="#1e40af" />
                <rect x="195" y="230" width="10" height="40" rx="5" fill="#1e40af" />
                
                {/* Email Envelope Behind */}
                <rect x="80" y="240" width="100" height="70" rx="8" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="3" opacity="0.8" />
                <path d="M80 240L130 270L180 240" stroke="#cbd5e1" strokeWidth="3" fill="none" opacity="0.8" />
                
                {/* Shield Icon */}
                <path d="M310 200L340 180V250C340 270 330 290 310 300C290 290 280 270 280 250V180L310 200Z" 
                      fill="#f8fafc" stroke="#cbd5e1" strokeWidth="3" />
                <path d="M300 230L310 240L330 220" stroke="#10b981" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            </div>

            {/* Subtext */}
            <div className="space-y-2 max-w-md">
              <h2 className="text-xl font-bold text-[#070707]">
                Secure Password Recovery
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                We'll send a one-time verification code to your registered email address. The OTP expires in 10 minutes and can only be used once.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
