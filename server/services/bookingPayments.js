const crypto = require('crypto');
const db = require('../db');
const {bookingSelect}=require('./bookingQuery');

const PAYMENT_WINDOW_HOURS = 24;
function bookingFee(property) {
  return Number(property.booking_fee) > 0 ? Number(property.booking_fee) : 1000;
}
function paymentFields(booking) {
  return {
    ...booking,
    payment_overdue: booking.payment_status === 'unpaid' &&
      Boolean(booking.payment_deadline) && new Date(booking.payment_deadline).getTime() <= Date.now(),
  };
}

// Both payment paths lock the reservation, making retries and admin/student races safe.
function recordPayment(manual = false) {
  return async (req, res, next) => {
    let connection;
    try {
      const body = req.body || {};
      const allowed = manual ? ['reference', 'paid_at'] : [];
      if (Object.keys(body).some(key => !allowed.includes(key))) return res.status(400).json({ error: 'Invalid payment fields.' });
      if (manual && (typeof body.reference !== 'string' || !body.reference.trim() || body.reference.trim().length > 100)) return res.status(400).json({ error: 'Enter a payment reference (up to 100 characters).' });
      connection = await db.getConnection();
      await connection.beginTransaction();
      const [rows] = await connection.query(bookingSelect+' WHERE id = ? FOR UPDATE', [req.params.id]);
      const booking = rows[0];
      const fail = async (status, error) => { await connection.rollback(); return res.status(status).json({ error }); };
      if (!booking || (!manual && String(booking.user_id) !== req.userId)) return await fail(404, 'Reservation not found.');
      if (booking.payment_status === 'paid') {
        await connection.rollback();
        return res.json({ message: 'Payment already recorded.', booking: paymentFields(booking) });
      }
      if (booking.status !== 'pending' || booking.payment_status !== 'unpaid') return await fail(409, 'This reservation cannot accept payment.');
      const now = new Date();
      const paidAt = manual && body.paid_at ? new Date(body.paid_at) : now;
      if (!Number.isFinite(paidAt.getTime()) || paidAt > now || (booking.payment_deadline && paidAt.getTime() < new Date(booking.payment_deadline).getTime() - PAYMENT_WINDOW_HOURS * 3600000)) return await fail(400, 'Enter the actual payment time within the reservation payment window.');
      if (!booking.payment_deadline || paidAt.getTime() >= new Date(booking.payment_deadline).getTime()) return await fail(409, 'Payment deadline passed. An administrator must review and reject the unpaid reservation.');
      const reference = manual ? body.reference.trim() : `MOCK-${crypto.randomUUID()}`;
      await connection.query('INSERT INTO payments (booking_id, amount, status, reference, method, paid_at) VALUES (?, ?, ?, ?, ?, ?)', [booking.id, booking.booking_fee, 'paid', reference, manual ? 'manual' : 'mock', paidAt.toISOString()]);
      await connection.query('INSERT INTO audit_logs (actor_id, action, target_id) VALUES (?, ?, ?)', [req.userId, manual ? 'reservation.payment_recorded' : 'reservation.mock_payment_paid', String(booking.id)]);
      await connection.commit();
      res.json({ message: manual ? 'Payment recorded.' : 'Mock payment successful. No money was charged.', booking: paymentFields({ ...booking, payment_status: 'paid', paid_at: paidAt.toISOString(), payment_reference: reference, payment_method: manual ? 'manual' : 'mock' }) });
    } catch (error) {
      if (connection) await connection.rollback();
      next(error);
    } finally { if (connection) connection.release(); }
  };
}
module.exports = { PAYMENT_WINDOW_HOURS, bookingFee, paymentFields, recordPayment };
