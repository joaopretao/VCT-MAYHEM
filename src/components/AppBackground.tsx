import React from 'react';

// Fixed background behind the whole app: drifting radial glows + subtle grid
export const AppBackground: React.FC = () => (
  <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#0b0e14]">
    {/* Red glow (top-left) */}
    <div
      className="absolute -top-36 -left-32 w-[720px] h-[720px] rounded-full blur-3xl opacity-[0.34] animate-drift"
      style={{ background: 'radial-gradient(circle, #ff4655 0%, rgba(255,70,85,0.25) 38%, transparent 70%)' }}
    />
    {/* Gold glow (middle-right) */}
    <div
      className="absolute top-[18%] -right-36 w-[660px] h-[660px] rounded-full blur-3xl opacity-[0.26] animate-drift"
      style={{
        background: 'radial-gradient(circle, #e2b714 0%, rgba(226,183,20,0.2) 38%, transparent 70%)',
        animationDelay: '-9s',
      }}
    />
    {/* Cyan glow (bottom-left/center) */}
    <div
      className="absolute -bottom-44 left-[15%] w-[760px] h-[760px] rounded-full blur-3xl opacity-[0.28] animate-drift"
      style={{
        background: 'radial-gradient(circle, #38bdf8 0%, rgba(56,189,248,0.22) 38%, transparent 70%)',
        animationDelay: '-16s',
      }}
    />
    {/* Subtle secondary red/purple accent in center */}
    <div
      className="absolute top-[45%] left-[42%] w-[520px] h-[520px] rounded-full blur-3xl opacity-[0.16] animate-drift"
      style={{
        background: 'radial-gradient(circle, #a855f7 0%, rgba(255,70,85,0.15) 45%, transparent 70%)',
        animationDelay: '-5s',
      }}
    />
    {/* Subtle tactical grid */}
    <div className="absolute inset-0 app-bg-grid" />
    {/* Soft vignette */}
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(6,9,15,0.65)_100%)]" />
  </div>
);
