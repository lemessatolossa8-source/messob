"use client";

import { useState, useEffect, useCallback } from "react";
import { statisticService } from "@/src/services/statisticService";
import { useToast } from "@/src/context/ToastContext";
import { getLocalizedText } from "@/src/i18n";
import { Edit2, Eye, EyeOff, Save, Trash2, Plus, X } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { TextInput, TextAreaInput } from "@/components/admin/FormControls";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { invalidateCacheAndNotify } from "@/src/services/api";
import { translateSingleText } from "@/src/lib/autoTranslate";

const DEFAULT_SEED_STATS = [
  { type: "employees", titleEn: "Employees", titleAm: "ሰራተኞች", titleOm: "Hojjattoota", value: "150+", icon: "Users", order: 1 },
  { type: "services", titleEn: "Services", titleAm: "አገልግሎቶች", titleOm: "Tajaajiloota", value: "35+", icon: "BriefcaseBusiness", order: 2 },
  { type: "departments", titleEn: "Departments", titleAm: "መምሪያዎች", titleOm: "Kutaalee", value: "12", icon: "Building2", order: 3 },
  { type: "daily", titleEn: "Daily Served Citizens", titleAm: "በየቀኑ የሚስተናገዱ ዜጎች", titleOm: "Lammiilee Guyyaatti Tajaajilaman", value: "1,200+", icon: "UserCheck", order: 4 },
];

