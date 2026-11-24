const router = require('express').Router();
const db = require('../db');
const { requireAdmin, revokeUserSessions } = require('../middleware/session');
const { hashPassword } = require('../services/passwords');
const { paymentFields, recordPayment } = require('../services/bookingPayments');
const { selectProperties, saveAmenities } = require('../services/amenities');
const { validListing } = require('../services/validation');
const {bookingFields,bookingSelect}=require('../services/bookingQuery');
router.use(requireAdmin);
router.post('/bookings/:id/payment', recordPayment(true));
router.post('/uploads', async (req, res, next) => {
  const { data } = req.body;
  if (typeof data !== 'string' || !/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(data)) return res.status(400).json({ error: 'Choose a JPEG, PNG or WebP image' });
  const bytes = Buffer.from(data.slice(data.indexOf(',') + 1), 'base64');
  const extension = bytes.subarray(0,3).equals(Buffer.from([255,216,255])) ? 'jpg' : bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])) ? 'png' : bytes.toString('ascii',0,4) === 'RIFF' && bytes.toString('ascii',8,12) === 'WEBP' ? 'webp' : null;
  if (!extension || bytes.length > 5*1024*1024) return res.status(400).json({ error: 'Upload a valid image no larger than 5 MB' });
  try {
    const path = require('path');
    const fs = require('fs/promises');
    const name = require('crypto').randomUUID() + '.' + extension;
    const folder = process.env.UPLOAD_DIR || path.join(__dirname, '../uploads');
    await fs.mkdir(folder, { recursive: true });
    await fs.writeFile(path.join(folder,name), bytes, { flag: 'wx' });
    res.status(201).json({ url: '/data/uploads/' + name });
  } catch (error) { next(error); }
});
async function audit(connection, actor, action, target) {
  await connection.query('INSERT INTO audit_logs (actor_id, action, target_id) VALUES (?, ?, ?)', [actor, action, String(target)]);
}
router.get('/dashboard', async (req, res, next) => {
  try {
    const [properties] = await db.query(selectProperties+' ORDER BY created_at DESC');
    const [bookings] = await db.query('SELECT '+bookingFields+', u.name AS student_name, u.email FROM bookings LEFT JOIN users u ON u.id=bookings.user_id ORDER BY bookings.id DESC');
    const [users] = await db.query('SELECT id, name, email, role, created_at FROM users ORDER BY id DESC');
    const [payments] = await db.query('SELECT p.*, p.method AS payment_method FROM payments p ORDER BY p.id DESC');
    const [logs] = await db.query('SELECT a.*,u.name AS actor_name FROM audit_logs a LEFT JOIN users u ON u.id=a.actor_id ORDER BY a.id DESC');
    res.json({ properties, bookings: bookings.map(paymentFields), users, payments, logs });
  } catch (error) { next(error); }
});
router.patch('/properties/:id', async (req, res, next) => {
  if (!Object.keys(req.body).length || !validListing(req.body)) return res.status(400).json({ error: 'Check listing values, lengths and selected options.' });
  const entries = Object.entries(req.body).filter(([key])=>key!=='amenities');
  let connection;
  try {
    connection=await db.getConnection();await connection.beginTransaction();
    const [existing]=await connection.query('SELECT id FROM properties WHERE id=? FOR UPDATE',[req.params.id]);
    if(!existing.length){await connection.rollback();return res.status(404).json({error:'Listing not found'});}
    if(req.body.verified !== undefined) entries.push(['review_status',req.body.verified?'approved':'unpublished']);
    if(entries.length)await connection.query(`UPDATE properties SET ${entries.map(([key]) => `${key} = ?`).join(', ')} WHERE id = ?`, [...entries.map(([,value]) => value),req.params.id]);
    if(req.body.amenities)await saveAmenities(connection,req.params.id,req.body.amenities);
    await audit(connection,req.userId,req.body.verified === true ? 'listing.approved' : req.body.verified === false ? 'listing.unpublished' : 'listing.updated',req.params.id);
    await connection.commit();
    res.json({ message: 'Listing updated' });
  } catch(error) {if(connection)await connection.rollback();next(error);}finally{if(connection)connection.release();}
});
router.post('/properties/:id/reject', async(req,res,next)=>{
  let connection;
  try{
    connection=await db.getConnection();await connection.beginTransaction();
    const [result]=await connection.query("UPDATE properties SET verified=0, review_status='rejected' WHERE id=?",[req.params.id]);
    if(!result.affectedRows){await connection.rollback();return res.status(404).json({error:'Listing not found'});}
    await audit(connection,req.userId,'listing.rejected',req.params.id);
    await connection.commit();res.json({message:'Listing rejected and hidden from public listings.'});
  }catch(error){if(connection)await connection.rollback();next(error);}finally{if(connection)connection.release();}
});
router.patch('/bookings/:id', async (req,res,next) => {
  const status = req.body.status;
  if (!['approved','rejected','cancelled'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();
    const [rows] = await connection.query(bookingSelect+' WHERE id = ? FOR UPDATE',[req.params.id]);
    const booking = rows[0];
    if (!booking) { await connection.rollback(); return res.status(404).json({ error: 'Reservation not found' }); }
    if (!(booking.status === 'pending' || (['approved','active'].includes(booking.status) && status === 'cancelled'))) { await connection.rollback(); return res.status(409).json({ error: 'Reservation already processed' }); }
    if (status === 'approved') {
      if (booking.payment_status !== 'paid') { await connection.rollback(); return res.status(409).json({ error: 'Booking fee must be paid before approval.' }); }
      const [result] = await connection.query('UPDATE properties SET vacant_units = vacant_units - 1 WHERE id = ? AND vacant_units > 0 AND verified = 1',[booking.property_id]);
      if (!result.affectedRows) { await connection.rollback(); return res.status(409).json({ error: 'No verified vacant room remains' }); }
    }
    if (status === 'cancelled' && booking.status === 'approved') await connection.query('UPDATE properties SET vacant_units = vacant_units + 1 WHERE id = ?',[booking.property_id]);
    await connection.query('UPDATE bookings SET status = ? WHERE id = ?',[status,booking.id]);
    await audit(connection,req.userId,`reservation.${status}`,booking.id);
    await connection.commit(); res.json({ message: `Reservation ${status}` });
  } catch(error) { if(connection) await connection.rollback(); next(error); } finally { if(connection) connection.release(); }
});
router.patch('/users/:id', async (req,res,next) => {
  const { role,password } = req.body;
  if (String(req.params.id) === req.userId) return res.status(400).json({ error: 'Another administrator must change your account' });
  if ((role === undefined) === (password === undefined) || (role !== undefined && !['admin','student','landlord'].includes(role)) || (password !== undefined && (typeof password !== 'string' || password.length < 8 || password.length > 128))) return res.status(400).json({ error: 'Choose a role or password of 8-128 characters' });
  let connection;
  try {
    connection=await db.getConnection();await connection.beginTransaction();
    const [result] = await connection.query(`UPDATE users SET ${role !== undefined ? 'role' : 'password_hash'} = ? WHERE id = ?`,[role !== undefined ? role : await hashPassword(password),req.params.id]);
    if (!result.affectedRows){await connection.rollback();return res.status(404).json({ error: 'User not found' });}
    await audit(connection,req.userId,role !== undefined ? 'user.role_changed' : 'user.password_reset',req.params.id);
    await connection.commit();revokeUserSessions(req.params.id);
    res.json({ message: 'User updated; sessions revoked' });
  } catch(error) {if(connection)await connection.rollback();next(error);}finally{if(connection)connection.release();}
});
module.exports = router;
