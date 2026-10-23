"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import PageHero from "@/components/PageHero";
import SectionHeading from "@/components/SectionHeading";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { siteService } from "@/services";
import { useTranslation } from "@/context/LanguageContext";
import { Landmark, ShieldCheck, Sprout } from "lucide-react";

export default function AboutPage() {
  const { t, getText, language } = useTranslation();
  const { settings } = useSiteSettings();
  const [localCityInfo, setLocalCityInfo] = useState(null);

  const mayorMessage = settings?.mayorMessage;
  const activeMsg = mayorMessage?.[language] || mayorMessage?.om || mayorMessage?.en || mayorMessage?.am;
  const mayorPhoto = mayorMessage?.photo || activeMsg?.photo;

  useEffect(() => {
    setLocalCityInfo(siteService.getCityInfo());
    const unsub = siteService.subscribe(() => {
      setLocalCityInfo(siteService.getCityInfo());
    });
    return () => unsub();
  }, []);

  // Prefer MySQL backend settings, fall back to local store
  const cityInfo = settings?.cityInfo || localCityInfo;

  const mission = getText(cityInfo?.mission) || t("about.missionDesc", "Deliver reliable public information...");
  const vision = getText(cityInfo?.vision) || t("about.visionDesc", "Become a modern, trusted portal...");
  const objective = getText(cityInfo?.objectives) || t("about.objectiveDesc", "Provide a scalable digital foundation...");
  const generalInfo = getText(cityInfo?.generalInfo);

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* Page Hero */}
      <PageHero
        title={t("about.title", "About Burayu MESOB")}
        description={
          getText(cityInfo?.about) ||
          t(
            "about.description",
            "The official public information portal established to deliver transparent civic disclosures, municipal service guidance, and digital gateway access."
          )
        }
        image=""
        primaryAction={{ label: t("nav.contact", "Contact Bureau"), href: "/contact" }}
      />

      {/* 1. Leadership & Administrative Offices */}
      {mayorMessage && mayorMessage.status !== "draft" && (
        <section className="container-shell">
          <SectionHeading
            title={t("about.leadershipTitle", "Leadership & Administrative Offices")}
            description={t("about.leadershipDesc", "Key public administrative leadership and departments serving Burayu MESOB.")}
          />

          {/* Administrator Profile Card */}
          <div className="overflow-hidden rounded-3xl border border-slate-800 bg-black p-6 sm:p-10 text-white shadow-2xl">
            <div className="grid gap-8 lg:grid-cols-[300px_1fr] lg:items-center">
              {/* Portrait Image */}
              <div className="relative mx-auto aspect-square w-full max-w-[280px] overflow-hidden rounded-2xl border-2 border-[#D71920]/40 shadow-xl bg-slate-900">
                <Image
                  src={mayorPhoto || "/images/burayu-mesob-logo.jpg"}
                  alt={activeMsg?.name || "Mayor of Burayu MESOB"}
                  fill
                  sizes="(max-width: 640px) 280px, 300px"
                  quality={75}
                  loading="lazy"
                  className="object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 rounded-xl bg-black/80 px-3 py-1.5 backdrop-blur text-center border border-white/10 z-10">
                  <p className="text-xs font-black text-white">{activeMsg?.name || "Mr. Abate Asirat"}</p>
                  <p className="text-[10px] text-slate-300 font-medium">{activeMsg?.jobTitle || "Burayu MESOB"}</p>
                </div>
              </div>

              {/* Administrator Message & Details */}
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#D71920]/30 bg-[#D71920]/10 px-3.5 py-1 text-xs font-bold text-[#D71920]">
                  <span>{activeMsg?.welcomeMessage || "Welcome Message from the Burayu MESOB"}</span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {activeMsg?.title || "A Warm Welcome to the Residents and Visitors of Burayu MESOB"}
                </h3>
                <p className="text-sm font-semibold text-[#FE0002]">
                  {activeMsg?.name || "Mr. Abate Asirat"} — <span className="text-white/80">{activeMsg?.jobTitle || "Burayu MESOB"}</span>
                </p>

                <blockquote className="border-l-2 border-[#FE0002] pl-4 text-xs sm:text-sm text-slate-200 leading-relaxed italic">
                  &ldquo;{activeMsg?.message || "Our commitment at Burayu MESOB is to deliver modern, efficient, transparent, and dignified municipal services to every citizen and investor."}&rdquo;
                </blockquote>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 2. Mission, Vision & Strategic Intent */}
      <section className="container-shell">
        <SectionHeading
          title="Mission, Vision & Strategic Intent"
          description="Guiding principles driving transparent governance and modern public information delivery in Burayu."
        />

        <div className="grid gap-8 md:grid-cols-3">
          <div className="group flex flex-col rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-md hover:border-[#FE0002]/30">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#070707] text-white transition-colors group-hover:bg-[#FE0002]">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <h3 className="mt-6 text-lg font-bold text-[#070707]">{t("about.mission", "Mission")}</h3>
            <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed">{mission}</p>
          </div>

          <div className="group flex flex-col rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-md hover:border-[#FE0002]/30">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#070707] text-white transition-colors group-hover:bg-[#FE0002]">
              <Landmark className="h-7 w-7" />
            </div>
            <h3 className="mt-6 text-lg font-bold text-[#070707]">{t("about.vision", "Vision")}</h3>
            <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed">{vision}</p>
          </div>

          <div className="group flex flex-col rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-md hover:border-[#FE0002]/30">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#070707] text-white transition-colors group-hover:bg-[#FE0002]">
              <Sprout className="h-7 w-7" />
            </div>
            <h3 className="mt-6 text-lg font-bold text-[#070707]">{t("about.objective", "Core Objective")}</h3>
            <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed">{objective}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