export default function AdminStatisticsListPage() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState(null); // null, 'create', 'edit'
  const [activeItem, setActiveItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const [formData, setFormData] = useState({
    value: "",
    icon: "BarChart2",
    order: 0,
    status: "published",
    title: { en: "", am: "", om: "" },
    description: { en: "", am: "", om: "" },
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await statisticService.getAll({ limit: 100, status: "all" });
      const currentItems = res.items || [];

      // Sort by order ascending, then ID ascending
      const sorted = [...currentItems].sort((a, b) => {
        const orderDiff = (Number(a.order) || 0) - (Number(b.order) || 0);
        if (orderDiff !== 0) return orderDiff;
        return (Number(a.id || a._id) || 0) - (Number(b.id || b._id) || 0);
      });

      setStats(sorted);
    } catch (err) {
      toast.error("Failed to load statistics: " + (err?.message || "Server error"));
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleTogglePublish = async (item) => {
    try {
      const isPublished = item.status === "published" || item.is_published;
      const newStatus = isPublished ? "draft" : "published";
      const itemId = item.id || item._id;

      // Use PUT to update status in place
      await statisticService.update(itemId, { status: newStatus });
      invalidateCacheAndNotify();

      toast.success(
        newStatus === "published"
          ? "Statistic published to public website!"
          : "Statistic hidden from public website."
      );
      loadData();
    } catch (err) {
      toast.error("Failed to update status: " + (err?.message || "Server error"));
    }
  };

  const openCreateModal = () => {
    setFormData({
      value: "",
      icon: "BarChart2",
      order: stats.length + 1,
      status: "published",
      title: { en: "", am: "", om: "" },
      description: { en: "", am: "", om: "" },
    });
    setActiveItem(null);
    setModalMode("create");
  };

  const openEditModal = (item) => {
    setFormData({
      value: item.value || "",
      icon: item.icon || "BarChart2",
      order: item.order !== undefined ? item.order : 0,
      status: item.status || "published",
      title: {
        en: item.title?.en || "",
        am: item.title?.am || "",
        om: item.title?.om || "",
      },
      description: {
        en: item.description?.en || "",
        am: item.description?.am || "",
        om: item.description?.om || "",
      },
    });
    setActiveItem(item);
    setModalMode("edit");
  };

  const closeModal = () => {
    setModalMode(null);
    setActiveItem(null);
  };

  const handleFieldChange = (field, subfield, value) => {
    if (subfield) {
      setFormData((prev) => ({
        ...prev,
        [field]: {
          ...prev[field],
          [subfield]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Auto-translate missing fields between languages before saving
      const updatedFormData = { ...formData };
      for (const field of ["title", "description"]) {
        const obj = updatedFormData[field];
        if (obj) {
          const filled = ["om", "am", "en"].find((l) => obj[l] && String(obj[l]).trim() !== "");
          if (filled) {
            const missing = ["om", "am", "en"].filter((l) => !obj[l] || String(obj[l]).trim() === "");
            if (missing.length > 0) {
              const trans = await translateSingleText(obj[filled], missing, filled);
              missing.forEach((ml) => {
                if (trans[ml]) obj[ml] = trans[ml];
              });
            }
          }
        }
      }

      const payload = {
        ...updatedFormData,
        order: parseInt(updatedFormData.order, 10) || 0,
      };

      const itemId = activeItem?.id || activeItem?._id;
      if (modalMode === "edit" && itemId) {
        // Update existing record using PUT /api/statistics/:id
        await statisticService.update(itemId, payload);
        toast.success("Statistic updated successfully!");
      } else {
        // Create new record using POST /api/statistics
        await statisticService.create(payload);
        toast.success("New statistic created successfully!");
      }

      invalidateCacheAndNotify();
      closeModal();
      loadData();
    } catch (err) {
      console.error("Save statistic error:", err);
      toast.error("Failed to save: " + (err?.message || "Server error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;
    try {
      const itemId = deletingItem.id || deletingItem._id;
      await statisticService.delete(itemId);
      invalidateCacheAndNotify();
      toast.success("Statistic deleted successfully!");
      setDeletingItem(null);
      loadData();
    } catch (err) {
      console.error("Delete statistic error:", err);
      toast.error("Failed to delete: " + (err?.message || "Server error"));
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#070707]">Portal Statistics</h2>
          <p className="text-xs text-slate-500 font-medium">
            Manage the key public indicators shown on the municipal homepage and public metrics page
          </p>
        </div>
        <div>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-xl bg-[#FE0002] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#CC0002] transition cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Statistic</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#FE0002] border-r-transparent"></div>
        </div>
      ) : stats.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="text-sm font-semibold text-slate-500">No statistics found.</p>
          <button
            type="button"
            onClick={openCreateModal}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#FE0002] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#CC0002] transition"
          >
            <Plus className="h-4 w-4" />
            <span>Add Your First Statistic</span>
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => {
            const Icon = LucideIcons[item.icon] || LucideIcons.BarChart2;
            const isPublished = item.status === "published" || item.is_published;

            return (
              <div
                key={item.id}
                className="relative flex flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md hover:border-[#FE0002]/60 group"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-[#FE0002] rounded-t-3xl opacity-0 transition group-hover:opacity-100" />

                <div className="flex items-start justify-between">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-colors ${
                      isPublished
                        ? "bg-[#070707] text-white group-hover:bg-[#FE0002]"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleTogglePublish(item)}
                    className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition cursor-pointer ${
                      isPublished
                        ? "bg-[#070707] text-white border border-[#070707]"
                        : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-300"
                    }`}
                  >
                    {isPublished ? (
                      <>
                        <Eye className="h-3 w-3" /> Enabled
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-3 w-3" /> Disabled
                      </>
                    )}
                  </button>
                </div>

                <div className="mt-5 flex-1">
                  <div className="flex items-baseline justify-between">
                    <h3 className="text-3xl font-black text-[#070707] group-hover:text-[#FE0002] transition-colors">
                      {item.value}
                    </h3>
                    <span className="text-[10px] font-bold text-slate-400">Order #{item.order || 0}</span>
                  </div>
                  <p className="mt-1 font-bold text-[#070707]">
                    {getLocalizedText(item.title, "en") ||
                      getLocalizedText(item.title, "om") ||
                      getLocalizedText(item.title, "am")}
                  </p>
                  {item.description && (
                    <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                      {getLocalizedText(item.description, "en") ||
                        getLocalizedText(item.description, "om") ||
                        getLocalizedText(item.description, "am")}
                    </p>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(item)}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-slate-50 py-2.5 text-xs font-bold text-[#070707] transition hover:bg-slate-100 hover:text-[#FE0002] cursor-pointer"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingItem(item)}
                    className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:border-rose-200 hover:bg-rose-50 hover:text-[#FE0002] transition cursor-pointer"
                    title="Delete Statistic"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-3xl my-8 relative overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
              <h3 className="text-xl font-black text-[#070707] flex items-center gap-2">
                {modalMode === "edit" ? (
                  <>
                    <Edit2 className="h-5 w-5 text-[#FE0002]" />
                    <span>Edit {formData.title.en || "Statistic"}</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-5 w-5 text-[#FE0002]" />
                    <span>Add New Statistic</span>
                  </>
                )}
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="p-2 text-slate-400 hover:bg-slate-100 hover:text-[#070707] rounded-full transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              <form id="statistic-form" onSubmit={handleSave} className="space-y-8">
                {/* General Settings */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
                  <h4 className="text-sm font-bold text-[#070707] uppercase tracking-wider">
                    General Properties
                  </h4>
                  <div className="grid gap-5 sm:grid-cols-3">
                    <TextInput
                      label="Number / Value"
                      required={true}
                      value={formData.value}
                      onChange={(v) => handleFieldChange("value", null, v)}
                      placeholder="e.g. 150+ or 1,200"
                    />
                    <TextInput
                      label="Icon (Lucide)"
                      required={true}
                      value={formData.icon}
                      onChange={(v) => handleFieldChange("icon", null, v)}
                      placeholder="e.g. Users, Building2, UserCheck"
                    />
                    <TextInput
                      label="Display Order"
                      type="number"
                      value={formData.order}
                      onChange={(v) => handleFieldChange("order", null, v)}
                      placeholder="1"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-bold text-[#070707]">Status</label>
                    <select
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-[#070707] outline-none transition focus:border-[#FE0002] focus:ring-4 focus:ring-rose-50"
                      value={formData.status}
                      onChange={(e) => handleFieldChange("status", null, e.target.value)}
                    >
                      <option value="published">Enabled (Published on site)</option>
                      <option value="draft">Disabled (Hidden in draft)</option>
                    </select>
                  </div>
                </div>

                {/* Multilingual Titles */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
                    Multilingual Titles (All 3 Languages Supported)
                  </h4>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <TextInput
                      label="Afaan Oromoo"
                      value={formData.title.om}
                      onChange={(v) => handleFieldChange("title", "om", v)}
                      placeholder="e.g. Hojjattoota"
                    />
                    <TextInput
                      label="አማርኛ"
                      value={formData.title.am}
                      onChange={(v) => handleFieldChange("title", "am", v)}
                      placeholder="e.g. ሰራተኞች"
                    />
                    <TextInput
                      label="English"
                      value={formData.title.en}
                      onChange={(v) => handleFieldChange("title", "en", v)}
                      placeholder="e.g. Employees"
                    />
                  </div>
                </div>

                {/* Multilingual Descriptions */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
                    Multilingual Descriptions
                  </h4>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <TextAreaInput
                      label="Afaan Oromoo"
                      value={formData.description.om}
                      onChange={(v) => handleFieldChange("description", "om", v)}
                      placeholder="Ibsa gabaabaa..."
                      rows={3}
                    />
                    <TextAreaInput
                      label="አማርኛ"
                      value={formData.description.am}
                      onChange={(v) => handleFieldChange("description", "am", v)}
                      placeholder="አጭር መግለጫ..."
                      rows={3}
                    />
                    <TextAreaInput
                      label="English"
                      value={formData.description.en}
                      onChange={(v) => handleFieldChange("description", "en", v)}
                      placeholder="Brief description..."
                      rows={3}
                    />
                  </div>
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={closeModal}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-[#070707] bg-white border border-slate-200 hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="statistic-form"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-[#FE0002] hover:bg-[#CC0002] transition shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent"></div>
                ) : (
                  <Save className="h-4 w-4" />
                )}
                <span>{modalMode === "edit" ? "Save Changes" : "Create Statistic"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      <ConfirmDialog
        isOpen={!!deletingItem}
        title="Delete Statistic"
        message="Are you sure you want to delete this statistic? It will be permanently removed from the database and public website."
        itemName={
          deletingItem
            ? `${getLocalizedText(deletingItem.title, "en") || getLocalizedText(deletingItem.title, "om") || "Statistic"} (${deletingItem.value})`
            : ""
        }
        confirmLabel="Delete Permanently"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingItem(null)}
      />
    </div>
  );
}
