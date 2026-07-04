/**
 * LandlordCTA.jsx — "Are You a Landlord?" banner section
 *
 * Dark blue gradient card with centred headline, subtitle,
 * and a white "List Your Property" button.
 * Matches UniNest reference design exactly.
 *
 * Props:
 *   onNavigate — fn(viewId) for CTA button click
 */
import React from 'react';

export default function LandlordCTA({ onNavigate }) {
  return (
    <section className="landlord-cta-section" id="landlord-cta">
      <div className="landlord-cta-inner">
        <div className="landlord-cta-card">

          {/* Decorative radial glow */}
          <div className="landlord-cta-glow" aria-hidden="true" />

          <div className="landlord-cta-content">
            <h2 className="landlord-cta-title">Are You a Landlord?</h2>
            <p className="landlord-cta-sub">
              List your property on SettleIn and connect with thousands of students looking for accommodation.
            </p>
            <button
              className="landlord-cta-btn"
              onClick={() => onNavigate('landlord')}
              id="btn-landlord-cta"
            >
              List Your Property
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}
