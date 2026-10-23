const { Op, Sequelize } = require("sequelize");
const Announcement = require("../models/Announcement");
const createCRUDController = require("./crudController");
const { autoTranslateModelData } = require("../utils/autoTranslator");

// Get base CRUD operations
const baseCRUD = createCRUDController(Announcement, "Announcement");

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

// Normalize announcement payload for single-language or simplified inputs
const prepareAnnouncementPayload = (body) => {
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

  if (!payload.date) {
    payload.date = new Date().toISOString().split("T")[0];
  }

  if (payload.expiryDate || payload.expiry_date) {
    payload.expiryDate = payload.expiryDate || payload.expiry_date;
  }

  if (!payload.category) {
    payload.category = "General";
  }

  if (payload.image === undefined || payload.image === null) {
    payload.image = "";
  }

  return payload;
};

// Custom getAll to filter expired and upcoming announcements for public users
const getAll = async (req, res) => {
  const { status, category, search, page = 1, limit = 20 } = req.query;
  const where = {};
  const andConditions = [];

  // Public access: only published, non-expired, and past publication date
  const isAuth = !!req.user;
  if (!isAuth) {
    where.status = "published";
    const today = new Date().toISOString().split("T")[0];
    andConditions.push(
      // Must have reached publication date (date <= today) or date is null
      {
        [Op.or]: [
          { date: { [Op.lte]: today } },
          { date: null },
        ],
      },
      // Must not be expired (expiryDate >= today) or expiryDate is null
      {
        [Op.or]: [
          { expiryDate: { [Op.gte]: today } },
          { expiryDate: null },
        ],
      }
    );
  } else if (status && status !== "all") {
    where.status = status;
    // Admins see all announcements
  }

  if (category && category.toLowerCase() !== "all") {
    where.category = category;
  }

  if (search && search.trim()) {
    const q = `%${search.trim()}%`;
    andConditions.push({
      [Op.or]: [
        Sequelize.where(Sequelize.cast(Sequelize.col("title"), "char"), { [Op.like]: q }),
      ],
    });
  }

  if (andConditions.length > 0) {
    where[Op.and] = andConditions;
  }

  const parsedLimit = parseInt(limit, 10);
  const parsedPage = parseInt(page, 10);
  const offset = (parsedPage - 1) * parsedLimit;

  const { rows, count: total } = await Announcement.findAndCountAll({
    where,
    order: [["createdAt", "DESC"]],
    limit: parsedLimit,
    offset,
  });

  const items = rows.map((item) => item.toJSON());

  if (!isAuth) {
    res.set("Cache-Control", "public, max-age=60, s-maxage=120, stale-while-revalidate=300");
  } else {
    res.set("Cache-Control", "private, no-cache, no-store, must-revalidate");
  }

  res.json({
    success: true,
    data: {
      items,
      total,
      totalPages: Math.ceil(total / parsedLimit) || 1,
      currentPage: parsedPage,
    },
  });
};

// Custom getById to manage public visibility
const getById = async (req, res) => {
  const item = await Announcement.findByPk(req.params.id);
  if (!item) {
    return res.status(404).json({ success: false, message: "Announcement not found" });
  }

  // Public users: only view published, active announcements
  if (!req.user) {
    if (item.status !== "published") {
      return res.status(404).json({ success: false, message: "Announcement not found" });
    }
    const today = new Date().toISOString().split("T")[0];
    if (item.date && item.date > today) {
      return res.status(404).json({ success: false, message: "Announcement not found" });
    }
    if (item.expiryDate && item.expiryDate < today) {
      return res.status(404).json({ success: false, message: "Announcement not found" });
    }
  }

  if (!req.user) {
    res.set("Cache-Control", "public, max-age=60, s-maxage=120, stale-while-revalidate=300");
  } else {
    res.set("Cache-Control", "private, no-cache, no-store, must-revalidate");
  }

  res.json({ success: true, data: item.toJSON() });
};

// Create announcement
const create = async (req, res) => {
  let payload = prepareAnnouncementPayload(req.body);

  if (payload.date && payload.expiryDate && payload.expiryDate < payload.date) {
    return res.status(400).json({
      success: false,
      message: "Expiry date must be later than or equal to publication date",
    });
  }

  payload = await autoTranslateModelData(payload);

  if (req.user) {
    payload.authorId = req.user.id || req.user._id;
  }

  const item = await Announcement.create(payload);
  res.status(201).json({
    success: true,
    message: "Announcement created successfully",
    data: item.toJSON(),
  });
};

// Update announcement
const update = async (req, res) => {
  const item = await Announcement.findByPk(req.params.id);
  if (!item) {
    return res.status(404).json({ success: false, message: "Announcement not found" });
  }

  let payload = prepareAnnouncementPayload(req.body);

  if (payload.date && payload.expiryDate && payload.expiryDate < payload.date) {
    return res.status(400).json({
      success: false,
      message: "Expiry date must be later than or equal to publication date",
    });
  }

  payload = await autoTranslateModelData(payload);

  await item.update(payload);

  res.json({
    success: true,
    message: "Announcement updated successfully",
    data: item.toJSON(),
  });
};

// Export CRUD operations
module.exports = {
  ...baseCRUD,
  getAll,
  getById,
  create,
  update,
};
