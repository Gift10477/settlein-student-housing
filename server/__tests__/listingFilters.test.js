const request=require('supertest');
jest.mock('../db',()=>({query:jest.fn(),getConnection:jest.fn()}));
const {setupDatabaseApp}=require('../test-support/databaseHarness');
let app,access,db;
beforeEach(()=>{({app,access,db}=setupDatabaseApp());});
test('API parameterizes gender and furnishing filters',async()=>{
 db.query.mockResolvedValue([[]]);
 const r=await request(app).get('/data/properties').query({gender_policy:'Female-only',furnishing_status:'Furnished'});
 expect(r.status).toBe(200);expect(db.query.mock.calls[0][0]).toContain('gender_policy = ?');expect(db.query.mock.calls[0][0]).toContain('furnishing_status = ?');
 expect(db.query.mock.calls[0][1]).toEqual(['Female-only','Furnished']);
});
test('API requires all amenities and understands legacy comma-separated data',async()=>{
 db.query.mockResolvedValue([[{id:'a',amenities:'Wi-Fi, CCTV'},{id:'b',amenities:'["Wi-Fi"]'},{id:'c',amenities:'["Wi-Fi","CCTV"]'}]]);
 const r=await request(app).get('/data/properties').query({amenities:'Wi-Fi,CCTV'});
 expect(r.status).toBe(200);expect(r.body.map(p=>p.id)).toEqual(['a','c']);
});
test('landlord selections persist as structured amenities and filter fields',async()=>{
 db.query.mockResolvedValue([[{role:'landlord'}]]);
 const c={beginTransaction:jest.fn(),commit:jest.fn(),rollback:jest.fn(),release:jest.fn(),query:jest.fn().mockResolvedValue([{affectedRows:1}])};db.getConnection.mockResolvedValue(c);
 const r=await request(app).post('/data/properties').auth(access.issueSession(22),{type:'bearer'}).send({title:'Test',type:'Studio',price:10000,location:'Test',campus:'ku',gender_policy:'Mixed',furnishing_status:'Furnished',amenities:['Wi-Fi','CCTV']});
 expect(r.status).toBe(201);expect(c.query.mock.calls.filter(([sql])=>sql.startsWith('INSERT INTO property_amenities')).map(([,values])=>values[1])).toEqual(['Wi-Fi','CCTV']);expect(c.query.mock.calls[0][1]).toContain('Mixed');expect(c.query.mock.calls[0][1]).toContain('Furnished');
});
