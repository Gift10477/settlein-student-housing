const request=require('supertest');
jest.mock('../db',()=>({query:jest.fn(),getConnection:jest.fn()}));
const {setupDatabaseApp}=require('../test-support/databaseHarness');
let app,access,db;
beforeEach(()=>{({app,access}=setupDatabaseApp());db=require('../db');});
test('management requires login',async()=>{expect((await request(app).get('/data/admin/dashboard')).status).toBe(401);});
test('admin upload rejects non-image content',async()=>{
 db.query.mockImplementation(async()=>[[{role:'admin'}]]);
 expect((await request(app).post('/data/admin/uploads').auth(access.issueSession(1),{type:'bearer'}).send({data:'data:image/png;base64,bm90LWFuLWltYWdl'})).status).toBe(400);
});
test('students cannot use management or delete listings',async()=>{
 const token=access.issueSession(13);
 expect((await request(app).get('/data/admin/dashboard').auth(token,{type:'bearer'})).status).toBe(403);
 expect((await request(app).delete('/data/properties/p1').auth(token,{type:'bearer'})).status).toBe(403);
});
test('cancelling a legacy booking does not invent an extra vacancy',async()=>{
 db.query.mockResolvedValue([[{role:'admin'}]]);
 const c={beginTransaction:jest.fn(),commit:jest.fn(),rollback:jest.fn(),release:jest.fn(),query:jest.fn(async(sql)=>sql.includes('FROM bookings')?[[{id:1,property_id:'p1',status:'active'}]]:[{affectedRows:1}])};
 db.getConnection.mockResolvedValue(c);
 const r=await request(app).patch('/data/admin/bookings/1').auth(access.issueSession(1),{type:'bearer'}).send({status:'cancelled'});
 expect(r.status).toBe(200);expect(c.query.mock.calls.some(([sql])=>sql.includes('vacant_units + 1'))).toBe(false);
});
test.each([1,0])('approval respects vacancy (%i)',async(vacancy)=>{
 db.query.mockImplementation(async()=>[[{role:'admin'}]]);
 const c={beginTransaction:jest.fn(),commit:jest.fn(),rollback:jest.fn(),release:jest.fn(),query:jest.fn(async(sql)=>sql.includes('FROM bookings')?[[{id:1,property_id:'p1',status:'pending',payment_status:'paid'}]]:[{affectedRows:vacancy}])};
 db.getConnection.mockResolvedValue(c);
 const r=await request(app).patch('/data/admin/bookings/1').auth(access.issueSession(1),{type:'bearer'}).send({status:'approved'});
 expect(r.status).toBe(vacancy?200:409);
 if(vacancy){expect(c.commit).toHaveBeenCalled();expect(c.query.mock.calls.some(([sql])=>sql.includes('vacant_units - 1'))).toBe(true);expect(c.query.mock.calls.some(([sql])=>sql.includes('INSERT INTO audit_logs'))).toBe(true);}else{expect(c.rollback).toHaveBeenCalled();expect(c.commit).not.toHaveBeenCalled();}
});
