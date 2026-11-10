const request = require('supertest');
const { versions } = require('../partner');
require('dotenv').config({ path: require('path').join(__dirname, '../.env'), quiet: true });

const configuredBaseUrl = (process.env.SHAMBA_API_URL || '').trim().replace(/\/+$/, '');
const baseUrl = configuredBaseUrl
  ? `${configuredBaseUrl}${/\/api$/i.test(configuredBaseUrl) ? '' : '/api'}`
  : '';
let listingId, farmerId, headquartersId;
const get = route => request(baseUrl).get(route)
  .set('X-API-Key', process.env.SHAMBA_API_KEY || '')
  .redirects(0).timeout({ response: 8000, deadline: 10000 });
const nullableString = value => value === undefined || value === null || typeof value === 'string';
const optionalNumber = value => value === undefined || value === null ||
  (typeof value === 'number' && Number.isFinite(value));
jest.setTimeout(15000);

const partnerSuite = baseUrl ? describe : describe.skip;

partnerSuite('Shamba Direct partner API', () => {
  beforeAll(async () => {
    if (!process.env.SHAMBA_API_KEY) throw new Error('Configure SHAMBA_API_KEY with the Shamba ring-partner key.');
    // Discover live records instead of assuming example ID 1 still exists.
    const listings = await get('/listings');
    expect(listings.status).toBe(200);
    expect(Array.isArray(listings.body)).toBe(true);
    if (!listings.body.length) throw new Error('Live fixture needed: at least one active listing.');
    listingId = listings.body.find(row => String(row.id) === process.env.SHAMBA_LISTING_ID)?.id || listings.body[0].id;
    const headquarters = await get('/headquarters');
    expect(headquarters.status).toBe(200);
    expect(Array.isArray(headquarters.body)).toBe(true);
    if (!headquarters.body.length) throw new Error('Live fixture needed: at least one headquarters.');
    headquartersId = headquarters.body.find(row => String(row.id) === process.env.SHAMBA_HEADQUARTERS_ID)?.id || headquarters.body[0].id;
    const ratings = await get('/farmers/ratings');
    expect(ratings.status).toBe(200);
    expect(Array.isArray(ratings.body)).toBe(true);
    farmerId = ratings.body.find(row => String(row.farmer_id) === process.env.SHAMBA_FARMER_ID)?.farmer_id || ratings.body[0]?.farmer_id;
    // A verified farmer with no reviews is absent from the ratings list,
    // but its individual rating is documented to return a one-item array.
    if (!farmerId) {
      for (const listing of listings.body) {
        const detail = await get(`/listings/${listing.id}`);
        expect(detail.status).toBe(200);
        if (detail.body.farmer_verified === true) {
          farmerId = detail.body.farmer_id;
          break;
        }
      }
    }
    if (!farmerId) throw new Error('Live fixture needed: a verified farmer with an active listing or rating.');
  }, 120000);
  it('returns active listings', async () => {
    const response = await get('/listings');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    for (const row of response.body) {
      expect(row).toEqual(expect.objectContaining({ id: expect.any(Number), name: expect.any(String),
        price_per_kg: expect.any(Number), quantity_kg: expect.any(Number) }));
      expect(nullableString(row.category)).toBe(true);
      expect(nullableString(row.county)).toBe(true);
    }
  });

  it('supports filtering listings by county', async () => {
    const response = await get('/listings')
      .query({ county: 'Kirinyaga' });

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.every(row => row.county === 'Kirinyaga')).toBe(true);
  });

  it('returns a single listing with the documented fields', async () => {
    const response = await get(`/listings/${listingId}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(expect.objectContaining({
      id: expect.any(Number),
      farmer_id: expect.any(Number),
      farmer_name: expect.any(String),
      farmer_verified: expect.any(Boolean),
      name: expect.any(String),
      price_per_kg: expect.any(Number),
      quantity_kg: expect.any(Number),
      views: expect.any(Number)
    }));
    expect(nullableString(response.body.category)).toBe(true);
    expect(nullableString(response.body.county)).toBe(true);
  });

  it('returns 404 for a listing that does not exist', async () => {
    const response = await get('/listings/999999999');

    expect(response.status).toBe(404);
  });

  it('rejects a listing ID that is not an integer', async () => {
    const response = await get('/listings/not-an-id');

    expect(response.status).toBe(400);
  });

  it('returns current market prices', async () => {
    const response = await get('/market-prices');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(() => versions.v1.parse(response.body)).not.toThrow();
  });

  it('supports filtering market prices by county', async () => {
    const response = await get('/market-prices')
      .query({ county: 'Kirinyaga' });

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(() => versions.v1.parse(response.body)).not.toThrow();
    expect(response.body.every(row => row.county === 'Kirinyaga')).toBe(true);
  });

  it('returns verified farmer ratings', async () => {
    const response = await get('/farmers/ratings');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    for (const row of response.body) {
      expect(row).toEqual(expect.objectContaining({ farmer_id: expect.any(Number),
        farmer_name: expect.any(String), rating: expect.any(Number) }));
      expect(row.rating).toBeGreaterThanOrEqual(0);
      expect(row.rating).toBeLessThanOrEqual(5);
    }
  });

  it('returns a specific farmer rating', async () => {
    const response = await get(`/farmers/${farmerId}/rating`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toEqual(expect.objectContaining({ farmer_id: farmerId,
      farmer_name: expect.any(String), rating: expect.any(Number) }));
    expect(response.body[0].rating).toBeGreaterThanOrEqual(0);
    expect(response.body[0].rating).toBeLessThanOrEqual(5);
  });

  it('returns 404 for a farmer that does not exist', async () => {
    const response = await get('/farmers/999999999/rating');

    expect(response.status).toBe(404);
  });

  it('rejects a farmer ID that is not an integer', async () => {
    const response = await get('/farmers/not-an-id/rating');

    expect(response.status).toBe(400);
  });

  it('returns headquarters', async () => {
    const response = await get('/headquarters');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('returns a specific headquarters with the documented fields', async () => {
    const response = await get(`/headquarters/${headquartersId}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(expect.objectContaining({
      id: expect.any(Number),
      region_name: expect.any(String),
      county: expect.any(String)
    }));
    expect(nullableString(response.body.address)).toBe(true);
    expect(optionalNumber(response.body.latitude)).toBe(true);
    expect(optionalNumber(response.body.longitude)).toBe(true);
  });

  it('returns 404 for a headquarters that does not exist', async () => {
    const response = await get('/headquarters/999999999');

    expect(response.status).toBe(404);
  });

  it('rejects a headquarters ID that is not an integer', async () => {
    const response = await get('/headquarters/not-an-id');

    expect(response.status).toBe(400);
  });

  it('rejects partner reads without an API key', async () => {
    const response = await request(baseUrl)
      .get('/market-prices').redirects(0)
      .timeout({ response: 8000, deadline: 10000 });

    expect(response.status).toBe(401);
  });
});
