/**
 * QuickLogin.jsx — Mascot + Quick Login Split Section
 *
 * Bottom section of the home page.
 * Left  — home mascot (smaller, floating animation) + speech bubble
 * Right — floating-label email/password quick-access card
 *
 * Props:
 *   onNavigate — fn(viewId) to switch view
 *   onToast    — fn(message) to show toast
 */
import React, { useState } from 'react';
import Mascot from '../auth/Mascot';

export default function QuickLogin({ onNavigate, onToast }) {
  /** Track password field focus for mascot hand-cover */
  const [passwordFocused, setPasswordFocused] = useState(false);

  /** Quick-login form state */
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');

  const speechText = passwordFocused
    ? 'Privacy mode! Not looking!'
    : 'Ready to find your perfect room!';

  const handleSubmit = (e) => {
    e.preventDefault();
    onToast('Signed in successfully! Welcome back.');
    onNavigate('home');
  };

  return (
    <section className="home-login-split" id="home-quick-login">
      <div className="home-login-inner">

        {/* ── Left: Mascot ── */}
        <div className="mascot-home-panel">
          <Mascot
            coverEyes={passwordFocused}
            speechText={speechText}
            active={true}
            mascotId="home"
          />
        </div>

        {/* ── Right: Quick Login Card ── */}
        <div className="quick-login-panel">
          <div className="quick-login-card slide-up">
            <h3 className="ql-title">Welcome Back 👋</h3>
            <p className="ql-sub">Sign in to access saved listings &amp; bookings</p>

            <form onSubmit={handleSubmit}>
              {/* Floating-label email */}
              <div className="floating-label-group" style={{ marginBottom: '1rem' }}>
                <input
                  type="email"
                  id="ql-email"
                  placeholder=" "
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                />
                <label htmlFor="ql-email">Student / Manager Email</label>
              </div>

              {/* Floating-label password */}
              <div className="floating-label-group" style={{ marginBottom: '1.5rem' }}>
                <input
                  type="password"
                  id="ql-password"
                  placeholder=" "
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  autoComplete="current-password"
                />
                <label htmlFor="ql-password">Password</label>
              </div>

              {/* Submit */}
              <button type="submit" className="btn btn--full">
                Access Portal
              </button>
            </form>

            {/* Sign-up CTA */}
            <p className="ql-signup-link">
              No account?{' '}
              <a href="#" onClick={e => { e.preventDefault(); onNavigate('auth'); }}>
                Create one free →
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
