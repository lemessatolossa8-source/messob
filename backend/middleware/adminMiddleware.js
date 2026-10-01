const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Forbidden – admin access required",
    });
  }
  next();
};

const editorOrAdmin = (req, res, next) => {
  if (!req.user || !["admin", "editor"].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: "Forbidden – editor or admin access required",
    });
  }
  next();
};

module.exports = { adminOnly, editorOrAdmin };
