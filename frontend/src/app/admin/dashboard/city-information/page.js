"use client";

import { useState, useEffect } from "react";
import { Save, Sparkles } from "lucide-react";
import { TextAreaInput } from "@/components/admin/FormControls";
import LanguageTabs from "@/components/admin/LanguageTabs";
import { siteService } from "@/src/services";
import settingService from "@/src/services/settingService";
import { DEFAULT_SITE_SETTINGS } from "@/src/data/defaultSiteSettings";
import { useToast } from "@/src/context/ToastContext";

const LANGUAGES = [
  { code: "om", label: "Afaan Oromo" },
  { code: "en", label: "English" },
  { code: "am", label: "አማርኛ" },
];

const FIELDS = ["about", "mission", "vision", "objectives", "generalInfo"];

function normalizeCityInfo(raw) {
  const fallback = DEFAULT_SITE_SETTINGS.cityInfo || {};
  return {
    status: raw?.status || fallback.status || "published",
    lastUpdated: raw?.lastUpdated || fallback.lastUpdated || new Date().toISOString().split("T")[0],
    about: {
      om: raw?.about?.om ?? fallback.about?.om ?? "",
      en: raw?.about?.en ?? fallback.about?.en ?? "",
      am: raw?.about?.am ?? fallback.about?.am ?? "",
    },
    mission: {
      om: raw?.mission?.om ?? fallback.mission?.om ?? "",
      en: raw?.mission?.en ?? fallback.mission?.en ?? "",
      am: raw?.mission?.am ?? fallback.mission?.am ?? "",
    },
    vision: {
      om: raw?.vision?.om ?? fallback.vision?.om ?? "",
      en: raw?.vision?.en ?? fallback.vision?.en ?? "",
      am: raw?.vision?.am ?? fallback.vision?.am ?? "",
    },
    objectives: {
      om: raw?.objectives?.om ?? fallback.objectives?.om ?? "",
      en: raw?.objectives?.en ?? fallback.objectives?.en ?? "",
      am: raw?.objectives?.am ?? fallback.objectives?.am ?? "",
    },
    generalInfo: {
      om: raw?.generalInfo?.om ?? fallback.generalInfo?.om ?? "",
      en: raw?.generalInfo?.en ?? fallback.generalInfo?.en ?? "",
      am: raw?.generalInfo?.am ?? fallback.generalInfo?.am ?? "",
    },
  };
}

