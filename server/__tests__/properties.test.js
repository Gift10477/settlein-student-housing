const request = require('supertest');
const app = require('../app');

const propertyId = process.env.TEST_PROPERTY_ID || 'prop-002';

function authenticated(path) {
  return request(app).get(path);
}

describe('Documented property endpoints', () => {
  it('returns the study-amenities response shape', async () => {
    const response = await authenticated(`/api/v1/properties/${propertyId}/study-amenities`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(expect.objectContaining({
      status_code: 200,
      accommodation_id: expect.any(String),
      accommodation_name: expect.any(String),
      quiet_hours: expect.objectContaining({
        starts_at: expect.any(String),
        ends_at: expect.any(String),
        policy_enforced: expect.any(Boolean)
      })
    }));
  });

  it('returns 404 for an unknown property', async () => {
    const response = await authenticated('/api/v1/properties/property-does-not-exist/study-amenities');

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message');
  });

  it('rejects an incomplete group inquiry', async () => {
    const response = await request(app)
      .post('/api/v1/properties/group-inquiries')
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toEqual(expect.objectContaining({
      error: 'Bad Request',
      status_code: 400,
      message: expect.any(String)
    }));
  });

  it('rejects an unsupported campus in a group inquiry', async () => {
    const response = await request(app)
      .post('/api/v1/properties/group-inquiries')
      .send({
        group_id: 'week7-group',
        initiator_student_id: 1,
        member_student_ids: [1, 2],
        target_campus: 'Unsupported Campus',
        preferred_room_type: 'shared-apartment',
        max_budget_per_person_kes: 10000,
        move_in_target_date: '2026-10-01'
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message');
  });
});
