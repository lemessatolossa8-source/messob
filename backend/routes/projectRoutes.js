const express = require("express");
const router = express.Router();
const {
  getAll,
  getById,
  create,
  update,
  remove,
  publish,
  unpublish,
} = require("../controllers/projectController");
const { protect, optionalAuth } = require("../middleware/authMiddleware");

// Public/OptionalAuth routes
router.get("/", optionalAuth, getAll);
router.get("/:id", optionalAuth, getById);

// Protected routes (Admin/Editor)
router.post("/", protect, create);
router.put("/:id", protect, update);
router.delete("/:id", protect, remove);
router.put("/:id/publish", protect, publish);
router.put("/:id/unpublish", protect, unpublish);

module.exports = router;
