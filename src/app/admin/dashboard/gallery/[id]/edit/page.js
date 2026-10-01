"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Send, Trash2 } from "lucide-react";
import LanguageTabs from "@/components/admin/language-tabs";
import { TextInput, TextAreaInput, SelectInput, ImagePickerInput } from "@/components/admin/form-controls";
import ConfirmDialog from "@/components/admin/confirm-dialog";
import { galleryService } from "@/src/services";
import { useToast } from "@/src/context/ToastContext";
import { validateImage } from "@/src/lib/validation";

export default function EditGalleryPage() {
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
    if (!id) {
      toast.error("No gallery ID provided in the URL.");
      router.push("/admin/dashboard/gallery");
      return;
    }
    const item = galleryService.getById(id);
    if (item) {
      setFormData({
        title: typeof item.title === "object" ? item.title : { om: item.title, am: "", en: "" },
        description: typeof item.description === "object" ? item.description : { om: item.description || "", am: "", en: "" },
        category: item.category || "Administration",
        image: item.image || "",
        status: item.status || "published",
      });
    } else {
      toast.error("Gallery item not found.");
      router.push("/admin/dashboard/gallery");
    }
  }, [id, router, toast]);

  if (!formData) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
          <span>Loading gallery image...</span>
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
      // Ensure required fields are present before updating
      if (!formData.title?.om && !formData.title?.en && !formData.title?.am) {
        throw new Error("At least one title language is required.");
      }
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

      galleryService.update(id, {
        ...formData,
        title: finalTitle,
        description: finalDesc,
        image: formData.image,
        status: targetStatus,
      });

      toast.success("Gallery image updated successfully!");
      router.push("/admin/dashboard/gallery");
    } catch (err) {
      console.error("Update gallery error:", err);
      toast.error(err.message ?? "Failed to update gallery image.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    try {
      galleryService.delete(id);
      toast.success("Gallery item deleted.");
      router.push("/admin/dashboard/gallery");
    } catch {
      toast.error("Failed to delete gallery item.");
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
            <h2 className="text-xl font-extrabold text-slate-900">Edit Gallery Image</h2>
            <p className="text-xs text-slate-500">Update photo details, categories, and translations</p>
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
          errors={{ om: errors.title_om, am: errors.title_am, en: errors.title_en }}
        />

        <div className="space-y-5">
          <TextInput
            label={`Image Title / Caption (${activeLang.toUpperCase()})`}
            required={activeLang === "om"}
            value={formData.title[activeLang]}
            onChange={(v) => handleFieldChange("title", activeLang, v)}
            error={errors[`title_${activeLang}`]}
            placeholder="Image caption..."
          />

          <TextAreaInput
            label={`Description / Context (${activeLang.toUpperCase()})`}
            rows={3}
            value={formData.description[activeLang]}
            onChange={(v) => handleFieldChange("description", activeLang, v)}
            placeholder="Context description..."
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
            label="Image File (URL or Presets)"
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
            <span>{isSubmitting ? "Updating..." : "Update & Publish"}</span>
          </button>
        </div>
      </form>

      <ConfirmDialog
        isOpen={deleteModalOpen}
        title="Delete Gallery Image"
        message="Are you sure you want to delete this media asset?"
        itemName={formData?.title?.om || formData?.title?.en || ""}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
}
