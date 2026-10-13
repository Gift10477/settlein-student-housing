const request = require('supertest');

const configuredBaseUrl = process.env.SHAMBA_API_URL;
const baseUrl = configuredBaseUrl
  ? `${configuredBaseUrl.replace(/\/+$/, '')}${/\/api$/i.test(configuredBaseUrl) ? '' : '/api'}`
  : '';
const listingId = process.env.SHAMBA_LISTING_ID || '1';
const farmerId = process.env.SHAMBA_FARMER_ID || '1';
const headquartersId = process.env.SHAMBA_HEADQUARTERS_ID || '1';

const partnerSuite = baseUrl ? describe : describe.skip;

partnerSuite('Shamba Direct partner API', () => {
  it('returns active listings', async () => {
    const response = await request(baseUrl).get('/listings');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('supports filtering listings by county', async () => {
    const response = await request(baseUrl)
      .get('/listings')
      .query({ county: 'Kirinyaga' });

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('returns a single listing with the documented fields', async () => {
    const response = await request(baseUrl)
      .get(`/listings/${listingId}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(expect.objectContaining({
      id: expect.any(Number),
      farmer_id: expect.any(Number),
      farmer_name: expect.any(String),
      farmer_verified: expect.any(Boolean),
      name: expect.any(String),
      category: expect.any(String),
      price_per_kg: expect.any(Number),
      quantity_kg: expect.any(Number),
      views: expect.any(Number),
      county: expect.any(String)
    }));
  });

  it('returns 404 for a listing that does not exist', async () => {
    const response = await request(baseUrl)
      .get('/listings/999999999');

    expect(response.status).toBe(404);
  });

  it('rejects a listing ID that is not an integer', async () => {
    const response = await request(baseUrl)
      .get('/listings/not-an-id');

    expect(response.status).toBe(400);
  });

  it('returns current market prices', async () => {
    const response = await request(baseUrl)
      .get('/market-prices');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('supports filtering market prices by county', async () => {
    const response = await request(baseUrl)
      .get('/market-prices')
      .query({ county: 'Kirinyaga' });

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('returns verified farmer ratings', async () => {
    const response = await request(baseUrl)
      .get('/farmers/ratings');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('returns a specific farmer rating', async () => {
    const response = await request(baseUrl)
      .get(`/farmers/${farmerId}/rating`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('returns 404 for a farmer that does not exist', async () => {
    const response = await request(baseUrl)
      .get('/farmers/999999999/rating');

    expect(response.status).toBe(404);
  });

  it('rejects a farmer ID that is not an integer', async () => {
    const response = await request(baseUrl)
      .get('/farmers/not-an-id/rating');

    expect(response.status).toBe(400);
  });

  it('returns headquarters', async () => {
    const response = await request(baseUrl)
      .get('/headquarters');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('returns a specific headquarters with the documented fields', async () => {
    const response = await request(baseUrl)
      .get(`/headquarters/${headquartersId}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(expect.objectContaining({
      id: expect.any(Number),
      region_name: expect.any(String),
      address: expect.any(String),
      county: expect.any(String)
    }));
    expect(response.body.latitude === null || typeof response.body.latitude === 'number').toBe(true);
    expect(response.body.longitude === null || typeof response.body.longitude === 'number').toBe(true);
  });

  it('returns 404 for a headquarters that does not exist', async () => {
    const response = await request(baseUrl)
      .get('/headquarters/999999999');

    expect(response.status).toBe(404);
  });

  it('rejects a headquarters ID that is not an integer', async () => {
    const response = await request(baseUrl)
      .get('/headquarters/not-an-id');

    expect(response.status).toBe(400);
  });

  it('rejects an enquiry with missing required fields', async () => {
    const response = await request(baseUrl)
      .post('/enquiries')
      .send({});

    expect(response.status).toBe(400);
  });
});
