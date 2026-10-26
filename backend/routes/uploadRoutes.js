const express = require("express");
const router = express.Router();
const path = require("path");
const { protect } = require("../middleware/authMiddleware");
const { editorOrAdmin } = require("../middleware/adminMiddleware");
const upload = require("../middleware/uploadMiddleware");

const fs = require("fs");
const Upload = require("../models/Upload");

/**
 * POST /api/upload
 * Protected route for authenticated admins/editors to upload media files.
 * Accepts single file under "file", "image", "video", or any field name.
 * Returns: { success: true, url: "/uploads/<filename>", filename, mimetype, size }
 */
router.post("/", protect, editorOrAdmin, upload.any(), async (req, res) => {
  const file = (req.files && req.files[0]) || req.file;

  if (!file) {
    return res.status(400).json({
      success: false,
      message: "No file was uploaded or file type is not supported.",
    });
  }

  // Persist image to MySQL so it survives Render redeployments
  try {
    const filePath = file.path || path.join(__dirname, "../uploads", file.filename);
    if (fs.existsSync(filePath)) {
      const fileData = fs.readFileSync(filePath);
      await Upload.upsert({
        filename: file.filename,
        mimetype: file.mimetype || "image/jpeg",
        size: file.size || fileData.length,
        data: fileData,
      });
    }
  } catch (dbErr) {
    console.error("Failed to persist uploaded file to MySQL:", dbErr.message);
  }

  const fileUrl = `/uploads/${file.filename}`;

  return res.status(200).json({
    success: true,
    message: "File uploaded successfully",
    url: fileUrl,
    filename: file.filename,
    mimetype: file.mimetype,
    size: file.size,
  });
});

module.exports = router;
