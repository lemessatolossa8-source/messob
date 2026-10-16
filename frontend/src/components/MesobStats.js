"use client";

import {
  Users,
  BriefcaseBusiness,
  Building2,
  UserCheck,
  BarChart2,
  TrendingUp,
  Award,
  CheckCircle,
  Activity,
  Globe,
  ShieldCheck,
  Clock,
  Layers,
  Sparkles,
  FileCheck,
  FolderKanban,
} from "lucide-react";
import { useTranslation } from "@/src/context/LanguageContext";

const STAT_ICONS = {
  Users,
  BriefcaseBusiness,
  Building2,
  UserCheck,
  BarChart2,
  TrendingUp,
  Award,
  CheckCircle,
  Activity,
  Globe,
  ShieldCheck,
  Clock,
  Layers,
  Sparkles,
  FileCheck,
  FolderKanban,
};

export default function MesobStats({ stats = [], className = "" }) {
  const { t, getText } = useTranslation();

  return (
    <div className={`space-y-6 ${className}`} id="MesobStats">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#FE0002]/20 bg-white px-4 py-1 text-[11px] font-bold uppercase tracking-wider text-[#FE0002]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#FE0002]" />
          <span>{t("stats.eyebrow", "Official Administrative Metrics")}</span>
        </span>
        <h2 className="text-3xl font-black tracking-tight text-[#070707] sm:text-4xl">
          {t("stats.title", "MESOB STATISTICS")}
        </h2>
        <p className="text-xs sm:text-sm text-neutral-600 font-medium">
          {t("stats.desc", "Key performance statistics of Burayu MESOB administrative operations and citizen services.")}
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.length > 0 ? stats.map((item, index) => {
          const Icon = STAT_ICONS[item.icon] || BarChart2;
          return (
            <div
              key={item.id || index}
              className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md hover:border-[#FE0002]/60 group"
            >
              {/* Top Accent Line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#FE0002]" />

              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#070707] text-white shadow-xs group-hover:bg-[#FE0002] transition-colors">
                  <Icon className="h-6 w-6" />
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-slate-50 border border-slate-200 text-[#070707] px-2.5 py-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#FE0002]" />
                  {t("stats.verified", "Verified")}
                </span>
              </div>

              <div className="mt-5">
                <p className="text-3xl sm:text-4xl font-black tracking-tight text-[#070707] transition group-hover:text-[#FE0002]">
                  {item.value}
                </p>
                <p className="mt-1 text-base font-bold text-[#070707]">
                  {getText(item.title)}
                </p>
                <p className="mt-1 text-xs text-neutral-600 font-normal">
                  {getText(item.description)}
                </p>
              </div>
            </div>
          );
        }) : (
          <div className="col-span-full py-8 text-center text-neutral-500 text-sm">
            {t("stats.empty", "No statistics available.")}
          </div>
        )}
      </div>
    </div>
  );
}
