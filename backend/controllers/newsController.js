const News = require("../models/News");
const createCRUDController = require("./crudController");
const { autoTranslateModelData } = require("../utils/autoTranslator");

// Get base CRUD operations
const baseCRUD = createCRUDController(News, "News");

// Helper to normalize multilingual fields whether passed as object or string
const parseMultilingualField = (val) => {
  if (!val) return null;
  if (typeof val === "object" && !Array.isArray(val)) return val;
  if (typeof val === "string") {
    const trimmed = val.trim();
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed && typeof parsed === "object") return parsed;
      } catch {
        // Fall through to plain text
      }
    }
    return { en: trimmed, am: "", om: "" };
  }
  return null;
};

const getContentString = (contentVal) => {
  if (!contentVal) return "";
  if (typeof contentVal === "string") return contentVal;
  return contentVal.en || contentVal.om || contentVal.am || "";
};

const makeExcerpt = (text) => {
  if (!text) return "";
  const cleaned = text.replace(/<[^>]*>?/gm, "").trim();
  return cleaned.length > 200 ? cleaned.slice(0, 200).trim() + "..." : cleaned;
};

// Normalize news payload for single-language or simplified inputs
const prepareNewsPayload = (body) => {
  const payload = { ...body };

  if (payload.title) {
    payload.title = parseMultilingualField(payload.title);
  }

  if (payload.content) {
    payload.content = parseMultilingualField(payload.content);
  }

  // If summary not provided or empty, auto-generate excerpt from content
  const existingSummaryStr = getContentString(payload.summary);
  if (!existingSummaryStr && payload.content) {
    const excerpt = makeExcerpt(getContentString(payload.content));
    if (excerpt) {
      payload.summary = { en: excerpt, am: "", om: "" };
    }
  } else if (payload.summary) {
    payload.summary = parseMultilingualField(payload.summary);
  }

  if (!payload.category) {
    payload.category = "General";
  }

  if (!payload.date) {
    payload.date = new Date().toISOString().split("T")[0];
  }

  if (payload.video === undefined || payload.video === null) {
    payload.video = "";
  }

  return payload;
};

// Override create to handle simplified fields and file uploads
const create = async (req, res) => {
  try {
    let payload = prepareNewsPayload(req.body);
    payload = await autoTranslateModelData(payload);

    // Handle uploaded files
    if (req.files) {
      if (req.files.image && req.files.image[0]) {
        payload.image = `/uploads/${req.files.image[0].filename}`;
      }
      if (req.files.video && req.files.video[0]) {
        payload.video = `/uploads/${req.files.video[0].filename}`;
      }
    }

    if (req.user) {
      payload.authorId = req.user.id || req.user._id;
    }

    const item = await News.create(payload);
    if (baseCRUD.invalidateCache) baseCRUD.invalidateCache();
    res.status(201).json({
      success: true,
      message: "News created successfully",
      data: item.toJSON(),
    });
  } catch (error) {
    console.error("[newsController] create error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to create news",
    });
  }
};

// Override update to handle simplified fields and file uploads
const update = async (req, res) => {
  try {
    const item = await News.findByPk(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, message: "News not found" });
    }

    let payload = prepareNewsPayload(req.body);
    payload = await autoTranslateModelData(payload);

    // Handle uploaded files
    if (req.files) {
      if (req.files.image && req.files.image[0]) {
        payload.image = `/uploads/${req.files.image[0].filename}`;
      } else if (req.body.existingImage) {
        payload.image = req.body.existingImage;
      }

      if (req.files.video && req.files.video[0]) {
        payload.video = `/uploads/${req.files.video[0].filename}`;
      } else if (req.body.existingVideo) {
        payload.video = req.body.existingVideo;
      } else if (req.body.video === "" || req.body.video === null) {
        payload.video = "";
      }
    } else {
      if (req.body.existingImage) payload.image = req.body.existingImage;
      if (req.body.existingVideo) payload.video = req.body.existingVideo;
      if (req.body.video === "" || req.body.video === null) payload.video = "";
    }

    await item.update(payload);
    if (baseCRUD.invalidateCache) baseCRUD.invalidateCache();

    res.json({
      success: true,
      message: "News updated successfully",
      data: item.toJSON(),
    });
  } catch (error) {
    console.error("[newsController] update error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to update news",
    });
  }
};

module.exports = {
  ...baseCRUD,
  create,
  update,
};
