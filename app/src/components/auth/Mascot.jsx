/**
 * Mascot.jsx — Animated SVG House Mascot
 *
 * Renders the blue house character with:
 *  - Eye pupils that follow the mouse cursor (via useMascotEyes)
 *  - Hands that cover the eyes when coverEyes=true (password focus)
 *  - A stylish gradient speech bubble below the character
 *
 * Props:
 *   coverEyes   — boolean, slide hands up to cover eyes
 *   speechText  — string, text shown in the gradient bubble
 *   active      — boolean, enable pupil tracking (default true)
 *   mascotId    — unique id prefix for SVG elements (default 'auth')
 */
import React from 'react';
import { useMascotEyes } from '../../hooks/useMascotEyes';

export default function Mascot({
  coverEyes = false,
  speechText = 'Welcome to SettleIn!',
  active = true,
  mascotId = 'auth',
}) {
  const { eyeOffset } = useMascotEyes({ active });

  /* IDs for the two pupils and two hands */
  const pL = `${mascotId}-pupil-left`;
  const pR = `${mascotId}-pupil-right`;
  const hL = `${mascotId}-hand-left`;
  const hR = `${mascotId}-hand-right`;

  return (
    <div className="mascot-container">
      {/*
        The SVG mascot — a cute house character.
        SVG viewBox: 200×260
        Structure:
          - House body (roof + pentagon body)
          - Eyes (outer white circle + inner blue + pupil)
          - Cheeks (pink blush marks)
          - Smile path
          - Hands (circles that slide up on coverEyes)
      */}
      <svg
        id={mascotId === 'auth' ? 'cartoon-mascot' : 'home-mascot-svg'}
        viewBox="0 0 200 260"
        xmlns="http://www.w3.org/2000/svg"
        className={coverEyes ? 'covering-eyes' : ''}
        aria-label="SettleIn mascot"
        role="img"
      >
        {/* ── House body group (tilts slightly on mouse move) ── */}
        <g id={`${mascotId}-body-group`}>

          {/* Roof (triangle) */}
          <polygon points="100,10 185,80 15,80" fill="#1a1a1a" stroke="#111" strokeWidth="3" />

          {/* House body (pentagon) */}
          <polygon
            points="15,80 185,80 185,195 145,230 55,230 15,195"
            fill="#3a86ff"
            stroke="#111"
            strokeWidth="3"
          />

          {/* ── Left eye ── */}
          <circle cx="75" cy="135" r="22" fill="white" stroke="#111" strokeWidth="3" />
          <circle cx="75" cy="135" r="13" fill="#1a3aff" />
          {/* Pupil moves with mouse */}
          <circle
            id={pL}
            cx="75"
            cy="135"
            r="6"
            fill="#111"
            style={{ transform: `translate(${eyeOffset.x}px, ${eyeOffset.y}px)` }}
          />
          {/* Shine dot */}
          <circle cx="80" cy="130" r="3" fill="white" opacity={0.9} />

          {/* ── Right eye ── */}
          <circle cx="125" cy="135" r="22" fill="white" stroke="#111" strokeWidth="3" />
          <circle cx="125" cy="135" r="13" fill="#1a3aff" />
          {/* Pupil moves with mouse */}
          <circle
            id={pR}
            cx="125"
            cy="135"
            r="6"
            fill="#111"
            style={{ transform: `translate(${eyeOffset.x}px, ${eyeOffset.y}px)` }}
          />
          {/* Shine dot */}
          <circle cx="130" cy="130" r="3" fill="white" opacity={0.9} />

          {/* ── Blush cheeks ── */}
          <ellipse cx="57"  cy="158" rx="10" ry="6" fill="#ff9eb5" opacity={0.6} />
          <ellipse cx="143" cy="158" rx="10" ry="6" fill="#ff9eb5" opacity={0.6} />

          {/* ── Smile ── */}
          <path d="M 82 168 Q 100 182 118 168" fill="none" stroke="#111" strokeWidth="3.5" strokeLinecap="round" />

          {/* ── Legs (two circles at the bottom) ── */}
          <circle cx="78"  cy="237" r="16" fill="#2563eb" stroke="#111" strokeWidth="3" />
          <circle cx="122" cy="237" r="16" fill="#2563eb" stroke="#111" strokeWidth="3" />

          {/* ── Hands (slide up to cover eyes when password focused) ── */}
          <circle
            id={hL}
            cx="75"
            cy="120"
            r="19"
            fill="#2563eb"
            stroke="#111"
            strokeWidth="4"
            style={{
              transform: coverEyes ? 'translateY(0px) scale(1.05)' : 'translateY(85px)',
              transition: 'transform 0.45s cubic-bezier(0.34,1.56,0.64,1)',
            }}
          />
          <circle
            id={hR}
            cx="125"
            cy="120"
            r="19"
            fill="#2563eb"
            stroke="#111"
            strokeWidth="4"
            style={{
              transform: coverEyes ? 'translateY(0px) scale(1.05)' : 'translateY(85px)',
              transition: 'transform 0.45s cubic-bezier(0.34,1.56,0.64,1)',
            }}
          />
        </g>
      </svg>

      {/* Gradient speech bubble */}
      <p className="mascot-speech-bubble">{speechText}</p>
    </div>
  );
}
