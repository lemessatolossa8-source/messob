const { Op, Sequelize } = require("sequelize");

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

    // Public access: only published items
    const isAuth = !!req.user;
    if (!isAuth) {
      where.status = "published";
    } else if (status && status !== "all") {
      where.status = status;
    }

    if (category && category !== "All") {
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
    res.json({ success: true, data: item.toJSON() });
  };

  // @desc   Create
  // @route  POST /api/<resource>
  // @access Protected (editor or admin)
  const create = async (req, res) => {
    const payload = { ...req.body };
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

    await item.update(req.body);

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
    res.json({ success: true, message: `${resourceName} deleted successfully` });
  };

  return { getAll, getById, create, update, remove };
};

module.exports = createCRUDController;
