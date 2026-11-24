import { useEffect, useState } from 'react';
import { managementRequest } from '../../services/database';
import './Management.css';

export default function BookingPayment({ booking, admin = false, onUpdated }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [reference, setReference] = useState('');
  const [paidAt, setPaidAt] = useState('');
  const [recording, setRecording] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer); }, []);
  const overdue = booking.payment_status === 'unpaid' && new Date(booking.payment_deadline).getTime() <= now;
  async function pay(event) {
    event.preventDefault();
    setBusy(true); setError('');
    try {
      const id = booking.id || booking.booking_id;
      await managementRequest(admin ? `/admin/bookings/${id}/payment` : `/bookings/${id}/mock-payment`, 'POST', admin ? { reference, ...(paidAt ? { paid_at: new Date(paidAt).toISOString() } : {}) } : {});
      setRecording(false);
      await onUpdated();
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  if (!booking.payment_status || booking.payment_status === 'not_required') return <p>Legacy reservation — no booking fee required.</p>;
  return <div className="booking-payment">
    <p><strong>Booking fee: KES {Number(booking.booking_fee).toLocaleString()}</strong> · {booking.payment_status === 'paid' ? 'Paid' : overdue ? 'Overdue — unpaid' : 'Awaiting payment'}</p>
    <p>Payment deadline: {new Date(booking.payment_deadline).toLocaleString()} (your local time)</p>
    {booking.payment_status === 'paid' ? <>
      <p>{booking.payment_method === 'mock' ? 'Mock payment · No money charged' : 'Payment recorded by administrator'}</p>
      <p>Reference: {booking.payment_reference || 'Legacy payment'}{booking.paid_at && <> · Paid {new Date(booking.paid_at).toLocaleString()}</>}</p>
    </> : booking.status === 'pending' && <>
      {overdue && <p role="status">Payment deadline passed. {admin ? 'Reject this unpaid application, or record a payment received before the deadline.' : 'Awaiting administrator review for rejection.'}</p>}
      {admin ? <>
        <button type="button" disabled={busy} onClick={() => setRecording(!recording)}>Record payment / mark paid</button>
        {recording && <form onSubmit={pay}>
          <label>Payment reference<input required maxLength={100} value={reference} onChange={e => setReference(e.target.value)} /></label>
          <label>Actual payment time (local time)<input type="datetime-local" required={overdue} value={paidAt} onChange={e => setPaidAt(e.target.value)} /></label>
          <p>Leave time blank to use now. Payment must have been received before the deadline.</p>
          <button disabled={busy}>{busy ? 'Recording…' : 'Confirm paid'}</button>
        </form>}
      </> : !overdue && <form onSubmit={pay}>
        <p>Demo checkout: simulates a successful payment. No real money is charged.</p>
        <button disabled={busy}>{busy ? 'Processing…' : 'Pay booking fee (mock)'}</button>
      </form>}
    </>}
    {error && <p role="alert">{error}</p>}
  </div>;
}
