const express = require("express");
const router = express.Router();
const { getAll, getById, create, update, remove } = require("../controllers/newsController");
const { protect } = require("../middleware/authMiddleware");
const { editorOrAdmin, adminOnly } = require("../middleware/adminMiddleware");
const upload = require("../middleware/uploadMiddleware");

// Public can GET (filtered to published); admins pass optionalAuth to see all
router.get("/", getAll);
router.get("/:id", getById);

// Protected - with file upload support
router.post("/", protect, editorOrAdmin, upload.single("image"), create);
router.put("/:id", protect, editorOrAdmin, upload.single("image"), update);
router.delete("/:id", protect, adminOnly, remove);

module.exports = router;
