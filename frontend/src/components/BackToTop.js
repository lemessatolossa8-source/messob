"use client";

import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { useTranslation } from "@/src/context/LanguageContext";

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const toggleVisibility = () => {
      // Show button after scrolling down 300px
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
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
      className={`fixed bottom-6 right-6 z-50 flex flex-col items-center justify-center gap-1 transition-all duration-300 ease-in-out ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0 pointer-events-none"
      }`}
    >
      <button
        type="button"
        onClick={scrollToTop}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FE0002] text-white shadow-lg transition-all duration-300 hover:bg-[#070707] hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-[#FE0002]/40 active:scale-95"
        aria-label={t("common.backToTop", "Back to top")}
        title={t("common.backToTop", "Back to top")}
      >
        <ArrowUp className="h-6 w-6" />
      </button>
      <span className="text-xs font-bold text-[#FE0002] uppercase tracking-wider">Top</span>
    </div>
  );
}
