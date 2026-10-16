"use client";

import { useState, useEffect, useCallback } from "react";
import { statisticService } from "@/src/services/statisticService";
import { useToast } from "@/src/context/ToastContext";
import { getLocalizedText } from "@/src/i18n";
import { Edit2, Eye, EyeOff, Save, X } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { TextInput, TextAreaInput } from "@/components/admin/FormControls";

const REQUIRED_STATS = [
  { type: "employees", titleEn: "Employees", titleAm: "ሰራተኞች", titleOm: "Hojjattoota", value: "150+", icon: "Users", order: 1 },
  { type: "services", titleEn: "Services", titleAm: "አገልግሎቶች", titleOm: "Tajaajiloota", value: "35+", icon: "BriefcaseBusiness", order: 2 },
  { type: "departments", titleEn: "Departments", titleAm: "መምሪያዎች", titleOm: "Kutaalee", value: "12", icon: "Building2", order: 3 },
  { type: "daily", titleEn: "Daily Served Citizens", titleAm: "በየቀኑ የሚስተናገዱ ዜጎች", titleOm: "Lammiilee Guyyaatti Tajaajilaman", value: "1,200+", icon: "UserCheck", order: 4 },
];

export default function AdminStatisticsListPage() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const [formData, setFormData] = useState({
    value: "",
    icon: "",
    status: "published",
    title: { en: "", am: "", om: "" },
    description: { en: "", am: "", om: "" },
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await statisticService.getAll({ limit: 100, status: "all" });
      let currentItems = res.items || [];
      
      let missingCreated = false;
      for (const req of REQUIRED_STATS) {
        const exists = currentItems.find(
          (item) => item.type === req.type || item.title?.en === req.titleEn
        );
        if (!exists) {
          await statisticService.create({
            title: { en: req.titleEn, am: req.titleAm, om: req.titleOm },
            description: { en: "", am: "", om: "" },
            value: req.value,
            icon: req.icon,
            order: req.order,
            status: "published",
            type: req.type
          });
          missingCreated = true;
        } else if (!exists.type) {
           await statisticService.update(exists.id, { type: req.type });
           missingCreated = true;
        }
      }

      if (missingCreated) {
        const newRes = await statisticService.getAll({ limit: 100, status: "all" });
        currentItems = newRes.items || [];
      }
      
      const finalStats = REQUIRED_STATS.map(req => {
        return currentItems.find(item => item.type === req.type) || null;
      }).filter(Boolean);

      setStats(finalStats);
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
      if (item.status === "published" || item.is_published) {
        await statisticService.unpublish(item.id);
        toast.info("Statistic disabled and hidden from homepage.");
      } else {
        await statisticService.publish(item.id);
        toast.success("Statistic published successfully!");
      }
      loadData();
    } catch (err) {
      toast.error("Failed to update status: " + (err?.message || "Server error"));
    }
  };

  const openEditModal = (item) => {
    setFormData({
      value: item.value || "",
      icon: item.icon || "",
      status: item.status || "published",
      title: { 
        en: item.title?.en || "", 
        am: item.title?.am || "", 
        om: item.title?.om || "" 
      },
      description: { 
        en: item.description?.en || "", 
        am: item.description?.am || "", 
        om: item.description?.om || "" 
      }
    });
    setEditingItem(item);
  };

  const closeEditModal = () => {
    setEditingItem(null);
  };

  const handleFieldChange = (field, subfield, value) => {
    if (subfield) {
      setFormData(prev => ({
        ...prev,
        [field]: {
          ...prev[field],
          [subfield]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editingItem) return;
    
    setIsSubmitting(true);
    try {
      await statisticService.update(editingItem.id, {
        ...formData,
        order: editingItem.order, // preserve order
        type: editingItem.type,   // preserve type
      });
      
      toast.success("Statistic updated successfully!");
      closeEditModal();
      loadData(); // Re-fetch to update the dashboard and homepage
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Failed to save changes: " + (err?.message || "Server error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 relative">
      <div>
        <h2 className="text-2xl font-black text-[#070707] tracking-tight">MESOB STATISTICS</h2>
        <p className="text-sm text-slate-500 font-medium">Manage the core statistics shown on the public homepage</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#FE0002] border-r-transparent"></div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => {
            const Icon = LucideIcons[item.icon] || LucideIcons.BarChart2;
            const isPublished = item.status === "published" || item.is_published;

            return (
              <div key={item.id} className="relative flex flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md hover:border-[#FE0002]/60 group">
                <div className="absolute top-0 left-0 right-0 h-1 bg-[#FE0002] rounded-t-3xl opacity-0 transition group-hover:opacity-100" />
                
                <div className="flex items-start justify-between">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-colors ${isPublished ? 'bg-[#070707] text-white group-hover:bg-[#FE0002]' : 'bg-slate-100 text-slate-400'}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <button
                    onClick={() => handleTogglePublish(item)}
                    className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition ${
                      isPublished 
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    {isPublished ? (
                      <><Eye className="h-3 w-3" /> Enabled</>
                    ) : (
                      <><EyeOff className="h-3 w-3" /> Disabled</>
                    )}
                  </button>
                </div>

                <div className="mt-5 flex-1">
                  <h3 className="text-3xl font-black text-[#070707] group-hover:text-[#FE0002] transition-colors">{item.value}</h3>
                  <p className="mt-1 font-bold text-[#070707]">{getLocalizedText(item.title, "en") || getLocalizedText(item.title, "om")}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => openEditModal(item)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-50 py-2.5 text-sm font-bold text-[#070707] transition hover:bg-slate-100 hover:text-[#FE0002]"
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* EDIT MODAL */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-3xl my-8 relative overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
              <h3 className="text-xl font-black text-[#070707] flex items-center gap-2">
                <Edit2 className="h-5 w-5 text-[#FE0002]" />
                Edit {formData.title.en || 'Statistic'}
              </h3>
              <button 
                onClick={closeEditModal}
                className="p-2 text-slate-400 hover:bg-slate-100 hover:text-[#070707] rounded-full transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              <form id="edit-statistic-form" onSubmit={handleSave} className="space-y-8">
                
                {/* General Settings */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
                  <h4 className="text-sm font-bold text-[#070707] uppercase tracking-wider">General</h4>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <TextInput
                      label="Number/value"
                      required={true}
                      value={formData.value}
                      onChange={(v) => handleFieldChange("value", null, v)}
                      placeholder="e.g. 150+"
                    />
                    <TextInput
                      label="Icon (Lucide)"
                      required={true}
                      value={formData.icon}
                      onChange={(v) => handleFieldChange("icon", null, v)}
                      placeholder="e.g. Users"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-bold text-[#070707]">Status</label>
                    <select
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-[#070707] outline-none transition focus:border-[#FE0002] focus:ring-4 focus:ring-rose-50"
                      value={formData.status}
                      onChange={(e) => handleFieldChange("status", null, e.target.value)}
                    >
                      <option value="published">Enabled (Published)</option>
                      <option value="draft">Disabled (Hidden)</option>
                    </select>
                  </div>
                </div>

                {/* Titles */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-[#070707] uppercase tracking-wider border-b border-slate-100 pb-2">Titles</h4>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <TextInput
                      label="Title OM (Oromo)"
                      value={formData.title.om}
                      onChange={(v) => handleFieldChange("title", "om", v)}
                    />
                    <TextInput
                      label="Title AM (Amharic)"
                      value={formData.title.am}
                      onChange={(v) => handleFieldChange("title", "am", v)}
                    />
                    <TextInput
                      label="Title EN (English)"
                      value={formData.title.en}
                      onChange={(v) => handleFieldChange("title", "en", v)}
                    />
                  </div>
                </div>

                {/* Descriptions */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-[#070707] uppercase tracking-wider border-b border-slate-100 pb-2">Descriptions</h4>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <TextAreaInput
                      label="Description OM"
                      value={formData.description.om}
                      onChange={(v) => handleFieldChange("description", "om", v)}
                      rows={3}
                    />
                    <TextAreaInput
                      label="Description AM"
                      value={formData.description.am}
                      onChange={(v) => handleFieldChange("description", "am", v)}
                      rows={3}
                    />
                    <TextAreaInput
                      label="Description EN"
                      value={formData.description.en}
                      onChange={(v) => handleFieldChange("description", "en", v)}
                      rows={3}
                    />
                  </div>
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={closeEditModal}
                className="px-6 py-2.5 rounded-full text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition"
              >
                CANCEL
              </button>
              <button
                type="submit"
                form="edit-statistic-form"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold text-white bg-[#FE0002] hover:bg-[#CC0002] transition shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent"></div>
                ) : (
                  <Save className="h-4 w-4" />
                )}
                SAVE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
