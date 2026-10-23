require("dotenv").config();
require("express-async-errors"); // Auto-catch async errors

const express = require("express");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const compression = require("compression");
const { connectDB } = require("./config/db");

// Route files
const authRoutes = require("./routes/authRoutes");
const passwordRecoveryRoutes = require("./routes/passwordRecoveryRoutes");
const newsRoutes = require("./routes/newsRoutes");
const announcementRoutes = require("./routes/announcementRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const branchRoutes = require("./routes/branchRoutes");
const contactRoutes = require("./routes/contactRoutes");
const userRoutes = require("./routes/userRoutes");
const projectRoutes = require("./routes/projectRoutes");
const settingRoutes = require("./routes/settingRoutes");
const galleryRoutes = require("./routes/galleryRoutes");
const slideRoutes = require("./routes/slideRoutes");
const translateRoutes = require("./routes/translateRoutes");
const statisticRoutes = require("./routes/statisticRoutes");
const floorRoutes = require("./routes/floorRoutes");
const { ensureDefaultFloors } = require("./controllers/floorController");

// Ensure models are loaded so Sequelize syncs all tables on startup
require("./models/Gallery");
require("./models/Slide");
require("./models/Setting");
require("./models/Statistic");
require("./models/Floor");
require("./models/FloorService");

// Central error handler
const errorHandler = require("./middleware/errorMiddleware");

// 1. Create Express app
const app = express();

// Trust reverse proxies (Render, Koyeb, Vercel, Cloudflare, Nginx) so req.ip and rate-limiting work accurately
app.set("trust proxy", 1);

// High-performance gzip/brotli response compression for all JSON and text payloads
app.use(compression({
  threshold: 512, // Compress anything larger than 512 bytes
}));

// Request logger only active when explicitly enabled to prevent event loop lag
if (process.env.DEBUG_REQUESTS === "true") {
  app.use((req, res, next) => {
    console.log(`📥 ${req.method} ${req.path} - Origin: ${req.get('origin') || 'none'}`);
    next();
  });
}

// 2. CORS configuration for production and development
const configuredOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((u) => u.trim().replace(/\/+$/, ""))
  .filter(Boolean);

const allowedOrigins = [
  ...configuredOrigins,
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (server-to-server, curl, mobile apps, health checks)
    if (!origin) return callback(null, true);

    const normalizedOrigin = origin.replace(/\/+$/, "");

    // In development allow all localhost origins
    if (
      process.env.NODE_ENV === "development" &&
      (normalizedOrigin.startsWith("http://localhost") || normalizedOrigin.startsWith("http://127.0.0.1"))
    ) {
      return callback(null, true);
    }

    // Explicitly allowed origins
    if (allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }

    // Allow Vercel preview deployments if frontend is hosted on Vercel
    if (
      normalizedOrigin.endsWith(".vercel.app") &&
      configuredOrigins.some((u) => u.includes("vercel.app"))
    ) {
      return callback(null, true);
    }

    return callback(new Error(`CORS: origin '${origin}' is not allowed`));
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
  max: process.env.NODE_ENV === "development" ? 5000 : 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests – please try again later." },
});
app.use(globalLimiter);

// Stricter limiter for auth endpoints – adjusted for development
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "development" ? 100 : 20, // 100 in dev, 20 in production
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many login attempts – please try again later." },
  skip: (req) => {
    // Skip rate limiting for localhost in development
    if (process.env.NODE_ENV === "development") {
      const ip = req.ip || req.connection.remoteAddress;
      return ip === "127.0.0.1" || ip === "::1" || ip === "::ffff:127.0.0.1";
    }
    return false;
  },
});

// 5. Body parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// 4. Static uploads folder with long-term caching
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"), {
    maxAge: "30d",
    immutable: true,
  })
);

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
app.use("/api/auth", authLimiter, passwordRecoveryRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/branches", branchRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/settings", settingRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/slides", slideRoutes);
app.use("/api/translate", translateRoutes);
app.use("/api/statistics", statisticRoutes);
app.use("/api/floors", floorRoutes);

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
  await ensureDefaultFloors();
  app.listen(PORT, () => {
    console.log(`🚀 Burayu MESOB API running on http://localhost:${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`🔗 Allowed client origin: ${process.env.CLIENT_URL || "http://localhost:3000"}`);
  });
})();
