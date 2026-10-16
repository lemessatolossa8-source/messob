const { Op, Sequelize } = require("sequelize");
const Announcement = require("../models/Announcement");
const createCRUDController = require("./crudController");

// Get base CRUD operations
const baseCRUD = createCRUDController(Announcement, "Announcement");

// Custom getAll to filter expired announcements for public users
const getAll = async (req, res) => {
  const { status, category, search, page = 1, limit = 20 } = req.query;
  const where = {};
  const andConditions = [];

  // Public access: only published and non-expired items
  const isAuth = !!req.user;
  if (!isAuth) {
    where.status = "published";
    const today = new Date().toISOString().split("T")[0];
    andConditions.push({
      [Op.or]: [
        { expiryDate: { [Op.gte]: today } },
        { expiryDate: null },
      ],
    });
  } else if (status && status !== "all") {
    where.status = status;
    // Admins see all announcements, including expired ones
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

// Export custom getAll with base CRUD operations
module.exports = {
  ...baseCRUD,
  getAll, // Override getAll with custom implementation
};
