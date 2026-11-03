// Assign counties only for reviewed locations; never infer from campus.
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env'), quiet: true });
const db = require('../db');

async function run() {
  const [columns] = await db.query("SHOW COLUMNS FROM properties LIKE 'county'");
  if (!columns.length) await db.query('ALTER TABLE properties ADD COLUMN county VARCHAR(100) NULL');
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.query('SELECT id, location, county FROM properties FOR UPDATE');
    const updated = [], unresolved = [];
    for (const row of rows) {
      if (row.county && row.county.trim()) continue;
      const parts = row.location.split(',').map(x => x.trim().toLowerCase());
      let county = null;
      let location = row.location;
      if (parts[0] === 'kahawa sukari') {
        county = 'Kiambu';
        if (parts.length === 2 && parts[1] === 'nairobi') location = 'Kahawa Sukari, Kiambu';
      } else if (parts[0] === 'madaraka estate' && parts.length === 1) {
        county = 'Nairobi';
      } else if (parts.at(-1) === 'nairobi') county = 'Nairobi';
      else if (parts.at(-1) === 'kiambu') county = 'Kiambu';
      if (!county) { unresolved.push({ id: row.id, location: row.location }); continue; }
      await connection.query('UPDATE properties SET county = ?, location = ? WHERE id = ?', [county, location, row.id]);
      updated.push({ id: row.id, county, location });
    }
    await connection.commit();
    console.log(JSON.stringify({ updated, unresolved }, null, 2));
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally { connection.release(); }
}
run().catch(error => { console.error('County assignment failed:', error.code || error.name); process.exitCode = 1; }).finally(() => db.end());
