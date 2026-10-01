import { initialNews } from "@/src/data/news";
import { initialAnnouncements } from "@/src/data/announcements";
import { initialNotices } from "@/src/data/notices";
import { initialEvents } from "@/src/data/events";
import { initialProjects } from "@/src/data/projects";
import { initialGallery } from "@/src/data/gallery";
import { initialServices } from "@/src/data/services";
import { initialSlides } from "@/src/data/slides";
import { initialCityInfo, initialContactInfo, initialMayorMessage } from "@/src/data/siteSettings";

const STORE_PREFIX = "mesob_store_";

const COLLECTION_KEYS = ["news", "announcements", "notices", "events", "projects", "gallery", "services", "slides"];

const memoryStore = {
  news: [...initialNews],
  announcements: [...initialAnnouncements],
  notices: [...initialNotices],
  events: [...initialEvents],
  projects: [...initialProjects],
  gallery: [...initialGallery],
  services: [...initialServices],
  slides: [...initialSlides],
  cityInfo: { ...initialCityInfo },
  contactInfo: { ...initialContactInfo },
  mayorMessage: { ...initialMayorMessage },
};

// Track whether we've hydrated in this browser context
let _hydrated = false;

const listeners = new Set();

function isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readFromStorage(key, fallback) {
  if (!isBrowser()) return fallback;
  try {
    const raw = localStorage.getItem(`${STORE_PREFIX}${key}`);
    if (raw !== null) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn(`Error loading ${key} from storage:`, err);
  }
  return fallback;
}

/**
 * Hydrate memoryStore from localStorage. Runs once per browser page load.
 * Safe to call multiple times — subsequent calls are no-ops.
 */
function ensureHydrated() {
  if (!isBrowser() || _hydrated) return;
  _hydrated = true;
  COLLECTION_KEYS.forEach((key) => {
    memoryStore[key] = readFromStorage(key, memoryStore[key]);
  });
  // Clear any legacy mock gallery items
  if (Array.isArray(memoryStore.gallery)) {
    const cleaned = memoryStore.gallery.filter(
      (item) => !String(item.id).startsWith("g-real") && !/^g[1-8]$/.test(String(item.id))
    );
    if (cleaned.length !== memoryStore.gallery.length) {
      memoryStore.gallery = cleaned;
      persist("gallery");
    }
  }
  memoryStore.cityInfo = readFromStorage("cityInfo", memoryStore.cityInfo);
  memoryStore.contactInfo = readFromStorage("contactInfo", memoryStore.contactInfo);
  memoryStore.mayorMessage = readFromStorage("mayorMessage", memoryStore.mayorMessage);
}

// Eagerly hydrate when the module loads in the browser
if (isBrowser()) {
  ensureHydrated();
}

function persist(key) {
  if (isBrowser()) {
    try {
      localStorage.setItem(`${STORE_PREFIX}${key}`, JSON.stringify(memoryStore[key]));
    } catch (err) {
      console.warn(`Error persisting ${key}:`, err);
    }
  }
  notify(key);
}

function notify(key) {
  for (const listener of listeners) {
    try {
      listener(key);
    } catch {
      // Ignore listener error
    }
  }
}

