require('dotenv').config({quiet:true});
const assert=require('node:assert/strict');
const crypto=require('crypto');
const db=require('../db');
const {hashPassword}=require('../services/passwords');
async function main(){
 const suffix=crypto.randomUUID(),password=crypto.randomBytes(24).toString('hex');
 const email=`review-${suffix}@example.test`,property=`review-${suffix}`;
 let actor;
 try{
  const [user]=await db.query('INSERT INTO users (name,email,password_hash,role) VALUES (?,?,?,?)',['Temporary review check',email,await hashPassword(password),'admin']);actor=user.insertId;
  await db.query("INSERT INTO properties (id,title,type,price,location,campus,verified,owner_id,review_status) VALUES (?,?,?,?,?,?,0,?,'pending')",[property,'Temporary review check','Bedsitter',1000,'Test','strathmore',actor]);
  const base=`http://127.0.0.1:${process.env.PORT||5001}/data`;
  const login=await fetch(base+'/users/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})});
  assert.equal(login.status,200,'Live login');const {access_token}=await login.json();
  const headers={'Content-Type':'application/json',Authorization:`Bearer ${access_token}`};
  const rejected=await fetch(base+'/admin/properties/'+property+'/reject',{method:'POST',headers,body:'{}'});
  console.log('Live rejection HTTP status:',rejected.status);
  assert.equal(rejected.status,200,'Live rejection route must be available');
  const [rows]=await db.query('SELECT verified,review_status FROM properties WHERE id=?',[property]);
  assert.equal(rows[0].verified,0);assert.equal(rows[0].review_status,'rejected');
  assert.equal((await fetch(base+'/properties/'+property)).status,404);
  const publish=await fetch(base+'/admin/properties/'+property,{method:'PATCH',headers,body:JSON.stringify({verified:true})});assert.equal(publish.status,200);
  assert.equal((await fetch(base+'/properties/'+property)).status,200);
  await db.query('UPDATE properties SET gender_policy=?, furnishing_status=? WHERE id=?',['Female-only','Furnished',property]);
  await require('../services/amenities').saveAmenities(db,property,['Wi-Fi','CCTV']);
  for(const [query,expected] of [['gender_policy=Female-only&furnishing_status=Furnished&amenities=Wi-Fi,CCTV',true],['gender_policy=Male-only',false],['furnishing_status=Unfurnished',false],['amenities=Gym',false]]){
   const result=await fetch(base+'/properties?'+query);assert.equal(result.status,200);const listings=await result.json();assert.equal(listings.some(item=>item.id===property),expected,'Live filter: '+query);
  }
  console.log('PASS: live gender, furnishing and amenities filters.');
  const unpublish=await fetch(base+'/admin/properties/'+property,{method:'PATCH',headers,body:JSON.stringify({verified:false})});assert.equal(unpublish.status,200);
  const [hidden]=await db.query('SELECT verified,review_status FROM properties WHERE id=?',[property]);
  assert.equal(hidden[0].review_status,'unpublished');assert.equal(hidden[0].verified,0);
  assert.equal((await fetch(base+'/properties/'+property)).status,404);
  await fetch(base+'/users/logout',{method:'POST',headers});
  console.log('PASS: live rejection, publication and unpublication persist and control public visibility.');
 }finally{
  if(actor){await db.query('DELETE FROM audit_logs WHERE actor_id=?',[actor]);await db.query('DELETE FROM properties WHERE id=? AND owner_id=?',[property,actor]);await db.query('DELETE FROM users WHERE id=?',[actor]);}
  await db.end();
 }
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
