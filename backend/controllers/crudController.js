const { Op, Sequelize } = require("sequelize");
const path = require("path");
const fs = require("fs");
const { autoTranslateModelData } = require("../utils/autoTranslator");

// Safely delete an uploaded file referenced as "/uploads/<filename>"
const deleteUploadedFile = (imageValue) => {
  try {
    if (typeof imageValue !== "string") return;
    const match = imageValue.match(/^\/?uploads\/([^/\\?#]+)$/i);
    if (!match) return;
    const filename = match[1];
    const backendFilePath = path.join(__dirname, "..", "uploads", filename);
    if (fs.existsSync(backendFilePath)) fs.unlinkSync(backendFilePath);
    const frontendFilePath = path.join(__dirname, "..", "..", "frontend", "public", "uploads", filename);
    if (fs.existsSync(frontendFilePath)) fs.unlinkSync(frontendFilePath);
  } catch (err) {
    console.warn(`Failed to remove upload file for "${imageValue}":`, err.message);
  }
};

// Helper to normalize multilingual fields whether passed as object, string, or json string
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
        // Fall through
      }
    }
    return { en: trimmed, am: "", om: "" };
  }
  return null;
};

// Normalize payload fields, multilingual objects, and model attributes
const normalizePayload = (body, Model) => {
  const payload = { ...body };

  // Common multilingual fields
  const multiFields = ["title", "name", "content", "summary", "description", "about", "guidance"];
  for (const f of multiFields) {
    if (payload[f] !== undefined) {
      const parsed = parseMultilingualField(payload[f]);
      if (parsed) payload[f] = parsed;
    }
  }

  // Model column interop: if model expects title but payload only has name, or vice versa
  if (Model.rawAttributes) {
    if (Model.rawAttributes.title && !payload.title && payload.name) {
      payload.title = payload.name;
    }
    if (Model.rawAttributes.name && !payload.name && payload.title) {
      payload.name = payload.title;
    }

    // Status normalization for ENUM fields
    if (
      Model.rawAttributes.status &&
      Model.rawAttributes.status.type &&
      Array.isArray(Model.rawAttributes.status.type.values)
    ) {
      const allowed = Model.rawAttributes.status.type.values;
      if (payload.status) {
        const s = String(payload.status).toLowerCase();
        if (s === "active" && allowed.includes("published")) {
          payload.status = "published";
        } else if (s === "inactive" && allowed.includes("draft")) {
          payload.status = "draft";
        } else if (!allowed.includes(payload.status)) {
          payload.status = Model.rawAttributes.status.defaultValue || allowed[0];
        }
      }
    }
  }

  return payload;
};

/**
 * Generic CRUD controller factory for Sequelize models.
 * Usage: const ctrl = createCRUDController(News, "news");
 */
