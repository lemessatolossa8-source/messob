"use client";

import { Monitor, ExternalLink, Lock, Globe, Laptop, Building2, Zap, BookOpen, CreditCard } from "lucide-react";

export default function EServicesSection({ className = "" }) {

  const digitalServices = [
    {
      id: "eland",
      title: "E-Land",
      subtitle: "Online Land Services",
      description: "Access online land registry, plot identification, and municipal land service applications.",
      url: "https://eland.shaggarcity.et/",
      status: "active",
      Icon: Globe,
    },
    {
      id: "econference",
      title: "E-Conference",
      subtitle: "Online Conference Portal",
      description: "Access official municipal virtual conference rooms and administrative meeting portals.",
      url: "https://shaggarcity.oo.et/?module=login",
      status: "active",
      Icon: Laptop,
    },
    {
      id: "etrade",
      title: "E-Trade",
      subtitle: "Online Trade Services",
      description: "Access national trade licensing, commercial permits, and business registration services.",
      url: "https://etrade.gov.et/",
      status: "active",
      Icon: Building2,
    },
    {
      id: "eservice-portal",
      title: "E-Service Gateway",
      subtitle: "Central Digital Gateway",
      description: "Official online public service portal for Shaggar City Administration & Burayu Branch.",
      url: "https://eservice.shaggarcity.et/",
      status: "active",
      Icon: Zap,
    },
    {
      id: "elibrary",
      title: "E-Library",
      subtitle: "Digital Library Portal",
      description: "Online digital public library, municipal research archives, and educational materials.",
      url: null,
      status: "coming_soon",
      Icon: BookOpen,
    },
    {
      id: "etax",
      title: "E-Tax & Revenue",
      subtitle: "Online Tax Filing",
      description: "Online municipal tax clearance, fee assessment, and revenue filing platform.",
      url: null,
      status: "coming_soon",
      Icon: CreditCard,
    },
  ];

  return (
    <div className={`space-y-8 ${className}`} id="e-services">
      {/* Section Header */}
      <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#FE0002]/20 bg-rose-50 px-4 py-1.5 text-xs font-bold text-[#FE0002]">
          <Monitor className="h-4 w-4 text-[#FE0002]" />
          <span>COMPUTER / DIGITAL SERVICES</span>
        </div>

        <h2 className="text-3xl font-black tracking-tight text-[#070707] sm:text-4xl">
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
          const ServiceIcon = service.Icon;

          return (
            <div
              key={service.id}
              className={`group relative flex flex-col justify-between rounded-2xl border p-6 sm:p-7 transition-all duration-300 ease-out ${
                isActive
                  ? "border-neutral-200/80 bg-white shadow-xs hover:border-[#FE0002]/60 hover:shadow-md hover:-translate-y-[3px]"
                  : "border-neutral-200/60 bg-[#F9FAFB] opacity-75"
              }`}
            >
              <div>
                {/* Header Badge */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-[#FE0002]">
                    <ServiceIcon className="h-5 w-5" />
                  </div>
                  {isActive ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FE0002]/10 text-[#FE0002] border border-[#FE0002]/25 px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#FE0002]" />
                      Official Active Portal
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-neutral-200 text-neutral-600 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider">
                      <Lock className="h-3 w-3" />
                      Coming Soon
                    </span>
                  )}
                </div>

                <h3 className="mt-5 text-xl font-bold text-[#070707] group-hover:text-[#FE0002] transition">
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
                    className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#D71920] hover:bg-[#b5141a] text-white px-6 py-3 text-xs font-bold uppercase tracking-wider shadow-lg shadow-red-950/20 hover:shadow-xl hover-lift transition-all duration-300 active:scale-[0.98] cursor-pointer"
                  >
                    <span>Open E-Service</span>
                    <ExternalLink className="h-4 w-4 text-white transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-400 px-6 py-3 text-xs font-medium uppercase tracking-wider cursor-not-allowed"
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
