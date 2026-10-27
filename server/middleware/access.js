const crypto = require('crypto');

// Opaque sessions are hashed in memory, expire after one hour, and are bound to
// the API consumer that performed login. Restarting the server revokes them.
const sessions = new Map();
const digest = (token) => crypto.createHash('sha256').update(token).digest('hex');
function issueSession(userId, apiKey) {
  const now = Date.now();
  for (const [key, session] of sessions) {
    if (session.expiresAt <= now) sessions.delete(key);
  }
  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(digest(token), { userId: String(userId), apiKey, expiresAt: now + 3600000 });
  return token;
}
function sessionUser(req) {
  const match = /^Bearer ([a-f0-9]{64})$/.exec(req.get('Authorization') || '');
  const session = match && sessions.get(digest(match[1]));
  return session && session.expiresAt > Date.now() && session.apiKey === req.apiKey
    ? session.userId : null;
}
function requireUser(req, res, next) {
  req.userId = sessionUser(req);
  if (!req.userId) return res.status(401).json({ error: 'User login required' });
  return next();
}
function requireOwner(getId) {
  return (req, res, next) => {
    const userId = sessionUser(req);
    if (!userId) return res.status(401).json({ error: 'User login required' });
    if (String(getId(req)) !== userId) return res.status(403).json({ error: 'Forbidden' });
    return next();
  };
}
function revokeUserSessions(userId) {
  for (const [key, session] of sessions) {
    if (session.userId === String(userId)) sessions.delete(key);
  }
}
module.exports = { issueSession, requireUser, requireOwner, revokeUserSessions };
