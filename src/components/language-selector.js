"use client";

import { useLanguage } from "@/src/context/LanguageContext";
import { useState, useRef, useCallback } from "react";
import { useClickOutside } from "@/src/lib/hooks";

export default function LanguageSelector({ variant = "header", className = "" }) {
  const { language, setLanguage, languages } = useLanguage();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const ref = useRef(null);

  const closeDropdown = useCallback(() => setDropdownOpen(false), []);
  useClickOutside(ref, closeDropdown);

  if (variant === "mobile") {
    return (
      <div className={`flex flex-col gap-2 ${className}`}>
        <div className="grid grid-cols-3 gap-1.5">
          {languages.map((lang) => {
            const isActive = language === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => setLanguage(lang.code)}
                className={`flex items-center justify-center rounded-xl py-2 px-3 text-xs font-bold uppercase transition ${
                  isActive
                    ? "bg-emerald-900 text-white shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <span>{lang.label || lang.code}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (variant === "pills") {
    return (
      <div className={`inline-flex items-center gap-1 rounded-full bg-white/10 p-1 backdrop-blur ${className}`}>
        {languages.map((lang) => {
          const isActive = language === lang.code;
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => setLanguage(lang.code)}
              className={`flex items-center justify-center rounded-full px-3 py-1 text-xs font-bold uppercase transition ${
                isActive
                  ? "bg-amber-400 text-slate-950 shadow-sm"
                  : "text-white/90 hover:bg-white/15 hover:text-white"
              }`}
            >
              <span>{lang.label || lang.code}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // Default Topbar / Header Switcher
  const currentLangObj = languages.find((l) => l.code === language) || languages[0];

  return (
    <div className={`relative inline-block text-left ${className}`} ref={ref}>
      <button
        type="button"
        onClick={() => setDropdownOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30"
        aria-expanded={dropdownOpen}
        aria-haspopup="true"
      >
        <span>{currentLangObj.label || currentLangObj.code}</span>
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-44 origin-top-right rounded-xl border border-slate-200 bg-white p-1 shadow-xl ring-1 ring-black/5 z-50 animate-in fade-in zoom-in-95">
          {languages.map((lang) => {
            const isActive = language === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => {
                  setLanguage(lang.code);
                  setDropdownOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-emerald-50 text-emerald-950 font-semibold"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <span>{lang.label || lang.code}</span>
                {isActive && <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

