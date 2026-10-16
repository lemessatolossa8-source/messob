"use client";

import { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import { DEFAULT_LANGUAGE, LANGUAGES, LANGUAGE_CODES, getTranslation, getLocalizedText } from "@/src/i18n";
import { useSiteSettings } from "@/src/context/SiteSettingsContext";

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
  const { settings } = useSiteSettings();
  const [language, setLanguageState] = useState(DEFAULT_LANGUAGE);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const configuredDefault = settings?.languageSettings?.defaultLanguage;
    if (!configuredDefault || !LANGUAGE_CODES.includes(configuredDefault)) {
      setIsLoaded(true);
      return;
    }

    try {
      const sessionUserLang = sessionStorage.getItem("mesob_user_selected_lang");
      if (sessionUserLang && LANGUAGE_CODES.includes(sessionUserLang)) {
        setLanguageState(sessionUserLang);
      } else {
        setLanguageState(configuredDefault);
        try {
          localStorage.setItem(STORAGE_KEY, configuredDefault);
        } catch {}
      }
    } catch {
      setLanguageState(configuredDefault);
    } finally {
      setIsLoaded(true);
    }
  }, [settings?.languageSettings?.defaultLanguage]);

  const setLanguage = useCallback((newLang) => {
    if (LANGUAGE_CODES.includes(newLang)) {
      setLanguageState(newLang);
      try {
        sessionStorage.setItem("mesob_user_selected_lang", newLang);
        localStorage.setItem(STORAGE_KEY, newLang);
      } catch {
        // Ignore storage error
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
