/**
 * DetailView.jsx — Property Detail Page
 *
 * Shows the full property profile:
 *  - Image placeholder with property icon
 *  - Price, type, and verified badge
 *  - Info grid (landlord, phone, location, campus)
 *  - M-PESA booking card
 *  - Amenities list
 *  - Reviews section with star ratings and review form
 *
 * Props:
 *   propId    — id of the property to display
 *   onBack    — fn() navigate back to listings
 *   onToast   — fn(message) show toast
 */
import React, { useState } from 'react';
import { getPropertyById, addReview } from '../../store/db';

/** Render N filled stars + empty remainder */
function StarRating({ value }) {
  return (
    <span className="review-stars" aria-label={`${value} out of 5 stars`}>
      {'★'.repeat(value)}{'☆'.repeat(5 - value)}
    </span>
  );
}

export default function DetailView({ propId, onBack, onToast }) {
  const property = getPropertyById(propId);

  /* M-PESA phone input state */
  const [phone, setPhone] = useState('');

  /* Review form state */
  const [reviewName,    setReviewName]    = useState('');
  const [reviewStars,   setReviewStars]   = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  /* Local reviews — start from db, allow adding without full re-render */
  const [reviews, setReviews] = useState(property?.reviews ?? []);

  if (!property) {
    return (
      <div className="view-container">
        <p>Property not found.</p>
        <button className="btn btn--gray back-btn" onClick={onBack}>← Back to Listings</button>
      </div>
    );
  }

  /** Simulate M-PESA push */
  const handleMpesa = (e) => {
    e.preventDefault();
    if (!phone) { onToast('Please enter your M-PESA phone number.'); return; }
    onToast(`📲 M-PESA push sent to ${phone}. Check your phone!`);
  };

  /** Submit a review */
  const handleReview = (e) => {
    e.preventDefault();
    const newReview = { name: reviewName, stars: reviewStars, comment: reviewComment };
    addReview(property.id, newReview);
    setReviews(prev => [...prev, newReview]);
    setReviewName(''); setReviewComment(''); setReviewStars(5);
    onToast('Review submitted! Thank you.');
  };

  return (
    <div className="view-container fade-in" id="view-detail">
      {/* Back button */}
      <button className="btn btn--gray back-btn" onClick={onBack}>
        ← Back to Listings
      </button>

      <div className="detail-card">
        {/* Property image placeholder */}
        <div className="detail-image-placeholder">
          🏠 {property.title}
        </div>

        {/* Price and verified status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
          <p className="price-tag">KES {property.price.toLocaleString()}/mo</p>
          {property.verified && (
            <span className="verified-badge" style={{ position: 'static' }}>✓ Verified</span>
          )}
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{property.type}</span>
        </div>

        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
          {property.title}
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{property.description}</p>

        {/* Info grid */}
        <div className="detail-grid">
          <div><h4>Landlord</h4><p>{property.landlord}</p></div>
          <div><h4>Phone</h4><p>{property.phone}</p></div>
          <div><h4>Location</h4><p>{property.location}</p></div>
          <div><h4>Nearest Campus</h4><p>{property.distance}</p></div>
        </div>

        {/* Amenities */}
        <h3 style={{ fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>Amenities</h3>
        <div style={{ marginBottom: '2rem' }}>
          {property.amenities.map(a => (
            <span key={a} className="amenity-tag">{a}</span>
          ))}
        </div>

        {/* M-PESA booking */}
        <div className="mpesa-card">
          <h3 style={{ fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
            📲 Book via M-PESA
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Pay your first month's deposit securely via M-PESA.
          </p>
          <form onSubmit={handleMpesa}>
            <div className="input-group">
              <input
                type="tel"
                placeholder="07XX XXX XXX"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                style={{ flex: 1 }}
                aria-label="M-PESA phone number"
              />
              <button type="submit" className="btn btn--green">Send Push</button>
            </div>
          </form>
        </div>

        {/* Reviews section */}
        <div className="reviews-section">
          <h3 style={{ fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>
            ⭐ Reviews ({reviews.length})
          </h3>

          {reviews.length === 0 && (
            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>No reviews yet. Be the first!</p>
          )}

          {reviews.map((r, i) => (
            <div key={i} className="review-item">
              <div className="review-header">
                <strong>{r.name}</strong>
                <StarRating value={r.stars} />
              </div>
              <p className="review-comment">{r.comment}</p>
            </div>
          ))}

          {/* Leave a review form */}
          <div className="review-form-card">
            <h4 style={{ fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>Leave a Review</h4>
            <form onSubmit={handleReview}>
              <div style={{ marginBottom: '0.75rem' }}>
                <input
                  type="text"
                  placeholder="Your name"
                  value={reviewName}
                  onChange={e => setReviewName(e.target.value)}
                  required
                />
              </div>
              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Rating:&nbsp;
                  <select value={reviewStars} onChange={e => setReviewStars(Number(e.target.value))} style={{ width: 'auto', padding: '0.3rem 0.6rem' }}>
                    {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} star{n>1?'s':''}</option>)}
                  </select>
                </label>
              </div>
              <div style={{ marginBottom: '0.75rem' }}>
                <textarea rows={3} placeholder="Share your experience…" value={reviewComment} onChange={e => setReviewComment(e.target.value)} required />
              </div>
              <button type="submit" className="btn">Submit Review</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
