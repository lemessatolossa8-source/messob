const express = require("express");
const router = express.Router();
const { getAll, getById, create, update, remove } = require("../controllers/branchController");
const { protect } = require("../middleware/authMiddleware");
const { editorOrAdmin, adminOnly } = require("../middleware/adminMiddleware");

router.get("/", getAll);
router.get("/:id", getById);
router.post("/", protect, editorOrAdmin, create);
router.put("/:id", protect, editorOrAdmin, update);
router.delete("/:id", protect, adminOnly, remove);

module.exports = router;
