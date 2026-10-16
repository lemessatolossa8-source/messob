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
        <label className="block text-xs font-bold text-[#070707]">
          {label} {required && <span className="text-[#FE0002]">*</span>}
        </label>
      )}
      {children}
      {error && (
        <p className="flex items-center gap-1 text-xs font-medium text-[#FE0002] animate-in fade-in">
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
        className={`w-full rounded-xl border bg-white px-4 py-2.5 text-xs font-medium text-[#070707] placeholder-slate-400 transition duration-200 focus:outline-none focus:ring-2 disabled:bg-slate-100 disabled:opacity-70 ${
          error
            ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/20"
            : "border-slate-200 focus:border-[#FE0002] focus:ring-[#FE0002]/20"
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
        className={`w-full rounded-xl border bg-white p-4 text-xs font-medium text-[#070707] placeholder-slate-400 transition duration-200 focus:outline-none focus:ring-2 disabled:bg-slate-100 disabled:opacity-70 ${
          error
            ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/20"
            : "border-slate-200 focus:border-[#FE0002] focus:ring-[#FE0002]/20"
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
        className={`w-full rounded-xl border bg-white px-4 py-2.5 text-xs font-bold text-[#070707] transition duration-200 focus:outline-none focus:ring-2 disabled:bg-slate-100 ${
          error
            ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/20"
            : "border-slate-200 focus:border-[#FE0002] focus:ring-[#FE0002]/20"
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

      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("mesob_token") || localStorage.getItem("token")
          : null;

      const headers = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch("/api/upload", {
        method: "POST",
        headers,
        credentials: "same-origin",
        body: form,
      });
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
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-dashed border-[#FE0002]/60 bg-rose-50/70 hover:bg-rose-100/70 px-4 py-2.5 text-xs font-bold text-[#FE0002] transition shadow-sm hover:shadow hover:-translate-y-[1px] active:translate-y-0 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <>
                <svg className="h-4 w-4 animate-spin text-[#FE0002]" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>Uploading…</span>
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 text-[#FE0002]" />
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
            className={`flex-1 rounded-xl border bg-white px-4 py-2.5 text-xs font-medium text-[#070707] placeholder-slate-400 transition duration-200 focus:outline-none focus:ring-2 ${
              error || uploadError
                ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/20"
                : "border-slate-200 focus:border-[#FE0002] focus:ring-[#FE0002]/20"
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
              className="absolute top-2 right-2 rounded-full bg-slate-900/80 p-1.5 text-white hover:bg-rose-600 transition duration-200 shadow-md hover:scale-105"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            <div className="bg-white/95 px-3 py-1.5 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
              <span className="inline-flex items-center gap-1 font-medium">
                <ImageIcon className="h-3.5 w-3.5 text-[#FE0002]" />
                <span>Image attached</span>
              </span>
              <button
                type="button"
                onClick={clearImage}
                className="text-[#FE0002] font-bold hover:underline"
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

export function VideoPickerInput({
  label = "Video (Upload or URL)",
  required = false,
  error,
  value,
  onChange,
  onBlur,
  helpText = "Upload an optional video (MP4, WebM, MOV) up to 50MB.",
}) {
  const fileInputRef = useRef(null);
  const [uploadError, setUploadError] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      setUploadError("Please select a valid video file (MP4, WebM, MOV).");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setUploadError("Video size exceeds 50MB limit.");
      return;
    }

    setUploadError("");
    setIsUploading(true);

    try {
      const form = new FormData();
      form.append("file", file);

      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("mesob_token") || localStorage.getItem("token")
          : null;

      const headers = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("/api/upload", {
        method: "POST",
        headers,
        credentials: "same-origin",
        body: form,
      });
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

  const clearVideo = () => {
    onChange("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <FormField label={label} required={required} error={error || uploadError} helpText={helpText}>
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="video/*" className="hidden" />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-dashed border-[#FE0002]/60 bg-rose-50/70 hover:bg-rose-100/70 px-4 py-2.5 text-xs font-bold text-[#FE0002] transition shadow-sm hover:shadow hover:-translate-y-[1px] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <span>Uploading...</span>
            ) : (
              <>
                <Upload className="h-4 w-4 text-[#FE0002]" />
                <span>Upload Video</span>
              </>
            )}
          </button>
          <span className="text-center text-xs font-semibold text-slate-400">or URL</span>
          <input
            type="text"
            value={value && !value.startsWith("data:") ? value : ""}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            className={`flex-1 rounded-xl border bg-white px-4 py-2.5 text-xs font-medium text-[#070707] placeholder-slate-400 transition duration-200 focus:outline-none focus:ring-2 ${
              error || uploadError
                ? "border-rose-400 focus:border-rose-500"
                : "border-slate-200 focus:border-[#FE0002]"
            }`}
          />
        </div>
        {value ? (
          <div className="relative inline-block overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm max-w-sm w-full">
            <video src={value} controls className="aspect-video w-full object-cover max-h-56 bg-black" />
            <button
              type="button"
              onClick={clearVideo}
              title="Remove video"
              className="absolute top-2 right-2 rounded-full bg-slate-900/80 p-1.5 text-white hover:bg-rose-600 transition shadow-md hover:scale-105"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-xs text-slate-500">
            <span>No video selected. Optional video attachment.</span>
          </div>
        )}
      </div>
    </FormField>
  );
}

export const ImageUploadInput = ImagePickerInput;
