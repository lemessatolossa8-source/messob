const express = require("express");
const router = express.Router();
const {
  requestOTP,
  verifyOTP,
  resendOTP,
  resetPassword,
} = require("../controllers/passwordRecoveryController");

// @route   POST /api/auth/forgot-password
// @desc    Request OTP for password reset
// @access  Public
router.post("/forgot-password", requestOTP);

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP code
// @access  Public
router.post("/verify-otp", verifyOTP);

// @route   POST /api/auth/resend-otp
// @desc    Resend OTP code
// @access  Public
router.post("/resend-otp", resendOTP);

// @route   POST /api/auth/reset-password
// @desc    Reset password with verified OTP
// @access  Public
router.post("/reset-password", resetPassword);

module.exports = router;
