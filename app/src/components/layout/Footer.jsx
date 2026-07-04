/**
 * Footer.jsx — Site-wide footer
 *
 * Layout matches UniNest reference:
 *  Col 1 — Logo + tagline + social icons
 *  Col 2 — Quick Links
 *  Col 3 — Legal
 *  Col 4 — Contact (location, email, phone)
 *  Bottom bar — copyright
 *
 * Props:
 *   onNavigate — fn(viewId) for internal link navigation
 */
import React from 'react';

const QUICK_LINKS = [
  { label: 'Browse Properties', view: 'listings' },
  { label: 'About Us',          view: 'about' },
  { label: 'Contact',           view: 'contact' },
  { label: 'List Your Property', view: 'landlord' },
  { label: 'Get Started',       view: 'auth' },
];

const LEGAL_LINKS = [
  { label: 'Privacy Policy', href: '#' },
  { label: 'Terms of Service', href: '#' },
  { label: 'Cookie Policy', href: '#' },
];

const CONTACT_ITEMS = [
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
    ),
    text: 'Nairobi, Kenya',
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
        <polyline points="22,6 12,13 2,6"/>
      </svg>
    ),
    text: 'hello@settlein.co.ke',
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.14 13 19.79 19.79 0 0 1 1.07 4.18 2 2 0 0 1 3.05 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 17z"/>
      </svg>
    ),
    text: '+254 700 123 456',
  },
];

const SOCIAL_LINKS = [
  {
    label: 'Twitter / X',
    href: '#',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
  {
    label: 'Instagram',
    href: '#',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
        <circle cx="12" cy="12" r="4.5"/>
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    href: '#',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/>
        <circle cx="4" cy="4" r="2"/>
      </svg>
    ),
  },
  {
    label: 'Facebook',
    href: '#',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
      </svg>
    ),
  },
];

export default function Footer({ onNavigate }) {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-inner">

        {/* ── Column 1: Brand ── */}
        <div className="footer-brand">
          <div className="footer-logo" onClick={() => onNavigate('home')} role="button" tabIndex={0}>
            <span className="footer-logo-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </span>
            Settle<span>In</span>
          </div>
          <p className="footer-tagline">
            Kenya's premier student accommodation platform. Find your perfect home near campus.
          </p>
          {/* Social icons */}
          <div className="footer-socials">
            {SOCIAL_LINKS.map(({ label, href, icon }) => (
              <a key={label} href={href} className="footer-social-btn" aria-label={label}>
                {icon}
              </a>
            ))}
          </div>
        </div>

        {/* ── Column 2: Quick Links ── */}
        <div className="footer-col">
          <h4 className="footer-col-heading">QUICK LINKS</h4>
          <ul className="footer-link-list">
            {QUICK_LINKS.map(({ label, view }) => (
              <li key={label}>
                <a href="#" onClick={e => { e.preventDefault(); onNavigate(view); }}>
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Column 3: Legal ── */}
        <div className="footer-col">
          <h4 className="footer-col-heading">LEGAL</h4>
          <ul className="footer-link-list">
            {LEGAL_LINKS.map(({ label, href }) => (
              <li key={label}>
                <a href={href}>{label}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Column 4: Contact ── */}
        <div className="footer-col">
          <h4 className="footer-col-heading">CONTACT</h4>
          <ul className="footer-contact-list">
            {CONTACT_ITEMS.map(({ icon, text }) => (
              <li key={text} className="footer-contact-item">
                <span className="footer-contact-icon">{icon}</span>
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* ── Bottom bar ── */}
      <div className="footer-bottom">
        <div className="footer-bottom-inner">
          <p className="footer-copyright">
            © {year} SettleIn. All rights reserved.
          </p>
          <p className="footer-made-with">
            Built for Kenyan students 🇰🇪
          </p>
        </div>
      </div>
    </footer>
  );
}
