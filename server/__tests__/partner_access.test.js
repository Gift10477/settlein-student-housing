const request = require('supertest');
const app = require('../app');

describe('Week 7 partner access', () => {
  it('allows public partner reads', async () => {
    const response = await request(app)
      .get('/api/v1/users/999999999/public-profile');

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message');
  });

  it('validates an unauthenticated group inquiry request', async () => {
    const response = await request(app)
      .post('/api/v1/properties/group-inquiries')
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('status_code', 400);
  });
});
