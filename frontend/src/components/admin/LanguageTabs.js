"use client";

import { useState, useRef, useEffect } from "react";
import { Globe, ChevronDown, Check } from "lucide-react";

export const LANGUAGES = [
  { code: "om", label: "Afaan Oromo" },
  { code: "en", label: "English" },
  { code: "am", label: "አማርኛ" },
];

export default function LanguageTabs({
  activeTab = "om",
  onTabChange,
  title = "",
  label = "Editing Language",
  className = "",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentLang = LANGUAGES.find((l) => l.code === activeTab) || LANGUAGES[0];

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4 mb-6 ${className}`}>
      {title ? (
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-[#FE0002] shrink-0" />
          <h2 className="text-sm sm:text-base font-extrabold text-[#070707]">{title}</h2>
        </div>
      ) : (
        <div />
      )}

      {/* Editing Language Dropdown */}
      <div className="relative inline-block text-left" ref={dropdownRef}>
        <div className="flex items-center gap-2">
          {label && (
            <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
              {label}:
            </span>
          )}
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="inline-flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-[#070707] shadow-xs hover:border-[#FE0002] transition cursor-pointer min-w-[160px]"
            aria-haspopup="true"
            aria-expanded={isOpen}
          >
            <div className="flex items-center gap-2">
              <Globe className="h-3.5 w-3.5 text-[#FE0002]" />
              <span>{currentLang.label}</span>
            </div>
            <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${isOpen ? "rotate-180 text-[#FE0002]" : ""}`} />
          </button>
        </div>

        {isOpen && (
          <div className="absolute right-0 z-50 mt-1.5 w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg animate-in fade-in zoom-in-95 duration-100">
            {LANGUAGES.map((lang) => {
              const isSelected = activeTab === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    onTabChange && onTabChange(lang.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-xs font-bold transition cursor-pointer ${
                    isSelected
                      ? "bg-[#FE0002] text-white"
                      : "text-[#070707] hover:bg-slate-100"
                  }`}
                >
                  <span>{lang.label}</span>
                  {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export const LanguageDropdown = LanguageTabs;
