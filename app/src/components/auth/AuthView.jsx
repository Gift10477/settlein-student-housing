/**
 * AuthView.jsx — Get Started / Sign In Page
 *
 * Full-page layout:
 *  Left  — branded panel with gradient, headline, feature bullets
 *  Right — tabbed card: Sign In | Create Account
 *
 * Props:
 *   onNavigate — fn(viewId) for post-auth redirect
 *   onToast    — fn(message) to show a toast notification
 */
import React, { useState } from 'react';
import { registerUser, loginUser } from '../../store/db';

/* Feature bullets shown on the left panel */
const FEATURES = [
  { icon: '✓', text: 'Verified properties near top universities' },
  { icon: '✓', text: 'Compare prices and amenities side-by-side' },
  { icon: '✓', text: 'Connect directly with trusted landlords' },
  { icon: '✓', text: 'Save favourites and track your applications' },
];

export default function AuthView({ onNavigate, onToast, onAuthSuccess }) {
  const [activeTab,       setActiveTab]       = useState('signup');
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [showPassword,    setShowPassword]    = useState(false);

  /* Sign In state */
  const [siEmail,    setSiEmail]    = useState('');
  const [siPassword, setSiPassword] = useState('');

  /* Sign Up state */
  const [suName,     setSuName]     = useState('');
  const [suEmail,    setSuEmail]    = useState('');
  const [suPassword, setSuPassword] = useState('');
  const [suRole,     setSuRole]     = useState('student');

  const handleSignIn = (e) => {
    e.preventDefault();
    const result = loginUser(siEmail, siPassword);
    if (result.success) {
      if (onAuthSuccess) onAuthSuccess(result.user);
      onToast(result.message);
      onNavigate('home');
    } else {
      onToast(result.message);
    }
  };

  const handleSignUp = (e) => {
    e.preventDefault();
    const result = registerUser({ name: suName, email: suEmail, password: suPassword, role: suRole });
    if (result.success) {
      if (onAuthSuccess) onAuthSuccess(result.user);
      onToast(result.message);
      onNavigate('home');
    } else {
      onToast(result.message);
    }
  };

  return (
    <section className="auth-page fade-in" id="view-auth">

      {/* ── Left branded panel ── */}
      <div className="auth-brand-panel">
        <div className="auth-brand-inner">

          {/* Logo */}
          <div className="auth-logo" onClick={() => onNavigate('home')} role="button" tabIndex={0}>
            <span className="auth-logo-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </span>
            Settle<span>In</span>
          </div>

          <h2 className="auth-brand-headline">
            Find your perfect<br />student home today
          </h2>
          <p className="auth-brand-sub">
            Join thousands of students who found safe, affordable housing near their campus.
          </p>

          <ul className="auth-feature-list">
            {FEATURES.map((f, i) => (
              <li key={i} className="auth-feature-item">
                <span className="auth-feature-check">{f.icon}</span>
                {f.text}
              </li>
            ))}
          </ul>

          {/* Social proof */}
          <div className="auth-social-proof">
            <div className="auth-avatars">
              {['#2563eb','#059669','#7c3aed','#dc2626'].map((c, i) => (
                <div key={i} className="auth-avatar" style={{ background: c, zIndex: 4 - i }} />
              ))}
            </div>
            <p className="auth-social-text">
              <strong>15,000+ students</strong> already settled in
            </p>
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="auth-form-panel">
        <div className="auth-form-inner">

          {/* Back link */}
          <button className="auth-back-btn" onClick={() => onNavigate('home')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Back to Home
          </button>

          <div className="auth-card">
            {/* Tab toggle */}
            <div className="auth-tabs" role="tablist">
              <button
                className={`auth-tab${activeTab === 'signup' ? ' auth-tab--active' : ''}`}
                onClick={() => setActiveTab('signup')}
                role="tab" aria-selected={activeTab === 'signup'}
              >
                Create Account
              </button>
              <button
                className={`auth-tab${activeTab === 'login' ? ' auth-tab--active' : ''}`}
                onClick={() => setActiveTab('login')}
                role="tab" aria-selected={activeTab === 'login'}
              >
                Sign In
              </button>
            </div>

            {/* ── Sign Up Form ── */}
            {activeTab === 'signup' && (
              <form className="auth-form-body" onSubmit={handleSignUp} id="form-signup">
                <p className="auth-form-title">Get started for free</p>
                <p className="auth-form-sub">No credit card required</p>

                <div className="auth-input-group">
                  <label htmlFor="su-name">Full Name</label>
                  <input
                    id="su-name" type="text" placeholder="e.g. Jane Doe"
                    value={suName} onChange={e => setSuName(e.target.value)} required
                  />
                </div>

                <div className="auth-input-group">
                  <label htmlFor="su-email">Email Address</label>
                  <input
                    id="su-email" type="email" placeholder="name@email.com"
                    value={suEmail} onChange={e => setSuEmail(e.target.value)}
                    required autoComplete="email"
                  />
                </div>

                <div className="auth-input-group">
                  <label htmlFor="su-role">I am a</label>
                  <select id="su-role" value={suRole} onChange={e => setSuRole(e.target.value)}>
                    <option value="student">Student looking for housing</option>
                    <option value="landlord">Landlord / Property Manager</option>
                  </select>
                </div>

                <div className="auth-input-group auth-password-group">
                  <label htmlFor="su-password">Password</label>
                  <input
                    id="su-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a strong password"
                    value={suPassword} onChange={e => setSuPassword(e.target.value)}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    required autoComplete="new-password"
                  />
                  <button type="button" className="auth-eye-btn"
                    onClick={() => setShowPassword(p => !p)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}>
                    {showPassword ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>

                <p className="auth-terms">
                  By creating an account you agree to our{' '}
                  <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
                </p>

                <button type="submit" className="auth-submit-btn">
                  Create Free Account
                </button>

                <p className="auth-switch-text">
                  Already have an account?{' '}
                  <button type="button" className="auth-switch-link"
                    onClick={() => setActiveTab('login')}>Sign in</button>
                </p>
              </form>
            )}

            {/* ── Sign In Form ── */}
            {activeTab === 'login' && (
              <form className="auth-form-body" onSubmit={handleSignIn} id="form-signin">
                <p className="auth-form-title">Welcome back</p>
                <p className="auth-form-sub">Sign in to your SettleIn account</p>

                <div className="auth-input-group">
                  <label htmlFor="si-email">Email Address</label>
                  <input
                    id="si-email" type="email" placeholder="name@email.com"
                    value={siEmail} onChange={e => setSiEmail(e.target.value)}
                    required autoComplete="email"
                  />
                </div>

                <div className="auth-input-group auth-password-group">
                  <label htmlFor="si-password">Password</label>
                  <input
                    id="si-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={siPassword} onChange={e => setSiPassword(e.target.value)}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    required autoComplete="current-password"
                  />
                  <button type="button" className="auth-eye-btn"
                    onClick={() => setShowPassword(p => !p)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}>
                    {showPassword ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>

                <div className="auth-forgot-row">
                  <a href="#" className="auth-forgot">Forgot password?</a>
                </div>

                <button type="submit" className="auth-submit-btn">
                  Sign In
                </button>

                <p className="auth-switch-text">
                  Don't have an account?{' '}
                  <button type="button" className="auth-switch-link"
                    onClick={() => setActiveTab('signup')}>Create one free</button>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
