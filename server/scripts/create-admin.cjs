require('dotenv').config();
const db = require('../db');
const { hashPassword } = require('../services/passwords');
async function main() {
 const { ADMIN_EMAIL:email, ADMIN_PASSWORD:password } = process.env;
 if(!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !password || password.length < 8 || password.length > 128) throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD (8-128 characters) locally.');
 const [rows] = await db.query('SELECT id FROM users WHERE email = ?',[email]);
 if(rows.length) throw new Error('Account already exists; refusing to overwrite it.');
 await db.query("INSERT INTO users (name,email,password_hash,role) VALUES (?,?,?,'admin')",['SettleIn Administrator',email,await hashPassword(password)]);
 console.log('Administrator created. Sign in through the app.');
}
main().catch(e=>{console.error(e.message);process.exitCode=1;}).finally(()=>db.end());
