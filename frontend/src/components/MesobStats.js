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
    <div className={`space-y-8 ${className}`} id="MesobStats">
      <div className="text-center max-w-2xl mx-auto">
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider bg-[#D71920] text-white shadow-sm hover:bg-[#b5141a] transition-all duration-300 cursor-pointer"
        >
          {t("stats.title", "MESOB Statistics")}
        </button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.length > 0 ? (
          stats.map((item, index) => {
            const Icon = STAT_ICONS[item.icon] || BarChart2;
            return (
              <div
                key={item.id || index}
                className="relative overflow-hidden rounded-3xl border border-neutral-200/80 bg-white p-7 shadow-sm transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-2xl hover:border-[#D71920]/40 group"
              >
                {/* Top Accent Line (Abba Gadaa Red #D71920) */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-[#D71920]" />

                <div className="flex items-center justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#D71920]/10 text-[#D71920] border border-[#D71920]/20 shadow-xs group-hover:bg-[#D71920] group-hover:text-white transition-all duration-300">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-slate-50 border border-slate-200 text-[#070707] px-3 py-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#D71920]" />
                    {t("stats.verified", "Verified")}
                  </span>
                </div>

                <div className="mt-6">
                  <p className="font-serif text-4xl sm:text-5xl font-normal tracking-tight text-[#070707] group-hover:text-[#D71920] transition-colors">
                    {item.value}
                  </p>
                  <p className="mt-2 text-base font-bold text-[#070707]">
                    {getText(item.title)}
                  </p>
                  <p className="mt-1 text-xs text-neutral-600 font-normal leading-relaxed">
                    {getText(item.description)}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-8 text-center text-neutral-500 text-sm">
            {t("stats.empty", "No statistics available.")}
          </div>
        )}
      </div>
    </div>
  );
}
