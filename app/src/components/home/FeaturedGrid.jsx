/**
 * FeaturedGrid.jsx — 3 Hand-Picked Featured Listings
 *
 * Loads featured properties from the Express/MySQL API.
 */
import React, { useEffect, useState } from 'react';
import FeaturedCard from './FeaturedCard';
import { fetchPropertiesFromAPI } from '../../store/db';

/** Configuration for each of the 3 featured slots */
const FEATURED_CONFIG = [
  { id: 'prop-001', accent: 'emerald', badgeStyle: 'budget', popular: false },
  { id: 'prop-002', accent: 'blue', badgeStyle: 'value', popular: true },
  { id: 'prop-003', accent: 'purple', badgeStyle: 'premium', popular: false },
];

export default function FeaturedGrid({ onView, onNavigate, onToast }) {
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPropertiesFromAPI()
      .then((data) => {
        setAll(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Could not load featured properties.');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <section className="featured-section" id="featured-listings">
        <div className="featured-inner">
          <p>Loading featured properties...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="featured-section" id="featured-listings">
        <div className="featured-inner">
          <p>{error}</p>
        </div>
      </section>
    );
  }

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

          <a
            href="#"
            className="view-all-link"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('listings');
            }}
          >
            View all &nbsp;→
          </a>
        </div>

        {/* 3-column card grid */}
        <div className="featured-grid">
          {FEATURED_CONFIG.map((cfg) => {
            const prop = all.find((p) => p.id === cfg.id);

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
