"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ShieldCheck, RefreshCw } from "lucide-react";
import Logo from "@/components/Logo";

function VerifyOTPForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!email) {
      router.push("/admin/forgot-password");
    }
  }, [email, router]);

  const handleChange = (index, value) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    
    // Only process if it's 6 digits
    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split("");
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join("");

    if (otpCode.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim(), otp: otpCode }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errorMsg = data && typeof data.message === "string" && data.message !== "null"
          ? data.message
          : "Invalid OTP code. Please try again.";
        throw new Error(errorMsg);
      }

      // Redirect to reset password page with the reset token
      router.push(`/admin/reset-password?email=${encodeURIComponent(email.trim())}&token=${data.resetToken}`);
    } catch (err) {
      const msg = err && err.message && err.message !== "null" && err.message !== "undefined"
        ? err.message
        : "Verification failed. Please try again.";
      setError(msg);
      // Clear OTP on error
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setResendSuccess(false);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/auth/resend-otp", {
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
          : "Failed to resend OTP. Please try again.";
        throw new Error(errorMsg);
      }

      setResendSuccess(true);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
      
      // Hide success message after 3 seconds
      setTimeout(() => setResendSuccess(false), 3000);
    } catch (err) {
      const msg = err && err.message && err.message !== "null" && err.message !== "undefined"
        ? err.message
        : "Failed to resend OTP. Please try again.";
      setError(msg);
    } finally {
      setResending(false);
    }
  };

  if (!email) {
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
              OTP Verification
            </span>
          </div>

          {/* Form Content */}
          <div className="my-auto py-8 space-y-6 max-w-md w-full mx-auto">
            <div className="space-y-1.5">
              <h1 className="text-2xl font-extrabold text-[#070707] tracking-tight">
                Enter OTP Code
              </h1>
              <p className="text-xs text-slate-500">
                We've sent a 6-digit verification code to{" "}
                <span className="font-semibold text-[#070707]">{email}</span>
              </p>
            </div>

            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-[#FE0002] flex items-start gap-2">
                <span className="font-bold">Error:</span> {error}
              </div>
            )}

            {resendSuccess && (
              <div className="rounded-xl border border-[#070707] bg-[#070707] p-3.5 text-xs text-white flex items-start gap-2">
                <span className="font-bold">Success!</span> New OTP code has been sent to your email.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* OTP Input Fields */}
              <div>
                <label className="block text-xs font-semibold text-[#070707] mb-3 text-center">
                  Enter 6-Digit OTP Code
                </label>
                <div className="flex gap-2 justify-center" onPaste={handlePaste}>
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 border-slate-300 bg-[#f8fafc] text-[#070707] focus:border-[#FE0002] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FE0002]/10 transition"
                    />
                  ))}
                </div>
                <p className="mt-2 text-xs text-slate-500 text-center">
                  Code expires in 10 minutes
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || otp.join("").length !== 6}
                className="w-full rounded-xl bg-[#FE0002] py-3 text-sm font-bold text-white shadow-xs hover:bg-[#CC0002] active:scale-[0.99] transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    <span>Verify OTP</span>
                  </>
                )}
              </button>
            </form>

            {/* Resend OTP */}
            <div className="text-center space-y-2">
              <p className="text-xs text-slate-600">
                Didn't receive the code?
              </p>
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#FE0002] hover:text-[#FE0002] transition disabled:opacity-60"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${resending ? "animate-spin" : ""}`} />
                <span>{resending ? "Sending..." : "Resend OTP"}</span>
              </button>
            </div>

            <div className="pt-2 text-center">
              <Link
                href="/admin/forgot-password"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#FE0002] transition"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Change Email Address</span>
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
            {/* OTP Illustration */}
            <div className="w-full max-w-lg p-6 bg-white/40 backdrop-blur-md rounded-3xl border border-white/60 shadow-xl shadow-slate-200/50 flex justify-center">
              <svg
                viewBox="0 0 400 400"
                className="w-full h-auto max-h-[320px]"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Mobile Phone */}
                <rect x="120" y="80" width="160" height="280" rx="20" fill="#1e293b" stroke="#0f172a" strokeWidth="4" />
                <rect x="135" y="100" width="130" height="240" rx="8" fill="#f8fafc" />
                
                {/* OTP Display */}
                <text x="200" y="160" textAnchor="middle" fontSize="32" fontWeight="bold" fill="#3b82f6" fontFamily="monospace">
                  1 2 3 4 5 6
                </text>
                
                {/* Clock Icon */}
                <circle cx="200" cy="200" r="25" stroke="#cbd5e1" strokeWidth="3" fill="none" />
                <line x1="200" y1="200" x2="200" y2="185" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
                <line x1="200" y1="200" x2="210" y2="200" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
                
                {/* Checkmark */}
                <circle cx="200" cy="260" r="30" fill="#10b981" />
                <path d="M185 260L195 270L220 245" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                
                {/* Signal Waves */}
                <path d="M90 120C90 120 80 140 80 160C80 180 90 200 90 200" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.5" />
                <path d="M60 140C60 140 50 160 50 180C50 200 60 220 60 220" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.3" />
                
                <path d="M310 120C310 120 320 140 320 160C320 180 310 200 310 200" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.5" />
                <path d="M340 140C340 140 350 160 350 180C350 200 340 220 340 220" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.3" />
              </svg>
            </div>

            {/* Subtext */}
            <div className="space-y-2 max-w-md">
              <h2 className="text-xl font-bold text-[#070707]">
                Verify Your Identity
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Enter the 6-digit code we sent to your email. This code is valid for 10 minutes and can only be used once for security purposes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><span className="h-6 w-6 animate-spin rounded-full border-2 border-[#FE0002] border-t-transparent" /></div>}>
      <VerifyOTPForm />
    </Suspense>
  );
}
