function requireApiKey(req, res, next) {
  const validKeys = (process.env.API_KEYS || '')
    .split(',')
    .map((key) => key.trim())
    .filter(Boolean);
  const key = req.get('X-API-Key');

  if (!key || !validKeys.includes(key)) {
    return res.status(401).json({ message: 'Missing or invalid API key' });
  }

  req.apiKey = key;
  return next();
}

module.exports = { requireApiKey };
