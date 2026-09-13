/**
 * FeaturedGrid.jsx — Hand-Picked Featured Listings
 *
 * Renders the "Featured Listings" section on the home page.
 * Loads verified properties from MySQL backend database via Express
 * and renders them as FeaturedCard components in a 3-column grid.
 *
 * Props:
 *   onView     — fn(id) navigate to detail view
 *   onNavigate — fn(viewId) navigate to listings
 *   onToast    — fn(message) show toast
 */
import React, { useState, useEffect } from 'react';
import FeaturedCard from './FeaturedCard';
import { getProperties } from '../../services/api';

/** Preset styling accents for the top featured cards */
const CARD_ACCENTS = [
  { accent: 'emerald', badgeStyle: 'budget', popular: false },
  { accent: 'blue', badgeStyle: 'value', popular: true },
  { accent: 'purple', badgeStyle: 'premium', popular: false },
];

export default function FeaturedGrid({ onView, onNavigate, onToast }) {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getProperties()
      .then((data) => {
        if (mounted) {
          setProperties(Array.isArray(data) ? data.slice(0, 3) : []);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load featured properties from database:', err);
        if (mounted) {
          setProperties([]);
          setLoading(false);
        }
      });
    return () => { mounted = false; };
  }, []);

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
          <a href="#" className="view-all-link" onClick={e => { e.preventDefault(); onNavigate('listings'); }}>
            View all &nbsp;→
          </a>
        </div>

        {/* 3-column card grid (collapses on mobile) */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-secondary)' }}>
            <p>Loading featured properties from database...</p>
          </div>
        ) : properties.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-secondary)' }}>
            <p>No featured properties available at the moment.</p>
          </div>
        ) : (
          <div className="featured-grid">
            {properties.map((prop, idx) => {
              const cfg = CARD_ACCENTS[idx % CARD_ACCENTS.length];
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
        )}
      </div>
    </section>
  );
}
