"use client";

import { Menu, ExternalLink, ShieldCheck, ChevronRight, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LanguageSelector from "@/components/LanguageSelector";

const ROUTE_NAMES = {
  "/admin/dashboard": "Dashboard",
  "/admin/dashboard/news": "News Management",
  "/admin/dashboard/announcements": "Announcements",
  "/admin/dashboard/projects": "Projects Management",
  "/admin/dashboard/gallery": "Media Gallery",
  "/admin/dashboard/slide-image": "Hero Slides",
  "/admin/dashboard/services": "Services Directory",
  "/admin/dashboard/city-information": "City Information CMS",
  "/admin/dashboard/about": "Mayor's Message CMS",
  "/admin/dashboard/statistics": "Portal Statistics",
  "/admin/dashboard/settings": "System Settings",
};

export default function AdminHeader({ onMenuClick, onToggleCollapse, isCollapsed, title, subtitle }) {
  const pathname = usePathname();

  // Determine current section title
  const currentTitle = ROUTE_NAMES[pathname] || title || "Burayu MESOB CMS";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 sm:px-6 backdrop-blur">
      {/* Left: Mobile Toggle & Breadcrumbs / Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-xl border border-slate-200 p-2 text-[#070707] hover:bg-slate-100 lg:hidden cursor-pointer"
          aria-label="Open sidebar"
        >
          <Menu className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2 min-w-0">
          <Link
            href="/admin/dashboard"
            className="text-xs font-semibold text-slate-500 hover:text-[#070707] hidden sm:inline"
          >
            MESOB Admin
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400 hidden sm:inline" />
          <h1 className="truncate text-sm sm:text-base font-extrabold text-[#070707]">
            {currentTitle}
          </h1>
        </div>
      </div>

      {/* Right: Actions, Portal Badge, Website Link & Language */}
      <div className="flex items-center gap-3">
        {/* Official Portal Indicator */}
        <span className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-700">
          <span className="h-1.5 w-1.5 rounded-full bg-[#FE0002] animate-pulse" />
          <span>Official Administration Portal</span>
        </span>

        {/* View Public Website */}
        <Link
          href="/"
          target="_blank"
          className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-[#070707] shadow-xs hover:border-[#FE0002] hover:text-[#FE0002] transition cursor-pointer"
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
