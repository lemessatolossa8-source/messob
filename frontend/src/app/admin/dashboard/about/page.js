"use client";

import { useState, useEffect, useRef } from "react";
import { Save, Send, Trash2, ImageIcon, X } from "lucide-react";
import { TextInput, TextAreaInput } from "@/components/admin/FormControls";
import LanguageTabs from "@/components/admin/LanguageTabs";
import { settingService } from "@/src/services/settingService";
import { useToast } from "@/src/context/ToastContext";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { DEFAULT_SITE_SETTINGS } from "@/src/data/defaultSiteSettings";
import { invalidateCacheAndNotify } from "@/src/services/api";
import { storageStore } from "@/src/services/storageStore";

export default function AboutMayorMessageCMSPage() {
  const toast = useToast();
  const fileInputRef = useRef(null);

  const [activeLang, setActiveLang] = useState("om");
  const [formData, setFormData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const loadMayorData = async () => {
    try {
      const data = await settingService.getAll();
      const msg = data?.mayorMessage || DEFAULT_SITE_SETTINGS.mayorMessage;
      
      const commonPhoto = msg.photo || msg.om?.photo || msg.am?.photo || msg.en?.photo || "";
      const normalizedPhoto = commonPhoto === "/images/burayu-mesob-logo.png" ? "" : commonPhoto;

      const normalizedMsg = {
        status: msg.status || "published",
        photo: normalizedPhoto,
        om: {
          name: msg.om?.name || "",
          jobTitle: msg.om?.jobTitle || "",
          photo: normalizedPhoto,
          welcomeMessage: msg.om?.welcomeMessage || "",
          title: msg.om?.title || "",
          message: msg.om?.message || "",
        },
        am: {
          name: msg.am?.name || "",
          jobTitle: msg.am?.jobTitle || "",
          photo: normalizedPhoto,
          welcomeMessage: msg.am?.welcomeMessage || "",
          title: msg.am?.title || "",
          message: msg.am?.message || "",
        },
        en: {
          name: msg.en?.name || "",
          jobTitle: msg.en?.jobTitle || "",
          photo: normalizedPhoto,
          welcomeMessage: msg.en?.welcomeMessage || "",
          title: msg.en?.title || "",
          message: msg.en?.message || "",
        },
      };

      setFormData(normalizedMsg);
    } catch (err) {
      console.error("Failed to load mayor message:", err);
      toast.error("Failed to load settings from server.");
    }
  };

  useEffect(() => {
    loadMayorData();
  }, []);

  if (!formData) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#FE0002] border-t-transparent" />
          <span>Loading Mayor Message...</span>
        </div>
      </div>
    );
  }

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [activeLang]: {
        ...prev[activeLang],
        [field]: value,
      },
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
    setSelectedFile(file);

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleRemovePhoto = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setFormData((prev) => ({
      ...prev,
      photo: "",
      om: { ...prev.om, photo: "" },
      am: { ...prev.am, photo: "" },
      en: { ...prev.en, photo: "" },
    }));
  };

  const handleSave = async (targetStatus) => {
    setIsSubmitting(true);
    setUploadError("");
    try {
      let finalPhotoUrl = formData?.photo || formData?.om?.photo || formData?.am?.photo || formData?.en?.photo || "";

      if (selectedFile) {
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("mesob_token") || localStorage.getItem("token")
            : null;
        const uploadData = new FormData();
        uploadData.append("file", selectedFile);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: uploadData,
        });
        
        const uploadResult = await uploadRes.json();

        if (!uploadRes.ok || !uploadResult.success) {
          setUploadError(uploadResult.message || "Image upload failed.");
          setIsSubmitting(false);
          return;
        }

        finalPhotoUrl = uploadResult.url;
      }

      const payload = {
        mayorMessage: {
          ...formData,
          photo: finalPhotoUrl,
          status: targetStatus,
          om: { ...formData.om, photo: finalPhotoUrl },
          am: { ...formData.am, photo: finalPhotoUrl },
          en: { ...formData.en, photo: finalPhotoUrl },
        },
      };

      const updated = await settingService.update(payload);
      invalidateCacheAndNotify();
      if (updated?.data?.mayorMessage) {
        storageStore.updateSingle("mayorMessage", updated.data.mayorMessage);
        setFormData(updated.data.mayorMessage);
      }

      toast.success(
        targetStatus === "published"
          ? "Mayor Message published successfully to live site!"
          : "Mayor Message draft saved successfully."
      );

      setSelectedFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      console.error("Save Mayor Message error:", err);
      toast.error(err?.message || "Failed to save Mayor Message.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetOrDelete = async () => {
    try {
      const clearedData = {
        status: "draft",
        photo: "",
        om: { name: "", jobTitle: "", photo: "", welcomeMessage: "", title: "", message: "" },
        am: { name: "", jobTitle: "", photo: "", welcomeMessage: "", title: "", message: "" },
        en: { name: "", jobTitle: "", photo: "", welcomeMessage: "", title: "", message: "" },
      };
      const updated = await settingService.update({ mayorMessage: clearedData });
      invalidateCacheAndNotify();
      storageStore.updateSingle("mayorMessage", clearedData);
      toast.info("Mayor Message cleared and set to draft.");
      setFormData(clearedData);
      setSelectedFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setDeleteModalOpen(false);
    } catch (err) {
      console.error("Clear Mayor Message error:", err);
      toast.error(err?.message || "Failed to clear message.");
    }
  };

  const currentPhotoSrc = previewUrl || formData?.photo || formData?.om?.photo || formData?.am?.photo || formData?.en?.photo || "";

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Outer Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#070707] tracking-tight">Mayor Message</h1>
          <p className="text-xs text-slate-500">
            Official message and public profile of the Mayor and City Administrator.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border ${
              formData.status === "published"
                ? "bg-[#070707] text-white border-[#070707]"
                : "bg-white text-slate-600 border-slate-300"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                formData.status === "published" ? "bg-[#FE0002]" : "bg-slate-400"
              }`}
            />
            {formData.status === "published" ? "Published" : "Draft"}
          </span>

          <button
            type="button"
            onClick={() => setDeleteModalOpen(true)}
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:border-[#FE0002] hover:text-[#FE0002] transition inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear / Reset</span>
          </button>
        </div>
      </div>

      {/* Card Wrapper */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
        {/* Language Tabs Control */}
        <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-[#070707]">Content Language</h2>
            <p className="text-xs text-slate-500">Edit spotlight information for each supported official language</p>
          </div>
          <LanguageTabs activeTab={activeLang} onTabChange={setActiveLang} />
        </div>

        {/* 2-Column Form Layout matching Screenshot */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-5">
            <TextInput
              label="Welcome Message"
              value={formData[activeLang]?.welcomeMessage || ""}
              onChange={(v) => handleFieldChange("welcomeMessage", v)}
              placeholder="Welcome Message from the Burayu MESOB"
            />

            <TextAreaInput
              label="Message"
              rows={6}
              value={formData[activeLang]?.message || ""}
              onChange={(v) => handleFieldChange("message", v)}
              placeholder="As the Burayu MESOB, I am excited to share our bold vision for the future of our community..."
            />

            <TextInput
              label="Job Title"
              value={formData[activeLang]?.jobTitle || ""}
              onChange={(v) => handleFieldChange("jobTitle", v)}
              placeholder="Burayu MESOB"
            />
          </div>

          {/* Right Column */}
          <div className="space-y-5">
            <TextInput
              label="Title"
              value={formData[activeLang]?.title || ""}
              onChange={(v) => handleFieldChange("title", v)}
              placeholder="A Warm Welcome to the Residents and Visitors of Burayu MESOB"
            />

            <TextInput
              label="Mayor Name"
              value={formData[activeLang]?.name || ""}
              onChange={(v) => handleFieldChange("name", v)}
              placeholder="Mr. Abate Asirat"
            />

            {/* Photo File Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#070707]">Photo</label>
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
                  className="rounded-lg border border-slate-300 bg-slate-100 hover:bg-slate-200 px-4 py-2 text-xs font-semibold text-[#070707] transition shrink-0"
                >
                  Choose File
                </button>
                <span className="text-xs text-slate-500 truncate">
                  {selectedFile 
                    ? selectedFile.name 
                    : currentPhotoSrc && !currentPhotoSrc.startsWith("data:")
                    ? currentPhotoSrc.split("/").pop()
                    : "No file chosen"}
                </span>
              </div>
              {uploadError && <p className="text-xs text-[#FE0002] font-medium">{uploadError}</p>}
            </div>

            {/* Current Photo Preview */}
            <div className="space-y-1.5 pt-2">
              <label className="block text-xs font-bold text-[#070707]">Current Photo</label>
              {currentPhotoSrc ? (
                <div className="relative inline-block overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-xs">
                  <img
                    src={currentPhotoSrc}
                    alt={formData[activeLang]?.name || "Mayor Photo"}
                    className="h-32 w-32 object-cover object-top"
                  />
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="absolute top-1 right-1 rounded-full bg-[#070707]/80 p-1 text-white hover:bg-[#FE0002] transition cursor-pointer"
                    title="Remove Photo"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col h-32 w-32 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-slate-400">
                  <ImageIcon className="h-8 w-8 mb-1" />
                  <span className="text-[10px] font-medium">No photo selected</span>
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
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-[#070707] hover:bg-slate-50 transition disabled:opacity-50 cursor-pointer"
          >
            <Save className="h-4 w-4" />
            <span>Save Draft</span>
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSave("published")}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#FE0002] px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#CC0002] transition disabled:opacity-50 cursor-pointer"
          >
            <Send className="h-4 w-4 text-white" />
            <span>{isSubmitting ? "Saving Changes..." : "Save Changes"}</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmDialog
        isOpen={deleteModalOpen}
        title="Clear Mayor Message"
        message="Are you sure you want to clear the Mayor Message content and reset it to draft status?"
        itemName={formData[activeLang]?.name || "Mayor Message"}
        onConfirm={handleResetOrDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
}
