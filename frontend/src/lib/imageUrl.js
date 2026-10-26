/**
 * Utility to normalize image paths and URLs across the Burayu MESOB application.
 * Handles:
 * - Full URLs (http://, https://, data:, blob:)
 * - Backend uploads (/uploads/..., uploads/...)
 * - Static assets (/images/...)
 * - Fallbacks when no image is present
 */

export function getImageUrl(imagePath, fallback = "") {
  if (!imagePath || typeof imagePath !== "string") return fallback;
  const trimmed = imagePath.trim();
  if (!trimmed) return fallback;

  // Full external or data/blob URLs
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("blob:")
  ) {
    return trimmed;
  }

  // Normalize path
  const normalized = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;

  // If it's an uploaded media file (/uploads/...)
  if (normalized.startsWith("/uploads/")) {
    if (typeof window !== "undefined") {
      const isClientProd =
        window.location.hostname !== "localhost" &&
        window.location.hostname !== "127.0.0.1";

      const publicUrl = process.env.NEXT_PUBLIC_API_URL;
      if (publicUrl && publicUrl.startsWith("http")) {
        const backendOrigin = publicUrl.replace(/\/api\/?$/, "").replace(/\/+$/, "");
        if (isClientProd && (backendOrigin.includes("localhost") || backendOrigin.includes("127.0.0.1"))) {
          return `https://burayu-mesob-backend.onrender.com${normalized}`;
        }
        return `${backendOrigin}${normalized}`;
      }

      if (isClientProd) {
        return `https://burayu-mesob-backend.onrender.com${normalized}`;
      }
      return normalized;
    } else {
      const isProd = process.env.NODE_ENV === "production" || !!process.env.VERCEL;
      const backend = process.env.BACKEND_URL || (isProd ? "https://burayu-mesob-backend.onrender.com" : "http://127.0.0.1:5000");
      const backendOrigin = backend.replace(/\/api\/?$/, "").replace(/\/+$/, "");
      return `${backendOrigin}${normalized}`;
    }
  }

  return normalized;
}

export default getImageUrl;
