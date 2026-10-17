"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Send } from "lucide-react";
import LanguageTabs from "@/components/admin/LanguageTabs";
import { TextInput, TextAreaInput, SelectInput, ImagePickerInput } from "@/components/admin/FormControls";
import { projectService } from "@/src/services";
import { useToast } from "@/src/context/ToastContext";
import { PROJECT_CATEGORIES, PROJECT_STATUS_OPTIONS, categoriesToOptions, getDefaultCategory } from "@/src/constants/categories";
import { autoTranslateForm } from "@/src/lib/autoTranslate";

export default function CreateProjectPage() {
  const router = useRouter();
  const toast = useToast();

  const [activeLang, setActiveLang] = useState("om");
  const [formData, setFormData] = useState({
    title: { om: "", am: "", en: "" },
    description: { om: "", am: "", en: "" },
    category: getDefaultCategory("project"),
    location: "Central Burayu",
    projectStatus: PROJECT_STATUS_OPTIONS[0],
    startDate: new Date().toISOString().split("T")[0],
    targetCompletion: "",
    budget: "Municipal Infrastructure Fund",
    progress: 0,
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

  const validateForm = () => {
    const newErrors = {};
    const hasAnyTitle = !!(
      formData.title.om?.trim() ||
      formData.title.am?.trim() ||
      formData.title.en?.trim()
    );
    if (!hasAnyTitle) {
      newErrors.title_om = "Please enter a project title in at least one language.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e, targetStatus) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);

    if (!validateForm()) {
      setIsSubmitting(false);
      toast.error("Please enter a project title/name.");
      return;
    }

    try {
            const primaryDesc =
        formData.description.om?.trim() ||
        formData.description.en?.trim() ||
        formData.description.am?.trim() ||
        "";

      await projectService.create({
        ...formData,
        title: {
          om: formData.title.om?.trim(),
          am: formData.title.am?.trim(),
          en: formData.title.en?.trim(),
        },
        description: {
          om: formData.description.om?.trim() || primaryDesc,
          am: formData.description.am?.trim() || primaryDesc,
          en: formData.description.en?.trim() || primaryDesc,
        },
        location: formData.location || "Burayu",
        image: formData.image || "",
        department: formData.category || "Infrastructure",
        category: formData.category || "Infrastructure",
        start_date: formData.startDate || null,
        end_date: formData.targetCompletion || null,
        status: targetStatus === "published" ? "published" : "draft",
        projectStatus: formData.projectStatus || "Planned",
        is_published: targetStatus === "published",
        progress: Number(formData.progress) || 0,
      });

      toast.success(
        targetStatus === "published"
          ? "Project created and published successfully!"
          : "Project saved as draft."
      );
      router.push("/admin/dashboard/projects");
    } catch (err) {
      console.error("Create project error:", err);
      toast.error("Failed to create project: " + (err?.message || "Server error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/dashboard/projects"
            className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 transition"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h2 className="text-xl font-extrabold text-[#070707]">Create Development Project</h2>
            <p className="text-xs text-slate-500">Track urban infrastructure, water networks, and public works</p>
          </div>
        </div>
      </div>

      <form className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <LanguageTabs
          title="Project Details"
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
            label={`Project Name`}
            required={activeLang === "om"}
            value={formData.title[activeLang]}
            onChange={(v) => handleFieldChange("title", activeLang, v)}
            error={errors[`title_${activeLang}`]}
            placeholder="Official project title..."
          />

          <TextAreaInput
            label={`Description`}
            required={activeLang === "om"}
            rows={2}
            value={formData.description[activeLang]}
            onChange={(v) => handleFieldChange("description", activeLang, v)}
            error={errors[`description_${activeLang}`]}
            placeholder="Project summary and scope..."
          />
        </div>

        <div className="border-t border-slate-100 pt-6 space-y-5">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
            Timelines, Status & Details
          </h3>

          <div className="grid gap-4 sm:grid-cols-3">
            <SelectInput
              label="Status"
              required
              value={formData.projectStatus}
              onChange={(v) => handleFieldChange("projectStatus", null, v)}
              options={categoriesToOptions(PROJECT_STATUS_OPTIONS)}
            />

            <TextInput
              label="Start Date"
              type="date"
              value={formData.startDate}
              onChange={(v) => handleFieldChange("startDate", null, v)}
            />

            <TextInput
              label="Expected Completion Date"
              type="date"
              value={formData.targetCompletion}
              onChange={(v) => handleFieldChange("targetCompletion", null, v)}
              error={errors.targetCompletion}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <TextInput
              label="Location"
              required
              value={formData.location}
              onChange={(v) => handleFieldChange("location", null, v)}
              error={errors.location}
            />

            <SelectInput
              label="Responsible Department"
              value={formData.category}
              onChange={(v) => handleFieldChange("category", null, v)}
              options={categoriesToOptions(PROJECT_CATEGORIES)}
            />

            <TextInput
              label="Funding / Budget Program"
              value={formData.budget}
              onChange={(v) => handleFieldChange("budget", null, v)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-[#070707] mb-1.5">
                Progress: 0–100%
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.progress}
                  onChange={(e) => handleFieldChange("progress", null, e.target.value)}
                  className="w-32 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-[#070707] focus:border-[#FE0002] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FE0002]/15 transition"
                />
                <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-[#FE0002] h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.max(0, formData.progress))}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-slate-600">{formData.progress}%</span>
              </div>
            </div>
          </div>

          <ImagePickerInput
            label="Project Image / Blueprint"
            value={formData.image}
            onChange={(v) => handleFieldChange("image", null, v)}
            error={errors.image}
          />
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 border-t border-slate-100 pt-6">
          <Link
            href="/admin/dashboard/projects"
            className="w-full sm:w-auto rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-[#070707] hover:bg-slate-50 transition text-center"
          >
            Cancel
          </Link>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={(e) => handleSubmit(e, "draft")}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-slate-100 px-5 py-2.5 text-xs font-bold text-[#070707] hover:bg-slate-200 transition disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            <span>Save as Draft</span>
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={(e) => handleSubmit(e, "published")}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#FE0002] px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#CC0002] transition disabled:opacity-60"
          >
            <Send className="h-4 w-4 text-white" />
            <span>{isSubmitting ? "Saving..." : "Publish Project"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
