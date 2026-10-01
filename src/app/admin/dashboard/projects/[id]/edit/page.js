"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Send, Trash2 } from "lucide-react";
import LanguageTabs from "@/components/admin/language-tabs";
import { TextInput, TextAreaInput, SelectInput, ImagePickerInput } from "@/components/admin/form-controls";
import ConfirmDialog from "@/components/admin/confirm-dialog";
import { projectService } from "@/src/services";
import { useToast } from "@/src/context/ToastContext";

export default function EditProjectPage() {
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
    if (!id) return;
    const fetchProject = async () => {
      try {
        const item = await projectService.getById(id);
        if (item) {
          setFormData({
            title: typeof item.title === "object" ? item.title : { om: item.title, am: item.title, en: item.title },
            description: typeof item.description === "object" ? item.description : { om: item.description || "", am: item.description || "", en: item.description || "" },
            content: typeof item.content === "object" ? item.content : { om: item.content || "", am: item.content || "", en: item.content || "" },
            category: item.department || item.category || "Infrastructure",
            location: item.location || "Burayu",
            projectStatus: item.status && ["Planned", "Ongoing", "Completed", "Suspended"].includes(item.status) ? item.status : (item.projectStatus || "Ongoing"),
            startDate: item.start_date || item.startDate || "",
            targetCompletion: item.end_date || item.targetCompletion || "",
            budget: item.budget || "",
            progress: item.progress ?? 0,
            image: item.image || "",
            status: item.is_published ? "published" : (item.status === "published" ? "published" : "draft"),
          });
        } else {
          toast.error("Project not found.");
          router.push("/admin/dashboard/projects");
        }
      } catch (err) {
        toast.error("Failed to load project: " + (err?.message || "Server error"));
        router.push("/admin/dashboard/projects");
      }
    };
    fetchProject();
  }, [id, router, toast]);

  if (!formData) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
          <span>Loading project...</span>
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
      toast.error("Please fix project validation errors.");
      return;
    }

    try {
      await projectService.update(id, {
        ...formData,
        department: formData.category,
        category: formData.category,
        start_date: formData.startDate || null,
        end_date: formData.targetCompletion || null,
        status: formData.projectStatus,
        projectStatus: formData.projectStatus,
        is_published: targetStatus === "published",
        progress: Number(formData.progress) || 0,
      });
      toast.success(targetStatus === "published" ? "Project updated & published!" : "Project saved as draft!");
      router.push("/admin/dashboard/projects");
    } catch (err) {
      toast.error("Failed to update project: " + (err?.message || "Server error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await projectService.delete(id);
      toast.success("Project deleted.");
      router.push("/admin/dashboard/projects");
    } catch (err) {
      toast.error("Failed to delete project: " + (err?.message || "Server error"));
    }
  };

  const langStatus = {
    om: !!formData.title.om?.trim(),
    am: !!formData.title.am?.trim(),
    en: !!formData.title.en?.trim(),
  };

  const tabErrors = {
    om: errors.title_om || errors.description_om,
    am: errors.title_am || errors.description_am,
    en: errors.title_en || errors.description_en,
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
            <h2 className="text-xl font-extrabold text-slate-900">Edit Project</h2>
            <p className="text-xs text-slate-500">Update project progress, scope, and translations</p>
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
            label={`Project Name (${activeLang.toUpperCase()})`}
            required={activeLang === "om"}
            value={formData.title[activeLang]}
            onChange={(v) => handleFieldChange("title", activeLang, v)}
            error={errors[`title_${activeLang}`]}
            placeholder="Project name..."
          />

          <TextAreaInput
            label={`Description (${activeLang.toUpperCase()})`}
            rows={2}
            value={formData.description[activeLang]}
            onChange={(v) => handleFieldChange("description", activeLang, v)}
            error={errors[`description_${activeLang}`]}
            placeholder="Short description..."
          />

          <TextAreaInput
            label={`Scope & Progress Details (${activeLang.toUpperCase()})`}
            rows={5}
            value={formData.content[activeLang]}
            onChange={(v) => handleFieldChange("content", activeLang, v)}
            placeholder="Technical details..."
          />
        </div>

        <div className="border-t border-slate-100 pt-6 space-y-5">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
            Timelines & Status
          </h3>

          <div className="grid gap-4 sm:grid-cols-3">
            <SelectInput
              label="Status"
              required
              value={formData.projectStatus}
              onChange={(v) => handleFieldChange("projectStatus", null, v)}
              options={[
                { value: "Planned", label: "Planned" },
                { value: "Ongoing", label: "Ongoing" },
                { value: "Completed", label: "Completed" },
                { value: "Suspended", label: "Suspended" },
              ]}
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
              value={formData.location}
              onChange={(v) => handleFieldChange("location", null, v)}
            />

            <SelectInput
              label="Responsible Department"
              value={formData.category}
              onChange={(v) => handleFieldChange("category", null, v)}
              options={[
                { value: "Infrastructure", label: "Infrastructure" },
                { value: "Commerce", label: "Commerce" },
                { value: "Water & Sanitation", label: "Water & Sanitation" },
                { value: "Digital Services", label: "Digital Services" },
                { value: "Urban Planning", label: "Urban Planning" },
              ]}
            />

            <TextInput
              label="Funding / Budget Program"
              value={formData.budget}
              onChange={(v) => handleFieldChange("budget", null, v)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Progress: 0–100%
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.progress}
                  onChange={(e) => handleFieldChange("progress", null, e.target.value)}
                  className="w-32 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
                />
                <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-2.5 rounded-full transition-all duration-300"
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
            className="w-full sm:w-auto rounded-full border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition text-center"
          >
            Cancel
          </Link>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={(e) => handleSubmit(e, "draft")}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-slate-100 px-5 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-200 transition disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            <span>Save as Draft</span>
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={(e) => handleSubmit(e, "published")}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-slate-800 transition disabled:opacity-60"
          >
            <Send className="h-4 w-4 text-amber-400" />
            <span>{isSubmitting ? "Updating..." : "Update & Publish"}</span>
          </button>
        </div>
      </form>

      <ConfirmDialog
        isOpen={deleteModalOpen}
        title="Delete Project"
        message="Are you sure you want to delete this project? This action cannot be undone."
        itemName={formData?.title?.om || formData?.title?.en || ""}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
}
