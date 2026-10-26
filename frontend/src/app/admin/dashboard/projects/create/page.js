"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload, X, ImageIcon, AlertCircle } from "lucide-react";
import { projectService } from "@/src/services";
import { useToast } from "@/src/context/ToastContext";
import { getImageUrl } from "@/src/lib/imageUrl";
import { getApiBase } from "@/src/services/api";

export default function CreateProjectPage() {
  const router = useRouter();
  const toast = useToast();
  const fileInputRef = useRef(null);

  // 8 Required Fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Planned");
  const [startDate, setStartDate] = useState("");
  const [expectedCompletionDate, setExpectedCompletionDate] = useState("");
  const [location, setLocation] = useState("");
  const [progress, setProgress] = useState(0);
  const [image, setImage] = useState("");
  const [localImagePreview, setLocalImagePreview] = useState("");

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  const handleImageUpload = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file.");
      return;
    }

    if (localImagePreview) URL.revokeObjectURL(localImagePreview);
    setLocalImagePreview(URL.createObjectURL(file));
    setImageUploading(true);

    try {
      const uploadData = new FormData();
      uploadData.append("file", file);

      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("mesob_token") || localStorage.getItem("token")
          : null;

      const headers = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const base = getApiBase();
      const res = await fetch(`${base}/upload`, {
        method: "POST",
        headers,
        credentials: "same-origin",
        body: uploadData,
      });

      const result = await res.json();
      if (result.success && result.url) {
        setImage(result.url);
        setLocalImagePreview("");
        toast.success("Image uploaded successfully.");
        if (errors.image) {
          setErrors((prev) => {
            const copy = { ...prev };
            delete copy.image;
            return copy;
          });
        }
      } else {
        toast.error(result.message || "Failed to upload image.");
      }
    } catch (err) {
      toast.error("Upload failed: " + (err?.message || "Network error"));
    } finally {
      setImageUploading(false);
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = "Project name is required.";
    }

    if (!description.trim()) {
      newErrors.description = "Project description is required.";
    }

    if (!location.trim()) {
      newErrors.location = "Location is required.";
    }

    if (!status) {
      newErrors.status = "Project status is required.";
    }

    if (startDate && expectedCompletionDate && expectedCompletionDate < startDate) {
      newErrors.expectedCompletionDate = "Expected completion date cannot be before the start date.";
    }

    const numProgress = Number(progress);
    if (isNaN(numProgress) || numProgress < 0 || numProgress > 100) {
      newErrors.progress = "Progress must be between 0 and 100%.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (publishStatus) => {
    if (!validate()) {
      toast.error("Please check the form for errors.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: name.trim(),
        description: description.trim(),
        projectStatus: status,
        status: publishStatus,
        is_published: publishStatus === "published",
        publishStatus,
        startDate: startDate || null,
        expectedCompletionDate: expectedCompletionDate || null,
        location: location.trim(),
        progress: Math.min(100, Math.max(0, parseInt(progress, 10) || 0)),
        image: image || "",
      };

      await projectService.create(payload);

      toast.success(
        publishStatus === "published"
          ? "Project published successfully!"
          : "Project saved as draft."
      );
      router.push("/admin/dashboard/projects");
    } catch (err) {
      console.error("Create project error:", err);
      toast.error(err?.message || "Failed to save project.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/dashboard/projects"
          className="rounded-xl border border-neutral-200 bg-white p-2.5 text-[#000000] hover:bg-neutral-50 transition"
          title="Back to Projects"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-[#000000] tracking-tight">Create Development Project</h1>
        </div>
      </div>

      {/* Main Form */}
      <form
        onSubmit={(e) => e.preventDefault()}
        className="space-y-6 rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-xs"
      >
        {/* Field 1: Project Name */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-[#000000] uppercase tracking-wide">
            Project Name <span className="text-[#D71920]">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) {
                setErrors((prev) => {
                  const copy = { ...prev };
                  delete copy.name;
                  return copy;
                });
              }
            }}
            placeholder="Enter the project name..."
            className={`w-full rounded-xl border bg-white px-4 py-3 text-sm font-medium text-[#000000] placeholder-neutral-400 transition focus:outline-none focus:ring-2 ${
              errors.name
                ? "border-[#D71920] focus:ring-[#D71920]/20"
                : "border-neutral-200 focus:border-[#D71920] focus:ring-[#D71920]/15"
            }`}
          />
          {errors.name && (
            <p className="flex items-center gap-1.5 text-xs font-semibold text-[#D71920]">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>{errors.name}</span>
            </p>
          )}
        </div>

        {/* Field 2: Description */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-[#000000] uppercase tracking-wide">
            Description <span className="text-[#D71920]">*</span>
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              if (errors.description) {
                setErrors((prev) => {
                  const copy = { ...prev };
                  delete copy.description;
                  return copy;
                });
              }
            }}
            placeholder="Describe the project scope, objectives, and details..."
            className={`w-full rounded-xl border bg-white px-4 py-3 text-sm font-medium text-[#000000] placeholder-neutral-400 transition focus:outline-none focus:ring-2 leading-relaxed resize-y ${
              errors.description
                ? "border-[#D71920] focus:ring-[#D71920]/20"
                : "border-neutral-200 focus:border-[#D71920] focus:ring-[#D71920]/15"
            }`}
          />
          {errors.description && (
            <p className="flex items-center gap-1.5 text-xs font-semibold text-[#D71920]">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>{errors.description}</span>
            </p>
          )}
        </div>

        {/* Field 3, 4, 5: Status, Start Date, Expected Completion Date */}
        <div className="grid gap-4 sm:grid-cols-3">
          {/* Field 3: Status */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#000000] uppercase tracking-wide">
              Status <span className="text-[#D71920]">*</span>
            </label>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                if (errors.status) {
                  setErrors((prev) => {
                    const copy = { ...prev };
                    delete copy.status;
                    return copy;
                  });
                }
              }}
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-xs font-semibold text-[#000000] transition focus:border-[#D71920] focus:outline-none focus:ring-2 focus:ring-[#D71920]/15"
            >
              <option value="Planned">Planned</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Completed">Completed</option>
            </select>
            {errors.status && (
              <p className="flex items-center gap-1.5 text-xs font-semibold text-[#D71920]">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{errors.status}</span>
              </p>
            )}
          </div>

          {/* Field 4: Start Date */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#000000] uppercase tracking-wide">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                if (expectedCompletionDate && e.target.value && expectedCompletionDate < e.target.value) {
                  setErrors((prev) => ({
                    ...prev,
                    expectedCompletionDate: "Expected completion date cannot be before the start date.",
                  }));
                } else if (errors.expectedCompletionDate) {
                  setErrors((prev) => {
                    const copy = { ...prev };
                    delete copy.expectedCompletionDate;
                    return copy;
                  });
                }
              }}
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-xs font-medium text-[#000000] transition focus:border-[#D71920] focus:outline-none focus:ring-2 focus:ring-[#D71920]/15"
            />
          </div>

          {/* Field 5: Expected Completion Date */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#000000] uppercase tracking-wide">
              Expected Completion Date
            </label>
            <input
              type="date"
              value={expectedCompletionDate}
              min={startDate || undefined}
              onChange={(e) => {
                setExpectedCompletionDate(e.target.value);
                if (startDate && e.target.value && e.target.value < startDate) {
                  setErrors((prev) => ({
                    ...prev,
                    expectedCompletionDate: "Expected completion date cannot be before the start date.",
                  }));
                } else if (errors.expectedCompletionDate) {
                  setErrors((prev) => {
                    const copy = { ...prev };
                    delete copy.expectedCompletionDate;
                    return copy;
                  });
                }
              }}
              className={`w-full rounded-xl border bg-white px-4 py-2.5 text-xs font-medium text-[#000000] transition focus:outline-none focus:ring-2 ${
                errors.expectedCompletionDate
                  ? "border-[#D71920] focus:ring-[#D71920]/20"
                  : "border-neutral-200 focus:border-[#D71920] focus:ring-[#D71920]/15"
              }`}
            />
            {errors.expectedCompletionDate && (
              <p className="flex items-center gap-1.5 text-xs font-semibold text-[#D71920]">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{errors.expectedCompletionDate}</span>
              </p>
            )}
          </div>
        </div>

        {/* Field 6 & 7: Location and Progress */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Field 6: Location */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#000000] uppercase tracking-wide">
              Location <span className="text-[#D71920]">*</span>
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                if (errors.location) {
                  setErrors((prev) => {
                    const copy = { ...prev };
                    delete copy.location;
                    return copy;
                  });
                }
              }}
              placeholder="e.g. Burayu, Keta, Gefersa..."
              className={`w-full rounded-xl border bg-white px-4 py-2.5 text-xs font-medium text-[#000000] placeholder-neutral-400 transition focus:outline-none focus:ring-2 ${
                errors.location
                  ? "border-[#D71920] focus:ring-[#D71920]/20"
                  : "border-neutral-200 focus:border-[#D71920] focus:ring-[#D71920]/15"
              }`}
            />
            {errors.location && (
              <p className="flex items-center gap-1.5 text-xs font-semibold text-[#D71920]">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{errors.location}</span>
              </p>
            )}
          </div>

          {/* Field 7: Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-[#000000] uppercase tracking-wide">
                Progress (0–100%)
              </label>
              <span className="text-xs font-bold text-[#000000]">{progress}%</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0"
                max="100"
                value={progress}
                onChange={(e) => {
                  const val = e.target.value === "" ? 0 : Math.min(100, Math.max(0, parseInt(e.target.value, 10) || 0));
                  setProgress(val);
                }}
                className="w-24 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-bold text-[#000000] focus:border-[#D71920] focus:outline-none focus:ring-2 focus:ring-[#D71920]/15"
              />
              <div className="flex-1 bg-neutral-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-[#D71920] h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(0, Number(progress) || 0))}%` }}
                />
              </div>
            </div>
            {errors.progress && (
              <p className="flex items-center gap-1.5 text-xs font-semibold text-[#D71920]">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{errors.progress}</span>
              </p>
            )}
          </div>
        </div>

        {/* Field 8: Project Image / Blueprint (Optional) */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-[#000000] uppercase tracking-wide">
            Project Image / Blueprint <span className="text-neutral-400 font-normal lowercase">(optional)</span>
          </label>
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => handleImageUpload(e.target.files?.[0])}
            accept="image/*"
            className="hidden"
          />

          {localImagePreview || image ? (
            <div className="relative overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100 max-w-md">
              <img
                src={localImagePreview || getImageUrl(image)}
                alt="Project preview"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/images/burayu-mesob-logo.png";
                }}
                className="aspect-video w-full object-cover max-h-56"
              />
              <button
                type="button"
                onClick={() => {
                  if (localImagePreview) URL.revokeObjectURL(localImagePreview);
                  setLocalImagePreview("");
                  setImage("");
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="absolute top-2.5 right-2.5 rounded-full bg-[#000000]/80 p-1.5 text-white hover:bg-[#D71920] transition cursor-pointer"
                title="Remove image"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50/70 p-6 text-center hover:bg-neutral-100/60 transition cursor-pointer"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-xs border border-neutral-200">
                <ImageIcon className="h-5 w-5 text-neutral-600" />
              </div>
              <p className="text-xs font-bold text-[#000000]">
                {imageUploading ? "Uploading image..." : "Click to upload project image or blueprint"}
              </p>
              <p className="text-[11px] text-neutral-400">PNG, JPG, or WEBP (optional)</p>
            </div>
          )}
        </div>

        {/* Action Buttons: Cancel, Save as Draft, Publish Project */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 border-t border-neutral-200 pt-6">
          <Link
            href="/admin/dashboard/projects"
            className="w-full sm:w-auto rounded-xl border border-neutral-300 bg-white px-5 py-2.5 text-xs font-bold text-[#000000] hover:bg-neutral-50 transition text-center"
          >
            Cancel
          </Link>

          <button
            type="button"
            disabled={isSubmitting || imageUploading}
            onClick={() => handleSubmit("draft")}
            className="w-full sm:w-auto rounded-xl border border-[#000000] bg-[#FFFFFF] px-5 py-2.5 text-xs font-bold text-[#000000] hover:bg-neutral-100 transition disabled:opacity-50 cursor-pointer"
          >
            Save as Draft
          </button>

          <button
            type="button"
            disabled={isSubmitting || imageUploading}
            onClick={() => handleSubmit("published")}
            className="w-full sm:w-auto rounded-xl bg-[#D71920] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#b5141a] transition disabled:opacity-50 shadow-sm cursor-pointer"
          >
            {isSubmitting ? "Publishing..." : "Publish Project"}
          </button>
        </div>
      </form>
    </div>
  );
}
