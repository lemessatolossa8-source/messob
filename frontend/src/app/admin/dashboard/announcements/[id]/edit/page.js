"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Send, Trash2 } from "lucide-react";
import LanguageTabs from "@/components/admin/LanguageTabs";
import { TextInput, TextAreaInput, SelectInput, ImagePickerInput } from "@/components/admin/FormControls";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { announcementService } from "@/src/services";
import { useToast } from "@/src/context/ToastContext";
import { ANNOUNCEMENT_CATEGORIES, categoriesToOptions, getDefaultCategory } from "@/src/constants/categories";
import { autoTranslateForm } from "@/src/lib/autoTranslate";

export default function EditAnnouncementPage() {
  const router = useRouter();
  const routeParams = useParams();
  const id = routeParams?.id;
  const toast = useToast();

  const [activeLang, setActiveLang] = useState("om");
  const [formData, setFormData] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const item = await announcementService.getById(id);
        if (item) {
          setFormData({
            title: typeof item.title === "object" ? item.title : { om: item.title, am: "", en: "" },
            summary: typeof item.summary === "object" ? item.summary : { om: item.summary || item.description || "", am: "", en: "" },
            category: item.category || getDefaultCategory("announcement"),
            date: item.date || new Date().toISOString().split("T")[0],
            expiryDate: item.expiryDate || "",
            department: item.department || "Office of the Administrator",
            referenceNo: item.referenceNo || "",
            image: item.image || "",
            status: item.status || "published",
          });
        } else {
          toast.error("Announcement not found.");
          router.push("/admin/dashboard/announcements");
        }
      } catch {
        toast.error("Failed to load announcement.");
        router.push("/admin/dashboard/announcements");
      }
    };
    load();
  }, [id, router, toast]);

  if (!formData) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
          <span>Loading announcement...</span>
        </div>
      </div>
    );
  }

  const handleFieldChange = (field, lang, value) => {
    if (lang) {
      setFormData((prev) => ({
        ...prev,
        [field]: {
          ...prev[field],
          [lang]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }

    const errorKey = lang ? `${field}_${lang}` : field;
    if (errors[errorKey]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[errorKey];
        return copy;
      });
    }
  };

  const validateForm = (targetStatus) => {
    const newErrors = {};
    const hasAnyTitle = !!(formData.title.om?.trim() || formData.title.am?.trim() || formData.title.en?.trim());
    if (!hasAnyTitle) {
      newErrors.title_om = "Please enter an announcement title in at least one language.";
    }

    if (!formData.expiryDate) {
      newErrors.expiryDate = "Expiry date is required.";
    } else if (formData.date && formData.expiryDate < formData.date) {
      newErrors.expiryDate = "Expiry date cannot be before publication date.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e, targetStatus) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);

    const isValid = validateForm(targetStatus);
    if (!isValid) {
      setIsSubmitting(false);
      toast.error("Please fix the form errors before submitting.");
      return;
    }

    try {
            
      const finalTitle = {
        om: formData.title.om?.trim(),
        am: formData.title.am?.trim(),
        en: formData.title.en?.trim(),
      };

      const finalSummary = {
        om: formData.summary.om?.trim(),
        am: formData.summary.am?.trim(),
        en: formData.summary.en?.trim(),
      };

      await announcementService.update(id, {
        ...formData,
        title: finalTitle,
        summary: finalSummary,
        status: targetStatus,
      });

      toast.success("Announcement updated successfully!");
      router.push("/admin/dashboard/announcements");
    } catch (err) {
      console.error("Update announcement error:", err);
      toast.error("Failed to update announcement.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await announcementService.delete(id);
      toast.success("Announcement deleted.");
      router.push("/admin/dashboard/announcements");
    } catch {
      toast.error("Failed to delete announcement.");
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/dashboard/announcements"
            className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 transition"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h2 className="text-xl font-extrabold text-[#070707]">Edit Announcement</h2>
            <p className="text-xs text-slate-500">Update multilingual notice content and status</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setDeleteModalOpen(true)}
          className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold text-[#FE0002] hover:bg-rose-100 transition inline-flex items-center gap-1.5"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Delete</span>
        </button>
      </div>

      <form className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <LanguageTabs
          title="Edit Announcement Information"
          activeTab={activeLang}
          onTabChange={async (newLang) => {
            if (activeLang !== newLang) {
              await autoTranslateForm(formData, setFormData, activeLang, newLang, toast, setIsTranslating);
              setActiveLang(newLang);
            }
          }}
        />

        <div className="space-y-5">
          <TextInput
            label={`Announcement Title`}
            required={activeLang === "om"}
            value={formData.title[activeLang]}
            onChange={(v) => handleFieldChange("title", activeLang, v)}
            error={errors[`title_${activeLang}`]}
            placeholder="Announcement title..."
          />

          <TextAreaInput
            label={`Summary`}
            rows={2}
            value={formData.summary[activeLang]}
            onChange={(v) => handleFieldChange("summary", activeLang, v)}
            error={errors[`summary_${activeLang}`]}
            placeholder="Summary..."
          />
        </div>

        <div className="border-t border-slate-100 pt-6 space-y-5">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
            Administrative Details
          </h3>

          <div className="grid gap-4 sm:grid-cols-3">
            <SelectInput
              label="Category"
              required
              value={formData.category}
              onChange={(v) => handleFieldChange("category", null, v)}
              options={categoriesToOptions(ANNOUNCEMENT_CATEGORIES)}
            />

            <TextInput
              label="Issuing Department"
              value={formData.department}
              onChange={(v) => handleFieldChange("department", null, v)}
            />

            <TextInput
              label="Reference Number"
              value={formData.referenceNo}
              onChange={(v) => handleFieldChange("referenceNo", null, v)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[#070707]">
                Publication Date <span className="text-[#FE0002]">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => handleFieldChange("date", null, e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[#070707]">
                Expiry Date <span className="text-[#FE0002]">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.expiryDate}
                onChange={(e) => handleFieldChange("expiryDate", null, e.target.value)}
                className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  errors.expiryDate ? "border-rose-400" : "border-slate-300"
                }`}
              />
              {errors.expiryDate && (
                <p className="mt-1 text-xs text-[#FE0002]">{errors.expiryDate}</p>
              )}
              <p className="mt-1 text-xs text-slate-500">
                Announcement will be hidden from public website after this date
              </p>
            </div>
          </div>

          <ImagePickerInput
            label="Cover Photo URL (Optional)"
            value={formData.image}
            onChange={(v) => handleFieldChange("image", null, v)}
            error={errors.image}
          />
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 border-t border-slate-100 pt-6">
          <Link
            href="/admin/dashboard/announcements"
            className="w-full sm:w-auto rounded-full border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-[#070707] hover:bg-slate-50 transition text-center"
          >
            Cancel
          </Link>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={(e) => handleSubmit(e, "draft")}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-slate-100 px-5 py-2.5 text-xs font-bold text-[#070707] hover:bg-slate-200 transition"
          >
            <Save className="h-4 w-4" />
            <span>Save as Draft</span>
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={(e) => handleSubmit(e, "published")}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-slate-800 transition"
          >
            <Send className="h-4 w-4 text-amber-400" />
            <span>{isSubmitting ? "Updating..." : "Update & Publish"}</span>
          </button>
        </div>
      </form>

      <ConfirmDialog
        isOpen={deleteModalOpen}
        title="Delete Announcement"
        message="Are you sure you want to permanently delete this announcement?"
        itemName={formData?.title?.om || formData?.title?.en || ""}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
}
