import { getApiBase } from "@/services/api";

/**
 * Translate a single text string to target languages.
 * Returns an object with { [lang]: translatedText }.
 */
export async function translateSingleText(text, targetLangs = ["om", "am", "en"], sourceLang = "auto") {
  if (!text || String(text).trim() === "") return {};

  try {
    const token = typeof window !== "undefined"
      ? localStorage.getItem("mesob_token") || localStorage.getItem("token") || ""
      : "";
    const base = getApiBase();

    const res = await fetch(`${base}/translate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        text,
        sourceLang,
        targetLangs,
      }),
    });

    const data = await res.json();
    if (data.success && data.translations) {
      return data.translations;
    }
  } catch (err) {
    console.error("translateSingleText error:", err);
  }
  return {};
}

/**
 * Automatically translates missing language fields in standard form data:
 * e.g. formData[field] = { om: "", am: "", en: "" }
 * or nested mayorMessage formData[lang] = { name: "", ... }
 */
export const autoTranslateForm = async (
  formData,
  setFormData,
  currentLang,
  newLang,
  toast,
  setTranslating
) => {
  if (!formData || typeof formData !== "object") return;

  const targetLangs = newLang === "all" ? ["om", "am", "en"] : [newLang];
  let hasItemsToTranslate = false;

  // Case A: Mayor message structure: formData[lang] = { name, jobTitle, welcomeMessage, title, message }
  const isMayorStyle = formData.om && typeof formData.om === "object" &&
                       formData.am && typeof formData.am === "object" &&
                       formData.en && typeof formData.en === "object";

  if (isMayorStyle) {
    const textFields = ["name", "jobTitle", "welcomeMessage", "title", "message"];
    const mayorTasks = [];

    for (const field of textFields) {
      const currentText = formData[currentLang]?.[field];
      if (currentText && String(currentText).trim() !== "") {
        for (const tLang of targetLangs) {
          if (tLang !== currentLang) {
            const targetText = formData[tLang]?.[field];
            if (!targetText || String(targetText).trim() === "") {
              mayorTasks.push({ field, currentText, tLang });
            }
          }
        }
      }
    }

    if (mayorTasks.length === 0) return;

    if (setTranslating) setTranslating(true);
    if (toast?.info) toast.info("Auto-translating content...");

    try {
      const translations = await Promise.allSettled(
        mayorTasks.map(async (task) => {
          const res = await translateSingleText(task.currentText, [task.tLang], currentLang);
          return { ...task, text: res[task.tLang] || task.currentText };
        })
      );

      setFormData((prev) => {
        const next = { ...prev };
        translations.forEach((result) => {
          if (result.status === "fulfilled" && result.value?.text) {
            const { field, tLang, text } = result.value;
            next[tLang] = {
              ...next[tLang],
              [field]: text,
            };
          }
        });
        return next;
      });

      if (toast?.success) toast.success("Translation complete!");
    } catch (err) {
      console.error("Mayor autoTranslate error:", err);
      if (toast?.error) toast.error("Auto-translation encountered an error.");
    } finally {
      if (setTranslating) setTranslating(false);
    }
    return;
  }

  // Case B: Standard structure: formData[field] = { om: "", am: "", en: "" }
  const tasks = [];

  for (const [key, value] of Object.entries(formData)) {
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      "om" in value &&
      "am" in value &&
      "en" in value
    ) {
      const currentText = value[currentLang];
      if (currentText && String(currentText).trim() !== "") {
        for (const tLang of targetLangs) {
          if (tLang !== currentLang) {
            const newText = value[tLang];
            if (!newText || String(newText).trim() === "") {
              tasks.push({ field: key, currentText, tLang });
            }
          }
        }
      }
    }
  }

  if (tasks.length === 0) return;

  if (setTranslating) setTranslating(true);
  if (toast?.info) toast.info("Auto-translating content...");

  try {
    const results = await Promise.allSettled(
      tasks.map(async (task) => {
        const res = await translateSingleText(task.currentText, [task.tLang], currentLang);
        return { ...task, text: res[task.tLang] || task.currentText };
      })
    );

    setFormData((prev) => {
      const updated = { ...prev };
      results.forEach((r) => {
        if (r.status === "fulfilled" && r.value?.text) {
          const { field, tLang, text } = r.value;
          updated[field] = {
            ...updated[field],
            [tLang]: text,
          };
        }
      });
      return updated;
    });

    if (toast?.success) toast.success("Translation complete!");
  } catch (error) {
    console.error("Translation error:", error);
    if (toast?.error) toast.error("Auto-translation failed. You can manually translate later.");
  } finally {
    if (setTranslating) setTranslating(false);
  }
};
