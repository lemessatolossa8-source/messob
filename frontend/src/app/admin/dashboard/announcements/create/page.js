"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Send } from "lucide-react";
import LanguageTabs from "@/components/admin/LanguageTabs";
import { TextInput, TextAreaInput, SelectInput, ImagePickerInput } from "@/components/admin/FormControls";
import { announcementService } from "@/src/services";
import { useToast } from "@/src/context/ToastContext";
import { validateRequired } from "@/src/lib/validation";
import { ANNOUNCEMENT_CATEGORIES, categoriesToOptions, getDefaultCategory } from "@/src/constants/categories";
import { autoTranslateForm } from "@/src/lib/autoTranslate";

export default function CreateAnnouncementPage() {
  const router = useRouter();
  const toast = useToast();

  const [activeLang, setActiveLang] = useState("om");
  const [formData, setFormData] = useState({
    title: { om: "", am: "", en: "" },
    summary: { om: "", am: "", en: "" },
    category: getDefaultCategory("announcement"),
    date: new Date().toISOString().split("T")[0],
    expiryDate: "",
    department: "Office of the Administrator",
    referenceNo: `BM-AN-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
    image: "",
    status: "published",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

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

    if (!formData.category) newErrors.category = "Category is required.";

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

      await announcementService.create({
        ...formData,
        title: finalTitle,
        summary: finalSummary,
        status: targetStatus,
      });

      toast.success(
        targetStatus === "published"
          ? "Announcement created and published successfully!"
          : "Announcement saved as draft."
      );
      router.push("/admin/dashboard/announcements");
    } catch (err) {
      console.error("Create announcement error:", err);
      toast.error("Failed to create announcement.");
    } finally {
      setIsSubmitting(false);
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
            <h2 className="text-xl font-extrabold text-[#070707]">Create Announcement</h2>
            <p className="text-xs text-slate-500">Publish time-sensitive public notices and advisories</p>
          </div>
        </div>
      </div>

      <form className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <LanguageTabs
          title="Announcement Information"
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
            placeholder="Official announcement headline..."
          />

          <TextAreaInput
            label={`Summary / Key Points`}
            rows={2}
            value={formData.summary[activeLang]}
            onChange={(v) => handleFieldChange("summary", activeLang, v)}
            error={errors[`summary_${activeLang}`]}
            placeholder="Brief summary..."
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
            <TextInput
              label="Publication Date"
              type="date"
              required
              value={formData.date}
              onChange={(v) => handleFieldChange("date", null, v)}
              error={errors.date}
            />

            <TextInput
              label="Expiry Date"
              type="date"
              required
              value={formData.expiryDate}
              onChange={(v) => handleFieldChange("expiryDate", null, v)}
              error={errors.expiryDate}
              helperText="Announcement will be hidden from public website after this date"
            />
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
            <span>{isSubmitting ? "Publishing..." : "Publish Announcement"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
