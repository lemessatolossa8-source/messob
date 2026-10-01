/**
 * Validation utility functions for Burayu MESOB Portal forms
 */

export function validateRequired(value, fieldName = "Field") {
  if (value === undefined || value === null) {
    return `${fieldName} is required.`;
  }
  if (typeof value === "string" && value.trim() === "") {
    return `${fieldName} cannot be empty.`;
  }
  if (Array.isArray(value) && value.length === 0) {
    return `${fieldName} must have at least one item.`;
  }
  return null;
}

export function validateEmail(value, isRequired = true) {
  if (!value || typeof value !== "string" || value.trim() === "") {
    return isRequired ? "Email address is required." : null;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value.trim())) {
    return "Please enter a valid email address.";
  }
  return null;
}

export function validatePhone(value, isRequired = false) {
  if (!value || typeof value !== "string" || value.trim() === "") {
    return isRequired ? "Phone number is required." : null;
  }
  const cleanPhone = value.replace(/[\s\-()]/g, "");
  // Ethiopian formats: 09XXXXXXXX, 07XXXXXXXX, +2519XXXXXXXX, +2517XXXXXXXX, 011XXXXXXX
  const ethiopianPhoneRegex = /^(?:\+251|0)(?:9\d{8}|7\d{8}|11\d{7})$/;
  const generalPhoneRegex = /^\+?[0-9]{9,15}$/;

  if (!ethiopianPhoneRegex.test(cleanPhone) && !generalPhoneRegex.test(cleanPhone)) {
    return "Please enter a valid phone number (e.g. 09XXXXXXXX or +2519XXXXXXXX).";
  }
  return null;
}

export function validateUrl(value, isRequired = false) {
  if (!value || typeof value !== "string" || value.trim() === "") {
    return isRequired ? "URL is required." : null;
  }
  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol)) {
      return "URL must begin with http:// or https://";
    }
    return null;
  } catch {
    return "Please enter a valid URL (e.g. https://example.com).";
  }
}

export function validateLength(value, { min = 0, max = Infinity }, fieldName = "Field") {
  if (!value) return null;
  const str = String(value).trim();
  if (min > 0 && str.length < min) {
    return `${fieldName} must be at least ${min} characters.`;
  }
  if (max < Infinity && str.length > max) {
    return `${fieldName} cannot exceed ${max} characters.`;
  }
  return null;
}

export function validateDate(value, fieldName = "Date") {
  if (!value) return `${fieldName} is required.`;
  const timestamp = Date.parse(value);
  if (isNaN(timestamp)) {
    return `Please enter a valid ${fieldName.toLowerCase()}.`;
  }
  return null;
}

export function validateTime(value, fieldName = "Time") {
  if (!value) return `${fieldName} is required.`;
  const timeRegex = /^(?:0?[1-9]|1[0-2]):[0-5][0-9]\s*(?:AM|PM|am|pm)?$/i;
  const militaryRegex = /^(?:[01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(value.trim()) && !militaryRegex.test(value.trim())) {
    return `Please enter a valid ${fieldName.toLowerCase()} (e.g. 09:00 AM or 14:30).`;
  }
  return null;
}

export function validateTimeRange(startTime, endTime) {
  if (!startTime || !endTime) return null;
  // Convert standard strings to comparable minutes if possible
  const toMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (!match) return 0;
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const meridiem = match[3]?.toUpperCase();
    if (meridiem === "PM" && hours < 12) hours += 12;
    if (meridiem === "AM" && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  const startMin = toMinutes(startTime);
  const endMin = toMinutes(endTime);

  if (startMin > 0 && endMin > 0 && endMin <= startMin) {
    return "End time cannot be earlier than or equal to start time.";
  }
  return null;
}

export function validateDateRange(startDate, endDate) {
  if (!startDate || !endDate) return null;
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();

  if (!isNaN(start) && !isNaN(end) && end < start) {
    return "Completion date cannot be earlier than start date.";
  }
  return null;
}

export function validateImage(fileOrUrl, maxSizeMB = 5) {
  if (!fileOrUrl) return null;
  if (typeof fileOrUrl === "string") {
    const validExtensions = [".jpg", ".jpeg", ".png", ".webp"];
    const lower = fileOrUrl.toLowerCase();
    const hasValidExt = validExtensions.some((ext) => lower.includes(ext));
    if (!hasValidExt && !lower.startsWith("data:image/") && !lower.startsWith("http")) {
      return "Only JPG, JPEG, PNG, or WEBP images are allowed.";
    }
    return null;
  }
  if (typeof fileOrUrl === "object" && fileOrUrl.size) {
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (fileOrUrl.size > maxBytes) {
      return `Image size cannot exceed ${maxSizeMB} MB.`;
    }
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (fileOrUrl.type && !validTypes.includes(fileOrUrl.type.toLowerCase())) {
      return "Only JPG, JPEG, PNG, or WEBP image formats are supported.";
    }
  }
  return null;
}

export function validateMultilingual(
  fieldObj,
  fieldName = "Title",
  { isPublished = false, requiredLanguages = ["am"] } = {}
) {
  const errors = {};

  const primaryLang = requiredLanguages[0] || "am";

  if (!fieldObj || typeof fieldObj !== "object") {
    errors[primaryLang] = `${fieldName} is required.`;
    return errors;
  }

  // Ensure at least primary language is provided
  if (!fieldObj[primaryLang] || fieldObj[primaryLang].trim() === "") {
    errors[primaryLang] = `${fieldName} (${primaryLang.toUpperCase()}) is required.`;
  }

  // When publishing, validate additional required translations
  if (isPublished) {
    ["am", "om", "en"].forEach((lang) => {
      if (!fieldObj[lang] || fieldObj[lang].trim() === "") {
        errors[lang] = `${fieldName} (${lang.toUpperCase()}) is required before publishing.`;
      }
    });
  }

  return Object.keys(errors).length > 0 ? errors : null;
}

