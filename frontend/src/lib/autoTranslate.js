export const autoTranslateForm = async (
  formData,
  setFormData,
  currentLang,
  newLang,
  toast,
  setTranslating
) => {
  // Find all multilingual fields (objects with om, am, en keys)
  const fieldsToTranslate = [];
  const textToTranslate = [];

  for (const [key, value] of Object.entries(formData)) {
    if (
      value &&
      typeof value === "object" &&
      "om" in value &&
      "am" in value &&
      "en" in value
    ) {
      const currentText = value[currentLang];
      const newText = value[newLang];

      // Only translate if current has content and new doesn't
      if (
        currentText &&
        currentText.trim() !== "" &&
        (!newText || newText.trim() === "")
      ) {
        fieldsToTranslate.push(key);
        textToTranslate.push(currentText);
      }
    }
  }

  if (fieldsToTranslate.length === 0) return;

  setTranslating(true);
  const toastId = toast.info("Auto-translating content...");

  try {
    const token = localStorage.getItem("token") || "";
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

    const promises = fieldsToTranslate.map(async (field, index) => {
      const text = textToTranslate[index];
      const res = await fetch(`${apiUrl}/translate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          text,
          sourceLang: currentLang,
          targetLangs: [newLang],
        }),
      });
      const data = await res.json();
      if (data.success && data.translations && data.translations[newLang]) {
        return { field, text: data.translations[newLang] };
      }
      throw new Error(data.message || "Translation failed");
    });

    const results = await Promise.all(promises);

    setFormData((prev) => {
      const updated = { ...prev };
      results.forEach(({ field, text }) => {
        updated[field] = {
          ...updated[field],
          [newLang]: text,
        };
      });
      return updated;
    });

    // We can't clear specific toasts easily with this custom context, so just show success
    toast.success("Translation complete!");
  } catch (error) {
    console.error("Translation error:", error);
    toast.error("Auto-translation failed. You can manually translate later.");
  } finally {
    setTranslating(false);
  }
};
