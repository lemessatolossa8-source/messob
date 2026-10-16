"use client";

import { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/src/context/LanguageContext";

const WELCOME_CONTENT = {
  om: (
    <span>
      {"Baga Nagaan Gara Wiirtuu Tajaajila Tokkooffaa ("}
      <span className="text-[#FE0002] font-extrabold underline decoration-[#FE0002]/50 underline-offset-4">
        MESOB
      </span>
      {") Bulchiinsa Magaalaa Shaggar, Damee "}
      <span className="text-[#FE0002] font-extrabold underline decoration-[#FE0002]/50 underline-offset-4">
        Buraayyu
      </span>
      {"utti Dhuftan"}
    </span>
  ),
  am: (
    <span>
      {"እንኳን ወደ ሻገር ከተማ አስተዳደር የመጀመሪያ ደረጃ የአገልግሎት ማዕከል ("}
      <span className="text-[#FE0002] font-extrabold underline decoration-[#FE0002]/50 underline-offset-4">
        MESOB
      </span>
      {") "}
      <span className="text-[#FE0002] font-extrabold underline decoration-[#FE0002]/50 underline-offset-4">
        ቡራዩ
      </span>
      {" ቅርንጫፍ በደህና መጡ"}
    </span>
  ),
  en: (
    <span>
      {"Welcome to Shaggar City Administration First Service Center ("}
      <span className="text-[#FE0002] font-extrabold underline decoration-[#FE0002]/50 underline-offset-4">
        MESOB
      </span>
      {"), "}
      <span className="text-[#FE0002] font-extrabold underline decoration-[#FE0002]/50 underline-offset-4">
        Burayu
      </span>
      {" Branch"}
    </span>
  ),
};

const FADE_DURATION = 400; // ms

export default function AnimatedWelcomeText() {
  const { language } = useLanguage();
  const [displayedLang, setDisplayedLang] = useState(language);
  const [visible, setVisible] = useState(true);
  const prevLangRef = useRef(language);

  useEffect(() => {
    if (language === prevLangRef.current) return;

    // Fade out, swap content, fade in
    setVisible(false);

    const timer = setTimeout(() => {
      setDisplayedLang(language);
      prevLangRef.current = language;
      setVisible(true);
    }, FADE_DURATION);

    return () => clearTimeout(timer);
  }, [language]);

  const content =
    WELCOME_CONTENT[displayedLang] || WELCOME_CONTENT["om"];

  return (
    <div className="w-full flex items-center justify-center text-center px-4">
      <h1
        className="text-[22px] sm:text-[32px] md:text-[38px] lg:text-[48px] xl:text-[54px] font-extrabold text-white leading-[1.25] tracking-tight"
        style={{
          textShadow:
            "0 2px 4px rgba(0,0,0,0.95), 0 4px 16px rgba(0,0,0,0.85), 0 8px 32px rgba(0,0,0,0.6)",
          transition: `opacity ${FADE_DURATION}ms ease, transform ${FADE_DURATION}ms ease`,
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(-6px)",
        }}
      >
        {content}
      </h1>
    </div>
  );
}
