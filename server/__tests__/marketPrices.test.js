const request = require('supertest');
jest.mock('../db', () => ({ query: jest.fn() }));
const { setupApi } = require('../test-support/apiHarness');
const marketPricesRouter = require('../routes/marketPrices');

let app, key, fetchMock, logger;
const rows = [{ crop_name: 'Tomatoes', price_per_kg: 80, county: 'Nairobi', secret: 'not-public' }];

beforeEach(() => {
  ({ app, key } = setupApi());
  marketPricesRouter._resetLastGoodData();
  process.env.SHAMBA_API_URL = 'https://partner.example.test';
  process.env.SHAMBA_API_KEY = 'partner-test-key';
  process.env.SHAMBA_API_KEY_HEADER = 'X-API-Key';
  process.env.SHAMBA_API_KEY_PREFIX = '';
  process.env.PARTNER_VERSION = 'v1';
  fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({
    ok: true,
    status: 200,
    headers: new Headers(),
    json: async () => rows
  });
  logger = jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
  marketPricesRouter._resetLastGoodData();
  delete process.env.SHAMBA_API_URL;
  delete process.env.SHAMBA_API_KEY;
  delete process.env.SHAMBA_API_KEY_HEADER;
  delete process.env.SHAMBA_API_KEY_PREFIX;
  delete process.env.PARTNER_VERSION;
});

const get = (path = '/api/market-prices') => request(app).get(path).set('X-API-Key', key);

test('v2 integration requests the versioned path and serves fresh normalized prices', async () => {
  process.env.PARTNER_VERSION = 'v2';
  fetchMock.mockResolvedValue({ ok: true, json: async () => ({ data: rows, count: 1 }) });
  const response = await get('/api/market-prices?county=Nairobi');
  expect(response.status).toBe(200);
  expect(response.body.stale).toBe(false);
  expect(response.body.prices).toEqual([{ crop_name: 'Tomatoes', price_per_kg: 80, county: 'Nairobi' }]);
  expect(fetchMock.mock.calls[0][0].pathname).toBe('/api/v2/market-prices');
  expect(fetchMock.mock.calls[0][0].searchParams.get('county')).toBe('Nairobi');
});

test('upstream exception messages cannot disclose secrets in request logs', async () => {
  fetchMock.mockResolvedValue({ ok: true, json: async () => { throw new Error('partner-test-key'); } });
  expect((await get()).status).toBe(502);
  expect(JSON.stringify(logger.mock.calls)).not.toContain('partner-test-key');
});

test('supports a partner-confirmed Bearer scheme without changing code', async () => {
  process.env.SHAMBA_API_KEY_HEADER = 'Authorization';
  process.env.SHAMBA_API_KEY_PREFIX = 'Bearer';
  expect((await get()).status).toBe(200);
  expect(fetchMock.mock.calls[0][1].headers).toEqual({ Authorization: 'Bearer partner-test-key' });
});

test('rejects unsafe auth configuration without leaking it or calling the partner', async () => {
  process.env.SHAMBA_API_KEY_HEADER = 'Bad\r\nHeader';
  expect((await get()).status).toBe(502);
  expect(fetchMock).not.toHaveBeenCalled();
  expect(JSON.stringify(logger.mock.calls)).not.toContain('partner-test-key');
});

test.each(['/api/market-prices', '/api/v1/market-prices'])('%s returns only public fields, KES metadata, and resilience status', async (path) => {
  const response = await get(path);
  expect(response.status).toBe(200);
  expect(response.body).toEqual({
    currency: 'KES',
    source: 'Shamba Direct',
    fetched_at: expect.any(String),
    asof: expect.any(String),
    stale: false,
    prices: [{ crop_name: 'Tomatoes', price_per_kg: 80, county: 'Nairobi' }],
    data: [{ crop_name: 'Tomatoes', price_per_kg: 80, county: 'Nairobi' }]
  });
  expect(fetchMock.mock.calls[0][1].headers).toEqual({ 'X-API-Key': 'partner-test-key' });
  expect(fetchMock.mock.calls[0][1].redirect).toBe('error');
});

test.each(['https://partner.example.test', 'https://partner.example.test/', 'https://partner.example.test/api', 'https://partner.example.test/api/'])('normalizes base URL %s', async (base) => {
  process.env.SHAMBA_API_URL = base;
  await get();
  expect(fetchMock.mock.calls[0][0].toString()).toBe('https://partner.example.test/api/market-prices');
});

