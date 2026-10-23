"use client";

import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { useTranslation } from "@/src/context/LanguageContext";

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    let ticking = false;
    const toggleVisibility = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsVisible(window.scrollY > 300);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", toggleVisibility, { passive: true });
    toggleVisibility();
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    // Respect prefers-reduced-motion
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({
      top: 0,
      behavior: reducedMotion ? "auto" : "smooth",
    });
  };

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ease-in-out ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0 pointer-events-none"
      }`}
    >
      <button
        type="button"
        onClick={scrollToTop}
        className="group relative flex h-12 w-12 items-center justify-center rounded-full bg-black/85 hover:bg-[#D71920] text-white border border-white/20 hover:border-[#D71920] shadow-2xl backdrop-blur-md transition-all duration-300 hover-lift active:scale-95 cursor-pointer focus:outline-none focus:ring-4 focus:ring-[#D71920]/40"
        aria-label={t("common.backToTop", "Back to top")}
        title={t("common.backToTop", "Back to top")}
      >
        <ArrowUp className="h-5 w-5 stroke-[2.5] transition-transform duration-300 group-hover:-translate-y-0.5" />
      </button>
    </div>
  );
}
