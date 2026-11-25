import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

const COLORS = ['#ff4655', '#e2b714', '#ffffff'];

interface ConfettiProps {
  /** Fires a burst every time this becomes true */
  fire: boolean;
  pieces?: number;
  duration?: number;
}

// Pure-CSS confetti burst rendered in a portal so it always covers the viewport
export const Confetti: React.FC<ConfettiProps> = ({ fire, pieces = 90, duration = 4200 }) => {
  const [burst, setBurst] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!fire) {
      setVisible(false);
      return;
    }
    setBurst(b => b + 1);
    setVisible(true);
    const t = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(t);
  }, [fire, duration]);

  const items = useMemo(
    () =>
      Array.from({ length: pieces }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.7,
        dur: 2.3 + Math.random() * 1.6,
        dx: (Math.random() - 0.5) * 260,
        rot: Math.random() * 720 - 360,
        color: COLORS[i % COLORS.length],
        w: 6 + Math.random() * 6,
        h: 8 + Math.random() * 10,
        round: Math.random() < 0.3,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [burst, pieces]
  );

  if (!visible || typeof document === 'undefined') return null;

  return createPortal(
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[70] overflow-hidden">
      {items.map(p => {
        const style = {
          left: `${p.left}%`,
          width: p.w,
          height: p.h,
          background: p.color,
          borderRadius: p.round ? '9999px' : '2px',
          '--delay': `${p.delay}s`,
          '--dur': `${p.dur}s`,
          '--dx': `${p.dx}px`,
          '--rot': `${p.rot}deg`,
        } as unknown as React.CSSProperties;
        return <span key={`${burst}-${p.id}`} className="confetti-piece" style={style} />;
      })}
    </div>,
    document.body
  );
};
