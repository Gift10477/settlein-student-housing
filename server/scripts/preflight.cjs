// Run with npm run preflight after starting the API. Never print credentials.
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env'), quiet: true });

async function preflight() {
  if (process.env.PARTNER_VERSION !== 'v2') {
    throw new Error('Set PARTNER_VERSION=v2 after confirming the partner v2 contract.');
  }
  if (!process.env.SHAMBA_API_URL) throw new Error('Configure SHAMBA_API_URL.');
  const key = process.env.SETTLEIN_WEB_API_KEY || process.env.API_KEYS?.split(',')[0]?.trim();
  if (!key) throw new Error('Configure an accepted API key.');
  const base = `http://127.0.0.1:${process.env.PORT || 5000}`;
  for (const route of ['/health', '/api/v2/properties', '/api/market-prices']) {
    const response = await fetch(`${base}${route}`, {
      headers: { 'X-API-Key': key },
      signal: AbortSignal.timeout(15000),
      redirect: 'error',
    });
    if (!response.ok) throw new Error(`${route} returned HTTP ${response.status}.`);
    const body = await response.json();
    if (route === '/health' && body.status !== 'ok') throw new Error('Unexpected health response.');
    if (route === '/api/v2/properties' && (!Array.isArray(body.data) || body.count !== body.data.length)) {
      throw new Error('Unexpected property v2 response.');
    }
    if (route === '/api/market-prices' && (body.stale !== false || !Array.isArray(body.data) || !body.data.length)) {
      throw new Error('Partner prices must be fresh and non-empty; cached data does not pass.');
    }
    console.log(`PASS ${route}`);
  }
}

if (require.main === module) preflight().catch(error => {
  // Only our own validation errors are safe to display; fetch errors can include URLs.
  console.error(error instanceof TypeError || error.name === 'TimeoutError'
    ? 'Pre-flight connection failed. Check that the API and partner are running.'
    : error.message);
  process.exitCode = 1;
});

module.exports = { preflight };
