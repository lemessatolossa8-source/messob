"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Send } from "lucide-react";
import LanguageTabs from "@/components/admin/LanguageTabs";
import { TextInput, ImagePickerInput } from "@/components/admin/FormControls";
import { galleryService } from "@/src/services";
import { useToast } from "@/src/context/ToastContext";
import { autoTranslateForm } from "@/src/lib/autoTranslate";

export default function CreateGalleryPage() {
  const router = useRouter();
  const toast = useToast();

  const [activeLang, setActiveLang] = useState("om");
  const [formData, setFormData] = useState({
    title: { om: "", am: "", en: "" },
    image: "",
    status: "published",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

  const handleTabChange = async (newLang) => {
    await autoTranslateForm(
      formData,
      setFormData,
      activeLang,
      newLang,
      toast,
      setIsTranslating
    );
    setActiveLang(newLang);
  };

  const handleFieldChange = (field, langOrValue, maybeValue) => {
    if (maybeValue !== undefined) {
      // Multilingual field: field, lang, value
      const lang = langOrValue;
      const value = maybeValue;
      setFormData((prev) => ({
        ...prev,
        [field]: {
          ...prev[field],
          [lang]: value,
        },
      }));

      const errorKey = `${field}_${lang}`;
      if (errors[errorKey] || errors[field]) {
        setErrors((prev) => {
          const copy = { ...prev };
          delete copy[errorKey];
          delete copy[field];
          return copy;
        });
      }
    } else {
      // Simple field: field, value
      const value = langOrValue;
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));

      if (errors[field]) {
        setErrors((prev) => {
          const copy = { ...prev };
          delete copy[field];
          return copy;
        });
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    const hasTitle =
      (formData.title?.om && formData.title.om.trim()) ||
      (formData.title?.am && formData.title.am.trim()) ||
      (formData.title?.en && formData.title.en.trim());

    if (!hasTitle) {
      newErrors.title = "Please enter a gallery title.";
      newErrors[`title_${activeLang}`] = "Please enter a gallery title.";
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

    const isValid = validateForm();
    if (!isValid) {
      setIsSubmitting(false);
      toast.error("Please provide both a title and an image.");
      return;
    }

    try {
      await galleryService.create({
        title: formData.title,
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
      toast.error(err.message || "Failed to add gallery image.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const langNames = {
    om: "Afaan Oromoo",
    am: "አማርኛ",
    en: "English",
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
            <h2 className="text-xl font-extrabold text-[#070707]">Add Gallery Image</h2>
            <p className="text-xs text-slate-500">Upload photography with title for our gallery</p>
          </div>
        </div>
      </div>

      <form className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <LanguageTabs
          activeTab={activeLang}
          onTabChange={handleTabChange}
          title="Photo Information"
        />

        <div className="space-y-5">
          <TextInput
            label={`Gallery Title (${langNames[activeLang]})`}
            required
            placeholder={`Enter gallery title in ${langNames[activeLang]}...`}
            value={formData.title[activeLang] || ""}
            onChange={(v) => handleFieldChange("title", activeLang, v)}
            error={errors[`title_${activeLang}`] || errors.title}
          />

          <ImagePickerInput
            label="Image File (URL or Presets, max 5MB, JPG/PNG/WEBP)"
            required
            value={formData.image}
            onChange={(v) => handleFieldChange("image", v)}
            error={errors.image}
          />
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 border-t border-slate-100 pt-6">
          <Link
            href="/admin/dashboard/gallery"
            className="w-full sm:w-auto rounded-full border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-[#070707] hover:bg-slate-50 transition text-center"
          >
            Cancel
          </Link>

          <button
            type="button"
            disabled={isSubmitting || isTranslating}
            onClick={(e) => handleSubmit(e, "draft")}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-slate-100 px-5 py-2.5 text-xs font-bold text-[#070707] hover:bg-slate-200 transition"
          >
            <Save className="h-4 w-4" />
            <span>Save as Draft</span>
          </button>

          <button
            type="button"
            disabled={isSubmitting || isTranslating}
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
