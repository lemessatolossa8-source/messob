const dns = require("dns");
if (typeof dns.setDefaultResultOrder === "function") {
  dns.setDefaultResultOrder("ipv4first");
}

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
  if (
    (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.startsWith("re_")) ||
    (process.env.BREVO_API_KEY && process.env.BREVO_API_KEY.length > 10)
  ) {
    return true;
  }
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
 * Supports explicit port and forces IPv4 (family: 4) to prevent cloud network IPv6 timeout hangs.
 */
const createTransporter = (forcePort = null) => {
  if (!isConfigured()) {
    return null;
  }

  const { user, pass, host, port: defaultPort } = getEmailCredentials();
  const targetPort = forcePort || defaultPort || 465;
  const isSecure = targetPort === 465;

  try {
    return nodemailer.createTransport({
      host: host && !host.includes("gmail") ? host : "smtp.gmail.com",
      port: targetPort,
      secure: isSecure,
      family: 4, // Explicitly force IPv4 to prevent cloud/Render IPv6 timeout issues
      auth: {
        user,
        pass,
      },
      tls: {
        rejectUnauthorized: false,
      },
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 10000,
      socketTimeout: 15000,
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

  const fromAddress = senderEmail
    ? `"Burayu MESOB Admin" <${senderEmail}>`
    : `"Burayu MESOB Admin" <lemessatolossa8@gmail.com>`;

  const mailOptions = {
    from: fromAddress,
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

  // 1. Try Resend HTTP API (Port 443 HTTPS - Works on Render Free Tier where outbound SMTP is blocked)
  if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.startsWith("re_")) {
    try {
      console.log(`[EMAIL] Dispatching OTP email via Resend HTTPS API to ${maskedRecipient}...`);
      const fromEmail = process.env.RESEND_FROM || "Burayu MESOB Admin <onboarding@resend.dev>";
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.RESEND_API_KEY.trim()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [email],
          subject: mailOptions.subject,
          html: mailOptions.html,
          text: mailOptions.text,
        }),
      });

      const resData = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(resData.message || `Resend HTTP error ${res.status}`);
      }
      console.log(`[EMAIL] ✅ OTP email dispatched successfully via Resend HTTPS (ID: ${resData.id})`);
      return { success: true, messageId: resData.id };
    } catch (resendErr) {
      console.warn(`[EMAIL WARNING] Resend HTTPS dispatch failed: ${resendErr.message}. Attempting fallback...`);
    }
  }

  // 2. Try Brevo HTTP API (Port 443 HTTPS - Works on Render Free Tier)
  if (process.env.BREVO_API_KEY) {
    try {
      console.log(`[EMAIL] Dispatching OTP email via Brevo HTTPS API to ${maskedRecipient}...`);
      const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": process.env.BREVO_API_KEY.trim(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender: { name: "Burayu MESOB Admin", email: senderEmail || "lemessatolossa8@gmail.com" },
          to: [{ email }],
          subject: mailOptions.subject,
          htmlContent: mailOptions.html,
          textContent: mailOptions.text,
        }),
      });

      const resData = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(resData.message || `Brevo HTTP error ${res.status}`);
      }
      console.log(`[EMAIL] ✅ OTP email dispatched successfully via Brevo HTTPS (ID: ${resData.messageId})`);
      return { success: true, messageId: resData.messageId };
    } catch (brevoErr) {
      console.warn(`[EMAIL WARNING] Brevo HTTPS dispatch failed: ${brevoErr.message}. Attempting fallback...`);
    }
  }

  // 3. Fallback to direct SMTP (port 465 SSL, fallback port 587 STARTTLS)
  const transporter = createTransporter(465);
  if (!transporter) {
    throw new Error("SMTP credentials are not configured and no HTTP email API key (RESEND_API_KEY) was found.");
  }

  try {
    console.log(`[EMAIL] Dispatching OTP email via Gmail SMTP (port 465 SSL, IPv4) to ${maskedRecipient}...`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] ✅ OTP email dispatched successfully (MessageID: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.warn(`[EMAIL WARNING] Port 465 dispatch attempt failed: ${error.message}. Retrying via port 587 STARTTLS...`);
    try {
      const fallbackTransporter = createTransporter(587);
      const info = await fallbackTransporter.sendMail(mailOptions);
      console.log(`[EMAIL] ✅ OTP email dispatched successfully via port 587 fallback (MessageID: ${info.messageId})`);
      return { success: true, messageId: info.messageId };
    } catch (fallbackError) {
      console.error(`[EMAIL ERROR] ❌ Both SMTP ports failed: ${fallbackError.message}`);
      throw fallbackError;
    }
  }
};

