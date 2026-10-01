import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitize HTML content to prevent XSS attacks
 * Safe for rendering user-generated content
 */
export function sanitizeHtml(dirty) {
  if (!dirty || typeof dirty !== "string") return "";
  
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      "p", "br", "strong", "em", "u", "a", "ul", "ol", "li", 
      "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "code", "pre"
    ],
    ALLOWED_ATTR: ["href", "target", "rel"],
    ALLOW_DATA_ATTR: false,
  });
}

/**
 * Sanitize plain text - strips all HTML tags
 * Use for titles, names, short descriptions
 */
export function sanitizeText(text) {
  if (!text || typeof text !== "string") return "";
  
  return DOMPurify.sanitize(text, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
}

/**
 * Sanitize URL to prevent javascript: and data: protocols
 */
export function sanitizeUrl(url) {
  if (!url || typeof url !== "string") return "";
  
  const trimmed = url.trim();
  
  // Block dangerous protocols
  if (/^(javascript|data|vbscript):/i.test(trimmed)) {
    return "";
  }
  
  // Only allow http, https, and relative URLs
  if (!/^(https?:\/\/|\/)/i.test(trimmed)) {
    return "";
  }
  
  return trimmed;
}

/**
 * Sanitize multilingual object (title, summary, content fields)
 */
export function sanitizeMultilingual(obj, sanitizeFn = sanitizeText) {
  if (!obj || typeof obj !== "object") return {};
  
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    sanitized[key] = sanitizeFn(value);
  }
  return sanitized;
}

/**
 * Sanitize form data before sending to API
 */
export function sanitizeFormData(data) {
  const sanitized = { ...data };
  
  // Sanitize multilingual fields
  if (sanitized.title && typeof sanitized.title === "object") {
    sanitized.title = sanitizeMultilingual(sanitized.title, sanitizeText);
  }
  
  if (sanitized.summary && typeof sanitized.summary === "object") {
    sanitized.summary = sanitizeMultilingual(sanitized.summary, sanitizeText);
  }
  
  if (sanitized.content && typeof sanitized.content === "object") {
    sanitized.content = sanitizeMultilingual(sanitized.content, sanitizeHtml);
  }
  
  if (sanitized.description && typeof sanitized.description === "object") {
    sanitized.description = sanitizeMultilingual(sanitized.description, sanitizeHtml);
  }
  
  // Sanitize single text fields
  if (sanitized.name && typeof sanitized.name === "string") {
    sanitized.name = sanitizeText(sanitized.name);
  }
  
  if (sanitized.location && typeof sanitized.location === "string") {
    sanitized.location = sanitizeText(sanitized.location);
  }
  
  if (sanitized.email && typeof sanitized.email === "string") {
    sanitized.email = sanitizeText(sanitized.email);
  }
  
  // Sanitize URLs
  if (sanitized.image && typeof sanitized.image === "string") {
    sanitized.image = sanitizeUrl(sanitized.image);
  }
  
  if (sanitized.link && typeof sanitized.link === "string") {
    sanitized.link = sanitizeUrl(sanitized.link);
  }
  
  return sanitized;
}
