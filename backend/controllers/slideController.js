const Slide = require("../models/Slide");

// GET /api/slides — public sees published only; admin sees all
const getAll = async (req, res) => {
  const { status, page = 1, limit = 50 } = req.query;
  const where = {};

  const isAuth = !!req.user;
  if (!isAuth) {
    where.status = "published";
  } else if (status && status !== "all") {
    where.status = status;
  }

  const parsedLimit = parseInt(limit, 10);
  const parsedPage = parseInt(page, 10);
  const offset = (parsedPage - 1) * parsedLimit;

  const { rows, count: total } = await Slide.findAndCountAll({
    where,
    order: [["order", "ASC"], ["createdAt", "ASC"]],
    limit: parsedLimit,
    offset,
  });

  if (!isAuth) {
    res.set("Cache-Control", "public, max-age=60, s-maxage=120, stale-while-revalidate=300");
  } else {
    res.set("Cache-Control", "private, no-cache, no-store, must-revalidate");
  }

  res.json({
    success: true,
    data: {
      items: rows.map((s) => s.toJSON()),
      total,
      totalPages: Math.ceil(total / parsedLimit) || 1,
      currentPage: parsedPage,
    },
  });
};

const getById = async (req, res) => {
  const slide = await Slide.findByPk(req.params.id);
  if (!slide) {
    return res.status(404).json({ success: false, message: "Slide not found" });
  }
  if (!req.user && slide.status !== "published") {
    return res.status(404).json({ success: false, message: "Slide not found" });
  }

  if (!req.user) {
    res.set("Cache-Control", "public, max-age=60, s-maxage=120, stale-while-revalidate=300");
  } else {
    res.set("Cache-Control", "private, no-cache, no-store, must-revalidate");
  }

  res.json({ success: true, data: slide.toJSON() });
};

const create = async (req, res) => {
  const { image, order, status } = req.body;

  let imageUrl = image;
  if (req.file) {
    imageUrl = `/uploads/${req.file.filename}`;
  }

  if (!imageUrl || !String(imageUrl).trim()) {
    return res.status(400).json({ success: false, message: "An image is required." });
  }

  const slide = await Slide.create({
    image: imageUrl,
    order: parseInt(order, 10) || 0,
    status: status || "published",
  });

  res.status(201).json({
    success: true,
    message: "Slide created successfully",
    data: slide.toJSON(),
  });
};

const update = async (req, res) => {
  const slide = await Slide.findByPk(req.params.id);
  if (!slide) {
    return res.status(404).json({ success: false, message: "Slide not found" });
  }

  const payload = {};

  if (req.file) {
    payload.image = `/uploads/${req.file.filename}`;
  } else if (req.body.image) {
    payload.image = req.body.image;
  }

  if (req.body.order !== undefined) payload.order = parseInt(req.body.order, 10) || 0;
  if (req.body.status) payload.status = req.body.status;

  await slide.update(payload);
  res.json({
    success: true,
    message: "Slide updated successfully",
    data: slide.toJSON(),
  });
};

const remove = async (req, res) => {
  const slide = await Slide.findByPk(req.params.id);
  if (!slide) {
    return res.status(404).json({ success: false, message: "Slide not found" });
  }
  await slide.destroy();
  res.json({ success: true, message: "Slide deleted successfully" });
};

const publish = async (req, res) => {
  const slide = await Slide.findByPk(req.params.id);
  if (!slide) return res.status(404).json({ success: false, message: "Slide not found" });
  await slide.update({ status: "published" });
  res.json({ success: true, message: "Slide published", data: slide.toJSON() });
};

const unpublish = async (req, res) => {
  const slide = await Slide.findByPk(req.params.id);
  if (!slide) return res.status(404).json({ success: false, message: "Slide not found" });
  await slide.update({ status: "draft" });
  res.json({ success: true, message: "Slide unpublished", data: slide.toJSON() });
};

module.exports = { getAll, getById, create, update, remove, publish, unpublish };
