"use client";
import { autoTranslateForm } from "@/src/lib/autoTranslate";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Send, Trash2 } from "lucide-react";
import LanguageTabs from "@/components/admin/LanguageTabs";
import { TextInput, TextAreaInput, SelectInput } from "@/components/admin/FormControls";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { noticeService } from "@/src/services";
import { useToast } from "@/src/context/ToastContext";

export default function EditNoticePage() {
  const router = useRouter();
  const routeParams = useParams();
  const id = routeParams?.id;
  const toast = useToast();

  const [activeLang, setActiveLang] = useState("am");
  const [formData, setFormData] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      const item = noticeService.getById(id);
      if (item) {
        setFormData({
          title: typeof item.title === "object" ? item.title : { om: item.title, am: "", en: "" },
          summary: typeof item.summary === "object" ? item.summary : { om: item.summary || item.description || "", am: "", en: "" },
          content: typeof item.content === "object" ? item.content : { om: item.content || "", am: "", en: "" },
          category: item.category || "Revenue",
          date: item.date || new Date().toISOString().split("T")[0],
          referenceNo: item.referenceNo || "",
          status: item.status || "published",
        });
      } else {
        toast.error("Notice not found.");
        router.push("/admin/dashboard/notices");
      }
    }
  }, [id, router, toast]);

  if (!formData) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#FE0002] border-t-transparent" />
          <span>Loading notice...</span>
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
    if (!formData.title.om || formData.title.om.trim() === "") {
      newErrors.title_om = "Afaan Oromoo title is required.";
    }
    if (targetStatus === "published") {
      if (!formData.title.am || formData.title.am.trim() === "") {
        newErrors.title_am = "Amharic title is required before publishing.";
      }
      if (!formData.title.en || formData.title.en.trim() === "") {
        newErrors.title_en = "English title is required before publishing.";
      }
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
      toast.error("Please fix form errors.");
      return;
    }

    try {
      noticeService.update(id, {
        ...formData,
        status: targetStatus,
      });

      toast.success("Notice updated successfully!");
      router.push("/admin/dashboard/notices");
    } catch {
      toast.error("Failed to update notice.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    try {
      noticeService.delete(id);
      toast.success("Notice deleted.");
      router.push("/admin/dashboard/notices");
    } catch {
      toast.error("Failed to delete notice.");
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
            href="/admin/dashboard/notices"
            className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 transition"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h2 className="text-xl font-extrabold text-[#070707]">Edit Notice</h2>
            <p className="text-xs text-slate-500">Update notice translations and publication status</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setDeleteModalOpen(true)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:border-[#FE0002] hover:text-[#FE0002] transition inline-flex items-center gap-1.5 cursor-pointer"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Delete</span>
        </button>
      </div>

      <form className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <LanguageTabs
          activeTab={activeLang}
          onTabChange={async (newLang) => {
            if (activeLang !== newLang) {
              await autoTranslateForm(formData, setFormData, activeLang, newLang, toast, setIsTranslating);
              setActiveLang(newLang);
            }
          }}
          status={langStatus}
          errors={tabErrors}
        />

        <div className="space-y-5">
          <TextInput
            label={`Notice Title`}
            required={activeLang === "om"}
            value={formData.title[activeLang]}
            onChange={(v) => handleFieldChange("title", activeLang, v)}
            error={errors[`title_${activeLang}`]}
            placeholder="Notice title..."
          />

          <TextAreaInput
            label={`Summary`}
            rows={2}
            value={formData.summary[activeLang]}
            onChange={(v) => handleFieldChange("summary", activeLang, v)}
            error={errors[`summary_${activeLang}`]}
            placeholder="Summary..."
          />

          <TextAreaInput
            label={`Full Notice Content`}
            rows={6}
            value={formData.content[activeLang]}
            onChange={(v) => handleFieldChange("content", activeLang, v)}
            error={errors[`content_${activeLang}`]}
            placeholder="Full notice text..."
          />
        </div>

        <div className="border-t border-slate-100 pt-6 space-y-5">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
            Administrative Details
          </h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <SelectInput
              label="Category"
              required
              value={formData.category}
              onChange={(v) => handleFieldChange("category", null, v)}
              options={[
                { value: "Revenue", label: "Revenue" },
                { value: "Environment", label: "Environment" },
                { value: "Urban Planning", label: "Urban Planning" },
                { value: "Safety", label: "Safety" },
              ]}
            />

            <TextInput
              label="Reference Number"
              value={formData.referenceNo}
              onChange={(v) => handleFieldChange("referenceNo", null, v)}
            />
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 border-t border-slate-100 pt-6">
          <Link
            href="/admin/dashboard/notices"
            className="w-full sm:w-auto rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-[#070707] hover:bg-slate-50 transition text-center"
          >
            Cancel
          </Link>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={(e) => handleSubmit(e, "draft")}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-slate-100 px-5 py-2.5 text-xs font-bold text-[#070707] hover:bg-slate-200 transition"
          >
            <Save className="h-4 w-4" />
            <span>Save as Draft</span>
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={(e) => handleSubmit(e, "published")}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#FE0002] px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#CC0002] transition"
          >
            <Send className="h-4 w-4 text-white" />
            <span>{isSubmitting ? "Updating..." : "Update & Publish"}</span>
          </button>
        </div>
      </form>

      <ConfirmDialog
        isOpen={deleteModalOpen}
        title="Delete Notice"
        message="Are you sure you want to delete this notice?"
        itemName={formData?.title?.om || formData?.title?.en || ""}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
}
