import { storageStore } from "./storageStore";

export const noticeService = {
  getAll: (params) => storageStore.getAll("notices", params),
  getById: (id) => storageStore.getById("notices", id),
  create: (data) => storageStore.create("notices", data),
  update: (id, data) => storageStore.update("notices", id, data),
  delete: (id) => storageStore.delete("notices", id),
  publish: (id) => storageStore.publish("notices", id),
  unpublish: (id) => storageStore.unpublish("notices", id),
  subscribe: (cb) => storageStore.subscribe((key) => key === "notices" && cb()),
};
