// Verify a clean installation in a disposable database; never replace application data.
require('dotenv').config({quiet:true});
const mysql=require('mysql2/promise');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const assert=require('node:assert/strict');
const {spawnSync}=require('node:child_process');
async function main(){
 if(process.env.NODE_ENV==='production')throw new Error('Run this verification only against local MySQL.');
 const name='settlein_verify_'+crypto.randomBytes(8).toString('hex');
 const connection=await mysql.createConnection({host:process.env.DB_HOST||'localhost',port:Number(process.env.DB_PORT)||3306,user:process.env.DB_USER||'root',password:process.env.DB_PASSWORD||''});
 let created=false;
 try{
  await connection.query('CREATE DATABASE '+name);created=true;await connection.query('USE '+name);
  for(const sql of fs.readFileSync(path.join(__dirname,'../database/schema.sql'),'utf8').split(';').filter(s=>s.trim()))await connection.query(sql);
  const [tables]=await connection.query('SHOW TABLES');assert.equal(tables.length,11);
  await assert.rejects(connection.query("INSERT INTO bookings (user_id,property_id) VALUES (999999,'missing')"),error=>error.code==='ER_NO_REFERENCED_ROW_2');
  const [columns]=await connection.query('SHOW COLUMNS FROM bookings');assert.ok(!columns.some(c=>['payment_status','payment_reference','paid_at','payment_method'].includes(c.Field)));
  const result=spawnSync(process.execPath,[path.join(__dirname,'prepare-database.cjs')],{env:{...process.env,NODE_ENV:'production',DB_NAME:name},encoding:'utf8'});
  if(result.status!==0)throw new Error('Fresh migration failed: '+result.stderr);
  console.log('PASS: clean schema installation, foreign keys and repeatable migrations in an isolated temporary database.');
 }finally{
  if(created&&/^settlein_verify_[a-f0-9]{16}$/.test(name))await connection.query('DROP DATABASE '+name);
  await connection.end();
 }
}
main().catch(error=>{console.error(error.code||error.message);process.exitCode=1;});
