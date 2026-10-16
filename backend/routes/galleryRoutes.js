const express = require("express");
const router = express.Router();
const { getAll, getById, create, update, remove } = require("../controllers/galleryController");
const { protect, optionalAuth } = require("../middleware/authMiddleware");
const { editorOrAdmin, adminOnly } = require("../middleware/adminMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.get("/", optionalAuth, getAll);
router.get("/:id", optionalAuth, getById);
router.post("/", protect, editorOrAdmin, upload.single("image"), create);
router.put("/:id", protect, editorOrAdmin, upload.single("image"), update);
router.delete("/:id", protect, adminOnly, remove);

module.exports = router;
