// Receipt values are projections, not duplicate columns on the reservation.
const receipt = column => `(SELECT p.${column} FROM payments p WHERE p.booking_id=bookings.id AND p.status='paid' ORDER BY p.id DESC LIMIT 1)`;
const bookingFields = `bookings.*, CASE WHEN ${receipt('id')} IS NOT NULL THEN 'paid' WHEN bookings.payment_required=1 THEN 'unpaid' ELSE 'not_required' END AS payment_status, ${receipt('paid_at')} AS paid_at, ${receipt('reference')} AS payment_reference, ${receipt('method')} AS payment_method`;
const bookingSelect = 'SELECT ' + bookingFields + ' FROM bookings';
module.exports = {bookingFields,bookingSelect};
