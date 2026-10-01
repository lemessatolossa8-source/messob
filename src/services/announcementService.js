import { storageStore } from "./storageStore";

export const announcementService = {
  getAll: (params) => storageStore.getAll("announcements", params),
  getById: (id) => storageStore.getById("announcements", id),
  create: (data) => storageStore.create("announcements", data),
  update: (id, data) => storageStore.update("announcements", id, data),
  delete: (id) => storageStore.delete("announcements", id),
  publish: (id) => storageStore.publish("announcements", id),
  unpublish: (id) => storageStore.unpublish("announcements", id),
  subscribe: (cb) => storageStore.subscribe((key) => key === "announcements" && cb()),
};
