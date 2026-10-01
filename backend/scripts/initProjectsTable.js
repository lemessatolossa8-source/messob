const { sequelize } = require("../config/db");

async function initProjectsTable() {
  try {
    await sequelize.authenticate();
    console.log("Connected to MySQL successfully.");

    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS \`projects\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`title\` JSON NOT NULL,
        \`description\` JSON NULL,
        \`content\` JSON NULL,
        \`image\` VARCHAR(2000) DEFAULT '',
        \`location\` VARCHAR(255) DEFAULT 'Burayu',
        \`start_date\` DATE NULL,
        \`end_date\` DATE NULL,
        \`status\` VARCHAR(50) DEFAULT 'Planned',
        \`department\` VARCHAR(255) DEFAULT 'Infrastructure',
        \`progress\` INT DEFAULT 0,
        \`is_published\` TINYINT(1) DEFAULT 0,
        \`budget\` VARCHAR(255) DEFAULT '',
        \`authorId\` INT NULL,
        \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`createdAt\` DATETIME DEFAULT CURRENT_TIMESTAMP,
        \`updatedAt\` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Ensure all columns exist if table was already created with different structure
    const [existingCols] = await sequelize.query("DESCRIBE `projects`;");
    const colNames = existingCols.map((c) => c.Field.toLowerCase());

    if (!colNames.includes("start_date")) {
      await sequelize.query("ALTER TABLE `projects` ADD COLUMN `start_date` DATE NULL;");
    }
    if (!colNames.includes("end_date")) {
      await sequelize.query("ALTER TABLE `projects` ADD COLUMN `end_date` DATE NULL;");
    }
    if (!colNames.includes("department")) {
      await sequelize.query("ALTER TABLE `projects` ADD COLUMN `department` VARCHAR(255) DEFAULT 'Infrastructure';");
    }
    if (!colNames.includes("is_published")) {
      await sequelize.query("ALTER TABLE `projects` ADD COLUMN `is_published` TINYINT(1) DEFAULT 0;");
    }
    if (!colNames.includes("created_at")) {
      await sequelize.query("ALTER TABLE `projects` ADD COLUMN `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP;");
    }
    if (!colNames.includes("updated_at")) {
      await sequelize.query("ALTER TABLE `projects` ADD COLUMN `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;");
    }

    const [finalCols] = await sequelize.query("DESCRIBE `projects`;");
    console.log("Projects table initialized. Columns:", finalCols.map((c) => `${c.Field} (${c.Type})`));
    process.exit(0);
  } catch (error) {
    console.error("Error creating projects table:", error);
    process.exit(1);
  }
}

initProjectsTable();
