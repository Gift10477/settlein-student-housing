require('dotenv').config({quiet:true});
const db=require('../db');
async function main(){
 const [columns]=await db.query('SHOW COLUMNS FROM properties');
 for(const name of ['gender_policy','furnishing_status']) if(!columns.some(column=>column.Field===name))await db.query(`ALTER TABLE properties ADD COLUMN ${name} VARCHAR(100) NULL`);
 console.log('Listing filter columns ready. Unknown legacy values remain unspecified.');
}
main().catch(error=>{console.error(error.code||error.message);process.exitCode=1;}).finally(()=>db.end());
