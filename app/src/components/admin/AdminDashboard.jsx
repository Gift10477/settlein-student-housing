import { useCallback, useEffect, useRef, useState } from 'react';
import { managementRequest, addProperty, deleteProperty } from '../../services/database';
import AdminPropertyList from './AdminPropertyList';
import AdminRecords from './AdminRecords';
import ReportsView from './ReportsView';
import SupportInbox from './SupportInbox';
import AmenityPicker from '../listings/AmenityPicker';
import options from '../../../../shared/listingOptions.json';
import './Management.css';
const empty={title:'',type:'Bedsitter',price:0,location:'',campus:'strathmore',vacant_units:1,description:'',image:'',phone:'',booking_fee:1000,gender_policy:'Mixed',furnishing_status:'Unfurnished',amenities:[]};
const labels={title:'Property name',type:'Room type',price:'Monthly rent (KES)',location:'Location',campus:'Campus',vacant_units:'Available units',description:'Description',image:'Image URL',phone:'Contact phone',booking_fee:'Booking fee (KES)',gender_policy:'Gender policy',furnishing_status:'Furnishing'};
const sections=[['properties','Listings'],['bookings','Reservations'],['users','Users'],['payments','Payments'],['logs','Activity log'],['reports','Reports'],['support','Support']];
const help={properties:'Review submissions and manage the homes students can discover.',bookings:'Review applications, confirm payments, and manage reservation decisions.',users:'Manage account access and help users regain access.',payments:'Track mock checkout and manually recorded payments. Live payments are not enabled.',logs:'A chronological record of submissions, payments, and administrative decisions.'};
export default function AdminDashboard(){
 const [data,setData]=useState(null),[tab,setTab]=useState('properties'),[query,setQuery]=useState(''),[status,setStatus]=useState('all');
 const [error,setError]=useState(''),[notice,setNotice]=useState(''),[busy,setBusy]=useState(false),[form,setForm]=useState(null),[editing,setEditing]=useState(null);
 const formRef=useRef(null);
 const load=useCallback(()=>managementRequest('/admin/dashboard').then(setData),[]);
 useEffect(()=>{let active=true;managementRequest('/admin/dashboard').then(value=>{if(active)setData(value);}).catch(err=>{if(active)setError(err.message);});return()=>{active=false;};},[]);
 const formOpen=Boolean(form);
 useEffect(()=>{if(formOpen)formRef.current?.scrollIntoView({behavior:'smooth',block:'center'});},[editing,formOpen]);
 async function act(fn){setBusy(true);setError('');setNotice('');try{const result=await fn();await load();if(result?.message)setNotice(result.message);}catch(err){setError(err.message);}finally{setBusy(false);}}
 async function upload(file){if(!file)return;if(file.size>5*1024*1024){setError('Choose an image no larger than 5 MB.');return;}setBusy(true);try{const encoded=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(file);});const result=await managementRequest('/admin/uploads','POST',{data:encoded});setForm(value=>({...value,image:result.url}));}catch(err){setError(err.message);}finally{setBusy(false);}}
 function report(){const rows=[['Reservation','Student','Property','Status','Move in','Booking fee (KES)','Payment status','Payment deadline','Paid at','Reference','Method'],...rows.map(b=>[b.id,b.student_name,b.property_title,b.status,b.move_in_date,b.booking_fee,b.payment_status,b.payment_deadline,b.paid_at,b.payment_reference,b.payment_method])];const csv=rows.map(row=>row.map(value=>'"'+String(value??'').replace(/^[=+@-]/,"'").replaceAll('"','""')+'"').join(',')).join('\r\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));const link=document.createElement('a');link.href=url;link.download='settlein-reservations.csv';link.click();URL.revokeObjectURL(url);}
 const rows=(data?.[tab]||[]).filter(row=>Object.values(row).join(' ').toLowerCase().includes(query.trim().toLowerCase())&&(status==='all'||row.status===status||row.role===status));
 return <section className="management admin-portal">
  <header className="portal-heading"><div><p className="portal-eyebrow">SETTLEIN / MANAGEMENT</p><h1>Your management workspace</h1><p>Everything you need to keep students moving in.</p></div><button disabled={busy} onClick={()=>act(load)}>{busy?'Updating…':'Refresh data'}</button></header>
  {error&&<p role="alert">{error}</p>}{notice&&<p className="portal-notice" role="status">{notice}</p>}
  {data?<>
   <div className="portal-summary"><div><span>Published homes</span><strong>{data.properties.filter(p=>Number(p.verified)===1).length}</strong></div><div><span>Listings to review</span><strong>{data.properties.filter(p=>!Number(p.verified)&&(!p.review_status||p.review_status==='pending')).length}</strong></div><div><span>Pending reservations</span><strong>{data.bookings.filter(b=>b.status==='pending').length}</strong></div><div><span>Registered users</span><strong>{data.users.length}</strong></div></div>
   <nav className="portal-nav" aria-label="Management sections">{sections.map(([key,label])=><button key={key} aria-pressed={tab===key} onClick={()=>{setTab(key);setQuery('');setStatus('all');setForm(null);}}>{label}</button>)}</nav>
   {tab==='reports'?<div className="portal-panel"><ReportsView data={data}/></div>:tab==='support'?<div className="portal-panel"><SupportInbox/></div>:<>
   <div className="portal-panel">
    <div className="portal-toolbar"><div><h2>{sections.find(([key])=>key===tab)[1]}</h2><p>{help[tab]}</p></div>{tab==='properties'&&<button className="portal-primary" disabled={busy} onClick={()=>{setEditing(null);setForm({...empty});}}>+ Add listing</button>}{tab==='bookings'&&<button onClick={report}>Export CSV</button>}</div>
    {tab==='properties'&&form&&<form ref={formRef} onSubmit={event=>{event.preventDefault();act(async()=>{const result=editing?await managementRequest('/admin/properties/'+editing,'PATCH',form):await addProperty({...form,image:form.image||undefined});setForm(null);return result;});}}>
     <div className="portal-form-heading"><h3>{editing?'Edit listing':'Create a listing'}</h3><button type="button" onClick={()=>setForm(null)}>Close</button></div>
     <label>Upload property photo<input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={event=>upload(event.target.files[0])}/></label>
     {Object.keys(empty).filter(key=>key!=='amenities').map(key=><label key={key}>{labels[key]}{['type','gender_policy','furnishing_status'].includes(key)?<select value={form[key]} onChange={event=>setForm({...form,[key]:event.target.value})}>{(key==='type'?options.roomTypes:key==='gender_policy'?options.genderPolicies:options.furnishingStatuses).map(value=><option key={value}>{value}</option>)}</select>:key==='description'?<textarea rows={3} value={form[key]} onChange={event=>setForm({...form,[key]:event.target.value})}/>:<input required={!['image','description'].includes(key)} type={['price','vacant_units','booking_fee'].includes(key)?'number':'text'} min="0" value={form[key]} onChange={event=>setForm({...form,[key]:['price','vacant_units','booking_fee'].includes(key)?Number(event.target.value):event.target.value})}/>}</label>)}
     <AmenityPicker value={form.amenities} onChange={amenities=>setForm({...form,amenities})}/><div className="portal-form-actions"><button type="button" onClick={()=>setForm(null)}>Cancel</button><button className="portal-primary" disabled={busy}>Save listing</button></div>
    </form>}
    <div className="portal-toolbar"><label className="portal-search"><span className="record-label">Search {sections.find(([key])=>key===tab)[1].toLowerCase()}</span><input type="search" placeholder={tab==='properties'?'Name, location, campus or owner…':'Search by name, reference, status or ID…'} value={query} onChange={event=>setQuery(event.target.value)}/></label>{['bookings','users'].includes(tab)&&<label>Filter by {tab==='users'?'role':'status'}<select value={status} onChange={event=>setStatus(event.target.value)}><option value="all">All {tab==='users'?'roles':'statuses'}</option>{(tab==='users'?['student','landlord','admin']:['pending','approved','active','rejected','cancelled']).map(value=><option key={value}>{value}</option>)}</select></label>}{tab!=='properties'&&<p>{rows.length} matching records</p>}</div>
    {tab==='properties'?<AdminPropertyList properties={data.properties} users={data.users} query={query.trim()} busy={busy} onEdit={p=>{setEditing(p.id);setForm(Object.fromEntries(Object.keys(empty).map(key=>[key,key==='amenities'?(Array.isArray(p.amenities)?p.amenities:JSON.parse(p.amenities||'[]')):p[key]??empty[key]])));}} onReview={(p,next)=>act(()=>next==='rejected'?managementRequest('/admin/properties/'+encodeURIComponent(p.id)+'/reject','POST',{}):managementRequest('/admin/properties/'+encodeURIComponent(p.id),'PATCH',{verified:next==='approved'}))} onDelete={p=>{if(window.confirm('Delete '+p.title+'?'))act(()=>deleteProperty(p.id));}}/>:<AdminRecords tab={tab} rows={rows} busy={busy} act={act} load={load} onRequest={managementRequest}/>}
   </div>
   </>}
  </>:<div className="portal-empty"><p>{error?'Unable to load the dashboard. Try refreshing.':'Loading your workspace…'}</p></div>}
 </section>;
}
