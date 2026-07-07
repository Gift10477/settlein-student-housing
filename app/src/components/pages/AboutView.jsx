/**
 * AboutView.jsx — About Us page
 *
 * Sections:
 *  1. Hero banner — dark navy, title + subtitle
 *  2. Mission statement — text + visual stats row
 *  3. Team cards — 3 team members
 *  4. Values grid — 4 value cards
 *
 * Props:
 *   onNavigate — fn(viewId) for CTA buttons
 */
import React from 'react';

const STATS = [
  { value: '2,500+', label: 'Listed Properties' },
  { value: '15,000+', label: 'Happy Students' },
  { value: '50+', label: 'Universities' },
  { value: '2022', label: 'Founded' },
];

const TEAM = [
  {
    name: 'Gift Githaka',
    role: 'CEO & Co-Founder',
    bio: 'Former Strathmore student who experienced first-hand the struggle of finding safe student housing. On a mission to make it stress-free for every Kenyan student.',
    initials: 'GG',
    color: '#2563eb',
  },
  {
    name: 'Yahya Abdi',
    role: 'CTO & Co-Founder',
    bio: 'Full-stack engineer with 8 years of experience building marketplace platforms. Passionate about using technology to solve real-world African problems.',
    initials: 'YA',
    color: '#7c3aed',
  },
  {
    name: 'Tiffany Akello',
    role: 'Head of Operations',
    bio: 'Coordinates property verification, landlord relations, and student support across all our partner universities nationwide.',
    initials: 'TA',
    color: '#0891b2',
  },
  {
    name: 'Ian Njugu',
    role: 'Head of Product',
    bio: 'Focused on designing user-centric experiences that make finding and securing accommodation as seamless as possible.',
    initials: 'IN',
    color: '#f59e0b',
  },
];

const VALUES = [
  {
    title: 'Student First',
    desc: 'Every decision we make is guided by what is best for the student. Affordability, safety, and convenience are non-negotiable.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    title: 'Verified Trust',
    desc: 'We personally verify every property on our platform. No catfishing, no hidden surprises — only honest listings.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <polyline points="9 12 11 14 15 10"/>
      </svg>
    ),
  },
  {
    title: 'Transparency',
    desc: 'Clear pricing, honest landlord profiles, and authentic student reviews. No hidden fees, ever.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    ),
  },
  {
    title: 'Community',
    desc: 'We are building more than a platform — a community where students help students through honest reviews and shared experiences.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
  },
];

export default function AboutView({ onNavigate }) {
  return (
    <div className="about-page">

      {/* ── Hero Banner ── */}
      <section className="about-hero">
        <div className="about-hero-inner">
          <span className="about-hero-badge">Our Story</span>
          <h1 className="about-hero-title">Built by Students,<br />For Students</h1>
          <p className="about-hero-sub">
            SettleIn was born from a simple frustration — finding safe, affordable student
            accommodation in Kenya was unnecessarily hard. We set out to change that.
          </p>
          <div className="about-hero-ctas">
            <button className="about-cta-primary" onClick={() => onNavigate('listings')}>
              Browse Properties
            </button>
            <button className="about-cta-secondary" onClick={() => onNavigate('contact')}>
              Get in Touch
            </button>
          </div>
        </div>
      </section>

      {/* ── Stats Row ── */}
      <section className="about-stats-section">
        <div className="about-stats-inner">
          {STATS.map(({ value, label }) => (
            <div key={label} className="about-stat-item">
              <span className="about-stat-value">{value}</span>
              <span className="about-stat-label">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Mission ── */}
      <section className="about-mission-section">
        <div className="about-mission-inner">
          <div className="about-mission-text">
            <span className="about-section-badge">Our Mission</span>
            <h2 className="about-section-title">Making Student Housing Simple, Safe & Accessible</h2>
            <p className="about-mission-body">
              Every student in Kenya deserves a safe place to call home while they pursue their education.
              SettleIn connects students with verified, affordable accommodation near their campuses — removing
              the stress, scams, and uncertainty that has plagued student housing for decades.
            </p>
            <p className="about-mission-body">
              We work directly with property owners, conduct in-person verifications, and empower students
              with the information they need to make confident housing decisions. Our platform currently
              serves students across <strong>50+ universities</strong> in Kenya.
            </p>
          </div>
          <div className="about-mission-visual">
            <div className="about-mission-card">
              <div className="about-mission-card-top">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
                <span>SettleIn Platform</span>
              </div>
              <ul className="about-mission-bullets">
                <li>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981"
                    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Physically verified properties
                </li>
                <li>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981"
                    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Transparent pricing — no hidden fees
                </li>
                <li>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981"
                    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Direct landlord messaging
                </li>
                <li>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981"
                    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Authentic student reviews
                </li>
                <li>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981"
                    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Available near 50+ universities
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Team ── */}
      <section className="about-team-section">
        <div className="about-team-inner">
          <div className="about-section-header">
            <span className="about-section-badge">The Team</span>
            <h2 className="about-section-title">Meet the People Behind SettleIn</h2>
            <p className="about-section-sub">
              A passionate team of Kenyans who believe every student deserves a safe home.
            </p>
          </div>
          <div className="about-team-grid">
            {TEAM.map((member) => (
              <div key={member.name} className="about-team-card">
                <div className="about-team-avatar" style={{ background: member.color }}>
                  {member.initials}
                </div>
                <h3 className="about-team-name">{member.name}</h3>
                <p className="about-team-role">{member.role}</p>
                <p className="about-team-bio">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="about-values-section">
        <div className="about-values-inner">
          <div className="about-section-header">
            <span className="about-section-badge">Our Values</span>
            <h2 className="about-section-title">What We Stand For</h2>
          </div>
          <div className="about-values-grid">
            {VALUES.map((v) => (
              <div key={v.title} className="about-value-card">
                <div className="about-value-icon">{v.icon}</div>
                <h3 className="about-value-title">{v.title}</h3>
                <p className="about-value-desc">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