export const storageStore = {
  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  getAll(key, { search = "", category = "", status = "", page = 1, limit = 1000 } = {}) {
    ensureHydrated();
    let items = memoryStore[key] || [];

    if (status && status !== "all") {
      items = items.filter((item) => item.status === status);
    }

    if (category && category !== "All" && category !== "all") {
      items = items.filter((item) => item.category === category);
    }

    if (search && search.trim() !== "") {
      const q = search.toLowerCase();
      items = items.filter((item) => {
        const titleStr = typeof item.title === "object" ? Object.values(item.title).join(" ") : String(item.title || "");
        const descStr = typeof item.description === "object" ? Object.values(item.description).join(" ") : String(item.description || item.summary || "");
        return titleStr.toLowerCase().includes(q) || descStr.toLowerCase().includes(q);
      });
    }

    const total = items.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const offset = (page - 1) * limit;
    const paginated = items.slice(offset, offset + limit);

    return {
      items: paginated,
      total,
      totalPages,
      currentPage: page,
    };
  },

  getById(key, id) {
    ensureHydrated();
    if (!id) return null;
    const cleanId = String(decodeURIComponent(String(id)));
    const items = memoryStore[key] || [];
    return (
      items.find(
        (item) => String(item.id) === cleanId || String(item._id) === cleanId
      ) || null
    );
  },

  create(key, data) {
    const newId = data.id || `mesob_${Date.now()}`;
    const dateStr = data.date || new Date().toISOString().split("T")[0];
    const newItem = {
      ...data,
      id: newId,
      date: dateStr,
      status: data.status || "published",
      createdAt: new Date().toISOString(),
    };

    memoryStore[key] = [newItem, ...(memoryStore[key] || [])];
    persist(key);
    return newItem;
  },

  update(key, id, data) {
    if (!id) throw new Error("ID is required for update");
    const cleanId = String(decodeURIComponent(String(id)));
    const items = memoryStore[key] || [];
    const index = items.findIndex(
      (item) => String(item.id) === cleanId || String(item._id) === cleanId
    );
    if (index === -1) {
      // If not found, append it as a safeguard
      const fallbackItem = { ...data, id: cleanId, updatedAt: new Date().toISOString() };
      memoryStore[key] = [fallbackItem, ...items];
      persist(key);
      return fallbackItem;
    }

    const updatedItem = {
      ...items[index],
      ...data,
      id: items[index].id,
      updatedAt: new Date().toISOString(),
    };

    const newItems = [...items];
    newItems[index] = updatedItem;
    memoryStore[key] = newItems;
    persist(key);
    return updatedItem;
  },

  delete(key, id) {
    if (!id) return false;
    const cleanId = String(decodeURIComponent(String(id)));
    const items = memoryStore[key] || [];
    memoryStore[key] = items.filter(
      (item) => String(item.id) !== cleanId && String(item._id) !== cleanId
    );
    persist(key);
    return true;
  },

  publish(key, id) {
    return this.update(key, id, { status: "published" });
  },

  unpublish(key, id) {
    return this.update(key, id, { status: "draft" });
  },

  getSingle(key) {
    return memoryStore[key];
  },

  updateSingle(key, data) {
    memoryStore[key] = {
      ...memoryStore[key],
      ...data,
      lastUpdated: new Date().toISOString(),
    };
    persist(key);
    return memoryStore[key];
  },

  clearAll() {
    memoryStore.news = [];
    memoryStore.announcements = [];
    memoryStore.notices = [];
    memoryStore.events = [];
    memoryStore.projects = [];
    memoryStore.gallery = [];
    memoryStore.services = [];
    memoryStore.slides = [];
    if (isBrowser()) {
      ["news", "announcements", "notices", "events", "projects", "gallery", "services", "slides"].forEach((k) => {
        try {
          localStorage.setItem(`${STORE_PREFIX}${k}`, JSON.stringify([]));
        } catch (err) {
          console.warn("Error clearing storage key:", k, err);
        }
        notify(k);
      });
    }
    return true;
  },

  getStats() {
    const getCounts = (key) => {
      const items = memoryStore[key] || [];
      const published = items.filter((i) => i.status === "published").length;
      const draft = items.filter((i) => i.status === "draft").length;
      return { total: items.length, published, draft };
    };

    const news = getCounts("news");
    const announcements = getCounts("announcements");
    const notices = getCounts("notices");
    const events = getCounts("events");
    const projects = getCounts("projects");
    const gallery = getCounts("gallery");
    const services = getCounts("services");
    const slides = getCounts("slides");

    const totalPublished =
      news.published +
      announcements.published +
      notices.published +
      events.published +
      projects.published +
      gallery.published +
      services.published +
      slides.published;

    const totalDraft =
      news.draft +
      announcements.draft +
      notices.draft +
      events.draft +
      projects.draft +
      gallery.draft +
      services.draft +
      slides.draft;

    return {
      totalNews: news.total,
      totalAnnouncements: announcements.total,
      totalNotices: notices.total,
      totalEvents: events.total,
      totalProjects: projects.total,
      totalGallery: gallery.total,
      totalServices: services.total,
      totalSlides: slides.total,
      published: totalPublished,
      draft: totalDraft,
    };
  },
};
