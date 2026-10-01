"use client";

import { useState, useEffect } from "react";
import { 
  Settings, Globe2, Bell, Mail, Phone, MapPin, 
  Building2, Clock, CheckCircle2, Save, RefreshCw,
  Shield, FileText, Image, Link, Calendar
} from "lucide-react";
import { useLanguage } from "@/src/context/LanguageContext";
import { useToast } from "@/src/context/ToastContext";

export default function AdminSettingsPage() {
  const { language, setLanguage, languages } = useLanguage();
  const toast = useToast();

  const [settings, setSettings] = useState({
    // Site Information
    siteName: {
      en: "Burayu MESOB",
      am: "ቡራዩ መሶብ",
      om: "Buraayyuu MESOB"
    },
    siteTagline: {
      en: "Digital Gateway to Burayu Municipal Services",
      am: "ወደ ቡራዩ የማዘጋጃ ቤት አገልግሎቶች ዲጂታል መግቢያ",
      om: "Balbala Dijitaalaa Tajaajila Munisipalaa Buraayyuu"
    },
    siteDescription: {
      en: "Official portal providing municipal services, announcements, and public information for Burayu City Administration",
      am: "የቡራዩ ከተማ አስተዳደር ኦፊሴላዊ መረጃ መድረክ - የማዘጋጃ ቤት አገልግሎቶችን፣ ማስታወቂያዎችን እና የህዝብ መረጃዎችን ያቀርባል",
      om: "Marsariitiin ofiishaala bulchiinsa Magaalaa Buraayyuu kan tajaajila munisipalaa, beeksisaafi odeeffannoo uummataa dhiyeessu"
    },

    // Contact Information
    contactInfo: {
      email: "info@burayu.gov.et",
      phone: "+251 11 284 0000",
      address: "Burayu City Administration, Main Office",
      workingHours: "Monday - Friday: 8:30 AM - 5:00 PM"
    },

    // Social Media Links
    socialMedia: {
      facebook: "",
      twitter: "",
      youtube: "",
      telegram: "",
      linkedin: ""
    },

    // E-Service Settings
    eService: {
      enabled: true,
      url: "https://eservice.shaggarcity.et/",
      displayInHeader: true,
      displayInFooter: false
    },

    // Language Settings
    languageSettings: {
      defaultLanguage: "om",
      requireFullTranslations: true,
      enableAutoTranslate: false
    },

    // Content Settings
    contentSettings: {
      itemsPerPage: 12,
      enableComments: false,
      enableSearch: true,
      enableFilters: true
    },

    // Maintenance Mode
    maintenance: {
      enabled: false,
      message: {
        en: "Our website is currently undergoing maintenance. We'll be back shortly.",
        am: "ድረ-ገፃችን በጥገና ላይ ነው። በቅርቡ እንመለሳለን።",
        om: "Marsariitiin keenya yeroo ammaa hojii suphaa keessa jira. Dafnee ni deebina."
      }
    },

    // SEO Settings
    seo: {
      keywords: "Burayu, MESOB, Municipal Services, Government Portal, Ethiopia",
      author: "Burayu City Administration",
      ogImage: "/images/burayu-mesob-logo.png"
    }
  });

  const [activeTab, setActiveTab] = useState("general");

  // Load settings from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("mesob_admin_settings");
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load settings:", e);
      }
    }
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    // Save to localStorage (in production, this would be an API call)
    localStorage.setItem("mesob_admin_settings", JSON.stringify(settings));
    toast.success("Settings saved successfully");
  };

  const handleReset = () => {
    if (confirm("Reset all settings to default values?")) {
      localStorage.removeItem("mesob_admin_settings");
      window.location.reload();
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
        <h2 className="text-xl font-extrabold text-slate-900">Website Settings</h2>
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
                    ? "border-emerald-600 text-emerald-600"
                    : "border-transparent text-slate-600 hover:text-slate-900"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* General Settings */}
        {activeTab === "general" && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
            <h3 className="text-sm font-extrabold text-slate-900">Site Information</h3>
            
            {/* Site Name */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700">Site Name (Multilingual)</label>
              {languages.map((lang) => (
                <div key={lang.code} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-500 w-12">{lang.label}:</span>
                  <input
                    type="text"
                    value={settings.siteName[lang.code]}
                    onChange={(e) => updateSetting(`siteName.${lang.code}`, e.target.value)}
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-900"
                  />
                </div>
              ))}
            </div>

            {/* Site Tagline */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700">Site Tagline (Multilingual)</label>
              {languages.map((lang) => (
                <div key={lang.code} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-500 w-12">{lang.label}:</span>
                  <input
                    type="text"
                    value={settings.siteTagline[lang.code]}
                    onChange={(e) => updateSetting(`siteTagline.${lang.code}`, e.target.value)}
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-900"
                  />
                </div>
              ))}
            </div>

            {/* E-Service Settings */}
            <div className="border-t border-slate-100 pt-6 space-y-4">
              <h4 className="text-xs font-extrabold text-slate-900">E-Service Configuration</h4>
              
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.eService.enabled}
                  onChange={(e) => updateSetting('eService.enabled', e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600"
                />
                <span className="text-xs font-bold text-slate-700">Enable E-Service Button</span>
              </label>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">E-Service URL</label>
                <input
                  type="url"
                  value={settings.eService.url}
                  onChange={(e) => updateSetting('eService.url', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-900"
                />
              </div>
            </div>
          </div>
        )}

        {/* Contact Settings */}
        {activeTab === "contact" && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
            <h3 className="text-sm font-extrabold text-slate-900">Contact Information</h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    value={settings.contactInfo.email}
                    onChange={(e) => updateSetting('contactInfo.email', e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="tel"
                    value={settings.contactInfo.phone}
                    onChange={(e) => updateSetting('contactInfo.phone', e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-xs text-slate-900"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Office Address</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={settings.contactInfo.address}
                  onChange={(e) => updateSetting('contactInfo.address', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-xs text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Working Hours</label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={settings.contactInfo.workingHours}
                  onChange={(e) => updateSetting('contactInfo.workingHours', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-xs text-slate-900"
                />
              </div>
            </div>
          </div>
        )}

        {/* Social Media Settings */}
        {activeTab === "social" && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
            <h3 className="text-sm font-extrabold text-slate-900">Social Media Links</h3>
            <p className="text-xs text-slate-500">Add your official social media profile URLs</p>

            <div className="space-y-4">
              {Object.keys(settings.socialMedia).map((platform) => (
                <div key={platform}>
                  <label className="block text-xs font-bold text-slate-700 mb-2 capitalize">{platform}</label>
                  <input
                    type="url"
                    value={settings.socialMedia[platform]}
                    onChange={(e) => updateSetting(`socialMedia.${platform}`, e.target.value)}
                    placeholder={`https://${platform}.com/burayu`}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-900"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Language Settings */}
        {activeTab === "language" && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
            <h3 className="text-sm font-extrabold text-slate-900">Language & Translation</h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Default Site Language</label>
              <select
                value={settings.languageSettings.defaultLanguage}
                onChange={(e) => updateSetting('languageSettings.defaultLanguage', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-900"
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
                className="mt-0.5 rounded border-slate-300 text-emerald-600"
              />
              <div>
                <p className="text-xs font-bold text-slate-900">Require Full Translations</p>
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
            <h3 className="text-sm font-extrabold text-slate-900">Content Display Settings</h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Items Per Page</label>
              <input
                type="number"
                min="6"
                max="50"
                value={settings.contentSettings.itemsPerPage}
                onChange={(e) => updateSetting('contentSettings.itemsPerPage', parseInt(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-900"
              />
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.contentSettings.enableSearch}
                  onChange={(e) => updateSetting('contentSettings.enableSearch', e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600"
                />
                <span className="text-xs font-bold text-slate-700">Enable Search Functionality</span>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.contentSettings.enableFilters}
                  onChange={(e) => updateSetting('contentSettings.enableFilters', e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600"
                />
                <span className="text-xs font-bold text-slate-700">Enable Content Filters</span>
              </label>
            </div>
          </div>
        )}

        {/* SEO Settings */}
        {activeTab === "seo" && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
            <h3 className="text-sm font-extrabold text-slate-900">SEO & Meta Information</h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Meta Keywords</label>
              <input
                type="text"
                value={settings.seo.keywords}
                onChange={(e) => updateSetting('seo.keywords', e.target.value)}
                placeholder="Separate keywords with commas"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Author</label>
              <input
                type="text"
                value={settings.seo.author}
                onChange={(e) => updateSetting('seo.author', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Social Media Preview Image</label>
              <input
                type="text"
                value={settings.seo.ogImage}
                onChange={(e) => updateSetting('seo.ogImage', e.target.value)}
                placeholder="/images/og-image.jpg"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-900"
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
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reset to Defaults
          </button>

          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition"
          >
            <Save className="h-4 w-4" />
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
}
