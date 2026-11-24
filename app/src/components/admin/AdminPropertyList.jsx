import { useState } from 'react';
import RecordDetails from './RecordDetails';
const categories=[['pending','Pending review'],['approved','Published'],['unpublished','Unpublished'],['rejected','Rejected']];
const status=p=>Number(p.verified)===1?'approved':['rejected','unpublished'].includes(p.review_status)?p.review_status:'pending';
export default function AdminPropertyList({properties,users,busy,onEdit,onReview,onDelete,query}){
 const [category,setCategory]=useState('pending');
 const rows=properties.filter(p=>status(p)===category&&[p.title,p.location,p.type,p.campus,p.id,users.find(u=>String(u.id)===String(p.owner_id))?.email].join(' ').toLowerCase().includes(query.toLowerCase()));
 return <>
  <nav className="status-tabs" aria-label="Listing status">{categories.map(([key,label])=><button key={key} aria-pressed={category===key} onClick={()=>setCategory(key)}>{label}<span>{properties.filter(p=>status(p)===key).length}</span></button>)}</nav>
  <p>{rows.length} {category==='approved'?'published':'hidden'} listing{rows.length===1?'':'s'} · Open details to view the full property record.</p>
  {!rows.length?<div className="portal-empty"><h3>No listings here</h3><p>Choose another status or adjust your search.</p></div>:<div className="portal-records">{rows.map(p=><article className="portal-record" key={p.id}>
   <div className="record-summary">
    {p.image?<img className="property-thumb" src={p.image} alt=""/>:<div className="property-thumb property-thumb-placeholder" aria-hidden="true">{p.title?.slice(0,1)}</div>}
    <div className="record-main"><span className="record-overline">{p.type} · {p.campus}</span><h3>{p.title}</h3><p>{p.location}</p></div>
    <div><span className="record-label">Monthly rent</span><strong>KES {Number(p.price).toLocaleString()}</strong><small>{p.vacant_units} vacant units</small></div>
    <span className={`portal-badge status-${category}`}>{category==='approved'?'Published':category}</span>
    <div className="record-actions"><button disabled={busy} onClick={()=>onEdit(p)}>Edit</button><button className={category==='approved'?'':'portal-primary'} disabled={busy} onClick={()=>onReview(p,category==='approved'?'unpublished':'approved')}>{category==='approved'?'Unpublish':'Approve & publish'}</button>{category!=='rejected'&&<button className="portal-danger" disabled={busy} onClick={()=>onReview(p,'rejected')}>Reject</button>}</div>
   </div>
   <details><summary>View all property details</summary><p>Submitted by: {users.find(u=>String(u.id)===String(p.owner_id))?.email||'Legacy / unassigned'}</p><RecordDetails record={p}/><div className="record-actions"><button className="portal-danger" disabled={busy} onClick={()=>onDelete(p)}>Delete listing</button></div></details>
  </article>)}</div>}
 </>;
}
