/**
 * HeroCanvas.jsx — Hero section matching UniNest reference design
 *
 * Dark navy gradient background, large bold headline,
 * subtitle, search bar, university quick-filter pills.
 *
 * Props:
 *   onSearch   — fn(campus) called when Search or a tag is clicked
 *   onNavigate — fn(view) for CTA buttons
 */
import React, { useState } from 'react';

const UNIVERSITY_TAGS = [
  { label: 'University of Nairobi', value: 'uon' },
  { label: 'Kenyatta University',   value: 'ku' },
  { label: 'JKUAT',                 value: 'jkuat' },
  { label: 'Strathmore University', value: 'strathmore' },
];

function SearchIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

export default function HeroCanvas({ onSearch, onNavigate }) {
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    const match = UNIVERSITY_TAGS.find(t =>
      t.label.toLowerCase().includes(query.toLowerCase()) ||
      t.value.toLowerCase().includes(query.toLowerCase())
    );
    onSearch(match ? match.value : 'all');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <section className="hero-canvas" id="view-home-hero">
      {/* Subtle radial glow — top-right */}
      <div className="hero-glow" aria-hidden="true" />
      {/* Secondary glow — bottom-left */}
      <div className="hero-glow-secondary" aria-hidden="true" />

      <div className="hero-content">
        {/* Badge */}
        <div className="hero-badge slide-up">
          <span className="hero-badge-dot" />
          Kenya's #1 Student Housing Platform
        </div>

        {/* Headline */}
        <h1 className="hero-headline slide-up" style={{ animationDelay: '0.06s' }}>
          Find Your Perfect<br />
          <span className="hero-headline-accent">Student Home</span>
        </h1>

        {/* Subtitle */}
        <p className="hero-sub slide-up" style={{ animationDelay: '0.14s' }}>
          Discover verified accommodation near Kenya's top universities.<br />
          Safe, affordable, and just a few clicks away.
        </p>

        {/* Search bar */}
        <div className="hero-search-bar float-up" style={{ animationDelay: '0.22s' }}>
          <span className="hero-search-icon"><SearchIcon /></span>
          <input
            id="hero-search-input"
            type="text"
            className="hero-search-input"
            placeholder="Search by location or university..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="Search by location or university"
          />
          <button id="btn-home-search" className="hero-search-btn" onClick={handleSearch}>
            Search
          </button>
        </div>

        {/* University quick-filter tags */}
        <div className="hero-tags float-up" style={{ animationDelay: '0.30s' }}>
          <span className="hero-tags-label">Popular:</span>
          {UNIVERSITY_TAGS.map(tag => (
            <button
              key={tag.value}
              className="hero-tag"
              onClick={() => onSearch(tag.value)}
              aria-label={`Search near ${tag.label}`}
            >
              {tag.label}
            </button>
          ))}
        </div>

        {/* CTA row */}
        <div className="hero-cta-row float-up" style={{ animationDelay: '0.38s' }}>
          <button className="hero-cta-primary" onClick={() => onNavigate('auth')}>
            Get Started Free
          </button>
          <button className="hero-cta-secondary" onClick={() => onSearch('all')}>
            Browse Properties
          </button>
        </div>
      </div>
    </section>
  );
}
