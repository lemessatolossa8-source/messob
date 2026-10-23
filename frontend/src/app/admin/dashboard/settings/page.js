"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Settings, Globe2, Bell, Mail, Phone, MapPin, 
  Building2, Clock, CheckCircle2, Save, RefreshCw,
  Shield, FileText, Image, Link, Calendar
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/context/ToastContext";
import settingService from "@/services/settingService";
import {
  DEFAULT_SITE_SETTINGS,
  mergeSiteSettings,
  validateSiteSettings,
} from "@/data/defaultSiteSettings";

export default function AdminSettingsPage() {
  const { languages } = useLanguage();
  const toast = useToast();

  const [settings, setSettings] = useState(DEFAULT_SITE_SETTINGS);
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await settingService.getAll();
      setSettings(mergeSiteSettings(DEFAULT_SITE_SETTINGS, data));
    } catch (error) {
      console.error("Failed to load settings:", error);
      toast.error(error.message || "Failed to load settings. Using defaults.");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Load settings from backend on mount
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError("");

    const errors = validateSiteSettings(settings);
    if (errors.length > 0) {
      setFormError(errors[0]);
      toast.error(errors[0]);
      return;
    }

    try {
      setSaving(true);
      const result = await settingService.update(settings);
      if (!result?.success) {
        throw new Error(result?.message || "Failed to save settings");
      }
      const updatedData = mergeSiteSettings(DEFAULT_SITE_SETTINGS, result.data || settings);
      setSettings(updatedData);
      setFormError("");
      toast.success("Settings saved successfully");
    } catch (error) {
      console.error("Failed to save settings:", error);
      const message = error.message || "Failed to save settings";
      setFormError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (confirm("Reset all settings to default values? This will reload the page.")) {
      try {
        const result = await settingService.reset();
        if (!result?.success) {
          throw new Error(result?.message || "Failed to reset settings");
        }
        toast.success("Settings reset successfully. Reloading...");
        setTimeout(() => window.location.reload(), 1000);
      } catch (error) {
        console.error("Failed to reset settings:", error);
        toast.error(error.message || "Failed to reset settings");
      }
    }
  };

  const updateSetting = (path, value) => {
    setSettings(prev => {
      const keys = path.split('.');
      const updated = { ...prev };
      let current = updated;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return updated;
    });
  };

  const tabs = [
    { id: "general", label: "General", icon: Settings },
    { id: "contact", label: "Contact", icon: Phone },
    { id: "social", label: "Social Media", icon: Link },
    { id: "language", label: "Language", icon: Globe2 },
    { id: "content", label: "Content", icon: FileText },
    { id: "seo", label: "SEO", icon: Shield },
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h2 className="text-xl font-extrabold text-[#070707]">Website Settings</h2>
        <p className="text-xs text-slate-500">Configure site information, contact details, and system parameters</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-[#FE0002] text-[#FE0002]"
                    : "border-transparent text-slate-600 hover:text-[#070707]"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {loading && (
        <p className="text-xs font-bold text-slate-500">Loading settings from database...</p>
      )}
      {formError && (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold text-[#FE0002]">
          {formError}
        </p>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* General Settings */}
        {activeTab === "general" && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
            <h3 className="text-sm font-extrabold text-[#070707]">Site Information</h3>
            
            {/* Site Name */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-[#070707]">Site Name</label>
              {languages.map((lang) => (
                <div key={lang.code} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-500 w-28 shrink-0">{lang.label}:</span>
                  <input
                    type="text"
                    value={settings.siteName?.[lang.code] || ""}
                    onChange={(e) => updateSetting(`siteName.${lang.code}`, e.target.value)}
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-[#070707]"
                  />
                </div>
              ))}
            </div>

            {/* Site Tagline */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-[#070707]">Site Tagline</label>
              {languages.map((lang) => (
                <div key={lang.code} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-500 w-28 shrink-0">{lang.label}:</span>
                  <input
                    type="text"
                    value={settings.siteTagline?.[lang.code] || ""}
                    onChange={(e) => updateSetting(`siteTagline.${lang.code}`, e.target.value)}
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-[#070707]"
                  />
                </div>
              ))}
            </div>

            {/* E-Service Settings */}
            <div className="border-t border-slate-100 pt-6 space-y-4">
              <h4 className="text-xs font-extrabold text-[#070707]">E-Service Configuration</h4>
              
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.eService.enabled}
                  onChange={(e) => updateSetting('eService.enabled', e.target.checked)}
                  className="rounded border-slate-300 text-[#FE0002] focus:ring-[#FE0002]"
                />
                <span className="text-xs font-bold text-[#070707]">Enable E-Service</span>
              </label>

              {/* E-Land */}
              <div className="rounded-xl border border-slate-200 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#070707]">E-Land</label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.eService.eLand.enabled}
                      onChange={(e) => updateSetting('eService.eLand.enabled', e.target.checked)}
                      className="rounded border-slate-300 text-[#FE0002] focus:ring-[#FE0002]"
                    />
                    <span className="text-xs text-slate-600">Enabled</span>
                  </label>
                </div>
                <input
                  type="url"
                  value={settings.eService.eLand.url}
                  onChange={(e) => updateSetting('eService.eLand.url', e.target.value)}
                  placeholder="https://eland.shaggarcity.et/"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-[#070707]"
                />
              </div>

              {/* E-Conference */}
              <div className="rounded-xl border border-slate-200 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#070707]">E-Conference</label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.eService.eConference.enabled}
                      onChange={(e) => updateSetting('eService.eConference.enabled', e.target.checked)}
                      className="rounded border-slate-300 text-[#FE0002] focus:ring-[#FE0002]"
                    />
                    <span className="text-xs text-slate-600">Enabled</span>
                  </label>
                </div>
                <input
                  type="url"
                  value={settings.eService.eConference.url}
                  onChange={(e) => updateSetting('eService.eConference.url', e.target.value)}
                  placeholder="https://econference.shaggarcity.et/"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-[#070707]"
                />
              </div>

              {/* E-Library */}
              <div className="rounded-xl border border-slate-200 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-[#070707]">E-Library</label>
                    {settings.eService.eLibrary.comingSoon && (
                      <span className="rounded-full bg-slate-100 border border-slate-300 px-2 py-0.5 text-[10px] font-bold text-[#070707]">
                        Coming Soon
                      </span>
                    )}
                  </div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.eService.eLibrary.enabled}
                      onChange={(e) => updateSetting('eService.eLibrary.enabled', e.target.checked)}
                      className="rounded border-slate-300 text-[#FE0002] focus:ring-[#FE0002]"
                    />
                    <span className="text-xs text-slate-600">Enabled</span>
                  </label>
                </div>
                <input
                  type="url"
                  value={settings.eService.eLibrary.url}
                  onChange={(e) => updateSetting('eService.eLibrary.url', e.target.value)}
                  placeholder="Coming Soon / Enter URL when available"
                  disabled={settings.eService.eLibrary.comingSoon}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-[#070707] disabled:bg-slate-50 disabled:text-slate-400"
                />
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.eService.eLibrary.comingSoon}
                    onChange={(e) => updateSetting('eService.eLibrary.comingSoon', e.target.checked)}
                    className="rounded border-slate-300 text-[#FE0002] focus:ring-[#FE0002]"
                  />
                  <span className="text-xs text-slate-600">Mark as &quot;Coming Soon&quot;</span>
                </label>
              </div>

              {/* E-Trade */}
              <div className="rounded-xl border border-slate-200 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#070707]">E-Trade</label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.eService.eTrade.enabled}
                      onChange={(e) => updateSetting('eService.eTrade.enabled', e.target.checked)}
                      className="rounded border-slate-300 text-[#FE0002] focus:ring-[#FE0002]"
                    />
                    <span className="text-xs text-slate-600">Enabled</span>
                  </label>
                </div>
                <input
                  type="url"
                  value={settings.eService.eTrade.url}
                  onChange={(e) => updateSetting('eService.eTrade.url', e.target.value)}
                  placeholder="https://etrade.gov.et/"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-[#070707]"
                />
              </div>
            </div>
          </div>
        )}

        {/* Contact Settings */}
        {activeTab === "contact" && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
            <h3 className="text-sm font-extrabold text-[#070707]">Contact Information</h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-[#070707] mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    value={settings.contactInfo.email}
                    onChange={(e) => updateSetting('contactInfo.email', e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-xs text-[#070707]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#070707] mb-2">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="tel"
                    value={settings.contactInfo.phone}
                    onChange={(e) => updateSetting('contactInfo.phone', e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-xs text-[#070707]"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-[#070707]">Office Address</label>
              {languages.map((lang) => (
                <div key={lang.code} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-500 w-28 shrink-0">{lang.label}:</span>
                  <div className="relative flex-1">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={settings.contactInfo.address?.[lang.code] || ""}
                      onChange={(e) => updateSetting(`contactInfo.address.${lang.code}`, e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-xs text-[#070707]"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-[#070707]">Working Hours</label>
              {languages.map((lang) => (
                <div key={lang.code} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-500 w-28 shrink-0">{lang.label}:</span>
                  <div className="relative flex-1">
                    <Clock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={settings.contactInfo.workingHours?.[lang.code] || ""}
                      onChange={(e) => updateSetting(`contactInfo.workingHours.${lang.code}`, e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-xs text-[#070707]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Social Media Settings */}
        {activeTab === "social" && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
            <h3 className="text-sm font-extrabold text-[#070707]">Social Media Links</h3>
            <p className="text-xs text-slate-500">Add your official social media profile URLs</p>

            <div className="space-y-4">
              {Object.keys(settings.socialMedia).map((platform) => (
                <div key={platform}>
                  <label className="block text-xs font-bold text-[#070707] mb-2 capitalize">{platform}</label>
                  <input
                    type="url"
                    value={settings.socialMedia[platform]}
                    onChange={(e) => updateSetting(`socialMedia.${platform}`, e.target.value)}
                    placeholder={`https://${platform}.com/burayu`}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-[#070707]"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Language Settings */}
        {activeTab === "language" && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
            <h3 className="text-sm font-extrabold text-[#070707]">Language & Translation</h3>

            <div>
              <label className="block text-xs font-bold text-[#070707] mb-2">Default Site Language</label>
              <select
                value={settings.languageSettings.defaultLanguage}
                onChange={(e) => updateSetting('languageSettings.defaultLanguage', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-[#070707]"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.label} - {lang.nativeName}
                  </option>
                ))}
              </select>
            </div>

            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={settings.languageSettings.requireFullTranslations}
                onChange={(e) => updateSetting('languageSettings.requireFullTranslations', e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-[#FE0002] focus:ring-[#FE0002]"
              />
              <div>
                <p className="text-xs font-bold text-[#070707]">Require Full Translations</p>
                <p className="text-[11px] text-slate-500">
                  Ensure all content has complete translations in Afan Oromo, Amharic, and English before publishing
                </p>
              </div>
            </label>
          </div>
        )}

        {/* Content Settings */}
        {activeTab === "content" && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
            <h3 className="text-sm font-extrabold text-[#070707]">Content Display Settings</h3>

            <div>
              <label className="block text-xs font-bold text-[#070707] mb-2">Items Per Page</label>
              <input
                type="number"
                min="6"
                max="50"
                value={settings.contentSettings?.itemsPerPage ?? 12}
                onChange={(e) => {
                  const val = e.target.value === "" ? "" : parseInt(e.target.value, 10);
                  updateSetting('contentSettings.itemsPerPage', isNaN(val) ? "" : val);
                }}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-[#070707]"
              />
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.contentSettings.enableSearch}
                  onChange={(e) => updateSetting('contentSettings.enableSearch', e.target.checked)}
                  className="rounded border-slate-300 text-[#FE0002] focus:ring-[#FE0002]"
                />
                <span className="text-xs font-bold text-[#070707]">Enable Search Functionality</span>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.contentSettings.enableFilters}
                  onChange={(e) => updateSetting('contentSettings.enableFilters', e.target.checked)}
                  className="rounded border-slate-300 text-[#FE0002] focus:ring-[#FE0002]"
                />
                <span className="text-xs font-bold text-[#070707]">Enable Content Filters</span>
              </label>
            </div>
          </div>
        )}

        {/* SEO Settings */}
        {activeTab === "seo" && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
            <h3 className="text-sm font-extrabold text-[#070707]">SEO & Meta Information</h3>

            <div>
              <label className="block text-xs font-bold text-[#070707] mb-2">Meta Keywords</label>
              <input
                type="text"
                value={settings.seo.keywords}
                onChange={(e) => updateSetting('seo.keywords', e.target.value)}
                placeholder="Separate keywords with commas"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-[#070707]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#070707] mb-2">Author</label>
              <input
                type="text"
                value={settings.seo.author}
                onChange={(e) => updateSetting('seo.author', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-[#070707]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#070707] mb-2">Social Media Preview Image</label>
              <input
                type="text"
                value={settings.seo.ogImage}
                onChange={(e) => updateSetting('seo.ogImage', e.target.value)}
                placeholder="/images/og-image.jpg"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-[#070707]"
              />
              <p className="mt-1 text-[11px] text-slate-500">Image displayed when sharing links on social media</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <button
            type="button"
            onClick={handleReset}
            disabled={saving || loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-[#070707] hover:bg-slate-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reset to Defaults
          </button>

          <button
            type="submit"
            disabled={saving || loading}
            className="inline-flex items-center gap-2 rounded-xl bg-[#FE0002] px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#CC0002] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className={`h-4 w-4 ${saving ? 'animate-spin' : ''}`} />
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
