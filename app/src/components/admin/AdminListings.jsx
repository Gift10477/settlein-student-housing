import { useState } from 'react';

const categories = [
  ['pending', 'Pending review'], ['approved', 'Published'],
  ['unpublished', 'Unpublished'], ['rejected', 'Rejected'],
];
function listingStatus(listing) {
  if (listing.verified === true || Number(listing.verified) === 1) return 'approved';
  return ['rejected', 'unpublished'].includes(listing.review_status) ? listing.review_status : 'pending';
}

export default function AdminListings({ properties, users, busy, onEdit, onReview, onDelete }) {
  const [category, setCategory] = useState('pending');
  const rows = properties.filter(property => listingStatus(property) === category);
  return <>
    <nav aria-label="Listing status">
      {categories.map(([key, label]) => <button key={key} disabled={busy} aria-pressed={category === key} onClick={() => setCategory(key)}>
        {label} ({properties.filter(property => listingStatus(property) === key).length})
      </button>)}
    </nav>
    <h2>{categories.find(([key]) => key === category)[1]}</h2>
    <p>{category === 'approved' ? 'These listings are visible to students.' : 'These listings are hidden from students.'}</p>
    {!rows.length && <p role="status">No listings in this section.</p>}
    <div className="management-list">{rows.map(property => <article key={property.id}>
      <h3>{property.title}</h3>
      <p>{property.location} · KES {Number(property.price).toLocaleString()} · {property.vacant_units} vacant</p>
      <p>{property.description}</p>
      <p>Submitted by: {users.find(user => String(user.id) === String(property.owner_id))?.email || 'Legacy / unassigned'}</p>
      <button disabled={busy} onClick={() => onEdit(property)}>Edit</button>
      {category === 'approved' ? <button disabled={busy} onClick={() => onReview(property, 'unpublished')}>Unpublish</button>
        : <button disabled={busy} onClick={() => onReview(property, 'approved')}>Approve &amp; publish</button>}
      {category !== 'rejected' && <button disabled={busy} onClick={() => onReview(property, 'rejected')}>Reject listing</button>}
      <button disabled={busy} onClick={() => onDelete(property)}>Delete</button>
    </article>)}</div>
  </>;
}
