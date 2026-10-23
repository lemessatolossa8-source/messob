"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import authService from "@/src/services/authService";
import {
  LayoutDashboard,
  Newspaper,
  Megaphone,
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
  BarChart2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function AdminSidebar({
  isOpen,
  onClose,
  isCollapsed = false,
  onToggleCollapse,
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    authService.logout();
    router.push("/admin/login");
  };

  const navSections = [
    {
      title: "MAIN",
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
      title: "SERVICES & PORTAL",
      items: [
        { label: "Services", href: "/admin/dashboard/services", icon: ClipboardList },
        { label: "City Information", href: "/admin/dashboard/city-information", icon: Info },
        { label: "Mayor Message", href: "/admin/dashboard/about", icon: UserCheck },
        { label: "Statistics", href: "/admin/dashboard/statistics", icon: BarChart2 },
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
      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-neutral-800 bg-[#070707] text-white transition-all duration-200 ease-in-out lg:static ${
          isCollapsed ? "lg:w-20" : "lg:w-64"
        } w-64 ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Header with Official Logo & Collapse Toggle */}
        <div className="flex h-16 items-center justify-between border-b border-neutral-800 px-4">
          <div className="flex items-center min-w-0 overflow-hidden">
            <Logo
              variant="admin"
              size="sm"
              showText={!isCollapsed}
              href="/admin/dashboard"
            />
          </div>

          <div className="flex items-center gap-1">
            {/* Desktop Collapse Toggle */}
            <button
              type="button"
              onClick={onToggleCollapse}
              className="hidden lg:flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-neutral-800 hover:text-white transition cursor-pointer"
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-label="Toggle sidebar width"
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </button>

            {/* Mobile Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-neutral-800 hover:text-white lg:hidden cursor-pointer"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5 scrollbar-thin scrollbar-thumb-neutral-800">
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              {section.title && !isCollapsed && (
                <p className="px-3 py-1.5 font-serif text-[10px] font-bold uppercase tracking-[0.22em] text-[#D71920]">
                  {section.title}
                </p>
              )}
              {isCollapsed && section.title && (
                <div className="my-2 border-t border-neutral-800" />
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
                      title={isCollapsed ? item.label : undefined}
                      className={`w-full flex items-center ${
                        isCollapsed ? "justify-center px-2" : "gap-3 px-3.5"
                      } py-2.5 rounded-full text-xs font-semibold transition text-neutral-300 hover:bg-neutral-800 hover:text-white cursor-pointer`}
                    >
                      <Icon className="h-4 w-4 shrink-0 text-neutral-400" />
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                    </button>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => onClose && onClose()}
                    title={isCollapsed ? item.label : undefined}
                    className={`flex items-center ${
                      isCollapsed ? "justify-center px-2" : "gap-3 px-3.5"
                    } py-2.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
                      isActive
                        ? "bg-[#D71920] text-white shadow-lg shadow-red-950/40 font-bold"
                        : "text-neutral-300 hover:bg-neutral-800 hover:text-white"
                    }`}
                  >
                    <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-white" : "text-neutral-400"}`} />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer info & Public Site Link */}
        <div className="border-t border-neutral-800 p-3 space-y-2">
          <Link
            href="/"
            target="_blank"
            title="Open live website"
            className={`flex items-center ${
              isCollapsed ? "justify-center px-2" : "justify-between px-3.5"
            } py-2 rounded-full border border-neutral-800 bg-neutral-900/60 text-xs font-semibold text-neutral-300 hover:border-[#D71920] hover:text-[#D71920] transition cursor-pointer`}
          >
            {!isCollapsed && <span className="truncate">View Website</span>}
            <ExternalLink className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
          </Link>

          {!isCollapsed && (
            <div className="flex items-center gap-2.5 px-2 pt-1">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#D71920] text-[10px] font-bold text-white shrink-0">
                BM
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-white font-serif">Burayu MESOB CMS</p>
                <p className="truncate text-[10px] text-neutral-400">Government Portal</p>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
