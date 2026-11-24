require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
async function main() {
 const source = process.env.SOURCE_DB_NAME || 'settlein_db';
 const target = 'settlein_se_db';
 if(source === target || !/^[a-zA-Z0-9_]+$/.test(source)) throw new Error('Invalid source database');
 const c = await mysql.createConnection({host:process.env.DB_HOST || 'localhost',port:Number(process.env.DB_PORT)||3306,user:process.env.DB_USER||'root',password:process.env.DB_PASSWORD||'',multipleStatements:true});
 try {
  const [existing] = await c.query('SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?',[target]);
  if(existing.length) throw new Error('Copy already exists; refusing to overwrite it.');
  const [tables] = await c.query("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_TYPE = 'BASE TABLE'",[source]);
  if(!tables.length) throw new Error('Source database missing or empty.');
  await c.query(`CREATE DATABASE \`${target}\``);
  await c.query('SET FOREIGN_KEY_CHECKS=0');
  for(const row of tables) {
   const t = row.TABLE_NAME.replace(/`/g,'``');
   await c.query(`CREATE TABLE \`${target}\`.\`${t}\` LIKE \`${source}\`.\`${t}\``);
   await c.query(`INSERT INTO \`${target}\`.\`${t}\` SELECT * FROM \`${source}\`.\`${t}\``);
  }
  await c.query('SET FOREIGN_KEY_CHECKS=1');
  await c.query(`USE \`${target}\``);
  await c.query(fs.readFileSync(path.join(__dirname,'../database/management.sql'),'utf8'));
  console.log('Copied data into settlein_se_db. Original database unchanged.');
 } finally { await c.end(); }
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
