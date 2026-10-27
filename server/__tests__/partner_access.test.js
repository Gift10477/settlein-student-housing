const request = require('supertest');
jest.mock('../db', () => ({ query: jest.fn() }));
const { setupApi } = require('../test-support/apiHarness');
let app, key, access;
beforeEach(() => { ({ app, key, access } = setupApi()); });

describe('Week 7 partner access', () => {
  it('returns 404 for an authenticated owner whose profile no longer exists', async () => {
    const response = await request(app)
      .get('/api/v1/users/999999999/public-profile')
      .set('X-API-Key', key)
      .set('Authorization', `Bearer ${access.issueSession('999999999', key)}`);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message');
  });

  it('validates a group inquiry with a valid API key', async () => {
    const response = await request(app)
      .post('/api/v1/properties/group-inquiries')
      .set('X-API-Key', key)
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('status_code', 400);
  });
});
