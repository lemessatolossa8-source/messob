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

      // News count and recent items from real API
      let newsTotal = 0;
      try {
        const newsRes = await newsService.getAll({ limit: 4 });
        newsTotal = newsRes.total || 0;
        setRecentNews(newsRes.items || []);
      } catch {
        setRecentNews([]);
      }

      // Announcement count from real API
      let announcementsTotal = 0;
      try {
        const annRes = await announcementService.getAll({ limit: 1 });
        announcementsTotal = annRes.total || 0;
      } catch { /* ignore */ }

      // Gallery count from real API
      let galleryTotal = 0;
      try {
        const galleryRes = await galleryService.getAll({ limit: 1 });
        galleryTotal = galleryRes.total || 0;
      } catch { /* ignore */ }

      // Project count from real API
      let projectsTotal = 0;
      try {
        const projectRes = await projectService.getAll({ limit: 1 });
        projectsTotal = projectRes.total || 0;
      } catch { /* ignore */ }

      setStats({
        ...baseStats,
        totalNews: newsTotal,
        totalAnnouncements: announcementsTotal,
        totalProjects: projectsTotal,
        totalGallery: galleryTotal,
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
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-600 border-r-transparent"></div>
          <p className="text-sm text-slate-600">Loading dashboard...</p>
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
    <div className="space-y-8">
      {/* Header Overview */}
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-extrabold text-[#070707]">System Overview</h2>
        <p className="text-xs text-slate-500">Official administrative content performance and Quick Management controls.</p>
      </div>

      {/* 6 Clean White Statistics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              href={card.href}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-slate-300 hover:shadow-sm"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-semibold text-slate-500">{card.label}</p>
                  {card.status === "published" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                      Live
                    </span>
                  )}
                  {card.status === "draft" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-600" />
                      Pending
                    </span>
                  )}
                </div>
                <p className="text-2xl font-black text-[#070707]">{card.value}</p>
              </div>

              {Icon && (
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                  <Icon className="h-5 w-5" />
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {/* Compact Quick Actions */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Quick Actions
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.label}
                href={action.href}
                className="flex items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-[#070707] shadow-xs transition hover:border-[#FE0002] hover:text-[#FE0002]"
              >
                <Icon className="h-4 w-4 text-[#FE0002]" />
                <span>{action.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent News Items preview */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-[#070707]">Recent Content Updates</h3>
            <p className="text-xs text-slate-500">Recently updated news stories and municipal announcements</p>
          </div>
          <Link
            href="/admin/dashboard/news"
            className="text-xs font-bold text-[#FE0002] hover:underline"
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
                      isPublished ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"
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
