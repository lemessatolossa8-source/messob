"use client";

import { AlertTriangle, CheckCircle } from "lucide-react";

/**
 * Confirmation dialog for publishing content
 * Shows validation warnings before publishing
 */
export default function PublishConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Publish Content?",
  warnings = [],
  isLoading = false,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="border-b border-slate-200 px-6 py-4">
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-4">
          <p className="text-sm text-slate-700">
            You are about to publish this content. It will be visible to all visitors on the public website.
          </p>

          {/* Show warnings if any */}
          {warnings && warnings.length > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-2">
              <div className="flex items-center gap-2 text-amber-900">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <p className="text-xs font-bold">Please Review:</p>
              </div>
              <ul className="space-y-1">
                {warnings.map((warning, idx) => (
                  <li key={idx} className="text-xs text-amber-800 flex items-start gap-2">
                    <span className="text-amber-600 shrink-0">•</span>
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Success indicator when no warnings */}
          {(!warnings || warnings.length === 0) && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
              <p className="text-xs text-emerald-800">
                All required fields are complete. Ready to publish!
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-bold text-white shadow-md hover:bg-emerald-700 active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Publishing..." : "Confirm & Publish"}
          </button>
        </div>
      </div>
    </div>
  );
}
