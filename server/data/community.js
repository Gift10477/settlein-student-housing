const router = require('express').Router();
const db = require('../db');
const { requireUser, requireAdmin } = require('../middleware/session');
const { rateLimit } = require('../middleware/security');
const audit = require('../services/audit');
router.post('/contact', rateLimit(5), async (req, res, next) => {
  const { name, email, subject, message } = req.body;
  if ([name, email, subject, message].some(v => typeof v !== 'string' || !v.trim()) || name.length > 100 || email.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || subject.length > 100 || message.length > 5000) return res.status(400).json({ error: 'Enter your name, valid email, subject and a message up to 5,000 characters.' });
  let connection;
  try {
    connection = await db.getConnection(); await connection.beginTransaction();
    const [result] = await connection.query('INSERT INTO contact_messages (name,email,subject,message) VALUES (?,?,?,?)', [name.trim(), email.trim(), subject.trim(), message.trim()]);
    await audit(connection, null, 'contact.received', result.insertId); await connection.commit();
    res.status(201).json({ message: 'Your message has been saved for the support team.', id: result.insertId });
  } catch (error) { if (connection) await connection.rollback(); next(error); } finally { if (connection) connection.release(); }
});
router.get('/messages', requireAdmin, async (req, res, next) => {
  try { const [rows] = await db.query('SELECT * FROM contact_messages ORDER BY id DESC'); res.json(rows); } catch (error) { next(error); }
});
router.patch('/messages/:id', requireAdmin, async (req, res, next) => {
  if (!['open', 'resolved'].includes(req.body.status)) return res.status(400).json({ error: 'Choose open or resolved.' });
  let connection;
  try {
    connection = await db.getConnection(); await connection.beginTransaction();
    const [result] = await connection.query('UPDATE contact_messages SET status=? WHERE id=?', [req.body.status, req.params.id]);
    if (!result.affectedRows) { await connection.rollback(); return res.status(404).json({ error: 'Message not found.' }); }
    await audit(connection, req.userId, 'contact.' + req.body.status, req.params.id); await connection.commit(); res.json({ message: 'Support status updated.' });
  } catch (error) { if (connection) await connection.rollback(); next(error); } finally { if (connection) connection.release(); }
});
router.get('/reviews/:propertyId', async (req, res, next) => {
  try { const [rows] = await db.query('SELECT r.id,r.stars,r.comment,r.created_at,u.name FROM reviews r JOIN users u ON u.id=r.user_id JOIN properties p ON p.id=r.property_id WHERE p.id=? AND p.verified=1 ORDER BY r.id DESC', [req.params.propertyId]); res.json(rows); } catch (error) { next(error); }
});
router.post('/reviews/:propertyId', requireUser, rateLimit(10), async (req, res, next) => {
  const { stars, comment } = req.body;
  if (!Number.isInteger(stars) || stars < 1 || stars > 5 || typeof comment !== 'string' || !comment.trim() || comment.length > 2000) return res.status(400).json({ error: 'Choose 1–5 stars and enter a review up to 2,000 characters.' });
  let connection;
  try {
    connection = await db.getConnection(); await connection.beginTransaction();
    const [bookings] = await connection.query("SELECT b.id FROM bookings b JOIN properties p ON p.id=b.property_id WHERE b.user_id=? AND p.id=? AND p.verified=1 AND b.status IN ('approved','active') LIMIT 1", [req.userId, req.params.propertyId]);
    if (!bookings.length) { await connection.rollback(); return res.status(403).json({ error: 'Reviews are available to residents with an approved reservation.' }); }
    await connection.query('INSERT INTO reviews (user_id,property_id,stars,comment) VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE stars=VALUES(stars),comment=VALUES(comment),created_at=CURRENT_TIMESTAMP', [req.userId, req.params.propertyId, stars, comment.trim()]);
    await audit(connection, req.userId, 'review.saved', req.params.propertyId); await connection.commit(); res.status(201).json({ message: 'Review saved.' });
  } catch (error) { if (connection) await connection.rollback(); next(error); } finally { if (connection) connection.release(); }
});
module.exports = router;
