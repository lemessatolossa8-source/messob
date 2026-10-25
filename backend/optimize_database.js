require('dotenv').config();
const mysql = require('mysql2/promise');

async function optimizeDb() {
  const databaseUrl = process.env.DATABASE_URL || process.env.MYSQL_URL;
  let connConfig;

  if (databaseUrl) {
    connConfig = {
      uri: databaseUrl,
      ssl: { rejectUnauthorized: false }
    };
  } else {
    const isLocal = !process.env.DB_HOST || process.env.DB_HOST === '127.0.0.1' || process.env.DB_HOST === 'localhost';
    const useSsl = process.env.DB_SSL === 'true' || (process.env.DB_SSL !== 'false' && !isLocal);
    connConfig = {
      host: process.env.DB_HOST || '127.0.0.1',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'burayu_mesob',
      ssl: useSsl ? { rejectUnauthorized: false } : undefined
    };
  }

  const conn = await mysql.createConnection(connConfig);

  console.log('Connected to MySQL. Auditing indexes...');

  // 1. Drop duplicate indexes on users
  const [userIndexes] = await conn.query('SHOW INDEX FROM `users`');
  const userDupes = [...new Set(userIndexes.map(i => i.Key_name))].filter(name => /^email_\d+$/.test(name));
  for (const dupe of userDupes) {
    console.log(`Dropping duplicate index on users: ${dupe}`);
    await conn.query(`ALTER TABLE \`users\` DROP INDEX \`${dupe}\``);
  }

  // 2. Drop duplicate indexes on settings
  const [settingIndexes] = await conn.query('SHOW INDEX FROM `settings`');
  const settingDupes = [...new Set(settingIndexes.map(i => i.Key_name))].filter(name => /^key_\d+$/.test(name));
  for (const dupe of settingDupes) {
    console.log(`Dropping duplicate index on settings: ${dupe}`);
    await conn.query(`ALTER TABLE \`settings\` DROP INDEX \`${dupe}\``);
  }

  // Helper to safely add an index if it doesn't already exist
  async function addIndexIfNotExists(table, indexName, columnsSql) {
    try {
      const [existing] = await conn.query(`SHOW INDEX FROM \`${table}\` WHERE Key_name = ?`, [indexName]);
      if (existing.length === 0) {
        console.log(`Adding index ${indexName} to ${table}...`);
        await conn.query(`ALTER TABLE \`${table}\` ADD INDEX \`${indexName}\` (${columnsSql})`);
        console.log(`✅ Added ${indexName} to ${table}`);
      } else {
        console.log(`ℹ️ Index ${indexName} already exists on ${table}`);
      }
    } catch (err) {
      console.warn(`Could not add ${indexName} to ${table}:`, err.message);
    }
  }

  // 3. Add composite query indexes
  await addIndexIfNotExists('news', 'idx_news_status_created', '`status`, `createdAt`');
  await addIndexIfNotExists('announcements', 'idx_announcements_status_created', '`status`, `createdAt`');
  await addIndexIfNotExists('announcements', 'idx_announcements_status_dates', '`status`, `expiry_date`, `date`');
  await addIndexIfNotExists('projects', 'idx_projects_pub_created', '`is_published`, `created_at`');
  await addIndexIfNotExists('projects', 'idx_projects_status_pub', '`status`, `is_published`');
  await addIndexIfNotExists('slides', 'idx_slides_status_order', '`status`, `order`');
  await addIndexIfNotExists('gallery', 'idx_gallery_status_created', '`status`, `createdAt`');
  await addIndexIfNotExists('statistics', 'idx_statistics_status_order', '`status`, `order`');
  await addIndexIfNotExists('floors', 'idx_floors_status_order', '`status`, `order`, `floorNumber`');
  await addIndexIfNotExists('floorservices', 'idx_floorservices_floor_status', '`floorId`, `status`, `order`');

  // Verify final index status
  console.log('\n--- Final Indexes Summary ---');
  const [tables] = await conn.query('SHOW TABLES');
  for (const row of tables) {
    const table = Object.values(row)[0];
    const [indexes] = await conn.query(`SHOW INDEX FROM \`${table}\``);
    const indexNames = [...new Set(indexes.map(i => i.Key_name))];
    console.log(`${table}: ${indexNames.join(', ')}`);
  }

  await conn.end();
  console.log('\nDatabase optimization complete!');
}

optimizeDb().catch(err => {
  console.error('Optimization error:', err);
  process.exit(1);
});
