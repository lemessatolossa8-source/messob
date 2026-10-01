"use client";

import { Upload, X, Image as ImageIcon, AlertCircle } from "lucide-react";
import { useRef, useState } from "react";

export function FormField({
  label,
  required = false,
  error,
  helpText,
  children,
  className = "",
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-xs font-bold text-slate-700">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      {children}
      {error && (
        <p className="flex items-center gap-1 text-xs font-medium text-rose-600 animate-in fade-in">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}
      {helpText && !error && (
        <p className="text-[11px] text-slate-400">{helpText}</p>
      )}
    </div>
  );
}

export function TextInput({
  label,
  required,
  error,
  value,
  onChange,
  onBlur,
  placeholder,
  type = "text",
  disabled = false,
  className = "",
  helpText,
}) {
  return (
    <FormField label={label} required={required} error={error} helpText={helpText}>
      <input
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full rounded-xl border bg-white px-4 py-2.5 text-xs font-medium text-slate-900 placeholder-slate-400 transition focus:outline-none focus:ring-2 disabled:bg-slate-100 disabled:opacity-70 ${
          error
            ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/20"
            : "border-slate-200 focus:border-emerald-600 focus:ring-emerald-600/20"
        } ${className}`}
      />
    </FormField>
  );
}

export function TextAreaInput({
  label,
  required,
  error,
  value,
  onChange,
  onBlur,
  placeholder,
  rows = 4,
  disabled = false,
  className = "",
  helpText,
}) {
  return (
    <FormField label={label} required={required} error={error} helpText={helpText}>
      <textarea
        rows={rows}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full rounded-xl border bg-white p-4 text-xs font-medium text-slate-900 placeholder-slate-400 transition focus:outline-none focus:ring-2 disabled:bg-slate-100 disabled:opacity-70 ${
          error
            ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/20"
            : "border-slate-200 focus:border-emerald-600 focus:ring-emerald-600/20"
        } ${className}`}
      />
    </FormField>
  );
}

export function SelectInput({
  label,
  required,
  error,
  value,
  onChange,
  onBlur,
  options = [],
  disabled = false,
  className = "",
  helpText,
}) {
  return (
    <FormField label={label} required={required} error={error} helpText={helpText}>
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        disabled={disabled}
        className={`w-full rounded-xl border bg-white px-4 py-2.5 text-xs font-bold text-slate-800 transition focus:outline-none focus:ring-2 disabled:bg-slate-100 ${
          error
            ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/20"
            : "border-slate-200 focus:border-emerald-600 focus:ring-emerald-600/20"
        } ${className}`}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </FormField>
  );
}

export function ImagePickerInput({
  label = "Cover Image (Upload or URL)",
  required = false,
  error,
  value,
  onChange,
  onBlur,
  helpText = "Upload a photo directly from your device, or enter an image web URL.",
}) {
  const fileInputRef = useRef(null);
  const [uploadError, setUploadError] = useState("");

  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadError("Please select a valid image file (PNG, JPG, WEBP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image size exceeds 5MB limit. Please choose a smaller file.");
      return;
    }

    setUploadError("");
    setIsUploading(true);

    try {
      const form = new FormData();
      form.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setUploadError(data.message || "Upload failed. Please try again.");
        return;
      }

      onChange(data.url);
    } catch {
      setUploadError("Upload failed. Please check your connection and try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const clearImage = () => {
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <FormField label={label} required={required} error={error || uploadError} helpText={helpText}>
      <div className="space-y-3">
        {/* Upload Button + URL input */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-dashed border-emerald-600/60 bg-emerald-50/70 hover:bg-emerald-100/70 px-4 py-2.5 text-xs font-bold text-emerald-800 transition shadow-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <>
                <svg className="h-4 w-4 animate-spin text-emerald-700" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>Uploading…</span>
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 text-emerald-700" />
                <span>Upload from Computer / Phone</span>
              </>
            )}
          </button>

          <span className="text-center text-xs font-semibold text-slate-400">or</span>

          <input
            type="text"
            value={value && !value.startsWith("data:") ? value : ""}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            placeholder="Paste image URL (https://...)"
            className={`flex-1 rounded-xl border bg-white px-4 py-2.5 text-xs font-medium text-slate-900 placeholder-slate-400 transition focus:outline-none focus:ring-2 ${
              error || uploadError
                ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/20"
                : "border-slate-200 focus:border-emerald-600 focus:ring-emerald-600/20"
            }`}
          />
        </div>

        {/* Live Preview */}
        {value ? (
          <div className="relative inline-block overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm max-w-sm">
            <img
              src={value}
              alt="Preview"
              className="aspect-video w-full object-cover max-h-56"
            />
            <button
              type="button"
              onClick={clearImage}
              title="Remove image"
              className="absolute top-2 right-2 rounded-full bg-slate-900/80 p-1.5 text-white hover:bg-rose-600 transition shadow-md"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            <div className="bg-white/95 px-3 py-1.5 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
              <span className="inline-flex items-center gap-1 font-medium">
                <ImageIcon className="h-3.5 w-3.5 text-emerald-600" />
                <span>Image attached</span>
              </span>
              <button
                type="button"
                onClick={clearImage}
                className="text-rose-600 font-bold hover:underline"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-xs text-slate-500">
            <ImageIcon className="h-4 w-4 text-slate-400 shrink-0" />
            <span>No image selected. Upload a photo or provide a URL for this entry.</span>
          </div>
        )}
      </div>
    </FormField>
  );
}
