"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";
import Logo from "@/components/logo";
import LanguageSelector from "@/components/language-selector";
import AccessEServiceButton from "@/components/access-eservice-button";
import { useTranslation } from "@/src/context/LanguageContext";
import { useTheme } from "@/src/context/ThemeContext";

function NavLinks({ onClick }) {
  const pathname = usePathname();
  const { t } = useTranslation();

  const navigationItems = [
    { label: t("nav.home", "Home"), href: "/" },
    { label: t("nav.news", "News"), href: "/news" },
    { label: t("nav.announcements", "Announcements"), href: "/announcements" },
    { label: t("nav.projects", "Projects"), href: "/projects" },
    { label: t("nav.services", "Services"), href: "/services" },
    { isEService: true },
    { label: t("nav.about", "About"), href: "/about" },
    { label: t("nav.contact", "Contact"), href: "/contact" },
  ];

  return navigationItems.map((item, idx) => {
    if (item.isEService) {
      return (
        <AccessEServiceButton
          key="eservice"
          variant="primary"
          size="sm"
          className="mx-1"
        />
      );
    }

    const isActive =
      item.href === "/"
        ? pathname === "/"
        : pathname === item.href || (pathname && pathname.startsWith(`${item.href}/`));

    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onClick}
        className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition whitespace-nowrap ${
          isActive
            ? "bg-black/25 text-white shadow-xs ring-1 ring-white/40"
            : "text-white/90 hover:bg-white/15 hover:text-white"
        }`}
      >
        {item.label}
      </Link>
    );
  });
}

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const closeOnResize = () => {
      if (window.innerWidth >= 1280) {
        setMenuOpen(false);
      }
    };

    window.addEventListener("resize", closeOnResize);
    return () => window.removeEventListener("resize", closeOnResize);
  }, []);

  return (
    <header
      className="sticky top-0 z-40 text-white shadow-md relative bg-[#B82025]"
      style={{
        borderBottom: "1px solid rgba(255, 255, 255, 0.15)",
      }}
    >


      {/* Main Navbar */}
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 py-3">
        {/* Official Burayu MESOB Logo anchored to the left */}
        <div className="flex items-center shrink-0">
          <Logo size="md" variant="white" href="/" />
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-1 xl:flex">
          <NavLinks />
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Desktop Language Selector */}
          <div className="hidden lg:block">
            <LanguageSelector variant="header" />
          </div>

          {/* Dark Mode Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white transition hover:bg-white/20"
          >
            {theme === "dark" ? <Sun className="h-4 w-4 text-white" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white transition hover:bg-white/20 xl:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {menuOpen ? (
        <div className="border-t border-white/15 bg-[#B82025] text-white xl:hidden animate-in slide-in-from-top-2 shadow-2xl">
          <div className="container-shell space-y-4 py-5">
            {/* Mobile Language Selector */}
            <div className="rounded-2xl bg-black/20 p-3 border border-white/10">
              <LanguageSelector variant="mobile" />
            </div>

            {/* Mobile Nav Links */}
            <div className="flex flex-col gap-1.5">
              <NavLinks onClick={() => setMenuOpen(false)} />
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
