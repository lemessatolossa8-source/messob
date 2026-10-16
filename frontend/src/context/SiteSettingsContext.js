"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DEFAULT_SITE_SETTINGS, mergeSiteSettings } from "@/src/data/defaultSiteSettings";
import settingService from "@/src/services/settingService";

const SiteSettingsContext = createContext({
  settings: DEFAULT_SITE_SETTINGS,
  loading: true,
  refresh: async () => {},
});

export function SiteSettingsProvider({ children, initialSettings = null }) {
  const [settings, setSettings] = useState(
    initialSettings ? mergeSiteSettings(DEFAULT_SITE_SETTINGS, initialSettings) : DEFAULT_SITE_SETTINGS
  );
  const [loading, setLoading] = useState(!initialSettings);

  const refresh = useCallback(async () => {
    try {
      const data = await settingService.getPublic();
      setSettings(data);
    } catch (error) {
      console.error("Failed to load public site settings:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!initialSettings) {
      refresh();
    }
    const unsub = settingService.subscribe((updated) => {
      if (updated) {
        setSettings(mergeSiteSettings(DEFAULT_SITE_SETTINGS, updated));
      } else {
        refresh();
      }
    });
    return () => unsub();
  }, [initialSettings, refresh]);

  const value = useMemo(
    () => ({
      settings,
      loading,
      refresh,
    }),
    [settings, loading, refresh]
  );

  return <SiteSettingsContext.Provider value={value}>{children}</SiteSettingsContext.Provider>;
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}

export { mergeSiteSettings, DEFAULT_SITE_SETTINGS };
