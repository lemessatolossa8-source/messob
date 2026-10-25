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
 * Automatically translates missing language fields in a data payload.
 * Supports fields formatted as { en: "", am: "", om: "" }.
 * @param {Object} data - The payload to be saved (e.g. req.body)
 * @returns {Promise<Object>} The mutated data with translations filled
 */
async function autoTranslateModelData(data) {
  if (!data || typeof data !== 'object') return data;

  // Common multilingual fields across all CMS models
  const multiFields = ['title', 'summary', 'description', 'content', 'about', 'name', 'guidance'];

  for (const field of multiFields) {
    if (data[field] && typeof data[field] === 'object' && !Array.isArray(data[field])) {
      const obj = data[field];
      const langs = ['en', 'am', 'om'];

      // Find source language (the first one that has content)
      let sourceLang = null;
      let sourceText = null;
      for (const lang of langs) {
        if (obj[lang] && String(obj[lang]).trim() !== '') {
          sourceLang = lang;
          sourceText = String(obj[lang]).trim();
          break; // Stop at first valid source
        }
      }

      if (sourceLang && sourceText) {
        // Translate for missing languages
        for (const targetLang of langs) {
          // If the target language is missing or completely empty, translate it
          if (!obj[targetLang] || String(obj[targetLang]).trim() === '') {
            try {
              const res = await translateWithTimeout(sourceText, {
                from: sourceLang,
                to: targetLang,
              }, 3500);
              obj[targetLang] = res.text;
            } catch (err) {
              // Fallback to source text if translation fails or times out
              obj[targetLang] = sourceText;
            }
          }
        }
      }
    }
  }
  return data;
}

module.exports = { autoTranslateModelData };
