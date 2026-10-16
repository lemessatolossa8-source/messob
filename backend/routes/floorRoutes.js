const express = require("express");
const router = express.Router();
const {
  getAll,
  getAllServices,
  getByNumber,
  getById,
  create,
  update,
  remove,
  addService,
  updateService,
  deleteService,
  reorderServices,
} = require("../controllers/floorController");
const { protect, optionalAuth } = require("../middleware/authMiddleware");
const { editorOrAdmin, adminOnly } = require("../middleware/adminMiddleware");
const upload = require("../middleware/uploadMiddleware");

// Public & Optional Auth endpoints
router.get("/", optionalAuth, getAll);
router.get("/services/all", optionalAuth, getAllServices);
router.get("/number/:number", optionalAuth, getByNumber);

// Direct Floor Services CRUD (for unified admin manager)
router.post("/services", protect, editorOrAdmin, upload.single("image"), addService);
router.put("/services/:serviceId", protect, editorOrAdmin, upload.single("image"), updateService);
router.delete("/services/:serviceId", protect, adminOnly, deleteService);

// Admin-protected Floor management
router.post("/", protect, editorOrAdmin, upload.single("image"), create);
router.get("/:id", optionalAuth, getById);
router.put("/:id", protect, editorOrAdmin, upload.single("image"), update);
router.delete("/:id", protect, adminOnly, remove);

// Floor-nested Services management
router.post("/:id/services", protect, editorOrAdmin, upload.single("image"), addService);
router.put("/:id/services/:serviceId", protect, editorOrAdmin, upload.single("image"), updateService);
router.delete("/:id/services/:serviceId", protect, adminOnly, deleteService);
router.put("/:id/services-reorder", protect, editorOrAdmin, reorderServices);

module.exports = router;