/**
 * Escapes HTML characters to prevent HTML injection in emails
 */
const escapeHtml = (str) => {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

/**
 * Send contact inquiry email to official receiver
 * @param {Object} data
 * @param {string} data.name - Submitter full name
 * @param {string} data.email - Submitter email address
 * @param {string} [data.phone] - Submitter phone number
 * @param {string} data.subject - Inquiry subject
 * @param {string} data.message - Detailed inquiry message
 * @param {number|string} [data.contactId] - DB ID of the inquiry
 */
const sendContactInquiryEmail = async ({ name, email, phone, subject, message, contactId }) => {
  const { user: senderEmail } = getEmailCredentials();
  const recipientEmail = (
    process.env.CONTACT_RECIPIENT_EMAIL ||
    process.env.ADMIN_EMAIL ||
    "lemessatolossa8@gmail.com"
  ).trim();

  const maskedRecipient = maskEmail(recipientEmail);

  if (!isConfigured()) {
    console.log("\n" + "=".repeat(60));
    console.log("📨 CONTACT INQUIRY EMAIL (Development Mode - SMTP not configured)");
    console.log("=".repeat(60));
    console.log(`To: ${recipientEmail}`);
    console.log(`From: ${name} <${email}>`);
    console.log(`Phone: ${phone || "N/A"}`);
    console.log(`Subject: ${subject}`);
    console.log(`Message:\n${message}`);
    console.log("=".repeat(60) + "\n");
    return { success: true, mode: "console", recipient: recipientEmail };
  }

  const dateStr = new Date().toLocaleString("en-US", {
    timeZone: "Africa/Addis_Ababa",
    dateStyle: "full",
    timeStyle: "medium",
  });

  const fromAddress = senderEmail
    ? `"Burayu MESOB Contact Desk" <${senderEmail}>`
    : `"Burayu MESOB Contact Desk" <lemessatolossa8@gmail.com>`;

  const mailOptions = {
    from: fromAddress,
    to: recipientEmail,
    replyTo: `"${name.replace(/[^\w\s.-]/g, "")}" <${email}>`,
    subject: `🏛️ [Burayu MESOB Inquiry] ${subject}`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #111827;
            background-color: #f3f4f6;
            margin: 0;
            padding: 0;
          }
          .wrapper {
            max-width: 620px;
            margin: 28px auto;
            background: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            border: 1px solid #e5e7eb;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
          }
          .header {
            background-color: #000000;
            color: #ffffff;
            padding: 30px 28px;
            border-bottom: 4px solid #D71920;
          }
          .header-badge {
            display: inline-block;
            background-color: #D71920;
            color: #ffffff;
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 1.2px;
            padding: 4px 10px;
            border-radius: 6px;
            margin-bottom: 12px;
          }
          .header h1 {
            margin: 0;
            font-size: 22px;
            font-weight: 800;
            letter-spacing: -0.4px;
            color: #ffffff;
          }
          .header p {
            margin: 6px 0 0 0;
            font-size: 13px;
            color: #d1d5db;
          }
          .body-content {
            padding: 28px;
          }
          .info-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 24px;
            background-color: #f9fafb;
            border-radius: 10px;
            overflow: hidden;
            border: 1px solid #e5e7eb;
          }
          .info-table td {
            padding: 12px 16px;
            border-bottom: 1px solid #e5e7eb;
            font-size: 13px;
          }
          .info-table tr:last-child td {
            border-bottom: none;
          }
          .info-label {
            width: 32%;
            font-weight: 700;
            color: #4b5563;
            text-transform: uppercase;
            font-size: 11px;
            letter-spacing: 0.5px;
          }
          .info-value {
            color: #111827;
            font-weight: 600;
          }
          .message-card {
            background-color: #ffffff;
            border: 1px solid #e5e7eb;
            border-left: 4px solid #D71920;
            border-radius: 8px;
            padding: 18px 20px;
            margin: 20px 0;
          }
          .message-title {
            font-size: 12px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #D71920;
            margin: 0 0 10px 0;
          }
          .message-text {
            font-size: 14px;
            line-height: 1.7;
            color: #1f2937;
            white-space: pre-wrap;
            word-break: break-word;
            margin: 0;
          }
          .reply-btn-container {
            text-align: center;
            margin: 28px 0 10px 0;
          }
          .reply-btn {
            display: inline-block;
            background-color: #D71920;
            color: #ffffff !important;
            text-decoration: none;
            font-weight: 700;
            font-size: 13px;
            padding: 12px 26px;
            border-radius: 8px;
            letter-spacing: 0.5px;
          }
          .footer {
            background-color: #f9fafb;
            padding: 20px 28px;
            border-top: 1px solid #e5e7eb;
            font-size: 12px;
            color: #6b7280;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="header">
            <div class="header-badge">Burayu MESOB</div>
            <h1>🏛️ New Public Contact Inquiry</h1>
            <p>A citizen or visitor has submitted an inquiry through the official Burayu MESOB website.</p>
          </div>
          <div class="body-content">
            <table class="info-table">
              <tr>
                <td class="info-label">Sender Name</td>
                <td class="info-value">${escapeHtml(name)}</td>
              </tr>
              <tr>
                <td class="info-label">Sender Email</td>
                <td class="info-value"><a href="mailto:${escapeHtml(email)}" style="color: #D71920; text-decoration: underline;">${escapeHtml(email)}</a></td>
              </tr>
              <tr>
                <td class="info-label">Phone Number</td>
                <td class="info-value">${escapeHtml(phone || "Not provided")}</td>
              </tr>
              <tr>
                <td class="info-label">Subject</td>
                <td class="info-value"><strong>${escapeHtml(subject)}</strong></td>
              </tr>
              <tr>
                <td class="info-label">Received At</td>
                <td class="info-value">${dateStr} (Addis Ababa EAT)</td>
              </tr>
              ${contactId ? `<tr>
                <td class="info-label">Reference ID</td>
                <td class="info-value">#MESOB-INQ-${contactId}</td>
              </tr>` : ""}
            </table>

            <div class="message-card">
              <div class="message-title">Inquiry Message Content</div>
              <p class="message-text">${escapeHtml(message)}</p>
            </div>

            <div class="reply-btn-container">
              <a href="mailto:${escapeHtml(email)}?subject=Re: ${encodeURIComponent(subject)}" class="reply-btn">
                ✉️ Reply Directly to Citizen (${escapeHtml(email)})
              </a>
            </div>
          </div>
          <div class="footer">
            <p style="margin: 0 0 6px 0;"><strong>Burayu MESOB Digital Service Center</strong> • Shaggar City Administration</p>
            <p style="margin: 0;">This email was delivered to <strong>${escapeHtml(recipientEmail)}</strong>. To change the recipient, update <code>CONTACT_RECIPIENT_EMAIL</code> in the backend environment file.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Burayu MESOB Contact Inquiry\n\n` +
      `Sender: ${name} (${email})\n` +
      `Phone: ${phone || "Not provided"}\n` +
      `Subject: ${subject}\n` +
      `Date: ${dateStr}\n` +
      (contactId ? `Reference ID: #MESOB-INQ-${contactId}\n\n` : `\n`) +
      `Message:\n${message}\n\n` +
      `To reply, reply directly to this email or send to ${email}.\n`,
  };

  // 1. Try Resend HTTP API (Port 443 HTTPS - Works on Render Free Tier)
  if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.startsWith("re_")) {
    try {
      console.log(`[EMAIL] Dispatching contact inquiry email via Resend HTTPS API to ${maskedRecipient}...`);
      const fromEmail = process.env.RESEND_FROM || "Burayu MESOB Contact Desk <onboarding@resend.dev>";
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.RESEND_API_KEY.trim()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [recipientEmail],
          reply_to: email,
          subject: mailOptions.subject,
          html: mailOptions.html,
          text: mailOptions.text,
        }),
      });

      const resData = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(resData.message || `Resend HTTP error ${res.status}`);
      }
      console.log(`[EMAIL] ✅ Contact inquiry email dispatched successfully via Resend HTTPS (ID: ${resData.id})`);
      return { success: true, messageId: resData.id, recipient: recipientEmail };
    } catch (resendErr) {
      console.warn(`[EMAIL WARNING] Resend HTTPS dispatch failed: ${resendErr.message}. Attempting SMTP...`);
    }
  }

  // 2. Try Brevo HTTP API (Port 443 HTTPS - Works on Render Free Tier)
  if (process.env.BREVO_API_KEY) {
    try {
      console.log(`[EMAIL] Dispatching contact inquiry email via Brevo HTTPS API to ${maskedRecipient}...`);
      const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": process.env.BREVO_API_KEY.trim(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender: { name: "Burayu MESOB Contact Desk", email: senderEmail || "lemessatolossa8@gmail.com" },
          to: [{ email: recipientEmail }],
          replyTo: { email, name },
          subject: mailOptions.subject,
          htmlContent: mailOptions.html,
          textContent: mailOptions.text,
        }),
      });

      const resData = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(resData.message || `Brevo HTTP error ${res.status}`);
      }
      console.log(`[EMAIL] ✅ Contact inquiry email dispatched successfully via Brevo HTTPS (ID: ${resData.messageId})`);
      return { success: true, messageId: resData.messageId, recipient: recipientEmail };
    } catch (brevoErr) {
      console.warn(`[EMAIL WARNING] Brevo HTTPS dispatch failed: ${brevoErr.message}. Attempting SMTP...`);
    }
  }

  // 3. Fallback to direct SMTP
  const transporter = createTransporter(465);
  if (!transporter) {
    throw new Error("SMTP credentials are not configured and no HTTP email API key (RESEND_API_KEY) was found.");
  }

  try {
    console.log(`[EMAIL] Dispatching contact inquiry email to ${maskedRecipient}...`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] ✅ Contact inquiry email dispatched successfully (MessageID: ${info.messageId})`);
    return { success: true, messageId: info.messageId, recipient: recipientEmail };
  } catch (error) {
    console.warn(`[EMAIL WARNING] Primary SMTP attempt failed: ${error.message}. Retrying via port 587...`);
    try {
      const fallbackTransporter = createTransporter(587);
      const info = await fallbackTransporter.sendMail(mailOptions);
      console.log(`[EMAIL] ✅ Contact inquiry email dispatched successfully via port 587 (MessageID: ${info.messageId})`);
      return { success: true, messageId: info.messageId, recipient: recipientEmail };
    } catch (fallbackError) {
      console.error(`[EMAIL ERROR] ❌ Both SMTP ports failed: ${fallbackError.message}`);
      throw fallbackError;
    }
  }
};

module.exports = {
  createTransporter,
  sendOTPEmail,
  sendContactInquiryEmail,
  verifyEmailConnection,
  isConfigured,
  getEmailCredentials,
  maskEmail,
};
