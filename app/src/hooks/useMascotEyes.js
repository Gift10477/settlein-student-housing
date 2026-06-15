/**
 * useMascotEyes.js — Pupil tracking hook
 *
 * Tracks the mouse position on screen and translates it into
 * a small (x, y) offset for the mascot's pupils so they
 * appear to "look at" the cursor.
 *
 * Usage:
 *   const { eyeOffset } = useMascotEyes({ active: true });
 *   // eyeOffset = { x: number, y: number }  (pixels, clamped to ±5)
 *
 * The hook only attaches the mousemove listener when `active` is true
 * to avoid wasted work when the mascot is off-screen.
 */
import { useEffect, useState, useCallback } from 'react';

/** Maximum pupil displacement in each axis (px) */
const MAX_OFFSET = 5;

/**
 * Map a mouse coordinate relative to the viewport centre
 * to a clamped pupil offset.
 */
function calcOffset(mouseX, mouseY) {
  const cx = window.innerWidth  / 2;
  const cy = window.innerHeight / 2;
  // Normalise to [-1, 1]
  const nx = (mouseX - cx) / cx;
  const ny = (mouseY - cy) / cy;
  return {
    x: Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, nx * MAX_OFFSET)),
    y: Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, ny * MAX_OFFSET)),
  };
}

/**
 * useMascotEyes hook
 * @param {{ active: boolean }} options - pass active=false to pause tracking
 * @returns {{ eyeOffset: {x:number, y:number} }}
 */
export function useMascotEyes({ active = true } = {}) {
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e) => {
    setEyeOffset(calcOffset(e.clientX, e.clientY));
  }, []);

  useEffect(() => {
    if (!active) {
      // Reset eyes to centre when not tracking
      setEyeOffset({ x: 0, y: 0 });
      return;
    }
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [active, handleMouseMove]);

  return { eyeOffset };
}
