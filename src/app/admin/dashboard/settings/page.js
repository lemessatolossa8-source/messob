"use client";

import { useState } from "react";
import { Settings, Shield, Globe2, Bell, CheckCircle2, RotateCcw, Trash2 } from "lucide-react";
import { useLanguage } from "@/src/context/LanguageContext";
import { useToast } from "@/src/context/ToastContext";
import { storageStore } from "@/src/services/storageStore";

export default function AdminSettingsPage() {
  const { language, setLanguage, languages } = useLanguage();
  const toast = useToast();

  const [settings, setSettings] = useState({
    defaultLanguage: "om",
    enableNotifications: true,
    requireFullTranslations: true,
    maintenanceMode: false,
  });

  const handleResetData = () => {
    if (confirm("Reset all interactive mock data back to factory defaults?")) {
      if (typeof window !== "undefined") {
        Object.keys(localStorage).forEach((k) => {
          if (k.startsWith("mesob_store_")) localStorage.removeItem(k);
        });
      }
      toast.success("Mock store reset to initial sample records. Reloading...");
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  const handleClearAllMockData = () => {
    if (confirm("Permanently remove all mock data records (news, announcements, gallery, services, etc.) and start with clean empty collections?")) {
      storageStore.clearAll();
      toast.success("All mock data has been removed. Store is now empty.");
      setTimeout(() => window.location.reload(), 800);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    toast.success("Administrative preferences saved successfully.");
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900">Portal & CMS Settings</h2>
        <p className="text-xs text-slate-500">Configure editorial rules, default language, and system parameters</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <div className="space-y-4">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
            Language & Editorial Policy
          </h3>

          <div className="rounded-2xl border border-slate-200 p-4 space-y-3 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-900">Active Admin Language</p>
                <p className="text-[11px] text-slate-500">Change your active administrative interface language</p>
              </div>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-800"
              >
                {languages.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.flag} {l.nativeName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 p-4 space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.requireFullTranslations}
                onChange={(e) => setSettings({ ...settings, requireFullTranslations: e.target.checked })}
                className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <div>
                <p className="text-xs font-bold text-slate-900">Enforce Multilingual Translation Validation</p>
                <p className="text-[11px] text-slate-500">
                  Require news, announcements, and notices to have completed Afaan Oromoo, Amharic, and English headlines before publication.
                </p>
              </div>
            </label>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6 space-y-4">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
            Phase I Frontend Prototype Tools
          </h3>

          <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-amber-950">Reset Interactive Mock Data</p>
              <p className="text-[11px] text-amber-800">
                Clear browser modifications and restore sample municipal articles and infrastructure projects.
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetData}
              className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-white px-4 py-2 text-xs font-bold text-amber-900 hover:bg-amber-100 transition shrink-0"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset to Defaults</span>
            </button>
          </div>

          <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-rose-950">Remove All Mock Data</p>
              <p className="text-[11px] text-rose-800">
                Clear all sample records across news, announcements, gallery, and services to start with a clean empty database.
              </p>
            </div>
            <button
              type="button"
              onClick={handleClearAllMockData}
              className="inline-flex items-center gap-1.5 rounded-full border border-rose-300 bg-white px-4 py-2 text-xs font-bold text-rose-900 hover:bg-rose-100 transition shrink-0"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Remove All Mock Data</span>
            </button>
          </div>
        </div>

        <div className="flex justify-end border-t border-slate-100 pt-6">
          <button
            type="submit"
            className="rounded-full bg-slate-950 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-slate-800 transition"
          >
            Save Preferences
          </button>
        </div>
      </form>
    </div>
  );
}
