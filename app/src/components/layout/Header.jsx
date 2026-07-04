/**
 * Header.jsx — Professional sticky navigation bar
 *
 * Matches UniNest reference design:
 *  - White background (dark in dark-mode), dark text
 *  - Logo left · Nav links centre · Sign In text + Get Started pill right
 *  - SVG sun/moon theme toggle button (no emoji)
 *  - Mobile: hamburger drawer
 *
 * Props:
 *   currentView   — active view id string
 *   onNavigate    — fn(viewId) called when a link is clicked
 *   theme         — 'light' | 'dark'
 *   onToggleTheme — fn() to flip the theme
 */
import React, { useState, useEffect } from 'react';

const NAV_ITEMS = [
  { label: 'Home',          view: 'home' },
  { label: 'Properties',    view: 'listings' },
  { label: 'About',         view: 'about' },
  { label: 'Contact',       view: 'contact' },
  { label: 'For Landlords', view: 'landlord' },
];

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1"  x2="12" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22"   x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1"  y1="12" x2="3"  y2="12"/>
      <line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78"  x2="5.64" y2="18.36"/>
      <line x1="18.36" y1="5.64"  x2="19.78" y2="4.22"/>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  );
}

export default function Header({ currentView, onNavigate, theme, onToggleTheme }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled,   setScrolled]   = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const closeDrawer = () => {
    setDrawerOpen(false);
    document.body.style.overflow = '';
  };
  const toggleDrawer = () => {
    const next = !drawerOpen;
    setDrawerOpen(next);
    document.body.style.overflow = next ? 'hidden' : '';
  };
  const handleNav = (view) => {
    onNavigate(view);
    closeDrawer();
  };

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 769px)');
    const onResize = () => { if (mq.matches) closeDrawer(); };
    mq.addEventListener('change', onResize);
    return () => mq.removeEventListener('change', onResize);
  }, []);

  return (
    <header className={`main-header slide-down${scrolled ? ' header-scrolled' : ''}`}>
      {/* Logo */}
      <div className="logo" onClick={() => handleNav('home')} role="button" tabIndex={0}
        aria-label="Go to home page">
        <span className="logo-icon" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        </span>
        Settle<span>In</span>
      </div>

      {/* Hamburger — mobile only */}
      <button
        className={`hamburger${drawerOpen ? ' open' : ''}`}
        id="hamburger-btn"
        aria-label="Toggle navigation menu"
        aria-expanded={drawerOpen}
        onClick={toggleDrawer}
      >
        <span /><span /><span />
      </button>

      {/* Nav links */}
      <nav className={`nav-links${drawerOpen ? ' nav-open' : ''}`} id="main-nav">
        {NAV_ITEMS.map(({ label, view }) => (
          <a
            key={view}
            href="#"
            className={currentView === view ? 'nav-active' : ''}
            onClick={(e) => { e.preventDefault(); handleNav(view); }}
          >
            {label}
          </a>
        ))}

        {/* Sign In — plain text link */}
        <a href="#" className="nav-signin"
          onClick={(e) => { e.preventDefault(); handleNav('auth'); }}>
          Sign In
        </a>

        {/* Get Started — filled blue pill */}
        <button className="nav-get-started"
          onClick={() => handleNav('auth')}>
          Get Started
        </button>
      </nav>

      {/* Theme toggle — SVG sun/moon */}
      <button
        className="theme-toggle"
        onClick={onToggleTheme}
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        <span className="theme-toggle-icon">
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </span>
      </button>

      {/* Mobile drawer overlay */}
      <div
        className={`nav-overlay${drawerOpen ? ' visible' : ''}`}
        onClick={closeDrawer}
        aria-hidden
      />
    </header>
  );
}
