const express = require("express");
const router = express.Router();
const settingController = require("../controllers/settingController");
const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

/**
 * Public routes (no auth required)
 */
// GET /api/settings/public - Get public settings
router.get("/public", settingController.getPublicSettings);

/**
 * Admin routes (auth + admin required)
 */
// GET /api/settings - Get all settings
router.get("/", protect, adminOnly, settingController.getAllSettings);

// GET /api/settings/:key - Get single setting
router.get("/:key", protect, adminOnly, settingController.getSetting);

// PUT /api/settings - Update multiple settings
router.put("/", protect, adminOnly, settingController.updateSettings);

// DELETE /api/settings/:key - Delete a setting
router.delete("/:key", protect, adminOnly, settingController.deleteSetting);

// POST /api/settings/reset - Reset settings to defaults
router.post("/reset", protect, adminOnly, settingController.resetSettings);

module.exports = router;
