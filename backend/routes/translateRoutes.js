const express = require("express");
const router = express.Router();
const { translateText } = require("../controllers/translateController");
const { protect } = require("../middleware/authMiddleware");

// Only logged-in admin users should trigger automated translations to prevent abuse
router.post("/", protect, translateText);

module.exports = router;
