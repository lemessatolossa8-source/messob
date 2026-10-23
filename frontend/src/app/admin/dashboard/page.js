"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Newspaper,
  Megaphone,
  BellRing,
  Calendar,
  Building2,
  Image as ImageIcon,
  CheckCircle2,
  FileClock,
  PlusCircle,
  ArrowRight,
  ClipboardList,
  Info,
  PhoneCall,
  ExternalLink,
} from "lucide-react";
import { siteService, newsService, announcementService, eventService, projectService, galleryService } from "@/src/services";
import { getLocalizedText } from "@/src/i18n";
import { useRequireAuth } from "@/src/lib/hooks/useAuth";

export default function AdminDashboardOverviewPage() {
  const { isLoading: authLoading, user } = useRequireAuth();
  const [stats, setStats] = useState({
    totalNews: 0,
    totalAnnouncements: 0,
    totalNotices: 0,
    totalEvents: 0,
    totalProjects: 0,
    totalGallery: 0,
    totalServices: 0,
    published: 0,
    draft: 0,
  });

  const [recentNews, setRecentNews] = useState([]);

  useEffect(() => {
    // Only load data after authentication is confirmed
    if (authLoading) return;

    const loadStats = async () => {
      // Stats from storageStore (slides, gallery - still localStorage-backed)
      const baseStats = siteService.getStats();

      // Fetch news, announcements, gallery, and projects simultaneously in parallel
      const [newsSettled, annSettled, gallerySettled, projectSettled] = await Promise.allSettled([
        newsService.getAll({ limit: 4 }),
        announcementService.getAll({ limit: 1 }),
        galleryService.getAll({ limit: 1 }),
        projectService.getAll({ limit: 1 }),
      ]);

      const newsRes = newsSettled.status === "fulfilled" ? (newsSettled.value || {}) : {};
      const annRes = annSettled.status === "fulfilled" ? (annSettled.value || {}) : {};
      const galleryRes = gallerySettled.status === "fulfilled" ? (gallerySettled.value || {}) : {};
      const projectRes = projectSettled.status === "fulfilled" ? (projectSettled.value || {}) : {};

      setRecentNews(newsRes.items || []);

      setStats({
        ...baseStats,
        totalNews: newsRes.total || 0,
        totalAnnouncements: annRes.total || 0,
        totalProjects: projectRes.total || 0,
        totalGallery: galleryRes.total || 0,
      });
    };

    loadStats();
    const unsubscribe = siteService.subscribe(loadStats);
    return () => unsubscribe();
  }, [authLoading]);

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#FE0002] border-r-transparent"></div>
          <p className="text-sm font-medium text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: "Published Items", value: stats.published, href: "/admin/dashboard/news", status: "published" },
    { label: "Draft Items", value: stats.draft, href: "/admin/dashboard/news", status: "draft" },
    { label: "News Articles", value: stats.totalNews, href: "/admin/dashboard/news", icon: Newspaper },
    { label: "Announcements", value: stats.totalAnnouncements, href: "/admin/dashboard/announcements", icon: Megaphone },
    { label: "Development Projects", value: stats.totalProjects, href: "/admin/dashboard/projects", icon: Building2 },
    { label: "Gallery Assets", value: stats.totalGallery, href: "/admin/dashboard/gallery", icon: ImageIcon },
  ];

  const quickActions = [
    { label: "Add News", href: "/admin/dashboard/news/create", icon: Newspaper },
    { label: "Add Announcement", href: "/admin/dashboard/announcements/create", icon: Megaphone },
    { label: "Add Project", href: "/admin/dashboard/projects/create", icon: Building2 },
    { label: "Add Gallery", href: "/admin/dashboard/gallery/create", icon: ImageIcon },
  ];

  return (
    <div className="space-y-9">
      {/* Header Overview */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#D71920]">
          EXECUTIVE OVERVIEW
        </span>
        <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#070707]">
          System Performance & Operations
        </h2>
        <p className="text-xs sm:text-sm text-neutral-500 font-normal">
          Official administrative content performance, live portal status, and quick management controls.
        </p>
      </div>

      {/* 6 Luxury Statistics Cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              href={card.href}
              className="flex items-center justify-between rounded-3xl border border-neutral-200/80 bg-white p-6 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-xl hover:border-[#D71920]/40 group"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-semibold text-neutral-500">{card.label}</p>
                  {card.status === "published" && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#070707] border border-[#070707] px-2.5 py-0.5 text-[10px] font-bold text-white">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#D71920] animate-pulse" />
                      Live
                    </span>
                  )}
                  {card.status === "draft" && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-[10px] font-bold text-slate-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                      Pending
                    </span>
                  )}
                </div>
                <p className="font-serif text-3xl sm:text-4xl font-normal text-[#070707] group-hover:text-[#D71920] transition-colors">
                  {card.value}
                </p>
              </div>

              {Icon && (
                <div className="flex h-13 w-13 items-center justify-center rounded-full bg-[#D71920]/10 text-[#D71920] border border-[#D71920]/20 group-hover:bg-[#D71920] group-hover:text-white transition-all duration-300 shadow-xs">
                  <Icon className="h-5 w-5" />
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {/* Compact Quick Actions */}
      <div className="space-y-3.5">
        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#D71920]">
          Quick Actions
        </h3>
        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.label}
                href={action.href}
                className="flex items-center justify-center gap-2.5 rounded-full border border-neutral-200/90 bg-white px-5 py-3 text-xs font-bold text-[#070707] shadow-xs transition-all duration-200 hover:border-[#D71920] hover:text-[#D71920] hover-lift cursor-pointer"
              >
                <Icon className="h-4 w-4 text-[#D71920]" />
                <span>{action.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent News Items preview */}
      <div className="rounded-3xl border border-neutral-200/80 bg-white p-7 sm:p-8 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-[#070707]">
              Recent Content Updates
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Recently updated news stories and municipal announcements
            </p>
          </div>
          <Link
            href="/admin/dashboard/news"
            className="text-xs font-bold text-[#D71920] hover:underline"
          >
            Manage Content
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {recentNews.length > 0 ? (
            recentNews.map((item) => {
              const title = getLocalizedText(item.title, "en") || getLocalizedText(item.title, "om");
              const isPublished = item.status === "published";
              return (
                <div key={item.id} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3 min-w-0 pr-4">
                    {item.image ? (
                      <img src={item.image} alt="" className="h-9 w-12 rounded-lg object-cover shrink-0 bg-slate-100" />
                    ) : (
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 font-bold text-[#070707] text-xs shrink-0">
                        BM
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-[#070707]">{title}</p>
                      <p className="text-[11px] text-slate-500">{item.date} • {item.category}</p>
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold shrink-0 ${
                      isPublished ? "bg-[#070707] text-white border border-[#070707]" : "bg-white text-slate-600 border border-slate-300"
                    }`}
                  >
                    {isPublished ? "Published" : "Draft"}
                  </span>
                </div>
              );
            })
          ) : (
            <p className="py-4 text-xs text-slate-500">No content items recorded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
