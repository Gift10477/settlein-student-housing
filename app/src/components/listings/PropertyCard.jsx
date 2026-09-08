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

export default function PropertyCard({ property, onView, onToast, style }) {
  const [saved, setSaved] = useState(() => isSaved(property.id));

  const handleHeart = (e) => {
    e.stopPropagation();
    toggleSaved(property.id);
    setSaved(p => !p);
    onToast(saved ? 'Removed from saved listings.' : 'Added to saved listings.');
  };

  const amenitiesList = Array.isArray(property.amenities)
    ? property.amenities
    : typeof property.amenities === 'string'
      ? property.amenities.split(',').map(a => a.trim()).filter(Boolean)
      : [];

  const priceFormatted = Number(property.price || 0).toLocaleString();

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
      <div className="prop-card-img" style={property.image ? { backgroundImage: `url(${property.image})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
        {!property.image && <span>Property</span>}

        {/* Verified badge */}
        {property.verified && (
          <span className="verified-badge">Verified</span>
        )}

        {/* Heart button */}
        <button
          className="card-heart-btn"
          onClick={handleHeart}
          aria-label={saved ? 'Remove from saved' : 'Save listing'}
          style={{ fontSize: '1rem', color: saved ? '#ef4444' : '#94a3b8' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill={saved ? '#ef4444' : 'none'} stroke={saved ? '#ef4444' : 'currentColor'} strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>

      {/* Card body */}
      <div className="prop-card-body">
        <p className="prop-card-price">KES {priceFormatted}/mo</p>
        <h3 className="prop-card-title">{property.title}</h3>
        <p className="prop-card-meta">{property.distance || property.location}</p>

        {/* Amenity tags — show first 3 */}
        <div>
          {amenitiesList.slice(0, 3).map(a => (
            <span key={a} className="amenity-tag">
              {a}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
