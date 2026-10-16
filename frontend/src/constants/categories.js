/**
 * Centralized category definitions for Burayu MESOB CMS
 * Used across admin forms, filters, and frontend displays
 */

// NEWS CATEGORIES
export const NEWS_CATEGORIES = [
  "City Administration & Governance",
  "Urban Development",
  "Infrastructure & Construction",
  "Community Development",
  "Public Services",
  "Investment & Economy",
  "Education & Youth",
  "Health & Social Affairs",
  "Environment & Green Development",
  "Culture & Tourism",
  "Events & Celebrations",
  "Partnerships & Cooperation",
  "Technology & Digital Services",
  "Other",
];

// ANNOUNCEMENT CATEGORIES
export const ANNOUNCEMENT_CATEGORIES = [
  "Public Notice",
  "Service Announcement",
  "Meeting & Event",
  "Job & Vacancy",
  "Procurement & Tender",
  "Project Notice",
  "Community Notice",
  "Health & Safety",
  "Education & Training",
  "Infrastructure & Road Notice",
  "Emergency Notice",
  "Holiday & Public Celebration",
  "Other",
];

// GALLERY CATEGORIES
export const GALLERY_CATEGORIES = [
  "City & Community",
  "Events & Celebrations",
  "Community Activities",
  "Meetings & Conferences",
  "People & Leadership",
  "Culture & Heritage",
  "Education & Youth",
  "Health & Social Activities",
  "Environment & Green Spaces",
  "City Development",
  "Places & Facilities",
  "General Photos",
];

// PROJECT CATEGORIES
export const PROJECT_CATEGORIES = [
  "Road & Transport",
  "Water Supply",
  "Drainage & Sewerage",
  "Buildings & Public Facilities",
  "Housing & Residential Development",
  "Urban Development",
  "Education Facilities",
  "Health Facilities",
  "Environment & Green Development",
  "Parks & Recreation",
  "Market & Commercial Development",
  "Digital & Technology",
  "Community Development",
  "Other",
];

// PROJECT STATUS OPTIONS
export const PROJECT_STATUS_OPTIONS = [
  "Planned",
  "Ongoing",
  "Completed",
];

// Helper function to convert category array to select options
export function categoriesToOptions(categories) {
  return categories.map((cat) => ({ value: cat, label: cat }));
}

// Helper function to get default category
export function getDefaultCategory(type) {
  switch (type) {
    case "news":
      return NEWS_CATEGORIES[0];
    case "announcement":
      return ANNOUNCEMENT_CATEGORIES[0];
    case "gallery":
      return GALLERY_CATEGORIES[0];
    case "project":
      return PROJECT_CATEGORIES[0];
    default:
      return "";
  }
}
