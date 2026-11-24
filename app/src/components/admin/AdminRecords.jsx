import BookingPayment from './BookingPayment';
import RecordDetails from './RecordDetails';

const date = value => value ? new Date(value).toLocaleString() : '—';
export default function AdminRecords({ tab, rows, busy, act, load, onRequest }) {
  if (!rows.length) return <div className="portal-empty"><h3>No matching records</h3><p>Try another search or return after new activity.</p></div>;
  return <div className="portal-records">{rows.map(row => <article className="portal-record" key={row.id}>
    {tab === 'bookings' && <>
      <div className="record-summary">
        <div className="record-main"><span className="record-overline">Reservation #{row.id}</span><h3>{row.property_title}</h3><p>{row.student_name || 'Student'} · {row.email}</p></div>
        <div><span className="record-label">Move in</span><strong>{row.move_in_date?.slice(0,10) || '—'}</strong></div>
        <div><span className="record-label">Booking fee</span><strong>KES {Number(row.booking_fee || 0).toLocaleString()}</strong><span className={`portal-badge ${row.payment_status === 'paid' ? 'status-approved' : 'status-pending'}`}>{row.payment_overdue ? 'Overdue' : row.payment_status || 'Legacy'}</span></div>
        <span className={`portal-badge status-${row.status}`}>{row.status}</span>
        <div className="record-actions">{(row.status==='pending'?['approved','rejected','cancelled']:['active','approved'].includes(row.status)?['cancelled']:[]).map(status=><button className={status==='approved'?'portal-primary':status==='rejected'?'portal-danger':''} key={status} disabled={busy||(status==='approved'&&row.payment_status!=='paid')} title={status==='approved'&&row.payment_status!=='paid'?'Payment is required before approval':undefined} onClick={()=>act(()=>onRequest('/admin/bookings/'+row.id,'PATCH',{status}))}>{status==='approved'?'Approve':status==='rejected'?'Reject':'Cancel'}</button>)}</div>
      </div>
      <details><summary>Payment &amp; reservation details</summary><BookingPayment booking={row} admin onUpdated={load}/><RecordDetails record={row}/></details>
    </>}
    {tab === 'users' && <div className="record-summary">
      <div className="record-main"><span className="record-overline">Account #{row.id}</span><h3>{row.name}</h3><p>{row.email}</p></div>
      <span className="portal-badge">{row.role}</span>
      <div className="record-actions"><label>Access role<select aria-label={'Role for '+row.email} value={row.role} disabled={busy} onChange={event=>{const role=event.target.value;if(window.confirm('Change access for '+row.email+' to '+role+'?'))act(()=>onRequest('/admin/users/'+row.id,'PATCH',{role}));}}>{['student','landlord','admin'].map(role=><option key={role}>{role}</option>)}</select></label><button disabled={busy} onClick={()=>{const password=window.prompt('New password (8–128 characters). Share privately with the user.');if(password)act(()=>onRequest('/admin/users/'+row.id,'PATCH',{password}));}}>Reset password</button></div>
    </div>}
    {tab === 'payments' && <>
      <div className="record-summary"><div className="record-main"><span className="record-overline">Payment #{row.id}</span><h3>Reservation #{row.booking_id}</h3><p className="record-reference">{row.reference || 'No reference'}</p></div><div><span className="record-label">Amount</span><strong>KES {Number(row.amount).toLocaleString()}</strong></div><div><span className="record-label">Received</span><strong>{date(row.paid_at||row.created_at)}</strong><small>{row.payment_method || 'Manual'}</small></div><span className="portal-badge status-approved">{row.status}</span></div>
      <details><summary>Payment details</summary><RecordDetails record={row}/></details>
    </>}
    {tab === 'logs' && <div className="record-summary"><div className="record-main"><span className="record-overline">Activity #{row.id}</span><h3>{row.action.replaceAll('.',' · ').replaceAll('_',' ')}</h3><p>Record: {row.target_id}</p></div><div><span className="record-label">Actor</span><strong>{row.actor_name || (row.actor_id ? 'Account #'+row.actor_id : 'Guest / legacy')}</strong></div><time>{date(row.created_at)}</time></div>}
  </article>)}</div>;
}
