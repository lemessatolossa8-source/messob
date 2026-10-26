const translate = require('google-translate-api-x');

/**
 * Helper to call translation with a strict timeout to prevent slow network stalls.
 */
function translateWithTimeout(text, options, timeoutMs = 3500) {
  return Promise.race([
    translate(text, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Translation timeout after ' + timeoutMs + 'ms')), timeoutMs)
    ),
  ]);
}

/**
 * Translate a single text string into target language
 */
async function translateTextSafe(sourceText, targetLang, detectedSource) {
  if (!sourceText || String(sourceText).trim() === '') return '';
  const isAm = /[\u1200-\u137F]/.test(sourceText);
  const from = isAm ? 'am' : (detectedSource || 'auto');

  if (targetLang === from) return sourceText;

  try {
    const opts = { to: targetLang, autoCorrect: true };
    if (from !== 'auto') opts.from = from;
    const res = await translateWithTimeout(sourceText, opts, 3500);
    return res.text || sourceText;
  } catch (err) {
    try {
      const res2 = await translateWithTimeout(sourceText, { to: targetLang, autoCorrect: true }, 3000);
      return res2.text || sourceText;
    } catch (e2) {
      return sourceText;
    }
  }
}

/**
 * Automatically translates missing language fields in a standard { en: "", am: "", om: "" } object.
 */
async function translateLangObject(obj) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj;

  const langs = ['en', 'om', 'am'];
  let sourceLang = null;
  let sourceText = null;

  for (const lang of langs) {
    if (obj[lang] && String(obj[lang]).trim() !== '') {
      sourceLang = lang;
      sourceText = String(obj[lang]).trim();
      break;
    }
  }

  if (sourceLang && sourceText) {
    for (const targetLang of langs) {
      if (!obj[targetLang] || String(obj[targetLang]).trim() === '') {
        obj[targetLang] = await translateTextSafe(sourceText, targetLang, sourceLang);
      }
    }
  }
  return obj;
}

/**
 * Automatically translates missing language fields in a data payload.
 * Supports:
 * - standard fields { en: "", am: "", om: "" }
 * - nested mayorMessage { om: { ... }, am: { ... }, en: { ... } }
 * - nested cityInfo { about: { om, am, en }, mission: { ... }, ... }
 * @param {Object} data - The payload to be saved (e.g. req.body)
 * @returns {Promise<Object>} The mutated data with translations filled
 */
async function autoTranslateModelData(data) {
  if (!data || typeof data !== 'object') return data;

  const multiFields = [
    'title', 'summary', 'description', 'content', 'about', 'name', 
    'guidance', 'jobTitle', 'welcomeMessage', 'serviceName', 'department', 
    'position', 'caption', 'message'
  ];

  // 1. Standard top-level multilingual fields
  for (const field of multiFields) {
    if (data[field] && typeof data[field] === 'object' && !Array.isArray(data[field])) {
      await translateLangObject(data[field]);
    }
  }

  // 2. Nested mayorMessage structure: { om: { name, title, ... }, am: { ... }, en: { ... } }
  if (data.mayorMessage && typeof data.mayorMessage === 'object' && !Array.isArray(data.mayorMessage)) {
    const mm = data.mayorMessage;
    const langs = ['om', 'am', 'en'];
    const textFields = ['name', 'jobTitle', 'welcomeMessage', 'title', 'message'];

    // Ensure lang sub-objects exist
    langs.forEach((l) => {
      if (!mm[l] || typeof mm[l] !== 'object') mm[l] = {};
    });

    // Copy photo if one language has it but others don't
    const photo = mm.om?.photo || mm.en?.photo || mm.am?.photo || '';
    if (photo) {
      langs.forEach((l) => {
        if (!mm[l].photo) mm[l].photo = photo;
      });
    }

    for (const tf of textFields) {
      let sourceLang = null;
      let sourceText = null;

      for (const l of langs) {
        if (mm[l] && mm[l][tf] && String(mm[l][tf]).trim() !== '') {
          sourceLang = l;
          sourceText = String(mm[l][tf]).trim();
          break;
        }
      }

      if (sourceLang && sourceText) {
        for (const targetLang of langs) {
          if (!mm[targetLang][tf] || String(mm[targetLang][tf]).trim() === '') {
            mm[targetLang][tf] = await translateTextSafe(sourceText, targetLang, sourceLang);
          }
        }
      }
    }
  }

  // 3. Nested cityInfo structure: { about: { om, am, en }, mission: { ... }, ... }
  if (data.cityInfo && typeof data.cityInfo === 'object' && !Array.isArray(data.cityInfo)) {
    const ci = data.cityInfo;
    for (const key of Object.keys(ci)) {
      if (ci[key] && typeof ci[key] === 'object' && !Array.isArray(ci[key])) {
        await translateLangObject(ci[key]);
      }
    }
  }

  return data;
}

module.exports = { autoTranslateModelData, translateTextSafe };
