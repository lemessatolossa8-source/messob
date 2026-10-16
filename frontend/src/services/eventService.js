import { storageStore } from "./storageStore";

export const eventService = {
  getAll: (params) => storageStore.getAll("events", params),
  getById: (id) => storageStore.getById("events", id),
  create: (data) => storageStore.create("events", data),
  update: (id, data) => storageStore.update("events", id, data),
  delete: (id) => storageStore.delete("events", id),
  publish: (id) => storageStore.publish("events", id),
  unpublish: (id) => storageStore.unpublish("events", id),
  subscribe: (cb) => storageStore.subscribe((key) => key === "events" && cb()),
};
