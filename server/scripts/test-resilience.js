/**
 * test-resilience.js — Verification of Week 11 Resilience Behaviors
 *
 * Verifies all 4 partner modes:
 *   1. 'ok':    Live data returned immediately with stale: false
 *   2. 'flaky': Transient 503 failures retried with backoff; live data returned seamlessly with stale: false
 *   3. 'slow':  Delays trigger 1500ms timeout per attempt; falls back to cached data with stale: true
 *   4. 'error': Persistent 500 errors exhaust retries; falls back to cached data with stale: true (or 502 if empty)
 */

const { setMode, getMode } = require('../flaky-partner');
const marketPricesRouter = require('../routes/marketPrices');

process.env.SHAMBA_API_URL = 'http://127.0.0.1:5001';
delete process.env.SHAMBA_API_KEY;

const mockPrices = [
  { crop_name: 'Tomatoes', price_per_kg: 80, county: 'Nairobi' },
  { crop_name: 'Potatoes', price_per_kg: 50, county: 'Nakuru' },
  { crop_name: 'Sukuma Wiki', price_per_kg: 30, county: 'Kiambu' },
  { crop_name: 'Cabbage', price_per_kg: 40, county: 'Nairobi' },
  { crop_name: 'Onions', price_per_kg: 90, county: 'Nairobi' }
];

let flakyCallCount = 0;

// Set up simulated in-memory partner dispatcher for global fetch
const originalFetch = global.fetch;
global.fetch = async (url, options = {}) => {
  const urlStr = url.toString();
  if (urlStr.includes('5001') || urlStr.includes('market-prices')) {
    const mode = getMode();

    if (mode === 'ok') {
      return new Response(JSON.stringify(mockPrices), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (mode === 'flaky') {
      flakyCallCount++;
      if (flakyCallCount % 3 !== 0) {
        console.log(`  -> [Flaky Partner] Simulated request #${flakyCallCount} (2/3 fail): Returning HTTP 503`);
        return new Response(JSON.stringify({ error: 'Service Unavailable (Flaky Stand-in)' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        });
      } else {
        console.log(`  -> [Flaky Partner] Simulated request #${flakyCallCount} (3rd attempt): Returning HTTP 200`);
        return new Response(JSON.stringify(mockPrices), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    if (mode === 'slow') {
      console.log(`  -> [Slow Partner] Simulating 10,000ms delay (timeout at 1500ms)...`);
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          resolve(new Response(JSON.stringify(mockPrices), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          }));
        }, 10000);

        if (options.signal) {
          options.signal.addEventListener('abort', () => {
            clearTimeout(timer);
            const err = new Error('The operation was aborted due to timeout');
            err.name = 'TimeoutError';
            reject(err);
          }, { once: true });
        }
      });
    }

    if (mode === 'error') {
      console.log(`  -> [Error Partner] Returning HTTP 500`);
      return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  return originalFetch(url, options);
};

// Dispatch an Express route request in-process
function invokeMarketPricesRoute(query = {}) {
  return new Promise((resolve, reject) => {
    const req = {
      method: 'GET',
      url: '/',
      query,
      originalUrl: '/api/market-prices',
      headers: {}
    };
    const res = {
      statusCode: 200,
      headers: {},
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(body) {
        resolve({ status: this.statusCode, body });
      }
    };
    marketPricesRouter(req, res, (err) => {
      if (err) reject(err);
      else reject(new Error('Route did not send a response'));
    });
  });
}

async function run() {
  console.log('====================================================');
  console.log('    WEEK 11 RESILIENCE VERIFICATION SUITE');
  console.log('====================================================\n');

  // TEST 1: 'ok' Mode
  console.log('--- TEST 1: Mode \'ok\' (Healthy upstream partner) ---');
  setMode('ok');
  marketPricesRouter._resetLastGoodData();

  const start1 = Date.now();
  const okRes = await invokeMarketPricesRoute();
  const dur1 = Date.now() - start1;

  console.log(`Status: HTTP ${okRes.status} in ${dur1}ms`);
  console.log(`Body: stale=${okRes.body.stale}, count=${okRes.body.data?.length}, asof=${okRes.body.asof}`);
  if (okRes.status !== 200 || okRes.body.stale !== false || !okRes.body.data?.length) {
    throw new Error('Test 1 failed!');
  }
  console.log('>>> TEST 1 PASSED: Live market prices returned with stale: false\n');

  // TEST 2: 'flaky' Mode
  console.log('--- TEST 2: Mode \'flaky\' (Fails 2/3 times with 503, succeeds on 3rd attempt) ---');
  setMode('flaky');
  flakyCallCount = 0;

  const start2 = Date.now();
  const flakyRes = await invokeMarketPricesRoute();
  const dur2 = Date.now() - start2;

  console.log(`Status: HTTP ${flakyRes.status} in ${dur2}ms`);
  console.log(`Body: stale=${flakyRes.body.stale}, count=${flakyRes.body.data?.length}, asof=${flakyRes.body.asof}`);
  if (flakyRes.status !== 200 || flakyRes.body.stale !== false) {
    throw new Error('Test 2 failed!');
  }
  console.log('>>> TEST 2 PASSED: Automatic retries with exponential backoff succeeded transparently to the user\n');

  // TEST 3: 'slow' Mode
  console.log('--- TEST 3: Mode \'slow\' (10s delay exceeds 1500ms timeout per attempt) ---');
  setMode('slow');

  const start3 = Date.now();
  const slowRes = await invokeMarketPricesRoute();
  const dur3 = Date.now() - start3;

  console.log(`Status: HTTP ${slowRes.status} in ${dur3}ms`);
  console.log(`Body: stale=${slowRes.body.stale}, count=${slowRes.body.data?.length}, asof=${slowRes.body.asof}`);
  if (slowRes.status !== 200 || slowRes.body.stale !== true) {
    throw new Error('Test 3 failed!');
  }
  console.log(`Duration was ${dur3}ms (3 attempts * 1500ms + 600ms backoff ~5100ms)`);
  console.log('>>> TEST 3 PASSED: Request timed out and cleanly served lastGoodData with stale: true\n');

  // TEST 4: 'error' Mode
  console.log('--- TEST 4: Mode \'error\' (Persistent HTTP 500 error) ---');
  setMode('error');

  // 4a. With cached lastGoodData
  const start4a = Date.now();
  const errWithCache = await invokeMarketPricesRoute();
  const dur4a = Date.now() - start4a;

  console.log(`With cache: HTTP ${errWithCache.status} in ${dur4a}ms, stale=${errWithCache.body.stale}`);
  if (errWithCache.status !== 200 || errWithCache.body.stale !== true) {
    throw new Error('Test 4a failed!');
  }
  console.log('>>> TEST 4a PASSED: Fallback to cached data with stale: true when upstream fails\n');

  // 4b. Without cached data (cold start)
  marketPricesRouter._resetLastGoodData();
  const start4b = Date.now();
  const errNoCache = await invokeMarketPricesRoute();
  const dur4b = Date.now() - start4b;

  console.log(`Without cache: HTTP ${errNoCache.status} in ${dur4b}ms, message="${errNoCache.body.message}"`);
  if (errNoCache.status !== 502) {
    throw new Error('Test 4b failed!');
  }
  console.log('>>> TEST 4b PASSED: Returns clean 502 Bad Gateway when no fallback data exists\n');

  console.log('====================================================');
  console.log('   ALL 4 MODES VERIFIED AND PASSING SUCCESSFULLY!');
  console.log('====================================================');
}

run().catch((err) => {
  console.error('\n*** TEST FAILED ***\n', err);
  process.exit(1);
});
