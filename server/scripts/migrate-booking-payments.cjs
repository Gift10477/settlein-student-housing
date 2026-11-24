require('dotenv').config();
const db = require('../db');
const fs = require('fs');
const path = require('path');

async function main() {
  // db.js restricts this migration to settlein_se_db.
  const statements = fs.readFileSync(path.join(__dirname, '../database/management.sql'), 'utf8').split(';').filter(s => s.trim());
  for (const sql of statements) await db.query(sql);
  const [receiptColumns] = await db.query('SHOW COLUMNS FROM payments');
  if(receiptColumns.some(c=>c.Field==='method')){console.log('Normalized payment storage already initialized.');return;}
  const [propertyColumns] = await db.query('SHOW COLUMNS FROM properties');
  if (!propertyColumns.some(c => c.Field === 'booking_fee')) await db.query('ALTER TABLE properties ADD COLUMN booking_fee INT NULL');
  const [columns] = await db.query('SHOW COLUMNS FROM bookings');
  const definitions = {
    booking_fee: 'DECIMAL(12,2) NULL',
    payment_status: "VARCHAR(30) DEFAULT 'not_required'",
    payment_deadline: 'VARCHAR(30) NULL', paid_at: 'VARCHAR(30) NULL',
    payment_reference: 'VARCHAR(100) NULL', payment_method: 'VARCHAR(20) NULL',
  };
  for (const [name, definition] of Object.entries(definitions)) {
    if (!columns.some(c => c.Field === name)) await db.query(`ALTER TABLE bookings ADD COLUMN ${name} ${definition}`);
  }
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [pending] = await connection.query("SELECT b.id, b.user_id, p.booking_fee FROM bookings b LEFT JOIN properties p ON p.id=b.property_id WHERE b.status='pending' AND (b.payment_status='not_required' OR b.payment_status IS NULL) FOR UPDATE");
    const deadline = new Date(Date.now() + 24 * 3600000).toISOString();
    for (const booking of pending) {
      const [paid] = await connection.query("SELECT * FROM payments WHERE booking_id = ? AND status = 'paid' ORDER BY id DESC LIMIT 1", [booking.id]);
      await connection.query('UPDATE bookings SET booking_fee=?, payment_status=?, payment_deadline=?, payment_reference=?, payment_method=? WHERE id=?', [Number(booking.booking_fee) > 0 ? Number(booking.booking_fee) : 1000, paid.length ? 'paid' : 'unpaid', deadline, paid[0]?.reference || null, paid.length ? 'manual' : null, booking.id]);
      await connection.query('INSERT INTO audit_logs (actor_id, action, target_id) VALUES (?, ?, ?)', [booking.user_id, 'reservation.payment_migrated', String(booking.id)]);
    }
    await connection.commit();
    console.log(`Booking payments ready. Migrated ${pending.length} pending reservations; unpaid reservations have 24 hours to pay.`);
  } catch (error) { await connection.rollback(); throw error; }
  finally { connection.release(); }
}
main().catch(error => { console.error('Payment migration failed:', error.code || 'UNKNOWN', 'Check database availability and permissions.'); process.exitCode = 1; }).finally(() => db.end());
