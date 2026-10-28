const express = require('express');
const router = express.Router();
const { marketRequest } = require('../integrations/shambaRequest');

router.get('/', async (req, res) => {
  const county = req.query.county;
  if (Object.keys(req.query).some((name) => name !== 'county') ||
      (county !== undefined && (typeof county !== 'string' || !county.trim() || county.length > 100))) {
    return res.status(400).json({ message: 'County must be a non-empty string of at most 100 characters.' });
  }
  const base = process.env.SHAMBA_API_URL;
  if (!base) {
    return res.status(503).json({ message: 'Market prices are not available yet. Please try again later.' });
  }
  try {
    const { url, options } = marketRequest(process.env, county);
    // Current partner contract permits public reads. A key is optional if
    // Team 14 enables X-API-Key later. Confirm currency before the live demo.
    // Never forward redirects
    // with a credential, or log the partner URL/key/response body.
    const response = await fetch(url, options);
    if (!response.ok) {
      console.error('Market price provider returned HTTP', response.status);
      return res.status(502).json({ message: 'Market prices are unavailable right now. Please try again later.' });
    }
    const data = await response.json();
    if (!Array.isArray(data) || data.some((row) => !row || typeof row.crop_name !== 'string' ||
        !row.crop_name.trim() || typeof row.price_per_kg !== 'number' ||
        !Number.isFinite(row.price_per_kg) || row.price_per_kg < 0 ||
        (row.county !== undefined && row.county !== null && typeof row.county !== 'string'))) {
      throw new Error('Invalid market price response');
    }
    return res.json({
      currency: 'KES', source: 'Shamba Direct', fetched_at: new Date().toISOString(),
      prices: data.map((row) => ({ crop_name: row.crop_name.trim(), price_per_kg: row.price_per_kg, county: row.county?.trim() || null })),
    });
  } catch (error) {
    const code = error.cause?.code;
    // Only known network codes are safe to log; arbitrary error messages may
    // include URLs, response data, or credentials.
    const safeCode = ['ECONNREFUSED', 'ENOTFOUND', 'ECONNRESET', 'EAI_AGAIN'].includes(code) ? code : 'REQUEST_FAILED';
    console.error('Market price provider request failed:', safeCode);
    return res.status(502).json({ message: 'Market prices are unavailable right now. Please try again later.' });
  }
});

module.exports = router;
