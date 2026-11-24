import test from 'node:test';
import assert from 'node:assert/strict';
import {filterReport,reportCSV} from '../src/services/reports.js';
test('report filters combine dates, search and status without changing source order',()=>{
 const rows=[{id:2,status:'approved',student_name:'Jane',created_at:'2026-11-17T15:00:00Z'},{id:1,status:'pending',student_name:'Jane',created_at:'2026-11-16T12:00:00Z'},{id:3,status:'approved',student_name:'Sam',created_at:'2026-11-18T00:00:00Z'}];
 assert.deepEqual(filterReport(rows,{query:'jane',status:'approved',from:'2026-11-17',to:'2026-11-17'}).map(row=>row.id),[2]);
 assert.deepEqual(filterReport(rows,{sort:'oldest'}).map(row=>row.id),[1,2,3]);
 assert.deepEqual(rows.map(row=>row.id),[2,1,3]);
});
test('CSV includes company and date and escapes spreadsheet formulas, quotes and commas',()=>{
 const csv=reportCSV(['name'],[{name:' =HYPERLINK("bad")'},{name:'Room, A'}],'Listings','2026-11-17');
 assert.ok(csv.includes('"SettleIn","Listings"'));assert.ok(csv.includes('2026-11-17'));
 assert.ok(csv.includes('"\' =HYPERLINK(""bad"")"'));assert.ok(csv.includes('"Room, A"'));
});
