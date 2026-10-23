"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload, X, ImageIcon, AlertCircle, Trash2 } from "lucide-react";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { announcementService } from "@/src/services";
import { useToast } from "@/src/context/ToastContext";
import { getLocalizedText } from "@/src/i18n";

export default function EditAnnouncementPage() {
  const router = useRouter();
  const routeParams = useParams();
  const id = routeParams?.id;
  const toast = useToast();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [date, setDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [image, setImage] = useState("");
  const [status, setStatus] = useState("published");

  const [isLoading, setIsLoading] = useState(true);
  const [imageUploading, setImageUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errors, setErrors] = useState({});

  const imageInputRef = useRef(null);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        setIsLoading(true);
        const item = await announcementService.getById(id);
        if (item) {
          const rawTitle = item.title;
          const resolvedTitle =
            typeof rawTitle === "string"
              ? rawTitle
              : getLocalizedText(rawTitle, "en") ||
                getLocalizedText(rawTitle, "om") ||
                getLocalizedText(rawTitle, "am") ||
                "";

          const rawContent = item.content;
          const rawSummary = item.summary || item.description;
          const resolvedContent =
            (typeof rawContent === "string" && rawContent.trim() ? rawContent : "") ||
            getLocalizedText(rawContent, "en") ||
            getLocalizedText(rawContent, "om") ||
            getLocalizedText(rawContent, "am") ||
            (typeof rawSummary === "string" ? rawSummary : "") ||
            getLocalizedText(rawSummary, "en") ||
            getLocalizedText(rawSummary, "om") ||
            "";

          setTitle(resolvedTitle);
          setContent(resolvedContent);
          setDate(item.date || new Date().toISOString().split("T")[0]);
          setExpiryDate(item.expiryDate || item.expiry_date || "");
          setImage(item.image || "");
          setStatus(item.status || "published");
        } else {
          toast.error("Announcement not found.");
          router.push("/admin/dashboard/announcements");
        }
      } catch {
        toast.error("Failed to load announcement.");
        router.push("/admin/dashboard/announcements");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id, router, toast]);

  const handleFileUpload = async (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({ ...prev, image: "Please select an image file (PNG, JPG, WEBP)." }));
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, image: "Image size must be less than 15MB." }));
      return;
    }

    setImageUploading(true);
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy.image;
      return copy;
    });

    try {
      const formData = new FormData();
      formData.append("file", file);

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
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Upload failed.");
      }

      setImage(data.url);
    } catch (err) {
      setErrors((prev) => ({ ...prev, image: err.message || "Image upload failed." }));
    } finally {
      setImageUploading(false);
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!title.trim()) {
      newErrors.title = "Announcement title is required.";
    }

    if (!content.trim()) {
      newErrors.content = "Announcement content is required.";
    }

    if (!date) {
      newErrors.date = "Publication date is required.";
    }

    if (!expiryDate) {
      newErrors.expiryDate = "Expiry date is required.";
    } else if (date && expiryDate < date) {
      newErrors.expiryDate = "Expiry date must be later than the publication date.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (targetStatus) => {
    if (!validate()) {
      toast.error("Please fill in all required fields properly.");
      return;
    }

    setIsSubmitting(true);
    try {
      await announcementService.update(id, {
        title: title.trim(),
        content: content.trim(),
        date,
        expiryDate,
        image: image || "",
        status: targetStatus,
      });

      toast.success(
        targetStatus === "published"
          ? "Announcement published successfully!"
          : "Announcement saved as draft."
      );
      router.push("/admin/dashboard/announcements");
    } catch (err) {
      console.error("Update announcement error:", err);
      toast.error(err.message || "Failed to update announcement. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await announcementService.delete(id);
      toast.success("Announcement deleted successfully.");
      router.push("/admin/dashboard/announcements");
    } catch {
      toast.error("Failed to delete announcement.");
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-500">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#D71920] border-t-transparent" />
          <span>Loading announcement...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-12">
      {/* Header with Back and Delete */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/dashboard/announcements"
            className="rounded-xl border border-neutral-200 bg-white p-2.5 text-[#000000] hover:bg-neutral-50 transition"
            title="Back to Announcements"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-[#000000] tracking-tight">Edit Announcement</h1>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setDeleteModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-4 py-2 text-xs font-bold text-neutral-700 hover:border-[#D71920] hover:text-[#D71920] transition cursor-pointer"
        >
          <Trash2 className="h-4 w-4" />
          <span>Delete</span>
        </button>
      </div>

      {/* Main Form */}
      <form
        onSubmit={(e) => e.preventDefault()}
        className="space-y-6 rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-xs"
      >
        {/* Field 1: Announcement Title */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-[#000000] uppercase tracking-wide">
            Announcement Title <span className="text-[#D71920]">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errors.title) {
                setErrors((prev) => {
                  const copy = { ...prev };
                  delete copy.title;
                  return copy;
                });
              }
            }}
            placeholder="Enter the announcement title..."
            className={`w-full rounded-xl border bg-white px-4 py-3 text-sm font-medium text-[#000000] placeholder-neutral-400 transition focus:outline-none focus:ring-2 ${
              errors.title
                ? "border-[#D71920] focus:ring-[#D71920]/20"
                : "border-neutral-200 focus:border-[#D71920] focus:ring-[#D71920]/15"
            }`}
          />
          {errors.title && (
            <p className="flex items-center gap-1.5 text-xs font-semibold text-[#D71920]">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>{errors.title}</span>
            </p>
          )}
        </div>

        {/* Field 2: Announcement Content */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-[#000000] uppercase tracking-wide">
            Announcement Content <span className="text-[#D71920]">*</span>
          </label>
          <textarea
            rows={8}
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              if (errors.content) {
                setErrors((prev) => {
                  const copy = { ...prev };
                  delete copy.content;
                  return copy;
                });
              }
            }}
            placeholder="Write the full announcement content..."
            className={`w-full rounded-xl border bg-white p-4 text-sm font-medium text-[#000000] placeholder-neutral-400 transition focus:outline-none focus:ring-2 leading-relaxed ${
              errors.content
                ? "border-[#D71920] focus:ring-[#D71920]/20"
                : "border-neutral-200 focus:border-[#D71920] focus:ring-[#D71920]/15"
            }`}
          />
          {errors.content && (
            <p className="flex items-center gap-1.5 text-xs font-semibold text-[#D71920]">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>{errors.content}</span>
            </p>
          )}
        </div>

        {/* Fields 3 & 4: Publication Date and Expiry Date */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Publication Date */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#000000] uppercase tracking-wide">
              Publication Date <span className="text-[#D71920]">*</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                if (errors.date || errors.expiryDate) {
                  setErrors((prev) => {
                    const copy = { ...prev };
                    delete copy.date;
                    if (expiryDate && e.target.value && expiryDate >= e.target.value) {
                      delete copy.expiryDate;
                    }
                    return copy;
                  });
                }
              }}
              className={`w-full rounded-xl border bg-white px-4 py-2.5 text-xs font-medium text-[#000000] transition focus:outline-none focus:ring-2 ${
                errors.date
                  ? "border-[#D71920] focus:ring-[#D71920]/20"
                  : "border-neutral-200 focus:border-[#D71920] focus:ring-[#D71920]/15"
              }`}
            />
            {errors.date && (
              <p className="flex items-center gap-1.5 text-xs font-semibold text-[#D71920]">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{errors.date}</span>
              </p>
            )}
          </div>

          {/* Expiry Date */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#000000] uppercase tracking-wide">
              Expiry Date <span className="text-[#D71920]">*</span>
            </label>
            <input
              type="date"
              value={expiryDate}
              min={date || undefined}
              onChange={(e) => {
                setExpiryDate(e.target.value);
                if (errors.expiryDate) {
                  setErrors((prev) => {
                    const copy = { ...prev };
                    if (!e.target.value || (date && e.target.value >= date)) {
                      delete copy.expiryDate;
                    }
                    return copy;
                  });
                }
              }}
              className={`w-full rounded-xl border bg-white px-4 py-2.5 text-xs font-medium text-[#000000] transition focus:outline-none focus:ring-2 ${
                errors.expiryDate
                  ? "border-[#D71920] focus:ring-[#D71920]/20"
                  : "border-neutral-200 focus:border-[#D71920] focus:ring-[#D71920]/15"
              }`}
            />
            {errors.expiryDate && (
              <p className="flex items-center gap-1.5 text-xs font-semibold text-[#D71920]">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{errors.expiryDate}</span>
              </p>
            )}
          </div>
        </div>

        {/* Field 5: Cover Image (Optional) */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-[#000000] uppercase tracking-wide">
            Cover Image <span className="text-neutral-400 font-normal lowercase">(optional)</span>
          </label>
          <input
            type="file"
            ref={imageInputRef}
            onChange={(e) => handleFileUpload(e.target.files?.[0])}
            accept="image/*"
            className="hidden"
          />

          {image ? (
            <div className="relative overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100 max-w-md">
              <img
                src={image}
                alt="Cover preview"
                className="aspect-video w-full object-cover max-h-52"
              />
              <button
                type="button"
                onClick={() => {
                  setImage("");
                  if (imageInputRef.current) imageInputRef.current.value = "";
                }}
                className="absolute top-2.5 right-2.5 rounded-full bg-[#000000]/80 p-1.5 text-white hover:bg-[#D71920] transition cursor-pointer"
                title="Remove image"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => imageInputRef.current?.click()}
              className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50/70 p-6 text-center hover:bg-neutral-100/60 transition cursor-pointer"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-xs border border-neutral-200">
                <ImageIcon className="h-5 w-5 text-neutral-600" />
              </div>
              <p className="text-xs font-bold text-[#000000]">
                {imageUploading ? "Uploading image..." : "Click to upload an optional cover image"}
              </p>
              <p className="text-[11px] text-neutral-400">PNG, JPG, or WEBP (optional)</p>
            </div>
          )}

          {errors.image && (
            <p className="flex items-center gap-1.5 text-xs font-semibold text-[#D71920]">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>{errors.image}</span>
            </p>
          )}
        </div>

        {/* Action Buttons: Cancel, Save as Draft, Publish Announcement */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 border-t border-neutral-200 pt-6">
          <Link
            href="/admin/dashboard/announcements"
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
            {isSubmitting ? "Updating..." : "Publish Announcement"}
          </button>
        </div>
      </form>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={deleteModalOpen}
        title="Delete Announcement"
        message="Are you sure you want to delete this announcement? This action cannot be undone."
        itemName={title}
        confirmLabel="Delete Announcement"
        onConfirm={handleDelete}
        onCancel={() => setDeleteModalOpen(false)}
        isProcessing={isDeleting}
      />
    </div>
  );
}
