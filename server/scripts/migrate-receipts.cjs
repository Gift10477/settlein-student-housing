require('dotenv').config();
const db=require('../db');
async function main(){
 const [paymentColumns]=await db.query('SHOW COLUMNS FROM payments');
 if(!paymentColumns.some(c=>c.Field==='method'))await db.query('ALTER TABLE payments ADD COLUMN method VARCHAR(20) NULL');
 if(!paymentColumns.some(c=>c.Field==='paid_at'))await db.query('ALTER TABLE payments ADD COLUMN paid_at VARCHAR(30) NULL');
 const [columns]=await db.query('SHOW COLUMNS FROM bookings');
 if(!columns.some(c=>c.Field==='payment_required'))await db.query('ALTER TABLE bookings ADD COLUMN payment_required TINYINT(1) NOT NULL DEFAULT 1');
 if(columns.some(c=>c.Field==='payment_status')){
  const [bookings]=await db.query('SELECT * FROM bookings');
  for(const row of bookings){
   await db.query('INSERT IGNORE INTO migration_archive (source_table,source_id,snapshot,reason) VALUES (?,?,?,?)',['booking_receipts',String(row.id),JSON.stringify(row),'Receipt data moved to payments; original row preserved.']);
   await db.query('UPDATE bookings SET payment_required=? WHERE id=?',[row.payment_status==='not_required'?0:1,row.id]);
   const [paid]=await db.query("SELECT id FROM payments WHERE booking_id=? AND status='paid' ORDER BY id DESC LIMIT 1",[row.id]);
   if(row.payment_status==='paid'&&!paid.length){
    await db.query("INSERT INTO payments (booking_id,amount,status,reference,method,paid_at) VALUES (?,?,'paid',?,?,?)",[row.id,row.booking_fee||0,row.payment_reference,row.payment_method||'manual',row.paid_at]);
   }else if(paid.length){
    await db.query('UPDATE payments SET method=COALESCE(method,?),paid_at=COALESCE(paid_at,?) WHERE id=?',[row.payment_method||'manual',row.paid_at,paid[0].id]);
   }
  }
  await db.query('ALTER TABLE bookings DROP COLUMN payment_status,DROP COLUMN paid_at,DROP COLUMN payment_reference,DROP COLUMN payment_method');
 }
 console.log('Receipt normalization complete. Payment details now have one source of truth.');
}
main().catch(error=>{console.error(error.code||error.message);process.exitCode=1;}).finally(()=>db.end());
