/**
 * Utility to normalize image paths and URLs across the Burayu MESOB application.
 * Handles:
 * - Full URLs (http://, https://, data:)
 * - Relative URLs starting with slash (/uploads/...)
 * - Relative URLs without leading slash (uploads/...)
 * - Fallbacks when no image is present
 */

export function getImageUrl(imagePath, fallback = "") {
  if (!imagePath || typeof imagePath !== "string") return fallback;
  const trimmed = imagePath.trim();
  if (!trimmed) return fallback;

  // Full external or data URLs
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("blob:")
  ) {
    return trimmed;
  }

  // Ensure leading slash for local paths
  if (trimmed.startsWith("/")) {
    return trimmed;
  }

  return `/${trimmed}`;
}

export default getImageUrl;
