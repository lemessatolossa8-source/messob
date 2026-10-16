const Statistic = require("../models/Statistic");
const createCRUDController = require("./crudController");

// The crudController already handles auto-translation and basic CRUD!
const baseCRUD = createCRUDController(Statistic, "Statistic");

// Override getAll to order by `order` field by default
const getAll = async (req, res) => {
  const { status } = req.query;
  const where = {};

  const isAuth = !!req.user;
  if (!isAuth) {
    where.status = "published";
  } else if (status && status !== "all") {
    where.status = status;
  }

  const items = await Statistic.findAll({
    where,
    order: [["order", "ASC"], ["createdAt", "DESC"]],
  });

  res.json({
    success: true,
    data: {
      items: items.map((i) => i.toJSON()),
      total: items.length,
      totalPages: 1,
      currentPage: 1,
    },
  });
};

module.exports = {
  ...baseCRUD,
  getAll,
};
