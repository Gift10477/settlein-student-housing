const { versions, partnerVersion } = require('../partner');
const { marketRequest } = require('../integrations/shambaRequest');
const rows = [{ crop_name: 'Tomatoes', price_per_kg: 80, county: 'Nairobi' }];
test('candidate v2 and v1 normalize to identical internal data', () => {
  expect(versions.v1.parse(rows)).toEqual(versions.v2.parse({ data: rows, count: 1 }));
});
test('wrong shapes and versions fail explicitly', () => {
  expect(() => versions.v1.parse({ data: rows })).toThrow();
  expect(() => versions.v2.parse(rows)).toThrow('unexpected v2 shape');
  expect(() => versions.v2.parse({ data: rows, count: 2 })).toThrow();
  expect(() => partnerVersion({ PARTNER_VERSION: 'v3' })).toThrow();
});
test('switch and rollback preserve county query', () => {
  for (const version of ['v1', 'v2', 'v1']) {
    const { url } = marketRequest({ SHAMBA_API_URL: 'https://partner.example.test/api', PARTNER_VERSION: version }, 'Nairobi');
    expect(url.pathname).toBe(version === 'v2' ? '/api/v2/market-prices' : '/api/market-prices');
    expect(url.searchParams.get('county')).toBe('Nairobi');
  }
});
