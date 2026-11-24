export const reportColumns = {
  bookings: ['id','student_name','email','property_title','status','move_in_date','booking_fee','payment_status','payment_deadline','paid_at','payment_reference','payment_method'],
  payments: ['id','booking_id','amount','status','reference','payment_method','paid_at','created_at'],
  properties: ['id','title','type','price','location','campus','vacant_units','review_status','owner_id','gender_policy','furnishing_status'],
  users: ['id','name','email','role'],
  logs: ['id','actor_id','actor_name','action','target_id','created_at'],
};
export function filterReport(rows, { query = '', status = 'all', from = '', to = '', sort = 'newest' }) {
  const matched = rows.filter(row => {
    const day = String(row.created_at || '').slice(0,10);
    return Object.values(row).join(' ').toLowerCase().includes(query.toLowerCase()) && (status === 'all' || [row.status,row.payment_status,row.review_status,row.role].includes(status)) && (!from || day >= from) && (!to || day <= to);
  });
  return matched.sort((a,b) => sort === 'name' ? String(a.title || a.student_name || a.name || a.action || a.reference || '').localeCompare(String(b.title || b.student_name || b.name || b.action || b.reference || '')) : (sort === 'oldest' ? 1 : -1) * String(a.created_at || a.id).localeCompare(String(b.created_at || b.id), undefined, { numeric: true }));
}
export function reportCSV(columns, rows, title, generatedAt = new Date().toISOString()) {
  const escape = value => '"' + String(value ?? '').replace(/^[\s]*[=+@-]/, "'" + '$&').replaceAll('"', '""') + '"';
  return [['SettleIn',title],['Generated',generatedAt],[],columns,...rows.map(row => columns.map(key => row[key]))].map(row => row.map(escape).join(',')).join('\r\n');
}
