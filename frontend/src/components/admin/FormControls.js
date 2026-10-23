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
          {label} {required && <span className="text-[#D71920]">*</span>}
        </label>
      )}
      {children}
      {error && (
        <p className="flex items-center gap-1 text-xs font-medium text-[#D71920]">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}
      {helpText && !error && (
        <p className="text-[11px] text-slate-500">{helpText}</p>
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
        className={`w-full rounded-xl border bg-white px-3.5 py-2 text-xs font-medium text-[#070707] placeholder-slate-400 transition focus:outline-none focus:ring-2 disabled:bg-slate-100 disabled:opacity-70 ${
          error
            ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/15"
            : "border-slate-200 focus:border-[#D71920] focus:ring-[#D71920]/15"
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
        className={`w-full rounded-xl border bg-white p-3.5 text-xs font-medium text-[#070707] placeholder-slate-400 transition focus:outline-none focus:ring-2 disabled:bg-slate-100 disabled:opacity-70 ${
          error
            ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/15"
            : "border-slate-200 focus:border-[#D71920] focus:ring-[#D71920]/15"
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
        className={`w-full rounded-xl border bg-white px-3.5 py-2 text-xs font-semibold text-[#070707] transition focus:outline-none focus:ring-2 disabled:bg-slate-100 cursor-pointer ${
          error
            ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/15"
            : "border-slate-200 focus:border-[#D71920] focus:ring-[#D71920]/15"
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
  label = "Cover Image",
  required = false,
  error,
  value,
  onChange,
  onBlur,
  helpText = "Upload a photo from your computer, or enter an image URL.",
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
      setUploadError("Image size exceeds 5MB limit.");
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
      setUploadError("Upload failed. Please check connection and try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const clearImage = () => {
    onChange("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <FormField label={label} required={required} error={error || uploadError} helpText={helpText}>
      <div className="space-y-3">
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
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 px-4 py-2 text-xs font-bold text-[#070707] transition cursor-pointer disabled:opacity-60"
          >
            {isUploading ? (
              <span>Uploading...</span>
            ) : (
              <>
                <Upload className="h-4 w-4 text-[#D71920]" />
                <span>Choose Image</span>
              </>
            )}
          </button>

          <span className="text-center text-xs font-semibold text-slate-400">or URL:</span>

          <input
            type="text"
            value={value && !value.startsWith("data:") ? value : ""}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            placeholder="https://..."
            className={`flex-1 rounded-xl border bg-white px-3.5 py-2 text-xs font-medium text-[#070707] placeholder-slate-400 transition focus:outline-none focus:ring-2 ${
              error || uploadError
                ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/15"
                : "border-slate-200 focus:border-[#D71920] focus:ring-[#D71920]/15"
            }`}
          />
        </div>

        {value ? (
          <div className="relative inline-block overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-xs max-w-sm">
            <img
              src={value}
              alt="Preview"
              className="aspect-video w-full object-cover max-h-52"
            />
            <button
              type="button"
              onClick={clearImage}
              title="Remove image"
              className="absolute top-2 right-2 rounded-full bg-slate-900/80 p-1.5 text-white hover:bg-[#D71920] transition shadow-xs cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-3 text-xs text-slate-400">
            <ImageIcon className="h-4 w-4 text-slate-400 shrink-0" />
            <span>No image selected</span>
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
  helpText = "Upload an optional video file or paste an external video link.",
}) {
  const fileInputRef = useRef(null);
  const [uploadError, setUploadError] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      setUploadError("Please select a valid video file.");
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
        setUploadError(data.message || "Upload failed.");
        return;
      }

      onChange(data.url);
    } catch {
      setUploadError("Upload failed. Please check connection.");
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
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 px-4 py-2 text-xs font-bold text-[#070707] transition cursor-pointer disabled:opacity-60"
          >
            {isUploading ? (
              <span>Uploading...</span>
            ) : (
              <>
                <Upload className="h-4 w-4 text-[#D71920]" />
                <span>Upload Video</span>
              </>
            )}
          </button>
          <span className="text-center text-xs font-semibold text-slate-400">or URL:</span>
          <input
            type="text"
            value={value && !value.startsWith("data:") ? value : ""}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            placeholder="https://..."
            className={`flex-1 rounded-xl border bg-white px-3.5 py-2 text-xs font-medium text-[#070707] placeholder-slate-400 transition focus:outline-none focus:ring-2 ${
              error || uploadError
                ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/15"
                : "border-slate-200 focus:border-[#D71920] focus:ring-[#D71920]/15"
            }`}
          />
        </div>
        {value ? (
          <div className="relative inline-block overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-xs max-w-sm w-full">
            <video src={value} controls className="aspect-video w-full object-cover max-h-52 bg-black" />
            <button
              type="button"
              onClick={clearVideo}
              title="Remove video"
              className="absolute top-2 right-2 rounded-full bg-slate-900/80 p-1.5 text-white hover:bg-[#D71920] transition shadow-xs cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-3 text-xs text-slate-400">
            <span>No video selected</span>
          </div>
        )}
      </div>
    </FormField>
  );
}

export const ImageUploadInput = ImagePickerInput;
