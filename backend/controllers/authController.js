const jwt = require("jsonwebtoken");
const User = require("../models/User");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// @desc   Register a new admin/editor user
// @route  POST /api/auth/register
// @access Protected (admin only) - enforced by route middleware
const register = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: "Name, email, and password are required" });
  }

  // Strengthen password validation for production
  if (password.length < 12) {
    return res.status(400).json({ 
      success: false, 
      message: "Password must be at least 12 characters long" 
    });
  }

  // Check password complexity: must contain uppercase, lowercase, number, and special character
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
    return res.status(400).json({
      success: false,
      message: "Password must contain uppercase, lowercase, number, and special character (!@#$%^&* etc.)"
    });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: "Please provide a valid email address" });
  }

  const existingUser = await User.findOne({ where: { email: email.toLowerCase() } });
  if (existingUser) {
    return res.status(409).json({ success: false, message: "An account with this email already exists" });
  }

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    role: role === "admin" ? "admin" : "editor",
  });

  const token = generateToken(user.id);

  res.status(201).json({
    success: true,
    message: "Account created successfully",
    data: {
      user: user.toJSON(),
      token,
    },
  });
};

// @desc   Login
// @route  POST /api/auth/login
// @access Public
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password are required" });
  }

  const user = await User.findOne({ where: { email: email.toLowerCase() } });
  if (!user) {
    return res.status(401).json({ success: false, message: "Invalid email or password" });
  }

  if (!user.isActive) {
    return res.status(403).json({ success: false, message: "Account is disabled. Contact an administrator." });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: "Invalid email or password" });
  }

  const token = generateToken(user.id);

  res.json({
    success: true,
    message: "Login successful",
    data: {
      user: user.toJSON(),
      token,
    },
  });
};

// @desc   Get logged-in user profile
// @route  GET /api/auth/me
// @access Protected
const getMe = async (req, res) => {
  res.json({
    success: true,
    data: typeof req.user.toJSON === "function" ? req.user.toJSON() : req.user,
  });
};

module.exports = { register, login, getMe };
