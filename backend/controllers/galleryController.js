const { Op, Sequelize } = require("sequelize");
const Gallery = require("../models/Gallery");
const createCRUDController = require("./crudController");
const path = require("path");
const fs = require("fs");
const { autoTranslateModelData } = require("../utils/autoTranslator");

const baseCRUD = createCRUDController(Gallery, "Gallery");

// Helper to normalize and ensure title is an object or valid JSON
const normalizeTitle = (title) => {
  if (!title) return null;
  if (typeof title === "string") {
    const trimmed = title.trim();
    if (!trimmed) return null;
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      try {
        return JSON.parse(trimmed);
      } catch {
        return { om: trimmed, am: trimmed, en: trimmed };
      }
    }
    return { om: trimmed, am: trimmed, en: trimmed };
  }
  if (typeof title === "object") {
    return title;
  }
  return null;
};

const create = async (req, res) => {
  try {
    let payload = { ...req.body };
    if (payload.title !== undefined) {
      payload.title = normalizeTitle(payload.title);
    }
    payload = await autoTranslateModelData(payload);

    if (req.file) {
      payload.image = `/uploads/${req.file.filename}`;
    }

    if (!payload.image || !String(payload.image).trim()) {
      return res.status(400).json({ success: false, message: "An image is required." });
    }

    if (req.user) {
      payload.authorId = req.user.id;
    }

    const item = await Gallery.create(payload);
    res.status(201).json({
      success: true,
      message: "Gallery image created successfully",
      data: item.toJSON(),
    });
  } catch (error) {
    console.error("[galleryController] create error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to create gallery image",
    });
  }
};

const update = async (req, res) => {
  try {
    const item = await Gallery.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: "Gallery item not found" });
    }

    let payload = { ...req.body };
    if (payload.title !== undefined) {
      payload.title = normalizeTitle(payload.title);
    }
    payload = await autoTranslateModelData(payload);

    if (req.file) {
      payload.image = `/uploads/${req.file.filename}`;
    } else if (req.body.existingImage) {
      payload.image = req.body.existingImage;
    }

    await item.update(payload);
    res.json({
      success: true,
      message: "Gallery image updated successfully",
      data: item.toJSON(),
    });
  } catch (error) {
    console.error("[galleryController] update error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to update gallery image",
    });
  }
};

module.exports = {
  ...baseCRUD,
  create,
  update,
};
