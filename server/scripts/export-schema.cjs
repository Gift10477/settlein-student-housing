// Exports structure only. No records, credentials or account hashes are included.
require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const db = require('../db');
async function main() {
  const tables = ['users','properties','bookings','payments','audit_logs','amenities','property_amenities','user_security','contact_messages','reviews','migration_archive'];
  let sql = '-- SettleIn active schema. Create the database separately, then execute in that database.\n';
  for (const table of tables) {
    const [rows] = await db.query(`SHOW CREATE TABLE ${table}`);
    sql += rows[0]['Create Table'].replace('CREATE TABLE ', 'CREATE TABLE IF NOT EXISTS ').replace(/ AUTO_INCREMENT=\d+/g,'') + ';\n\n';
  }
  fs.writeFileSync(path.join(__dirname,'../database/schema.sql'), sql.trimEnd()+'\n');
  console.log('Exported structure of 11 tables; no data exported.');
}
main().catch(error => { console.error(error.code || error.message); process.exitCode=1; }).finally(() => db.end());
