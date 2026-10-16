const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure uploads directory exists in the backend folder
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.random().toString(36).substring(7);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter - images and videos
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|mp4|webm|mov/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = /image\/.*|video\/.*/.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Only image and video files are allowed (jpeg, jpg, png, gif, webp, mp4, webm, mov)"));
  }
};

// Multer instance
const rawUpload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
  fileFilter: fileFilter,
});

const syncFile = (file) => {
  try {
    if (!file || !file.path) return;
    const frontendUploadsDir = path.join(__dirname, "../../frontend/public/uploads");
    if (!fs.existsSync(frontendUploadsDir)) {
      fs.mkdirSync(frontendUploadsDir, { recursive: true });
    }
    const destPath = path.join(frontendUploadsDir, file.filename);
    fs.copyFileSync(file.path, destPath);
  } catch (e) {
    // Ignore if frontend dir not accessible
  }
};

const syncMiddleware = (req, res, next) => {
  if (req.file) syncFile(req.file);
  if (req.files) {
    if (Array.isArray(req.files)) {
      req.files.forEach(syncFile);
    } else {
      Object.values(req.files).forEach((group) => {
        if (Array.isArray(group)) group.forEach(syncFile);
        else syncFile(group);
      });
    }
  }
  next();
};

const upload = {
  single: (fieldName) => [rawUpload.single(fieldName), syncMiddleware],
  array: (fieldName, maxCount) => [rawUpload.array(fieldName, maxCount), syncMiddleware],
  fields: (fields) => [rawUpload.fields(fields), syncMiddleware],
  none: () => rawUpload.none(),
  any: () => [rawUpload.any(), syncMiddleware],
};

module.exports = upload;
