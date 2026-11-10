const request = require('supertest');
jest.mock('../db', () => ({ query: jest.fn() }));
const { setupApi } = require('../test-support/apiHarness');
let app, key, db;
beforeEach(() => {
  ({ app, key } = setupApi());
  db = require('../db');
  db.query.mockImplementation(async sql => sql.includes('SELECT * FROM properties') ? [[{ id: 'lab13', title: 'Lab housing', price: '12000', campus: 'strathmore', amenities: 'Wi-Fi', verified: 1 }]] : [[]]);
});
const get = path => request(app).get(path).set('X-API-Key', key);
test('old URLs retain the exact pre-change response and announce migration', async () => {
  for (const path of ['/api/properties', '/api/v1/properties']) {
    const res = await get(path);
    expect(res.status).toBe(200);
    expect(res.body).toEqual(require('../test-support/lab13/v1_before.json'));
    expect(res.headers.deprecation).toBe('true');
    expect(res.headers.sunset).toBe('Fri, 13 Nov 2026 00:00:00 GMT');
    expect(res.headers.link).toContain('rel="successor-version"');
  }
});
test('v2 wraps list and preserves SQL filters', async () => {
  const res = await get('/api/v2/properties?campus=strathmore');
  expect(res.body).toEqual({ data: require('../test-support/lab13/v1_before.json'), count: 1 });
  expect(db.query).toHaveBeenCalledWith(expect.stringContaining('AND campus = ?'), ['strathmore']);
  expect(res.headers.deprecation).toBeUndefined();
});
test('errors and unknown routes are not wrapped or deprecated', async () => {
  db.query.mockResolvedValue([[]]);
  for (const prefix of ['/api/properties', '/api/v1/properties', '/api/v2/properties']) {
    const res = await get(`${prefix}/missing`);
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Property not found' });
    expect(res.headers.deprecation).toBeUndefined();
  }
  expect((await get('/api/v2/properties')).body).toEqual({ data: [], count: 0 });
  expect((await get('/nope')).headers.deprecation).toBeUndefined();
});
test('both versions share authentication and quota', async () => {
  expect((await request(app).get('/api/v2/properties')).status).toBe(401);
  for (let i = 0; i < 100; i++) expect((await get(i % 2 ? '/api/v2/properties' : '/api/properties')).status).toBe(200);
  expect((await get('/api/v2/properties')).status).toBe(429);
});
test('stats retain version prefixes', async () => {
  for (const path of ['/api/properties', '/api/v1/properties', '/api/v2/properties']) await get(path);
  const res = await get('/stats');
  for (const path of ['/api/properties', '/api/v1/properties', '/api/v2/properties']) expect(res.body.routes[`GET ${path}/`].count).toBe(1);
});
