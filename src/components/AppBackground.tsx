import React from 'react';

// Clean editorial backdrop with subtle VCT Mayhem monochrome watermark
export const AppBackground: React.FC = () => (
  <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#0b0e14]">
    <div
      className="absolute inset-0 bg-cover bg-center opacity-[0.04] grayscale contrast-125"
      style={{ backgroundImage: 'url(/ascent-splash.png), url(./ascent-splash.png)' }}
    />
    <img
      src="/brand/mark.png"
      alt=""
      className="hidden lg:block absolute -right-24 -bottom-24 w-[480px] h-auto opacity-[0.025] grayscale select-none"
    />
    <img
      src="/brand/logo-mono.png"
      alt=""
      className="hidden sm:block fixed bottom-3 right-4 w-24 h-auto opacity-[0.14] select-none"
    />
    <div className="absolute inset-0 bg-gradient-to-b from-[#0b0e14]/70 via-[#0b0e14]/88 to-[#0b0e14]" />
  </div>
);
