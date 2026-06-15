/**
 * Header.jsx
 *
 * Sticky top navigation bar.
 * - Desktop: horizontal nav links + theme toggle
 * - Mobile: logo + hamburger icon → slide-in drawer
 *
 * Props:
 *   currentView  — active view id string
 *   onNavigate   — fn(viewId) called when a nav link is clicked
 *   theme        — 'light' | 'dark'
 *   onToggleTheme — fn() to flip the theme
 */
import React, { useState, useEffect, useRef } from 'react';

/** Navigation items shared between desktop and mobile */
const NAV_ITEMS = [
  { label: 'Home',            view: 'home' },
  { label: 'Find Rooms',      view: 'listings' },
  { label: 'Landlord Portal', view: 'landlord' },
];

export default function Header({ currentView, onNavigate, theme, onToggleTheme }) {
  /** Controls whether the mobile drawer is open */
  const [drawerOpen, setDrawerOpen] = useState(false);
  const overlayRef = useRef(null);

  /** Close the drawer and restore body scroll */
  const closeDrawer = () => {
    setDrawerOpen(false);
    document.body.style.overflow = '';
  };

  /** Open/close the drawer */
  const toggleDrawer = () => {
    const next = !drawerOpen;
    setDrawerOpen(next);
    document.body.style.overflow = next ? 'hidden' : '';
  };

  /** Handle a nav link click: navigate + close drawer */
  const handleNav = (view) => {
    onNavigate(view);
    closeDrawer();
  };

  /** Close drawer when window resizes above mobile breakpoint */
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 769px)');
    const onResize = () => { if (mq.matches) closeDrawer(); };
    mq.addEventListener('change', onResize);
    return () => mq.removeEventListener('change', onResize);
  }, []);

  return (
    <header className="main-header slide-down">
      {/* Logo — clicking navigates to Home */}
      <div className="logo" onClick={() => handleNav('home')} role="button" tabIndex={0}>
        Settle<span>In</span>
      </div>

      {/* Hamburger button — visible on mobile only */}
      <button
        className={`hamburger${drawerOpen ? ' open' : ''}`}
        id="hamburger-btn"
        aria-label="Toggle navigation menu"
        aria-expanded={drawerOpen}
        onClick={toggleDrawer}
      >
        <span /><span /><span />
      </button>

      {/* Navigation links (desktop inline / mobile drawer) */}
      <nav className={`nav-links${drawerOpen ? ' nav-open' : ''}`} id="main-nav">
        {NAV_ITEMS.map(({ label, view }) => (
          <a
            key={view}
            href="#"
            onClick={(e) => { e.preventDefault(); handleNav(view); }}
            style={{ color: currentView === view ? 'var(--primary)' : undefined, fontWeight: currentView === view ? 700 : undefined }}
          >
            {label}
          </a>
        ))}
        {/* Sign In pill */}
        <a href="#" className="auth-nav-btn" onClick={(e) => { e.preventDefault(); handleNav('auth'); }}>
          Sign In
        </a>
      </nav>

      {/* Theme toggle button (sun / moon icon) */}
      <button
        className="theme-toggle"
        onClick={onToggleTheme}
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>

      {/* Dark overlay behind mobile drawer */}
      <div
        className={`nav-overlay${drawerOpen ? ' visible' : ''}`}
        onClick={closeDrawer}
        aria-hidden
      />
    </header>
  );
}
