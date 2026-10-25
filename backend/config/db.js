const { Sequelize } = require("sequelize");
const mysql = require("mysql2/promise");

const dbHost = process.env.DB_HOST || "127.0.0.1";
const dbPort = process.env.DB_PORT || 3306;
const dbUser = process.env.DB_USER || "root";
const dbPass = process.env.DB_PASS || "";
const dbName = process.env.DB_NAME || "burayu_mesob";
const databaseUrl = process.env.DATABASE_URL || process.env.MYSQL_URL;

// Helper to detect if a host is remote (cloud-hosted)
const isRemoteHost = (host) => {
  if (!host) return false;
  const h = host.toLowerCase().trim();
  return (
    h !== "localhost" &&
    h !== "127.0.0.1" &&
    h !== "::1" &&
    !h.startsWith("192.168.") &&
    !h.startsWith("10.")
  );
};

const hasCloudIndicator = (str) => {
  if (!str) return false;
  const s = str.toLowerCase();
  return (
    s.includes("aivencloud.com") ||
    s.includes("tidbcloud.com") ||
    s.includes("render.com") ||
    s.includes("railway.app") ||
    s.includes("ssl-mode") ||
    s.includes("ssl=")
  );
};

// Check if database URL points to a remote host
let isUrlRemote = false;
let databaseUrlDbName = null;
if (databaseUrl) {
  try {
    const parsed = new URL(databaseUrl.replace(/^mysql:/, "http:"));
    isUrlRemote = isRemoteHost(parsed.hostname);
    if (parsed.pathname && parsed.pathname.length > 1) {
      databaseUrlDbName = decodeURIComponent(parsed.pathname.slice(1).split("?")[0]);
    }
  } catch {}
}

const isLocalhost = !databaseUrl ? !isRemoteHost(dbHost) : !isUrlRemote;

// Automatically enable SSL for Aiven / Cloud MySQL databases
// Can be explicitly forced with DB_SSL=true or disabled with DB_SSL=false
const useSsl =
  process.env.DB_SSL === "true" ||
  (process.env.DB_SSL !== "false" &&
    (!isLocalhost || hasCloudIndicator(databaseUrl) || hasCloudIndicator(dbHost)));

// SSL options for Aiven MySQL and cloud providers
const sslConfig = useSsl
  ? process.env.DB_CA_CERT
    ? { ca: process.env.DB_CA_CERT, rejectUnauthorized: true }
    : { rejectUnauthorized: false }
  : undefined;

const dialectOptions = {
  connectTimeout: 60000,
  ...(useSsl ? { ssl: sslConfig } : {}),
};

const poolConfig = {
  max: parseInt(process.env.DB_POOL_MAX || "10", 10),
  min: parseInt(process.env.DB_POOL_MIN || "0", 10),
  acquire: 30000,
  idle: 10000,
};

const sequelize = databaseUrl
  ? new Sequelize(databaseUrl, {
      dialect: "mysql",
      logging: false,
      dialectOptions,
      pool: poolConfig,
    })
  : new Sequelize(dbName, dbUser, dbPass, {
      host: dbHost,
      port: dbPort,
      dialect: "mysql",
      logging: false,
      dialectOptions,
      pool: poolConfig,
    });

const activeDbName = databaseUrlDbName || dbName;

const connectDB = async () => {
  try {
    // 1. Try to ensure MySQL database exists ONLY for local development
    if (!databaseUrl && isLocalhost) {
      try {
        const connection = await mysql.createConnection({
          host: dbHost,
          port: dbPort,
          user: dbUser,
          password: dbPass,
          ssl: sslConfig,
        });
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
        await connection.end();
      } catch (dbInitErr) {
        console.log(`ℹ️ Database initialization notice: ${dbInitErr.message}`);
      }
    }

    // 2. Authenticate Sequelize connection
    await sequelize.authenticate();
    const hostInfo = databaseUrl ? "via DATABASE_URL" : `on ${dbHost}:${dbPort}`;
    console.log(`✅ MySQL Connected successfully ${hostInfo} (SSL: ${useSsl ? "Enabled" : "Disabled"})`);
    console.log(`📦 Database: ${activeDbName}`);

    // 3. Sync models — create missing tables only, never alter or drop existing ones.
    await sequelize.sync({ force: false });
    
    // Auto-sync missing columns for otps table
    const OTP = require("../models/OTP");
    if (OTP && typeof OTP.syncSchema === "function") {
      await OTP.syncSchema();
    }

    // Ensure title column exists on gallery table
    try {
      const [colResults] = await sequelize.query(`
        SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'gallery' AND COLUMN_NAME = 'title';
      `);
      if (colResults.length === 0) {
        await sequelize.query("ALTER TABLE `gallery` ADD COLUMN `title` JSON NULL;");
        console.log("➕ Added missing 'title' column to gallery table");
      }
    } catch (colErr) {
      console.warn("Could not check/add gallery title column:", colErr.message);
    }
    
    console.log(`🔄 MySQL Models synchronized`);
  } catch (error) {
    console.error(`❌ MySQL Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
