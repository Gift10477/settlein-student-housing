const request = require('supertest');
const fs = require('fs');
const path = require('path');
jest.mock('../db', () => ({ query: jest.fn() }));
const { setupApi } = require('../test-support/apiHarness');
test('v1 still matches the captured pre-change response', async () => {
  const { app, key } = setupApi();
  const db = require('../db');
  db.query.mockImplementation(async sql => sql.includes('SELECT * FROM properties') ? [[{ id: 'lab13', title: 'Lab housing', price: '12000', campus: 'strathmore', amenities: 'Wi-Fi', verified: 1 }]] : [[]]);
  const res = await request(app).get('/api/properties').set('X-API-Key', key);
  expect(res.status).toBe(200);
  expect(res.body).toEqual(require('../test-support/lab13/v1_before.json'));
  fs.writeFileSync(path.join(__dirname, '../test-support/lab13/v1_after.json'), JSON.stringify(res.body, null, 2) + '\n');
});
