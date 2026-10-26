const express = require("express");
const router = express.Router();
const { translateText } = require("../controllers/translateController");
const { optionalAuth } = require("../middleware/authMiddleware");

// Translations for admin dashboard (optional auth so token refresh doesn't block UI)
router.post("/", optionalAuth, translateText);

module.exports = router;
