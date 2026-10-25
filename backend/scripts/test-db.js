/**
 * Diagnostic script to verify MySQL database connection and inspect tables.
 * Safe to run against any MySQL instance (Aiven, local, TiDB, Render).
 * Reads environment variables from backend/.env or the runtime environment.
 *
 * Usage:
 *   cd backend
 *   npm run test:db
 */

require("dotenv").config();
const { sequelize } = require("../config/db");

// Load all models to verify their schemas and bindings
const User = require("../models/User");
const News = require("../models/News");
const Announcement = require("../models/Announcement");
const Service = require("../models/Service");
const Branch = require("../models/Branch");
const Contact = require("../models/Contact");
const Floor = require("../models/Floor");
const FloorService = require("../models/FloorService");
const Gallery = require("../models/Gallery");
const OTP = require("../models/OTP");
const Project = require("../models/Project");
const Setting = require("../models/Setting");
const Slide = require("../models/Slide");
const Statistic = require("../models/Statistic");

async function runDatabaseCheck() {
  console.log("=================================================");
  console.log("🔍 Burayu MESOB — Database Connection Diagnostic");
  console.log("=================================================");

  const dbUrl = process.env.DATABASE_URL || process.env.MYSQL_URL;
  if (dbUrl) {
    // Mask password in output for security
    const maskedUrl = dbUrl.replace(/:([^@:]+)@/, ":****@");
    console.log(`📡 Connection Method : DATABASE_URL`);
    console.log(`🔗 Target URL        : ${maskedUrl}`);
  } else {
    console.log(`📡 Connection Method : Individual DB_* variables`);
    console.log(`🏠 Host              : ${process.env.DB_HOST || "127.0.0.1"}`);
    console.log(`🔌 Port              : ${process.env.DB_PORT || 3306}`);
    console.log(`👤 User              : ${process.env.DB_USER || "root"}`);
    console.log(`📦 Database Name     : ${process.env.DB_NAME || "burayu_mesob"}`);
  }
  console.log(`🔒 DB_SSL (env)      : ${process.env.DB_SSL || "(auto-detected)"}`);
  console.log("-------------------------------------------------");

  try {
    console.log("⏳ Attempting connection...");
    await sequelize.authenticate();
    console.log("✅ Authenticated successfully with MySQL!\n");

    // Query active database and version
    const [[dbInfo]] = await sequelize.query("SELECT DATABASE() AS currentDb, VERSION() AS version;");
    console.log(`📦 Active Database   : ${dbInfo.currentDb || "NONE SELECTED (⚠️)"}`);
    console.log(`⚙️  MySQL Version     : ${dbInfo.version}`);

    // Query all existing tables
    const [rawTables] = await sequelize.query("SHOW TABLES;");
    const tableNames = rawTables.map((r) => Object.values(r)[0]);
    console.log(`📊 Total Tables in DB: ${tableNames.length}\n`);

    console.log("📋 Inspecting existing tables and record counts:");
    console.log("-------------------------------------------------");

    const modelsToCheck = [
      { name: "Users", model: User },
      { name: "News", model: News },
      { name: "Announcements", model: Announcement },
      { name: "Services", model: Service },
      { name: "Branches", model: Branch },
      { name: "Contacts", model: Contact },
      { name: "Floors", model: Floor },
      { name: "FloorServices", model: FloorService },
      { name: "Gallery", model: Gallery },
      { name: "OTPs", model: OTP },
      { name: "Projects", model: Project },
      { name: "Settings", model: Setting },
      { name: "Slides", model: Slide },
      { name: "Statistics", model: Statistic },
    ];

    let totalRecords = 0;
    for (const item of modelsToCheck) {
      try {
        const count = await item.model.count();
        totalRecords += count;
        console.log(`  ✓ ${item.name.padEnd(16)} : ${count} record(s)`);
      } catch (err) {
        console.log(`  ✗ ${item.name.padEnd(16)} : Error reading table (${err.message})`);
      }
    }

    console.log("-------------------------------------------------");
    console.log(`📈 Total Records across tracked models: ${totalRecords}\n`);

    // Check admin account presence
    const adminUser = await User.findOne({
      where: { role: "admin" },
      attributes: ["id", "name", "email", "role", "isActive"],
    });

    if (adminUser) {
      console.log(`👤 Admin User Found   : ${adminUser.name} (${adminUser.email}) [Active: ${adminUser.isActive}]`);
    } else {
      const anyUserCount = await User.count();
      if (anyUserCount === 0) {
        console.log("⚠️  No admin user found. Run `npm run seed` to create the initial admin account.");
      } else {
        console.log(`ℹ️  Found ${anyUserCount} user(s), but none with role='admin'.`);
      }
    }

    console.log("\n=================================================");
    console.log("🎉 Database connection and schema verification PASSED!");
    console.log("=================================================");
    await sequelize.close();
    process.exit(0);
  } catch (err) {
    console.error("\n❌ Database Connection FAILED!");
    console.error(`Error details: ${err.message}`);
    console.log("\n💡 Troubleshooting Tips for Aiven MySQL:");
    console.log("1. Ensure your Aiven service is 'Running' (not rebuilding or stopped).");
    console.log("2. Verify that your host, port, user (e.g. avnadmin), and password are correct.");
    console.log("3. Aiven requires SSL/TLS. If using individual variables, set DB_SSL=true.");
    console.log("4. If using DATABASE_URL, copy the 'Service URI' directly from your Aiven MySQL console.");
    console.log("5. Ensure the database name in DB_NAME or DATABASE_URL matches where your tables were imported (e.g. 'defaultdb' or 'burayu_mesob').");
    console.log("=================================================");
    await sequelize.close().catch(() => {});
    process.exit(1);
  }
}

runDatabaseCheck();
