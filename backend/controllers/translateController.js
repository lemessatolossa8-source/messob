const translate = require("google-translate-api-x");

exports.translateText = async (req, res) => {
  const { text, sourceLang, targetLangs } = req.body;
  
  if (!text) {
    return res.status(400).json({ success: false, message: "Text is required for translation" });
  }
  if (!targetLangs || !Array.isArray(targetLangs)) {
    return res.status(400).json({ success: false, message: "targetLangs must be an array" });
  }

  // Google Translate language codes: 
  // 'en' (English), 'am' (Amharic), 'om' (Oromo)
  const mapLang = (lang) => (lang === "om" ? "om" : lang);

  try {
    const translations = {};
    
    // We run translations in parallel
    const promises = targetLangs.map(async (lang) => {
      if (lang === sourceLang) {
        translations[lang] = text;
      } else {
        const res = await translate(text, { from: mapLang(sourceLang), to: mapLang(lang) });
        translations[lang] = res.text;
      }
    });

    await Promise.all(promises);
    
    res.json({ success: true, translations });
  } catch (error) {
    console.error("Translation Error:", error.message);
    res.status(500).json({ success: false, message: "Translation failed. Please try again." });
  }
};
