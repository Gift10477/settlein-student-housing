/**
 * FeaturedCard.jsx — Individual Featured Property Card
 *
 * Displays a single hand-picked listing with:
 *  - Real property photo (Unsplash) with gradient fallback
 *  - "Available" green badge overlay (bottom-left)
 *  - Property type pill (top-left)
 *  - "MOST POPULAR" ribbon (optional)
 *  - Save button with SVG heart icon
 *  - Price + type row, title, distance, amenity tags
 *
 * Props:
 *   property   — property object from db.js
 *   accent     — 'emerald' | 'blue' | 'purple'  (gradient fallback colour)
 *   badgeStyle — 'budget' | 'value' | 'premium'
 *   popular    — boolean, show the "MOST POPULAR" diagonal ribbon
 *   onView     — fn(id) navigate to detail view
 *   onToast    — fn(message) show toast
 */
import React, { useState } from 'react';
import { toggleSaved, isSaved } from '../../store/db';

function HeartIcon({ filled }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
      fill={filled ? '#ef4444' : 'none'} stroke={filled ? '#ef4444' : 'currentColor'}
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  );
}

/* Map amenity name to a compact SVG icon */
const AMENITY_ICONS = {
  'Wi-Fi': (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/>
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/>
    </svg>
  ),
  'CCTV': (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2"/>
    </svg>
  ),
  'Borehole': (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>
    </svg>
  ),
  'Biometric': (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  ),
  'Study Room': (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  ),
  'Laundry': (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="2"/><circle cx="12" cy="13" r="5"/>
      <path d="M8 6h.01M12 6h.01"/>
    </svg>
  ),
  'Parking': (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <path d="M9 17V7h4a3 3 0 0 1 0 6H9"/>
    </svg>
  ),
  'Hot Shower': (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12h16"/><path d="M4 12a8 8 0 0 1 16 0"/><path d="M10 6V4m4 2V4"/>
      <path d="M8 20v-4h8v4"/>
    </svg>
  ),
  'Balcony': (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="8" width="18" height="4"/><path d="M6 8V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v3"/>
      <path d="M6 12v7m4-7v7m4-7v7"/>
    </svg>
  ),
  'Gym': (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.5 6.5h11m-11 11h11M5 8V5m14 0v3m0 8v3M5 16v3"/>
    </svg>
  ),
  'Generator': (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ),
  'Rooftop': (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    </svg>
  ),
  'Elevator': (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 8l3-3 3 3m-6 8l3 3 3-3"/>
    </svg>
  ),
};

const DEFAULT_AMENITY_ICON = (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

export default function FeaturedCard({
  property,
  accent = 'blue',
  badgeStyle = 'value',
  popular = false,
  onView,
  onToast,
}) {
  const [saved, setSaved] = useState(() => isSaved(property.id));
  const [imgError, setImgError] = useState(false);

  const handleHeart = (e) => {
    e.stopPropagation();
    toggleSaved(property.id);
    setSaved(prev => !prev);
    onToast(saved ? 'Removed from saved listings.' : 'Saved to your list!');
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
      {/* ── Photo image area ── */}
      <div className={`feat-card-img feat-img--${accent}`}>
        {/* Real property photo */}
        {property.image && !imgError ? (
          <img
            src={property.image}
            alt={property.title}
            className="feat-card-photo"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : null}

        {/* Property type pill — top-left, matches UniNest */}
        <span className="feat-type-pill">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          {property.type}
        </span>

        {/* "Available" green badge — bottom-left, matches UniNest */}
        <span className="feat-available-badge">Available</span>

        {/* Heart / save button */}
        <button
          className="heart-btn"
          onClick={handleHeart}
          aria-label={saved ? 'Remove from saved' : 'Save listing'}
          title={saved ? 'Remove from saved' : 'Save this listing'}
        >
          <HeartIcon filled={saved} />
        </button>

        {/* "MOST POPULAR" diagonal ribbon */}
        {popular && <div className="popular-ribbon">Most Popular</div>}
      </div>

      {/* ── Card body ── */}
      <div className="feat-card-body">
        <div className="feat-price-row">
          <span className={`price-badge badge-${badgeStyle}`}>
            KES {property.price.toLocaleString()}/mo
          </span>
        </div>

        <h3 className="feat-card-title">{property.title}</h3>

        <p className="feat-meta">
          <span className="feat-meta-icon"><MapPinIcon /></span>
          {property.distance}
        </p>

        {/* Amenity tags — show first 3 */}
        <div className="feat-amenities">
          {property.amenities.slice(0, 3).map(a => (
            <span key={a} className="amenity-icon-tag">
              <span className="amenity-svg">{AMENITY_ICONS[a] || DEFAULT_AMENITY_ICON}</span>
              {a}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
