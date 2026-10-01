"use client";

import PageHero from "@/components/page-hero";
import SectionHeading from "@/components/section-heading";
import { InvestmentCard } from "@/components/cards";
import AccessEServiceButton, { ESERVICE_URL } from "@/components/access-eservice-button";
import { useTranslation } from "@/src/context/LanguageContext";
import {
  Factory,
  Building,
  Truck,
  Hotel,
  Cpu,
  Sprout,
  CheckCircle2,
  TrendingUp,
  Landmark,
  ArrowRight,
} from "lucide-react";

export default function InvestmentPage() {
  const { t } = useTranslation();

  const investmentSectors = [
    {
      title: "Manufacturing & Light Industry",
      description:
        "Strategic industrial zones with proximity to major transit corridors, reliable power connections, and accessible labor markets.",
      icon: Factory,
      details: "Priority: Agro-processing, construction materials, textile, packaging.",
    },
    {
      title: "Logistics & Warehousing",
      description:
        "Hub opportunities along the Western logistics arterial corridor connecting Addis Ababa to western Oromia trade networks.",
      icon: Truck,
      details: "Priority: Dry port links, cold storage, regional freight consolidation.",
    },
    {
      title: "Commercial Real Estate",
      description:
        "Modern mixed-use developments, business plazas, retail hubs, and financial service centers in central Burayu.",
      icon: Building,
      details: "Priority: Commercial complexes, corporate offices, trade centers.",
    },
    {
      title: "Hospitality & Tourism",
      description:
        "Hotels, recreational centers, cultural venues, and conference facilities serving regional and international visitors.",
      icon: Hotel,
      details: "Priority: Eco-resorts, business hotels, convention spaces.",
    },
    {
      title: "ICT & Digital Services",
      description:
        "Tech incubation spaces, business process outsourcing (BPO), and digital municipal infrastructure partnerships.",
      icon: Cpu,
      details: "Priority: Software development, digital service centers, data facilities.",
    },
    {
      title: "Urban Agriculture & Green Initiatives",
      description:
        "Sustainable urban farming, horticulture, waste management, and green energy projects aligned with municipal climate goals.",
      icon: Sprout,
      details: "Priority: Greenhouse horticulture, organic composting, solar lighting.",
    },
  ];

  const advantages = [
    "Strategic location adjacent to the capital city with arterial road connectivity",
    "Expansive industrial and commercial zoning with dedicated municipal facilitation",
    "Growing skilled and semi-skilled labor pool across diverse sectors",
    "One-stop administrative support for land access, licensing, and utility connections",
    "Direct electronic service processing via the Shaggar E-Service platform",
    "Pro-investment municipal policies with attractive local incentives",
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* Page Hero */}
      <PageHero
        eyebrow={t("investment.eyebrow", "Economic Opportunities")}
        title={t("investment.title", "Invest in Burayu")}
        description={t(
          "investment.description",
          "Discover strategic economic sectors, competitive advantages, and municipal incentives for investors and businesses in Burayu."
        )}
        image=""
        primaryAction={{ label: t("investment.cta", "Inquire Today"), href: "/contact" }}
        secondaryAction={{ label: t("nav.accessEService", "Access E-Service"), href: ESERVICE_URL, external: true }}
      />

      <div className="container-shell space-y-16">
        {/* Why Invest */}
        <section>
          <SectionHeading
            eyebrow="Competitive Advantage"
            title="Why Burayu MESOB?"
            description="A rapidly expanding economic corridor with modern infrastructure, strategic location, and dedicated municipal facilitation."
          />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {advantages.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <p className="text-xs sm:text-sm font-medium text-slate-700 leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Priority Sectors */}
        <section>
          <SectionHeading
            eyebrow="Strategic Focus"
            title="Priority Investment Sectors"
            description="Explore key sectors targeted for high-impact private investment and municipal partnership."
          />

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {investmentSectors.map((sector) => (
              <InvestmentCard key={sector.title} item={sector} />
            ))}
          </div>
        </section>

        {/* Investment Support & E-Service */}
        <section className="rounded-3xl border border-emerald-800/30 bg-emerald-950 p-8 sm:p-12 text-white shadow-xl">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-amber-400">
                Investor Support Desk
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold">Ready to Explore Opportunities?</h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Our Investment Facilitation Bureau provides end-to-end guidance on land acquisition, licensing, sector incentives, and environmental clearances.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 lg:justify-end">
              <a
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-xs font-bold text-slate-950 hover:bg-slate-100 transition shadow-md"
              >
                <span>{t("investment.contactBureau", "Contact Investment Bureau")}</span>
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
