const router = require('express').Router();
const db = require('../db');
const { hashPassword, verifyPassword } = require('../services/passwords');
const { issueSession, requireUser, requireOwner, revokeUserSessions } = require('../middleware/session');
const fields = ['id','name','email','student_id','course','campus','residence_area','phone','role'];
const publicUser = user => Object.fromEntries(fields.map(key => [key,user[key]]));
const emailValid = value => typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const {rateLimit}=require('../middleware/security');
const audit=require('../services/audit');
const {validProfile}=require('../services/validation');
router.post('/', rateLimit(10), async (req,res,next) => {
  const { name,email,password,role = 'student',student_id = '',course = '',campus = '',residence_area = '',phone = '' } = req.body;
  if(!validProfile({name,email,student_id,course,campus,residence_area,phone}))return res.status(400).json({error:'Check your profile fields: name, email, student ID, course and residence must be at most 100 characters; campus and phone at most 50.'});
  if (typeof name !== 'string' || !name.trim() || name.length > 255 || !emailValid(email) || typeof password !== 'string' || password.length < 8 || password.length > 128 || !['student','landlord'].includes(role) || [student_id,course,campus,residence_area,phone].some(value => typeof value !== 'string' || value.length > 255)) return res.status(400).json({error:'Enter valid account details and a password of 8-128 characters.'});
  try {
    const [result] = await db.query('INSERT INTO users (name,email,password_hash,role,student_id,course,campus,residence_area,phone) VALUES (?,?,?,?,?,?,?,?,?)',[name.trim(),email.trim().toLowerCase(),await hashPassword(password),role,student_id,course,campus,residence_area,phone]);
    await audit(db,result.insertId,'user.registered',result.insertId);
    res.status(201).json({user_id:result.insertId});
  } catch(error) { if(error.code === 'ER_DUP_ENTRY') return res.status(409).json({error:'An account with this email already exists.'}); next(error); }
});
router.post('/login', rateLimit(), async (req,res,next) => {
  const { email,password } = req.body;
  if (!emailValid(email) || typeof password !== 'string' || password.length > 128) return res.status(400).json({error:'Enter your email and password.'});
  try {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?',[email.trim().toLowerCase()]);
    if(!rows[0] || !await verifyPassword(password,rows[0].password_hash)) {await audit(db,rows[0]?.id,'user.login_failed',rows[0]?.id || 'unknown');return res.status(401).json({error:'Invalid email or password.'});}
    const [security]=await db.query('SELECT * FROM user_security WHERE user_id=?',[rows[0].id]);
    if(security[0]?.enabled){
      const totp=require('../services/totp');
      const counter=totp.verify(totp.decrypt(security[0].secret),req.body.code,security[0].last_counter);
      if(counter===null)return res.status(401).json({error:'Enter a fresh six-digit code from your authenticator app.'});
      const [used]=await db.query('UPDATE user_security SET last_counter=? WHERE user_id=? AND last_counter<?',[counter,rows[0].id,counter]);
      if(!used.affectedRows)return res.status(401).json({error:'This code was already used. Wait for a new code.'});
    }
    await audit(db,rows[0].id,'user.login',rows[0].id);
    res.json({user:publicUser(rows[0]),access_token:issueSession(rows[0].id)});
  } catch(error) { next(error); }
});
router.post('/logout',requireUser,async(req,res,next) => {revokeUserSessions(req.userId);try{await audit(db,req.userId,'user.logout',req.userId);res.json({message:'Signed out.'});}catch(error){next(error);}});
router.get('/:id',requireOwner(req=>req.params.id),async(req,res,next)=>{
  try {const [rows]=await db.query('SELECT * FROM users WHERE id = ?',[req.params.id]);if(!rows[0])return res.status(404).json({error:'Account not found.'});res.json(publicUser(rows[0]));}catch(error){next(error);}
});
router.put('/:id',requireOwner(req=>req.params.id),async(req,res,next)=>{
  const allowed=['name','email','student_id','course','campus','residence_area','phone'];
  const entries=Object.entries(req.body);
  if(!validProfile(req.body))return res.status(400).json({error:'Profile fields are missing, invalid or too long.'});
  if(!entries.length || entries.some(([key,value])=>!allowed.includes(key)||typeof value!=='string'||value.length>255||(key==='email'&&!emailValid(value))||(key==='name'&&!value.trim())))return res.status(400).json({error:'Invalid profile details.'});
  let connection;
  try {connection=await db.getConnection();await connection.beginTransaction();await connection.query(`UPDATE users SET ${entries.map(([key])=>`${key} = ?`).join(', ')} WHERE id = ?`,[...entries.map(([key,value])=>key==='email'?value.trim().toLowerCase():value.trim()),req.params.id]);await audit(connection,req.userId,'user.profile_updated',req.params.id);await connection.commit();res.json({message:'Profile updated.'});}catch(error){if(connection)await connection.rollback();if(error.code==='ER_DUP_ENTRY')return res.status(409).json({error:'That email is already registered.'});next(error);}finally{if(connection)connection.release();}
});
module.exports=router;
