const translate = require('google-translate-api-x');

/**
 * Automatically translates missing language fields in a data payload.
 * Supports fields formatted as { en: "", am: "", om: "" }.
 * @param {Object} data - The payload to be saved (e.g. req.body)
 * @returns {Promise<Object>} The mutated data with translations filled
 */
async function autoTranslateModelData(data) {
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
              // Ensure we pass exact language codes google-translate-api-x expects
              // 'om' is valid for Afaan Oromo
              const res = await translate(sourceText, { 
                from: sourceLang, 
                to: targetLang 
              });
              obj[targetLang] = res.text;
            } catch (err) {
              console.error(`Auto-translate failed for ${field} (${sourceLang}->${targetLang}):`, err.message);
              // Fallback to source text if translation fails (so it doesn't stay null)
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
