"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import {
  Layers,
  Plus,
  Edit3,
  Trash2,
  ExternalLink,
  Search,
  Upload,
  Image as ImageIcon,
  X,
  AlertCircle,
  Save,
  CheckCircle2,
} from "lucide-react";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import LanguageTabs from "@/components/admin/LanguageTabs";
import { floorService } from "@/src/services";
import { useToast } from "@/src/context/ToastContext";

const SUPPORTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const SUPPORTED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

// Helper to extract display string from string or multilingual object
const getDisplayString = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    return value.om || value.en || value.am || Object.values(value)[0] || "";
  }
  return String(value);
};

// Helper to normalize multilingual fields into { en, om, am }
const parseLangObj = (val) => {
  if (!val) return { en: "", om: "", am: "" };
  if (typeof val === "object") {
    return {
      en: val.en || "",
      om: val.om || "",
      am: val.am || "",
    };
  }
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      if (parsed && typeof parsed === "object") {
        return {
          en: parsed.en || "",
          om: parsed.om || "",
          am: parsed.am || "",
        };
      }
    } catch {}
    return { en: val, om: val, am: val };
  }
  return { en: String(val), om: String(val), am: String(val) };
};

export default function AdminFloorManagementPage() {
  const [floors, setFloors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State (Add / Edit)
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFloor, setEditingFloor] = useState(null);
  const [activeFormLang, setActiveFormLang] = useState("om"); // "om" | "en" | "am"
  const [floorNames, setFloorNames] = useState({ en: "", om: "", am: "" });
  const [descriptions, setDescriptions] = useState({ en: "", om: "", am: "" });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [existingImage, setExistingImage] = useState("");
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef(null);

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const toast = useToast();

  const loadData = async () => {
    try {
      const data = await floorService.getAll({ status: "all" });
      setFloors(data || []);
    } catch (err) {
      console.error("Failed to load floors:", err);
      toast.error("Failed to load floor records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const data = await floorService.getAll({ status: "all" });
        if (isMounted) setFloors(data || []);
      } catch (err) {
        console.error("Failed to load floors:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    const unsub = floorService.subscribe(() => {
      if (isMounted) {
        loadData();
      }
    });
    return () => {
      isMounted = false;
      unsub();
    };
  }, []);

  // Filtered floors based on search query
  const filteredFloors = useMemo(() => {
    if (!searchQuery.trim()) return floors;
    const q = searchQuery.toLowerCase();
    return floors.filter((f) => {
      const name = getDisplayString(f.name).toLowerCase();
      const desc = getDisplayString(f.description).toLowerCase();
      return name.includes(q) || desc.includes(q);
    });
  }, [floors, searchQuery]);

  // Open Create Modal
  const openCreateModal = () => {
    setEditingFloor(null);
    setActiveFormLang("om");
    setFloorNames({ en: "", om: "", am: "" });
    setDescriptions({ en: "", om: "", am: "" });
    setImageFile(null);
    setImagePreview("");
    setExistingImage("");
    setErrors({});
    setModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (floor) => {
    setEditingFloor(floor);
    setActiveFormLang("om");
    setFloorNames(parseLangObj(floor.name));
    setDescriptions(parseLangObj(floor.description));
    setImageFile(null);
    setImagePreview(floor.image || "");
    setExistingImage(floor.image || "");
    setErrors({});
    setModalOpen(true);
  };

  // Handle image file selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check extension & MIME type
    const fileExt = "." + file.name.split(".").pop().toLowerCase();
    const isValidFormat =
      SUPPORTED_EXTENSIONS.includes(fileExt) ||
      SUPPORTED_IMAGE_TYPES.includes(file.type);

    if (!isValidFormat) {
      setErrors((prev) => ({
        ...prev,
        image: "Only JPG, PNG, and WebP image formats are supported.",
      }));
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setErrors((prev) => {
      const copy = { ...prev };
      delete copy.image;
      return copy;
    });

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const errs = {};
    const primaryName = (
      floorNames[activeFormLang] ||
      floorNames.en ||
      floorNames.om ||
      floorNames.am ||
      ""
    ).trim();
    const primaryDesc = (
      descriptions[activeFormLang] ||
      descriptions.en ||
      descriptions.om ||
      descriptions.am ||
      ""
    ).trim();

    if (!primaryName) {
      errs.floorName = "Floor Name is required.";
    }
    if (!primaryDesc) {
      errs.description = "Description is required.";
    }
    if (!editingFloor && !imageFile && !existingImage) {
      errs.image = "Floor Image is required. Please upload a JPG, PNG, or WebP image.";
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setIsSaving(true);
    setErrors({});

    try {
      // Build multilingual payload with smart defaults
      const enName = (floorNames.en || primaryName).trim();
      const omDefaultName = enName === "Floor 1" ? "Darbii 1" : enName === "Floor 2" ? "Darbii 2" : primaryName;
      const amDefaultName = enName === "Floor 1" ? "ፎቅ 1" : enName === "Floor 2" ? "ፎቅ 2" : primaryName;

      const dataPayload = {
        name: {
          en: enName,
          om: (floorNames.om || omDefaultName).trim(),
          am: (floorNames.am || amDefaultName).trim(),
        },
        description: {
          en: (descriptions.en || primaryDesc).trim(),
          om: (descriptions.om || primaryDesc).trim(),
          am: (descriptions.am || primaryDesc).trim(),
        },
      };

      if (editingFloor) {
        if (!imageFile && existingImage) {
          dataPayload.existingImage = existingImage;
        }
        await floorService.update(editingFloor.id, dataPayload, imageFile);
        toast.success("Floor updated successfully!");
      } else {
        await floorService.create(dataPayload, imageFile);
        toast.success("Floor created successfully!");
      }

      setModalOpen(false);
      await loadData();
    } catch (err) {
      console.error("Save floor error:", err);
      toast.error(err.message || "Failed to save floor. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await floorService.delete(deleteTarget.id);
      toast.success("Floor deleted successfully.");
      setDeleteTarget(null);
      await loadData();
    } catch (err) {
      console.error("Delete floor error:", err);
      toast.error(err.message || "Failed to delete floor.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#FE0002]">
            <Layers className="h-4 w-4" />
            <span>Burayu MESOB Floors</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#070707] tracking-tight mt-1">
            Floor Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Manage building floor records, services descriptions, and floor imagery in one simple section.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/services"
            target="_blank"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-[#070707] hover:border-[#FE0002] hover:text-[#FE0002] transition shadow-xs"
          >
            <ExternalLink className="h-4 w-4" />
            <span>View Public Site</span>
          </Link>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-xl bg-[#FE0002] hover:bg-[#CC0002] px-5 py-2.5 text-xs font-bold text-white shadow-xs transition active:scale-[0.98] cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Floor</span>
          </button>
        </div>
      </div>

      {/* Search and Counts Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by floor name or description..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2 text-xs text-[#070707] placeholder-slate-400 focus:bg-white focus:border-[#FE0002] focus:outline-none transition"
          />
        </div>

        <div className="text-xs font-semibold text-slate-500 px-1">
          Showing <span className="font-bold text-[#070707]">{filteredFloors.length}</span>{" "}
          {filteredFloors.length === 1 ? "floor record" : "floor records"}
        </div>
      </div>

      {/* Floor Records List */}
      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-xs">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#FE0002] border-t-transparent" />
            <span>Loading floor records...</span>
          </div>
        </div>
      ) : filteredFloors.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-500 space-y-3 shadow-xs">
          <Layers className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="text-base font-bold text-[#070707]">No floor records found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {searchQuery
              ? `No floor matched "${searchQuery}". Try a different keyword.`
              : "No floors have been created yet. Click 'Add Floor' to create the first one."}
          </p>
          {!searchQuery && (
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 rounded-xl bg-[#FE0002] hover:bg-[#CC0002] px-4 py-2 text-xs font-bold text-white shadow-xs transition"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create First Floor</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredFloors.map((floor) => {
            const name = getDisplayString(floor.name);
            const desc = getDisplayString(floor.description);

            return (
              <div
                key={floor.id}
                className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition-all duration-300 hover:border-[#FE0002]/40 hover:shadow-md group"
              >
                {/* Floor Image Container */}
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100 border-b border-slate-100">
                  {floor.image ? (
                    <img
                      src={floor.image}
                      alt={name || "Floor Image"}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-400">
                      <ImageIcon className="h-10 w-10 text-slate-300" />
                    </div>
                  )}

                  <div className="absolute top-3 left-3 rounded-full bg-black/80 backdrop-blur text-white font-bold text-[10px] px-3 py-1 shadow-sm border border-white/10 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#FE0002]" />
                    <span>{name || "Floor"}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col p-5 sm:p-6 justify-between gap-4">
                  <div className="space-y-2">
                    <h3 className="text-base font-bold text-[#070707] group-hover:text-[#FE0002] transition">
                      {name || "Untitled Floor"}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-4 leading-relaxed font-normal whitespace-pre-line">
                      {desc || "No description provided."}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
                    <button
                      type="button"
                      onClick={() => openEditModal(floor)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:border-[#FE0002] hover:text-[#FE0002] transition shadow-2xs cursor-pointer"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteTarget(floor)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:border-[#FE0002] hover:text-[#FE0002] transition shadow-2xs cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal — ONLY 3 FIELDS: Floor Name, Description, Floor Image */}
      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
        >
          <div className="relative w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-150 my-8">
            <button
              type="button"
              onClick={() => !isSaving && setModalOpen(false)}
              disabled={isSaving}
              className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-[#070707] transition cursor-pointer"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Modal Header */}
            <div className="border-b border-slate-100 pb-4 pr-8">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FE0002] mb-1">
                <Layers className="h-3.5 w-3.5" />
                <span>{editingFloor ? "Edit Floor" : "New Floor"}</span>
              </div>
              <h2 className="text-xl font-black text-[#070707]">
                {editingFloor ? "Update Floor Record" : "Add Floor Record"}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Enter the floor name, description, and upload a floor image.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-5 space-y-5">
              {/* Language Selection Dropdown */}
              <LanguageTabs
                activeTab={activeFormLang}
                onTabChange={setActiveFormLang}
                title="Floor Information"
                label="Editing Language"
              />

              {/* Field 1: Floor Name for selected language */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#070707]">
                    Floor Name <span className="text-[#FE0002]">*</span>
                  </label>
                  <span className="text-[11px] font-medium text-slate-400">
                    {activeFormLang === "om"
                      ? "Darbii 1, Darbii 2..."
                      : activeFormLang === "am"
                      ? "ፎቅ 1፣ ፎቅ 2..."
                      : "Floor 1, Floor 2..."}
                  </span>
                </div>
                <input
                  type="text"
                  value={floorNames[activeFormLang] || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFloorNames((prev) => ({
                      ...prev,
                      [activeFormLang]: val,
                    }));
                    if (errors.floorName) {
                      setErrors((prev) => {
                        const copy = { ...prev };
                        delete copy.floorName;
                        return copy;
                      });
                    }
                  }}
                  placeholder="e.g. Floor 1"
                  className={`w-full rounded-xl border bg-white px-4 py-2.5 text-xs text-[#070707] placeholder-slate-400 shadow-2xs transition focus:outline-none ${
                    errors.floorName
                      ? "border-rose-400 focus:border-rose-500 bg-rose-50/20"
                      : "border-slate-200 focus:border-[#FE0002]"
                  }`}
                />
                {errors.floorName && (
                  <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 shrink-0" />
                    <span>{errors.floorName}</span>
                  </p>
                )}
              </div>

              {/* Field 2: Description for selected language */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#070707]">
                  Description <span className="text-[#FE0002]">*</span>
                </label>
                <textarea
                  rows={4}
                  value={descriptions[activeFormLang] || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    setDescriptions((prev) => ({
                      ...prev,
                      [activeFormLang]: val,
                    }));
                    if (errors.description) {
                      setErrors((prev) => {
                        const copy = { ...prev };
                        delete copy.description;
                        return copy;
                      });
                    }
                  }}
                  placeholder="Describe this floor and the services available on it..."
                  className={`w-full rounded-xl border bg-white px-4 py-2.5 text-xs text-[#070707] placeholder-slate-400 shadow-2xs transition focus:outline-none ${
                    errors.description
                      ? "border-rose-400 focus:border-rose-500 bg-rose-50/20"
                      : "border-slate-200 focus:border-[#FE0002]"
                  }`}
                />
                {errors.description && (
                  <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 shrink-0" />
                    <span>{errors.description}</span>
                  </p>
                )}
              </div>

              {/* Field 3: Floor Image */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#070707]">
                  Floor Image {!editingFloor && <span className="text-[#FE0002]">*</span>}
                </label>

                {/* Image Preview & Upload Box */}
                {imagePreview ? (
                  <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-xs">
                    <img
                      src={imagePreview}
                      alt="Floor Preview"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition duration-200">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-bold text-[#070707] shadow-lg hover:bg-slate-50 transition cursor-pointer"
                      >
                        <Upload className="h-3.5 w-3.5 text-[#FE0002]" />
                        <span>Replace Image</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition ${
                      errors.image
                        ? "border-rose-300 bg-rose-50/30 hover:bg-rose-50/50"
                        : "border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-500 mb-2">
                      <Upload className="h-5 w-5" />
                    </div>
                    <p className="text-xs font-bold text-[#070707]">
                      Click to upload floor image
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Supported formats: JPG, PNG, and WebP
                    </p>
                  </div>
                )}

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {imagePreview && (
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span className="flex items-center gap-1 text-[#070707] font-semibold">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#FE0002]" />
                      {imageFile ? "New image selected" : "Current image active"}
                    </span>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs font-bold text-[#FE0002] hover:underline cursor-pointer"
                    >
                      Choose different image
                    </button>
                  </div>
                )}

                {errors.image && (
                  <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 shrink-0" />
                    <span>{errors.image}</span>
                  </p>
                )}
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={isSaving}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FE0002] hover:bg-[#CC0002] px-6 py-2.5 text-xs font-bold text-white shadow-xs transition disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-3.5 w-3.5" />
                      <span>{editingFloor ? "Update Floor" : "Save Floor"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Deletion Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Floor"
        message="Are you sure you want to delete this floor record? This action cannot be undone."
        itemName={deleteTarget ? getDisplayString(deleteTarget.name) : ""}
        confirmLabel="Delete Floor"
        onConfirm={handleConfirmDelete}
        onCancel={() => !isDeleting && setDeleteTarget(null)}
        isProcessing={isDeleting}
      />
    </div>
  );
}
