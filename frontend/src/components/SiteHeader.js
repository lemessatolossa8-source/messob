"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Sun, Moon } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import Logo from "@/components/Logo";
import LanguageSelector from "@/components/LanguageSelector";
import AccessEServiceButton from "@/components/AccessEserviceButton";
import NavDropdown from "@/components/NavDropdown";
import { useTranslation } from "@/src/context/LanguageContext";
import { useTheme } from "@/src/context/ThemeContext";

import { floorService } from "@/src/services";

function NavLinks({ onClick, scrollPhase }) {
  const pathname = usePathname();
  const { t, getText, language } = useTranslation();
  const [floors, setFloors] = useState([]);

  useEffect(() => {
    let isMounted = true;
    const fetchFloors = async () => {
      try {
        const data = await floorService.getAll({ status: "published" });
        if (isMounted && Array.isArray(data)) {
          setFloors(data);
        }
      } catch (err) {
        console.error("Failed to load header floors:", err);
      }
    };
    fetchFloors();
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
    if (item.isServices) {
      return (
        <NavDropdown
          key="services"
          label={t("nav.services", "Services")}
          onNavigate={onClick}
          items={serviceDropdownItems}
          pillClassName={`relative inline-flex items-center gap-1 py-2 text-sm font-bold transition-colors duration-300 ease-in-out whitespace-nowrap focus:outline-none after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:transition-transform after:duration-300 after:origin-left ${
            pathname === "/services" || (pathname && pathname.startsWith("/services/")) || pathname === "/floors" || (pathname && pathname.startsWith("/floors/"))
              ? (scrollPhase === "middle" ? "text-[#070707] after:bg-[#FE0002] after:scale-x-100" : scrollPhase === "bottom" ? "text-white after:bg-[#FE0002] after:scale-x-100" : "text-white after:bg-white after:scale-x-100")
              : (scrollPhase === "middle" ? "text-[#070707] hover:text-[#070707] after:bg-[#FE0002] after:scale-x-0 hover:after:scale-x-100" : scrollPhase === "bottom" ? "text-white/80 hover:text-white after:bg-[#FE0002] after:scale-x-0 hover:after:scale-x-100" : "text-white/80 hover:text-white after:bg-white after:scale-x-0 hover:after:scale-x-100")
          }`}
        />
      );
    }

    if (item.isEService) {
      return (
        <AccessEServiceButton
          key="eservice"
          variant={scrollPhase === "middle" ? "header-dark" : "header"}
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
            ? (scrollPhase === "middle" ? "text-[#070707] after:bg-[#FE0002] after:scale-x-100" : scrollPhase === "bottom" ? "text-white after:bg-[#FE0002] after:scale-x-100" : "text-white after:bg-white after:scale-x-100")
            : (scrollPhase === "middle" ? "text-[#070707] hover:text-[#070707] after:bg-[#FE0002] after:scale-x-0 hover:after:scale-x-100" : scrollPhase === "bottom" ? "text-white/80 hover:text-white after:bg-[#FE0002] after:scale-x-0 hover:after:scale-x-100" : "text-white/80 hover:text-white after:bg-white after:scale-x-0 hover:after:scale-x-100")
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
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      
      if (totalHeight <= 0) {
        setScrollPhase("top");
        return;
      }
      
      const percent = (scrollY / totalHeight) * 100;
      
      if (percent < 20) {
        setScrollPhase("top");
      } else if (percent < 60) {
        setScrollPhase("middle");
      } else {
        setScrollPhase("bottom");
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const closeOnResize = () => {
      if (window.innerWidth >= 1280) {
        setMenuOpen(false);
      }
    };

    window.addEventListener("resize", closeOnResize);
    return () => window.removeEventListener("resize", closeOnResize);
  }, []);

  let headerBgClass = "bg-[#FE0002]";
  let iconClass = "text-white hover:bg-white/10";
  
  if (scrollPhase === "middle") {
    headerBgClass = "bg-white shadow-sm border-b border-slate-200";
    iconClass = "text-[#070707] hover:text-[#070707] hover:bg-slate-100";
  } else if (scrollPhase === "bottom") {
    headerBgClass = "bg-black shadow-md border-b border-neutral-900";
    iconClass = "text-white hover:bg-white/10";
  }

  return (
    <header
      className={`sticky top-0 z-40 transition-colors duration-500 ease-in-out ${headerBgClass}`}
    >
      {/* Main Navbar - Full width responsive container with clean edge spacing */}
      <div className="w-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-6 py-3.5">
        {/* Official Burayu MESOB Logo anchored to the left */}
        <div className="flex items-center shrink-0">
          <Logo size="md" variant={scrollPhase === "middle" ? "default" : "white"} href="/" />
        </div>

        {/* Desktop Navigation Links + Language + Dark Mode Icon in one clean text row */}
        <nav className="hidden items-center gap-8 xl:flex ml-auto">
          <NavLinks scrollPhase={scrollPhase} />
          <LanguageSelector variant={scrollPhase === "middle" ? "header-dark" : scrollPhase === "bottom" ? "header-bottom" : "header"} />
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
          <LanguageSelector variant={scrollPhase === "middle" ? "header-dark" : scrollPhase === "bottom" ? "header-bottom" : "header"} />
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
            className={`inline-flex h-10 w-10 items-center justify-center rounded-lg border transition-colors duration-300 shadow-sm ${
              scrollPhase === "middle" 
                ? "border-slate-200 bg-white text-[#070707] hover:bg-slate-50" 
                : "border-white/20 bg-white/10 text-white hover:bg-white/20"
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
        <div className="border-t border-slate-200 bg-white xl:hidden animate-in slide-in-from-top-2 shadow-lg">
          <div className="container-shell space-y-4 py-5">
            <div className="flex flex-col gap-4 px-1">
              <NavLinks onClick={() => setMenuOpen(false)} scrollPhase="middle" />
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
