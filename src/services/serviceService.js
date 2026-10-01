import { storageStore } from "./storageStore";

export const serviceService = {
  getAll: (params) => storageStore.getAll("services", params),
  getById: (id) => storageStore.getById("services", id),
  create: (data) => storageStore.create("services", data),
  update: (id, data) => storageStore.update("services", id, data),
  delete: (id) => storageStore.delete("services", id),
  publish: (id) => storageStore.publish("services", id),
  unpublish: (id) => storageStore.unpublish("services", id),
  subscribe: (cb) => storageStore.subscribe((key) => key === "services" && cb()),
};
