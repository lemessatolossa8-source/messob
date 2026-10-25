const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET =
  process.env.JWT_SECRET ||
  "c4942a7cf978ae9cadacd80b78dc97bb9ce0aec3d243425114fea0535e5e42d89e062c09e37d9f5903d99b4028d7197364ab02c29dc042da3fd949f40469f6d1";

const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, {
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

/**
 * Automatically ensures at least one active administrator account exists in MySQL.
 * Runs on backend startup (Render, production, and local development).
 */
const ensureDefaultAdmin = async () => {
  try {
    const adminEmail = (
      process.env.ADMIN_EMAIL ||
      process.env.EMAIL_USER ||
      "lemessatolossa8@gmail.com"
    ).trim().toLowerCase();

    // Check if an account already exists with this email
    let admin = await User.findOne({ where: { email: adminEmail } });

    if (!admin) {
      // Check if ANY admin account exists at all in the database
      const anyAdmin = await User.findOne({ where: { role: "admin" } });

      if (!anyAdmin) {
        console.log(`ℹ️ Initializing primary administrator account for ${adminEmail}...`);
        admin = await User.create({
          name: "Burayu Administrator",
          email: adminEmail,
          password: process.env.INITIAL_ADMIN_PASSWORD || "Admin@12345678",
          role: "admin",
          isActive: true,
        });
        console.log(`✅ Default admin account created in MySQL: ${adminEmail}`);
      } else {
        // An admin user exists with a different email; also ensure ADMIN_EMAIL has admin access
        console.log(`ℹ️ Existing admin detected (${anyAdmin.email}). Creating admin record for ADMIN_EMAIL: ${adminEmail}...`);
        admin = await User.create({
          name: "Burayu Administrator",
          email: adminEmail,
          password: process.env.INITIAL_ADMIN_PASSWORD || "Admin@12345678",
          role: "admin",
          isActive: true,
        });
        console.log(`✅ Admin account created for ADMIN_EMAIL: ${adminEmail}`);
      }
    } else {
      let needsSave = false;
      if (admin.role !== "admin") {
        admin.role = "admin";
        needsSave = true;
      }
      if (!admin.isActive) {
        admin.isActive = true;
        needsSave = true;
      }
      if (needsSave) {
        await admin.save();
        console.log(`✅ Upgraded ${adminEmail} to active administrator status`);
      } else {
        console.log(`👤 Active administrator account verified in MySQL: ${adminEmail}`);
      }
    }
  } catch (err) {
    console.error(`⚠️ Failed to ensure default admin user: ${err.message}`);
  }
};

module.exports = { register, login, getMe, ensureDefaultAdmin };

