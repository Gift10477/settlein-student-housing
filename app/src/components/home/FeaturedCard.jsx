/**
 * FeaturedCard.jsx — Individual Featured Property Card
 *
 * Displays a single hand-picked listing with:
 *  - Gradient image area (emerald / blue / purple based on `accent`)
 *  - "Most Popular" ribbon (optional)
 *  - Pulsing Verified badge
 *  - Price badge (colour-coded budget/value/premium)
 *  - Frosted glass heart / save button
 *  - Amenity icon tags
 *
 * Props:
 *   property   — property object from db.js
 *   accent     — 'emerald' | 'blue' | 'purple'  (gradient colour)
 *   badgeStyle — 'budget' | 'value' | 'premium'
 *   popular    — boolean, show the "MOST POPULAR" diagonal ribbon
 *   onView     — fn(id) navigate to detail view
 *   onToast    — fn(message) show toast
 */
import React, { useState } from 'react';
import { toggleSaved, isSaved } from '../../store/db';

export default function FeaturedCard({
  property,
  accent = 'blue',
  badgeStyle = 'value',
  popular = false,
  onView,
  onToast,
}) {
  /** Heart / save toggle state — initialise from db */
  const [saved, setSaved] = useState(() => isSaved(property.id));

  /** Toggle the saved state and persist it */
  const handleHeart = (e) => {
    e.stopPropagation(); // don't trigger onView
    toggleSaved(property.id);
    setSaved(prev => !prev);
    onToast(saved ? 'Removed from saved listings.' : '❤️ Saved to your list!');
  };

  /* Map amenity name to emoji icon */
  const amenityIcon = (name) => {
    const map = { 'Wi-Fi': '📶', 'CCTV': '📹', 'Borehole': '💧', 'Biometric': '🔑',
                  'Study Room': '📚', 'Laundry': '🧺', 'Parking': '🅿️',
                  'Hot Shower': '🚿', 'Balcony': '🌿', 'Gym': '🏋️' };
    return map[name] || '✔️';
  };

  return (
    <article
      className="feat-card"
      onClick={() => onView(property.id)}
      role="button"
      tabIndex={0}
      aria-label={`View ${property.title}`}
      onKeyDown={e => e.key === 'Enter' && onView(property.id)}
    >
      {/* ── Gradient image area ── */}
      <div className={`feat-card-img feat-img--${accent}`}>
        {/* Property type icon watermark */}
        <span className="feat-img-icon" aria-hidden="true">
          {accent === 'emerald' ? '🏢' : accent === 'blue' ? '🏠' : '🏘️'}
        </span>

        {/* Pulsing verified badge */}
        <span className="verified-pulse">✓ Verified</span>

        {/* Heart / save button (frosted glass) */}
        <button
          className="heart-btn"
          onClick={handleHeart}
          aria-label={saved ? 'Remove from saved' : 'Save listing'}
          title={saved ? 'Remove from saved' : 'Save this listing'}
        >
          {saved ? '❤️' : '🤍'}
        </button>

        {/* "MOST POPULAR" diagonal ribbon */}
        {popular && <div className="popular-ribbon">Most Popular</div>}
      </div>

      {/* ── Card body ── */}
      <div className="feat-card-body">
        <div className="feat-price-row">
          {/* Price badge — colour coded by tier */}
          <span className={`price-badge badge-${badgeStyle}`}>
            KES {property.price.toLocaleString()}/mo
          </span>
          <span className="feat-type-tag">{property.type}</span>
        </div>

        <h3 className="feat-card-title">{property.title}</h3>
        <p className="feat-meta">📍 {property.distance}</p>

        {/* Amenity tags — show first 3 */}
        <div className="feat-amenities">
          {property.amenities.slice(0, 3).map(a => (
            <span key={a} className="amenity-icon-tag">
              {amenityIcon(a)} {a}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
