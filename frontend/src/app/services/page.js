import ServicesClient from "@/components/ServicesClient";

export const revalidate = 60;

const isProd = process.env.NODE_ENV === "production" || !!process.env.VERCEL;
const prodDefault = "https://burayu-mesob-backend.onrender.com/api";
const resolvedApi =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.BACKEND_URL ? `${process.env.BACKEND_URL.replace(/\/+$/, "").replace(/\/api$/, "")}/api` : null) ||
  (isProd ? prodDefault : "http://127.0.0.1:5000/api");
const API_BASE = isProd && (resolvedApi.includes("localhost") || resolvedApi.includes("127.0.0.1")) ? prodDefault : resolvedApi;

async function getFloors() {
  try {
    const res = await fetch(`${API_BASE}/floors?status=published`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json) ? json : json.data || [];
  } catch {
    return [];
  }
}

export default async function ServicesPage() {
  const initialFloors = await getFloors();
  return <ServicesClient initialFloors={initialFloors} />;
}
