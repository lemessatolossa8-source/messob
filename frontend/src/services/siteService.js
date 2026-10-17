import { storageStore } from "./storageStore";
import settingService from "./settingService";
import { DEFAULT_SITE_SETTINGS } from "@/src/data/defaultSiteSettings";

export const siteService = {
  getCityInfo: () => {
    const local = storageStore.getSingle("cityInfo");
    if (local && (local.about || local.mission || local.vision)) {
      return local;
    }
    return DEFAULT_SITE_SETTINGS.cityInfo;
  },
  updateCityInfo: async (data) => {
    storageStore.updateSingle("cityInfo", data);
    try {
      await settingService.update({ cityInfo: data });
    } catch (err) {
      console.warn("Could not sync cityInfo to backend settings:", err);
    }
    return data;
  },
  getMayorMessage: () => storageStore.getSingle("mayorMessage") || storageStore.getSingle("cityInfo")?.mayorMessage,
  updateMayorMessage: (data) => {
    storageStore.updateSingle("mayorMessage", data);
    const cityInfo = storageStore.getSingle("cityInfo") || {};
    storageStore.updateSingle("cityInfo", { ...cityInfo, mayorMessage: data });
    return data;
  },
  getContactInfo: () => storageStore.getSingle("contactInfo"),
  updateContactInfo: (data) => storageStore.updateSingle("contactInfo", data),
  getStats: () => storageStore.getStats(),
  subscribe: (cb) => storageStore.subscribe(cb),
};

