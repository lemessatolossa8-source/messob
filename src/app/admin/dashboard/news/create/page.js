"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Send, Sparkles } from "lucide-react";
import LanguageTabs from "@/components/admin/language-tabs";
import { TextInput, TextAreaInput, SelectInput, ImagePickerInput } from "@/components/admin/form-controls";
import { newsService } from "@/src/services";
import { useToast } from "@/src/context/ToastContext";
import { validateRequired, validateLength, validateImage, validateMultilingual } from "@/src/lib/validation";

export default function CreateNewsPage() {
  const router = useRouter();
  const toast = useToast();

  const [activeLang, setActiveLang] = useState("am");
  const [formData, setFormData] = useState({
    title: { om: "", am: "", en: "" },
    summary: { om: "", am: "", en: "" },
    content: { om: "", am: "", en: "" },
    category: "Community",
    date: new Date().toISOString().split("T")[0],
    author: "Burayu Communications Desk",
    image: "",
    tags: "Burayu, Municipal, News",
    status: "published",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
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

    // Clear specific error on change
    const errorKey = lang ? `${field}_${lang}` : field;
    if (errors[errorKey]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[errorKey];
        return copy;
      });
    }
  };

  const handleBlur = (field, lang) => {
    const key = lang ? `${field}_${lang}` : field;
    setTouched((prev) => ({ ...prev, [key]: true }));

    const val = lang ? formData[field][lang] : formData[field];
    if (field === "title" && lang === "om") {
      const err = validateRequired(val, "Afaan Oromoo Title");
      if (err) setErrors((prev) => ({ ...prev, [key]: err }));
    }
  };

  const validateForm = (targetStatus) => {
    const newErrors = {};

    // Validate that at least ONE title is provided (om, am, or en)
    const hasAnyTitle = !!(formData.title.om?.trim() || formData.title.am?.trim() || formData.title.en?.trim());
    if (!hasAnyTitle) {
      newErrors.title_om = "Please enter an article title in at least one language.";
    }

    if (!formData.category) {
      newErrors.category = "Category is required.";
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
      toast.error("Please enter an article headline.");
      return;
    }

    try {
      const tagsArray = typeof formData.tags === "string"
        ? formData.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : formData.tags;

      const primaryTitle = formData.title.om?.trim() || formData.title.en?.trim() || formData.title.am?.trim();
      const primarySummary = formData.summary.om?.trim() || formData.summary.en?.trim() || formData.summary.am?.trim() || "";
      const primaryContent = formData.content.om?.trim() || formData.content.en?.trim() || formData.content.am?.trim() || "";

      const finalTitle = {
        om: formData.title.om?.trim() || primaryTitle,
        am: formData.title.am?.trim() || primaryTitle,
        en: formData.title.en?.trim() || primaryTitle,
      };

      const finalSummary = {
        om: formData.summary.om?.trim() || primarySummary,
        am: formData.summary.am?.trim() || primarySummary,
        en: formData.summary.en?.trim() || primarySummary,
      };

      const finalContent = {
        om: formData.content.om?.trim() || primaryContent,
        am: formData.content.am?.trim() || primaryContent,
        en: formData.content.en?.trim() || primaryContent,
      };

      newsService.create({
        ...formData,
        title: finalTitle,
        summary: finalSummary,
        content: finalContent,
        image: formData.image || "",
        tags: tagsArray,
        status: targetStatus,
      });

      toast.success(
        targetStatus === "published"
          ? "News article created and published successfully!"
          : "News article saved as draft."
      );
      router.push("/admin/dashboard/news");
    } catch (err) {
      console.error("Create news error:", err);
      toast.error("Failed to create news item. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const langStatus = {
    om: !!formData.title.om?.trim(),
    am: !!formData.title.am?.trim(),
    en: !!formData.title.en?.trim(),
  };

  const tabErrors = {
    om: errors.title_om || errors.summary_om || errors.content_om,
    am: errors.title_am || errors.summary_am || errors.content_am,
    en: errors.title_en || errors.summary_en || errors.content_en,
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header & Back Link */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/dashboard/news"
            className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 transition"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Create News Article</h2>
            <p className="text-xs text-slate-500">Add a new verified municipal story in all 3 languages</p>
          </div>
        </div>
      </div>

      <form className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        {/* Language Tabs */}
        <LanguageTabs
          activeTab={activeLang}
          onTabChange={setActiveLang}
          status={langStatus}
          errors={tabErrors}
        />

        {/* Multilingual Fields */}
        <div className="space-y-5">
          <TextInput
            label={`Article Title (${activeLang.toUpperCase()})`}
            required={activeLang === "om"}
            value={formData.title[activeLang]}
            onChange={(v) => handleFieldChange("title", activeLang, v)}
            onBlur={() => handleBlur("title", activeLang)}
            error={errors[`title_${activeLang}`]}
            placeholder={`Enter news headline in ${activeLang === "om" ? "Afaan Oromoo" : activeLang === "am" ? "Amharic" : "English"}...`}
          />

          <TextAreaInput
            label={`Summary / Lead Paragraph (${activeLang.toUpperCase()})`}
            rows={2}
            value={formData.summary[activeLang]}
            onChange={(v) => handleFieldChange("summary", activeLang, v)}
            onBlur={() => handleBlur("summary", activeLang)}
            error={errors[`summary_${activeLang}`]}
            placeholder="Brief introductory summary..."
          />

          <TextAreaInput
            label={`Full Article Content (${activeLang.toUpperCase()})`}
            rows={6}
            value={formData.content[activeLang]}
            onChange={(v) => handleFieldChange("content", activeLang, v)}
            onBlur={() => handleBlur("content", activeLang)}
            error={errors[`content_${activeLang}`]}
            placeholder="Complete news story body text..."
          />
        </div>

        {/* Common Settings Divider */}
        <div className="border-t border-slate-100 pt-6 space-y-5">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
            Publishing Settings & Metadata
          </h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <SelectInput
              label="Category"
              required
              value={formData.category}
              onChange={(v) => handleFieldChange("category", null, v)}
              error={errors.category}
              options={[
                { value: "Community", label: "Community" },
                { value: "Infrastructure", label: "Infrastructure" },
                { value: "Urban Planning", label: "Urban Planning" },
                { value: "Economic Development", label: "Economic Development" },
                { value: "Digital Services", label: "Digital Services" },
                { value: "Investment", label: "Investment" },
                { value: "Commerce", label: "Commerce" },
              ]}
            />

            <TextInput
              label="Author / Bureau Desk"
              value={formData.author}
              onChange={(v) => handleFieldChange("author", null, v)}
              placeholder="e.g. Burayu Communications Desk"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput
              label="Published Date"
              type="date"
              value={formData.date}
              onChange={(v) => handleFieldChange("date", null, v)}
            />

            <TextInput
              label="Tags (Comma-separated)"
              value={formData.tags}
              onChange={(v) => handleFieldChange("tags", null, v)}
              placeholder="Sanitation, Roads, Community"
            />
          </div>

          <ImagePickerInput
            label="Cover Photography"
            value={formData.image}
            onChange={(v) => handleFieldChange("image", null, v)}
            error={errors.image}
          />
        </div>

        {/* Form Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 border-t border-slate-100 pt-6">
          <Link
            href="/admin/dashboard/news"
            className="w-full sm:w-auto rounded-full border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition text-center"
          >
            Cancel
          </Link>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={(e) => handleSubmit(e, "draft")}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-slate-100 px-5 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-200 transition disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>Save as Draft</span>
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={(e) => handleSubmit(e, "published")}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-slate-800 transition disabled:opacity-50"
          >
            <Send className="h-4 w-4 text-amber-400" />
            <span>{isSubmitting ? "Publishing..." : "Publish News"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
