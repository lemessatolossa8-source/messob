const News = require("../models/News");
const createCRUDController = require("./crudController");

// Get base CRUD operations
const baseCRUD = createCRUDController(News, "News");

// Override create to handle file upload
const create = async (req, res) => {
  const payload = { ...req.body };
  
  // Handle uploaded file
  if (req.file) {
    payload.image = `/uploads/${req.file.filename}`;
  }
  
  if (req.user) {
    payload.authorId = req.user.id || req.user._id;
  }

  const item = await News.create(payload);
  res.status(201).json({
    success: true,
    message: "News created successfully",
    data: item.toJSON(),
  });
};

// Override update to handle file upload
const update = async (req, res) => {
  const item = await News.findByPk(req.params.id);

  if (!item) {
    return res.status(404).json({ success: false, message: "News not found" });
  }

  const payload = { ...req.body };
  
  // Handle uploaded file
  if (req.file) {
    payload.image = `/uploads/${req.file.filename}`;
  }
  // Keep existing image if no new file uploaded
  else if (req.body.existingImage) {
    payload.image = req.body.existingImage;
  }

  await item.update(payload);

  res.json({
    success: true,
    message: "News updated successfully",
    data: item.toJSON(),
  });
};

module.exports = {
  ...baseCRUD,
  create,
  update,
};
