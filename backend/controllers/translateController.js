const translate = require("google-translate-api-x");

exports.translateText = async (req, res) => {
  const { text, sourceLang, targetLangs } = req.body;

  if (!text || String(text).trim() === "") {
    return res.json({ success: true, translations: {} });
  }

  const targets = Array.isArray(targetLangs) && targetLangs.length > 0 
    ? targetLangs 
    : ["en", "om", "am"];

  // Intelligent detection:
  // If text contains Ethiopic unicode range, it's definitely Amharic
  const isEthiopic = /[\u1200-\u137F]/.test(text);
  const actualSource = isEthiopic ? "am" : (sourceLang || "auto");

  try {
    const translations = {};

    await Promise.allSettled(
      targets.map(async (target) => {
        if (target === actualSource) {
          translations[target] = text;
          return;
        }

        try {
          const opts = { to: target, autoCorrect: true };
          if (actualSource !== "auto") opts.from = actualSource;
          const r = await translate(text, opts);
          translations[target] = r.text || text;
        } catch (err) {
          // Retry without explicit from in case of language detection mismatch
          try {
            const r2 = await translate(text, { to: target, autoCorrect: true });
            translations[target] = r2.text || text;
          } catch (e2) {
            translations[target] = text;
          }
        }
      })
    );

    res.json({ success: true, translations });
  } catch (error) {
    console.error("Translation Controller Error:", error.message);
    res.json({ success: true, translations: { [actualSource]: text } });
  }
};
