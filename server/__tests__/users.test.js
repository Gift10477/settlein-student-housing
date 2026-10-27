const request = require('supertest');
jest.mock('../db', () => ({ query: jest.fn() }));
const { setupApi } = require('../test-support/apiHarness');
let app, key, access;
beforeEach(() => { ({ app, key, access } = setupApi()); });

const userId = '13';

describe('Documented user endpoints', () => {
  // A valid session for a now-missing account still exercises the 404 contract.
  const partnerRequest = (path) => request(app).get(path)
    .set('X-API-Key', key)
    .set('Authorization', `Bearer ${access.issueSession(path.split('/')[4], key)}`);

  it('returns the residence-area response shape', async () => {
    const response = await partnerRequest(`/api/v1/users/${userId}/residence-area`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(expect.objectContaining({
      status_code: 200,
      user_id: expect.any(Number),
      estate_name: expect.any(String),
      nearest_campus: expect.any(String),
      distance_to_campus: expect.any(String),
      cached_at: expect.any(String)
    }));
  });

  it('returns 404 for an unknown residence-area user', async () => {
    const response = await partnerRequest('/api/v1/users/999999999/residence-area');

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message');
  });

  it('returns the lease-timeline response shape for a user with a booking', async () => {
    const response = await partnerRequest(`/api/v1/users/${userId}/lease-timeline`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(expect.objectContaining({
      status_code: 200,
      user_id: expect.any(Number),
      booking_id: expect.any(Number),
      accommodation_name: expect.any(String),
      lease_status: expect.any(String)
    }));
  });

  it('returns 404 for an unknown lease-timeline user', async () => {
    const response = await partnerRequest('/api/v1/users/999999999/lease-timeline');

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message');
  });

  it('returns the public-profile response shape', async () => {
    const response = await partnerRequest(`/api/v1/users/${userId}/public-profile`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(expect.objectContaining({
      status_code: 200,
      user_id: expect.any(Number),
      display_name: expect.any(String),
      university_affiliation: expect.any(String),
      campus_branch: expect.any(String),
      is_verified_student: expect.any(Boolean)
    }));
    expect(response.body).not.toHaveProperty('password_hash');
  });

  it('returns 404 for an unknown public-profile user', async () => {
    const response = await partnerRequest('/api/v1/users/999999999/public-profile');

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message');
  });

  it('returns a validation error when login password is missing', async () => {
    const response = await request(app)
      .post('/api/v1/users/login')
      .set('X-API-Key', key)
      .send({ email: 'week7@example.com' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual(expect.objectContaining({
      error: 'Bad Request',
      status_code: 400,
      message: expect.any(String)
    }));
  });
});
