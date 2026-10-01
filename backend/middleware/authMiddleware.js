const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  // Support Authorization: Bearer <token>
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized – no token provided",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findByPk(decoded.id, {
      attributes: { exclude: ["password"] },
    });

    if (!req.user || !req.user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Not authorized – user not found or inactive",
      });
    }

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Not authorized – invalid or expired token",
    });
  }
};

/**
 * Optional auth – sets req.user if a valid token is found, but does NOT
 * block the request when there is no token or an invalid one.
 * Used on public GET routes so admins can see draft/unpublished content.
 */
const optionalAuth = async (req, res, next) => {
  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      const token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.id, {
        attributes: { exclude: ["password"] },
      });
      if (user && user.isActive) {
        req.user = user;
      }
    }
  } catch {
    // Ignore invalid/expired tokens – just continue as guest
  }
  next();
};

module.exports = { protect, optionalAuth };
