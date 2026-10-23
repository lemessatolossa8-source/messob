"use client";

import { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/src/context/LanguageContext";

const HERO_HEADINGS = {
  om: {
    tag: "WIIRTUU TAJAAJILA TOKKOOFFAA",
    title: "Wiirtuu Tokko, Tajaajila Guutuu.",
    welcome:
      "Baga Nagaan Gara Wiirtuu Tajaajila Tokkooffaa (MESOB) Bulchiinsa Magaalaa Shaggar, Damee Buraayyuutti Dhuftan.",
  },
  am: {
    tag: "የመጀመሪያ ደረጃ አገልግሎት ማዕከል",
    title: "አንድ ማዕከል፣ የተሟላ አገልግሎት።",
    welcome:
      "እንኳን ወደ ሻገር ከተማ አስተዳደር የመጀመሪያ ደረጃ የአገልግሎት ማዕከል (MESOB) ቡራዩ ቅርንጫፍ በደህና መጡ።",
  },
  en: {
    tag: "BURAYU MESOB PORTAL",
    title: "One Portal, Complete Citizen Services.",
    welcome:
      "Welcome to Shaggar City Administration First Service Center (MESOB), Burayu Branch.",
  },
};

const FADE_DURATION = 350; // ms

export default function AnimatedWelcomeText() {
  const { language } = useLanguage();
  const [displayedLang, setDisplayedLang] = useState(language);
  const [visible, setVisible] = useState(true);
  const prevLangRef = useRef(language);

  useEffect(() => {
    if (language === prevLangRef.current) return;

    setVisible(false);

    const timer = setTimeout(() => {
      setDisplayedLang(language);
      prevLangRef.current = language;
      setVisible(true);
    }, FADE_DURATION);

    return () => clearTimeout(timer);
  }, [language]);

  const current = HERO_HEADINGS[displayedLang] || HERO_HEADINGS["om"];

  return (
    <div
      className="w-full flex flex-col items-center justify-center text-center px-4"
      style={{
        transition: `opacity ${FADE_DURATION}ms ease, transform ${FADE_DURATION}ms ease`,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(-6px)",
      }}
    >
      {/* Kebkab-Style Golden / Red Brand Tag */}
      <span className="font-serif italic text-lg sm:text-xl md:text-2xl text-[#D71920] tracking-wide font-medium drop-shadow-md mb-2 sm:mb-3">
        {current.tag}
      </span>

      {/* Kebkab-Style Monumental Serif Headline */}
      <h1
        className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-[4.25rem] text-white font-normal sm:font-medium tracking-tight leading-[1.08] max-w-4xl mx-auto"
        style={{
          textShadow:
            "0 2px 14px rgba(0,0,0,0.95), 0 6px 30px rgba(0,0,0,0.8), 0 12px 60px rgba(0,0,0,0.7)",
        }}
      >
        {current.title}
      </h1>

      {/* Official Government Greeting */}
      <p className="mt-3 text-xs sm:text-sm text-neutral-300 max-w-xl mx-auto font-normal tracking-wide drop-shadow-sm">
        {current.welcome}
      </p>
    </div>
  );
}
