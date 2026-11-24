// Fresh hosts are initialized without sample users or personal data. Existing hosts migrate.
require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const db = require('../db');
async function main() {
  const [tables] = await db.query("SHOW TABLES LIKE 'users'");
  if (!tables.length) {
    const sql = fs.readFileSync(path.join(__dirname, '../database/schema.sql'), 'utf8');
    for (const statement of sql.split(';').filter(value => value.trim())) await db.query(statement);
    console.log('Initialized the empty SettleIn database.');
  }
  await db.end();
  for (const file of ['migrate-landlords.cjs','migrate-listing-filters.cjs','migrate-completion.cjs','migrate-booking-payments.cjs','migrate-receipts.cjs']) {
    const result = spawnSync(process.execPath, [path.join(__dirname, file)], { stdio: 'inherit' });
    if (result.status !== 0) throw new Error(`Migration failed: ${file}`);
  }
}
main().catch(error => { console.error('Database preparation failed:', error.code || error.message); process.exitCode = 1; db.end(); });
