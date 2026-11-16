import React from 'react';

// Clean, static VALORANT broadcast backdrop: single restrained top glow, muted map art & fine tactical lines
export const AppBackground: React.FC = () => (
  <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#0b0e14]">
    {/* Faint desaturated Ascent architectural texture */}
    <div
      className="absolute inset-0 bg-cover bg-center opacity-[0.055] grayscale contrast-125"
      style={{ backgroundImage: 'url(/ascent-splash.png), url(./ascent-splash.png)' }}
    />

    {/* Single restrained static red glow near top */}
    <div
      className="absolute -top-48 left-1/2 -translate-x-1/2 w-[960px] h-[520px] opacity-[0.14]"
      style={{
        background: 'radial-gradient(ellipse at center, #ff4655 0%, rgba(255, 70, 85, 0.25) 40%, transparent 72%)',
      }}
    />

    {/* Subtle VALORANT diagonal structural hairlines */}
    <svg
      className="absolute inset-0 w-full h-full opacity-[0.045]"
      preserveAspectRatio="none"
      viewBox="0 0 1440 900"
    >
      <line x1="-100" y1="900" x2="540" y2="-40" stroke="#ffffff" strokeWidth="1" />
      <line x1="1120" y1="900" x2="1520" y2="280" stroke="#ff4655" strokeWidth="1.5" />
    </svg>

    {/* Clean vignette into #0b0e14 */}
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_20%,transparent_20%,#0b0e14_88%)]" />
  </div>
);
