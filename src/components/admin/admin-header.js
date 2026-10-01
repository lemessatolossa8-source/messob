"use client";

import { Menu, Globe2, ExternalLink } from "lucide-react";
import Link from "next/link";
import LanguageSelector from "@/components/language-selector";

export default function AdminHeader({ onMenuClick, title, subtitle }) {
  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-4 sm:px-8 backdrop-blur">
      <div className="flex items-center gap-4 min-w-0">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-xl border border-slate-200 p-2 text-slate-700 hover:bg-slate-100 lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="min-w-0">
          <h1 className="truncate text-lg sm:text-xl font-extrabold text-slate-900">
            {title || "Burayu MESOB CMS"}
          </h1>
          {subtitle && (
            <p className="truncate text-xs font-medium text-slate-500">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Prototype badge */}
        <span className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-800">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Interactive Frontend CRUD
        </span>

        {/* View Public Website */}
        <Link
          href="/"
          target="_blank"
          className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:border-emerald-600 hover:text-emerald-900 transition"
        >
          <span>Live Site</span>
          <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
        </Link>

        {/* Language selector in admin */}
        <LanguageSelector variant="header" />
      </div>
    </header>
  );
}
