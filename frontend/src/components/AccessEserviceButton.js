"use client";

import { ExternalLink, ChevronDown } from "lucide-react";
import { useLanguage } from "@/src/context/LanguageContext";
import { useSiteSettings } from "@/src/context/SiteSettingsContext";
import { useState, useRef, useCallback } from "react";
import { useClickOutside } from "@/src/lib/hooks";

export const ESERVICE_URL = "https://eservice.shaggarcity.et/";

// True only on devices with a real mouse/pointer (desktop) — touch devices stay click/tap
const canHover = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(hover: hover) and (pointer: fine)").matches;

export default function AccessEServiceButton({
  variant = "primary",
  size = "md",
  className = "",
  label,
  showIcon = true,
}) {
  const { language } = useLanguage();
  const { settings } = useSiteSettings();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const ref = useRef(null);
  const closeTimer = useRef(null);

  const labels = {
    om: "Tajaajila E-Service",
    am: "ወደ ኢ-አገልግሎት ይግቡ",
    en: "E-Service",
  };

  const displayLabel = label || labels[language] || labels.om;

  const isHeaderVariant = variant === "header" || variant === "header-dark" || variant === "header-bottom" || variant === "header-nav";
  const isDarkText = variant === "header-dark";
  const isBottom = variant === "header-bottom";

  const baseStyles =
    "inline-flex items-center justify-center gap-2 font-bold transition focus:outline-none focus:ring-2 focus:ring-[#FE0002] focus:ring-offset-2 rounded-[25px] shadow-sm active:scale-[0.98]";

  const variants = {
    primary: "bg-[#FE0002] text-white hover:bg-[#CC0002]",
    accent: "bg-[#FE0002] text-white hover:bg-[#CC0002]",
    secondary: "bg-[#070707] text-white hover:bg-black",
    outline: "bg-white text-[#070707] border border-slate-300 hover:bg-slate-50",
    white: "bg-white text-[#FE0002] border border-slate-300 hover:bg-slate-50",
    header: "text-[#070707] hover:text-[#070707]",
  };

  const sizes = {
    sm: "px-5 py-2.5 text-xs h-[38px]",
    md: "px-6 py-3 text-sm h-[42px]",
    lg: "px-7 py-3.5 text-base h-[46px]",
  };

  const closeDropdown = useCallback(() => setDropdownOpen(false), []);
  useClickOutside(ref, closeDropdown);

  const openDropdown = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setDropdownOpen(true);
  }, []);

  const scheduleClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setDropdownOpen(false), 150);
  }, []);

  // Desktop: hover opens / closes. Touch devices: click toggles.
  const handleMouseEnter = () => {
    if (canHover()) openDropdown();
  };
  const handleMouseLeave = () => {
    if (canHover()) scheduleClose();
  };

  // Keyboard: focus anywhere in the group opens, focus leaving closes, Escape closes
  const handleFocus = () => openDropdown();
  const handleBlur = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) closeDropdown();
  };
  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      closeDropdown();
      ref.current?.querySelector("button")?.blur();
    }
  };

  const eServiceConfig = settings?.eService;
  if (eServiceConfig && eServiceConfig.enabled === false) {
    return null;
  }

  const eLandUrl = eServiceConfig?.eLand?.enabled !== false ? (eServiceConfig?.eLand?.url || "https://eland.shaggarcity.et/") : null;
  const eConferenceUrl = eServiceConfig?.eConference?.enabled !== false ? (eServiceConfig?.eConference?.url || "https://econference.shaggarcity.et/") : null;
  const eLibraryComingSoon = eServiceConfig?.eLibrary?.comingSoon !== false;
  const eLibraryUrl = (!eLibraryComingSoon && eServiceConfig?.eLibrary?.enabled) ? (eServiceConfig?.eLibrary?.url || null) : null;
  const eTradeUrl = eServiceConfig?.eTrade?.enabled !== false ? (eServiceConfig?.eTrade?.url || "https://etrade.gov.et/") : null;

  const menuItems = [
    { name: "E-Library", url: eLibraryUrl },
    { name: "E-Land", url: eLandUrl },
    { name: "E-Conference", url: eConferenceUrl },
    { name: "E-Service", url: "https://eservice.shaggarcity.et/" },
    { name: "E-Investment", url: "/investment" },
    { name: "E-Trade", url: eTradeUrl },
  ];

  const buttonClassNames = isHeaderVariant
    ? `relative inline-flex items-center gap-1 py-2 text-sm font-bold transition-colors duration-300 ease-in-out whitespace-nowrap focus:outline-none after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:transition-transform after:duration-300 after:origin-left ${
        isDarkText
          ? (dropdownOpen ? "text-[#070707] after:bg-[#FE0002] after:scale-x-100" : "text-[#070707] hover:text-[#070707] after:bg-[#FE0002] after:scale-x-0 hover:after:scale-x-100")
          : isBottom ? (dropdownOpen ? "text-white after:bg-[#FE0002] after:scale-x-100" : "text-white/80 hover:text-white after:bg-[#FE0002] after:scale-x-0 hover:after:scale-x-100") : (dropdownOpen ? "text-white after:bg-white after:scale-x-100" : "text-white/80 hover:text-white after:bg-white after:scale-x-0 hover:after:scale-x-100")
      }`
    : `${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} w-full`;

  return (
    <div
      className={`relative inline-block text-left ${className}`}
      ref={ref}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    >
      <button
        type="button"
        onClick={() => setDropdownOpen((v) => !v)}
        aria-expanded={dropdownOpen}
        aria-haspopup="true"
        className={buttonClassNames}
      >
        <span>{displayLabel}</span>
        {showIcon && (
          <ChevronDown
            className={`h-4 w-4 shrink-0 ${isDarkText ? "text-slate-500" : "text-white/80"} transition-transform duration-200 ${
              dropdownOpen ? "rotate-180" : ""
            }`}
          />
        )}
      </button>

      {/* Always mounted so it can animate open AND close; invisible when closed */}
      <div
        aria-hidden={!dropdownOpen}
        className={`absolute right-0 top-full z-50 pt-2 transition-all duration-200 ease-out ${
          dropdownOpen
            ? "opacity-100 visible translate-y-0"
            : "opacity-0 invisible -translate-y-1 pointer-events-none"
        }`}
      >
        <div className="w-full min-w-[14rem] origin-top-right rounded-2xl border border-slate-200 bg-white p-2 shadow-xl ring-1 ring-black/5">
          <div className="flex flex-col gap-1">
            {menuItems.map((item) => {
              if (!item.url) {
                return (
                  <div
                    key={item.name}
                    className="flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium text-slate-400 cursor-not-allowed"
                  >
                    <span>{item.name}</span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">Coming Soon</span>
                  </div>
                );
              }
              const isExternal = /^https?:\/\//.test(item.url);
              return (
                <a
                  key={item.name}
                  href={item.url}
                  {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium text-[#070707] transition hover:bg-slate-100 hover:text-[#FE0002]"
                  onClick={() => setDropdownOpen(false)}
                >
                  <span>{item.name}</span>
                  <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
