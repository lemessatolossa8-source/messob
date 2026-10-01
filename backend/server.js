require("dotenv").config();
require("express-async-errors"); // Auto-catch async errors

const express = require("express");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { connectDB } = require("./config/db");

// Route files
const authRoutes = require("./routes/authRoutes");
const newsRoutes = require("./routes/newsRoutes");
const announcementRoutes = require("./routes/announcementRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const branchRoutes = require("./routes/branchRoutes");
const contactRoutes = require("./routes/contactRoutes");
const userRoutes = require("./routes/userRoutes");
const projectRoutes = require("./routes/projectRoutes");

// Central error handler
const errorHandler = require("./middleware/errorMiddleware");

// 1. Create Express app
const app = express();

// Simple request logger to debug CORS issues
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path} - Origin: ${req.get('origin') || 'none'}`);
  next();
});

// 2. CORS – allow localhost and 127.0.0.1 in development
const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:3000",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

const corsOptions = {
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV === "development") {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));

// 3. Security headers (helmet) – configured to allow CORS
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  })
);

// 4. Global rate limiter – 200 requests per IP per 15 minutes
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests – please try again later." },
});
app.use(globalLimiter);

// Stricter limiter for auth endpoints – 20 attempts per IP per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many login attempts – please try again later." },
});

// 5. Body parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// 4. Static uploads folder – absolute path so it works regardless of CWD
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 5. Health check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Burayu MESOB API is running",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// 7. API Routes
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/branches", branchRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);

// 8. 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// 9. Centralized error handler (must be last)
app.use(errorHandler);

// 10. Connect to DB first, then start server so no requests arrive before models are ready
const PORT = process.env.PORT || 5000;

(async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Burayu MESOB API running on http://localhost:${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`🔗 Allowed client origin: ${process.env.CLIENT_URL || "http://localhost:3000"}`);
  });
})();
