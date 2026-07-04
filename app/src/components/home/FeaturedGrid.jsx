/**
 * FeaturedGrid.jsx — 3 Hand-Picked Featured Listings
 *
 * Renders the "Featured Listings ✨" section on the home page.
 * Loads the 3 seed properties from the db and renders them
 * as FeaturedCard components in a 3-column grid.
 *
 * Props:
 *   onView   — fn(id) navigate to detail view
 *   onToast  — fn(message) show toast
 */
import React from 'react';
import FeaturedCard from './FeaturedCard';
import { getProperties } from '../../store/db';

/** Configuration for each of the 3 featured slots */
const FEATURED_CONFIG = [
  { id: 'prop-001', accent: 'emerald', badgeStyle: 'budget', popular: false },
  { id: 'prop-002', accent: 'blue', badgeStyle: 'value', popular: true },
  { id: 'prop-003', accent: 'purple', badgeStyle: 'premium', popular: false },
];

export default function FeaturedGrid({ onView, onToast }) {
  /** Load properties from the db (already seeded) */
  const all = getProperties();

  return (
    <section className="featured-section" id="featured-listings">
      <div className="featured-inner">

        {/* Section header */}
        <div className="featured-header">
          <div>
            <h2 className="featured-title">Featured Properties</h2>
            <p className="featured-sub">
              Hand-picked student accommodation near{' '}
              <span className="featured-sub-accent">top universities</span>
            </p>
          </div>
          <a href="#" className="view-all-link" onClick={e => { e.preventDefault(); onView(null); }}>
            View all &nbsp;→
          </a>
        </div>

        {/* 3-column card grid (collapses on mobile) */}
        <div className="featured-grid">
          {FEATURED_CONFIG.map(cfg => {
            const prop = all.find(p => p.id === cfg.id);
            if (!prop) return null;
            return (
              <FeaturedCard
                key={prop.id}
                property={prop}
                accent={cfg.accent}
                badgeStyle={cfg.badgeStyle}
                popular={cfg.popular}
                onView={onView}
                onToast={onToast}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
