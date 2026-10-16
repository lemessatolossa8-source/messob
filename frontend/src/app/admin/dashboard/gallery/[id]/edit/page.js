"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Send, Trash2 } from "lucide-react";
import LanguageTabs from "@/components/admin/LanguageTabs";
import { TextInput, ImagePickerInput } from "@/components/admin/FormControls";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { galleryService } from "@/src/services";
import { useToast } from "@/src/context/ToastContext";
import { autoTranslateForm } from "@/src/lib/autoTranslate";

export default function EditGalleryPage() {
  const router = useRouter();
  const routeParams = useParams();
  const id = routeParams?.id;
  const toast = useToast();

  const [activeLang, setActiveLang] = useState("om");
  const [formData, setFormData] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    if (!id) {
      toast.error("No gallery ID provided in the URL.");
      router.push("/admin/dashboard/gallery");
      return;
    }
    const load = async () => {
      try {
        const item = await galleryService.getById(id);
        if (item) {
          let titleObj = { om: "", am: "", en: "" };
          if (typeof item.title === "string") {
            const trimmed = item.title.trim();
            if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
              try {
                const parsed = JSON.parse(trimmed);
                if (typeof parsed === "object" && parsed !== null) {
                  titleObj = {
                    om: parsed.om || "",
                    am: parsed.am || "",
                    en: parsed.en || "",
                  };
                } else {
                  titleObj = { om: trimmed, am: trimmed, en: trimmed };
                }
              } catch {
                titleObj = { om: trimmed, am: trimmed, en: trimmed };
              }
            } else {
              titleObj = { om: trimmed, am: trimmed, en: trimmed };
            }
          } else if (item.title && typeof item.title === "object") {
            titleObj = {
              om: item.title.om || "",
              am: item.title.am || "",
              en: item.title.en || "",
            };
          }

          setFormData({
            title: titleObj,
            image: item.image || "",
            status: item.status || "published",
          });
        } else {
          toast.error("Gallery item not found.");
          router.push("/admin/dashboard/gallery");
        }
      } catch {
        toast.error("Failed to load gallery item.");
        router.push("/admin/dashboard/gallery");
      }
    };
    load();
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
      await galleryService.update(id, {
        title: formData.title,
        image: formData.image,
        status: targetStatus,
      });

      toast.success("Gallery image and title updated successfully!");
      router.push("/admin/dashboard/gallery");
    } catch (err) {
      console.error("Update gallery error:", err);
      toast.error(err.message ?? "Failed to update gallery image.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await galleryService.delete(id);
      toast.success("Gallery item deleted successfully.");
      router.push("/admin/dashboard/gallery");
    } catch {
      toast.error("Failed to delete gallery item.");
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
            <h2 className="text-xl font-extrabold text-[#070707]">Edit Gallery Image</h2>
            <p className="text-xs text-slate-500">Update photo and title details</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setDeleteModalOpen(true)}
          className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold text-[#FE0002] hover:bg-rose-100 transition inline-flex items-center gap-1.5"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Delete</span>
        </button>
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
            label="Image File (URL or Presets)"
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
            <span>{isSubmitting ? "Updating..." : "Update & Publish"}</span>
          </button>
        </div>
      </form>

      <ConfirmDialog
        isOpen={deleteModalOpen}
        title="Delete Gallery Image"
        message="Are you sure you want to delete this media asset, including its title?"
        itemName="this image"
        onConfirm={handleDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
}
