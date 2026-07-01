/**
 * HeroCanvas.jsx — Immersive Home Page Hero
 *
 * Renders:
 *  - Dark gradient sky background
 *  - Animated eyebrow badge
 *  - Large headline with waving emoji
 *  - Floating white search card (institution select + search button)
 *  - Nairobi skyline SVG at the bottom of the hero
 *
 * Props:
 *   onSearch — fn(campus) called when "Search Rooms" is clicked
 */
import React, { useState } from 'react';

/** Nairobi skyline — inline SVG buildings, palms, stars, lit windows */
function NairobiSkyline() {
  return (
    <div className="hero-skyline-wrapper" aria-hidden="true">
      <svg className="hero-skyline-svg" viewBox="0 0 1440 200" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMax slice">
        {/* Sky stars */}
        {[80,200,320,460,600,750,900,1100,1280,1380].map((x,i) => (
          <circle key={i} cx={x} cy={20 + (i % 3) * 14} r="1.8" fill="#fff" opacity={0.55 + (i % 4) * 0.1} />
        ))}

        {/* Background buildings */}
        <rect x="0"    y="110" width="80"  height="90" fill="#0a1a3a" />
        <rect x="70"   y="70"  width="60"  height="130" fill="#0d2050" />
        <rect x="120"  y="90"  width="50"  height="110" fill="#0a1a3a" />
        <rect x="160"  y="50"  width="70"  height="150" fill="#0d2050" />

        {/* KICC tower (left centre) */}
        <rect x="230"  y="30"  width="55"  height="170" fill="#122060" />
        <rect x="248"  y="15"  width="19"  height="20"  fill="#1a3070" />
        <polygon points="257,5 248,15 266,15" fill="#3a86ff" opacity={0.9} />

        {/* Mid buildings */}
        <rect x="295"  y="80"  width="65"  height="120" fill="#0a1a3a" />
        <rect x="350"  y="55"  width="75"  height="145" fill="#122060" />
        <rect x="415"  y="95"  width="55"  height="105" fill="#0d2050" />

        {/* University dome */}
        <rect x="470"  y="100" width="90"  height="100" fill="#0a1a3a" />
        <ellipse cx="515" cy="100" rx="45" ry="30" fill="#122060" />
        <rect x="507"  y="70"  width="16"  height="30"  fill="#1a3070" />

        {/* More mid-ground */}
        <rect x="560"  y="75"  width="55"  height="125" fill="#0d2050" />
        <rect x="605"  y="50"  width="80"  height="150" fill="#122060" />
        <rect x="675"  y="85"  width="50"  height="115" fill="#0a1a3a" />

        {/* Tall tower right of centre */}
        <rect x="715"  y="20"  width="65"  height="180" fill="#0d2050" />
        <rect x="730"  y="8"   width="35"  height="14"  fill="#1a3070" />

        {/* Right-side buildings */}
        <rect x="780"  y="90"  width="60"  height="110" fill="#0a1a3a" />
        <rect x="830"  y="65"  width="70"  height="135" fill="#122060" />
        <rect x="890"  y="85"  width="55"  height="115" fill="#0d2050" />
        <rect x="935"  y="40"  width="75"  height="160" fill="#122060" />
        <rect x="1000" y="95"  width="50"  height="105" fill="#0a1a3a" />
        <rect x="1040" y="70"  width="65"  height="130" fill="#0d2050" />
        <rect x="1095" y="100" width="55"  height="100" fill="#0a1a3a" />
        <rect x="1140" y="55"  width="75"  height="145" fill="#122060" />
        <rect x="1205" y="80"  width="60"  height="120" fill="#0d2050" />
        <rect x="1255" y="50"  width="80"  height="150" fill="#122060" />
        <rect x="1325" y="90"  width="55"  height="110" fill="#0a1a3a" />
        <rect x="1370" y="70"  width="70"  height="130" fill="#0d2050" />

        {/* Lit windows — warm amber dots */}
        {[
          [90,90],[92,110],[150,60],[152,80],[180,55],[182,75],
          [240,45],[242,65],[244,85],[310,95],[315,115],[365,70],[370,90],
          [480,115],[486,135],[620,65],[625,85],[720,35],[725,55],[728,75],
          [840,80],[845,100],[950,55],[955,75],[960,95],[1050,85],[1055,105],
          [1150,70],[1155,90],[1160,110],[1265,65],[1270,85],[1340,100]
        ].map(([x,y],i) => (
          <rect key={i} x={x} y={y} width="5" height="7" fill="#f59e0b" opacity={0.7 + (i%3)*0.1} rx="1" />
        ))}

        {/* Palm trees */}
        {[55, 200, 540, 820, 1070, 1310].map((x, i) => (
          <g key={i}>
            <rect x={x+3} y="148" width="5" height="52" fill="#1a3a1a" />
            <ellipse cx={x+5} cy="148" rx="18" ry="10" fill="#0f4f0f" />
            <ellipse cx={x-8} cy="152" rx="13" ry="7" fill="#155015" transform={`rotate(-25 ${x} 152)`} />
            <ellipse cx={x+18} cy="152" rx="13" ry="7" fill="#155015" transform={`rotate(25 ${x+10} 152)`} />
          </g>
        ))}

        {/* Ground band */}
        <rect x="0" y="190" width="1440" height="10" fill="#0a1a3a" />
      </svg>
    </div>
  );
}

export default function HeroCanvas({ onSearch }) {
  const [campus, setCampus] = useState('all');

  return (
    <section className="hero-canvas" id="view-home-hero">
      {/* ── Text content ── */}
      <div className="hero-content">
        <div className="hero-eyebrow slide-up">
          🏠 100% Verified &nbsp;·&nbsp; Zero Broker Fees
        </div>

        <h1 className="hero-headline slide-up" style={{ animationDelay: '0.12s' }}>
          Find Safe, Verified<br />
          Student Housing<br />
          Near Campus! <span className="hero-emoji">🎓</span>
        </h1>

        <p className="hero-sub slide-up" style={{ animationDelay: '0.22s' }}>
          Skip brokers. Avoid scams. Rent verified units in Nairobi.
        </p>
      </div>

      {/* ── Floating search card ── */}
      <div className="search-float-card float-up" style={{ animationDelay: '0.32s' }}>
        <p className="search-float-label">🔍 Where do you study?</p>

        <div className="search-float-row">
          {/* Institution selector */}
          <div className="search-select-wrap">
            {/* Location pin icon */}
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <select
              id="home-campus-select"
              value={campus}
              onChange={e => setCampus(e.target.value)}
              aria-label="Select institution"
            >
              <option value="all">Select Institution...</option>
              <option value="strathmore">Strathmore University</option>
              <option value="uon">University of Nairobi</option>
              <option value="ku">Kenyatta University</option>
              <option value="jkuat">JKUAT</option>
            </select>
          </div>

          {/* Search button */}
          <button
            id="btn-home-search"
            className="search-ripple-btn"
            onClick={() => onSearch(campus)}
          >
            Search Rooms
          </button>
        </div>

        {/* Trust stats strip */}
        <div className="search-float-stats">
          <span>🏘️ 3+ verified units</span>
          <span className="stat-dot">·</span>
          <span>📍 Nairobi, Kenya</span>
          <span className="stat-dot">·</span>
          <span>✓ Scam-free</span>
        </div>
      </div>

      {/* Spacer so content doesn't collide with the skyline */}
      <div className="hero-skyline-spacer" />

      {/* Nairobi skyline SVG */}
      <NairobiSkyline />
    </section>
  );
}
