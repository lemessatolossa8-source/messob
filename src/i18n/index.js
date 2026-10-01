import { DEFAULT_LANGUAGE, LANGUAGES, LANGUAGE_CODES } from "./config";
import om from "./translations/om";
import am from "./translations/am";
import en from "./translations/en";

export const translations = {
  om,
  am,
  en,
};

export { DEFAULT_LANGUAGE, LANGUAGES, LANGUAGE_CODES };

/**
 * Get translation string by key path (e.g. 'nav.home' or 'actions.save')
 * Falls back to default language ('om') and then to English ('en') if key is missing.
 */
export function getTranslation(lang, keyPath, fallback = "") {
  const activeLang = translations[lang] ? lang : DEFAULT_LANGUAGE;
  const keys = keyPath.split(".");

  let current = translations[activeLang];
  for (const k of keys) {
    if (current && typeof current === "object" && k in current) {
      current = current[k];
    } else {
      current = undefined;
      break;
    }
  }

  if (current !== undefined && typeof current === "string") {
    return current;
  }

  // Fallback to default lang
  if (activeLang !== DEFAULT_LANGUAGE) {
    let defCurrent = translations[DEFAULT_LANGUAGE];
    for (const k of keys) {
      if (defCurrent && typeof defCurrent === "object" && k in defCurrent) {
        defCurrent = defCurrent[k];
      } else {
        defCurrent = undefined;
        break;
      }
    }
    if (defCurrent !== undefined && typeof defCurrent === "string") {
      return defCurrent;
    }
  }

  // Fallback to English
  if (activeLang !== "en" && DEFAULT_LANGUAGE !== "en") {
    let enCurrent = translations.en;
    for (const k of keys) {
      if (enCurrent && typeof enCurrent === "object" && k in enCurrent) {
        enCurrent = enCurrent[k];
      } else {
        enCurrent = undefined;
        break;
      }
    }
    if (enCurrent !== undefined && typeof enCurrent === "string") {
      return enCurrent;
    }
  }

  return fallback || keyPath;
}

/**
 * Resolves a multilingual field object (e.g. { om: "...", am: "...", en: "..." })
 * to a string in the selected language, with fallback hierarchy: current -> om -> am -> en -> first available.
 */
export function getLocalizedText(field, lang = DEFAULT_LANGUAGE) {
  if (!field) return "";
  if (typeof field === "string") return field;
  if (typeof field === "object") {
    if (field[lang] && typeof field[lang] === "string" && field[lang].trim() !== "") {
      return field[lang];
    }
    if (field.om && typeof field.om === "string" && field.om.trim() !== "") {
      return field.om;
    }
    if (field.am && typeof field.am === "string" && field.am.trim() !== "") {
      return field.am;
    }
    if (field.en && typeof field.en === "string" && field.en.trim() !== "") {
      return field.en;
    }
    const values = Object.values(field).filter((v) => typeof v === "string" && v.trim() !== "");
    if (values.length > 0) return values[0];
  }
  return "";
}
