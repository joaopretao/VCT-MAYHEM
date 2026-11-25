import React from 'react';

// Clean, understated editorial backdrop without generic SVG lines or neon radial blobs
export const AppBackground: React.FC = () => (
  <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#0b0e14]">
    <div
      className="absolute inset-0 bg-cover bg-center opacity-[0.04] grayscale contrast-125"
      style={{ backgroundImage: 'url(/ascent-splash.png), url(./ascent-splash.png)' }}
    />
    <div className="absolute inset-0 bg-gradient-to-b from-[#0b0e14]/70 via-[#0b0e14]/88 to-[#0b0e14]" />
  </div>
);
