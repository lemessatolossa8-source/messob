"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";
import Logo from "@/components/logo";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Email validation
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    // In production, this would send a password reset email
    // For now, just show a success message with admin contact
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <div className="w-full max-w-md space-y-6 rounded-2xl bg-white p-8 shadow-lg">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="rounded-full bg-emerald-100 p-3">
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-900">
                Request Submitted
              </h2>
              <p className="text-sm text-slate-600">
                Your password reset request has been received.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 space-y-2">
            <p className="text-xs font-semibold text-blue-900">
              Contact System Administrator
            </p>
            <p className="text-xs text-blue-700">
              For security reasons, password resets must be processed by the system administrator. 
              Please contact the IT department at Burayu City Administration with your email address:
            </p>
            <p className="text-xs font-bold text-blue-900 break-all">
              {email}
            </p>
          </div>

          <Link
            href="/admin/login"
            className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-6">
          {/* Logo */}
          <div className="flex justify-center">
            <Logo size="lg" showText={true} href="/" />
          </div>

          {/* Form Card */}
          <div className="rounded-2xl bg-white p-8 shadow-lg space-y-6">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-slate-900">
                Reset Password
              </h1>
              <p className="text-sm text-slate-600">
                Enter your email address and we'll help you reset your password.
              </p>
            </div>

            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-700">
                <span className="font-bold">Error:</span> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-blue-600 py-3 text-sm font-bold text-white shadow-md hover:bg-blue-700 active:scale-[0.99] transition"
              >
                Submit Reset Request
              </button>
            </form>

            <div className="text-center">
              <Link
                href="/admin/login"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 transition"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to Login
              </Link>
            </div>
          </div>

          {/* Info Box */}
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-1">
            <p className="text-xs font-semibold text-amber-900">
              Security Notice
            </p>
            <p className="text-xs text-amber-700">
              Password resets for administrator accounts must be processed by the system administrator 
              to ensure security. Your request will be reviewed and processed as soon as possible.
            </p>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-slate-500">
            &copy; {new Date().getFullYear()} Burayu City Administration
          </div>
        </div>
      </div>
    </div>
  );
}
