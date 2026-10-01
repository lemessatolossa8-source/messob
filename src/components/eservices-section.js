"use client";

import { Monitor, ExternalLink, ShieldCheck, Sparkles, Lock } from "lucide-react";
import { useTranslation } from "@/src/context/LanguageContext";

export default function EServicesSection({ className = "" }) {
  const { t } = useTranslation();

  const digitalServices = [
    {
      id: "eland",
      title: "E-Land",
      subtitle: "Online Land Services",
      description: "Access online land registry, plot identification, and municipal land service applications.",
      url: "https://eland.shaggarcity.et/",
      status: "active",
      icon: "🌐",
    },
    {
      id: "econference",
      title: "E-Conference",
      subtitle: "Online Conference Portal",
      description: "Access official municipal virtual conference rooms and administrative meeting portals.",
      url: "https://shaggarcity.oo.et/?module=login",
      status: "active",
      icon: "💻",
    },
    {
      id: "etrade",
      title: "E-Trade",
      subtitle: "Online Trade Services",
      description: "Access national trade licensing, commercial permits, and business registration services.",
      url: "https://etrade.gov.et/",
      status: "active",
      icon: "🏢",
    },
    {
      id: "eservice-portal",
      title: "E-Service Gateway",
      subtitle: "Central Digital Gateway",
      description: "Official online public service portal for Shaggar City Administration & Burayu Branch.",
      url: "https://eservice.shaggarcity.et/",
      status: "active",
      icon: "⚡",
    },
    {
      id: "elibrary",
      title: "E-Library",
      subtitle: "Digital Library Portal",
      description: "Online digital public library, municipal research archives, and educational materials.",
      url: null,
      status: "coming_soon",
      icon: "📚",
    },
    {
      id: "etax",
      title: "E-Tax & Revenue",
      subtitle: "Online Tax Filing",
      description: "Online municipal tax clearance, fee assessment, and revenue filing platform.",
      url: null,
      status: "coming_soon",
      icon: "💳",
    },
  ];

  return (
    <div className={`space-y-8 ${className}`} id="e-services">
      {/* Section Header */}
      <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#176B3A]/20 bg-[#F5F7F6] px-4 py-1.5 text-xs font-bold text-[#176B3A]">
          <Monitor className="h-4 w-4 text-[#176B3A]" />
          <span>COMPUTER / DIGITAL SERVICES</span>
        </div>

        <h2 className="text-3xl font-black tracking-tight text-[#17221B] sm:text-4xl">
          E-SERVICE — ONLINE DIGITAL SERVICES
        </h2>

        <p className="text-xs sm:text-sm text-neutral-600 font-medium leading-relaxed">
          Access available Burayu MESOB digital public services online from anywhere.
        </p>
      </div>

      {/* Grid of E-Services */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {digitalServices.map((service) => {
          const isActive = service.status === "active" && service.url;

          return (
            <div
              key={service.id}
              className={`group relative flex flex-col justify-between rounded-2xl border p-6 sm:p-7 transition-all duration-200 ${
                isActive
                  ? "border-neutral-200/80 bg-white shadow-xs hover:border-[#176B3A]/60 hover:shadow-md hover:-translate-y-0.5"
                  : "border-neutral-200/60 bg-[#F5F7F6] opacity-75"
              }`}
            >
              <div>
                {/* Header Badge */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-2xl">{service.icon}</span>
                  {isActive ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#176B3A]/10 text-[#176B3A] border border-[#176B3A]/25 px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#176B3A]" />
                      Official Active Portal
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-neutral-200 text-neutral-600 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider">
                      <Lock className="h-3 w-3" />
                      Coming Soon
                    </span>
                  )}
                </div>

                <h3 className="mt-5 text-xl font-bold text-[#17221B] group-hover:text-[#176B3A] transition">
                  {service.title}
                </h3>
                <p className="text-xs font-semibold text-neutral-500 mt-0.5">
                  {service.subtitle}
                </p>

                <p className="mt-3 text-xs sm:text-sm text-neutral-600 leading-relaxed font-normal">
                  {service.description}
                </p>
              </div>

              {/* Action Button */}
              <div className="mt-6 pt-4 border-t border-neutral-100">
                {isActive ? (
                  <a
                    href={service.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#176B3A] hover:bg-[#0F5132] text-white px-5 py-3 text-xs font-bold uppercase tracking-wider shadow-xs transition active:scale-[0.98]"
                  >
                    <span>Open E-Service</span>
                    <ExternalLink className="h-4 w-4 text-white" />
                  </a>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-200 text-neutral-500 px-5 py-3 text-xs font-medium uppercase tracking-wider cursor-not-allowed"
                  >
                    <span>Not Available — Coming Soon</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
