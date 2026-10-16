const { Sequelize } = require("sequelize");
const mysql = require("mysql2/promise");

const dbHost = process.env.DB_HOST || "127.0.0.1";
const dbPort = process.env.DB_PORT || 3306;
const dbUser = process.env.DB_USER || "root";
const dbPass = process.env.DB_PASS || "";
const dbName = process.env.DB_NAME || "burayu_mesob";

const sequelize = new Sequelize(dbName, dbUser, dbPass, {
  host: dbHost,
  port: dbPort,
  dialect: "mysql",
  logging: false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

const connectDB = async () => {
  try {
    // 1. Ensure MySQL database exists
    const connection = await mysql.createConnection({
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: dbPass,
    });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    await connection.end();

    // 2. Authenticate Sequelize connection
    await sequelize.authenticate();
    console.log(`✅ MySQL Connected on ${dbHost}:${dbPort}`);
    console.log(`📦 Database: ${dbName}`);

    // 3. Sync models — create missing tables only, never alter existing ones.
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
