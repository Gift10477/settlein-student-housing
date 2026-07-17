import React from 'react';

/**
 * PageLoader.jsx
 * 
 * A simple loading overlay shown when navigating between different views.
 */
export default function PageLoader({ isNavigating }) {
  return (
    <div className={`page-loader ${isNavigating ? 'active' : ''}`} aria-hidden={!isNavigating}>
      <div className="page-loader-spinner"></div>
    </div>
  );
}
