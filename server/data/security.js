const router = require('express').Router();
const db = require('../db');
const { requireUser, revokeUserSessions } = require('../middleware/session');
const { verifyPassword } = require('../services/passwords');
const totp = require('../services/totp');
const audit = require('../services/audit');
const { rateLimit } = require('../middleware/security');
router.use(requireUser, rateLimit());
router.get('/', async (req, res, next) => {
  try { const [rows] = await db.query('SELECT enabled FROM user_security WHERE user_id=?', [req.userId]); res.json({ enabled: Boolean(rows[0]?.enabled) }); } catch (error) { next(error); }
});
// Setup and disable both require the password, even with an authenticated session.
router.post('/:action', async (req, res, next) => {
  if (!['setup', 'confirm', 'disable'].includes(req.params.action)) return res.status(404).json({ error: 'Unknown security action.' });
  let connection;
  try {
    connection = await db.getConnection(); await connection.beginTransaction();
    const [users] = await connection.query('SELECT email,password_hash FROM users WHERE id=? FOR UPDATE', [req.userId]);
    if (typeof req.body.password !== 'string' || req.body.password.length>128 || !await verifyPassword(req.body.password, users[0]?.password_hash)) { await connection.rollback(); return res.status(401).json({ error: 'Enter your current password.' }); }
    const [rows] = await connection.query('SELECT * FROM user_security WHERE user_id=? FOR UPDATE', [req.userId]);
    const row = rows[0];
    if (req.params.action === 'setup') {
      if (row?.enabled) { await connection.rollback(); return res.status(409).json({ error: 'Two-factor authentication is already enabled.' }); }
      const secret = totp.newSecret();
      await connection.query('INSERT INTO user_security (user_id,secret,enabled,last_counter) VALUES (?,?,0,-1) ON DUPLICATE KEY UPDATE secret=VALUES(secret),last_counter=-1', [req.userId, totp.encrypt(secret)]);
      await audit(connection, req.userId, 'security.setup_started', req.userId); await connection.commit();
      return res.json({ secret, uri: `otpauth://totp/SettleIn:${encodeURIComponent(users[0].email)}?secret=${secret}&issuer=SettleIn&algorithm=SHA1&digits=6&period=30` });
    }
    const counter = row && totp.verify(totp.decrypt(row.secret), req.body.code, row.last_counter);
    if (counter == null) { await connection.rollback(); return res.status(400).json({ error: 'Enter a fresh six-digit authenticator code.' }); }
    const enabled = req.params.action === 'confirm';
    await connection.query('UPDATE user_security SET enabled=?,last_counter=? WHERE user_id=?', [enabled, counter, req.userId]);
    await audit(connection, req.userId, enabled ? 'security.enabled' : 'security.disabled', req.userId);
    await connection.commit(); revokeUserSessions(req.userId);
    res.json({ message: 'Security settings updated. Please sign in again.' });
  } catch (error) { if (connection) await connection.rollback(); next(error); } finally { if (connection) connection.release(); }
});
module.exports = router;
