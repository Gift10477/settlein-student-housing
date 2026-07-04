/**
 * WhyChooseUs.jsx — Feature cards section
 *
 * 4-column grid of feature cards with light-blue icon circles.
 * Matches UniNest "Why Choose UniNest?" section design.
 */
import React from 'react';

const FEATURES = [
  {
    id: 'smart-search',
    title: 'Smart Search',
    desc: 'Find accommodation near your campus with advanced filters for price, amenities, and room type.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  },
  {
    id: 'verified-listings',
    title: 'Verified Listings',
    desc: 'Every property is verified by our team ensuring you get exactly what you see online.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
    ),
  },
  {
    id: 'direct-messaging',
    title: 'Direct Messaging',
    desc: 'Chat directly with landlords, ask questions, and negotiate terms — all within the platform.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    id: 'genuine-reviews',
    title: 'Genuine Reviews',
    desc: 'Read authentic reviews from fellow students who have lived in the property before you.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
];

export default function WhyChooseUs() {
  return (
    <section className="why-section" id="why-choose-us">
      <div className="why-inner">

        {/* Section header */}
        <div className="why-header">
          <h2 className="why-title">Why Choose SettleIn?</h2>
          <p className="why-sub">
            We make finding student accommodation simple, safe, and stress-free.
          </p>
        </div>

        {/* 4-column feature cards */}
        <div className="why-grid">
          {FEATURES.map((f) => (
            <div key={f.id} className="why-card">
              <div className="why-icon-wrap">
                {f.icon}
              </div>
              <h3 className="why-card-title">{f.title}</h3>
              <p className="why-card-desc">{f.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
