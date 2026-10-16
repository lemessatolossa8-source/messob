"use client";

import { Menu, Globe2, ExternalLink } from "lucide-react";
import Link from "next/link";
import LanguageSelector from "@/components/LanguageSelector";

export default function AdminHeader({ onMenuClick, title, subtitle }) {
  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-4 sm:px-8 backdrop-blur">
      <div className="flex items-center gap-4 min-w-0">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-xl border border-slate-200 p-2 text-[#070707] hover:bg-slate-100 lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="min-w-0">
          <h1 className="truncate text-lg sm:text-xl font-extrabold text-[#070707]">
            {title || "Burayu MESOB CMS"}
          </h1>
          {subtitle && (
            <p className="truncate text-xs font-medium text-slate-500">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Official Portal Badge */}
        <span className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-100 px-3 py-1 text-[11px] font-semibold text-[#070707]">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
          Official Administration Portal
        </span>

        {/* View Public Website */}
        <Link
          href="/"
          target="_blank"
          className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-[#070707] shadow-xs hover:border-[#FE0002] hover:text-[#FE0002] transition"
        >
          <span>View Website</span>
          <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
        </Link>

        {/* Language selector in admin */}
        <LanguageSelector variant="header" />
      </div>
    </header>
  );
}
