const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env'), quiet: true });
const db = require('../db');
async function run() {
  const [result] = await db.query(
    `UPDATE properties SET gender_policy = ?
     WHERE id = ? AND (gender_policy IS NULL OR TRIM(gender_policy) = '')
     AND LOWER(description) LIKE ?`,
    ['Female-only', 'prop-010', '%female-only%']
  );
  const [counts] = await db.query('SELECT gender_policy, COUNT(*) AS count FROM properties GROUP BY gender_policy');
  console.log(JSON.stringify({ updated: result.affectedRows, counts }));
}
run().catch(error => { console.error(error.code || error.name); process.exitCode = 1; }).finally(() => db.end());
