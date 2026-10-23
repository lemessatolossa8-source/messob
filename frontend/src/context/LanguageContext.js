"use client";

import { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import { DEFAULT_LANGUAGE, LANGUAGES, LANGUAGE_CODES, getTranslation, getLocalizedText } from "@/i18n";
import { useSiteSettings } from "@/context/SiteSettingsContext";

const LanguageContext = createContext({
  language: DEFAULT_LANGUAGE,
  setLanguage: () => {},
  t: (key, fallback) => fallback || key,
  getText: (_field) => "",
  languages: LANGUAGES,
  isLoaded: false,
});

const STORAGE_KEY = "mesob_lang_preference";

export function LanguageProvider({ children }) {
  const { settings } = useSiteSettings();
  const [language, setLanguageState] = useState(DEFAULT_LANGUAGE);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored =
        sessionStorage.getItem("mesob_user_selected_lang") ||
        localStorage.getItem(STORAGE_KEY);
      if (stored && LANGUAGE_CODES.includes(stored)) {
        if (stored !== DEFAULT_LANGUAGE) {
          setLanguageState(stored);
        }
      } else {
        const configuredDefault = settings?.languageSettings?.defaultLanguage;
        if (configuredDefault && LANGUAGE_CODES.includes(configuredDefault) && configuredDefault !== DEFAULT_LANGUAGE) {
          setLanguageState(configuredDefault);
        }
      }
    } catch {
      // Fallback to default
    } finally {
      setIsLoaded(true);
    }
  }, [settings?.languageSettings?.defaultLanguage]);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === STORAGE_KEY && e.newValue && LANGUAGE_CODES.includes(e.newValue)) {
        setLanguageState(e.newValue);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

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
