// Exercises the real Express routes against the isolated MySQL copy.
require('dotenv').config({quiet:true});
const assert=require('node:assert/strict');
const crypto=require('crypto');
const request=require('supertest');
const db=require('../db');
const {hashPassword}=require('../services/passwords');
const app=require('../app');
async function main(){
 const suffix=crypto.randomBytes(8).toString('hex'),password=crypto.randomBytes(20).toString('hex');
 let property='verify-'+suffix;
 const ids=[];
 try{
  for(const role of ['admin','student']){
   const [r]=await db.query('INSERT INTO users (name,email,password_hash,role) VALUES (?,?,?,?)',['Verification '+role,role+suffix+'@example.test',await hashPassword(password),role]);ids.push(r.insertId);
  }
  const login=async(role)=>{const r=await request(app).post('/data/users/login').send({email:role+suffix+'@example.test',password});assert.equal(r.status,200);return r.body.access_token;};
  const admin=await login('admin'),student=await login('student');
  const call=(method,url,token,body)=>{let r=request(app)[method](url).auth(token,{type:'bearer'});return body?r.send(body):r;};
  assert.equal((await call('get','/data/admin/dashboard',student)).status,403);
  const created=await call('post','/data/properties',admin,{title:'Verification room',type:'Bedsitter',price:10000,location:'Madaraka',campus:'strathmore',vacant_units:1,description:'',amenities:['Wi-Fi','CCTV']});
  assert.equal(created.status,201);
  property=created.body.property.id;
  assert.equal(created.body.property.verified,false);
  assert.equal((await call('patch','/data/admin/properties/'+property,admin,{verified:true})).status,200);
  const published=await request(app).get('/data/properties/'+property);assert.equal(published.status,200);assert.deepEqual(published.body.amenities.sort(),['CCTV','Wi-Fi']);
  const filtered=await request(app).get('/data/properties').query({amenities:'Wi-Fi,CCTV',search:'Verification room'});assert.equal(filtered.status,200);assert.ok(filtered.body.some(row=>row.id===property));
  const r=await call('post','/data/bookings',student,{user_id:ids[1],property_id:property,move_in_date:new Date(Date.now()+30*86400000).toISOString().slice(0,10)});
  assert.equal(r.status,201);assert.equal(r.body.booking.status,'pending');
  const id=r.body.booking_id;
  assert.equal((await call('patch','/data/admin/bookings/'+id,admin,{status:'approved'})).status,409);
  assert.equal((await call('post','/data/bookings/'+id+'/mock-payment',student,{})).status,200);
  assert.equal((await call('patch','/data/admin/bookings/'+id,admin,{status:'approved'})).status,200);
  const [rooms]=await db.query('SELECT vacant_units FROM properties WHERE id = ?',[property]);assert.equal(rooms[0].vacant_units,0);
  const mine=await call('get','/data/bookings',student);assert.equal(mine.body[0].status,'approved');
  assert.equal((await call('post','/data/community/reviews/'+property,student,{stars:4,comment:'Verification resident review'})).status,201);
  const reviews=await request(app).get('/data/community/reviews/'+property);assert.equal(reviews.body[0].comment,'Verification resident review');
  assert.equal((await call('put','/data/users/'+ids[1],student,{name:'Updated verification student'})).status,200);
  assert.equal((await call('get','/data/users/'+ids[1],student)).body.name,'Updated verification student');
  const contact=await request(app).post('/data/community/contact').send({name:'Verification support',email:'student'+suffix+'@example.test',subject:'Workflow test',message:'Persistent inbox test'});assert.equal(contact.status,201);
  assert.equal((await call('patch','/data/community/messages/'+contact.body.id,admin,{status:'resolved'})).status,200);
  assert.ok((await call('get','/data/community/messages',admin)).body.some(row=>row.id===contact.body.id&&row.status==='resolved'));
  assert.equal((await call('patch','/data/admin/bookings/'+id,admin,{status:'approved'})).status,409);
  assert.equal((await call('patch','/data/admin/bookings/'+id,admin,{status:'cancelled'})).status,200);
  const [restored]=await db.query('SELECT vacant_units FROM properties WHERE id = ?',[property]);assert.equal(restored[0].vacant_units,1);
  const setup=await call('post','/data/security/setup',student,{password});assert.equal(setup.status,200);
  const totp=require('../services/totp'),counter=Math.floor(Date.now()/30000);
  assert.equal((await call('post','/data/security/confirm',student,{password,code:totp.codeAt(setup.body.secret,counter)})).status,200);
  assert.equal((await call('get','/data/bookings',student)).status,401);
  assert.equal((await request(app).post('/data/users/login').send({email:'student'+suffix+'@example.test',password})).status,401);
  assert.equal((await request(app).post('/data/users/login').send({email:'student'+suffix+'@example.test',password,code:totp.codeAt(setup.body.secret,counter+1)})).status,200);
  assert.equal((await request(app).post('/data/users/login').send({email:'student'+suffix+'@example.test',password,code:totp.codeAt(setup.body.secret,counter+1)})).status,401);
  console.log('PASS: real MySQL authorization, listing publication, reservation/payment/approval, duplicate protection, cancellation and vacancy restoration, resident review, profile, support inbox, 2FA enrollment/login/replay protection.');
 }finally{
  try { if(ids.length){await db.query("DELETE a FROM audit_logs a JOIN contact_messages m ON BINARY a.target_id=BINARY CAST(m.id AS CHAR) WHERE a.action LIKE 'contact.%' AND m.email=?",['student'+suffix+'@example.test']);await db.query('DELETE FROM contact_messages WHERE email=?',['student'+suffix+'@example.test']);await db.query('DELETE FROM audit_logs WHERE actor_id IN (?)',[ids]);await db.query('DELETE FROM payments WHERE booking_id IN (SELECT id FROM bookings WHERE property_id=?)',[property]);await db.query('DELETE FROM bookings WHERE property_id = ?',[property]);await db.query('DELETE FROM properties WHERE id = ?',[property]);await db.query('DELETE FROM users WHERE id IN (?)',[ids]);}
  } finally { await db.end(); }
 }
}
main().catch(e=>{console.error(e);process.exitCode=1;});
