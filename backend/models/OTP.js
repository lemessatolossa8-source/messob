const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const crypto = require("crypto");

const OTP = sequelize.define(
  "OTP",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    otpHash: {
      type: DataTypes.STRING(64),
      allowNull: true,
      field: "otp_hash",
    },
    attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "expires_at",
    },
    used: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    resetTokenHash: {
      type: DataTypes.STRING(64),
      allowNull: true,
      field: "reset_token_hash",
    },
    resetTokenExpiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "reset_token_expires_at",
    },
    resetTokenUsed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: "reset_token_used",
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: "created_at",
    },
  },
  {
    tableName: "otps",
    timestamps: false,
  }
);

/**
 * Hash string with SHA-256
 */
OTP.hash = (str) => {
  return crypto.createHash("sha256").update(String(str)).digest("hex");
};

/**
 * Generate a random 6-digit OTP using crypto.randomInt
 */
OTP.generateOTP = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

/**
 * Create a new OTP entry (stores ONLY SHA-256 hash)
 */
OTP.createOTP = async (email) => {
  const normalizedEmail = email.toLowerCase().trim();
  const rawOtp = OTP.generateOTP();
  const otpHash = OTP.hash(rawOtp);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Invalidate any previous unused OTPs for this email
  await OTP.update(
    { used: true },
    { where: { email: normalizedEmail, used: false } }
  );

  const otpRecord = await OTP.create({
    email: normalizedEmail,
    otpHash,
    attempts: 0,
    expiresAt,
    used: false,
  });

  return { realOtp: rawOtp, expiresAt: otpRecord.expiresAt };
};

/**
 * Verify OTP with max 5 attempts lockout
 */
OTP.verifyOTP = async (email, submittedOtp) => {
  const normalizedEmail = email.toLowerCase().trim();

  const otpRecord = await OTP.findOne({
    where: {
      email: normalizedEmail,
      used: false,
    },
    order: [["createdAt", "DESC"]],
  });

  if (!otpRecord) {
    return { valid: false, error: "Invalid or expired OTP code" };
  }

  // Check attempt limit (max 5 wrong attempts)
  if (otpRecord.attempts >= 5) {
    await otpRecord.update({ used: true });
    return { valid: false, error: "Maximum wrong attempts reached (5). Please request a new OTP." };
  }

  // Check if expired
  if (new Date() > otpRecord.expiresAt) {
    await otpRecord.update({ used: true });
    return { valid: false, error: "OTP code has expired. Please request a new one." };
  }

  const submittedHash = OTP.hash(submittedOtp);

  // Compare submitted OTP hash with stored hash
  if (submittedHash !== otpRecord.otpHash) {
    const newAttempts = otpRecord.attempts + 1;
    const isLockedOut = newAttempts >= 5;

    await otpRecord.update({
      attempts: newAttempts,
      used: isLockedOut ? true : otpRecord.used,
    });

    if (isLockedOut) {
      return { valid: false, error: "Maximum wrong attempts reached (5). This OTP has been invalidated." };
    }

    return { valid: false, error: `Invalid OTP code. ${5 - newAttempts} attempt(s) remaining.` };
  }

  // OTP verified successfully -> Mark single-use used: true and issue 15-minute reset token
  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetTokenHash = OTP.hash(resetToken);
  const resetTokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  await otpRecord.update({
    used: true,
    resetTokenHash,
    resetTokenExpiresAt,
    resetTokenUsed: false,
  });

  return { valid: true, resetToken };
};

/**
 * Verify reset token
 */
OTP.verifyResetToken = async (email, resetToken) => {
  if (!resetToken) {
    return { valid: false, error: "Reset token is required" };
  }

  const resetTokenHash = OTP.hash(resetToken);
  const whereClause = {
    resetTokenHash,
    resetTokenUsed: false,
  };

  if (email) {
    whereClause.email = email.toLowerCase().trim();
  }

  const otpRecord = await OTP.findOne({
    where: whereClause,
    order: [["createdAt", "DESC"]],
  });

  if (!otpRecord) {
    return { valid: false, error: "Invalid or already used reset token" };
  }

  if (new Date() > otpRecord.resetTokenExpiresAt) {
    await otpRecord.update({ resetTokenUsed: true });
    return { valid: false, error: "Reset token has expired (15 minute limit). Please request a new OTP." };
  }

  return { valid: true, otpRecord };
};

/**
 * Mark reset token as used
 */
OTP.markResetTokenUsed = async (otpRecord) => {
  await otpRecord.update({ resetTokenUsed: true });
};

/**
 * Auto-sync missing columns for otps table in MySQL
 */
OTP.syncSchema = async () => {
  try {
    const queryInterface = sequelize.getQueryInterface();
    const tableInfo = await queryInterface.describeTable("otps").catch(() => null);
    if (tableInfo) {
      // Remove old plain-text otp column if it exists
      if (tableInfo.otp) {
        await queryInterface.changeColumn("otps", "otp", {
          type: DataTypes.STRING(6),
          allowNull: true
        }).catch(() => null); // Fallback to allow null if drop fails
      }

      if (!tableInfo.otp_hash) {
        await queryInterface.addColumn("otps", "otp_hash", {
          type: DataTypes.STRING(64),
          allowNull: true,
        });
      }
      if (!tableInfo.attempts) {
        await queryInterface.addColumn("otps", "attempts", {
          type: DataTypes.INTEGER,
          defaultValue: 0,
          allowNull: false,
        });
      }
      if (!tableInfo.reset_token_hash) {
        await queryInterface.addColumn("otps", "reset_token_hash", {
          type: DataTypes.STRING(64),
          allowNull: true,
        });
      }
      if (!tableInfo.reset_token_expires_at) {
        await queryInterface.addColumn("otps", "reset_token_expires_at", {
          type: DataTypes.DATE,
          allowNull: true,
        });
      }
      if (!tableInfo.reset_token_used) {
        await queryInterface.addColumn("otps", "reset_token_used", {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        });
      }
    }
  } catch (err) {
    console.warn("Otps schema sync warning:", err.message);
  }
};

module.exports = OTP;

