"use client";

import { createContext, useContext, useState, useCallback, useMemo } from "react";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((type, message, title = "") => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast = { id, type, message, title };

    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      removeToast(id);
    }, 4500);
  }, [removeToast]);

  const success = useCallback((message, title) => showToast("success", message, title), [showToast]);
  const error = useCallback((message, title) => showToast("error", message, title), [showToast]);
  const info = useCallback((message, title) => showToast("info", message, title), [showToast]);
  const warning = useCallback((message, title) => showToast("warning", message, title), [showToast]);

  const value = useMemo(
    () => ({
      success,
      error,
      info,
      warning,
      showToast,
    }),
    [success, error, info, warning, showToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast Notification Container */}
      <div
        aria-live="assertive"
        className="pointer-events-none fixed inset-0 z-50 flex flex-col items-end justify-start gap-2 p-4 sm:p-6"
      >
        <div className="flex w-full max-w-sm flex-col gap-2">
          {toasts.map((toast) => {
            const isSuccess = toast.type === "success";
            const isError = toast.type === "error";
            const isWarning = toast.type === "warning";

            const borderBgClass = isSuccess
              ? "border-emerald-200 bg-emerald-950 text-white shadow-emerald-900/20"
              : isError
              ? "border-rose-200 bg-rose-950 text-white shadow-rose-900/20"
              : isWarning
              ? "border-amber-200 bg-amber-950 text-white shadow-amber-900/20"
              : "border-slate-200 bg-slate-900 text-white shadow-slate-900/20";

            return (
              <div
                key={toast.id}
                className={`pointer-events-auto flex items-start gap-3 rounded-2xl border p-4 shadow-xl backdrop-blur transition-all duration-300 animate-in slide-in-from-top-3 ${borderBgClass}`}
                role="status"
              >
                <div className="shrink-0 pt-0.5">
                  {isSuccess && <CheckCircle2 className="h-5 w-5 text-emerald-400" />}
                  {isError && <AlertCircle className="h-5 w-5 text-rose-400" />}
                  {isWarning && <AlertTriangle className="h-5 w-5 text-amber-400" />}
                  {!isSuccess && !isError && !isWarning && <Info className="h-5 w-5 text-sky-400" />}
                </div>

                <div className="flex-1 min-w-0">
                  {toast.title && <p className="text-xs font-bold uppercase tracking-wider text-slate-300">{toast.title}</p>}
                  <p className="text-sm font-medium text-slate-100">{toast.message}</p>
                </div>

                <button
                  type="button"
                  onClick={() => removeToast(toast.id)}
                  className="shrink-0 rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white transition"
                  aria-label="Close notification"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
