"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Lock, Eye, EyeOff, CheckCircle, Check, Circle } from "lucide-react";
import Logo from "@/components/Logo";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const token = searchParams.get("token") || searchParams.get("otp"); // Fallback for old links

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!email || !token) {
      router.push("/admin/forgot-password");
    }
  }, [email, token, router]);

  const validatePassword = () => {
    if (newPassword.length < 12) {
      return "Password must be at least 12 characters long";
    }
    if (!/[A-Z]/.test(newPassword)) return "Password must contain an uppercase letter";
    if (!/[a-z]/.test(newPassword)) return "Password must contain a lowercase letter";
    if (!/[0-9]/.test(newPassword)) return "Password must contain a number";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) return "Password must contain a special character";
    if (newPassword !== confirmPassword) {
      return "Passwords do not match";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validatePassword();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          email: email.trim(), 
          resetToken: token, 
          newPassword 
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errorMsg = data && typeof data.message === "string" && data.message !== "null"
          ? data.message
          : "Failed to reset password. Please try again.";
        throw new Error(errorMsg);
      }

      setSuccess(true);
      
      // Redirect to login page after 2 seconds
      setTimeout(() => {
        router.push("/admin/login");
      }, 2000);
    } catch (err) {
      const msg = err && err.message && err.message !== "null" && err.message !== "undefined"
        ? err.message
        : "Failed to reset password. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!email || !token) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-[#f4f6f9] text-[#070707] font-sans antialiased">
      <div className="grid w-full grid-cols-1 lg:grid-cols-12 min-h-screen">
        {/* Left Side: Form Container */}
        <div className="col-span-1 lg:col-span-5 xl:col-span-4 flex flex-col justify-between bg-white px-6 py-8 sm:px-12 md:px-16 border-r border-slate-200/80 shadow-sm">
          {/* Top Logo */}
          <div className="flex items-center justify-between">
            <Logo size="md" showText={true} href="/" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
              Create New Password
            </span>
          </div>

          {/* Form Content */}
          <div className="my-auto py-8 space-y-6 max-w-md w-full mx-auto">
            <div className="space-y-1.5">
              <h1 className="text-2xl font-extrabold text-[#070707] tracking-tight">
                Create New Password
              </h1>
              <p className="text-xs text-slate-500">
                Your identity has been verified. Create a strong new password for your admin account.
              </p>
            </div>

            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-[#FE0002] flex items-start gap-2">
                <span className="font-bold">Error:</span> {error}
              </div>
            )}

            {success && (
              <div className="rounded-xl border border-[#070707] bg-[#070707] p-3.5 text-xs text-white flex items-start gap-2">
                <CheckCircle className="h-4 w-4 flex-shrink-0 mt-0.5 text-[#FE0002]" />
                <div>
                  <span className="font-bold">Success!</span> Password reset successfully. Redirecting to login...
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-[#070707] mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full rounded-xl border border-slate-300 bg-[#f8fafc] pl-10 pr-10 py-2.5 text-sm text-[#070707] placeholder-slate-400 focus:border-[#FE0002] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FE0002]/10 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="mt-1.5 text-xs text-slate-500">
                  Must be at least 12 characters with uppercase, lowercase, number, and special character
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#070707] mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full rounded-xl border border-slate-300 bg-[#f8fafc] pl-10 pr-10 py-2.5 text-sm text-[#070707] placeholder-slate-400 focus:border-[#FE0002] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FE0002]/10 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {newPassword && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-[#070707]">Password Strength:</div>
                  <div className="space-y-1">
                    <div className={`text-xs flex items-center gap-1.5 ${newPassword.length >= 12 ? "text-[#070707] font-semibold" : "text-slate-400"}`}>
                      {newPassword.length >= 12 ? <Check className="h-3.5 w-3.5 text-[#FE0002]" /> : <Circle className="h-3 w-3" />} At least 12 characters
                    </div>
                    <div className={`text-xs flex items-center gap-1.5 ${/[A-Z]/.test(newPassword) ? "text-[#070707] font-semibold" : "text-slate-400"}`}>
                      {/[A-Z]/.test(newPassword) ? <Check className="h-3.5 w-3.5 text-[#FE0002]" /> : <Circle className="h-3 w-3" />} Uppercase letter
                    </div>
                    <div className={`text-xs flex items-center gap-1.5 ${/[0-9]/.test(newPassword) ? "text-[#070707] font-semibold" : "text-slate-400"}`}>
                      {/[0-9]/.test(newPassword) ? <Check className="h-3.5 w-3.5 text-[#FE0002]" /> : <Circle className="h-3 w-3" />} Number
                    </div>
                    <div className={`text-xs flex items-center gap-1.5 ${/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ? "text-[#070707] font-semibold" : "text-slate-400"}`}>
                      {/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ? <Check className="h-3.5 w-3.5 text-[#FE0002]" /> : <Circle className="h-3 w-3" />} Special character
                    </div>
                    <div className={`text-xs flex items-center gap-1.5 ${newPassword === confirmPassword && confirmPassword ? "text-[#070707] font-semibold" : "text-slate-400"}`}>
                      {newPassword === confirmPassword && confirmPassword ? <Check className="h-3.5 w-3.5 text-[#FE0002]" /> : <Circle className="h-3 w-3" />} Passwords match
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || success}
                className="w-full rounded-xl bg-[#FE0002] py-3 text-sm font-bold text-white shadow-xs hover:bg-[#CC0002] active:scale-[0.99] transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Resetting Password...</span>
                  </>
                ) : success ? (
                  <span>Password Reset!</span>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    <span>Reset Password</span>
                  </>
                )}
              </button>
            </form>

            <div className="pt-2 text-center">
              <Link
                href="/admin/login"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#FE0002] transition"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back to Login</span>
              </Link>
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
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-[#FE0002]/5 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-black/5 blur-3xl" />

          <div className="max-w-xl text-center space-y-8 z-10 flex flex-col items-center">
            {/* Password Reset Illustration */}
            <div className="w-full max-w-lg p-6 bg-white/40 backdrop-blur-md rounded-3xl border border-white/60 shadow-xl shadow-slate-200/50 flex justify-center">
              <svg
                viewBox="0 0 400 400"
                className="w-full h-auto max-h-[320px]"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Lock with Key */}
                <rect x="140" y="200" width="120" height="100" rx="15" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="4" />
                <path d="M160 200V160C160 130 175 110 200 110C225 110 240 130 240 160V200" 
                      stroke="#1d4ed8" strokeWidth="10" fill="none" strokeLinecap="round" />
                <circle cx="200" cy="240" r="12" fill="#1e40af" />
                <rect x="196" y="240" width="8" height="35" rx="4" fill="#1e40af" />
                
                {/* Key Entering Lock */}
                <ellipse cx="280" cy="250" rx="25" ry="35" fill="#fbbf24" stroke="#f59e0b" strokeWidth="4" transform="rotate(30 280 250)" />
                <rect x="275" y="220" width="60" height="12" rx="6" fill="#f59e0b" transform="rotate(30 275 220)" />
                <rect x="320" y="200" width="15" height="8" fill="#f59e0b" transform="rotate(30 320 200)" />
                <rect x="320" y="212" width="15" height="8" fill="#f59e0b" transform="rotate(30 320 212)" />
                
                {/* Checkmark Circle */}
                <circle cx="200" cy="120" r="35" fill="#10b981" />
                <path d="M185 120L195 130L220 105" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                
                {/* Sparkles */}
                <path d="M90 180L95 185L100 180L95 175L90 180Z" fill="#fbbf24" />
                <path d="M310 280L315 285L320 280L315 275L310 280Z" fill="#fbbf24" />
                <path d="M120 300L123 303L126 300L123 297L120 300Z" fill="#60a5fa" />
              </svg>
            </div>

            {/* Subtext */}
            <div className="space-y-2 max-w-md">
              <h2 className="text-xl font-bold text-[#070707]">
                Almost Done!
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Create a strong new password for your admin account. Use at least 12 characters with uppercase, lowercase, a number and a special character.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><span className="h-6 w-6 animate-spin rounded-full border-2 border-[#FE0002] border-t-transparent" /></div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
