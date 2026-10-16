const nodemailer = require("nodemailer");

/**
 * Safely masks an email address for logging (e.g. "le***8@gmail.com")
 */
const maskEmail = (email) => {
  if (!email || typeof email !== "string") return "***";
  const parts = email.split("@");
  if (parts.length !== 2) return "***";
  const [local, domain] = parts;
  if (local.length <= 2) {
    return `${local[0] || ""}***@${domain}`;
  }
  return `${local[0]}***${local[local.length - 1]}@${domain}`;
};

/**
 * Parses and sanitizes email credentials from environment variables
 */
const getEmailCredentials = () => {
  const user = (process.env.EMAIL_USER || process.env.SMTP_USER || "").trim();
  let pass = (process.env.EMAIL_PASSWORD || process.env.SMTP_PASS || "").trim();
  // Strip spaces often present in Google 16-character App Passwords (e.g. "abcd efgh ijkl mnop")
  pass = pass.replace(/\s+/g, "");

  const service = (process.env.EMAIL_SERVICE || "gmail").trim().toLowerCase();
  const host = (process.env.SMTP_HOST || "smtp.gmail.com").trim();
  const port = parseInt(process.env.SMTP_PORT || "465", 10);
  const secure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : port === 465;

  return { user, pass, service, host, port, secure };
};

/**
 * Determines whether real SMTP credentials are provided
 */
const isConfigured = () => {
  const { user, pass } = getEmailCredentials();
  if (!user || !pass) return false;
  // Ignore dummy/placeholder passwords
  if (
    pass === "abcdefghijklmnop" ||
    pass === "YOUR_GMAIL_APP_PASSWORD_HERE" ||
    pass.includes("YOUR_") ||
    pass.includes("GMAIL_APP_PASSWORD") ||
    pass.length < 12
  ) {
    return false;
  }
  return true;
};

/**
 * Creates and returns reusable Nodemailer transporter instance
 */
const createTransporter = () => {
  if (!isConfigured()) {
    return null;
  }

  const { user, pass, service, host, port, secure } = getEmailCredentials();

  try {
    if (service === "gmail" || host.includes("gmail.com")) {
      return nodemailer.createTransport({
        service: "gmail",
        auth: {
          user,
          pass,
        },
      });
    }

    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
    });
  } catch (error) {
    console.error("[EMAIL CONFIG ERROR] Failed to initialize nodemailer transport:", error.message);
    return null;
  }
};

/**
 * Verifies SMTP connection without sending an email
 */
const verifyEmailConnection = async () => {
  if (!isConfigured()) {
    return {
      connected: false,
      message: "Gmail SMTP credentials not configured in process.env (EMAIL_USER and EMAIL_PASSWORD).",
    };
  }

  const transporter = createTransporter();
  if (!transporter) {
    return { connected: false, message: "Could not create email transport." };
  }

  try {
    await transporter.verify();
    return { connected: true, message: "Gmail SMTP connection verified successfully." };
  } catch (error) {
    console.error(`[EMAIL SMTP VERIFY ERROR] ${error.message}`);
    return { connected: false, message: error.message };
  }
};

/**
 * Send OTP email to admin
 * @param {string} email - Recipient admin email
 * @param {string} otp - 6-digit OTP code
 */
const sendOTPEmail = async (email, otp) => {
  const { user: senderEmail } = getEmailCredentials();
  const maskedRecipient = maskEmail(email);

  if (!isConfigured()) {
    console.log("\n" + "=".repeat(60));
    console.log("📧 OTP EMAIL (Development Mode - SMTP not configured or using placeholder)");
    console.log("=".repeat(60));
    console.log(`To: ${maskedRecipient}`);
    console.log(`OTP Code: ${otp}`);
    console.log(`Expires in: 10 minutes`);
    console.log("=".repeat(60) + "\n");
    return { success: true, mode: "console" };
  }

  const transporter = createTransporter();
  if (!transporter) {
    throw new Error("Email transporter could not be initialized.");
  }

  const mailOptions = {
    from: `"Burayu MESOB Admin" <${senderEmail}>`,
    to: email,
    subject: "🔐 Burayu MESOB Admin — Password Reset OTP",
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; background-color: #f8fafc; margin: 0; padding: 0; }
          .container { max-width: 580px; margin: 30px auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
          .header { background: linear-gradient(135deg, #059669 0%, #047857 100%); color: #ffffff; padding: 28px 24px; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
          .header p { margin: 6px 0 0 0; font-size: 13px; opacity: 0.9; }
          .content { padding: 32px 28px; }
          .otp-box { background: #f0fdf4; border: 2px dashed #86efac; border-radius: 10px; padding: 22px; text-align: center; margin: 24px 0; }
          .otp-label { font-size: 12px; font-weight: 700; color: #15803d; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 8px 0; }
          .otp-code { font-size: 38px; font-weight: 800; color: #047857; letter-spacing: 8px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
          .otp-expiry { margin: 10px 0 0 0; font-size: 13px; color: #64748b; }
          .alert-box { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 14px 16px; margin: 24px 0; border-radius: 4px; font-size: 13px; color: #92400e; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #64748b; background-color: #f8fafc; border-top: 1px solid #f1f5f9; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Password Reset Request</h1>
            <p>Burayu MESOB Electronic Service Portal — Admin Security</p>
          </div>
          <div class="content">
            <p style="font-size: 15px; margin-top: 0;">Hello Administrator,</p>
            <p style="font-size: 14px; color: #475569;">We received an official request to reset the password for your Burayu MESOB administrator account. Please use the one-time verification code below:</p>
            
            <div class="otp-box">
              <div class="otp-label">One-Time Verification Code</div>
              <div class="otp-code">${otp}</div>
              <div class="otp-expiry">⏱️ This code will expire in <strong>10 minutes</strong>.</div>
            </div>

            <div class="alert-box">
              <strong>⚠️ Security Alert:</strong> This code can only be used once. Never share this OTP code with anyone. Burayu MESOB staff will never ask for your code.
            </div>

            <p style="font-size: 13px; color: #64748b; margin-bottom: 0;">
              If you did not request this password reset, your account remains secure and no action is required.
            </p>
          </div>
          <div class="footer">
            <p style="margin: 0 0 4px 0;"><strong>Burayu MESOB Portal</strong> — Municipality Electronic Services</p>
            <p style="margin: 0;">This is an automated system message. Please do not reply directly to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Burayu MESOB Admin - Password Reset Request\n\nYour one-time verification code is: ${otp}\n\nThis OTP code will expire in 10 minutes and can only be used once.\n\nIf you did not request this reset, you can safely ignore this email.\n\n- Burayu MESOB Administration`,
  };

  try {
    console.log(`[EMAIL] Dispatching OTP email via Gmail SMTP to ${maskedRecipient}...`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] ✅ OTP email dispatched successfully (MessageID: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[EMAIL ERROR] ❌ Failed to send OTP email: ${error.message}`);
    throw new Error(`Failed to send OTP email: ${error.message}`);
  }
};

module.exports = {
  createTransporter,
  sendOTPEmail,
  verifyEmailConnection,
  isConfigured,
  getEmailCredentials,
  maskEmail,
};
