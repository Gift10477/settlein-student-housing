const router=require('express').Router();
const crypto=require('crypto');
const db=require('../db');
const options=require('../../shared/listingOptions.json');
const {selectProperties,saveAmenities}=require('../services/amenities');
const {validListing}=require('../services/validation');
const {requireRoles,requireAdmin}=require('../middleware/session');
function format(row){
 let amenities=[];
 try{amenities=JSON.parse(row.amenities||'[]');}catch{amenities=String(row.amenities||'').split(',').map(s=>s.trim()).filter(Boolean);}
 const fields=['id','title','type','price','location','campus','distance','verified','image','description','landlord','phone','whatsapp','vacant_units','latitude','longitude','security_deposit','booking_fee','water_included','wifi_included','garbage_included','gender_policy','furnishing_status','created_at'];
 return {...Object.fromEntries(fields.map(key=>[key,row[key]])),price:Number(row.price),verified:Boolean(row.verified),vacant_units:Number(row.vacant_units),amenities:Array.isArray(amenities)?amenities:[],images:row.image?[row.image]:[]};
}
router.get('/',async(req,res,next)=>{
 try{
  let sql=selectProperties+' WHERE verified = 1';const params=[];
  for(const key of ['campus','type','gender_policy','furnishing_status'])if(req.query[key]&&req.query[key]!=='all'){sql+=` AND ${key} = ?`;params.push(req.query[key]);}
  for(const [key,operator] of [['minPrice','>='],['maxPrice','<=']])if(req.query[key]!==undefined){const price=Number(req.query[key]);if(!Number.isFinite(price)||price<0)return res.status(400).json({error:'Invalid price filter.'});sql+=` AND price ${operator} ?`;params.push(price);}
  if(req.query.search){sql+=' AND (title LIKE ? OR location LIKE ? OR type LIKE ?)';const search='%'+req.query.search+'%';params.push(search,search,search);}
  const selected=String(req.query.amenities||'').split(',').map(value=>value.trim()).filter(Boolean);
  if(selected.some(value=>!options.amenities.includes(value)))return res.status(400).json({error:'Invalid amenity filter.'});
  const [rows]=await db.query(sql+' ORDER BY created_at DESC',params);
  res.json(rows.map(format).filter(row=>selected.every(value=>row.amenities.some(item=>String(item).trim().toLowerCase()===value.toLowerCase()))));
 }catch(error){next(error);}
});
router.get('/mine',requireRoles('landlord'),async(req,res,next)=>{
 try{const [rows]=await db.query(selectProperties+' WHERE owner_id = ? ORDER BY created_at DESC',[req.userId]);res.json(rows.map(row=>({...format(row),review_status:row.review_status})));}catch(error){next(error);}
});
router.get('/:id',async(req,res,next)=>{
 try{const [rows]=await db.query(selectProperties+' WHERE id = ? AND verified = 1',[req.params.id]);if(!rows[0])return res.status(404).json({error:'Listing not found.'});res.json(format(rows[0]));}catch(error){next(error);}
});
router.post('/',requireRoles('landlord','admin'),async(req,res,next)=>{
 if(!validListing(req.body))return res.status(400).json({error:'Check listing values, lengths, image URL and selected room options.'});
 const allowed=['title','type','price','location','campus','description','phone','amenities','image','vacant_units','gender_policy','furnishing_status','booking_fee'];
 if(Object.keys(req.body).some(key=>!allowed.includes(key)))return res.status(400).json({error:'Invalid listing fields.'});
 const required=['title','type','location','campus'];
 if(required.some(key=>typeof req.body[key]!=='string'||!req.body[key].trim()||req.body[key].length>255)||!Number.isInteger(req.body.price)||req.body.price<0||req.body.verified!==undefined)return res.status(400).json({error:'Enter a title, room type, location, campus and valid rent.'});
 const {title,type,price,location,campus,description='',phone='',amenities=[],image='',vacant_units=1,gender_policy=null,furnishing_status=null,booking_fee=1000}=req.body;
 if((gender_policy!==null&&!options.genderPolicies.includes(gender_policy))||(furnishing_status!==null&&!options.furnishingStatuses.includes(furnishing_status)))return res.status(400).json({error:'Choose a valid gender policy and furnishing status.'});
 if(!Array.isArray(amenities)||amenities.some(value=>!options.amenities.includes(value)))return res.status(400).json({error:'Choose amenities from the available options.'});
 if(!Number.isInteger(vacant_units)||vacant_units<0||[description,phone,image].some(value=>typeof value!=='string')||!(typeof amenities==='string'||Array.isArray(amenities)&&amenities.every(value=>typeof value==='string')))return res.status(400).json({error:'Invalid listing details.'});
 const id='prop-'+crypto.randomUUID();
 let connection;
 try{
  connection=await db.getConnection();await connection.beginTransaction();
  await connection.query("INSERT INTO properties (id,title,type,price,location,campus,description,phone,image,vacant_units,gender_policy,furnishing_status,booking_fee,verified,owner_id,review_status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,0,?,'pending')",[id,title,type,price,location,campus,description,phone,image,vacant_units,gender_policy,furnishing_status,booking_fee,req.userId]);
  await connection.query('INSERT INTO audit_logs (actor_id,action,target_id) VALUES (?,?,?)',[req.userId,'listing.submitted',id]);
  await saveAmenities(connection,id,amenities);
  await connection.commit();
  res.status(201).json({property:{id,title,verified:false},message:'Listing submitted for verification.'});
 }catch(error){if(connection)await connection.rollback();next(error);}finally{if(connection)connection.release();}
});
router.delete('/:id',requireAdmin,async(req,res,next)=>{
 try{
  const [bookings]=await db.query('SELECT id FROM bookings WHERE property_id = ? LIMIT 1',[req.params.id]);
  if(bookings.length)return res.status(409).json({error:'This listing has reservation history. Unpublish it instead.'});
  const [result]=await db.query('DELETE FROM properties WHERE id = ?',[req.params.id]);
  if(!result.affectedRows)return res.status(404).json({error:'Listing not found.'});
  await db.query('INSERT INTO audit_logs (actor_id,action,target_id) VALUES (?,?,?)',[req.userId,'listing.deleted',req.params.id]);
  res.json({message:'Listing deleted.'});
 }catch(error){next(error);}
});
module.exports=router;
