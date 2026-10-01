const express = require("express");
const router = express.Router();
const { getAll, getById, create, update, remove } = require("../controllers/newsController");
const { protect } = require("../middleware/authMiddleware");
const { editorOrAdmin, adminOnly } = require("../middleware/adminMiddleware");

// Public can GET (filtered to published); admins pass optionalAuth to see all
router.get("/", getAll);
router.get("/:id", getById);

// Protected
router.post("/", protect, editorOrAdmin, create);
router.put("/:id", protect, editorOrAdmin, update);
router.delete("/:id", protect, adminOnly, remove);

module.exports = router;
