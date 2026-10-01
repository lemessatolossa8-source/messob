import { storageStore } from "./storageStore";

export const newsService = {
  getAll: (params) => storageStore.getAll("news", params),
  getById: (id) => storageStore.getById("news", id),
  create: (data) => storageStore.create("news", data),
  update: (id, data) => storageStore.update("news", id, data),
  delete: (id) => storageStore.delete("news", id),
  publish: (id) => storageStore.publish("news", id),
  unpublish: (id) => storageStore.unpublish("news", id),
  subscribe: (cb) => storageStore.subscribe((key) => key === "news" && cb()),
};
