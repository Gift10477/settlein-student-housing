/**
 * ListingsView.jsx — Browse All Available Rooms
 *
 * Features:
 *  - Gradient page header with search bar
 *  - Sidebar filter panel (FilterSidebar)
 *  - Responsive listings grid (PropertyCard ×N)
 *  - Toolbar showing result count and sort selector
 *  - "No results" empty state
 *
 * Props:
 *   initialCampus — pre-select a campus from the home search
 *   onView        — fn(id) navigate to detail view
 *   onToast       — fn(message) show toast
 */
import React, { useState, useEffect, useMemo } from 'react';
import FilterSidebar from './FilterSidebar';
import PropertyCard from './PropertyCard';
import { getProperties } from '../../store/db';

/** Default empty filter state */
const DEFAULT_FILTERS = {
  campus: 'all', type: 'all', maxPrice: 25000,
  amenities: [], verified: false, search: '',
};

export default function ListingsView({ initialCampus = 'all', onView, onToast }) {
  const [filters,  setFilters]  = useState({ ...DEFAULT_FILTERS, campus: initialCampus });
  const [sortBy,   setSortBy]   = useState('price-asc');
  const [rawProps, setRawProps] = useState([]);
  const [loading,  setLoading]  = useState(true);

  /* Simulate an async load on mount */
  useEffect(() => {
    const t = setTimeout(() => {
      setRawProps(getProperties());
      setLoading(false);
    }, 600);
    return () => clearTimeout(t);
  }, []);

  /* Apply filters and sort (memoised for performance) */
  const displayed = useMemo(() => {
    let list = getProperties(filters);
    return list.sort((a, b) => {
      if (sortBy === 'price-asc')  return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      return a.title.localeCompare(b.title);
    });
  }, [filters, sortBy, rawProps]);

  return (
    <section className="fade-in" id="view-listings">

      {/* ── Gradient page header with search ── */}
      <div className="listings-page-header">
        <div className="listings-header-inner">
          <div>
            <h1 className="listings-page-title">Find Your Room 🏠</h1>
            <p className="listings-page-sub">
              {rawProps.length} verified listings across Nairobi
            </p>
          </div>

          {/* Search bar inside the header */}
          <div className="listings-search-bar">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="search"
              placeholder="Search by name, area, or type…"
              value={filters.search}
              onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
              aria-label="Search listings"
            />
          </div>
        </div>
      </div>

      {/* ── Main content: sidebar + grid ── */}
      <div className="view-container">
        <div className="split-layout">

          {/* Filter sidebar */}
          <FilterSidebar
            filters={filters}
            onChange={setFilters}
            onApply={() => {}} /* filters are live — no need for explicit apply */
            onClear={() => setFilters({ ...DEFAULT_FILTERS })}
          />

          {/* Results area */}
          <div>
            {/* Toolbar */}
            <div className="listings-toolbar">
              <p className="result-count">
                Showing <strong>{displayed.length}</strong> listing{displayed.length !== 1 ? 's' : ''}
              </p>
              <div className="sort-group">
                <label htmlFor="sort-select">Sort by:</label>
                <select
                  id="sort-select"
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                >
                  <option value="price-asc">Price: Low → High</option>
                  <option value="price-desc">Price: High → Low</option>
                  <option value="name">Name A-Z</option>
                </select>
              </div>
            </div>

            {/* Loading spinner */}
            {loading && (
              <div className="spinner-wrap">
                <div className="spinner-ring" />
                <span>Finding rooms near you…</span>
              </div>
            )}

            {/* Empty state */}
            {!loading && displayed.length === 0 && (
              <div className="spinner-wrap">
                <span style={{ fontSize: '3rem' }}>🔍</span>
                <p>No listings match your filters.</p>
                <button className="btn" onClick={() => setFilters({ ...DEFAULT_FILTERS })}>
                  Clear Filters
                </button>
              </div>
            )}

            {/* Listings grid */}
            {!loading && displayed.length > 0 && (
              <div className="listings-grid">
                {displayed.map((prop, i) => (
                  <PropertyCard
                    key={prop.id}
                    property={prop}
                    onView={onView}
                    onToast={onToast}
                    style={{ animationDelay: `${i * 0.08}s` }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
