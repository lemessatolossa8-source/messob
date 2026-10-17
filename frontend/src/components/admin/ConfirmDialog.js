"use client";

import { useEffect, useRef } from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";

export default function ConfirmDialog({
  isOpen,
  title = "Confirm Deletion",
  message = "Are you sure you want to delete this item? This action cannot be undone.",
  itemName = "",
  confirmLabel = "Delete Item",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  isProcessing = false,
}) {
  const confirmBtnRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      const handleKeyDown = (e) => {
        if (e.key === "Escape") onCancel();
      };
      window.addEventListener("keydown", handleKeyDown);
      confirmBtnRef.current?.focus();
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl animate-in zoom-in-95 duration-150">
        <button
          type="button"
          onClick={onCancel}
          disabled={isProcessing}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-[#070707] transition cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-[#FE0002] border border-rose-100">
            <AlertTriangle className="h-5 w-5" />
          </div>

          <div className="flex-1 min-w-0 pr-6">
            <h3 id="confirm-dialog-title" className="text-base font-bold text-[#070707]">
              {title}
            </h3>

            <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
              {message}
            </p>

            {itemName ? (
              <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs font-semibold text-[#070707] line-clamp-1 border border-slate-200/80">
                &ldquo;{itemName}&rdquo;
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
            className="w-full sm:w-auto rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-[#070707] hover:bg-slate-50 transition cursor-pointer"
          >
            {cancelLabel}
          </button>

          <button
            ref={confirmBtnRef}
            type="button"
            onClick={onConfirm}
            disabled={isProcessing}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#FE0002] px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#CC0002] disabled:opacity-50 transition cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>{isProcessing ? "Deleting..." : confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
