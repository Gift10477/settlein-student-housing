function allowFields(fields) {
  const allowed = new Set(fields);
  return (req, res, next) => {
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body) ||
        Object.keys(req.body).some((field) => !allowed.has(field))) {
      return res.status(400).json({ error: 'Bad Request', message: 'Body must be an object containing only supported fields.' });
    }
    return next();
  };
}
module.exports = { allowFields };
