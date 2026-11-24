const request=require('supertest');
jest.mock('../db',()=>({query:jest.fn(),getConnection:jest.fn()}));
const {setupDatabaseApp}=require('../test-support/databaseHarness');
let app,access,db;
beforeEach(()=>{({app,access,db}=setupDatabaseApp());});
test('registration cannot create administrators',async()=>{
 const r=await request(app).post('/data/users').send({name:'Student',email:'student@example.test',password:'long-password',role:'admin'});
 expect(r.status).toBe(400);expect(db.query).not.toHaveBeenCalled();
});
test('registration stores a password hash',async()=>{
 db.query.mockResolvedValue([{insertId:14}]);
 const r=await request(app).post('/data/users').send({name:'Student',email:'student@example.test',password:'long-password'});
 expect(r.status).toBe(201);expect(db.query.mock.calls[0][1][2]).toMatch(/^scrypt:/);expect(db.query.mock.calls[0][1]).not.toContain('long-password');
});
test('login rejects incorrect passwords',async()=>{
 const {hashPassword}=require('../services/passwords');
 db.query.mockResolvedValue([[{id:13,email:'student@example.test',password_hash:await hashPassword('correct-password')}]]);
 expect((await request(app).post('/data/users/login').send({email:'student@example.test',password:'wrong-password'})).status).toBe(401);
});
test('logout revokes the session on the server',async()=>{
 const token=access.issueSession(13);
 expect((await request(app).post('/data/users/logout').auth(token,{type:'bearer'})).status).toBe(200);
 expect((await request(app).get('/data/bookings').auth(token,{type:'bearer'})).status).toBe(401);
});
test('reservations cannot be submitted for another student',async()=>{
 expect((await request(app).post('/data/bookings').auth(access.issueSession(13),{type:'bearer'}).send({user_id:14,property_id:'p1'})).status).toBe(403);
});
test('listing search uses SQL parameters and excludes private columns',async()=>{
 db.query.mockResolvedValue([[{id:'p1',price:10000,verified:1,vacant_units:1,group_inquiries:'private student information',password_hash:'secret'}]]);
 const search="' OR 1=1 --";
 const r=await request(app).get('/data/properties').query({search});
 expect(r.status).toBe(200);expect(db.query.mock.calls[0][0]).toContain('verified = 1');expect(db.query.mock.calls[0][0]).not.toContain(search);expect(db.query.mock.calls[0][1][0]).toBe('%'+search+'%');expect(r.body[0]).not.toHaveProperty('group_inquiries');expect(r.body[0]).not.toHaveProperty('password_hash');
});
