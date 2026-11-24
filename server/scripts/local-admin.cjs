// One-time local account setup; credentials never enter source control.
require('dotenv').config({quiet:true});
const fs=require('fs');
const path=require('path');
const crypto=require('crypto');
const db=require('../db');
const {hashPassword}=require('../services/passwords');
async function main(){
 const file=path.join(__dirname,'../admin-access.local.txt');
 if(fs.existsSync(file)){console.log('Local administrator instructions already exist.');return;}
 const email='admin@settlein.local',password=crypto.randomBytes(18).toString('base64url');
 const [existing]=await db.query('SELECT id FROM users WHERE email = ?',[email]);
 if(existing.length)throw new Error('Admin email already exists. Use admin:create with your own email.');
 await db.query("INSERT INTO users (name,email,password_hash,role) VALUES (?,?,?,'admin')",['SettleIn Administrator',email,await hashPassword(password)]);
 fs.writeFileSync(file,'SettleIn local administrator\nEmail: '+email+'\nPassword: '+password+'\n\nSign in through the app and select Admin panel. Keep this file private.\n',{flag:'wx'});
 console.log('Local admin created. Credentials saved in server/admin-access.local.txt.');
}
main().catch(e=>{console.error(e.message);process.exitCode=1;}).finally(()=>db.end());
