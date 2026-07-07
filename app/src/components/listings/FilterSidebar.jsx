/**
 * FilterSidebar.jsx — Listings Page Filter Panel
 *
 * Sticky sidebar with controls for:
 *  - Campus filter (select)
 *  - Room type filter (select)
 *  - Max price (range slider)
 *  - Amenity toggles (Wi-Fi, CCTV, Borehole)
 *  - Verified only toggle
 *  - Apply and Clear buttons
 *
 * Props:
 *   filters   — current filter state object
 *   onChange  — fn(newFilters) called when any filter changes
 *   onApply   — fn() trigger the search
 *   onClear   — fn() reset all filters
 */
import React from 'react';

export default function FilterSidebar({ filters, onChange, onApply, onClear }) {
  /** Toggle an amenity on/off in the amenities array */
  const toggleAmenity = (amenity) => {
    const current = filters.amenities ?? [];
    const next = current.includes(amenity)
      ? current.filter(a => a !== amenity)
      : [...current, amenity];
    onChange({ ...filters, amenities: next });
  };

  const isAmenityOn = (amenity) => (filters.amenities ?? []).includes(amenity);

  return (
    <aside className="filter-sidebar" id="filter-sidebar" aria-label="Filter listings">

      {/* Header */}
      <div className="filter-sidebar-header">
        <h3>🔧 Filters</h3>
        <button className="clear-filters-btn" onClick={onClear} aria-label="Clear all filters">
          Clear all
        </button>
      </div>

      {/* Campus */}
      <div className="filter-group">
        <label className="filter-label" htmlFor="filter-campus">Campus</label>
        <select
          id="filter-campus"
          value={filters.campus ?? 'all'}
          onChange={e => onChange({ ...filters, campus: e.target.value })}
        >
          <option value="all">All Campuses</option>
          <option value="strathmore">Strathmore University</option>
          <option value="uon">University of Nairobi</option>
          <option value="ku">Kenyatta University</option>
          <option value="jkuat">JKUAT</option>
        </select>
      </div>

      {/* Room type */}
      <div className="filter-group">
        <label className="filter-label" htmlFor="filter-type">Room Type</label>
        <select
          id="filter-type"
          value={filters.type ?? 'all'}
          onChange={e => onChange({ ...filters, type: e.target.value })}
        >
          <option value="all">All Types</option>
          <option value="bedsitter">Bedsitter</option>
          <option value="hostel">Hostel Room</option>
          <option value="shared">Shared Apartment</option>
          <option value="studio">Studio</option>
        </select>
      </div>

      {/* Gender Policy */}
      <div className="filter-group">
        <label className="filter-label" htmlFor="filter-gender">Gender Policy</label>
        <select
          id="filter-gender"
          value={filters.gender_policy ?? 'all'}
          onChange={e => onChange({ ...filters, gender_policy: e.target.value })}
        >
          <option value="all">Any</option>
          <option value="Mixed">Mixed</option>
          <option value="Female-only">Female-only</option>
          <option value="Male-only">Male-only</option>
        </select>
      </div>

      {/* Furnishing Status */}
      <div className="filter-group">
        <label className="filter-label" htmlFor="filter-furnishing">Furnishing</label>
        <select
          id="filter-furnishing"
          value={filters.furnishing_status ?? 'all'}
          onChange={e => onChange({ ...filters, furnishing_status: e.target.value })}
        >
          <option value="all">Any</option>
          <option value="Furnished">Furnished</option>
          <option value="Unfurnished">Unfurnished</option>
        </select>
      </div>

      {/* Max price slider */}
      <div className="filter-group">
        <label className="filter-label" htmlFor="filter-price">
          Max Price: KES {(filters.maxPrice ?? 25000).toLocaleString()}/mo
        </label>
        <input
          id="filter-price"
          type="range"
          min={3000}
          max={25000}
          step={500}
          value={filters.maxPrice ?? 25000}
          onChange={e => onChange({ ...filters, maxPrice: Number(e.target.value) })}
          style={{ width: '100%', padding: 0, border: 'none', background: 'transparent', cursor: 'pointer' }}
        />
      </div>

      <div className="filter-divider" />

      {/* Amenity toggles */}
      <div className="filter-group">
        <span className="filter-label">Amenities</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {['Wi-Fi', 'CCTV', 'Borehole', 'Parking', 'Gym'].map(amenity => (
            <label
              key={amenity}
              className={`toggle-label${isAmenityOn(amenity) ? ' toggle-label--active' : ''}`}
            >
              <input
                type="checkbox"
                className="toggle-checkbox"
                checked={isAmenityOn(amenity)}
                onChange={() => toggleAmenity(amenity)}
              />
              <span className={`toggle-slider${isAmenityOn(amenity) ? ' toggle-slider--on' : ''}`} />
              <span>{amenity}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="filter-divider" />

      {/* Verified only */}
      <div className="filter-group">
        <label className={`toggle-label${filters.verified ? ' toggle-label--active' : ''}`}>
          <input
            type="checkbox"
            className="toggle-checkbox"
            checked={filters.verified ?? false}
            onChange={e => onChange({ ...filters, verified: e.target.checked })}
          />
          <span className={`toggle-slider${filters.verified ? ' toggle-slider--on' : ''}`} />
          <span>✓ Verified only</span>
        </label>
      </div>

      {/* Apply button */}
      <button className="btn btn--full" style={{ marginTop: '1rem' }} onClick={onApply}>
        Apply Filters
      </button>
    </aside>
  );
}
