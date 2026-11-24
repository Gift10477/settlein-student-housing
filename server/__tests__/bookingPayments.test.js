const request = require('supertest');
jest.mock('../db', () => ({ query: jest.fn(), getConnection: jest.fn() }));
const { setupDatabaseApp } = require('../test-support/databaseHarness');
let app, access, db, booking, connection;
beforeEach(() => {
  ({ app, access, db } = setupDatabaseApp());
  booking = { id: 1, user_id: 13, property_id: 'p1', status: 'pending', payment_status: 'unpaid', booking_fee: 1500, payment_deadline: new Date(Date.now() + 3600000).toISOString() };
  connection = {
    beginTransaction: jest.fn(), commit: jest.fn(), rollback: jest.fn(), release: jest.fn(),
    query: jest.fn(async sql => sql.includes('FROM bookings') ? [[booking]] : [{ affectedRows: 1, insertId: 1 }]),
  };
  db.getConnection.mockResolvedValue(connection);
});
const pay = (token, body = {}) => request(app).post('/data/bookings/1/mock-payment').auth(token, { type: 'bearer' }).send(body);

test('mock checkout persists the server fee, receipt and audit in one transaction', async () => {
  const response = await pay(access.issueSession(13));
  expect(response.status).toBe(200);
  expect(response.body.booking.payment_status).toBe('paid');
  expect(response.body.booking.payment_reference).toMatch(/^MOCK-/);
  expect(connection.query.mock.calls.find(([sql]) => sql.includes('INSERT INTO payments'))[1].slice(0, 3)).toEqual([1, 1500, 'paid']);
  expect(connection.query.mock.calls.some(([sql]) => sql.includes('INSERT INTO audit_logs'))).toBe(true);
  expect(connection.commit).toHaveBeenCalled();
});
test('students cannot pay another user reservation', async () => {
  expect((await pay(access.issueSession(14))).status).toBe(404);
  expect(connection.commit).not.toHaveBeenCalled();
});
test('client cannot change the payment amount or status', async () => {
  expect((await pay(access.issueSession(13), { amount: 1, payment_status: 'paid' })).status).toBe(400);
  expect(db.getConnection).not.toHaveBeenCalled();
});
test.each(['rejected', 'cancelled', 'approved'])('closed reservation %s cannot be paid', async status => {
  booking.status = status;
  expect((await pay(access.issueSession(13))).status).toBe(409);
  expect(connection.commit).not.toHaveBeenCalled();
});
test('overdue mock payment is blocked and left for admin rejection', async () => {
  booking.payment_deadline = new Date(Date.now() - 1000).toISOString();
  expect((await pay(access.issueSession(13))).status).toBe(409);
  expect(connection.commit).not.toHaveBeenCalled();
});
test('retrying a paid reservation does not insert a second payment', async () => {
  booking.payment_status = 'paid';
  expect((await pay(access.issueSession(13))).status).toBe(200);
  expect(connection.query).toHaveBeenCalledTimes(1);
  expect(connection.commit).not.toHaveBeenCalled();
});
test('failed receipt write rolls back payment', async () => {
  connection.query.mockImplementation(async sql => {
    if (sql.includes('FROM bookings')) return [[booking]];
    throw new Error('write failed');
  });
  expect((await pay(access.issueSession(13))).status).toBe(500);
  expect(connection.rollback).toHaveBeenCalled();
  expect(connection.commit).not.toHaveBeenCalled();
  expect(connection.release).toHaveBeenCalled();
});
test('student cannot manually mark paid', async () => {
  expect((await request(app).post('/data/admin/bookings/1/payment').auth(access.issueSession(13), { type: 'bearer' }).send({ reference: 'TEST-123' })).status).toBe(403);
});
test('admin can record a timely external payment after the deadline', async () => {
  db.query.mockResolvedValue([[{ role: 'admin' }]]);
  booking.payment_deadline = new Date(Date.now() - 1000).toISOString();
  const response = await request(app).post('/data/admin/bookings/1/payment').auth(access.issueSession(1), { type: 'bearer' }).send({ reference: 'TEST-123', paid_at: new Date(Date.now() - 60000).toISOString() });
  expect(response.status).toBe(200);
  expect(response.body.booking.payment_method).toBe('manual');
  expect(connection.commit).toHaveBeenCalled();
});
test('admin cannot approve an unpaid reservation', async () => {
  db.query.mockResolvedValue([[{ role: 'admin' }]]);
  expect((await request(app).patch('/data/admin/bookings/1').auth(access.issueSession(1), { type: 'bearer' }).send({ status: 'approved' })).status).toBe(409);
  expect(connection.query.mock.calls.some(([sql]) => sql.includes('vacant_units - 1'))).toBe(false);
});
test('admin can reject an overdue reservation and audit the decision', async () => {
  db.query.mockResolvedValue([[{ role: 'admin' }]]);
  booking.payment_deadline = new Date(Date.now() - 1000).toISOString();
  expect((await request(app).patch('/data/admin/bookings/1').auth(access.issueSession(1), { type: 'bearer' }).send({ status: 'rejected' })).status).toBe(200);
  expect(connection.query.mock.calls.some(([, params]) => params?.includes('reservation.rejected'))).toBe(true);
});
test('new reservation snapshots fee, sets 24 hour deadline and logs creation', async () => {
  db.query.mockResolvedValue([[{ id: 'p1', title: 'Test property', booking_fee: 2500 }]]);
  const response = await request(app).post('/data/bookings').auth(access.issueSession(13), { type: 'bearer' }).send({ user_id: 13, property_id: 'p1', move_in_date: '2099-01-01' });
  expect(response.status).toBe(201);
  expect(response.body.booking.booking_fee).toBe(2500);
  expect(response.body.booking.payment_status).toBe('unpaid');
  expect(new Date(response.body.booking.payment_deadline) - new Date(response.body.booking.booked_at)).toBe(24 * 3600000);
  expect(connection.query.mock.calls.some(([, params]) => params?.includes('reservation.created'))).toBe(true);
  expect(connection.commit).toHaveBeenCalled();
});
