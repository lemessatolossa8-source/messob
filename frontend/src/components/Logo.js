"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/src/context/LanguageContext";
import { useSiteSettings } from "@/src/context/SiteSettingsContext";

export default function Logo({
  variant = "default", // 'default' | 'admin' | 'white' | 'compact'
  size = "md", // 'sm' | 'md' | 'lg' | 'xl'
  showText = true,
  href = "/",
  className = "",
  textClassName = "",
  onClick,
}) {
  const { getText } = useLanguage();
  const { settings } = useSiteSettings();
  const siteName = getText(settings?.siteName) || "Burayu MESOB";
  const sizeMap = {
    sm: { dimension: 40, boxClass: "h-10 w-10" },
    md: { dimension: 72, boxClass: "h-[52px] w-[52px] sm:h-[64px] sm:w-[64px]" },
    lg: { dimension: 90, boxClass: "h-16 w-16 sm:h-20 sm:w-20" },
    xl: { dimension: 120, boxClass: "h-20 w-20 sm:h-28 sm:w-28" },
  };

  const { dimension, boxClass } = sizeMap[size] || sizeMap.md;
  const currentBoxClass = variant === "admin" ? "h-11 w-11" : boxClass;
  const currentDimension = variant === "admin" ? 44 : dimension;

  const content = (
    <div className={`flex items-center gap-3 sm:gap-3.5 shrink-0 ${className}`}>
      {/* Official Burayu MESOB Logo Container with aspect ratio preservation */}
      <div className={`relative shrink-0 overflow-hidden rounded-full ${currentBoxClass} bg-white shadow-xs ring-1 ring-white/30 flex items-center justify-center p-0.5`}>
        <Image
          src="/images/burayu-mesob-logo.jpg"
          alt="Burayu MESOB Logo"
          width={currentDimension}
          height={currentDimension}
          className="h-full w-full object-contain rounded-full"
        />
      </div>

      {showText && (
        <div className={`min-w-0 flex items-center ${textClassName}`}>
          {variant === "admin" ? (
            <div className="flex flex-col justify-center text-left leading-tight">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#FE0002] leading-tight">
                Admin CMS
              </span>
              <span className="truncate text-base font-extrabold text-white leading-tight mt-0.5">
                {siteName}
              </span>
            </div>
          ) : (
            <span
              className={`truncate text-base sm:text-lg font-black tracking-tight leading-none ${
                variant === "white" ? "text-white" : "text-[#070707]"
              }`}
            >
              {siteName}
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} onClick={onClick} className="inline-flex items-center shrink-0 group transition opacity-95 hover:opacity-100 focus:outline-none">
        {content}
      </Link>
    );
  }

  return content;
}
