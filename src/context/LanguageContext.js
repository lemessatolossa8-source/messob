"use client";

import { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import { DEFAULT_LANGUAGE, LANGUAGES, LANGUAGE_CODES, getTranslation, getLocalizedText } from "@/src/i18n";

const LanguageContext = createContext({
  language: DEFAULT_LANGUAGE,
  setLanguage: () => {},
  t: (key, fallback) => fallback || key,
  getText: (field) => "",
  languages: LANGUAGES,
  isLoaded: false,
});

const STORAGE_KEY = "mesob_lang_preference";

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(DEFAULT_LANGUAGE);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && LANGUAGE_CODES.includes(saved)) {
        setLanguageState(saved);
      }
    } catch {
      // Fallback gracefully if localStorage is unavailable
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const setLanguage = useCallback((newLang) => {
    if (LANGUAGE_CODES.includes(newLang)) {
      setLanguageState(newLang);
      try {
        localStorage.setItem(STORAGE_KEY, newLang);
      } catch {
        // Ignore localStorage error
      }
      if (typeof document !== "undefined") {
        document.documentElement.lang = newLang;
      }
    }
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = language;
    }
  }, [language]);

  const t = useCallback(
    (keyPath, fallback = "") => {
      return getTranslation(language, keyPath, fallback);
    },
    [language]
  );

  const getText = useCallback(
    (field) => {
      return getLocalizedText(field, language);
    },
    [language]
  );

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t,
      getText,
      languages: LANGUAGES,
      isLoaded,
    }),
    [language, setLanguage, t, getText, isLoaded]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

export function useTranslation() {
  const { t, language, getText, setLanguage, languages } = useLanguage();
  return { t, language, getText, setLanguage, languages };
}
