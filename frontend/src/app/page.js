import HomeClient from "@/components/HomeClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const API_BASE = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

async function fetchJson(endpoint) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      cache: "no-store",
    });
    if (!res.ok) return { items: [] };
    const json = await res.json();
    return json.data || json || { items: [] };
  } catch {
    return { items: [] };
  }
}

async function getHomeData() {
  try {
    const [newsRes, announcementsRes, floorsRes, galleryRes, slideRes, projectsRes, statsRes] =
      await Promise.all([
        fetchJson("/news?status=published&limit=3"),
        fetchJson("/announcements?status=published&limit=3"),
        fetchJson("/floors?status=published"),
        fetchJson("/gallery?status=published&limit=6"),
        fetchJson("/slides?status=published&limit=20"),
        fetchJson("/projects?status=published&limit=3"),
        fetchJson("/statistics?status=published&limit=20"),
      ]);

    const rawSlides = slideRes.items || slideRes.data?.items || [];
    const slides = rawSlides
      .filter((s) => s.status === "published")
      .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));

    const news = newsRes.items || newsRes.data?.items || [];
    const announcements = announcementsRes.items || announcementsRes.data?.items || [];
    const floors = Array.isArray(floorsRes) ? floorsRes : floorsRes.data || floorsRes.items || [];
    const gallery = galleryRes.items || galleryRes.data?.items || [];
    const projects = projectsRes.items || projectsRes.data?.items || [];
    const statistics = statsRes.items || statsRes.data?.items || [];

    return {
      news,
      announcements,
      floors,
      gallery,
      slides,
      projects,
      statistics,
    };
  } catch (err) {
    console.error("Error fetching homepage initial data:", err);
    return {
      news: [],
      announcements: [],
      floors: [],
      gallery: [],
      slides: [],
      projects: [],
      statistics: [],
    };
  }
}

export default async function HomePage() {
  const initialData = await getHomeData();
  return <HomeClient initialData={initialData} />;
}

