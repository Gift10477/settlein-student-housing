import test,{beforeEach,afterEach}from 'node:test';
import assert from 'node:assert/strict';
import {managementRequest,registerUser,loginUser,getCurrentUser,logoutUser,getProperties}from '../src/services/database.js';
const originalFetch=globalThis.fetch;
function memoryStorage(){const values=new Map();return{getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value),removeItem:key=>values.delete(key)};}
beforeEach(()=>{globalThis.localStorage=memoryStorage();globalThis.sessionStorage=memoryStorage();});
afterEach(()=>{globalThis.fetch=originalFetch;delete globalThis.localStorage;delete globalThis.sessionStorage;});
test('listings use the database connection and encode filters',async()=>{
 globalThis.fetch=async(url,options)=>{assert.equal(url,'/data/properties?campus=strathmore&maxPrice=15000');assert.equal(options.headers['X-API-Key'],undefined);return{ok:true,json:async()=>[]};};
 assert.deepEqual(await getProperties({campus:'strathmore',maxPrice:15000,type:'all'}),[]);
});
test('login keeps a session token and authorizes subsequent reads',async()=>{
 globalThis.fetch=async()=>({ok:true,json:async()=>({access_token:'test-token',user:{id:1,role:'admin'}})});
 assert.equal((await loginUser('admin@example.test','password')).success,true);
 assert.equal(getCurrentUser().role,'admin');
 globalThis.fetch=async(url,options)=>{assert.equal(options.headers.Authorization,'Bearer test-token');return{ok:true,json:async()=>({users:[]})};};
 await managementRequest('/admin/dashboard');logoutUser();assert.equal(getCurrentUser(),null);
});
test('registration uses server-confirmed login rather than fabricating an account',async()=>{
 let calls=0;
 globalThis.fetch=async(url,options)=>{calls++;if(calls===1){assert.equal(url,'/data/users');assert.equal(JSON.parse(options.body).phone,undefined);return{ok:true,json:async()=>({user_id:1})};}return{ok:false,json:async()=>({error:'Sign-in failed'})};};
 const result=await registerUser({name:'Student',email:'student@example.test',password:'password',phone:''});
 assert.equal(result.success,false);assert.equal(getCurrentUser(),null);
});
test('server errors are displayed without an offline sign-in bypass',async()=>{
 globalThis.fetch=async()=>({ok:false,json:async()=>({error:'Invalid email or password.'})});
 assert.equal((await loginUser('student@example.test','wrong')).success,false);
 await assert.rejects(managementRequest('/bookings'),/Invalid email or password/);
});
