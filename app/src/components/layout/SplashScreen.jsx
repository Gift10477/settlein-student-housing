/**
 * SplashScreen.jsx
 *
 * Animated loading curtain shown on app startup.
 * Slides up and hides once the `loaded` prop is true.
 */
import React from 'react';

/**
 * @param {{ loaded: boolean }} props
 *   loaded — set to true after the app initialises to dismiss the splash
 */
export default function SplashScreen({ loaded }) {
  return (
    <div className={`splash-screen${loaded ? ' loaded' : ''}`} aria-hidden={loaded}>
      <div className="splash-content">
        {/* Brand logotype */}
        <div className="splash-logo">
          Settle<span>In</span>
        </div>
        {/* Animated progress bar */}
        <div className="splash-bar">
          <div className="splash-progress" />
        </div>
      </div>
    </div>
  );
}
