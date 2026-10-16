const express = require("express");
const router = express.Router();
const { getAll, getById, create, update, remove } = require("../controllers/serviceController");
const { protect, optionalAuth } = require("../middleware/authMiddleware");
const { editorOrAdmin, adminOnly } = require("../middleware/adminMiddleware");

router.get("/", optionalAuth, getAll);
router.get("/:id", optionalAuth, getById);
router.post("/", protect, editorOrAdmin, create);
router.put("/:id", protect, editorOrAdmin, update);
router.delete("/:id", protect, adminOnly, remove);

module.exports = router;
