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

    // 3. Sync models — only alter schema in development.
    //    In production, use migrations instead (never auto-alter live schema).
    if (process.env.NODE_ENV !== "production") {
      await sequelize.sync({ alter: true });
      console.log(`🔄 MySQL Models synchronized (alter:true – development only)`);
    } else {
      await sequelize.sync();
      console.log(`🔄 MySQL Models verified (production – no schema alteration)`);
    }
  } catch (error) {
    console.error(`❌ MySQL Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
