"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import SectionHeading from "@/components/SectionHeading";
import AccessEServiceButton from "@/components/AccessEserviceButton";
import { useSiteSettings } from "@/src/context/SiteSettingsContext";
import { siteService } from "@/src/services";
import { useTranslation } from "@/src/context/LanguageContext";
import { ArrowRight, CheckCircle2, Landmark, ShieldCheck, Users, Sprout } from "lucide-react";

export default function AboutPage() {
  const { t, getText, language } = useTranslation();
  const { settings } = useSiteSettings();
  const [cityInfo, setCityInfo] = useState(null);

  const mayorMessage = settings?.mayorMessage;
  const activeMsg = mayorMessage?.[language] || mayorMessage?.om || mayorMessage?.en || mayorMessage?.am;
  const mayorPhoto = mayorMessage?.photo || activeMsg?.photo;

  const loadData = () => {
    setCityInfo(siteService.getCityInfo());
  };

  useEffect(() => {
    loadData();
    const unsub = siteService.subscribe(loadData);
    return () => unsub();
  }, []);

  const mission = getText(cityInfo?.mission) || t("about.missionDesc", "Deliver reliable public information...");
  const vision = getText(cityInfo?.vision) || t("about.visionDesc", "Become a modern, trusted portal...");
  const objective = getText(cityInfo?.objectives) || t("about.objectiveDesc", "Provide a scalable digital foundation...");

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
              <div className="relative mx-auto aspect-square w-full max-w-[280px] overflow-hidden rounded-2xl border-2 border-[#FE0002]/40 shadow-xl">
                <img
                  src={mayorPhoto || "/images/mr-essayas.jpg"}
                  alt={activeMsg?.name || "Mayor of Burayu MESOB"}
                  className="h-full w-full object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 rounded-xl bg-black/80 px-3 py-1.5 backdrop-blur text-center border border-white/10">
                  <p className="text-xs font-black text-white">{activeMsg?.name || "Mr. Abate Asirat"}</p>
                  <p className="text-[10px] text-slate-300 font-medium">{activeMsg?.jobTitle || "Burayu MESOB"}</p>
                </div>
              </div>

              {/* Administrator Message & Details */}
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#FE0002]/30 bg-[#FE0002]/10 px-3.5 py-1 text-xs font-bold text-[#FE0002]">
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
          eyebrow={t("about.values", "Core Values")}
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



      {/* 4. Location & Contact Information */}
      <section className="container-shell">
        <SectionHeading
          eyebrow={t("locationMap.findUs", "FIND US")}
          title={t("locationMap.locationContact", "Location & Contact")}
          description={t("locationMap.locationDesc", "Official Burayu MESOB administration location and contact information.")}
        />

        <div className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-sm">
          <div className="grid gap-0 lg:grid-cols-12">
            {/* Left Side: Interactive Map */}
            <div className="relative min-h-[380px] lg:col-span-7 bg-neutral-100 overflow-hidden">
              <iframe
                title="Burayu MESOB Official Location Map"
                width="100%"
                height="100%"
                className="absolute inset-0 h-full w-full border-0 filter contrast-[1.05]"
                loading="lazy"
                allowFullScreen
                src="https://www.openstreetmap.org/export/embed.html?bbox=38.632%2C9.041%2C38.662%2C9.071&layer=mapnik&marker=9.056%2C38.647"
              />

              {/* Interactive Floating Location Badge */}
              <div className="absolute top-4 left-4 z-10 flex items-center gap-2 rounded-xl border border-white/20 bg-[#070707] p-3 text-white shadow-md">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FE0002] text-white shrink-0">
                  <Landmark className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold tracking-wide text-white">{t("locationMap.findUs", "FIND US")}</p>
                  <p className="text-[11px] font-medium text-neutral-200">{t("locationMap.cityRegion", "Burayu, Oromia, Ethiopia")}</p>
                </div>
              </div>
            </div>

            {/* Right Side: Official Contact & Navigation Info */}
            <div className="flex flex-col justify-between p-6 sm:p-8 lg:col-span-5 bg-white text-[#070707] border-l border-neutral-200/80">
              <div>

                <div className="inline-flex items-center gap-1.5 rounded-full border border-[#FE0002]/20 bg-slate-50 px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[#FE0002]">
                  <Users className="h-3.5 w-3.5 text-[#FE0002]" />
                  <span>{t("locationMap.officialDesk", "Official Administration Desk")}</span>
                </div>

                <h3 className="mt-4 text-2xl font-black tracking-tight text-[#070707]">
                  {t("locationMap.locationTitle", "Burayu MESOB Location")}
                </h3>

                <p className="mt-2 text-xs text-neutral-600 leading-relaxed font-normal">
                  {t("locationMap.subTitleDesc", "Wiirtuu Tajaajila Tokkooffaa (MESOB) Bulchiinsa Magaalaa Shaggaritti Damee Buraayyuu.")}
                </p>

                <div className="mt-6 space-y-4 text-xs">
                  <div className="flex items-start gap-3">
                    <Landmark className="h-4 w-4 text-[#FE0002] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-neutral-500 uppercase tracking-wider text-[10px]">{t("locationMap.officialAddress", "Official Address")}</p>
                      <p className="text-[#070707] font-semibold mt-0.5">
                        {getText(settings?.contactInfo?.address) || "Burayu MESOB Administration, Shaggar City, Oromia, Ethiopia"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Users className="h-4 w-4 text-[#FE0002] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-neutral-500 uppercase tracking-wider text-[10px]">{t("locationMap.contactDesk", "Contact Desk")}</p>
                      <p className="text-[#070707] font-semibold mt-0.5">{settings?.contactInfo?.phone || "+251944664433"}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Users className="h-4 w-4 text-[#FE0002] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-neutral-500 uppercase tracking-wider text-[10px]">{t("locationMap.officialEmail", "Official Email")}</p>
                      <p className="text-[#070707] font-semibold mt-0.5">{settings?.contactInfo?.email || "mesobburayubranch@gmail.com"}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-4 w-4 text-[#FE0002] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-neutral-500 uppercase tracking-wider text-[10px]">{t("locationMap.workingInfo", "Working Information")}</p>
                      <p className="text-[#070707] font-semibold mt-0.5">{getText(settings?.contactInfo?.workingHours) || "Mon - Fri: 8:30 AM - 5:30 PM | Sat: 8:30 AM - 12:30 PM"}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-neutral-100">
                <a
                  href="https://maps.google.com/?q=Burayu+Administration+Shaggar+Oromia+Ethiopia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#FE0002] hover:bg-[#CC0002] px-6 py-3.5 text-xs font-bold uppercase text-white shadow-xs transition-all duration-200 hover:shadow-md hover:-translate-y-[2px] active:translate-y-0 active:scale-[0.98]"
                >
                  <span>{t("locationMap.viewOnGoogleMaps", "View on Google Maps")}</span>
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>


    </div>
  );
}
