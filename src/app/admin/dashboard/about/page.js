"use client";

import { useState, useEffect, useRef } from "react";
import { Save, Send, Trash2, Upload, ImageIcon, X, RefreshCw } from "lucide-react";
import LanguageTabs from "@/components/admin/language-tabs";
import { TextInput, TextAreaInput } from "@/components/admin/form-controls";
import { siteService } from "@/src/services";
import { useToast } from "@/src/context/ToastContext";
import ConfirmDialog from "@/components/admin/confirm-dialog";

export default function AboutMayorMessageCMSPage() {
  const toast = useToast();
  const fileInputRef = useRef(null);

  const [activeLang, setActiveLang] = useState("am");
  const [formData, setFormData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const loadMayorData = () => {
    const data = siteService.getMayorMessage();
    if (data) {
      setFormData({
        welcomeMessage:
          typeof data.welcomeMessage === "object"
            ? data.welcomeMessage
            : { om: data.welcomeMessage || "", am: "", en: "" },
        title:
          typeof data.title === "object"
            ? data.title
            : { om: data.title || "", am: "", en: "" },
        message:
          typeof data.message === "object"
            ? data.message
            : { om: data.message || "", am: "", en: "" },
        name: data.name || "Mr. Abate Asirat",
        jobTitle: data.jobTitle || "Burayu Sub city Administration",
        photo: data.photo || "/images/mr-essayas.jpg",
        status: data.status || "published",
      });
    }
  };

  useEffect(() => {
    loadMayorData();
  }, []);

  if (!formData) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
          <span>Loading Mayor Message...</span>
        </div>
      </div>
    );
  }

  const handleLocalizedFieldChange = (field, lang, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        [lang]: value,
      },
    }));
  };

  const handleSimpleFieldChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadError("Please select a valid image file (PNG, JPG, WEBP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image size exceeds 5MB limit.");
      return;
    }

    setUploadError("");
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        handleSimpleFieldChange("photo", reader.result);
      }
    };
    reader.onerror = () => {
      setUploadError("Failed to read image file.");
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (targetStatus) => {
    setIsSubmitting(true);
    try {
      const updated = siteService.updateMayorMessage({
        ...formData,
        status: targetStatus,
      });

      toast.success(
        targetStatus === "published"
          ? "Mayor Message published successfully to live site!"
          : "Mayor Message draft saved successfully."
      );
      setFormData(updated);
    } catch (err) {
      console.error("Save Mayor Message error:", err);
      toast.error("Failed to save Mayor Message.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetOrDelete = () => {
    try {
      siteService.updateMayorMessage({
        welcomeMessage: { om: "", am: "", en: "" },
        title: { om: "", am: "", en: "" },
        message: { om: "", am: "", en: "" },
        name: "",
        jobTitle: "",
        photo: "",
        status: "draft",
      });
      toast.info("Mayor Message cleared.");
      loadMayorData();
      setDeleteModalOpen(false);
    } catch {
      toast.error("Failed to clear message.");
    }
  };

  const langStatus = {
    om: !!formData.welcomeMessage?.om?.trim() || !!formData.title?.om?.trim() || !!formData.message?.om?.trim(),
    am: !!formData.welcomeMessage?.am?.trim() || !!formData.title?.am?.trim() || !!formData.message?.am?.trim(),
    en: !!formData.welcomeMessage?.en?.trim() || !!formData.title?.en?.trim() || !!formData.message?.en?.trim(),
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Outer Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">Mayor Message</h1>
          <p className="text-xs text-slate-500">
            Perform CRUD operations on the About section & Mayor/Administrator Spotlight Message
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold ${
              formData.status === "published"
                ? "bg-emerald-100 text-emerald-800"
                : "bg-amber-100 text-amber-900"
            }`}
          >
            {formData.status === "published" ? "Status: Published" : "Status: Draft"}
          </span>

          <button
            type="button"
            onClick={() => setDeleteModalOpen(true)}
            className="rounded-full border border-rose-200 bg-rose-50 px-3.5 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition inline-flex items-center gap-1.5"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear / Delete</span>
          </button>
        </div>
      </div>

      {/* Card Wrapper */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
        {/* Card Header Title */}
        <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800">Mayor Message</h2>
          <span className="text-xs font-semibold text-slate-400">
            Language: <span className="uppercase text-emerald-700 font-bold">{activeLang}</span>
          </span>
        </div>

        {/* Multilingual Tabs */}
        <LanguageTabs
          activeTab={activeLang}
          onTabChange={setActiveLang}
          status={langStatus}
        />

        {/* 2-Column Form Layout matching Screenshot */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-5">
            <TextInput
              label={`Welcome Message (${activeLang.toUpperCase()})`}
              value={formData.welcomeMessage?.[activeLang] || ""}
              onChange={(v) => handleLocalizedFieldChange("welcomeMessage", activeLang, v)}
              placeholder="Welcome Message from the Burayu Sub city Administration"
            />

            <TextAreaInput
              label={`Message (${activeLang.toUpperCase()})`}
              rows={6}
              value={formData.message?.[activeLang] || ""}
              onChange={(v) => handleLocalizedFieldChange("message", activeLang, v)}
              placeholder="As the Burayu Sub city Administration, I am excited to share our bold vision for the future of our community..."
            />

            <TextInput
              label="Job Title"
              value={formData.jobTitle || ""}
              onChange={(v) => handleSimpleFieldChange("jobTitle", v)}
              placeholder="Burayu Sub city Administration"
            />
          </div>

          {/* Right Column */}
          <div className="space-y-5">
            <TextInput
              label={`Title (${activeLang.toUpperCase()})`}
              value={formData.title?.[activeLang] || ""}
              onChange={(v) => handleLocalizedFieldChange("title", activeLang, v)}
              placeholder="A Warm Welcome to the Residents and Visitors of Burayu Sub city"
            />

            <TextInput
              label="Name"
              value={formData.name || ""}
              onChange={(v) => handleSimpleFieldChange("name", v)}
              placeholder="Mr. Abate Asirat"
            />

            {/* Photo File Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Photo</label>
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-lg border border-slate-300 bg-slate-100 hover:bg-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition shrink-0"
                >
                  Choose File
                </button>
                <span className="text-xs text-slate-500 truncate">
                  {formData.photo && !formData.photo.startsWith("data:")
                    ? formData.photo.split("/").pop()
                    : formData.photo.startsWith("data:")
                    ? "Uploaded Image File"
                    : "No file chosen"}
                </span>
              </div>
              {uploadError && <p className="text-xs text-rose-600 font-medium">{uploadError}</p>}
            </div>

            {/* Current Photo Preview */}
            <div className="space-y-1.5 pt-2">
              <label className="block text-xs font-bold text-slate-700">Current Photo</label>
              {formData.photo ? (
                <div className="relative inline-block overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-xs">
                  <img
                    src={formData.photo}
                    alt={formData.name || "Mayor Photo"}
                    className="h-32 w-32 object-cover object-top"
                  />
                  <button
                    type="button"
                    onClick={() => handleSimpleFieldChange("photo", "")}
                    className="absolute top-1 right-1 rounded-full bg-slate-900/80 p-1 text-white hover:bg-rose-600 transition"
                    title="Remove Photo"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div className="flex h-32 w-32 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-slate-400">
                  <ImageIcon className="h-8 w-8" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Save & Publish Controls */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 border-t border-slate-100 pt-6">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSave("draft")}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-slate-100 px-5 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-200 transition disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>Save Draft</span>
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSave("published")}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-slate-800 transition disabled:opacity-50"
          >
            <Send className="h-4 w-4 text-amber-400" />
            <span>{isSubmitting ? "Publishing..." : "Publish to Live Site"}</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmDialog
        isOpen={deleteModalOpen}
        title="Clear Mayor Message"
        message="Are you sure you want to clear the Mayor Message content and reset it to draft status?"
        itemName={formData?.name || "Mayor Message"}
        onConfirm={handleResetOrDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
}
