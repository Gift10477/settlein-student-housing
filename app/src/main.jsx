/**
 * main.jsx — React Application Entry Point
 *
 * Mounts the <App /> component into the #root div in index.html.
 * React.StrictMode is enabled in development to catch potential problems.
 */
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

/* Find the root DOM node */
const rootElement = document.getElementById('root');

/* Mount the React app */
createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
