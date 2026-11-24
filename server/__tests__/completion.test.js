const request=require('supertest');
jest.mock('../db',()=>({query:jest.fn(),getConnection:jest.fn()}));
const {setupDatabaseApp}=require('../test-support/databaseHarness');
let app,access,db,connection;
beforeEach(()=>{
 ({app,access,db}=setupDatabaseApp());
 process.env.SECURITY_KEY='ab'.repeat(32);
 connection={beginTransaction:jest.fn(),commit:jest.fn(),rollback:jest.fn(),release:jest.fn(),query:jest.fn().mockResolvedValue([{insertId:1,affectedRows:1}])};db.getConnection.mockResolvedValue(connection);
});
test('TOTP follows RFC 6238 SHA1 vectors and rejects replay and invalid codes',()=>{
 const totp=require('../services/totp');
 const secret=totp.encode(Buffer.from('12345678901234567890'));
 expect(totp.codeAt(secret,1)).toBe('287082');
 expect(totp.codeAt(secret,Math.floor(1111111109/30))).toBe('081804');
 expect(totp.verify(secret,'287082',-1,59000)).toBe(1);
 expect(totp.verify(secret,'287082',1,59000)).toBeNull();
 expect(totp.verify(secret,'not-code',-1,59000)).toBeNull();
 const encrypted=totp.encrypt(secret);expect(encrypted).not.toContain(secret);expect(totp.decrypt(encrypted)).toBe(secret);
 const damaged=Buffer.from(encrypted,'base64');damaged[15]^=1;expect(()=>totp.decrypt(damaged.toString('base64'))).toThrow();
});
test('enabled 2FA blocks password-only login and consumes each valid code once',async()=>{
 const {hashPassword}=require('../services/passwords'),totp=require('../services/totp');
 const user={id:13,email:'student@example.test',password_hash:await hashPassword('correct-password')};
 const secret=totp.newSecret(),security={enabled:1,secret:totp.encrypt(secret),last_counter:-1};
 db.query.mockImplementation(async sql=>sql.startsWith('SELECT * FROM users')?[[user]]:sql.startsWith('SELECT * FROM user_security')?[[security]]:[{affectedRows:1}]);
 expect((await request(app).post('/data/users/login').send({email:user.email,password:'correct-password'})).status).toBe(401);
 const counter=Math.floor(Date.now()/30000),code=totp.codeAt(secret,counter);
 const result=await request(app).post('/data/users/login').send({email:user.email,password:'correct-password',code});expect(result.status).toBe(200);expect(result.body.access_token).toMatch(/^[a-f0-9]{64}$/);
 security.last_counter=counter;
 expect((await request(app).post('/data/users/login').send({email:user.email,password:'correct-password',code})).status).toBe(401);
});
test('contact validation does not write invalid or oversized messages',async()=>{
 expect((await request(app).post('/data/community/contact').send({name:'A',email:'invalid',subject:'Help',message:'Hi'})).status).toBe(400);
 expect(db.getConnection).not.toHaveBeenCalled();
});
test('contact submission commits message and audit together',async()=>{
 const result=await request(app).post('/data/community/contact').send({name:'A',email:'a@example.test',subject:'Help',message:'A question'});
 expect(result.status).toBe(201);expect(connection.query.mock.calls[1][1]).toContain('contact.received');expect(connection.commit).toHaveBeenCalled();
});
test('support inbox is forbidden to students',async()=>{
 expect((await request(app).get('/data/community/messages').auth(access.issueSession(13),{type:'bearer'})).status).toBe(403);
});
test('reviews require an approved reservation',async()=>{
 connection.query.mockResolvedValue([[]]);
 const result=await request(app).post('/data/community/reviews/p1').auth(access.issueSession(13),{type:'bearer'}).send({stars:5,comment:'Good room'});
 expect(result.status).toBe(403);expect(connection.rollback).toHaveBeenCalled();expect(connection.commit).not.toHaveBeenCalled();
});
test('profile mutation rolls back when audit storage fails',async()=>{
 connection.query.mockResolvedValueOnce([{affectedRows:1}]).mockRejectedValueOnce(new Error('offline'));
 const result=await request(app).put('/data/users/13').auth(access.issueSession(13),{type:'bearer'}).send({name:'Changed'});
 expect(result.status).toBe(500);expect(connection.rollback).toHaveBeenCalled();expect(connection.commit).not.toHaveBeenCalled();
});
test('date validation rejects calendar rollover and field limits match database',()=>{
 const {validDate,validProfile,validListing}=require('../services/validation');
 expect(validDate('2027-02-29')).toBe(false);expect(validDate('2028-02-29')).toBe(true);
 expect(validProfile({name:'a'.repeat(101)})).toBe(false);expect(validListing({image:'javascript:alert(1)'})).toBe(false);
});