test('encodes the optional county filter', async () => {
  await get('/api/market-prices?county=Nairobi%20City');
  expect(fetchMock.mock.calls[0][0].searchParams.get('county')).toBe('Nairobi City');
});

test.each(['', '?county=', '?county[x]=1'])('missing auth or invalid county does not call the provider (%s)', async (query) => {
  const response = query ? await get(`/api/market-prices${query}`) : await request(app).get('/api/market-prices');
  expect(response.status).toBe(query ? 400 : 401);
  expect(fetchMock).not.toHaveBeenCalled();
});

test('missing partner URL returns 503 without a call', async () => {
  delete process.env.SHAMBA_API_URL;
  expect((await get()).status).toBe(503);
  expect(fetchMock).not.toHaveBeenCalled();
});

test('public partner reads work without a partner key', async () => {
  delete process.env.SHAMBA_API_KEY;
  expect((await get()).status).toBe(200);
  expect(fetchMock.mock.calls[0][1].headers).toEqual({});
});

test.each([null, undefined])('handles optional county %s', async (county) => {
  fetchMock.mockResolvedValue({ ok: true, status: 200, headers: new Headers(), json: async () => [{ crop_name: 'Rice', price_per_kg: 90, county }] });
  expect((await get()).body.prices[0].county).toBeNull();
});

test.each([401, 429, 500])('partner HTTP %s without cache returns a friendly 502 without leaking its body', async (status) => {
  fetchMock.mockResolvedValue({ ok: false, status, headers: new Headers(), json: async () => ({ key: 'private-provider-data' }) });
  const response = await get();
  expect(response.status).toBe(502);
  expect(JSON.stringify(response.body)).not.toMatch(/partner-test-key|private-provider-data/);
});

test.each([{}, [{ crop_name: 'Rice', price_per_kg: '90', county: 'Nairobi' }], [{ crop_name: 'Rice', price_per_kg: -2, county: 'Nairobi' }]])('rejects malformed provider data %j', async (data) => {
  fetchMock.mockResolvedValue({ ok: true, status: 200, headers: new Headers(), json: async () => data });
  expect((await get()).status).toBe(502);
});

test('empty market data is a valid empty result', async () => {
  fetchMock.mockResolvedValue({ ok: true, status: 200, headers: new Headers(), json: async () => [] });
  expect((await get()).body.prices).toEqual([]);
});

test('partner down produces a safe diagnostic and recovers on the next request', async () => {
  marketPricesRouter._resetLastGoodData();
  const outage = Object.assign(new Error('unsafe partner-test-key'), { cause: { code: 'ECONNREFUSED' } });
  // An outage must outlast the initial call and both configured retries.
  fetchMock.mockRejectedValueOnce(outage).mockRejectedValueOnce(outage).mockRejectedValueOnce(outage);
  expect((await get()).status).toBe(502);
  expect(logger).toHaveBeenCalledWith('Market price provider request failed:', 'ECONNREFUSED');
  expect(JSON.stringify(logger.mock.calls)).not.toContain('partner-test-key');
  expect((await get()).status).toBe(200);
});

test('candidate v2 migration and rollback return fresh normalized prices', async () => {
  try {
    for (const version of ['v1', 'v2', 'v1', 'v2']) {
      process.env.PARTNER_VERSION = version;
      fetchMock.mockResolvedValue({ ok: true, status: 200, headers: new Headers(),
        json: async () => version === 'v2' ? { data: rows, count: rows.length } : rows });
      const res = await get();
      expect(res.status).toBe(200);
      expect(res.body.stale).toBe(false);
      expect(res.body.prices).toEqual([{ crop_name: 'Tomatoes', price_per_kg: 80, county: 'Nairobi' }]);
      expect(fetchMock.mock.calls.at(-1)[0].pathname).toBe(version === 'v2' ? '/api/v2/market-prices' : '/api/market-prices');
    }
  } finally { delete process.env.PARTNER_VERSION; }
});

test('Week 11 Fallback: returns cached lastGoodData with stale: true when upstream fails after prior success', async () => {
  // First call succeeds and caches lastGoodData
  const initial = await get();
  expect(initial.status).toBe(200);
  expect(initial.body.stale).toBe(false);
  expect(initial.body.data.length).toBeGreaterThan(0);

  // Second call encounters upstream failure
  fetchMock.mockResolvedValue({ ok: false, status: 503, headers: new Headers() });
  const fallback = await get();
  expect(fallback.status).toBe(200);
  expect(fallback.body.stale).toBe(true);
  expect(fallback.body.asof).toBe(initial.body.asof);
  expect(fallback.body.data).toEqual(initial.body.data);
});
