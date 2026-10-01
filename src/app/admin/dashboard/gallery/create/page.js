"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Send } from "lucide-react";
import LanguageTabs from "@/components/admin/language-tabs";
import { TextInput, TextAreaInput, SelectInput, ImagePickerInput } from "@/components/admin/form-controls";
import { galleryService } from "@/src/services";
import { useToast } from "@/src/context/ToastContext";
import { validateRequired, validateImage } from "@/src/lib/validation";

export default function CreateGalleryPage() {
  const router = useRouter();
  const toast = useToast();

  const [activeLang, setActiveLang] = useState("am");
  const [formData, setFormData] = useState({
    title: { om: "", am: "", en: "" },
    description: { om: "", am: "", en: "" },
    category: "Administration",
    image: "",
    status: "published",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      newErrors.title_om = "Please enter an image title/caption in at least one language.";
    }
    if (!formData.image || !formData.image.trim()) {
      newErrors.image = "Please upload an image or provide an image URL.";
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
      toast.error("Please provide both a title and an image.");
      return;
    }

    try {
      const primaryTitle = formData.title.om?.trim() || formData.title.en?.trim() || formData.title.am?.trim();
      const primaryDesc = formData.description.om?.trim() || formData.description.en?.trim() || formData.description.am?.trim() || "";

      const finalTitle = {
        om: formData.title.om?.trim() || primaryTitle,
        am: formData.title.am?.trim() || primaryTitle,
        en: formData.title.en?.trim() || primaryTitle,
      };

      const finalDesc = {
        om: formData.description.om?.trim() || primaryDesc,
        am: formData.description.am?.trim() || primaryDesc,
        en: formData.description.en?.trim() || primaryDesc,
      };

      galleryService.create({
        ...formData,
        title: finalTitle,
        description: finalDesc,
        image: formData.image,
        status: targetStatus,
      });

      toast.success(
        targetStatus === "published"
          ? "Gallery image added and published!"
          : "Gallery image saved as draft."
      );
      router.push("/admin/dashboard/gallery");
    } catch (err) {
      console.error("Create gallery item error:", err);
      toast.error("Failed to add gallery image.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const langStatus = {
    om: !!formData.title.om?.trim(),
    am: !!formData.title.am?.trim(),
    en: !!formData.title.en?.trim(),
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/dashboard/gallery"
            className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 transition"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Add Gallery Image</h2>
            <p className="text-xs text-slate-500">Upload and catalog photography for the media gallery</p>
          </div>
        </div>
      </div>

      <form className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <LanguageTabs
          activeTab={activeLang}
          onTabChange={setActiveLang}
          status={langStatus}
          errors={{ om: errors.title_om, am: errors.title_am, en: errors.title_en }}
        />

        <div className="space-y-5">
          <TextInput
            label={`Image Title / Caption (${activeLang.toUpperCase()})`}
            required={activeLang === "om"}
            value={formData.title[activeLang]}
            onChange={(v) => handleFieldChange("title", activeLang, v)}
            error={errors[`title_${activeLang}`]}
            placeholder="Image title or description..."
          />

          <TextAreaInput
            label={`Description / Context (${activeLang.toUpperCase()})`}
            rows={3}
            value={formData.description[activeLang]}
            onChange={(v) => handleFieldChange("description", activeLang, v)}
            placeholder="Event or project context..."
          />
        </div>

        <div className="border-t border-slate-100 pt-6 space-y-5">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
            Media Asset & Category
          </h3>

          <SelectInput
            label="Category"
            required
            value={formData.category}
            onChange={(v) => handleFieldChange("category", null, v)}
            options={[
              { value: "Administration", label: "Administration" },
              { value: "Civic", label: "Civic" },
              { value: "Projects", label: "Projects" },
              { value: "Commerce", label: "Commerce" },
              { value: "Environment", label: "Environment" },
              { value: "Digital", label: "Digital" },
            ]}
          />

          <ImagePickerInput
            label="Image File (URL or Presets, max 5MB, JPG/PNG/WEBP)"
            required
            value={formData.image}
            onChange={(v) => handleFieldChange("image", null, v)}
            error={errors.image}
          />
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 border-t border-slate-100 pt-6">
          <Link
            href="/admin/dashboard/gallery"
            className="w-full sm:w-auto rounded-full border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition text-center"
          >
            Cancel
          </Link>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={(e) => handleSubmit(e, "draft")}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-slate-100 px-5 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-200 transition"
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
            <span>{isSubmitting ? "Publishing..." : "Publish Image"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
