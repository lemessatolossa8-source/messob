const User = require("../models/User");
const OTP = require("../models/OTP");
const { sendOTPEmail, maskEmail } = require("../config/email");

// In-memory rate limiting for OTP requests (5 per hour per email/IP in production, 30 in development)
const otpRequestRateLimits = new Map();

const checkRateLimit = (key) => {
  const now = Date.now();
  const oneHourMs = 60 * 60 * 1000;
  const maxLimit = process.env.NODE_ENV === "development" ? 30 : 15;
  
  if (!otpRequestRateLimits.has(key)) {
    otpRequestRateLimits.set(key, []);
  }
  
  let timestamps = otpRequestRateLimits.get(key);
  // Filter out timestamps older than 1 hour
  timestamps = timestamps.filter(t => now - t < oneHourMs);
  
  if (timestamps.length >= maxLimit) {
    otpRequestRateLimits.set(key, timestamps);
    return false; // Rate limit exceeded
  }
  
  timestamps.push(now);
  otpRequestRateLimits.set(key, timestamps);
  return true; // Allowed
};

/**
 * @desc    Request OTP for password reset
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
const requestOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const ip = req.ip || req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "127.0.0.1";

    if (!email || typeof email !== "string" || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email address is required.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const masked = maskEmail(normalizedEmail);

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    // Rate Limiting (Skip localhost in development to allow thorough testing)
    const isDev = process.env.NODE_ENV === "development";
    if (!isDev) {
      const emailAllowed = checkRateLimit(`email:${normalizedEmail}`);
      const ipAllowed = checkRateLimit(`ip:${ip}`);

      if (!emailAllowed || !ipAllowed) {
        return res.status(429).json({
          success: false,
          message: "Too many OTP requests. Please wait a while before trying again.",
        });
      }
    }

    // Step 5: Verify that the admin email exists in MySQL before sending an OTP
    const user = await User.findOne({ where: { email: normalizedEmail } });
    
    if (!user) {
      console.warn(`[AUTH] Password recovery attempt for non-existent email: ${masked}`);
      return res.status(404).json({
        success: false,
        message: "No administrator account found with this email address. Please check and try again.",
      });
    }

    if (user.role && user.role !== "admin") {
      console.warn(`[AUTH] Password recovery rejected: user ${masked} does not have admin role`);
      return res.status(403).json({
        success: false,
        message: "Access restricted: This email is not authorized for administrator password recovery.",
      });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "This account has been deactivated. Please contact the system administrator.",
      });
    }

    // Step 6: Generate secure 6-digit OTP (stored as SHA-256 with 10-minute expiry)
    const { realOtp } = await OTP.createOTP(normalizedEmail);
    console.log(`[AUTH] Secure OTP generated for ${masked} (valid for 10 minutes)`);

    // Step 7 & 8: Dispatch OTP via email and return consistent JSON
    try {
      const emailResult = await sendOTPEmail(normalizedEmail, realOtp);
      
      if (emailResult && emailResult.mode === "console") {
        return res.json({
          success: true,
          message: "OTP generated in development mode. Check the backend server console for the code.",
          devMode: true,
        });
      }

      return res.json({
        success: true,
        message: "Verification OTP code has been sent to your email address.",
      });
    } catch (emailError) {
      console.error(`[AUTH] Failed to dispatch OTP email to ${masked}: ${emailError.message}`);
      return res.status(500).json({
        success: false,
        message: `Failed to send OTP email: ${emailError.message}`,
        details: emailError.message,
      });
    }
  } catch (error) {
    console.error("[AUTH ERROR] Request OTP error:", error.message || error);
    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred while processing your request. Please try again.",
    });
  }
};

/**
 * @desc    Verify OTP
 * @route   POST /api/auth/verify-otp
 * @access  Public
 */
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || typeof email !== "string" || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email address is required.",
      });
    }

    const cleanOtp = String(otp || "").trim();
    if (!cleanOtp || cleanOtp.length !== 6) {
      return res.status(400).json({
        success: false,
        message: "Please enter all 6 digits of the OTP code.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const masked = maskEmail(normalizedEmail);
    console.log(`[AUTH] Verifying OTP for: ${masked}`);

    const verification = await OTP.verifyOTP(normalizedEmail, cleanOtp);

    if (!verification.valid) {
      console.warn(`[AUTH] OTP verification failed for ${masked}: ${verification.error || "Invalid code"}`);
      return res.status(400).json({
        success: false,
        message: verification.error || "Invalid or expired OTP code. Please try again.",
      });
    }

    console.log(`[AUTH] ✅ OTP verified successfully for ${masked}`);
    return res.json({
      success: true,
      message: "OTP verified successfully.",
      resetToken: verification.resetToken,
    });
  } catch (error) {
    console.error("[AUTH ERROR] Verify OTP error:", error.message || error);
    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred while verifying OTP. Please try again.",
    });
  }
};

/**
 * @desc    Resend OTP
 * @route   POST /api/auth/resend-otp
 * @access  Public
 */
const resendOTP = async (req, res) => {
  return requestOTP(req, res);
};

/**
 * @desc    Reset password with verified OTP reset token
 * @route   POST /api/auth/reset-password
 * @access  Public (requires valid reset token)
 */
const resetPassword = async (req, res) => {
  try {
    const { email, resetToken, newPassword } = req.body;

    if (!email || !resetToken || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, reset token, and new password are required.",
      });
    }

    // Validate password strength
    if (newPassword.length < 12) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 12 characters long.",
      });
    }

    const hasUppercase = /[A-Z]/.test(newPassword);
    const hasLowercase = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

    if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
      return res.status(400).json({
        success: false,
        message: "Password must contain uppercase, lowercase, number, and special character (!@#$%^&* etc.).",
      });
    }

    // Verify reset token
    const normalizedEmail = email.toLowerCase().trim();
    const masked = maskEmail(normalizedEmail);
    const verification = await OTP.verifyResetToken(normalizedEmail, resetToken);

    if (!verification.valid) {
      console.warn(`[AUTH] Invalid reset token presented for ${masked}: ${verification.error}`);
      return res.status(400).json({
        success: false,
        message: verification.error || "Invalid or expired reset token. Please request a new OTP.",
      });
    }

    // Find admin user in MySQL
    const user = await User.findOne({ where: { email: normalizedEmail } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Administrator account not found.",
      });
    }

    // Update password (beforeSave hook in User model hashes it via bcrypt)
    await user.update({ password: newPassword });

    // Mark reset token as used so it cannot be re-used
    await OTP.markResetTokenUsed(verification.otpRecord);

    console.log(`[AUTH] ✅ Password successfully updated for admin: ${masked}`);
    return res.json({
      success: true,
      message: "Password reset successfully. You can now log in with your new password.",
    });
  } catch (error) {
    console.error("[AUTH ERROR] Reset password error:", error.message || error);
    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred while resetting your password. Please try again.",
    });
  }
};

module.exports = {
  requestOTP,
  verifyOTP,
  resendOTP,
  resetPassword,
};
