"use client";

import { Users, ClipboardCheck, Building2, Users2 } from "lucide-react";
import { useTranslation } from "@/src/context/LanguageContext";

export default function MesobStats({ stats = {}, className = "" }) {
  const { t } = useTranslation();

  const statItems = [
    {
      key: "employees",
      number: stats.employees || "150+",
      label: t("stats.employees", "Employees"),
      description: "Dedicated MESOB public staff",
      icon: Users,
    },
    {
      key: "services",
      number: stats.services || "35+",
      label: t("stats.services", "Services"),
      description: "Physical & digital public services",
      icon: ClipboardCheck,
    },
    {
      key: "departments",
      number: stats.departments || "12",
      label: t("stats.departments", "Departments"),
      description: "Administrative operational desks",
      icon: Building2,
    },
    {
      key: "dailyVisitors",
      number: stats.dailyVisitors || "1,200+",
      label: t("stats.dailyServed", "Daily Served Citizens"),
      description: "Citizens assisted daily at MESOB",
      icon: Users2,
    },
  ];

  return (
    <div className={`space-y-6 ${className}`} id="mesob-stats">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#176B3A]/20 bg-[#F5F7F6] px-4 py-1 text-[11px] font-bold uppercase tracking-wider text-[#176B3A]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#176B3A]" />
          <span>Official Administrative Metrics</span>
        </span>
        <h2 className="text-3xl font-black tracking-tight text-[#17221B] sm:text-4xl">
          MESOB STATISTICS
        </h2>
        <p className="text-xs sm:text-sm text-neutral-600 font-medium">
          Key performance statistics of Burayu MESOB administrative operations and citizen services.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.key}
              className="relative overflow-hidden rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md hover:border-[#176B3A]/60 group"
            >
              {/* Top Accent Line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#176B3A]" />

              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#176B3A]/10 text-[#176B3A] shadow-xs">
                  <Icon className="h-6 w-6" />
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-[#F5F7F6] border border-neutral-200 text-[#176B3A] px-2.5 py-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#176B3A]" />
                  Verified
                </span>
              </div>

              <div className="mt-5">
                <p className="text-3xl sm:text-4xl font-black tracking-tight text-[#176B3A] transition">
                  {item.number}
                </p>
                <p className="mt-1 text-base font-bold text-[#17221B]">
                  {item.label}
                </p>
                <p className="mt-1 text-xs text-neutral-500 font-normal">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
