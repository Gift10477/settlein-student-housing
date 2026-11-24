import { useCallback, useEffect, useState } from 'react';
import { addProperty, managementRequest } from '../../services/database';
import '../admin/Management.css';
import AmenityPicker from '../listings/AmenityPicker';
import options from '../../../../shared/listingOptions.json';
const empty = { title: '', type: 'Bedsitter', price: '', location: '', campus: 'strathmore', description: '', phone: '', amenities: [], gender_policy: 'Mixed', furnishing_status: 'Unfurnished', image: '', vacant_units: 1 };
const labels = {title:'Property name',type:'Room type',price:'Monthly rent (KES)',location:'Location',campus:'Nearest campus',description:'Description',phone:'Contact phone',gender_policy:'Gender policy',furnishing_status:'Furnishing',amenities:'Amenities',image:'Photo URL (optional)',vacant_units:'Available units'};
export default function LandlordPortal({ onToast }) {
  const [form, setForm] = useState({ ...empty });
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const load = useCallback(() => managementRequest('/properties/mine')
    .then(rows => { setRows(rows); setError(''); })
    .catch(err => setError(err.message)), []);
  useEffect(() => { load(); const timer = setInterval(load, 15000); return () => clearInterval(timer); }, [load]);
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      await addProperty({ ...form, price: Number(form.price), vacant_units: Number(form.vacant_units) });
      setForm({ ...empty });
      onToast('Listing submitted. An administrator will review it before publication.');
      await load();
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  return <section className="management">
    <h1>Landlord portal</h1>
    <p>Submit your property for review. Only approved listings appear to students.</p>
    {error && <p role="alert">{error}</p>}
    <form onSubmit={submit}>
      {Object.keys(empty).filter(key=>key!=='amenities').map(key => <label key={key}>{labels[key]}
        {['type','campus','gender_policy','furnishing_status'].includes(key) ? <select value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})}>{(key==='type'?options.roomTypes:key==='gender_policy'?options.genderPolicies:key==='furnishing_status'?options.furnishingStatuses:['strathmore','uon','ku','jkuat']).map(value=><option key={value}>{value}</option>)}</select> : key==='description' ? <textarea required rows={4} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})}/> : <input required={!['amenities','image'].includes(key)} type={['price','vacant_units'].includes(key)?'number':key==='image'?'url':key==='phone'?'tel':'text'} min={key==='vacant_units'?1:0} step="1" value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})}/>}
      </label>)}
      <AmenityPicker value={form.amenities} onChange={amenities=>setForm({...form,amenities})}/>
      <button disabled={busy}>{busy ? 'Submitting…' : 'Submit for approval'}</button>
    </form>
    <h2>My listings</h2><button onClick={load}>Refresh status</button>
    <div className="management-list">{rows.map(row => <article key={row.id}>
      <h3>{row.title}</h3><p>{row.location} · KES {Number(row.price).toLocaleString()} per month</p>
      <p><strong>{({ pending: 'Awaiting admin review', approved: 'Approved and published', rejected: 'Rejected', unpublished: 'Unpublished' })[row.review_status] || 'Awaiting admin review'}</strong></p>
      <p>{row.description}</p>
    </article>)}</div>
    {!rows.length && !error && <p>You have not submitted any listings yet.</p>}
  </section>;
}