const createCRUDController = (Model, resourceName = "item") => {
  const publicCache = new Map();
  const CACHE_TTL_MS = 60 * 1000;

  const invalidateCache = () => {
    publicCache.clear();
  };

  // @desc   Get all (public can only see published; admins see all)
  // @route  GET /api/<resource>
  const getAll = async (req, res) => {
    const { status, category, search, page = 1, limit = 20 } = req.query;
    const isAuth = !!req.user;
    const parsedLimit = parseInt(limit, 10);
    const parsedPage = parseInt(page, 10);
    const offset = (parsedPage - 1) * parsedLimit;

    // Check fast cache for public non-search queries
    const cacheKey = !isAuth && !search ? `all_${status || "pub"}_${category || "all"}_${parsedPage}_${parsedLimit}` : null;
    if (cacheKey && publicCache.has(cacheKey)) {
      const entry = publicCache.get(cacheKey);
      if (Date.now() - entry.time < CACHE_TTL_MS) {
        res.set("Cache-Control", "public, max-age=60, s-maxage=120, stale-while-revalidate=300");
        return res.json({
          success: true,
          data: entry.data,
        });
      }
    }

    const where = {};

    // Only apply status filter if the model has a 'status' column
    const hasStatusCol = !!Model.rawAttributes?.status;

    // Public access: only published items
    if (hasStatusCol) {
      if (!isAuth) {
        where.status = "published";
      } else if (status && status !== "all") {
        where.status = status;
      }
    }

    if (category && category.toLowerCase() !== "all") {
      where.category = category;
    }

    if (search && search.trim()) {
      const q = `%${search.trim()}%`;
      const orConditions = [];
      if (Model.rawAttributes?.title) {
        orConditions.push(Sequelize.where(Sequelize.cast(Sequelize.col("title"), "char"), { [Op.like]: q }));
      }
      if (Model.rawAttributes?.name) {
        orConditions.push(Sequelize.where(Sequelize.cast(Sequelize.col("name"), "char"), { [Op.like]: q }));
      }
      if (orConditions.length > 0) {
        where[Op.or] = orConditions;
      }
    }

    const { rows, count: total } = await Model.findAndCountAll({
      where,
      order: [["createdAt", "DESC"]],
      limit: parsedLimit,
      offset,
    });

    const items = rows.map((item) => item.toJSON());
    const responseData = {
      items,
      total,
      totalPages: Math.ceil(total / parsedLimit) || 1,
      currentPage: parsedPage,
    };

    if (cacheKey) {
      publicCache.set(cacheKey, { time: Date.now(), data: responseData });
    }

    // Public responses can be cached safely for 60s; authenticated admin responses are strictly private no-cache
    if (!isAuth) {
      res.set("Cache-Control", "public, max-age=60, s-maxage=120, stale-while-revalidate=300");
    } else {
      res.set("Cache-Control", "private, no-cache, no-store, must-revalidate");
    }

    res.json({
      success: true,
      data: responseData,
    });
  };

  // @desc   Get single by ID
  // @route  GET /api/<resource>/:id
  const getById = async (req, res) => {
    const item = await Model.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: `${resourceName} not found` });
    }

    if (!req.user) {
      res.set("Cache-Control", "public, max-age=60, s-maxage=120, stale-while-revalidate=300");
    } else {
      res.set("Cache-Control", "private, no-cache, no-store, must-revalidate");
    }

    res.json({ success: true, data: item.toJSON() });
  };

  // @desc   Create
  // @route  POST /api/<resource>
  // @access Protected (editor or admin)
  const create = async (req, res) => {
    try {
      let payload = normalizePayload(req.body, Model);
      payload = await autoTranslateModelData(payload);
      if (req.user) payload.authorId = req.user.id || req.user._id;

      const item = await Model.create(payload);
      invalidateCache();
      res.status(201).json({
        success: true,
        message: `${resourceName} created successfully`,
        data: item.toJSON(),
      });
    } catch (error) {
      console.error(`[crudController:${resourceName}] create error:`, error);
      res.status(400).json({
        success: false,
        message: error.message || `Failed to create ${resourceName}`,
      });
    }
  };

  // @desc   Update
  // @route  PUT /api/<resource>/:id
  // @access Protected (editor or admin)
  const update = async (req, res) => {
    try {
      const item = await Model.findByPk(req.params.id);

      if (!item) {
        return res.status(404).json({ success: false, message: `${resourceName} not found` });
      }

      let payload = normalizePayload(req.body, Model);
      payload = await autoTranslateModelData(payload);
      delete payload.id;
      delete payload._id;
      await item.update(payload);
      invalidateCache();

      res.json({
        success: true,
        message: `${resourceName} updated successfully`,
        data: item.toJSON(),
      });
    } catch (error) {
      console.error(`[crudController:${resourceName}] update error:`, error);
      res.status(400).json({
        success: false,
        message: error.message || `Failed to update ${resourceName}`,
      });
    }
  };

  // @desc   Delete
  // @route  DELETE /api/<resource>/:id
  // @access Protected (admin only)
  const remove = async (req, res) => {
    try {
      const item = await Model.findByPk(req.params.id);
      if (!item) {
        return res.status(404).json({ success: false, message: `${resourceName} not found` });
      }
      await item.destroy();
      invalidateCache();
      if (item.image) deleteUploadedFile(item.image);
      res.json({ success: true, message: `${resourceName} deleted successfully` });
    } catch (error) {
      console.error(`[crudController:${resourceName}] remove error:`, error);
      res.status(500).json({
        success: false,
        message: error.message || `Failed to delete ${resourceName}`,
      });
    }
  };

  return { getAll, getById, create, update, remove, invalidateCache };
};

module.exports = createCRUDController;
