"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Logo from "@/components/logo";
import authService from "@/src/services/authService";
import {
  LayoutDashboard,
  Newspaper,
  Megaphone,
  BellRing,
  Calendar,
  Building2,
  Image as ImageIcon,
  Layers,
  ClipboardList,
  Info,
  UserCheck,
  Settings,
  LogOut,
  X,
  ExternalLink,
} from "lucide-react";

export default function AdminSidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    authService.logout();
    router.push("/admin/login");
  };

  const navSections = [
    {
      title: null,
      items: [
        { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard, exact: true },
      ],
    },
    {
      title: "CONTENT",
      items: [
        { label: "News", href: "/admin/dashboard/news", icon: Newspaper },
        { label: "Announcements", href: "/admin/dashboard/announcements", icon: Megaphone },
        { label: "Projects", href: "/admin/dashboard/projects", icon: Building2 },
        { label: "Gallery", href: "/admin/dashboard/gallery", icon: ImageIcon },
        { label: "Slides", href: "/admin/dashboard/slide-image", icon: Layers },
      ],
    },
    {
      title: "WEBSITE",
      items: [
        { label: "Services", href: "/admin/dashboard/services", icon: ClipboardList },
        { label: "Mayor Message", href: "/admin/dashboard/about", icon: UserCheck },
        { label: "City Information", href: "/admin/dashboard/city-information", icon: Info },
      ],
    },
    {
      title: "SYSTEM",
      items: [
        { label: "Settings", href: "/admin/dashboard/settings", icon: Settings },
        { label: "Logout", href: null, icon: LogOut, onClick: handleLogout },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-800 bg-slate-950 text-white transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header with Official Logo */}
        <div className="flex h-20 items-center justify-between border-b border-slate-800/80 px-6">
          <Logo variant="admin" size="md" href="/admin/dashboard" />
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              {section.title && (
                <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">
                  {section.title}
                </p>
              )}
              {section.items.map((item) => {
                const Icon = item.icon;
                const isProjects = item.href === "/admin/dashboard/projects" || item.href === "/admin/projects";
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname === item.href ||
                    (pathname && pathname.startsWith(`${item.href}/`)) ||
                    (isProjects && (pathname === "/admin/projects" || (pathname && pathname.startsWith("/admin/projects/"))));

                // Handle logout button (no href)
                if (item.onClick) {
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => {
                        item.onClick();
                        onClose && onClose();
                      }}
                      className="w-full flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition text-slate-300 hover:bg-slate-900 hover:text-white"
                    >
                      <Icon className="h-4 w-4 shrink-0 text-slate-400" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => onClose && onClose()}
                    className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition ${
                      isActive
                        ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20 font-bold"
                        : "text-slate-300 hover:bg-slate-900 hover:text-white"
                    }`}
                  >
                    <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-slate-950" : "text-slate-400"}`} />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer info & Public Site Link */}
        <div className="border-t border-slate-800/80 p-4 space-y-3">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 px-3.5 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-900 hover:text-white transition"
          >
            <span className="truncate">View Public Portal</span>
            <ExternalLink className="h-3.5 w-3.5 text-amber-400 shrink-0" />
          </Link>

          <div className="flex items-center gap-3 px-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
              AD
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-white">Burayu Admin</p>
              <p className="truncate text-[10px] text-emerald-400">Phase I Prototype Mode</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
