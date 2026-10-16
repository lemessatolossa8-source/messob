const express = require("express");
const router = express.Router();
const statisticController = require("../controllers/statisticController");
const { protect } = require("../middleware/authMiddleware");

// Public route (getAll handles public vs private based on token, but we can just use optional Auth)
router.get("/", statisticController.getAll);
router.get("/:id", statisticController.getById);

// Protected routes
router.post("/", protect, statisticController.create);
router.put("/:id", protect, statisticController.update);
router.delete("/:id", protect, statisticController.remove);

module.exports = router;
