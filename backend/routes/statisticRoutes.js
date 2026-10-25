const express = require("express");
const router = express.Router();
const statisticController = require("../controllers/statisticController");
const { protect, optionalAuth } = require("../middleware/authMiddleware");

// Public route (getAll and getById support optionalAuth so authenticated admins can view drafts and bypass CDN cache)
router.get("/", optionalAuth, statisticController.getAll);
router.get("/:id", optionalAuth, statisticController.getById);

// Protected routes
router.post("/", protect, statisticController.create);
router.put("/:id", protect, statisticController.update);
router.patch("/:id", protect, statisticController.update);
router.delete("/:id", protect, statisticController.remove);

module.exports = router;
