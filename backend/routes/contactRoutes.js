const express = require("express");
const router = express.Router();
const {
  submitContact,
  getAllContacts,
  getContactById,
  updateContact,
  deleteContact,
} = require("../controllers/contactController");
const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

// Public – submit message
router.post("/", submitContact);

// Admin only – read & manage messages
router.get("/", protect, adminOnly, getAllContacts);
router.get("/:id", protect, adminOnly, getContactById);
router.put("/:id", protect, adminOnly, updateContact);
router.delete("/:id", protect, adminOnly, deleteContact);

module.exports = router;
