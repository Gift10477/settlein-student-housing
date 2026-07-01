/**
 * useTheme.js — Dark / Light Mode Hook
 *
 * Priority (highest → lowest):
 *  1. Explicit user choice stored in localStorage ("light" | "dark")
 *  2. Device `prefers-color-scheme` media query (auto)
 *
 * Exposes:
 *  - theme:     'light' | 'dark'  (current effective theme)
 *  - toggle():  flip between light and dark and persist the choice
 */
import { useEffect, useState } from 'react';

/** localStorage key for persisted theme preference */
const THEME_KEY = 'settlein-theme';

/**
 * Detect the device's preferred colour scheme.
 * @returns {'dark'|'light'}
 */
function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Apply theme by setting the `data-theme` attribute on <html>.
 * The CSS in variables.css reads this attribute.
 * @param {'light'|'dark'} theme
 */
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
}

/** useTheme — main hook */
export function useTheme() {
  const [theme, setTheme] = useState(() => {
    // Initialise from localStorage or fall back to device setting
    return localStorage.getItem(THEME_KEY) ?? getSystemTheme();
  });

  /* Apply theme to <html> whenever it changes */
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  /* Listen to system theme changes (e.g., user switches phone to dark mode) */
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = () => {
      // Only auto-update if the user has NOT set a manual preference
      if (!localStorage.getItem(THEME_KEY)) {
        setTheme(getSystemTheme());
      }
    };

    mq.addEventListener('change', handleChange);
    return () => mq.removeEventListener('change', handleChange);
  }, []);

  /** toggle — flip theme and persist the choice */
  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem(THEME_KEY, next);
    setTheme(next);
  };

  return { theme, toggle };
}
