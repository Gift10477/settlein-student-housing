/**
 * PropertyCard.jsx — Listing Grid Card
 *
 * A compact card shown in the listings grid.
 * Clicking navigates to the detail view.
 * Heart button toggles the saved state.
 *
 * Props:
 *   property — property object from db.js
 *   onView   — fn(id) navigate to detail view
 *   onToast  — fn(message) show a toast
 *   style    — optional React inline style (for animation delays)
 */
import React, { useState } from 'react';
import { toggleSaved, isSaved } from '../../store/db';

/** Map amenity name to a small emoji */
const AMENITY_ICONS = {
  'Wi-Fi': '📶', 'CCTV': '📹', 'Borehole': '💧', 'Biometric': '🔑',
  'Study Room': '📚', 'Laundry': '🧺', 'Parking': '🅿️',
  'Hot Shower': '🚿', 'Balcony': '🌿', 'Gym': '🏋️',
};

export default function PropertyCard({ property, onView, onToast, style }) {
  const [saved, setSaved] = useState(() => isSaved(property.id));

  const handleHeart = (e) => {
    e.stopPropagation();
    toggleSaved(property.id);
    setSaved(p => !p);
    onToast(saved ? 'Removed from saved listings.' : '❤️ Added to saved listings!');
  };

  return (
    <article
      className="prop-card"
      onClick={() => onView(property.id)}
      style={style}
      role="button"
      tabIndex={0}
      aria-label={`View ${property.title}`}
      onKeyDown={e => e.key === 'Enter' && onView(property.id)}
    >
      {/* Card image placeholder */}
      <div className="prop-card-img">
        <span>🏠</span>

        {/* Verified badge */}
        {property.verified && (
          <span className="verified-badge">✓ Verified</span>
        )}

        {/* Heart button */}
        <button
          className="card-heart-btn"
          onClick={handleHeart}
          aria-label={saved ? 'Remove from saved' : 'Save listing'}
        >
          {saved ? '❤️' : '🤍'}
        </button>
      </div>

      {/* Card body */}
      <div className="prop-card-body">
        <p className="prop-card-price">KES {property.price.toLocaleString()}/mo</p>
        <h3 className="prop-card-title">{property.title}</h3>
        <p className="prop-card-meta">📍 {property.distance}</p>

        {/* Amenity tags — show first 3 */}
        <div>
          {property.amenities.slice(0, 3).map(a => (
            <span key={a} className="amenity-tag">
              {AMENITY_ICONS[a] ?? '✔️'} {a}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
