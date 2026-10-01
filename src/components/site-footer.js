"use client";

import Link from "next/link";
import { ExternalLink, MapPin, Phone, Mail } from "lucide-react";
import Logo from "@/components/logo";
import AccessEServiceButton, { ESERVICE_URL } from "@/components/access-eservice-button";
import { useTranslation } from "@/src/context/LanguageContext";

export default function SiteFooter() {
  const { t } = useTranslation();

  const quickLinks = [
    { label: t("nav.home", "Home"), href: "/" },
    { label: t("nav.about", "About"), href: "/about" },
    { label: t("nav.services", "Services"), href: "/services" },
    { label: t("nav.news", "News"), href: "/news" },
    { label: t("nav.announcements", "Announcements"), href: "/announcements" },
    { label: t("nav.gallery", "Gallery"), href: "/gallery" },
    { label: t("nav.contact", "Contact"), href: "/contact" },
  ];

  return (
    <footer className="mt-20 relative bg-[#141413] text-white">
      {/* Top Oromo Cultural Identity Accent Line (Green / Gold / Red) */}
      <div className="oromo-accent-line h-[3px] w-full">
        <span />
        <span />
      </div>

      <div className="container-shell grid gap-10 py-14 lg:grid-cols-[1.3fr_0.8fr_0.8fr_1fr]">
        {/* Brand & About */}
        <div className="space-y-5">
          <Logo size="md" variant="white" href="/" />

          <p className="max-w-md text-xs sm:text-sm leading-relaxed text-neutral-200/90 font-normal">
            {t(
              "footer.aboutText",
              "Burayu MESOB's frontend portal provides structured public information, official updates, investment highlights, and a future-ready connection point for digital public services."
            )}
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-white/20 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-neutral-200 transition hover:border-white/60 hover:text-white"
            >
              Facebook
            </a>
            <a
              href="https://telegram.org"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-white/20 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-neutral-200 transition hover:border-white/60 hover:text-white"
            >
              Telegram
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-white/20 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-neutral-200 transition hover:border-white/60 hover:text-white"
            >
              YouTube
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#B32025]">
            {t("footer.quickLinks", "Quick Links")}
          </h3>
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            {quickLinks.slice(0, 8).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="py-1 text-neutral-200/90 transition hover:text-white hover:underline"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Services & Gateway */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#B32025]">
            {t("footer.services", "Services")}
          </h3>
          <div className="mt-4 space-y-2.5 text-xs text-neutral-200/90">
            <p>Municipal Guidance</p>
            <p>Business Support & Permits</p>
            <p>Urban Planning & Land Desk</p>
            <p>Investment Facilitation</p>
          </div>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#B32025]">
            {t("footer.contact", "Contact")}
          </h3>
          <div className="mt-4 space-y-3 text-xs">
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#B32025]">
                <MapPin className="h-4 w-4" />
              </div>
              <div>
                <p className="font-bold text-white">Burayu Administration</p>
                <p className="text-neutral-300">Burayu, Oromia, Ethiopia</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#B32025]">
                <Phone className="h-4 w-4" />
              </div>
              <div>
                <p className="font-bold text-white">+251944664433</p>
                <p className="text-neutral-300">Public Hotline</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#B32025]">
                <Mail className="h-4 w-4" />
              </div>
              <div>
                <p className="font-bold text-white">mesobburayubranch@gmail.com</p>
                <p className="text-neutral-300">Inquiry Desk</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-shell flex flex-col gap-4 py-5 text-xs text-neutral-400 md:flex-row md:items-center md:justify-between">
          <p>
            Copyright © {new Date().getFullYear()} Burayu MESOB. {t("footer.rights", "All rights reserved.")}
          </p>
          <div className="flex gap-5">
            <Link href="#" className="transition hover:text-white">
              {t("footer.privacy", "Privacy Policy")}
            </Link>
            <Link href="#" className="transition hover:text-white">
              {t("footer.terms", "Terms of Service")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
