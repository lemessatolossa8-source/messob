"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageHero from "@/components/page-hero";
import SectionHeading from "@/components/section-heading";
import AccessEServiceButton from "@/components/access-eservice-button";
import { siteService } from "@/src/services";
import { useTranslation } from "@/src/context/LanguageContext";
import { ArrowRight, CheckCircle2, Landmark, ShieldCheck, UserCheck, Users, Sprout } from "lucide-react";

export default function AboutPage() {
  const { t, getText } = useTranslation();
  const [cityInfo, setCityInfo] = useState(null);
  const [mayorMessage, setMayorMessage] = useState(null);

  const loadData = () => {
    setCityInfo(siteService.getCityInfo());
    setMayorMessage(siteService.getMayorMessage());
  };

  useEffect(() => {
    loadData();
    const unsub = siteService.subscribe(loadData);
    return () => unsub();
  }, []);

  const mission = getText(cityInfo?.mission) || t("about.missionDesc", "Deliver reliable public information...");
  const vision = getText(cityInfo?.vision) || t("about.visionDesc", "Become a modern, trusted portal...");
  const objective = getText(cityInfo?.objectives) || t("about.objectiveDesc", "Provide a scalable digital foundation...");

  const leadershipItems = [
    {
      name: "Office of the Administrator",
      role: "Executive Leadership",
      description:
        "Oversees municipal strategy, administrative governance, public service quality, and economic coordination across Burayu MESOB.",
    },
    {
      name: "Deputy Administration Office",
      role: "Governance & Operations",
      description:
        "Coordinates inter-departmental operations, infrastructure projects implementation, and neighborhood administration offices.",
    },
    {
      name: "Public Communication Bureau",
      role: "Information & Outreach",
      description:
        "Manages official public portal disclosures, media inquiries, community engagement, and citizen communication channels.",
    },
  ];

  const organizationPoints = [
    "Structured public information architecture ready for CMS and database integration",
    "Dedicated navigation for public notices, events, projects, and investment content",
    "Prominent external e-service gateway linking directly to Shaggar E-Service",
    "Comprehensive multilingual support in Afaan Oromoo, Amharic, and English",
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* Page Hero */}
      <PageHero
        eyebrow={t("about.eyebrow", "Institutional Gateway")}
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
      <section className="container-shell">
        <SectionHeading
          eyebrow={t("about.leadershipEyebrow", "Governance & Structure")}
          title={t("about.leadershipTitle", "Leadership & Administrative Offices")}
          description={t("about.leadershipDesc", "Key public administrative leadership and departments serving Burayu MESOB.")}
        />

        {/* Administrator Profile Card */}
        {mayorMessage && mayorMessage.status !== "draft" && (
          <div className="mb-12 overflow-hidden rounded-3xl border border-emerald-900/20 bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 p-6 sm:p-10 text-white shadow-2xl">
            <div className="grid gap-8 lg:grid-cols-[300px_1fr] lg:items-center">
              {/* Portrait Image */}
              <div className="relative mx-auto aspect-square w-full max-w-[280px] overflow-hidden rounded-2xl border-2 border-amber-400/40 shadow-xl">
                <img
                  src={mayorMessage.photo || "/images/mr-essayas.jpg"}
                  alt={mayorMessage.name || "Mayor of Burayu Sub city"}
                  className="h-full w-full object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 rounded-xl bg-black/60 px-3 py-1.5 backdrop-blur text-center">
                  <p className="text-xs font-black text-amber-400">{mayorMessage.name || "Mr. Abate Asirat"}</p>
                  <p className="text-[10px] text-slate-300 font-medium">{mayorMessage.jobTitle || "Burayu Sub city Administration"}</p>
                </div>
              </div>

              {/* Administrator Message & Details */}
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3.5 py-1 text-xs font-bold text-amber-400">
                  <span>{getText(mayorMessage.welcomeMessage) || "Welcome Message from the Burayu Sub city Administration"}</span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {getText(mayorMessage.title) || "A Warm Welcome to the Residents and Visitors of Burayu Sub city"}
                </h3>
                <p className="text-sm font-semibold text-emerald-300">
                  {mayorMessage.name || "Mr. Abate Asirat"} — {mayorMessage.jobTitle || "Burayu Sub city Administration"}
                </p>

                <blockquote className="border-l-2 border-amber-400 pl-4 text-xs sm:text-sm text-slate-200 leading-relaxed italic">
                  &ldquo;{getText(mayorMessage.message) || "Our commitment at Burayu MESOB is to deliver modern, efficient, transparent, and dignified municipal services to every citizen and investor."}&rdquo;
                </blockquote>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
                  <div className="rounded-xl bg-white/5 p-3 border border-white/10">
                    <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Office</p>
                    <p className="font-bold text-slate-100 mt-0.5">Central Administration</p>
                  </div>
                  <div className="rounded-xl bg-white/5 p-3 border border-white/10">
                    <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Public Service</p>
                    <p className="font-bold text-slate-100 mt-0.5">Unified One-Stop Center</p>
                  </div>
                  <div className="rounded-xl bg-white/5 p-3 border border-white/10 col-span-2 sm:col-span-1">
                    <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Contact</p>
                    <p className="font-bold text-amber-400 mt-0.5">+251944664433</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Administrative Departments Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {leadershipItems.map((item) => (
            <div key={item.name} className="flex flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800">
                <UserCheck className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900">{item.name}</h3>
              <p className="text-xs font-semibold text-amber-700">{item.role}</p>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed flex-1">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Mission, Vision & Strategic Intent */}
      <section className="container-shell">
        <SectionHeading
          eyebrow={t("about.values", "Core Values")}
          title="Mission, Vision & Strategic Intent"
          description="Guiding principles driving transparent governance and modern public information delivery in Burayu."
        />

        <div className="grid gap-8 md:grid-cols-3">
          <div className="flex flex-col rounded-3xl border border-slate-200 bg-white p-8 shadow-xs transition hover:shadow-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-900 text-white shadow-sm">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="mt-5 text-lg font-bold text-slate-900">{t("about.mission", "Mission")}</h3>
            <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed">{mission}</p>
          </div>

          <div className="flex flex-col rounded-3xl border border-slate-200 bg-white p-8 shadow-xs transition hover:shadow-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-900 text-white shadow-sm">
              <Landmark className="h-6 w-6" />
            </div>
            <h3 className="mt-5 text-lg font-bold text-slate-900">{t("about.vision", "Vision")}</h3>
            <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed">{vision}</p>
          </div>

          <div className="flex flex-col rounded-3xl border border-slate-200 bg-white p-8 shadow-xs transition hover:shadow-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-900 text-white shadow-sm">
              <Sprout className="h-6 w-6" />
            </div>
            <h3 className="mt-5 text-lg font-bold text-slate-900">{t("about.objective", "Core Objective")}</h3>
            <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed">{objective}</p>
          </div>
        </div>
      </section>

      {/* 3. Architected for Future Integration */}
      <section className="bg-slate-900 py-16 text-white sm:py-20">
        <div className="container-shell grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-amber-400">
              Digital Architecture
            </span>
            <h2 className="mt-2 text-2xl sm:text-4xl font-extrabold text-white">
              {t("about.frameworkTitle", "Architected for Future Integration")}
            </h2>
            <p className="mt-4 text-xs sm:text-sm leading-relaxed text-slate-300">
              {t(
                "about.frameworkDesc",
                "Burayu MESOB is structured as a Phase I high-performance frontend interface, providing immediate public utility while allowing seamless future connections to backend CMS servers, databases, and e-government platforms."
              )}
            </p>

            <ul className="mt-8 space-y-3.5">
              {organizationPoints.map((point) => (
                <li key={point} className="flex items-start gap-3 text-xs sm:text-sm text-slate-200">
                  <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center">
              <p className="text-3xl font-black text-amber-400">3</p>
              <p className="mt-1 text-xs font-bold text-slate-300">Official Languages Supported</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center">
              <p className="text-3xl font-black text-amber-400">100%</p>
              <p className="mt-1 text-xs font-bold text-slate-300">Frontend CRUD Enabled</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center">
              <p className="text-3xl font-black text-amber-400">24/7</p>
              <p className="mt-1 text-xs font-bold text-slate-300">Public Service Guidance</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center">
              <p className="text-3xl font-black text-amber-400">1</p>
              <p className="mt-1 text-xs font-bold text-slate-300">Shaggar E-Service Gateway</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Location & Contact Information */}
      <section className="container-shell">
        <SectionHeading
          eyebrow="📍 FIND US"
          title="Location & Contact"
          description="Official Burayu MESOB administration location and contact information."
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
              <div className="absolute top-4 left-4 z-10 flex items-center gap-2 rounded-xl border border-white/20 bg-[#0F5132] p-3 text-white shadow-md">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#176B3A] text-white shrink-0">
                  <Landmark className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold tracking-wide text-white">FIND BURAYU MESOB</p>
                  <p className="text-[11px] font-medium text-neutral-200">Shaggar City Administration</p>
                </div>
              </div>
            </div>

            {/* Right Side: Official Contact & Navigation Info */}
            <div className="flex flex-col justify-between p-6 sm:p-8 lg:col-span-5 bg-white text-[#17221B] border-l border-neutral-200/80">
              <div>
                {/* Subtle Oromo Cultural Identity Accent Bar */}
                <div className="mb-3 flex h-1 w-14 overflow-hidden rounded-full">
                  <span className="w-3/4 bg-[#176B3A]" />
                  <span className="w-1/4 bg-[#B32025]" />
                </div>

                <div className="inline-flex items-center gap-1.5 rounded-full border border-[#176B3A]/20 bg-[#F5F7F6] px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[#176B3A]">
                  <Users className="h-3.5 w-3.5 text-[#176B3A]" />
                  <span>Official Administration Desk</span>
                </div>

                <h3 className="mt-4 text-2xl font-black tracking-tight text-[#17221B]">
                  Burayu MESOB Location
                </h3>

                <p className="mt-2 text-xs text-neutral-600 leading-relaxed font-normal">
                  Wiirtuu Tajaajila Tokkooffaa (MESOB) Bulchiinsa Magaalaa Shaggaritti Damee Buraayyuu.
                </p>

                <div className="mt-6 space-y-4 text-xs">
                  <div className="flex items-start gap-3">
                    <Landmark className="h-4 w-4 text-[#176B3A] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-neutral-500 uppercase tracking-wider text-[10px]">Official Address</p>
                      <p className="text-[#17221B] font-semibold mt-0.5">
                        {getText(cityInfo?.address) || "Burayu MESOB Administration, Shaggar City, Oromia, Ethiopia"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Users className="h-4 w-4 text-[#176B3A] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-neutral-500 uppercase tracking-wider text-[10px]">Contact Desk</p>
                      <p className="text-[#17221B] font-semibold mt-0.5">+251944664433</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Users className="h-4 w-4 text-[#176B3A] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-neutral-500 uppercase tracking-wider text-[10px]">Official Email</p>
                      <p className="text-[#17221B] font-semibold mt-0.5">mesobburayubranch@gmail.com</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-4 w-4 text-[#176B3A] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-neutral-500 uppercase tracking-wider text-[10px]">Working Hours</p>
                      <p className="text-[#17221B] font-semibold mt-0.5">Mon - Fri: 8:30 AM - 5:30 PM | Sat: 8:30 AM - 12:30 PM</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-neutral-100">
                <a
                  href="https://maps.google.com/?q=Burayu+Administration+Shaggar+Oromia+Ethiopia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#176B3A] hover:bg-[#0F5132] px-6 py-3.5 text-xs font-bold uppercase text-white shadow-xs transition active:scale-[0.98]"
                >
                  <span>View on Google Maps</span>
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Need Municipal Support or Guidance? */}
      <section className="container-shell">
        <div className="rounded-3xl border border-emerald-800/30 bg-emerald-950 p-8 sm:p-12 text-white shadow-xl text-center">
          <h2 className="text-2xl sm:text-3xl font-bold">Need Municipal Support or Guidance?</h2>
          <p className="mt-2 max-w-xl mx-auto text-xs sm:text-sm text-slate-300">
            Explore our service categories, download official guidance, or connect directly to the Shaggar E-Service external portal.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-xs font-bold text-slate-950 hover:bg-slate-100 transition"
            >
              <span>{t("actions.exploreServices", "View Public Services")}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
