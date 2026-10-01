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
import { siteService, newsService, announcementService, eventService, projectService } from "@/src/services";
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

  useEffect(() => {
    const loadStats = async () => {
      // Sync stats from storageStore (all except projects)
      const baseStats = siteService.getStats();
      const newsRes = newsService.getAll({ limit: 4 });
      setRecentNews(newsRes.items);

      // Async project count from real API
      let projectsTotal = 0;
      try {
        const projectRes = await projectService.getAll({ limit: 1 });
        projectsTotal = projectRes.total || 0;
      } catch {
        // Backend may be down — show 0
      }

      setStats({
        ...baseStats,
        totalProjects: projectsTotal,
      });
    };

    loadStats();
    const unsubscribe = siteService.subscribe(loadStats);
    return () => unsubscribe();
  }, []);

  const statCards = [
    { label: "Total Projects", value: stats.totalProjects, icon: Building2, color: "bg-emerald-50 text-emerald-800 border-emerald-200", href: "/admin/dashboard/projects" },
    { label: "Total News", value: stats.totalNews, icon: Newspaper, color: "bg-blue-50 text-blue-800 border-blue-200", href: "/admin/dashboard/news" },
    { label: "Total Announcements", value: stats.totalAnnouncements, icon: Megaphone, color: "bg-amber-50 text-amber-800 border-amber-200", href: "/admin/dashboard/announcements" },
    { label: "Total Notices", value: stats.totalNotices, icon: BellRing, color: "bg-purple-50 text-purple-800 border-purple-200", href: "/admin/dashboard/notices" },
    { label: "Gallery Assets", value: stats.totalGallery, icon: ImageIcon, color: "bg-rose-50 text-rose-800 border-rose-200", href: "/admin/dashboard/gallery" },
  ];

  const quickActions = [
    { label: "Add Project", href: "/admin/dashboard/projects/create", icon: Building2, bg: "bg-emerald-600" },
    { label: "Add News", href: "/admin/dashboard/news/create", icon: Newspaper, bg: "bg-blue-600" },
    { label: "Add Announcement", href: "/admin/dashboard/announcements/create", icon: Megaphone, bg: "bg-amber-600" },
    { label: "Add Notice", href: "/admin/dashboard/notices/create", icon: BellRing, bg: "bg-purple-600" },
    { label: "Add Gallery", href: "/admin/dashboard/gallery/create", icon: ImageIcon, bg: "bg-rose-600" },
  ];

  return (
    <div className="space-y-8">


      {/* Global Status Bar: Published vs Draft */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50/80 p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-900">Live Published</p>
              <p className="text-2xl font-extrabold text-emerald-950">{stats.published}</p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100 rounded-full px-3 py-1">
            Visible on Public Site
          </span>
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-amber-200 bg-amber-50/80 p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-md shadow-amber-500/20">
              <FileClock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-amber-900">Draft / Pending</p>
              <p className="text-2xl font-extrabold text-amber-950">{stats.draft}</p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-amber-800 bg-amber-100 rounded-full px-3 py-1">
            Admin Preview Only
          </span>
        </div>
      </div>

      {/* Section Stats Grid */}
      <div>
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-500 mb-4">
          Content Metrics
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.label}
                href={card.href}
                className={`group flex items-center justify-between rounded-2xl border p-5 shadow-xs transition hover:shadow-md hover:-translate-y-0.5 ${card.color}`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/80 shadow-xs">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold">{card.label}</p>
                    <p className="text-2xl font-black">{card.value}</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 opacity-40 transition group-hover:translate-x-1 group-hover:opacity-100" />
              </Link>
            );
          })}
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div>
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-500 mb-4">
          Quick Actions
        </h3>
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.label}
                href={action.href}
                className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-xs transition hover:border-slate-400 hover:shadow-md group"
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-white ${action.bg} shadow-sm group-hover:scale-105 transition`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="mt-3 text-xs font-bold text-slate-800 line-clamp-1">{action.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent News Items preview */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Recent News Items</h3>
            <p className="text-xs text-slate-500">Recently published and drafted municipal stories</p>
          </div>
          <Link
            href="/admin/dashboard/news"
            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 hover:underline"
          >
            <span>Manage All News</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {recentNews.map((item) => {
            const title = getLocalizedText(item.title, "en") || getLocalizedText(item.title, "om");
            const isPublished = item.status === "published";
            return (
              <div key={item.id} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3 min-w-0 pr-4">
                  {item.image ? (
                    <img src={item.image} alt="" className="h-9 w-12 rounded-lg object-cover shrink-0 bg-slate-100" />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 font-bold text-emerald-900 text-xs shrink-0">
                      N
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-slate-900">{title}</p>
                    <p className="text-[11px] text-slate-500">{item.date} • {item.category}</p>
                  </div>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold shrink-0 ${
                    isPublished ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-900"
                  }`}
                >
                  {isPublished ? "Published" : "Draft"}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
