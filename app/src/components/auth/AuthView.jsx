/**
 * AuthView.jsx — Sign In / Create Account
 *
 * Split layout:
 *  Left  — animated SVG mascot with eye tracking & speech bubble
 *  Right — tabbed card with Login and Sign Up forms
 *
 * Props:
 *   onNavigate — fn(viewId) for post-login redirect
 *   onToast    — fn(message) to show a toast notification
 */
import React, { useState } from 'react';
import Mascot from './Mascot';

export default function AuthView({ onNavigate, onToast }) {
  /** Which tab is active: 'login' | 'signup' */
  const [activeTab, setActiveTab] = useState('login');

  /** Whether the password input is focused (triggers hand-cover) */
  const [passwordFocused, setPasswordFocused] = useState(false);

  /** Form field state */
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [name,     setName]     = useState('');
  const [role,     setRole]     = useState('student');

  /* Dynamic speech bubble text based on current state */
  const speechText = passwordFocused
    ? "Privacy mode! Not looking!"
    : activeTab === 'login'
      ? 'Welcome back! Log in!'
      : "Let's create your profile!";

  /** Handle sign-in submission */
  const handleSignIn = (e) => {
    e.preventDefault();
    onToast('Successfully authenticated! Welcome back.');
    onNavigate('home');
  };

  /** Handle sign-up submission */
  const handleSignUp = (e) => {
    e.preventDefault();
    onToast('Account created! Welcome to SettleIn.');
    onNavigate('home');
  };

  return (
    <section className="auth-view fade-in" id="view-auth">
      <div className="auth-split">

        {/* ── Left: Mascot ── */}
        <Mascot
          coverEyes={passwordFocused}
          speechText={speechText}
          active={true}
          mascotId="auth"
        />

        {/* ── Right: Auth Card ── */}
        <div className="auth-card slide-up">

          {/* Tab switcher */}
          <div className="auth-toggle-header" role="tablist">
            <button
              className={`toggle-tab${activeTab === 'login' ? ' active' : ''}`}
              onClick={() => setActiveTab('login')}
              role="tab"
              aria-selected={activeTab === 'login'}
            >
              Login
            </button>
            <button
              className={`toggle-tab${activeTab === 'signup' ? ' active' : ''}`}
              onClick={() => setActiveTab('signup')}
              role="tab"
              aria-selected={activeTab === 'signup'}
            >
              Create Account
            </button>
          </div>

          {/* ── Login Form ── */}
          {activeTab === 'login' && (
            <form className="auth-form" onSubmit={handleSignIn} id="form-signin">
              <div className="form-group">
                <label htmlFor="auth-email">Student / Manager Email</label>
                <input
                  id="auth-email"
                  type="email"
                  placeholder="name@strathmore.edu"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <div className="form-group">
                <label htmlFor="auth-password">Password</label>
                <input
                  id="auth-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  required
                  autoComplete="current-password"
                />
              </div>
              <button type="submit" className="btn btn--full" style={{ marginTop: '1rem' }}>
                Access Portal
              </button>
            </form>
          )}

          {/* ── Sign Up Form ── */}
          {activeTab === 'signup' && (
            <form className="auth-form" onSubmit={handleSignUp} id="form-signup">
              <div className="form-group">
                <label htmlFor="signup-name">Full Name</label>
                <input
                  id="signup-name"
                  type="text"
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="signup-role">Account Type</label>
                <select id="signup-role" value={role} onChange={e => setRole(e.target.value)}>
                  <option value="student">Student</option>
                  <option value="landlord">Landlord / Property Manager</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="signup-email">Email</label>
                <input
                  id="signup-email"
                  type="email"
                  placeholder="name@email.com"
                  required
                  autoComplete="email"
                />
              </div>
              <div className="form-group">
                <label htmlFor="signup-password">Password</label>
                <input
                  id="signup-password"
                  type="password"
                  placeholder="Create a password"
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  required
                  autoComplete="new-password"
                />
              </div>
              <button type="submit" className="btn btn--full" style={{ marginTop: '1rem' }}>
                Create Account
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
