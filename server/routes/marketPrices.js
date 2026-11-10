const { partnerVersion } = require('../partner');
const express = require('express');
const router = express.Router();
const { marketRequest } = require('../integrations/shambaRequest');
const { fetchWithRetry } = require('../resilientFetch');

// In-memory cache for Week 11 Resilience fallback
let lastGoodData = null;

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

    // Call upstream partner via resilientFetch with 1500ms timeout and up to 2 retries
    const response = await fetchWithRetry(url, options, { timeoutMs: 1500, maxRetries: 2 });
    if (!response.ok) {
      console.error('Market price provider returned HTTP', response.status);
      throw new Error(`Partner HTTP ${response.status}`);
    }
    const data = await response.json();
    const formattedPrices = partnerVersion().parse(data);

    const nowIso = new Date().toISOString();
    lastGoodData = {
      data: formattedPrices,
      asof: nowIso
    };

    return res.json({
      data: lastGoodData.data,
      prices: lastGoodData.data,
      stale: false,
      asof: lastGoodData.asof,
      fetched_at: lastGoodData.asof,
      currency: 'KES',
      source: 'Shamba Direct'
    });
  } catch (error) {
    const code = error.cause?.code || error.name;
    const safeCode = ['ECONNREFUSED', 'ENOTFOUND', 'ECONNRESET', 'EAI_AGAIN', 'TimeoutError', 'AbortError'].includes(code)
      ? code
      : 'REQUEST_FAILED';
    console.error('Market price provider request failed:', safeCode);

    // Fallback: If lastGoodData exists, serve stale cached data
    if (lastGoodData) {
      console.warn(`[marketPrices] Upstream failed (${safeCode}); returning stale cached data from ${lastGoodData.asof}`);
      return res.json({
        data: lastGoodData.data,
        prices: lastGoodData.data,
        stale: true,
        asof: lastGoodData.asof,
        fetched_at: lastGoodData.asof,
        currency: 'KES',
        source: 'Shamba Direct'
      });
    }

    return res.status(502).json({ message: 'Market prices are unavailable right now. Please try again later.' });
  }
});

// Helper for test suites
router._resetLastGoodData = () => {
  lastGoodData = null;
};
router._getLastGoodData = () => lastGoodData;

module.exports = router;
