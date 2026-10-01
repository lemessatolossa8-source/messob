"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Send, Trash2, Sparkles, ArrowRight, ExternalLink } from "lucide-react";
import LanguageTabs from "@/components/admin/language-tabs";
import { TextInput, TextAreaInput, ImagePickerInput, SelectInput } from "@/components/admin/form-controls";
import ConfirmDialog from "@/components/admin/confirm-dialog";
import { slideService } from "@/src/services";
import { useToast } from "@/src/context/ToastContext";

export default function EditSlideImagePage() {
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
      toast.error("No slide ID provided.");
      router.push("/admin/dashboard/slide-image");
      return;
    }
    const item = slideService.getById(id);
    if (item) {
      setFormData({
        welcomeMessage: typeof item.welcomeMessage === "object" ? item.welcomeMessage : { om: item.welcomeMessage || "", am: "", en: "" },
        title: typeof item.title === "object" ? item.title : { om: item.title, am: "", en: "" },
        message: typeof item.message === "object" ? item.message : { om: item.message || item.description || "", am: "", en: "" },
        primaryBtnText: typeof item.primaryBtnText === "object" ? item.primaryBtnText : { om: item.primaryBtnText || "Tajaajiloota Ilaali", am: "አገልግሎቶችን ይመልከቱ", en: "Explore Services" },
        primaryBtnLink: item.primaryBtnLink || "/services",
        secondaryBtnText: typeof item.secondaryBtnText === "object" ? item.secondaryBtnText : { om: item.secondaryBtnText || "Tajaajila E-Service", am: "የኢ-አገልግሎት መግቢያ", en: "Access E-Service" },
        secondaryBtnLink: item.secondaryBtnLink || "https://eservice.shaggarcity.et/",
        image: item.image || "",
        order: item.order || 1,
        status: item.status || "published",
      });
    } else {
      toast.error("Slide image not found.");
      router.push("/admin/dashboard/slide-image");
    }
  }, [id, router, toast]);

  if (!formData) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
          <span>Loading slide image data...</span>
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
    const hasAnyTitle = !!(formData.title.om?.trim() || formData.title.am?.trim() || formData.title.en?.trim());
    if (!hasAnyTitle) {
      newErrors.title_om = "Please enter a slide headline in at least one language.";
    }
    if (!formData.image || !formData.image.trim()) {
      newErrors.image = "Please upload or provide a slide image URL.";
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
      toast.error("Please fill in required fields.");
      return;
    }

    try {
      const primaryTitle = formData.title.om?.trim() || formData.title.en?.trim() || formData.title.am?.trim();
      const primaryWelcome = formData.welcomeMessage.om?.trim() || formData.welcomeMessage.en?.trim() || formData.welcomeMessage.am?.trim() || "Official Portal";
      const primaryMessage = formData.message.om?.trim() || formData.message.en?.trim() || formData.message.am?.trim() || "";

      const finalTitle = {
        om: formData.title.om?.trim() || primaryTitle,
        am: formData.title.am?.trim() || primaryTitle,
        en: formData.title.en?.trim() || primaryTitle,
      };

      const finalWelcome = {
        om: formData.welcomeMessage.om?.trim() || primaryWelcome,
        am: formData.welcomeMessage.am?.trim() || primaryWelcome,
        en: formData.welcomeMessage.en?.trim() || primaryWelcome,
      };

      const finalMessage = {
        om: formData.message.om?.trim() || primaryMessage,
        am: formData.message.am?.trim() || primaryMessage,
        en: formData.message.en?.trim() || primaryMessage,
      };

      slideService.update(id, {
        ...formData,
        title: finalTitle,
        welcomeMessage: finalWelcome,
        message: finalMessage,
        status: targetStatus,
        order: Number(formData.order) || 1,
      });

      toast.success(
        targetStatus === "published"
          ? "Slide image updated and published to homepage!"
          : "Slide image saved as draft."
      );
      router.push("/admin/dashboard/slide-image");
    } catch (err) {
      console.error("Update slide error:", err);
      toast.error("Failed to update slide image.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    try {
      slideService.delete(id);
      toast.success("Slide image deleted from carousel.");
      router.push("/admin/dashboard/slide-image");
    } catch {
      toast.error("Failed to delete slide image.");
    }
  };

  const langStatus = {
    om: !!formData.title.om?.trim(),
    am: !!formData.title.am?.trim(),
    en: !!formData.title.en?.trim(),
  };

  const currentTitle = formData.title[activeLang] || formData.title.en || formData.title.om || "Slide Title Preview";
  const currentWelcome = formData.welcomeMessage[activeLang] || formData.welcomeMessage.en || "Welcome Message";
  const currentMessage = formData.message[activeLang] || formData.message.en || "Slide description will appear here...";

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header & Back Link */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/dashboard/slide-image"
            className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 transition"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Edit Slide Image</h2>
            <p className="text-xs text-slate-500">
              Update hero carousel slide text, welcome badge, buttons, and animations
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setDeleteModalOpen(true)}
          className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition inline-flex items-center gap-1.5"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Delete Slide</span>
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Main Form (8 Cols) */}
        <div className="lg:col-span-8">
          <form className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
            {/* Language Tabs */}
            <LanguageTabs
              activeTab={activeLang}
              onTabChange={setActiveLang}
              status={langStatus}
              errors={{ om: errors.title_om }}
            />

            {/* Form Fields matching user layout */}
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <TextInput
                  label={`Welcome Message (${activeLang.toUpperCase()})`}
                  value={formData.welcomeMessage[activeLang]}
                  onChange={(v) => handleFieldChange("welcomeMessage", activeLang, v)}
                  placeholder="e.g. Welcome Message from the Burayu Sub city Administration"
                />

                <TextInput
                  label={`Slide Title / Headline (${activeLang.toUpperCase()})`}
                  required={activeLang === "om"}
                  value={formData.title[activeLang]}
                  onChange={(v) => handleFieldChange("title", activeLang, v)}
                  error={errors[`title_${activeLang}`]}
                  placeholder="e.g. A Warm Welcome to the Residents and Visitors of Burayu"
                />
              </div>

              <TextAreaInput
                label={`Message / Body Content (${activeLang.toUpperCase()})`}
                rows={4}
                value={formData.message[activeLang]}
                onChange={(v) => handleFieldChange("message", activeLang, v)}
                placeholder="Enter slide description or administrator greeting text..."
              />
            </div>

            {/* Buttons & Links */}
            <div className="border-t border-slate-100 pt-6 space-y-5">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Action Buttons & Links
              </h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <TextInput
                    label={`Primary Button Text (${activeLang.toUpperCase()})`}
                    value={formData.primaryBtnText[activeLang]}
                    onChange={(v) => handleFieldChange("primaryBtnText", activeLang, v)}
                    placeholder="e.g. Explore Services"
                  />
                  <TextInput
                    label="Primary Button URL Link"
                    value={formData.primaryBtnLink}
                    onChange={(v) => handleFieldChange("primaryBtnLink", null, v)}
                    placeholder="/services"
                  />
                </div>

                <div className="space-y-2">
                  <TextInput
                    label={`Secondary Button Text (${activeLang.toUpperCase()})`}
                    value={formData.secondaryBtnText[activeLang]}
                    onChange={(v) => handleFieldChange("secondaryBtnText", activeLang, v)}
                    placeholder="e.g. Access E-Service"
                  />
                  <TextInput
                    label="Secondary Button URL Link"
                    value={formData.secondaryBtnLink}
                    onChange={(v) => handleFieldChange("secondaryBtnLink", null, v)}
                    placeholder="https://eservice.shaggarcity.et/"
                  />
                </div>
              </div>
            </div>

            {/* Media & Slide Order Settings */}
            <div className="border-t border-slate-100 pt-6 space-y-5">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Photo & Slide Order Settings
              </h3>

              <ImagePickerInput
                label="Photo / Background Slide Image"
                value={formData.image}
                onChange={(v) => handleFieldChange("image", null, v)}
                error={errors.image}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <TextInput
                  label="Display Order (Sequence in Carousel)"
                  type="number"
                  value={formData.order}
                  onChange={(v) => handleFieldChange("order", null, v)}
                  placeholder="1"
                />

                <SelectInput
                  label="Publish Status"
                  value={formData.status}
                  onChange={(v) => handleFieldChange("status", null, v)}
                  options={[
                    { value: "published", label: "Published (Live on Home Page)" },
                    { value: "draft", label: "Draft (Hidden from Public)" },
                  ]}
                />
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 border-t border-slate-100 pt-6">
              <Link
                href="/admin/dashboard/slide-image"
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
                <span>{isSubmitting ? "Updating..." : "Update & Publish"}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Live Preview Column (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="sticky top-6">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2">
              Live Homepage Preview
            </h3>

            <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 text-white shadow-xl min-h-[360px] flex flex-col justify-between p-6">
              {/* Slide background photo */}
              <div className="absolute inset-0 z-0">
                <img
                  src={formData.image || "https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80"}
                  alt="Slide preview"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/40" />
              </div>

              {/* Preview Content */}
              <div className="relative z-10 space-y-4">
                {currentWelcome && (
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-950/80 px-3 py-1 text-[10px] font-bold text-emerald-300">
                    <Sparkles className="h-3 w-3 text-amber-400" />
                    <span className="truncate max-w-[200px]">{currentWelcome}</span>
                  </div>
                )}

                <h4 className="text-lg font-black tracking-tight leading-snug">
                  {currentTitle}
                </h4>

                <p className="text-xs text-slate-200 line-clamp-3 leading-relaxed">
                  {currentMessage}
                </p>
              </div>

              {/* Preview Action Buttons */}
              <div className="relative z-10 pt-4 flex flex-wrap gap-2">
                {formData.primaryBtnText[activeLang] && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3.5 py-1.5 text-[11px] font-bold text-white shadow-md">
                    <span>{formData.primaryBtnText[activeLang]}</span>
                    <ArrowRight className="h-3 w-3" />
                  </span>
                )}
                {formData.secondaryBtnText[activeLang] && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-[11px] font-bold text-white">
                    <span>{formData.secondaryBtnText[activeLang]}</span>
                    <ExternalLink className="h-3 w-3" />
                  </span>
                )}
              </div>
            </div>
            <p className="mt-2 text-center text-[10px] text-slate-400">
              Live preview reflecting active edits
            </p>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={deleteModalOpen}
        title="Delete Slide Image"
        message="Are you sure you want to delete this slide from the homepage carousel?"
        itemName={formData?.title?.om || formData?.title?.en || ""}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
}
