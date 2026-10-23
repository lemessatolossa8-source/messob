"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Sun, Moon } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import Logo from "@/components/Logo";
import LanguageSelector from "@/components/LanguageSelector";
import AccessEServiceButton from "@/components/AccessEserviceButton";
import NavDropdown from "@/components/NavDropdown";
import { useTranslation } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { floorService } from "@/services";

let cachedHeaderFloors = null;

function NavLinks({ onClick, scrollPhase }) {
  const pathname = usePathname();
  const { t, getText, language } = useTranslation();
  const [floors, setFloors] = useState(cachedHeaderFloors || []);

  useEffect(() => {
    let isMounted = true;
    const fetchFloors = async () => {
      try {
        const data = await floorService.getAll({ status: "published" });
        if (isMounted && Array.isArray(data)) {
          cachedHeaderFloors = data;
          setFloors(data);
        }
      } catch (err) {
        console.error("Failed to load header floors:", err);
      }
    };
    if (!cachedHeaderFloors || cachedHeaderFloors.length === 0) {
      if (typeof window !== "undefined" && "requestIdleCallback" in window) {
        window.requestIdleCallback(() => fetchFloors(), { timeout: 3000 });
      } else {
        setTimeout(fetchFloors, 1200);
      }
    }
    const unsub = floorService.subscribe(fetchFloors);
    return () => {
      isMounted = false;
      unsub();
    };
  }, []);

  const serviceDropdownItems = useMemo(() => {
    let items = [];
    if (floors.length > 0) {
      items = floors.map((f) => {
        const num = f.floorNumber || f.id;
        let name = "";
        if (typeof f.name === "object" && f.name !== null) {
          name = getText(f.name) || f.name[language] || f.name.om || f.name.en || f.name.am;
        } else {
          name = String(f.name || "");
        }
        if (!name) {
          name = language === "om" ? `Darbii ${num}` : language === "am" ? `${num}ኛ ፎቅ` : `Floor ${num}`;
        }
        return {
          name,
          href: `/#floor-${num}`,
          badge: String(num),
          id: f.id,
          floorNumber: num,
        };
      });
    } else {
      items = [
        { name: t("nav.floor1", "Floor 1"), href: "/#floor-1", badge: "1" },
        { name: t("nav.floor2", "Floor 2"), href: "/#floor-2", badge: "2" },
        { name: t("nav.floor3", "Floor 3"), href: "/#floor-3", badge: "3" },
        { name: t("nav.floor4", "Floor 4"), href: "/#floor-4", badge: "4" },
      ];
    }

    items.push({
      name: t("floors.allFloors", t("home.viewAllFloors", "All Floors")),
      href: "/services#our-services",
      badge: "★",
    });

    return items;
  }, [floors, getText, language, t]);

  const navigationItems = [
    { label: t("nav.home", "Home"), href: "/" },
    { label: t("nav.news", "News"), href: "/news" },
    { label: t("nav.announcements", "Announcements"), href: "/announcements" },
    { label: t("nav.projects", "Projects"), href: "/projects" },
    { isServices: true },
    { isEService: true },
    { label: t("nav.about", "About"), href: "/about" },
    { label: t("nav.contact", "Contact"), href: "/contact" },
  ];

  return navigationItems.map((item, idx) => {
    const isMiddle = scrollPhase === "middle";
    const isBottom = scrollPhase === "bottom";

    if (item.isServices) {
      return (
        <NavDropdown
          key="services"
          label={t("nav.services", "Services")}
          onNavigate={onClick}
          items={serviceDropdownItems}
          pillClassName={`relative inline-flex items-center gap-1 py-2 text-sm font-bold transition-colors duration-300 ease-in-out whitespace-nowrap focus:outline-none after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:transition-transform after:duration-300 after:origin-left ${
            pathname === "/services" || (pathname && pathname.startsWith("/services/")) || pathname === "/floors" || (pathname && pathname.startsWith("/floors/"))
              ? isMiddle
                ? "text-[#070707] after:bg-[#D71920] after:scale-x-100 font-extrabold"
                : isBottom
                  ? "text-white after:bg-[#D71920] after:scale-x-100 font-extrabold"
                  : "text-white after:bg-white after:scale-x-100 font-extrabold"
              : isMiddle
                ? "text-[#070707]/80 hover:text-[#070707] after:bg-[#D71920] after:scale-x-0 hover:after:scale-x-100"
                : isBottom
                  ? "text-white/80 hover:text-white after:bg-[#D71920] after:scale-x-0 hover:after:scale-x-100"
                  : "text-white/90 hover:text-white after:bg-white after:scale-x-0 hover:after:scale-x-100"
          }`}
        />
      );
    }

    if (item.isEService) {
      return (
        <AccessEServiceButton
          key="eservice"
          variant={isMiddle ? "header-dark" : isBottom ? "header-bottom" : "header"}
          size="sm"
        />
      );
    }

    // Guard: skip items missing href to prevent Link crash
    if (!item.href) return null;

    const isActive =
      item.href === "/"
        ? pathname === "/"
        : pathname === item.href || (pathname && pathname.startsWith(`${item.href}/`));

    return (
      <Link
        key={item.href || `nav-${idx}`}
        href={item.href}
        onClick={onClick}
        className={`relative inline-flex items-center py-2 text-sm font-bold transition-colors duration-300 ease-in-out whitespace-nowrap focus:outline-none after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:transition-transform after:duration-300 after:origin-left ${
          isActive
            ? isMiddle
              ? "text-[#070707] after:bg-[#D71920] after:scale-x-100 font-extrabold"
              : isBottom
                ? "text-white after:bg-[#D71920] after:scale-x-100 font-extrabold"
                : "text-white after:bg-white after:scale-x-100 font-extrabold"
            : isMiddle
              ? "text-[#070707]/80 hover:text-[#070707] after:bg-[#D71920] after:scale-x-0 hover:after:scale-x-100"
              : isBottom
                ? "text-white/80 hover:text-white after:bg-[#D71920] after:scale-x-0 hover:after:scale-x-100"
                : "text-white/90 hover:text-white after:bg-white after:scale-x-0 hover:after:scale-x-100"
        }`}
      >
        {item.label}
      </Link>
    );
  });
}

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrollPhase, setScrollPhase] = useState("top"); // top, middle, bottom
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();

  // Automatically close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    let ticking = false;
    let totalHeight = 0;

    const measureHeight = () => {
      totalHeight = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    };

    measureHeight();
    window.addEventListener("resize", measureHeight, { passive: true });

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          let nextPhase = "top";
          if (scrollY < 80) {
            nextPhase = "top";
          } else {
            const percent = totalHeight > 0 ? (scrollY / totalHeight) * 100 : 0;
            if (percent < 60) {
              nextPhase = "middle";
            } else {
              nextPhase = "bottom";
            }
          }
          setScrollPhase((prev) => (prev === nextPhase ? prev : nextPhase));
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    const closeOnResize = () => {
      if (window.innerWidth >= 1280) {
        setMenuOpen(false);
      }
    };
    window.addEventListener("resize", closeOnResize, { passive: true });

    return () => {
      window.removeEventListener("resize", measureHeight);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", closeOnResize);
    };
  }, []);

  // Top (Hero): Red blurred style; Scroll middle: White background with black text; Scroll bottom: Black background with white text
  let headerBgClass = "bg-[#D71920]/85 backdrop-blur-md border-b border-white/20 text-white shadow-sm";
  let iconClass = "text-white hover:bg-white/20";
  
  if (scrollPhase === "middle") {
    headerBgClass = "bg-white/95 backdrop-blur-md shadow-md border-b border-neutral-200 text-[#070707]";
    iconClass = "text-[#070707] hover:text-[#070707] hover:bg-slate-100";
  } else if (scrollPhase === "bottom") {
    headerBgClass = "bg-[#070707]/95 backdrop-blur-md shadow-lg border-b border-neutral-800 text-white";
    iconClass = "text-white hover:bg-white/15";
  }

  const logoVariant = scrollPhase === "middle" ? "default" : "white";
  const selectorVariant = scrollPhase === "middle" ? "header-dark" : scrollPhase === "bottom" ? "header-bottom" : "header";

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-500 ease-in-out ${headerBgClass}`}
    >
      {/* Main Navbar - Full width responsive container with clean edge spacing */}
      <div className="w-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-6 py-3.5">
        {/* Official Burayu MESOB Logo anchored to the left */}
        <div className="flex items-center shrink-0">
          <Logo size="md" variant={logoVariant} href="/" />
        </div>

        {/* Desktop Navigation Links + Language + Dark Mode Icon in one clean text row */}
        <nav className="hidden items-center gap-8 xl:flex ml-auto">
          <NavLinks scrollPhase={scrollPhase} />
          <LanguageSelector variant={selectorVariant} />
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            className={`p-1.5 rounded-full transition-colors duration-300 focus:outline-none ${iconClass}`}
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </nav>

        {/* Mobile Action Controls */}
        <div className="flex items-center gap-3 xl:hidden">
          <LanguageSelector variant={selectorVariant} />
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            className={`p-1.5 rounded-full transition-colors duration-300 focus:outline-none ${iconClass}`}
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          <button
            type="button"
            className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-300 shadow-sm hover-lift cursor-pointer ${
              scrollPhase === "middle"
                ? "border-slate-200 bg-white text-[#070707] hover:bg-slate-50"
                : "border-white/25 bg-white/15 text-white hover:bg-white/25"
            }`}
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
        <div className={`border-t xl:hidden animate-in slide-in-from-top-2 shadow-xl ${
          scrollPhase === "middle"
            ? "border-slate-200 bg-white text-[#070707]"
            : scrollPhase === "bottom"
              ? "border-neutral-800 bg-[#070707]/95 backdrop-blur-md text-white"
              : "border-white/20 bg-[#D71920]/95 backdrop-blur-md text-white"
        }`}>
          <div className="container-shell space-y-4 py-5">
            <div className="flex flex-col gap-4 px-1">
              <NavLinks
                onClick={() => setMenuOpen(false)}
                scrollPhase={scrollPhase}
              />
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
