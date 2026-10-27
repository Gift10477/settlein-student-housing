const request = require('supertest');

jest.mock('../db', () => ({ query: jest.fn() }));
const { setupApi } = require('../test-support/apiHarness');
let app, key;
beforeEach(() => { ({ app, key } = setupApi()); });

describe('API key authentication', () => {
  it('rejects a request without an API key', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: 'Missing or invalid API key' });
  });

  it('rejects a request with an invalid API key', async () => {
    const response = await request(app)
      .get('/health')
      .set('X-API-Key', 'invalid-key');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: 'Missing or invalid API key' });
  });

  it('allows a request with a valid API key', async () => {
    const response = await request(app)
      .get('/health')
      .set('X-API-Key', key);

    expect(response.status).toBe(200);
  });

  it('returns 401 for a documented property endpoint without a key', async () => {
    const response = await request(app).get('/api/v1/properties/prop-002/study-amenities');
    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: 'Missing or invalid API key' });
  });

  it('returns 200 for a documented property endpoint with a valid key', async () => {
    const response = await request(app).get('/api/v1/properties/prop-002/study-amenities')
      .set('X-API-Key', key);
    expect(response.status).toBe(200);
    expect(response.body.accommodation_id).toBe('prop-002');
  });

  it('returns 429 on the fourth request and permits requests after the window', async () => {
    const now = Date.now();
    const clock = jest.spyOn(Date, 'now').mockReturnValue(now);
    try {
      for (let i = 0; i < 3; i++) {
        expect((await request(app).get('/health').set('X-API-Key', key)).status).toBe(200);
      }
      const blocked = await request(app).get('/health').set('X-API-Key', key);
      expect(blocked.status).toBe(429);
      expect(blocked.headers['retry-after']).toBe('900');
      expect(blocked.body).toEqual({ message: 'Too many requests, please try again later.' });
      clock.mockReturnValue(now + 900000);
      expect((await request(app).get('/health').set('X-API-Key', key)).status).toBe(200);
    } finally { clock.mockRestore(); }
  });
});
