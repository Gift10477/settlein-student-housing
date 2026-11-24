require('dotenv').config();
const db=require('../db');
async function main(){
 const [columns]=await db.query('SHOW COLUMNS FROM properties');
 if(!columns.some(c=>c.Field==='owner_id'))await db.query('ALTER TABLE properties ADD COLUMN owner_id INT NULL, ADD INDEX properties_owner (owner_id)');
 if(!columns.some(c=>c.Field==='review_status'))await db.query('ALTER TABLE properties ADD COLUMN review_status VARCHAR(30) NULL');
 await db.query("UPDATE properties SET review_status=CASE WHEN verified=1 THEN 'approved' ELSE 'pending' END WHERE review_status IS NULL");
 console.log('Landlord ownership and listing review migration complete. Legacy listings remain unassigned.');
}
main().catch(error=>{console.error('Migration failed:',error.code||'UNKNOWN');process.exitCode=1;}).finally(()=>db.end());
