"use client";

import { ExternalLink, ChevronDown } from "lucide-react";
import { useLanguage } from "@/src/context/LanguageContext";
import { useState, useRef, useCallback } from "react";
import { useClickOutside } from "@/src/lib/hooks";

export const ESERVICE_URL = "https://eservice.shaggarcity.et/";

export default function AccessEServiceButton({
  variant = "primary",
  size = "md",
  className = "",
  label,
  showIcon = true,
}) {
  const { language } = useLanguage();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const ref = useRef(null);

  const labels = {
    om: "Tajaajila E-Service",
    am: "ወደ ኢ-አገልግሎት ይግቡ",
    en: "E-Service",
  };

  const displayLabel = label || labels[language] || labels.om;

  const baseStyles =
    "inline-flex items-center justify-center gap-2 font-bold transition focus:outline-none focus:ring-2 focus:ring-[#087443] focus:ring-offset-2 rounded-[25px] shadow-sm active:scale-[0.98]";

  const variants = {
    primary: "bg-[#087443] text-white hover:bg-[#075C36]",
    accent: "bg-[#087443] text-white hover:bg-[#075C36]",
    secondary: "bg-[#087443] text-white hover:bg-[#075C36]",
    outline: "bg-[#087443] text-white hover:bg-[#075C36]",
    white: "bg-[#087443] text-white hover:bg-[#075C36]",
  };

  const sizes = {
    sm: "px-5 py-2.5 text-xs h-[38px]",
    md: "px-6 py-3 text-sm h-[42px]",
    lg: "px-7 py-3.5 text-base h-[46px]",
  };

  const closeDropdown = useCallback(() => setDropdownOpen(false), []);
  useClickOutside(ref, closeDropdown);

  const menuItems = [
    { name: "E-Library", url: null },
    { name: "E-Land", url: "https://eland.shaggarcity.et/" },
    { name: "E-Conference", url: "https://shaggarcity.oo.et/?module=login" },
    { name: "E-Service", url: "https://eservice.shaggarcity.et/" },
    { name: "E-Trade", url: "https://etrade.gov.et/" },
  ];

  return (
    <div className={`relative inline-block text-left ${className}`} ref={ref}>
      <button
        type="button"
        onClick={() => setDropdownOpen((v) => !v)}
        aria-expanded={dropdownOpen}
        aria-haspopup="true"
        className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} w-full`}
      >
        <span>{displayLabel}</span>
        {showIcon && <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />}
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 z-50 mt-2 w-full min-w-[14rem] origin-top-right rounded-2xl border border-slate-200 bg-white p-2 shadow-xl ring-1 ring-black/5 animate-in fade-in zoom-in-95">
          <div className="flex flex-col gap-1">
          {menuItems.map((item) => (
              item.url ? (
                <a
                  key={item.name}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-emerald-900"
                  onClick={() => setDropdownOpen(false)}
                >
                  <span>{item.name}</span>
                  <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                </a>
              ) : (
                <div key={item.name} className="flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium text-slate-400 cursor-not-allowed">
                  <span>{item.name}</span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">Coming Soon</span>
                </div>
              )
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
