const News = require("../models/News");
const createCRUDController = require("./crudController");
const { autoTranslateModelData } = require("../utils/autoTranslator");

// Get base CRUD operations
const baseCRUD = createCRUDController(News, "News");

// Override create to handle file upload
const create = async (req, res) => {
  let payload = { ...req.body };
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

  let payload = { ...req.body };
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
    } else if (req.body.video === "") {
      payload.video = ""; // Allows deleting the video
    }
  } else {
    if (req.body.existingImage) payload.image = req.body.existingImage;
    if (req.body.existingVideo) payload.video = req.body.existingVideo;
    if (req.body.video === "") payload.video = "";
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
