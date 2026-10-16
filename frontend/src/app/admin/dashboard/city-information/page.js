"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Save, Send, Sparkles, UserCheck } from "lucide-react";
import LanguageTabs from "@/components/admin/LanguageTabs";
import { TextInput, TextAreaInput } from "@/components/admin/FormControls";
import { siteService } from "@/src/services";
import { useToast } from "@/src/context/ToastContext";
import { autoTranslateForm } from "@/src/lib/autoTranslate";

export default function CityInformationCMSPage() {
  const toast = useToast();
  const [activeLang, setActiveLang] = useState("om");
  const [formData, setFormData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    const info = siteService.getCityInfo();
    if (info) {
      setFormData(info);
    }
  }, []);

  if (!formData) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
          <span>Loading city information...</span>
        </div>
      </div>
    );
  }

  const handleFieldChange = (field, lang, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        [lang]: value,
      },
    }));
  };

  const handleSave = (targetStatus) => {
    setIsSubmitting(true);
    try {
      siteService.updateCityInfo({
        ...formData,
        status: targetStatus,
      });

      toast.success(
        targetStatus === "published"
          ? "City information published successfully to the live portal!"
          : "City information draft saved."
      );
    } catch {
      toast.error("Failed to save city information.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#070707]">City Information CMS</h2>
          <p className="text-xs text-slate-500">
            Manage official city background, mission, vision, and strategic objectives in all three languages
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/dashboard/about"
            className="rounded-full border border-amber-400/40 bg-amber-50 px-3.5 py-1 text-xs font-bold text-amber-900 hover:bg-amber-100 transition inline-flex items-center gap-1.5"
          >
            <UserCheck className="h-3.5 w-3.5 text-amber-600" />
            <span>Mayor Message CMS</span>
          </Link>

          <span
            className={`rounded-full px-3 py-1 text-xs font-bold ${
              formData.status === "published"
                ? "bg-emerald-100 text-emerald-800"
                : "bg-amber-100 text-amber-900"
            }`}
          >
            {formData.status === "published" ? "Status: Published" : "Status: Draft"}
          </span>
        </div>
      </div>

      <form className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <LanguageTabs
          title="City Information Details"
          activeTab={activeLang}
          onTabChange={async (newLang) => {
            if (activeLang !== newLang) {
              await autoTranslateForm(formData, setFormData, activeLang, newLang, toast, setIsTranslating);
              setActiveLang(newLang);
            }
          }}
        />

        <div className="space-y-5">
          <TextAreaInput
            label={`About Burayu MESOB`}
            rows={4}
            value={formData.about?.[activeLang] || ""}
            onChange={(v) => handleFieldChange("about", activeLang, v)}
            placeholder="Official description of the city administration and purpose..."
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <TextAreaInput
              label={`Mission Statement`}
              rows={3}
              value={formData.mission?.[activeLang] || ""}
              onChange={(v) => handleFieldChange("mission", activeLang, v)}
              placeholder="Core civic mission..."
            />

            <TextAreaInput
              label={`Vision Statement`}
              rows={3}
              value={formData.vision?.[activeLang] || ""}
              onChange={(v) => handleFieldChange("vision", activeLang, v)}
              placeholder="Long-term civic vision..."
            />
          </div>

          <TextAreaInput
            label={`Core Objectives`}
            rows={3}
            value={formData.objectives?.[activeLang] || ""}
            onChange={(v) => handleFieldChange("objectives", activeLang, v)}
            placeholder="Strategic goals and civic initiatives..."
          />

          <TextAreaInput
            label={`General City Information`}
            rows={3}
            value={formData.generalInfo?.[activeLang] || ""}
            onChange={(v) => handleFieldChange("generalInfo", activeLang, v)}
            placeholder="Geographic, economic, and logistical facts..."
          />
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 border-t border-slate-100 pt-6">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSave("draft")}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-slate-100 px-5 py-2.5 text-xs font-bold text-[#070707] hover:bg-slate-200 transition disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>Save Draft</span>
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSave("published")}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#FE0002] px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#CC0002] transition disabled:opacity-50"
          >
            <Send className="h-4 w-4 text-white" />
            <span>{isSubmitting ? "Publishing..." : "Publish to Website"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
