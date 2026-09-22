/**
 * DetailView.jsx — Property Detail & Real-Time Booking Page
 *
 * Shows the full property profile from MySQL database:
 *  - Real property photo / gallery
 *  - Price, room type, and verified badge
 *  - Property details (landlord, phone, location, nearest campus, utilities)
 *  - Direct Accommodation Booking & Real-Time Lease Timeline persistence
 *  - Amenities list
 *  - Reviews section
 *
 * Props:
 *   propId      — id of the property to display
 *   onBack      — fn() navigate back to listings
 *   onToast     — fn(message) show toast
 *   currentUser — current authenticated user object
 */
import React, { useState, useEffect } from 'react';
import { getPropertyById, createBooking, getStudentLeaseTimeline, getCurrentUser } from '../../services/api';

/** Render N filled stars + empty remainder */
function StarRating({ value }) {
  return (
    <span className="review-stars" aria-label={`${value} out of 5 stars`}>
      {'★'.repeat(value)}{'☆'.repeat(5 - value)}
    </span>
  );
}

export default function DetailView({ propId, onBack, onToast, currentUser }) {
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* Booking form state */
  const [moveInDate, setMoveInDate] = useState(new Date().toISOString().split('T')[0]);
  const [expectedArrivalTime, setExpectedArrivalTime] = useState('10:00 AM');
  const [leaseDuration, setLeaseDuration] = useState('1 Semester (4 months)');
  const [bookingNotes, setBookingNotes] = useState('');
  const [bookingStudentId, setBookingStudentId] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [liveTimelineJson, setLiveTimelineJson] = useState(null);

  /* Review form state */
  const [reviewName, setReviewName] = useState('');
  const [reviewStars, setReviewStars] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    // Pre-fill student ID from logged-in user when component mounts
    const user = currentUser || getCurrentUser();
    if (user && user.student_id) {
      setBookingStudentId(user.student_id);
    }
  }, [currentUser]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getPropertyById(propId)
      .then((data) => {
        if (mounted) {
          if (data) {
            setProperty(data);
            setReviews(Array.isArray(data.reviews) ? data.reviews : []);
          } else {
            setError('Property not found in database.');
          }
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch property details:', err);
        if (mounted) {
          setError('Failed to fetch property details from database.');
          setLoading(false);
        }
      });

    return () => { mounted = false; };
  }, [propId]);

  if (loading) {
    return (
      <div className="view-container">
        <p>Loading property details from database...</p>
        <button className="btn btn--gray back-btn" onClick={onBack}>← Back to Listings</button>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="view-container">
        <p>{error || 'Property not found.'}</p>
        <button className="btn btn--gray back-btn" onClick={onBack}>← Back to Listings</button>
      </div>
    );
  }

  /** Direct Room Booking (Persists to MySQL Bookings table in Real-Time) */
  const handleDirectBooking = async (e) => {
    e.preventDefault();
    setIsBooking(true);

    const user = currentUser || getCurrentUser() || { id: 1042, name: 'Student' };

    try {
      const res = await createBooking({
        user_id: user.id,
        student_id: bookingStudentId || user.student_id || '',
        property_id: property.id,
        property_title: property.title,
        move_in_date: moveInDate,
        expected_arrival_time: expectedArrivalTime,
        lease_duration: leaseDuration,
        notes: bookingNotes
      });

      setConfirmedBooking(res.booking);
      setIsBooking(false);
      onToast(`Booking confirmed! Recorded at ${new Date(res.booking.booked_at).toLocaleTimeString()}`);

      // Query the live lease timeline endpoint automatically
      try {
        const timeline = await getStudentLeaseTimeline(user.id);
        setLiveTimelineJson(timeline);
      } catch (tErr) {
        console.warn('Auto-query timeline notice:', tErr);
      }
    } catch (err) {
      setIsBooking(false);
      onToast(`Booking error: ${err.message}`);
    }
  };

  /** Fetch live lease timeline from database */
  const handleTestLeaseTimeline = async () => {
    const user = currentUser || getCurrentUser() || { id: 1042 };
    try {
      const data = await getStudentLeaseTimeline(user.id);
      setLiveTimelineJson(data);
      onToast('Lease timeline retrieved live from database!');
    } catch (err) {
      onToast(`Lease timeline error: ${err.message}`);
    }
  };

  /** Submit a review */
  const handleReview = (e) => {
    e.preventDefault();
    const newReview = { name: reviewName, stars: reviewStars, comment: reviewComment };
    setReviews(prev => [...prev, newReview]);
    setReviewName(''); setReviewComment(''); setReviewStars(5);
    onToast('Review submitted! Thank you.');
  };

  const amenitiesList = Array.isArray(property.amenities)
    ? property.amenities
    : typeof property.amenities === 'string'
      ? property.amenities.split(',').map(a => a.trim()).filter(Boolean)
      : [];

  return (
    <div className="view-container fade-in" id="view-detail">
      {/* Back button */}
      <button className="btn btn--gray back-btn" onClick={onBack}>
        &larr; Back to Listings
      </button>

      <div className="detail-card">
        {/* Property image */}
        {property.images && property.images.length > 0 ? (
          <img src={property.images[0]} alt={property.title} style={{ width: '100%', height: '320px', objectFit: 'cover', borderRadius: '8px', marginBottom: '1.5rem' }} />
        ) : property.image ? (
          <img src={property.image} alt={property.title} style={{ width: '100%', height: '320px', objectFit: 'cover', borderRadius: '8px', marginBottom: '1.5rem' }} />
        ) : (
          <div className="detail-image-placeholder">
            {property.title}
          </div>
        )}

        {/* Price and verified status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
          <p className="price-tag">KES {Number(property.price || 0).toLocaleString()}/mo</p>
          {property.verified && (
            <span className="verified-badge" style={{ position: 'static' }}>Verified</span>
          )}
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{property.type}</span>
          {property.vacant_units === 0 ? (
            <span style={{ color: '#6b7280', fontWeight: 700, fontSize: '0.85rem', marginLeft: 'auto' }}>
              Sold Out
            </span>
          ) : property.vacant_units <= 3 ? (
            <span style={{ color: '#ef4444', fontWeight: 700, fontSize: '0.85rem', marginLeft: 'auto' }}>
              Only {property.vacant_units} units left!
            </span>
          ) : null}
        </div>

        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
          {property.title}
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{property.description}</p>

        {/* Info grid */}
        <div className="detail-grid">
          <div><h4>Landlord</h4><p>{property.landlord || 'Independent Landlord'}</p></div>
          <div>
            <h4>Phone / WhatsApp</h4>
            <p>
              <span>{property.whatsapp || property.phone || '+254 712 345 678'}</span>
            </p>
          </div>
          <div>
            <h4>Location</h4>
            <p>
              {property.location}
              {property.latitude && property.longitude && (
                <a href={`https://maps.google.com/?q=${property.latitude},${property.longitude}`} target="_blank" rel="noreferrer" style={{ display: 'block', fontSize: '0.8rem', color: '#2563eb', marginTop: '0.25rem', textDecoration: 'none' }}>
                  View on Google Maps
                </a>
              )}
            </p>
          </div>
          <div><h4>Nearest Campus</h4><p>{property.distance || property.campus}</p></div>
          <div><h4>Gender Policy</h4><p>{property.gender_policy || 'Mixed'}</p></div>
          <div><h4>Furnishing</h4><p>{property.furnishing_status || 'Unfurnished'}</p></div>
        </div>

        {/* Cost Breakdown */}
        <h3 style={{ fontWeight: 700, margin: '1.5rem 0 0.75rem', color: 'var(--text-primary)' }}>Cost Breakdown & Utilities</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem', background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px' }}>
           <div><span style={{color: 'var(--text-secondary)'}}>Monthly Rent:</span><br/><strong>KES {Number(property.price || 0).toLocaleString()}</strong></div>
           <div><span style={{color: 'var(--text-secondary)'}}>Security Deposit:</span><br/><strong>KES {Number(property.security_deposit || property.price || 0).toLocaleString()}</strong></div>
           <div><span style={{color: 'var(--text-secondary)'}}>Booking Fee:</span><br/><strong>KES {Number(property.booking_fee || 1000).toLocaleString()}</strong></div>
           <div>
             <span style={{color: 'var(--text-secondary)'}}>Utilities Included:</span><br/>
             <span style={{fontSize: '0.85rem', display: 'flex', gap: '0.5rem', marginTop: '0.2rem', fontWeight: 500}}>
               <span style={{ color: property.water_included ? '#10b981' : 'var(--text-muted)' }}>Water</span>
               <span style={{ color: property.wifi_included ? '#10b981' : 'var(--text-muted)' }}>Wi-Fi</span>
               <span style={{ color: property.garbage_included ? '#10b981' : 'var(--text-muted)' }}>Garbage</span>
             </span>
           </div>
        </div>

        {/* Amenities */}
        <h3 style={{ fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>Amenities</h3>
        <div style={{ marginBottom: '2rem' }}>
          {amenitiesList.map(a => (
            <span key={a} className="amenity-tag">{a}</span>
          ))}
        </div>

        {/* Real-time Room Booking & Lease Timeline Section */}
        <div style={{ padding: '1.5rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <h3 style={{ margin: 0, fontWeight: 700, color: '#1e293b' }}>
              🗓️ Book Accommodation & Generate Lease Timeline
            </h3>
            <span style={{ fontSize: '0.8rem', background: '#dbeafe', color: '#1e40af', padding: '0.25rem 0.6rem', borderRadius: '12px', fontWeight: 600 }}>
              Live Database Integration
            </span>
          </div>

          <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '1.25rem' }}>
            Reserve this room directly. Your move-in date and arrival time will be saved into the MySQL database in real time, making your lease schedule accessible to downstream services (StudySync).
          </p>

          {property.vacant_units === 0 ? (
            <p style={{ fontSize: '0.9rem', color: '#ef4444', fontWeight: 600 }}>
              Sorry, this property is currently fully booked.
            </p>
          ) : (
            <form onSubmit={handleDirectBooking} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>
                  Expected Move-In Date
                </label>
                <input
                  type="date"
                  value={moveInDate}
                  onChange={e => setMoveInDate(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>
                  Expected Arrival Time
                </label>
                <select
                  value={expectedArrivalTime}
                  onChange={e => setExpectedArrivalTime(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                >
                  <option value="08:00 AM">08:00 AM (Early Morning)</option>
                  <option value="10:00 AM">10:00 AM (Morning)</option>
                  <option value="12:00 PM">12:00 PM (Noon)</option>
                  <option value="02:00 PM">02:00 PM (Afternoon)</option>
                  <option value="04:00 PM">04:00 PM (Late Afternoon)</option>
                  <option value="06:00 PM">06:00 PM (Evening)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>
                  Lease Tenancy Duration
                </label>
                <select
                  value={leaseDuration}
                  onChange={e => setLeaseDuration(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                >
                  <option value="1 Semester (4 months)">1 Semester (4 months)</option>
                  <option value="2 Semesters (8 months)">2 Semesters (8 months)</option>
                  <option value="1 Full Academic Year (12 months)">1 Full Academic Year (12 months)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>
                  Student ID / Registration Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. 193923 or STU-4021 (if student)"
                  value={bookingStudentId}
                  onChange={e => setBookingStudentId(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>
                  Special Requests / Moving Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Arriving with personal study desk"
                  value={bookingNotes}
                  onChange={e => setBookingNotes(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1', marginTop: '0.5rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  type="submit"
                  className="btn btn--green"
                  disabled={isBooking}
                  style={{ padding: '0.65rem 1.5rem', fontWeight: 700, fontSize: '0.95rem' }}
                >
                  {isBooking ? 'Recording Booking...' : '✓ Confirm Room Booking'}
                </button>
              </div>
            </form>
          )}

          {/* Booking Success Confirmation */}
          {confirmedBooking && (
            <div style={{ marginTop: '1.5rem', padding: '1.25rem', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.75rem', lineHeight: 1 }}>🎉</span>
              <div>
                <h4 style={{ margin: '0 0 0.25rem', color: '#166534', fontSize: '1rem', fontWeight: 700 }}>
                  Booked Successfully!
                </h4>
                <p style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', color: '#15803d' }}>
                  Your accommodation has been reserved. Booking #{confirmedBooking.booking_id} recorded at{' '}
                  <strong>{new Date(confirmedBooking.booked_at).toLocaleTimeString()}</strong>.
                </p>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#166534' }}>
                  Move-in: <strong>{new Date(confirmedBooking.move_in_date).toLocaleDateString()}</strong> at{' '}
                  <strong>{confirmedBooking.expected_arrival_time}</strong>
                </p>
              </div>
            </div>
          )}
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
                <StarRating value={r.stars || 5} />
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
