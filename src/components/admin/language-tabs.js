"use client";

import { LANGUAGES } from "@/src/i18n/config";
import { CheckCircle2, AlertCircle } from "lucide-react";

export default function LanguageTabs({
  activeTab = "am",
  onTabChange,
  status = {}, // { am: true, om: false, en: false } (true if filled)
  errors = {}, // { am: "...", om: "..." }
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3 mb-6">
      {LANGUAGES.map((lang) => {
        const isActive = activeTab === lang.code;
        const isFilled = status[lang.code];
        const hasError = errors[lang.code];

        return (
          <button
            key={lang.code}
            type="button"
            onClick={() => onTabChange(lang.code)}
            className={`group inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold uppercase transition ${
              isActive
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <span>{lang.label || lang.code}</span>

            {hasError ? (
              <AlertCircle className="h-3.5 w-3.5 text-rose-500 shrink-0" />
            ) : isFilled ? (
              <CheckCircle2 className={`h-3.5 w-3.5 shrink-0 ${isActive ? "text-emerald-400" : "text-emerald-600"}`} />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

