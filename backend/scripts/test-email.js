require("dotenv").config();
const { verifyEmailConnection, sendOTPEmail, getEmailCredentials, isConfigured } = require("../config/email");

(async () => {
  console.log("============================================================");
  console.log("🔍 Burayu MESOB — Gmail SMTP Delivery Verification Script");
  console.log("============================================================");

  const { user, service } = getEmailCredentials();
  console.log(`📧 Service:       ${service}`);
  console.log(`👤 Admin/Sender:  ${user || "NOT SET"}`);
  console.log(`🔑 Configured:    ${isConfigured() ? "YES" : "NO (Placeholder or Missing)"}`);

  if (!isConfigured()) {
    console.error("\n❌ Real Google App Password is not yet set in backend/.env!");
    console.error("Please set EMAIL_PASSWORD=<your_16_character_app_password> in backend/.env");
    process.exit(1);
  }

  console.log("\n1️⃣ Verifying SMTP connection with Gmail...");
  const verifyResult = await verifyEmailConnection();
  if (!verifyResult.connected) {
    console.error(`❌ SMTP Connection Failed: ${verifyResult.message}`);
    process.exit(1);
  }
  console.log("✅ Gmail SMTP connection verified successfully!");

  console.log("\n2️⃣ Sending test OTP email to admin recipient...");
  try {
    const testOtp = "849201";
    const result = await sendOTPEmail(user, testOtp);
    console.log(`✅ Email sent successfully! MessageId: ${result.messageId}`);
    console.log("============================================================");
    console.log("🎉 Real email delivery test PASSED!");
    console.log("============================================================");
    process.exit(0);
  } catch (error) {
    console.error(`❌ Email delivery failed: ${error.message}`);
    process.exit(1);
  }
})();
