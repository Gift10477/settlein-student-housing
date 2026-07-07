/**
 * App.jsx — Root Application Component
 *
 * Responsibilities:
 *  1. Theme management — reads useTheme hook, applies data-theme on <html>
 *  2. Routing — manages `activeView` state, renders the correct view
 *  3. Splash screen — hides after a short delay on mount
 *  4. Toast notifications — renders a single toast with auto-dismiss
 *
 * View IDs:
 *  'home'     — Home page (hero + featured + quick login)
 *  'listings' — Browse all rooms
 *  'detail'   — Single property detail (requires activePropId)
 *  'auth'     — Sign in / Create account
 *  'landlord' — Landlord submission form
 */
import React, { useState, useEffect, useCallback } from 'react';

/* ── Styles ── */
import './styles/index.css';
import './styles/pages.css';

/* ── Hooks ── */
import { useTheme } from './hooks/useTheme';

/* ── Data ── */
import { initDB, getCurrentUser, logoutUser } from './store/db';

/* ── Layout components ── */
import SplashScreen from './components/layout/SplashScreen';
import Header       from './components/layout/Header';
import Footer       from './components/layout/Footer';

/* ── View components ── */
import HeroCanvas    from './components/home/HeroCanvas';
import FeaturedGrid  from './components/home/FeaturedGrid';
import StatsBar      from './components/home/StatsBar';
import WhyChooseUs   from './components/home/WhyChooseUs';
import LandlordCTA   from './components/home/LandlordCTA';
import ListingsView  from './components/listings/ListingsView';
import DetailView    from './components/detail/DetailView';
import AuthView      from './components/auth/AuthView';
import LandlordView  from './components/landlord/LandlordView';
import AboutView     from './components/pages/AboutView';
import ContactView   from './components/pages/ContactView';

/** How long (ms) the splash screen stays visible on load */
const SPLASH_DURATION = 2000;

/** How long (ms) a toast notification stays visible */
const TOAST_DURATION = 3200;

export default function App() {
  /* ── Theme ── */
  const { theme, toggle: toggleTheme } = useTheme();

  /* ── Splash ── */
  const [splashLoaded, setSplashLoaded] = useState(false);

  /* ── View router ── */
  const [activeView,    setActiveView]    = useState('home');
  const [activePropId,  setActivePropId]  = useState(null);
  const [initialCampus, setInitialCampus] = useState('all');

  /* ── Auth ── */
  const [currentUser, setCurrentUser] = useState(null);


  /* ── Toast ── */
  const [toast, setToast] = useState(null); // string | null

  /* ─────────────────────────────────────────────────
   * Initialisation — seed the db and dismiss splash
   * ───────────────────────────────────────────────── */
  useEffect(() => {
    initDB();
    setCurrentUser(getCurrentUser());
    const t = setTimeout(() => setSplashLoaded(true), SPLASH_DURATION);
    return () => clearTimeout(t);
  }, []);

  /* ─────────────────────────────────────────────────
   * Toast helper — auto-dismisses after TOAST_DURATION
   * ───────────────────────────────────────────────── */
  const showToast = useCallback((message) => {
    setToast(message);
    const t = setTimeout(() => setToast(null), TOAST_DURATION);
    return () => clearTimeout(t);
  }, []);

  /* ─────────────────────────────────────────────────
   * Navigation helper
   * ───────────────────────────────────────────────── */
  const navigate = useCallback((view, propId = null, campus = 'all') => {
    setActiveView(view);
    setActivePropId(propId);
    if (campus !== 'all') setInitialCampus(campus);
    // Scroll to top on every navigation
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  /** Navigate to a listing's detail view */
  const viewDetail = useCallback((propId) => {
    navigate('detail', propId);
  }, [navigate]);

  /** Search from the hero (go to listings, pre-filtered by campus) */
  const handleHeroSearch = useCallback((campus) => {
    setInitialCampus(campus);
    navigate('listings');
  }, [navigate]);

  /** Logout handler */
  const handleLogout = useCallback(() => {
    logoutUser();
    setCurrentUser(null);
    showToast('Signed out successfully.');
    navigate('home');
  }, [navigate, showToast]);

  /* ─────────────────────────────────────────────────
   * Render
   * ───────────────────────────────────────────────── */
  return (
    <>
      {/* Animated splash loading curtain */}
      <SplashScreen loaded={splashLoaded} />

      {/* Sticky header — always visible */}
      <Header
        currentView={activeView}
        onNavigate={(view) => navigate(view)}
        theme={theme}
        onToggleTheme={toggleTheme}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* ── View Router — render the active view ── */}
      <main id="app-root">

        {/* Home — 3 blocks stacked */}
        {activeView === 'home' && (
          <>
            <HeroCanvas onSearch={handleHeroSearch} onNavigate={(v) => navigate(v)} />
            <StatsBar />
            <FeaturedGrid onView={viewDetail} onToast={showToast} />
            <WhyChooseUs />
            <LandlordCTA onNavigate={(v) => navigate(v)} />
          </>
        )}

        {/* Browse all listings */}
        {activeView === 'listings' && (
          <ListingsView
            initialCampus={initialCampus}
            onView={viewDetail}
            onToast={showToast}
          />
        )}

        {/* Single property detail */}
        {activeView === 'detail' && activePropId && (
          <DetailView
            propId={activePropId}
            onBack={() => navigate('listings')}
            onToast={showToast}
          />
        )}

        {/* Auth (sign in / sign up) */}
        {activeView === 'auth' && (
          <AuthView
            onNavigate={(v) => navigate(v)}
            onToast={showToast}
            onAuthSuccess={(user) => setCurrentUser(user)}
          />
        )}

        {/* Landlord portal */}
        {activeView === 'landlord' && (
          <LandlordView onToast={showToast} />
        )}

        {/* About Us */}
        {activeView === 'about' && (
          <AboutView onNavigate={(v) => navigate(v)} />
        )}

        {/* Contact */}
        {activeView === 'contact' && (
          <ContactView onToast={showToast} />
        )}
      </main>

      {/* Site-wide footer */}
      <Footer onNavigate={(v) => navigate(v)} />

      {/* ── Toast notification (bottom-right / bottom-centre on mobile) ── */}
      {toast && (
        <div className="toast" role="alert" aria-live="polite">
          {toast}
        </div>
      )}
    </>
  );
}
