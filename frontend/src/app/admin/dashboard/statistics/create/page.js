"use client";
import { autoTranslateForm } from "@/src/lib/autoTranslate";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Send } from "lucide-react";
import LanguageTabs from "@/components/admin/LanguageTabs";
import { TextInput, TextAreaInput } from "@/components/admin/FormControls";
import { statisticService } from "@/src/services/statisticService";
import { useToast } from "@/src/context/ToastContext";
import { validateRequired } from "@/src/lib/validation";

export default function CreateStatisticPage() {
  const router = useRouter();
  const toast = useToast();

  const [activeLang, setActiveLang] = useState("am");
  const [formData, setFormData] = useState({
    title: { om: "", am: "", en: "" },
    description: { om: "", am: "", en: "" },
    value: "",
    icon: "BriefcaseBusiness",
    order: 0,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

  const handleFieldChange = (field, lang, value) => {
    if (lang) {
      setFormData((prev) => ({
        ...prev,
        [field]: { ...prev[field], [lang]: value },
      }));
      if (errors[`${field}_${lang}`]) {
        setErrors((prev) => ({ ...prev, [`${field}_${lang}`]: null }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: null }));
      }
    }
  };

  const validateForm = (targetStatus) => {
    const newErrors = {};

    if (targetStatus === "published") {
      if (!validateRequired(formData.title.om) && !validateRequired(formData.title.am) && !validateRequired(formData.title.en)) {
        newErrors.title_om = "Please enter a title in at least one language.";
      }
      if (!validateRequired(formData.value)) {
        newErrors.value = "Number/value is required.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e, targetStatus) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);

    if (!validateForm(targetStatus)) {
      setIsSubmitting(false);
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      await statisticService.create({
        ...formData,
        order: parseInt(formData.order) || 0,
        status: targetStatus,
      });

      toast.success(
        targetStatus === "published"
          ? "Statistic created and published successfully!"
          : "Statistic saved as draft."
      );
      router.push("/admin/dashboard/statistics");
    } catch (err) {
      console.error("Create statistic error:", err);
      toast.error("Failed to create statistic. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Language status flags
  const langStatus = {
    om: !!formData.title.om?.trim(),
    am: !!formData.title.am?.trim(),
    en: !!formData.title.en?.trim(),
  };

  const tabErrors = {
    om: !!errors.title_om,
    am: !!errors.title_am,
    en: !!errors.title_en,
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/dashboard/statistics"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm transition-colors hover:bg-slate-50 hover:text-[#070707]"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h2 className="text-xl font-extrabold text-[#070707]">Add Statistic</h2>
            <p className="text-xs text-slate-500">Create a new statistic for the homepage</p>
          </div>
        </div>
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

        <div className="grid gap-6 sm:grid-cols-2">
          <TextInput
            label="Number / Value"
            required={true}
            value={formData.value}
            onChange={(v) => handleFieldChange("value", null, v)}
            placeholder="e.g. 150+ or 1,200"
            error={errors.value}
          />
          <TextInput
            label="Icon Name"
            value={formData.icon}
            onChange={(v) => handleFieldChange("icon", null, v)}
            placeholder="Lucide icon name (e.g. Users, BriefcaseBusiness)"
          />
          <TextInput
            label="Display Order"
            type="number"
            value={formData.order}
            onChange={(v) => handleFieldChange("order", null, v)}
            placeholder="0"
          />
        </div>

        <div className="space-y-5">
          <TextInput
            label={`Title`}
            required={activeLang === "om"}
            value={formData.title[activeLang]}
            onChange={(v) => handleFieldChange("title", activeLang, v)}
            placeholder="e.g. Employees"
            error={errors[`title_${activeLang}`]}
          />
          <TextAreaInput
            label={`Description`}
            value={formData.description[activeLang]}
            onChange={(v) => handleFieldChange("description", activeLang, v)}
            placeholder="e.g. Dedicated MESOB public staff"
            rows={2}
          />
        </div>
      </form>

      <div className="flex items-center justify-end gap-3 pt-4">
        <button
          type="button"
          disabled={isSubmitting || isTranslating}
          onClick={(e) => handleSubmit(e, "draft")}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-[#070707] hover:bg-slate-50 transition focus:ring-4 focus:ring-slate-200 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          <span>Save Draft</span>
        </button>
        <button
          type="button"
          disabled={isSubmitting || isTranslating}
          onClick={(e) => handleSubmit(e, "published")}
          className="inline-flex items-center gap-2 rounded-full bg-[#FE0002] px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#CC0002] transition focus:ring-4 focus:ring-rose-200 disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
          <span>Publish Statistic</span>
        </button>
      </div>
    </div>
  );
}
