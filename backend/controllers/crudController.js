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

/**
 * Generic CRUD controller factory for Sequelize models.
 * Usage: const ctrl = createCRUDController(News, "news");
 */
const createCRUDController = (Model, resourceName = "item") => {
  // @desc   Get all (public can only see published; admins see all)
  // @route  GET /api/<resource>
  const getAll = async (req, res) => {
    const { status, category, search, page = 1, limit = 20 } = req.query;
    const where = {};

    // Only apply status filter if the model has a 'status' column
    const hasStatusCol = !!Model.rawAttributes?.status;

    // Public access: only published items
    const isAuth = !!req.user;
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
      where[Op.or] = [
        Sequelize.where(Sequelize.cast(Sequelize.col("title"), "char"), { [Op.like]: q }),
      ];
    }

    const parsedLimit = parseInt(limit, 10);
    const parsedPage = parseInt(page, 10);
    const offset = (parsedPage - 1) * parsedLimit;

    const { rows, count: total } = await Model.findAndCountAll({
      where,
      order: [["createdAt", "DESC"]],
      limit: parsedLimit,
      offset,
    });

    const items = rows.map((item) => item.toJSON());

    // Public responses can be cached safely for 60s; authenticated admin responses are strictly private no-cache
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
    let payload = { ...req.body };
    payload = await autoTranslateModelData(payload);
    if (req.user) payload.authorId = req.user.id || req.user._id;

    const item = await Model.create(payload);
    res.status(201).json({
      success: true,
      message: `${resourceName} created successfully`,
      data: item.toJSON(),
    });
  };

  // @desc   Update
  // @route  PUT /api/<resource>/:id
  // @access Protected (editor or admin)
  const update = async (req, res) => {
    const item = await Model.findByPk(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, message: `${resourceName} not found` });
    }

    let payload = { ...req.body };
    payload = await autoTranslateModelData(payload);
    await item.update(payload);

    res.json({
      success: true,
      message: `${resourceName} updated successfully`,
      data: item.toJSON(),
    });
  };

  // @desc   Delete
  // @route  DELETE /api/<resource>/:id
  // @access Protected (admin only)
  const remove = async (req, res) => {
    const item = await Model.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: `${resourceName} not found` });
    }
    await item.destroy();
    if (item.image) deleteUploadedFile(item.image);
    res.json({ success: true, message: `${resourceName} deleted successfully` });
  };

  return { getAll, getById, create, update, remove };
};

module.exports = createCRUDController;