export default function CityInformationCMSPage() {
  const toast = useToast();
  const [activeLang, setActiveLang] = useState("om");
  const [formData, setFormData] = useState(null);
  const [initialData, setInitialData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const settings = await settingService.getAll();
        if (settings?.cityInfo && typeof settings.cityInfo === "object") {
          const normalized = normalizeCityInfo(settings.cityInfo);
          setFormData(normalized);
          setInitialData(normalized);
          return;
        }
      } catch (err) {
        console.warn("Could not load city information from backend API, using local fallback:", err);
      }
      const local = siteService.getCityInfo();
      const normalized = normalizeCityInfo(local);
      setFormData(normalized);
      setInitialData(normalized);
    }
    loadData();
  }, []);

  if (!formData) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#FE0002] border-t-transparent" />
          <span>Loading city information...</span>
        </div>
      </div>
    );
  }

  const currentLangObj = LANGUAGES.find((l) => l.code === activeLang) || LANGUAGES[0];

  const handleFieldChange = (field, lang, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        [lang]: value,
      },
    }));
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        status: "published",
        lastUpdated: new Date().toISOString().split("T")[0],
      };

      const res = await settingService.update({ cityInfo: payload });
      await siteService.updateCityInfo(payload);

      const updated = res?.data?.cityInfo ? normalizeCityInfo(res.data.cityInfo) : payload;
      setFormData(updated);
      setInitialData(updated);

      toast.success("City information saved successfully!");
    } catch (err) {
      console.error("Save City Information error:", err);
      toast.error("Failed to save city information. Please check connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (initialData) {
      setFormData(JSON.parse(JSON.stringify(initialData)));
      toast.info("Unsaved changes discarded.");
    }
  };

  const handleAutoTranslateMissing = async () => {
    const emptyFields = FIELDS.filter(
      (f) => !formData[f]?.[activeLang] || formData[f][activeLang].trim() === ""
    );

    if (emptyFields.length === 0) {
      toast.info(`All fields in ${currentLangObj.label} already have text.`);
      return;
    }

    const sourceCandidate = LANGUAGES.find(
      (l) => l.code !== activeLang && emptyFields.some((f) => formData[f]?.[l.code]?.trim())
    );

    if (!sourceCandidate) {
      toast.error("Please enter content in at least one other language first.");
      return;
    }

    setIsTranslating(true);
    toast.info(`Translating missing fields to ${currentLangObj.label}...`);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("mesob_token") || localStorage.getItem("token") || "" : "";
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

      let translatedCount = 0;
      const updates = {};

      for (const field of emptyFields) {
        const sourceText = formData[field]?.[sourceCandidate.code] || "";
        if (!sourceText.trim()) continue;

        try {
          const res = await fetch(`${apiUrl}/translate`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({
              text: sourceText,
              sourceLang: sourceCandidate.code,
              targetLangs: [activeLang],
            }),
          });

          const data = await res.json();
          if (data.success && data.translations?.[activeLang]) {
            updates[field] = data.translations[activeLang];
            translatedCount++;
          }
        } catch (fieldErr) {
          console.warn(`Translation failed for field ${field}:`, fieldErr.message);
        }
      }

      if (translatedCount > 0) {
        setFormData((prev) => {
          const next = { ...prev };
          for (const [field, text] of Object.entries(updates)) {
            next[field] = {
              ...next[field],
              [activeLang]: text,
            };
          }
          return next;
        });
        toast.success(`Populated ${translatedCount} missing field(s) in ${currentLangObj.label}. Please review before saving.`);
      } else {
        toast.warn("Auto-translation service is temporarily unavailable. You can type translations manually.");
      }
    } catch (err) {
      console.error("Auto-translate error:", err);
      toast.error("Translation failed. You can enter translations manually.");
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Header: Title & Auto-fill */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-xl font-extrabold text-[#070707] tracking-tight">
          City Information Details
        </h1>

        <button
          type="button"
          disabled={isTranslating}
          onClick={handleAutoTranslateMissing}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-[#070707] hover:border-[#FE0002] hover:text-[#FE0002] transition disabled:opacity-50 shadow-xs cursor-pointer self-start sm:self-auto"
          title="Auto-fill empty fields using existing translations"
        >
          <Sparkles className="h-3.5 w-3.5 text-[#FE0002]" />
          <span>{isTranslating ? "Translating..." : "Auto-fill Content"}</span>
        </button>
      </div>

      {/* Clean Form Card with Compact Dropdown Language Selector */}
      <form
        onSubmit={handleSave}
        className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xs"
      >
        <LanguageTabs
          activeTab={activeLang}
          onTabChange={setActiveLang}
          title="City Information Details"
          label="Editing Language"
        />

        <div className="space-y-5">
          <TextAreaInput
            label="About Burayu MESOB"
            rows={4}
            value={formData.about?.[activeLang] || ""}
            onChange={(v) => handleFieldChange("about", activeLang, v)}
            placeholder="Enter official description..."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <TextAreaInput
              label="Mission Statement"
              rows={3}
              value={formData.mission?.[activeLang] || ""}
              onChange={(v) => handleFieldChange("mission", activeLang, v)}
              placeholder="Enter mission..."
            />

            <TextAreaInput
              label="Vision Statement"
              rows={3}
              value={formData.vision?.[activeLang] || ""}
              onChange={(v) => handleFieldChange("vision", activeLang, v)}
              placeholder="Enter vision..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <TextAreaInput
              label="Core Objectives"
              rows={3}
              value={formData.objectives?.[activeLang] || ""}
              onChange={(v) => handleFieldChange("objectives", activeLang, v)}
              placeholder="Enter objectives..."
            />

            <TextAreaInput
              label="General City Information"
              rows={3}
              value={formData.generalInfo?.[activeLang] || ""}
              onChange={(v) => handleFieldChange("generalInfo", activeLang, v)}
              placeholder="Enter general information..."
            />
          </div>
        </div>

        {/* Action Controls: Cancel & Save Changes */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 border-t border-slate-100 pt-5">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleCancel}
            className="w-full sm:w-auto rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-[#070707] hover:bg-slate-50 transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#FE0002] px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#CC0002] transition disabled:opacity-50 cursor-pointer"
          >
            <Save className="h-4 w-4" />
            <span>{isSubmitting ? "Saving..." : "Save Changes"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
