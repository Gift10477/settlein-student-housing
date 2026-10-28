const request = require('supertest');
const crypto = require('crypto');
jest.mock('../db', () => ({ query: jest.fn(), getConnection: jest.fn() }));

let app, db, access, log;
const key = 'security-test-consumer';
const user = { id: 1, name: 'Student', email: 'student@example.test', role: 'student',
  student_id: 'student-1', residence_area: 'Madaraka', campus: 'strathmore',
  password_hash: 'secret-hash', password: 'secret-password', token: 'secret-token', isAdmin: true };
beforeEach(() => {
  jest.resetModules();
  process.env.API_KEYS = `${key},other-consumer,revoked-test-key`;
  jest.doMock('../compromised-key-hashes.json', () => [require('crypto').createHash('sha256').update('revoked-test-key').digest('hex')]);
  db = require('../db');
  db.query.mockImplementation(async (sql) => {
    if (sql.includes('INFORMATION_SCHEMA')) return [[]];
    if (sql.startsWith('SELECT')) return [[user]];
    return [{ insertId: 2, affectedRows: 1 }];
  });
  app = require('../app');
  access = require('../middleware/access');
  log = jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => { jest.restoreAllMocks(); });
function call(method, path, { owner, token } = {}) {
  const req = request(app)[method](path).set('X-API-Key', key);
  if (owner) token = access.issueSession(owner, key);
  if (token) req.set('Authorization', `Bearer ${token}`);
  return req;
}
const aliases = ['/api', '/api/v1'];
test.each([
  ['post', '/api/properties', 400],
  ['put', '/api/properties/p1', 400],
  ['delete', '/api/properties/p1', 200],
  ['post', '/api/properties/group-inquiries', 400],
])('%s %s needs no separate admin key', async (method, path, status) => {
  expect((await call(method, path).send({})).status).toBe(status);
});
test.each([['/api/users', 'WHERE id = ?'], ['/api/bookings', 'WHERE user_id = ?']])('list %s queries only the logged-in user', async (path, clause) => {
  expect((await call('get', path, { owner: 1 })).status).toBe(200);
  expect(db.query.mock.calls.some(([sql, values]) => sql.includes(clause) && values[0] === '1')).toBe(true);
});
describe.each(aliases)('%s access boundaries', (prefix) => {
  test.each(['', '/residence-area', '/lease-timeline', '/public-profile'])('rejects another user%s before a query', async (suffix) => {
    const before = db.query.mock.calls.filter(([sql]) => sql.includes('FROM users')).length;
    const res = await call('get', `${prefix}/users/2${suffix}`, { owner: 1 });
    expect(res.status).toBe(403);
    expect(db.query.mock.calls.filter(([sql]) => sql.includes('FROM users'))).toHaveLength(before);
  });
  test.each(['put', 'delete'])('blocks cross-user %s', async (method) => {
    expect((await call(method, `${prefix}/users/2`, { owner: 1 }).send({ name: 'Changed' })).status).toBe(403);
  });
  test('blocks reading and creating another user bookings', async () => {
    expect((await call('get', `${prefix}/bookings/user/2`, { owner: 1 })).status).toBe(403);
    expect((await call('post', `${prefix}/bookings`, { owner: 1 }).send({ user_id: 2 })).status).toBe(403);
  });
  test.each(['/users', '/bookings'])('restricts bulk export %s', async (path) => {
    expect((await call('get', prefix + path)).status).toBe(401);
  });

});
test('an API key alone does not establish user identity', async () => {
  expect((await call('get', '/api/users/1')).status).toBe(401);
});
test('a revoked key is rejected even when configured', async () => {
  const res = await request(app).get('/health').set('X-API-Key', 'revoked-test-key');
  expect(res.status).toBe(401);
});
test('rate-limit responses contain only the fixed message and retry header', async () => {
  for (let index = 0; index < 100; index++) expect((await call('get', '/health')).status).toBe(200);
  const res = await call('get', '/health');
  expect(res.status).toBe(429);
  expect(res.headers['retry-after']).toBeDefined();
  expect(res.body).toEqual({ message: 'Too many requests, please try again later.' });
});
test('owner responses omit hashes, tokens, and unexpected database columns', async () => {
  const res = await call('get', '/api/users/1', { owner: 1 });
  expect(res.status).toBe(200);
  expect(res.body.email).toBe(user.email);
  for (const field of ['password_hash', 'password', 'token', 'isAdmin']) expect(res.body).not.toHaveProperty(field);
});
test('own-user list responses also omit secrets', async () => {
  const res = await call('get', '/api/users', { owner: 1 });
  expect(res.status).toBe(200);
  expect(res.body[0]).not.toHaveProperty('password_hash');
  expect(res.body[0]).not.toHaveProperty('token');
});
test('property responses omit inquiries, reviews, email, and unexpected columns', async () => {
  db.query.mockImplementation(async (sql) => sql.startsWith('SELECT * FROM properties')
    ? [[{ ...user, title: 'Home', amenities: '["Wifi", {"token":"hidden"}]', reviews: '[{"email":"private"}]', group_inquiries: '[{"student_id":2}]' }]] : [[]]);
  const res = await call('get', '/api/properties');
  expect(res.status).toBe(200);
  expect(res.body[0].amenities).toEqual(['Wifi']);
  for (const field of ['email', 'password_hash', 'token', 'group_inquiries', 'reviews']) expect(res.body[0]).not.toHaveProperty(field);
});
test('booking responses use an allowlist', async () => {
  const res = await call('get', '/api/bookings/user/1', { owner: 1 });
  expect(res.status).toBe(200);
  for (const field of ['password_hash', 'token', 'email', 'isAdmin']) expect(res.body[0]).not.toHaveProperty(field);
});
test.each(['id', 'isAdmin', 'password_hash', 'role'])('profile updates reject extra field %s', async (field) => {
  const res = await call('put', '/api/users/1', { owner: 1 }).send({ name: 'Student', [field]: 'admin' });
  expect(res.status).toBe(400);
});
test('registration rejects role escalation', async () => {
  const res = await call('post', '/api/users').send({ name: 'Student', email: 's@example.test', password: 'long-password', role: 'admin' });
  expect(res.status).toBe(400);
});
test.each(['/api/users', '/api/properties', '/api/bookings'])('writes reject id injection at %s', async (path) => {
  const body = { id: 50, isAdmin: true };
  if (path === '/api/bookings') body.user_id = 1;
  const res = await call('post', path, { owner: 1 }).send(body);
  expect(res.status).toBe(400);
});
test('database errors never return or log error details', async () => {
  db.query.mockRejectedValue(new Error('SELECT password_hash FROM users at C:/private/server.js secret-token'));
  const res = await call('post', '/api/properties', { owner: 1 }).send({ title: 'Home', type: 'Room', price: 100, location: 'Nairobi', campus: 'Town' });
  expect(res.status).toBe(500);
  expect(JSON.stringify(res.body)).not.toMatch(/SELECT|password_hash|private|secret-token|details|stack/);
  expect(JSON.stringify(log.mock.calls)).not.toMatch(/SELECT|password_hash|private|secret-token/);
});
test.each([
  ['get', '/api/users', undefined],
  ['get', '/api/users/1', undefined],
  ['get', '/api/users/1/residence-area', undefined],
  ['get', '/api/users/1/lease-timeline', undefined],
  ['get', '/api/users/1/public-profile', undefined],
  ['post', '/api/users', { name: 'Student', email: 's@example.test', password: 'long-password' }],
  ['post', '/api/users/login', { email: 's@example.test', password: 'long-password' }],
  ['put', '/api/users/1', { name: 'Student' }],
  ['delete', '/api/users/1', undefined],
  ['get', '/api/bookings', undefined],
  ['get', '/api/bookings/user/1', undefined],
  ['post', '/api/bookings', { user_id: 1, property_id: 'p1' }],
  ['get', '/api/properties', undefined],
  ['get', '/api/properties/p1', undefined],
  ['get', '/api/properties/p1/study-amenities', undefined],
  ['put', '/api/properties/p1', { title: 'Home' }],
  ['delete', '/api/properties/p1', undefined],
])('%s %s redacts database failures', async (method, path, body) => {
  db.query.mockRejectedValue(new Error('SELECT secret FROM internal_table at C:/private/server.js'));
  const req = call(method, path, { owner: 1 });
  const res = await (body ? req.send(body) : req);
  expect(res.status).toBe(500);
  expect(JSON.stringify(res.body)).not.toMatch(/SELECT|internal_table|private|stack/);
  expect(res.body).not.toHaveProperty('details');
  expect(JSON.stringify(log.mock.calls)).not.toMatch(/SELECT|internal_table|private/);
});
test('malformed JSON does not echo the payload', async () => {
  const res = await call('post', '/api/users').set('Content-Type', 'application/json').send('{"secret":"hidden",');
  expect(res.status).toBe(400);
  expect(JSON.stringify(res.body)).not.toContain('hidden');
});
test('unknown routes do not reflect paths', async () => {
  const res = await call('get', '/private-secret-path');
  expect(res.status).toBe(404);
  expect(res.body).toEqual({ error: 'Not Found' });
});
test('sessions expire and are bound to their API consumer', async () => {
  const token = access.issueSession(1, 'other-consumer');
  expect((await call('get', '/api/users/1', { token })).status).toBe(401);
  const own = access.issueSession(1, key);
  const now = Date.now();
  jest.spyOn(Date, 'now').mockReturnValue(now + 3600001);
  expect((await call('get', '/api/users/1', { token: own })).status).toBe(401);
});
test('login returns an intentional token and an allowlisted user', async () => {
  const salt = 'test-salt';
  const password = 'long-password';
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  db.query.mockImplementation(async (sql) => sql.includes('FROM users') ? [[{ ...user, password_hash: `scrypt:${salt}:${hash}` }]] : [[]]);
  const res = await call('post', '/api/users/login').send({ email: user.email, password });
  expect(res.status).toBe(200);
  expect(res.body.access_token).toMatch(/^[a-f0-9]{64}$/);
  expect(res.body.user).not.toHaveProperty('password_hash');
  expect(res.body.user).not.toHaveProperty('token');
  expect((await call('get', '/api/users/1', { token: res.body.access_token })).status).toBe(200);
});
