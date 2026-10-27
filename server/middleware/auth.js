const crypto = require('crypto');
const compromisedHashes = new Set(require('../compromised-key-hashes.json'));

function requireApiKey(req, res, next) {
  const validKeys = (process.env.API_KEYS || '')
    .split(',')
    .map((key) => key.trim())
    .filter(Boolean);
  const key = req.get('X-API-Key');

  if (!key || !validKeys.includes(key) ||
      compromisedHashes.has(crypto.createHash('sha256').update(key).digest('hex'))) {
    return res.status(401).json({ message: 'Missing or invalid API key' });
  }

  req.apiKey = key;
  return next();
}

module.exports = { requireApiKey };
