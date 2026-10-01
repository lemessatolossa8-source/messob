import { storageStore } from "./storageStore";

export const slideService = {
  getAll: (params) => storageStore.getAll("slides", params),
  getById: (id) => storageStore.getById("slides", id),
  create: (data) => storageStore.create("slides", data),
  update: (id, data) => storageStore.update("slides", id, data),
  delete: (id) => storageStore.delete("slides", id),
  publish: (id) => storageStore.publish("slides", id),
  unpublish: (id) => storageStore.unpublish("slides", id),
  subscribe: (cb) => storageStore.subscribe((key) => key === "slides" && cb()),
};
