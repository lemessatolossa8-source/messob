const { Op, Sequelize } = require("sequelize");
const Project = require("../models/Project");

// Helper to normalize input payload
const normalizeProjectData = (body, userId) => {
  const data = {};

  if (body.title !== undefined) {
    data.title = typeof body.title === "string" ? { om: body.title, am: body.title, en: body.title } : body.title;
  }
  if (body.description !== undefined) {
    data.description = typeof body.description === "string" ? { om: body.description, am: body.description, en: body.description } : body.description;
  }
  if (body.content !== undefined) {
    data.content = typeof body.content === "string" ? { om: body.content, am: body.content, en: body.content } : body.content;
  }
  if (body.image !== undefined) data.image = body.image || "";
  if (body.location !== undefined) data.location = body.location || "Burayu";
  if (body.start_date !== undefined || body.startDate !== undefined) {
    data.start_date = body.start_date || body.startDate || null;
  }
  if (body.end_date !== undefined || body.targetCompletion !== undefined) {
    data.end_date = body.end_date || body.targetCompletion || null;
  }
  if (body.department !== undefined || body.category !== undefined) {
    data.department = body.department || body.category || "Infrastructure";
  }
  if (body.progress !== undefined) {
    data.progress = Math.min(100, Math.max(0, parseInt(body.progress, 10) || 0));
  }
  if (body.budget !== undefined) data.budget = body.budget || "";

  // Handle project status ('Planned', 'Ongoing', 'Completed', 'Suspended')
  if (body.projectStatus) {
    data.status = body.projectStatus;
  } else if (body.status && ["Planned", "Ongoing", "Completed", "Suspended"].includes(body.status)) {
    data.status = body.status;
  }

  // Handle is_published
  if (body.is_published !== undefined) {
    data.is_published = Boolean(body.is_published);
  } else if (body.status === "published") {
    data.is_published = true;
  } else if (body.status === "draft") {
    data.is_published = false;
  }

  if (userId) {
    data.authorId = userId;
  }

  return data;
};

// @desc   Get all projects
// @route  GET /api/projects
// @access Public (guests only see is_published=true; admins see all)
const getAll = async (req, res) => {
  const { status, category, department, projectStatus, search, page = 1, limit = 20 } = req.query;
  const where = {};

  const isAuth = !!req.user;

  // Unauthenticated guests only see published projects
  if (!isAuth) {
    where.is_published = true;
  } else {
    // Authenticated admin can filter by publication status
    if (status === "published") {
      where.is_published = true;
    } else if (status === "draft" || status === "unpublished") {
      where.is_published = false;
    }
  }

  // Project lifecycle status filter (Planned, Ongoing, Completed, Suspended)
  if (projectStatus && projectStatus !== "all") {
    where.status = projectStatus;
  } else if (status && ["Planned", "Ongoing", "Completed", "Suspended"].includes(status)) {
    where.status = status;
  }

  // Department / category filter
  const deptFilter = department || (category && category !== "All" && category !== "all" ? category : null);
  if (deptFilter) {
    where.department = deptFilter;
  }

  // Search filter across title and location
  if (search && search.trim()) {
    const q = `%${search.trim()}%`;
    where[Op.or] = [
      Sequelize.where(Sequelize.cast(Sequelize.col("title"), "char"), { [Op.like]: q }),
      Sequelize.where(Sequelize.col("location"), { [Op.like]: q }),
      Sequelize.where(Sequelize.col("department"), { [Op.like]: q }),
    ];
  }

  const parsedLimit = parseInt(limit, 10);
  const parsedPage = parseInt(page, 10);
  const offset = (parsedPage - 1) * parsedLimit;

  const { rows, count: total } = await Project.findAndCountAll({
    where,
    order: [["created_at", "DESC"]],
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

// @desc   Get single project by ID
// @route  GET /api/projects/:id
// @access Public (guests only see published; admin sees any)
const getById = async (req, res) => {
  const project = await Project.findByPk(req.params.id);

  if (!project) {
    return res.status(404).json({ success: false, message: "Project not found" });
  }

  // If unauthenticated and project is not published, return 404
  if (!req.user && !project.is_published) {
    return res.status(404).json({ success: false, message: "Project not found or unpublished" });
  }

  res.json({ success: true, data: project.toJSON() });
};

// @desc   Create new project
// @route  POST /api/projects
// @access Protected (admin/editor)
const create = async (req, res) => {
  const userId = req.user ? (req.user.id || req.user._id) : null;
  const payload = normalizeProjectData(req.body, userId);

  const project = await Project.create(payload);

  res.status(201).json({
    success: true,
    message: "Project created successfully",
    data: project.toJSON(),
  });
};

// @desc   Update project
// @route  PUT /api/projects/:id
// @access Protected (admin/editor)
const update = async (req, res) => {
  const project = await Project.findByPk(req.params.id);

  if (!project) {
    return res.status(404).json({ success: false, message: "Project not found" });
  }

  const payload = normalizeProjectData(req.body);
  await project.update(payload);

  res.json({
    success: true,
    message: "Project updated successfully",
    data: project.toJSON(),
  });
};

// @desc   Delete project
// @route  DELETE /api/projects/:id
// @access Protected (admin/editor)
const remove = async (req, res) => {
  const project = await Project.findByPk(req.params.id);

  if (!project) {
    return res.status(404).json({ success: false, message: "Project not found" });
  }

  await project.destroy();

  res.json({
    success: true,
    message: "Project deleted successfully",
  });
};

// @desc   Publish project
// @route  PUT /api/projects/:id/publish
// @access Protected (admin/editor)
const publish = async (req, res) => {
  const project = await Project.findByPk(req.params.id);

  if (!project) {
    return res.status(404).json({ success: false, message: "Project not found" });
  }

  await project.update({ is_published: true });

  res.json({
    success: true,
    message: "Project published successfully",
    data: project.toJSON(),
  });
};

// @desc   Unpublish project
// @route  PUT /api/projects/:id/unpublish
// @access Protected (admin/editor)
const unpublish = async (req, res) => {
  const project = await Project.findByPk(req.params.id);

  if (!project) {
    return res.status(404).json({ success: false, message: "Project not found" });
  }

  await project.update({ is_published: false });

  res.json({
    success: true,
    message: "Project unpublished successfully",
    data: project.toJSON(),
  });
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
  publish,
  unpublish,
};
