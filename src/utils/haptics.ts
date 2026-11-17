/**
 * Light tactile vibration helpers for mobile devices that support the Vibration API.
 * Safe no-op on desktop browsers, iOS Safari, and environments with reduced support.
 */
function canVibrate(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    typeof navigator.vibrate === 'function' &&
    !(
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    )
  );
}

export function vibrateLight(): void {
  if (!canVibrate()) return;
  try {
    navigator.vibrate(12);
  } catch {
    // Ignore blocked/unsupported vibration calls
  }
}

export function vibrateBonus(): void {
  if (!canVibrate()) return;
  try {
    navigator.vibrate([14, 24, 18]);
  } catch {
    // Ignore blocked/unsupported vibration calls
  }
}
