const fs = require("fs");
const path = require("path");
const Upload = require("../models/Upload");

const MIME_MAP = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
};

async function syncUploadsToDatabase() {
  const uploadsDir = path.join(__dirname, "../uploads");
  if (!fs.existsSync(uploadsDir)) return;

  try {
    const files = fs.readdirSync(uploadsDir);
    for (const filename of files) {
      const ext = path.extname(filename).toLowerCase();
      if (![".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext)) continue;
      const filePath = path.join(uploadsDir, filename);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) continue;

      const existing = await Upload.findByPk(filename, { attributes: ["filename"] });
      if (!existing) {
        const data = fs.readFileSync(filePath);
        await Upload.create({
          filename,
          mimetype: MIME_MAP[ext] || "image/jpeg",
          size: stat.size,
          data,
        });
      }
    }
  } catch (err) {
    console.warn("Upload sync notice:", err.message);
  }
}

module.exports = { syncUploadsToDatabase };
