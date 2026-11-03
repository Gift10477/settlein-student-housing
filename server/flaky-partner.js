/**
 * flaky-partner.js — Stand-in Upstream Partner Server (Shamba Direct Simulator)
 *
 * Simulates a partner API under various failure conditions for Week 11 testing:
 *   - 'ok':    Responds immediately with standard market price data (HTTP 200).
 *   - 'slow':  Delays response by 10,000 ms to test client timeout enforcement.
 *   - 'flaky': Fails 2 out of 3 requests with HTTP 503, then succeeds on the 3rd.
 *   - 'error': Always fails with HTTP 500 Internal Server Error.
 *
 * Switch modes via: GET /_mode/:m (e.g. /_mode/flaky)
 * Check mode via:   GET /_mode
 * Endpoint:         GET /market-prices and GET /api/market-prices
 */

const express = require('express');
const app = express();

const PORT = process.env.PARTNER_PORT || 5001;

let currentMode = 'ok';
let flakyCount = 0;

const mockPrices = [
  { crop_name: 'Tomatoes', price_per_kg: 80, county: 'Nairobi' },
  { crop_name: 'Potatoes', price_per_kg: 50, county: 'Nakuru' },
  { crop_name: 'Sukuma Wiki', price_per_kg: 30, county: 'Kiambu' },
  { crop_name: 'Cabbage', price_per_kg: 40, county: 'Nairobi' },
  { crop_name: 'Onions', price_per_kg: 90, county: 'Nairobi' },
  { crop_name: 'Maize', price_per_kg: 45, county: 'Uasin Gishu' },
  { crop_name: 'Beans', price_per_kg: 120, county: 'Machakos' },
  { crop_name: 'Carrots', price_per_kg: 60, county: 'Nyandarua' }
];

app.use(express.json());

// Mode switching routes
app.get('/_mode/:m', (req, res) => {
  const mode = req.params.m.toLowerCase();
  if (!['ok', 'slow', 'flaky', 'error'].includes(mode)) {
    return res.status(400).json({
      error: `Invalid mode '${mode}'. Valid modes: ok, slow, flaky, error`
    });
  }
  currentMode = mode;
  flakyCount = 0; // Reset counter on mode change
  console.log(`[flaky-partner] Mode switched to '${currentMode}'`);
  return res.json({ mode: currentMode, message: `Partner mode set to '${currentMode}'` });
});

app.get('/_mode', (req, res) => {
  return res.json({ mode: currentMode, flakyCount });
});

// Partner market prices handler
function handleMarketPrices(req, res) {
  const county = req.query.county;
  const filtered = county
    ? mockPrices.filter((p) => !p.county || p.county.toLowerCase() === county.toLowerCase().trim())
    : mockPrices;

  console.log(`[flaky-partner] Received GET ${req.originalUrl} | Mode: '${currentMode}'`);

  switch (currentMode) {
    case 'slow':
      console.log(`[flaky-partner] [slow] Delaying response by 10,000 ms...`);
      setTimeout(() => {
        if (!res.headersSent) {
          console.log(`[flaky-partner] [slow] Responding with 200 after delay`);
          res.json(filtered);
        }
      }, 10000);
      break;

    case 'flaky':
      flakyCount++;
      if (flakyCount % 3 !== 0) {
        console.log(`[flaky-partner] [flaky] Request #${flakyCount} (fails 2/3): Responding HTTP 503`);
        return res.status(503).json({
          error: 'Service Unavailable',
          message: `Flaky stand-in transient failure (${flakyCount % 3}/3)`,
          attempt: flakyCount
        });
      } else {
        console.log(`[flaky-partner] [flaky] Request #${flakyCount} (succeeds 3rd attempt): Responding HTTP 200`);
        return res.json(filtered);
      }

    case 'error':
      console.log(`[flaky-partner] [error] Responding HTTP 500`);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Stand-in partner simulated failure'
      });

    case 'ok':
    default:
      console.log(`[flaky-partner] [ok] Responding HTTP 200 immediately`);
      return res.json(filtered);
  }
}

// Expose both /market-prices and /api/market-prices
app.get('/market-prices', handleMarketPrices);
app.get('/api/market-prices', handleMarketPrices);

function setMode(mode) {
  if (['ok', 'slow', 'flaky', 'error'].includes(mode)) {
    currentMode = mode;
    flakyCount = 0;
  }
}

function getMode() {
  return currentMode;
}

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`[flaky-partner] Server running at http://127.0.0.1:${PORT}`);
    console.log(`[flaky-partner] Active mode: '${currentMode}'`);
    console.log(`[flaky-partner] Switch mode via GET http://127.0.0.1:${PORT}/_mode/:m ('ok'|'slow'|'flaky'|'error')`);
  });
}

module.exports = { app, setMode, getMode };

