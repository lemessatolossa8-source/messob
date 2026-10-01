import { storageStore } from "./storageStore";

export const galleryService = {
  getAll: (params) => storageStore.getAll("gallery", params),
  getById: (id) => storageStore.getById("gallery", id),
  create: (data) => storageStore.create("gallery", data),
  update: (id, data) => storageStore.update("gallery", id, data),
  delete: (id) => storageStore.delete("gallery", id),
  publish: (id) => storageStore.publish("gallery", id),
  unpublish: (id) => storageStore.unpublish("gallery", id),
  subscribe: (cb) => storageStore.subscribe((key) => key === "gallery" && cb()),
};
