const request = require('supertest');

process.env.API_KEYS = 'settlein_dev_key_123,settlein_ring_partner_key_456';
const app = require('../app');

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
      .set('X-API-Key', 'settlein_dev_key_123');

    expect(response.status).toBe(200);
  });
});
