"use client";

import { useState, useEffect, use } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Send, Trash2 } from "lucide-react";
import LanguageTabs from "@/components/admin/language-tabs";
import { TextInput, TextAreaInput, SelectInput, ImagePickerInput } from "@/components/admin/form-controls";
import ConfirmDialog from "@/components/admin/confirm-dialog";
import { newsService } from "@/src/services";
import { useToast } from "@/src/context/ToastContext";
import { validateImage, validateRequired } from "@/src/lib/validation";

export default function EditNewsPage({ params }) {
  const router = useRouter();
  const routeParams = useParams();
  const id = routeParams?.id;
  const toast = useToast();

  const [activeLang, setActiveLang] = useState("am");
  const [formData, setFormData] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      const item = newsService.getById(id);
      if (item) {
        setFormData({
          title: typeof item.title === "object" ? item.title : { om: item.title, am: "", en: "" },
          summary: typeof item.summary === "object" ? item.summary : { om: item.summary || item.description || "", am: "", en: "" },
          content: typeof item.content === "object" ? item.content : { om: item.content || "", am: "", en: "" },
          category: item.category || "Community",
          date: item.date || new Date().toISOString().split("T")[0],
          author: item.author || "Burayu Communications Desk",
          image: item.image || "",
          tags: Array.isArray(item.tags) ? item.tags.join(", ") : (item.tags || ""),
          status: item.status || "published",
        });
      } else {
        toast.error("News item not found.");
        router.push("/admin/dashboard/news");
      }
    }
  }, [id, router, toast]);

  if (!formData) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
          <span>Loading news item...</span>
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

      newsService.update(id, {
        ...formData,
        title: finalTitle,
        summary: finalSummary,
        content: finalContent,
        image: formData.image || "",
        tags: tagsArray,
        status: targetStatus,
      });

      toast.success("News article updated successfully!");
      router.push("/admin/dashboard/news");
    } catch (err) {
      console.error("Update news error:", err);
      toast.error("Failed to update news item.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    try {
      newsService.delete(id);
      toast.success("News item deleted successfully.");
      router.push("/admin/dashboard/news");
    } catch {
      toast.error("Failed to delete news item.");
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/dashboard/news"
            className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 transition"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Edit News Article</h2>
            <p className="text-xs text-slate-500">Update multilingual translations and publication status</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setDeleteModalOpen(true)}
          className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition inline-flex items-center gap-1.5"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Delete</span>
        </button>
      </div>

      <form className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <LanguageTabs
          activeTab={activeLang}
          onTabChange={setActiveLang}
          status={langStatus}
          errors={tabErrors}
        />

        <div className="space-y-5">
          <TextInput
            label={`Article Title (${activeLang.toUpperCase()})`}
            required={activeLang === "om"}
            value={formData.title[activeLang]}
            onChange={(v) => handleFieldChange("title", activeLang, v)}
            error={errors[`title_${activeLang}`]}
            placeholder="Headline..."
          />

          <TextAreaInput
            label={`Summary / Lead (${activeLang.toUpperCase()})`}
            rows={2}
            value={formData.summary[activeLang]}
            onChange={(v) => handleFieldChange("summary", activeLang, v)}
            error={errors[`summary_${activeLang}`]}
            placeholder="Summary..."
          />

          <TextAreaInput
            label={`Full Content (${activeLang.toUpperCase()})`}
            rows={6}
            value={formData.content[activeLang]}
            onChange={(v) => handleFieldChange("content", activeLang, v)}
            error={errors[`content_${activeLang}`]}
            placeholder="Full story text..."
          />
        </div>

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
              label="Tags"
              value={formData.tags}
              onChange={(v) => handleFieldChange("tags", null, v)}
            />
          </div>

          <ImagePickerInput
            label="Cover Photography"
            value={formData.image}
            onChange={(v) => handleFieldChange("image", null, v)}
            error={errors.image}
          />
        </div>

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
            <span>{isSubmitting ? "Updating..." : "Update & Publish"}</span>
          </button>
        </div>
      </form>

      <ConfirmDialog
        isOpen={deleteModalOpen}
        title="Delete News Article"
        message="Are you sure you want to permanently delete this news story?"
        itemName={formData?.title?.om || formData?.title?.en || ""}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
}
