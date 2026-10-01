"use client";

import { useState, useEffect } from "react";
import PageHero from "@/components/page-hero";
import SectionHeading from "@/components/section-heading";
import AccessEServiceButton, { ESERVICE_URL } from "@/components/access-eservice-button";
import { ServiceCard } from "@/components/cards";
import { CategoryFilter } from "@/components/search-filter";
import { serviceService } from "@/src/services";
import { useTranslation } from "@/src/context/LanguageContext";
import { ExternalLink, Sparkles } from "lucide-react";

export default function ServicesPage() {
  const { t, getText } = useTranslation();
  const [services, setServices] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    const res = serviceService.getAll({ status: "published" });
    setServices(res.items);
  }, []);

  const categories = ["All", ...new Set(services.map((item) => item.category).filter(Boolean))];

  const filteredServices =
    activeCategory === "All"
      ? services
      : services.filter((s) => s.category === activeCategory);

  return (
    <div className="space-y-16 pb-16">
      {/* Page Hero */}
      <PageHero
        eyebrow={t("services.eyebrow", "Service Directory")}
        title={t("services.title", "Public & Municipal Services")}
        description={t(
          "services.description",
          "Information, prerequisites, and guidance for municipal, business, land, and digital e-services in Burayu."
        )}
        image=""
        secondaryAction={{ label: t("nav.accessEService", "Access E-Service"), href: ESERVICE_URL, external: true }}
      />

      <div className="container-shell space-y-12">
        {/* Shaggar E-Service Highlight Banner */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 rounded-3xl border border-amber-300/80 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-6 sm:p-8">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/20 px-3 py-0.5 text-[11px] font-bold text-amber-900">
              <Sparkles className="h-3.5 w-3.5 text-amber-600" />
              <span>Official Government Portal Gateway</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950">
              Shaggar City E-Service Platform
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl">
              Electronic public service applications, trade permit processing, and revenue services are processed on the official external gateway.
            </p>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex justify-center">
          <CategoryFilter
            categories={categories}
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
          />
        </div>

        {/* Services Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredServices.map((item) => (
            <ServiceCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
