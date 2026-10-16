import { storageStore } from "./storageStore";

export const siteService = {
  getCityInfo: () => storageStore.getSingle("cityInfo"),
  updateCityInfo: (data) => storageStore.updateSingle("cityInfo", data),
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

