const express = require("express");
const router = express.Router();
const { getAll, getById, create, update, remove } = require("../controllers/newsController");
const { protect, optionalAuth } = require("../middleware/authMiddleware");
const { editorOrAdmin, adminOnly } = require("../middleware/adminMiddleware");
const upload = require("../middleware/uploadMiddleware");

// Public can GET (filtered to published); optionalAuth lets admins see all
router.get("/", optionalAuth, getAll);
router.get("/:id", optionalAuth, getById);

// Protected - with file upload support
const newsUploads = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "video", maxCount: 1 }
]);

router.post("/", protect, editorOrAdmin, newsUploads, create);
router.put("/:id", protect, editorOrAdmin, newsUploads, update);
router.delete("/:id", protect, adminOnly, remove);

module.exports = router;
