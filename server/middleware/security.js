const buckets = new Map();
function rateLimit(limit = 15, windowMs = 15 * 60 * 1000) {
  return (req, res, next) => {
    if (process.env.NODE_ENV === 'test') return next();
    const now = Date.now();
    for (const [key, entry] of buckets) if (entry.until <= now) buckets.delete(key);
    const key = `${req.ip}:${req.baseUrl}:${req.path}`;
    const entry = buckets.get(key) || { count: 0, until: now + windowMs };
    buckets.set(key, entry);
    if (++entry.count > limit) {
      res.set('Retry-After', String(Math.ceil((entry.until - now) / 1000)));
      return res.status(429).json({ error: 'Too many attempts. Please wait before trying again.' });
    }
    next();
  };
}
function headers(req, res, next) {
  res.set({ 'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY', 'Referrer-Policy': 'no-referrer', 'Permissions-Policy': 'camera=(), microphone=(), geolocation=()' });
  if (process.env.NODE_ENV === 'production') res.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
}
module.exports = { rateLimit, headers };
