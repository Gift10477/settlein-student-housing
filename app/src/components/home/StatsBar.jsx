/**
 * StatsBar.jsx — Animated stats strip below the hero
 *
 * 4 stats in a horizontal white card:
 *   Listed Properties · Happy Students · Universities Covered · Satisfaction Rate
 */
import React, { useEffect, useRef, useState } from 'react';

const STATS = [
  { value: 2500, suffix: '+', label: 'Listed Properties' },
  { value: 15000, suffix: '+', label: 'Happy Students' },
  { value: 50, suffix: '+', label: 'Universities Covered' },
  { value: 98, suffix: '%', label: 'Satisfaction Rate' },
];

/** Animates a number from 0 to target over ~1.2s */
function useCountUp(target, duration = 1200, start = false) {
  const [count, setCount] = useState(0);
  const raf = useRef(null);

  useEffect(() => {
    if (!start) return;
    const startTime = performance.now();
    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [start, target, duration]);

  return count;
}

function StatItem({ stat, inView, index }) {
  const count = useCountUp(stat.value, 1200, inView);
  const isLast = index === STATS.length - 1;

  return (
    <div className={`stats-item${isLast ? '' : ' stats-item--divider'}`}>
      <span className="stats-number">
        {count.toLocaleString()}{stat.suffix}
      </span>
      <span className="stats-label">{stat.label}</span>
    </div>
  );
}

export default function StatsBar() {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="stats-bar-wrap" ref={ref}>
      <div className="stats-bar-card">
        {STATS.map((stat, i) => (
          <StatItem key={stat.label} stat={stat} inView={inView} index={i} />
        ))}
      </div>
    </div>
  );
}
