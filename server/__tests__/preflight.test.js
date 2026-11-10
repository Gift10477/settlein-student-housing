jest.mock('dotenv', () => ({ config: jest.fn() }));
const { preflight } = require('../scripts/preflight.cjs');
const previous = { ...process.env };

beforeEach(() => {
  process.env.PARTNER_VERSION = 'v1';
  process.env.SHAMBA_API_URL = 'https://partner.example.test';
  process.env.SHAMBA_API_KEY = 'partner-fixture-key';
  process.env.SETTLEIN_WEB_API_KEY = 'settlein-fixture-key';
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(global, 'fetch').mockImplementation(async url => ({
    ok: true,
    json: async () => url.endsWith('/health') ? { status: 'ok' }
      : url.endsWith('/properties') ? { data: [], count: 0 }
      : { data: [{ crop_name: 'Maize', price_per_kg: 32 }], stale: false },
  }));
});

afterEach(() => {
  process.env = { ...previous };
  jest.restoreAllMocks();
});

test('current Shamba v1 contract passes readiness with fresh prices', async () => {
  await expect(preflight()).resolves.toBeUndefined();
  expect(fetch).toHaveBeenCalledTimes(3);
  expect(fetch.mock.calls[2][1].headers).toEqual({ 'X-API-Key': 'settlein-fixture-key' });
});

test('provisional Shamba v2 is rejected before any request', async () => {
  process.env.PARTNER_VERSION = 'v2';
  await expect(preflight()).rejects.toThrow('PARTNER_VERSION=v1');
  expect(fetch).not.toHaveBeenCalled();
});

test('missing partner key is a configuration failure', async () => {
  delete process.env.SHAMBA_API_KEY;
  await expect(preflight()).rejects.toThrow('SHAMBA_API_KEY');
  expect(fetch).not.toHaveBeenCalled();
});

test('saved prices cannot pass live readiness', async () => {
  const fallback = fetch.getMockImplementation();
  fetch.mockImplementation(async url => url.endsWith('/market-prices')
    ? { ok: true, json: async () => ({ data: [{}], stale: true }) } : fallback(url));
  await expect(preflight()).rejects.toThrow('fresh and non-empty');
});

test('database failures cannot pass readiness', async () => {
  const fallback = fetch.getMockImplementation();
  fetch.mockImplementation(async url => url.endsWith('/properties')
    ? { ok: false, status: 500 } : fallback(url));
  await expect(preflight()).rejects.toThrow('HTTP 500');
});
