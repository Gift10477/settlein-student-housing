// Repeatable, non-destructive migration. Legacy rows are archived before repair.
require('dotenv').config();
const db = require('../db');
const options = require('../../shared/listingOptions.json');
async function foreignKey(table, name, definition) {
  const [rows] = await db.query('SELECT CONSTRAINT_NAME FROM information_schema.TABLE_CONSTRAINTS WHERE CONSTRAINT_SCHEMA=DATABASE() AND TABLE_NAME=? AND CONSTRAINT_NAME=?', [table, name]);
  if (!rows.length) await db.query(`ALTER TABLE ${table} ADD CONSTRAINT ${name} ${definition}`);
}
async function main() {
  await db.query('CREATE TABLE IF NOT EXISTS migration_archive (source_table VARCHAR(64) NOT NULL, source_id VARCHAR(100) NOT NULL, snapshot LONGTEXT NOT NULL, reason VARCHAR(255) NOT NULL, archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY(source_table,source_id))');
  async function archive(table, row, reason, id = row.id) {
    await db.query('INSERT IGNORE INTO migration_archive (source_table,source_id,snapshot,reason) VALUES (?,?,?,?)', [table, String(id), JSON.stringify(row), reason]);
  }
  // Match the existing property identifier type and collation, including copied databases.
  const [types] = await db.query("SHOW FULL COLUMNS FROM properties WHERE Field='id'");
  const propType = types[0].Type, collation = types[0].Collation;
  if (!/^varchar\(\d+\)$/.test(propType) || !/^\w+$/.test(collation)) throw new Error('Unsupported property identifier definition.');
  const propertyId = `${propType} COLLATE ${collation}`;
  const [existingFks] = await db.query("SELECT CONSTRAINT_NAME FROM information_schema.TABLE_CONSTRAINTS WHERE CONSTRAINT_SCHEMA=DATABASE() AND TABLE_NAME='bookings' AND CONSTRAINT_NAME='fk_booking_property'");
  if (!existingFks.length) await db.query('ALTER TABLE bookings MODIFY user_id INT NULL');
  const [orphans] = await db.query('SELECT b.* FROM bookings b LEFT JOIN users u ON u.id=b.user_id LEFT JOIN properties p ON p.id=b.property_id WHERE (b.user_id IS NOT NULL AND u.id IS NULL) OR (b.property_id IS NOT NULL AND p.id IS NULL)');
  // Relax only legacy references; new requests must supply a real user and property.
  if (!existingFks.length) await db.query('ALTER TABLE bookings MODIFY property_id VARCHAR(100) NULL');
  for (const row of orphans) await archive('bookings', row, 'Legacy missing user/property reference; original identifiers retained here.');
  await db.query('UPDATE bookings b LEFT JOIN users u ON u.id=b.user_id SET b.user_id=NULL WHERE u.id IS NULL');
  await db.query('UPDATE bookings b LEFT JOIN properties p ON p.id=b.property_id SET b.property_id=NULL WHERE p.id IS NULL');
  if (!existingFks.length) await db.query(`ALTER TABLE bookings MODIFY property_id ${propertyId} NULL`);
  const [ownerOrphans] = await db.query('SELECT p.* FROM properties p LEFT JOIN users u ON u.id=p.owner_id WHERE p.owner_id IS NOT NULL AND u.id IS NULL');
  for (const row of ownerOrphans) await archive('properties', row, 'Missing legacy owner reference.');
  await db.query('UPDATE properties p LEFT JOIN users u ON u.id=p.owner_id SET p.owner_id=NULL WHERE u.id IS NULL');
  await db.query('ALTER TABLE audit_logs MODIFY actor_id INT NULL');
  const [actorOrphans] = await db.query('SELECT a.* FROM audit_logs a LEFT JOIN users u ON u.id=a.actor_id WHERE a.actor_id IS NOT NULL AND u.id IS NULL');
  for (const row of actorOrphans) await archive('audit_logs', row, 'Missing legacy actor reference.');
  await db.query('UPDATE audit_logs a LEFT JOIN users u ON u.id=a.actor_id SET a.actor_id=NULL WHERE u.id IS NULL');
  await foreignKey('bookings', 'fk_booking_user', 'FOREIGN KEY(user_id) REFERENCES users(id)');
  await foreignKey('bookings', 'fk_booking_property', 'FOREIGN KEY(property_id) REFERENCES properties(id)');
  await foreignKey('properties', 'fk_property_owner', 'FOREIGN KEY(owner_id) REFERENCES users(id)');
  await foreignKey('audit_logs', 'fk_audit_actor', 'FOREIGN KEY(actor_id) REFERENCES users(id)');
  await db.query('CREATE TABLE IF NOT EXISTS amenities (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100) NOT NULL UNIQUE)');
  await db.query(`CREATE TABLE IF NOT EXISTS property_amenities (property_id ${propertyId} NOT NULL, amenity_id INT NOT NULL, PRIMARY KEY(property_id,amenity_id), FOREIGN KEY(property_id) REFERENCES properties(id) ON DELETE CASCADE, FOREIGN KEY(amenity_id) REFERENCES amenities(id))`);
  for (const name of options.amenities) await db.query('INSERT IGNORE INTO amenities (name) VALUES (?)', [name]);
  const [columns] = await db.query('SHOW COLUMNS FROM properties');
  if (columns.some(c => c.Field === 'amenities')) {
    const [properties] = await db.query('SELECT * FROM properties');
    for (const row of properties) {
      await archive('property_legacy_fields', row, 'Original amenities and unused group inquiry data preserved.');
      let names; try { names = JSON.parse(row.amenities || '[]'); } catch { names = String(row.amenities || '').split(','); }
      if (!Array.isArray(names)) names = [];
      for (const name of names.map(String).map(v => v.trim()).filter(Boolean)) {
        await db.query('INSERT IGNORE INTO amenities (name) VALUES (?)', [name]);
        await db.query('INSERT IGNORE INTO property_amenities (property_id,amenity_id) SELECT ?,id FROM amenities WHERE name=?', [row.id, name]);
      }
    }
    await db.query('ALTER TABLE properties DROP COLUMN amenities');
  }
  if (columns.some(c => c.Field === 'group_inquiries')) await db.query('ALTER TABLE properties DROP COLUMN group_inquiries');
  // Group inquiries belong to the retired prototype. Preserve them, outside the active model.
  const [groupTables] = await db.query("SHOW TABLES LIKE 'group_inquiries'");
  if (groupTables.length) {
    const [groups] = await db.query('SELECT * FROM group_inquiries');
    for (const row of groups) await archive('group_inquiries', row, 'Retired prototype module.', row.inquiry_id);
    await db.query('RENAME TABLE group_inquiries TO legacy_group_inquiries');
  }
  await db.query('CREATE TABLE IF NOT EXISTS user_security (user_id INT PRIMARY KEY, secret VARCHAR(255) NOT NULL, enabled TINYINT(1) NOT NULL DEFAULT 0, last_counter BIGINT NOT NULL DEFAULT -1, FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE)');
  await db.query('CREATE TABLE IF NOT EXISTS contact_messages (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100) NOT NULL, email VARCHAR(100) NOT NULL, subject VARCHAR(100) NOT NULL, message TEXT NOT NULL, status VARCHAR(20) NOT NULL DEFAULT \'open\', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)');
  await db.query(`CREATE TABLE IF NOT EXISTS reviews (id INT AUTO_INCREMENT PRIMARY KEY, user_id INT NOT NULL, property_id ${propertyId} NOT NULL, stars TINYINT NOT NULL, comment TEXT NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE KEY resident_property(user_id,property_id), FOREIGN KEY(user_id) REFERENCES users(id), FOREIGN KEY(property_id) REFERENCES properties(id) ON DELETE CASCADE, CHECK(stars BETWEEN 1 AND 5))`);
  console.log(`Completion migration finished. ${orphans.length} legacy reservations preserved with repaired references.`);
}
main().catch(error => { console.error('Migration failed:', error.code || error.message); process.exitCode = 1; }).finally(() => db.end());
