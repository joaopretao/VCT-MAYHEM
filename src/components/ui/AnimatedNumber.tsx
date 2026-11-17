import React, { useEffect, useRef, useState } from 'react';

interface AnimatedNumberProps {
  value: number | null;
  prefix?: string;
  suffix?: string;
  fallback?: string;
  durationMs?: number;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  prefix = '',
  suffix = '',
  fallback = '--',
  durationMs = 360,
}) => {
  const [displayValue, setDisplayValue] = useState<number | null>(value);
  const currentRef = useRef<number>(value ?? 0);

  useEffect(() => {
    if (value === null || Number.isNaN(value)) {
      setDisplayValue(null);
      currentRef.current = 0;
      return;
    }

    const reducedMotion =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reducedMotion || currentRef.current === value) {
      currentRef.current = value;
      setDisplayValue(value);
      return;
    }

    const from = currentRef.current;
    const to = value;
    const startTime = performance.now();
    let rafId = 0;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      const interpolated = Math.round(from + (to - from) * eased);
      currentRef.current = interpolated;
      setDisplayValue(interpolated);

      if (t < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        currentRef.current = to;
        setDisplayValue(to);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [value, durationMs]);

  if (displayValue === null) {
    return <span className="tabular-nums">{fallback}</span>;
  }

  return (
    <span className="tabular-nums">
      {prefix}
      {displayValue}
      {suffix}
    </span>
  );
};
