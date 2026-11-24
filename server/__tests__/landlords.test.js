const request=require('supertest');
jest.mock('../db',()=>({query:jest.fn(),getConnection:jest.fn()}));
const {setupDatabaseApp}=require('../test-support/databaseHarness');
let app,access,db,c;
const listing={title:'Test home',type:'Bedsitter',price:12000,location:'Madaraka',campus:'strathmore'};
beforeEach(()=>{
 ({app,access,db}=setupDatabaseApp());
 c={beginTransaction:jest.fn(),commit:jest.fn(),rollback:jest.fn(),release:jest.fn(),query:jest.fn().mockResolvedValue([{affectedRows:1}])};db.getConnection.mockResolvedValue(c);
});
test('guests cannot submit or read private listings',async()=>{
 expect((await request(app).post('/data/properties').send(listing)).status).toBe(401);
 expect((await request(app).get('/data/properties/mine')).status).toBe(401);
});
test('students cannot submit listings or open landlord data',async()=>{
 const token=access.issueSession(13);
 expect((await request(app).post('/data/properties').auth(token,{type:'bearer'}).send(listing)).status).toBe(403);
 expect((await request(app).get('/data/properties/mine').auth(token,{type:'bearer'})).status).toBe(403);
 expect(db.getConnection).not.toHaveBeenCalled();
});
test('landlord submission is owned, unpublished, pending and audited',async()=>{
 db.query.mockResolvedValue([[{role:'landlord'}]]);
 const r=await request(app).post('/data/properties').auth(access.issueSession(22),{type:'bearer'}).send(listing);
 expect(r.status).toBe(201);expect(r.body.property.verified).toBe(false);
 expect(c.query.mock.calls[0][0]).toContain("0,?,'pending'");expect(c.query.mock.calls[0][1].at(-1)).toBe('22');
 expect(c.query.mock.calls[1][1]).toContain('listing.submitted');expect(c.commit).toHaveBeenCalled();
});
test.each([{owner_id:12},{verified:true},{review_status:'approved'}])('cannot forge ownership or publication %j',async extra=>{
 db.query.mockResolvedValue([[{role:'landlord'}]]);
 expect((await request(app).post('/data/properties').auth(access.issueSession(22),{type:'bearer'}).send({...listing,...extra})).status).toBe(400);
 expect(db.getConnection).not.toHaveBeenCalled();
});
test('landlord list is scoped to the authenticated owner',async()=>{
 db.query.mockResolvedValueOnce([[{role:'landlord'}]]).mockResolvedValueOnce([[{id:'p1',review_status:'pending',verified:0}]]);
 const r=await request(app).get('/data/properties/mine?owner_id=99').auth(access.issueSession(22),{type:'bearer'});
 expect(r.status).toBe(200);expect(r.body[0].review_status).toBe('pending');
 expect(db.query.mock.calls[1][0]).toContain('WHERE owner_id = ? ORDER BY created_at DESC'); expect(db.query.mock.calls[1][1]).toEqual(['22']);
});
test('landlords cannot approve or reject listings',async()=>{
 db.query.mockResolvedValue([[{role:'landlord'}]]);const token=access.issueSession(22);
 expect((await request(app).patch('/data/admin/properties/p1').auth(token,{type:'bearer'}).send({verified:true})).status).toBe(403);
 expect((await request(app).post('/data/admin/properties/p1/reject').auth(token,{type:'bearer'}).send({})).status).toBe(403);
});
test('admin approval sets publication and review status together',async()=>{
 db.query.mockResolvedValueOnce([[{role:'admin'}]]).mockResolvedValue([{affectedRows:1}]);
 c.query.mockResolvedValueOnce([[{id:'p1'}]]).mockResolvedValue([{affectedRows:1}]);
 expect((await request(app).patch('/data/admin/properties/p1').auth(access.issueSession(1),{type:'bearer'}).send({verified:true})).status).toBe(200);
 expect(c.query.mock.calls[1][1]).toEqual([true,'approved','p1']);expect(c.commit).toHaveBeenCalled();
});
test('admin rejection unpublishes and audits',async()=>{
 db.query.mockResolvedValue([[{role:'admin'}]]);
 expect((await request(app).post('/data/admin/properties/p1/reject').auth(access.issueSession(1),{type:'bearer'}).send({})).status).toBe(200);
 expect(c.query.mock.calls[0][0]).toContain("verified=0, review_status='rejected'");expect(c.query.mock.calls[1][1]).toContain('listing.rejected');expect(c.commit).toHaveBeenCalled();
});
test('unpublished details are inaccessible publicly',async()=>{
 db.query.mockResolvedValue([[]]);expect((await request(app).get('/data/properties/p1')).status).toBe(404);
 expect(db.query.mock.calls[0][0]).toContain('verified = 1');
});
