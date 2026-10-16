const express = require("express");
const router = express.Router();
const settingController = require("../controllers/settingController");
const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

router.get("/public", settingController.getPublicSettings);
router.get("/", protect, adminOnly, settingController.getAllSettings);
router.put("/", protect, adminOnly, settingController.updateSettings);
router.post("/reset", protect, adminOnly, settingController.resetSettings);

module.exports = router;
