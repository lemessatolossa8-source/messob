const express = require("express");
const router = express.Router();
const { register, login, getMe } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

// Register is restricted to existing admins only
router.post("/register", protect, adminOnly, register);
router.post("/login", login);
router.get("/me", protect, getMe);

module.exports = router;
